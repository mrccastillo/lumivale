import { ObjectId, type Filter } from "mongodb";

export type FaqStatus = "draft" | "published";

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  status: FaqStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type FaqInput = {
  question: string;
  answer: string;
  sortOrder: number;
  status: FaqStatus;
};

type FaqDocument = Omit<Faq, "id"> & {
  _id: ObjectId | string;
};

type FaqCollection = {
  deleteOne(query: Filter<FaqDocument> | Record<string, unknown>): Promise<{
    deletedCount?: number;
  }>;
  find(query?: Filter<FaqDocument> | Record<string, unknown>): {
    sort(sortSpec: Record<string, 1 | -1>): {
      toArray(): Promise<FaqDocument[]>;
    };
  };
  findOne(query: Filter<FaqDocument> | Record<string, unknown>): Promise<FaqDocument | null>;
  findOneAndUpdate(
    query: Filter<FaqDocument> | Record<string, unknown>,
    update: { $set: Partial<FaqDocument> },
    options: { returnDocument: "after" },
  ): Promise<FaqDocument | null>;
  insertOne(document: FaqDocument): Promise<{ insertedId: unknown }>;
};

type FaqDb = {
  collection: (name: string) => unknown;
};

const COLLECTION = "faqs";

export const defaultFaqs: FaqInput[] = [
  {
    question: "Is this only for startups?",
    answer:
      "No. Lumivale is built for early teams, founders, and lean brands that need practical growth execution without agency overhead.",
    sortOrder: 1,
    status: "published",
  },
  {
    question: "Do you handle the growth channels?",
    answer:
      "Yes. Lumivale supports targeted comments, UGC content, creator collaborations, LinkedIn outreach, and B2B email campaigns.",
    sortOrder: 2,
    status: "published",
  },
  {
    question: "How does pricing work?",
    answer:
      "Packages are flat-rate so you know exactly what you are paying for before the work starts.",
    sortOrder: 3,
    status: "published",
  },
  {
    question: "How soon can Lumivale start?",
    answer:
      "Most projects can begin after a short discovery call, once the channel focus, package, and first priorities are clear.",
    sortOrder: 4,
    status: "published",
  },
  {
    question: "Can we choose only one channel?",
    answer:
      "Yes. You can start with one focused growth channel, then add more support once the activity and results are easier to repeat.",
    sortOrder: 5,
    status: "published",
  },
];

function collection(db: FaqDb) {
  return db.collection(COLLECTION) as FaqCollection;
}

function normalizeInput(input: FaqInput): FaqInput {
  return {
    question: input.question.trim(),
    answer: input.answer.trim(),
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    status: input.status === "published" ? "published" : "draft",
  };
}

function validateInput(input: FaqInput) {
  if (!input.question || !input.answer) {
    throw new Error("Question and answer are required.");
  }
}

function toFaq(document: FaqDocument): Faq {
  return {
    ...document,
    id: String(document._id),
  };
}

function idFilter(id: string): Filter<FaqDocument> {
  return ObjectId.isValid(id)
    ? ({ _id: new ObjectId(id) } as Filter<FaqDocument>)
    : ({ _id: id } as Filter<FaqDocument>);
}

export function parseFaqFormData(formData: FormData): FaqInput {
  return normalizeInput({
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    status: formData.get("status") === "published" ? "published" : "draft",
  });
}

export async function getAdminFaqs(db: FaqDb) {
  const faqs = await collection(db).find({}).sort({ createdAt: -1 }).toArray();

  return faqs.map(toFaq);
}

export async function getPublishedFaqs(db: FaqDb) {
  const faqs = await collection(db)
    .find({ status: "published" })
    .sort({ sortOrder: 1, createdAt: -1 })
    .toArray();

  return faqs.map(toFaq);
}

export async function getFaqById(db: FaqDb, id: string) {
  const faq = await collection(db).findOne(idFilter(id));

  return faq ? toFaq(faq) : null;
}

export async function createFaq(db: FaqDb, input: FaqInput) {
  const normalized = normalizeInput(input);

  validateInput(normalized);

  const now = new Date();
  const result = await collection(db).insertOne({
    ...normalized,
    createdAt: now,
    updatedAt: now,
  } as FaqDocument);

  return {
    ...normalized,
    createdAt: now,
    id: String(result.insertedId),
    updatedAt: now,
  };
}

export async function updateFaq(db: FaqDb, id: string, updates: Partial<FaqInput>) {
  const current = await getFaqById(db, id);

  if (!current) {
    throw new Error("FAQ not found.");
  }

  const next = normalizeInput({
    question: updates.question ?? current.question,
    answer: updates.answer ?? current.answer,
    sortOrder: updates.sortOrder ?? current.sortOrder,
    status: updates.status ?? current.status,
  });

  validateInput(next);

  const updated = await collection(db).findOneAndUpdate(
    idFilter(id),
    { $set: { ...next, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!updated) {
    throw new Error("FAQ not found.");
  }

  return toFaq(updated);
}

export async function deleteFaq(db: FaqDb, id: string) {
  const result = await collection(db).deleteOne(idFilter(id));

  if (result.deletedCount !== 1) {
    throw new Error("FAQ not found.");
  }
}
