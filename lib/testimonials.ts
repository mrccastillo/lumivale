import { ObjectId, type Filter } from "mongodb";

export type TestimonialType = "text" | "video";
export type TestimonialStatus = "draft" | "published";

export type Testimonial = {
  id: string;
  personName: string;
  personTitle: string;
  quote: string;
  sortOrder: number;
  status: TestimonialStatus;
  type: TestimonialType;
  videoUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TestimonialInput = {
  personName: string;
  personTitle: string;
  quote: string;
  sortOrder: number;
  status: TestimonialStatus;
  type: TestimonialType;
  videoUrl: string;
};

type TestimonialDocument = Omit<Testimonial, "id"> & {
  _id: ObjectId | string;
};

type TestimonialCollection = {
  deleteOne(query: Filter<TestimonialDocument> | Record<string, unknown>): Promise<{
    deletedCount?: number;
  }>;
  find(query?: Filter<TestimonialDocument> | Record<string, unknown>): {
    sort(sortSpec: Record<string, 1 | -1>): {
      toArray(): Promise<TestimonialDocument[]>;
    };
  };
  findOne(
    query: Filter<TestimonialDocument> | Record<string, unknown>,
  ): Promise<TestimonialDocument | null>;
  findOneAndUpdate(
    query: Filter<TestimonialDocument> | Record<string, unknown>,
    update: { $set: Partial<TestimonialDocument> },
    options: { returnDocument: "after" },
  ): Promise<TestimonialDocument | null>;
  insertOne(document: TestimonialDocument): Promise<{ insertedId: unknown }>;
};

type TestimonialDb = {
  collection: (name: string) => unknown;
};

const COLLECTION = "testimonials";

export const TESTIMONIAL_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const TESTIMONIAL_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

function collection(db: TestimonialDb) {
  return db.collection(COLLECTION) as TestimonialCollection;
}

function normalizeInput(input: TestimonialInput): TestimonialInput {
  const type: TestimonialType = input.type === "video" ? "video" : "text";

  return {
    personName: input.personName.trim(),
    personTitle: input.personTitle.trim(),
    quote: input.quote.trim(),
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    status: input.status === "published" ? "published" : "draft",
    type,
    videoUrl: type === "video" ? input.videoUrl.trim() : "",
  };
}

function validateInput(input: TestimonialInput) {
  if (!input.personName || !input.quote) {
    throw new Error("Name and quote are required.");
  }

  if (input.type === "video" && !input.videoUrl) {
    throw new Error("Video testimonials require a video file.");
  }
}

function toTestimonial(document: TestimonialDocument): Testimonial {
  return {
    ...document,
    id: String(document._id),
  };
}

function idFilter(id: string): Filter<TestimonialDocument> {
  return ObjectId.isValid(id)
    ? ({ _id: new ObjectId(id) } as Filter<TestimonialDocument>)
    : ({ _id: id } as Filter<TestimonialDocument>);
}

export function validateTestimonialVideoFile(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!TESTIMONIAL_VIDEO_TYPES.has(file.type)) {
    return "Testimonial video must be an MP4, WEBM, or MOV file.";
  }

  if (file.size > TESTIMONIAL_VIDEO_MAX_BYTES) {
    return "Testimonial video must be 50MB or smaller.";
  }

  return null;
}

export function parseTestimonialFormData(formData: FormData): TestimonialInput {
  return normalizeInput({
    personName: String(formData.get("personName") ?? ""),
    personTitle: String(formData.get("personTitle") ?? ""),
    quote: String(formData.get("quote") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    status: formData.get("status") === "published" ? "published" : "draft",
    type: formData.get("type") === "video" ? "video" : "text",
    videoUrl: String(formData.get("videoUrl") ?? ""),
  });
}

export async function getAdminTestimonials(db: TestimonialDb) {
  const testimonials = await collection(db).find({}).sort({ createdAt: -1 }).toArray();

  return testimonials.map(toTestimonial);
}

export async function getPublishedTestimonials(db: TestimonialDb) {
  const testimonials = await collection(db)
    .find({ status: "published" })
    .sort({ sortOrder: 1, createdAt: -1 })
    .toArray();

  return testimonials.map(toTestimonial);
}

export async function getTestimonialById(db: TestimonialDb, id: string) {
  const testimonial = await collection(db).findOne(idFilter(id));

  return testimonial ? toTestimonial(testimonial) : null;
}

export async function createTestimonial(db: TestimonialDb, input: TestimonialInput) {
  const normalized = normalizeInput(input);

  validateInput(normalized);

  const now = new Date();
  const result = await collection(db).insertOne({
    ...normalized,
    createdAt: now,
    updatedAt: now,
  } as TestimonialDocument);

  return {
    ...normalized,
    createdAt: now,
    id: String(result.insertedId),
    updatedAt: now,
  };
}

export async function updateTestimonial(
  db: TestimonialDb,
  id: string,
  updates: Partial<TestimonialInput>,
) {
  const current = await getTestimonialById(db, id);

  if (!current) {
    throw new Error("Testimonial not found.");
  }

  const next = normalizeInput({
    personName: updates.personName ?? current.personName,
    personTitle: updates.personTitle ?? current.personTitle,
    quote: updates.quote ?? current.quote,
    sortOrder: updates.sortOrder ?? current.sortOrder,
    status: updates.status ?? current.status,
    type: updates.type ?? current.type,
    videoUrl: updates.videoUrl ?? current.videoUrl,
  });

  validateInput(next);

  const updated = await collection(db).findOneAndUpdate(
    idFilter(id),
    { $set: { ...next, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!updated) {
    throw new Error("Testimonial not found.");
  }

  return toTestimonial(updated);
}

export async function deleteTestimonial(db: TestimonialDb, id: string) {
  const result = await collection(db).deleteOne(idFilter(id));

  if (result.deletedCount !== 1) {
    throw new Error("Testimonial not found.");
  }
}
