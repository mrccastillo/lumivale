import { ObjectId, type Filter } from "mongodb";

import { normalizeTrustedClientEmail } from "@/lib/trusted-client";

export type TrustedClient = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TrustedClientInput = {
  email: string;
};

type TrustedClientDocument = Omit<TrustedClient, "id"> & {
  _id: ObjectId | string;
};

type TrustedClientsDb = {
  collection: (name: string) => unknown;
};

const COLLECTION = "trustedClients";

function collection(db: TrustedClientsDb) {
  return db.collection(COLLECTION) as {
    find(query?: Record<string, unknown>): {
      sort(sortSpec: Record<string, 1 | -1>): {
        toArray(): Promise<TrustedClientDocument[]>;
      };
    };
    findOne(
      query: Filter<TrustedClientDocument> | Record<string, unknown>,
    ): Promise<TrustedClientDocument | null>;
    insertOne(document: TrustedClientDocument): Promise<{ insertedId: unknown }>;
    deleteOne(
      query: Filter<TrustedClientDocument> | Record<string, unknown>,
    ): Promise<{ deletedCount: number }>;
  };
}

function toTrustedClient(document: TrustedClientDocument): TrustedClient {
  return {
    createdAt: document.createdAt,
    email: document.email,
    id: String(document._id),
    updatedAt: document.updatedAt,
  };
}

function idFilter(id: string): Filter<TrustedClientDocument> {
  return ObjectId.isValid(id)
    ? ({ _id: new ObjectId(id) } as Filter<TrustedClientDocument>)
    : ({ _id: id } as Filter<TrustedClientDocument>);
}

export function parseTrustedClientFormData(formData: FormData): TrustedClientInput {
  return {
    email: String(formData.get("email") ?? ""),
  };
}

export async function getTrustedClients(db: TrustedClientsDb) {
  const clients = await collection(db).find({}).sort({ createdAt: -1 }).toArray();

  return clients.map(toTrustedClient);
}

export async function createTrustedClient(db: TrustedClientsDb, input: TrustedClientInput) {
  const email = normalizeTrustedClientEmail(input.email);

  if (!email) {
    throw new Error("Email is required.");
  }

  const existing = await collection(db).findOne({ email });

  if (existing) {
    throw new Error("A trusted client with this email already exists.");
  }

  const now = new Date();
  const result = await collection(db).insertOne({
    _id: new ObjectId(),
    createdAt: now,
    email,
    updatedAt: now,
  });

  return {
    createdAt: now,
    email,
    id: String(result.insertedId),
    updatedAt: now,
  };
}

export async function deleteTrustedClient(db: TrustedClientsDb, id: string) {
  const result = await collection(db).deleteOne(idFilter(id));

  if (result.deletedCount === 0) {
    throw new Error("Trusted client not found.");
  }
}

export async function hasTrustedClientApproval(db: TrustedClientsDb, email: string) {
  const normalizedEmail = normalizeTrustedClientEmail(email);

  if (!normalizedEmail) {
    return false;
  }

  const trustedClient = await collection(db).findOne({ email: normalizedEmail });

  return Boolean(trustedClient);
}
