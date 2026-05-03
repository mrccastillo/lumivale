import { describe, expect, test } from "vitest";

import {
  createBlogPost,
  deleteBlogPost,
  getAdminBlogPosts,
  getPublicBlogPostBySlug,
  getPublicBlogPosts,
  updateBlogPost,
} from "@/lib/blogs";

describe("admin blog repository", () => {
  test("creates, updates, publishes, and deletes MongoDB blog posts", async () => {
    const db = createBlogTestDb();

    const created = await createBlogPost(db, {
      title: "Mongo Admin Launch",
      slug: "mongo-admin-launch",
      category: "Admin",
      excerpt: "A short summary",
      body: "# Launch\n\nThis is **markdown**.",
      readTime: "4 min read",
      tags: ["cms", "admin"],
      seoTitle: "Mongo Admin Launch SEO",
      seoDescription: "SEO summary",
      status: "draft",
      coverImageId: "image-1",
      coverAlt: "Dashboard screenshot",
    });

    expect(created).toMatchObject({
      title: "Mongo Admin Launch",
      status: "draft",
      coverImageId: "image-1",
    });
    await expect(getPublicBlogPosts(db)).resolves.toEqual([]);

    const updated = await updateBlogPost(db, created.id, {
      status: "published",
      title: "Published Mongo Admin Launch",
    });

    expect(updated).toMatchObject({
      id: created.id,
      title: "Published Mongo Admin Launch",
      status: "published",
    });
    await expect(getPublicBlogPostBySlug(db, "mongo-admin-launch")).resolves.toMatchObject({
      id: created.id,
      status: "published",
    });
    await expect(getAdminBlogPosts(db)).resolves.toHaveLength(1);

    await deleteBlogPost(db, created.id);

    await expect(getAdminBlogPosts(db)).resolves.toEqual([]);
  });

  test("rejects duplicate slugs", async () => {
    const db = createBlogTestDb();

    await createBlogPost(db, makePostInput({ slug: "duplicate-slug" }));

    await expect(
      createBlogPost(db, makePostInput({ slug: "duplicate-slug" })),
    ).rejects.toThrow("A blog post with this slug already exists.");
  });
});

function makePostInput(overrides: Partial<Parameters<typeof createBlogPost>[1]> = {}) {
  return {
    title: "Post title",
    slug: "post-title",
    category: "Category",
    excerpt: "Excerpt",
    body: "Body",
    readTime: "3 min read",
    tags: [],
    seoTitle: "",
    seoDescription: "",
    status: "draft" as const,
    coverImageId: "",
    coverAlt: "",
    ...overrides,
  };
}

function createBlogTestDb() {
  const documents: Record<string, unknown>[] = [];

  return {
    collection() {
      return {
        async findOne(query: Record<string, unknown>) {
          return documents.find((document) =>
            Object.entries(query).every(([key, value]) => document[key] === value),
          ) ?? null;
        },
        async insertOne(document: Record<string, unknown>) {
          documents.push({ ...document, _id: `post-${documents.length + 1}` });
          return { insertedId: documents[documents.length - 1]._id };
        },
        find(query: Record<string, unknown> = {}) {
          const found = documents.filter((document) =>
            Object.entries(query).every(([key, value]) => document[key] === value),
          );

          return {
            sort() {
              return this;
            },
            async toArray() {
              return [...found].reverse();
            },
          };
        },
        async findOneAndUpdate(
          query: Record<string, unknown>,
          update: { $set: Record<string, unknown> },
          options: { returnDocument: "after" },
        ) {
          expect(options.returnDocument).toBe("after");
          const index = documents.findIndex((document) =>
            Object.entries(query).every(([key, value]) => document[key] === value),
          );

          if (index === -1) {
            return null;
          }

          documents[index] = { ...documents[index], ...update.$set };

          return documents[index];
        },
        async deleteOne(query: Record<string, unknown>) {
          const index = documents.findIndex((document) =>
            Object.entries(query).every(([key, value]) => document[key] === value),
          );

          if (index === -1) {
            return { deletedCount: 0 };
          }

          documents.splice(index, 1);
          return { deletedCount: 1 };
        },
      };
    },
  };
}
