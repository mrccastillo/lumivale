import { describe, expect, test } from "vitest";

import { createAdminUser, getAdminUsers } from "@/lib/admin-users";
import { verifyAdminPassword } from "@/lib/admin-auth";

describe("admin users repository", () => {
  test("creates admins with hashed passwords and lists safe account data", async () => {
    const db = createAdminUsersTestDb();

    const created = await createAdminUser(db, {
      email: " Admin@Example.com ",
      password: "correct horse battery staple",
    });

    expect(created).toMatchObject({
      email: "admin@example.com",
    });
    expect(created).not.toHaveProperty("passwordHash");

    const rawAdmin = db.documents[0];

    expect(rawAdmin.passwordHash).not.toContain("correct horse battery staple");
    await expect(
      verifyAdminPassword("correct horse battery staple", String(rawAdmin.passwordHash)),
    ).resolves.toBe(true);
    await expect(getAdminUsers(db)).resolves.toEqual([
      expect.objectContaining({
        email: "admin@example.com",
      }),
    ]);
  });

  test("rejects duplicate admin emails", async () => {
    const db = createAdminUsersTestDb();

    await createAdminUser(db, {
      email: "admin@example.com",
      password: "first-password",
    });

    await expect(
      createAdminUser(db, {
        email: " ADMIN@example.com ",
        password: "second-password",
      }),
    ).rejects.toThrow("An admin with this email already exists.");
  });
});

function createAdminUsersTestDb() {
  const documents: Record<string, unknown>[] = [];

  return {
    documents,
    collection() {
      return {
        async findOne(query: Record<string, unknown>) {
          return documents.find((document) => matches(document, query)) ?? null;
        },
        async insertOne(document: Record<string, unknown>) {
          documents.push({ ...document, _id: `admin-${documents.length + 1}` });
          return { insertedId: documents[documents.length - 1]._id };
        },
        find(query: Record<string, unknown> = {}) {
          const found = documents.filter((document) => matches(document, query));

          return {
            sort() {
              return this;
            },
            async toArray() {
              return [...found].reverse();
            },
          };
        },
      };
    },
  };
}

function matches(document: Record<string, unknown>, query: Record<string, unknown>) {
  return Object.entries(query).every(([key, value]) => document[key] === value);
}
