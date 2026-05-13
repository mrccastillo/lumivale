import { ObjectId, type Filter } from "mongodb";

export type HeroClient = {
  id: string;
  clientName: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type HeroClientInput = {
  clientName: string;
  logoUrl: string;
};

type HeroClientDocument = Omit<HeroClient, "id"> & {
  _id: ObjectId | string;
};

type HeroClientsDb = {
  collection: (name: string) => unknown;
};

const COLLECTION = "heroClients";

export const defaultHeroClients: HeroClientInput[] = [
  { clientName: "Reddit", logoUrl: "" },
  { clientName: "Quora", logoUrl: "" },
  { clientName: "X", logoUrl: "" },
  { clientName: "TikTok", logoUrl: "" },
  { clientName: "LinkedIn", logoUrl: "" },
];

function collection(db: HeroClientsDb) {
  return db.collection(COLLECTION) as {
    deleteOne(
      query: Filter<HeroClientDocument> | Record<string, unknown>,
    ): Promise<{ deletedCount: number }>;
    find(query?: Record<string, unknown>): {
      sort(sortSpec: Record<string, 1 | -1>): {
        toArray(): Promise<HeroClientDocument[]>;
      };
    };
    insertOne(document: HeroClientDocument): Promise<{ insertedId: unknown }>;
  };
}

function toHeroClient(document: HeroClientDocument): HeroClient {
  return {
    clientName: document.clientName,
    createdAt: document.createdAt,
    id: String(document._id),
    logoUrl: document.logoUrl,
    updatedAt: document.updatedAt,
  };
}

function idFilter(id: string): Filter<HeroClientDocument> {
  return ObjectId.isValid(id)
    ? ({ _id: new ObjectId(id) } as Filter<HeroClientDocument>)
    : ({ _id: id } as Filter<HeroClientDocument>);
}

function normalizeInput(input: HeroClientInput): HeroClientInput {
  return {
    clientName: input.clientName.trim(),
    logoUrl: input.logoUrl.trim(),
  };
}

function validateInput(input: HeroClientInput) {
  if (!input.clientName || !input.logoUrl) {
    throw new Error("Client name and logo URL are required.");
  }
}

export function parseHeroClientFormData(formData: FormData): HeroClientInput {
  return normalizeInput({
    clientName: String(formData.get("clientName") ?? ""),
    logoUrl: String(formData.get("logoUrl") ?? ""),
  });
}

export async function getHeroClients(db: HeroClientsDb) {
  const clients = await collection(db).find({}).sort({ createdAt: -1 }).toArray();

  return clients.map(toHeroClient);
}

export async function createHeroClient(db: HeroClientsDb, input: HeroClientInput) {
  const normalized = normalizeInput(input);

  validateInput(normalized);

  const now = new Date();
  const result = await collection(db).insertOne({
    _id: new ObjectId(),
    ...normalized,
    createdAt: now,
    updatedAt: now,
  });

  return {
    ...normalized,
    createdAt: now,
    id: String(result.insertedId),
    updatedAt: now,
  };
}

export async function deleteHeroClient(db: HeroClientsDb, id: string) {
  const result = await collection(db).deleteOne(idFilter(id));

  if (result.deletedCount === 0) {
    throw new Error("Hero client not found.");
  }
}
