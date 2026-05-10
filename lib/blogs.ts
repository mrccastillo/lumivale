import { ObjectId, type Filter } from "mongodb";

export type BlogPostStatus = "draft" | "published";

export type BlogPost = {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  readTime: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: BlogPostStatus;
  coverImageUrl: string;
  coverAlt: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BlogPostInput = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  readTime: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: BlogPostStatus;
  coverImageUrl: string;
  coverAlt: string;
};

type BlogPostDocument = Omit<BlogPost, "id"> & {
  _id: ObjectId | string;
};

type BlogCollection = {
  deleteOne(query: Filter<BlogPostDocument> | Record<string, unknown>): Promise<{
    deletedCount?: number;
  }>;
  find(query?: Filter<BlogPostDocument> | Record<string, unknown>): {
    sort(sortSpec: Record<string, 1 | -1>): {
      toArray(): Promise<BlogPostDocument[]>;
    };
  };
  findOne(query: Filter<BlogPostDocument> | Record<string, unknown>): Promise<BlogPostDocument | null>;
  findOneAndUpdate(
    query: Filter<BlogPostDocument> | Record<string, unknown>,
    update: { $set: Partial<BlogPostDocument> },
    options: { returnDocument: "after" },
  ): Promise<BlogPostDocument | null>;
  insertOne(document: BlogPostDocument): Promise<{ insertedId: unknown }>;
};

type BlogDb = {
  collection: (name: string) => unknown;
} | string;

const COLLECTION = "blogPosts";

function collection(db: BlogDb) {
  if (typeof db === "string") {
    throw new Error("A MongoDB database instance is required.");
  }

  return db.collection(COLLECTION) as BlogCollection;
}

function normalizeSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeInput(input: BlogPostInput): BlogPostInput {
  return {
    ...input,
    body: input.body.trim(),
    category: input.category.trim(),
    coverAlt: input.coverAlt.trim(),
    coverImageUrl: input.coverImageUrl.trim(),
    excerpt: input.excerpt.trim(),
    readTime: input.readTime.trim(),
    seoDescription: input.seoDescription.trim(),
    seoTitle: input.seoTitle.trim(),
    slug: normalizeSlug(input.slug || input.title),
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
    title: input.title.trim(),
  };
}

function toBlogPost(document: BlogPostDocument): BlogPost {
  return {
    ...document,
    id: String(document._id),
  };
}

function idFilter(id: string): Filter<BlogPostDocument> {
  return ObjectId.isValid(id)
    ? ({ _id: new ObjectId(id) } as Filter<BlogPostDocument>)
    : ({ _id: id } as Filter<BlogPostDocument>);
}

export function parseBlogFormData(formData: FormData): BlogPostInput {
  return normalizeInput({
    body: String(formData.get("body") ?? ""),
    category: String(formData.get("category") ?? ""),
    coverAlt: String(formData.get("coverAlt") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    readTime: String(formData.get("readTime") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    status: formData.get("status") === "published" ? "published" : "draft",
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    title: String(formData.get("title") ?? ""),
  });
}

export async function getAdminBlogPosts(db: BlogDb) {
  const posts = await collection(db).find({}).sort({ createdAt: -1 }).toArray();

  return posts.map(toBlogPost);
}

export async function getPublicBlogPosts(db: BlogDb) {
  const posts = await collection(db)
    .find({ status: "published" })
    .sort({ createdAt: -1 })
    .toArray();

  return posts.map(toBlogPost);
}

export async function getBlogPostById(db: BlogDb, id: string) {
  const post = await collection(db).findOne(idFilter(id));

  return post ? toBlogPost(post) : null;
}

export async function getPublicBlogPostBySlug(db: BlogDb, slug: string) {
  const post = await collection(db).findOne({
    slug: normalizeSlug(slug),
    status: "published",
  });

  return post ? toBlogPost(post) : null;
}

export async function createBlogPost(db: BlogDb, input: BlogPostInput) {
  const normalized = normalizeInput(input);

  if (!normalized.title || !normalized.slug || !normalized.body) {
    throw new Error("Title, slug, and body are required.");
  }

  const existing = await collection(db).findOne({ slug: normalized.slug });

  if (existing) {
    throw new Error("A blog post with this slug already exists.");
  }

  const now = new Date();
  const result = await collection(db).insertOne({
    ...normalized,
    createdAt: now,
    updatedAt: now,
  } as BlogPostDocument);

  return {
    ...normalized,
    createdAt: now,
    id: String(result.insertedId),
    updatedAt: now,
  };
}

export async function updateBlogPost(
  db: BlogDb,
  id: string,
  updates: Partial<BlogPostInput>,
) {
  const current = await getBlogPostById(db, id);

  if (!current) {
    throw new Error("Blog post not found.");
  }

  const next = normalizeInput({
    body: updates.body ?? current.body,
    category: updates.category ?? current.category,
    coverAlt: updates.coverAlt ?? current.coverAlt,
    coverImageUrl: updates.coverImageUrl ?? current.coverImageUrl,
    excerpt: updates.excerpt ?? current.excerpt,
    readTime: updates.readTime ?? current.readTime,
    seoDescription: updates.seoDescription ?? current.seoDescription,
    seoTitle: updates.seoTitle ?? current.seoTitle,
    slug: updates.slug ?? current.slug,
    status: updates.status ?? current.status,
    tags: updates.tags ?? current.tags,
    title: updates.title ?? current.title,
  });

  if (next.slug !== current.slug) {
    const existing = await collection(db).findOne({ slug: next.slug });

    if (existing && String(existing._id) !== id) {
      throw new Error("A blog post with this slug already exists.");
    }
  }

  const updated = await collection(db).findOneAndUpdate(
    idFilter(id),
    { $set: { ...next, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!updated) {
    throw new Error("Blog post not found.");
  }

  return toBlogPost(updated);
}

export async function deleteBlogPost(db: BlogDb, id: string) {
  const result = await collection(db).deleteOne(idFilter(id));

  if (result.deletedCount !== 1) {
    throw new Error("Blog post not found.");
  }
}
