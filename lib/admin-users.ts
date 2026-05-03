import { ObjectId, type Filter } from "mongodb";

import { hashAdminPassword } from "@/lib/admin-auth";

export type AdminUser = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminUserInput = {
  email: string;
  password: string;
};

type AdminUserDocument = Omit<AdminUser, "id"> & {
  _id: ObjectId | string;
  passwordHash: string;
};

type AdminUsersDb = {
  collection: (name: string) => unknown;
};

const COLLECTION = "adminUsers";

function collection(db: AdminUsersDb) {
  return db.collection(COLLECTION) as {
    find(query?: Record<string, unknown>): {
      sort(sortSpec: Record<string, 1 | -1>): {
        toArray(): Promise<AdminUserDocument[]>;
      };
    };
    findOne(
      query: Filter<AdminUserDocument> | Record<string, unknown>,
    ): Promise<AdminUserDocument | null>;
    insertOne(document: AdminUserDocument): Promise<{ insertedId: unknown }>;
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toAdminUser(document: AdminUserDocument): AdminUser {
  return {
    createdAt: document.createdAt,
    email: document.email,
    id: String(document._id),
    updatedAt: document.updatedAt,
  };
}

function idFilter(id: string): Filter<AdminUserDocument> {
  return ObjectId.isValid(id)
    ? ({ _id: new ObjectId(id) } as Filter<AdminUserDocument>)
    : ({ _id: id } as Filter<AdminUserDocument>);
}

export function parseAdminUserFormData(formData: FormData): AdminUserInput {
  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

export async function getAdminUsers(db: AdminUsersDb) {
  const users = await collection(db).find({}).sort({ createdAt: -1 }).toArray();

  return users.map(toAdminUser);
}

export async function getAdminUserById(db: AdminUsersDb, id: string) {
  const user = await collection(db).findOne(idFilter(id));

  return user ? toAdminUser(user) : null;
}

export async function createAdminUser(db: AdminUsersDb, input: AdminUserInput) {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const existing = await collection(db).findOne({ email });

  if (existing) {
    throw new Error("An admin with this email already exists.");
  }

  const now = new Date();
  const passwordHash = await hashAdminPassword(password);
  const result = await collection(db).insertOne({
    _id: new ObjectId(),
    createdAt: now,
    email,
    passwordHash,
    updatedAt: now,
  });

  return {
    createdAt: now,
    email,
    id: String(result.insertedId),
    updatedAt: now,
  };
}
