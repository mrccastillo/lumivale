import { describe, expect, test } from "vitest";

import {
  createTrustedClient,
  deleteTrustedClient,
  getTrustedClients,
  hasTrustedClientApproval,
} from "@/lib/trusted-clients";

describe("trusted clients repository", () => {
  test("creates normalized trusted clients and lists safe records", async () => {
    const db = createTrustedClientsTestDb();

    const created = await createTrustedClient(db, {
      email: " Client@Example.com ",
    });

    expect(created).toMatchObject({
      email: "client@example.com",
    });
    await expect(getTrustedClients(db)).resolves.toEqual([
      expect.objectContaining({ email: "client@example.com" }),
    ]);
  });

  test("rejects duplicate trusted client emails", async () => {
    const db = createTrustedClientsTestDb();

    await createTrustedClient(db, { email: "client@example.com" });

    await expect(
      createTrustedClient(db, { email: " CLIENT@example.com " }),
    ).rejects.toThrow("A trusted client with this email already exists.");
  });

  test("lists trusted clients in reverse chronological order", async () => {
    const db = createTrustedClientsTestDb();

    await createTrustedClient(db, { email: "first@example.com" });
    await createTrustedClient(db, { email: "second@example.com" });

    await expect(getTrustedClients(db)).resolves.toMatchObject([
      { email: "second@example.com" },
      { email: "first@example.com" },
    ]);
  });

  test("deletes trusted clients by id", async () => {
    const db = createTrustedClientsTestDb();
    const created = await createTrustedClient(db, { email: "client@example.com" });

    await deleteTrustedClient(db, created.id);

    await expect(getTrustedClients(db)).resolves.toEqual([]);
  });

  test("matches approvals using normalized email lookups", async () => {
    const db = createTrustedClientsTestDb();
    await createTrustedClient(db, { email: "client@example.com" });

    await expect(hasTrustedClientApproval(db, " Client@Example.com ")).resolves.toBe(true);
    await expect(hasTrustedClientApproval(db, "other@example.com")).resolves.toBe(false);
  });
});

function createTrustedClientsTestDb() {
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
          documents.push({
            ...document,
            _id: `trusted-client-${documents.length + 1}`,
          });

          return { insertedId: documents[documents.length - 1]?._id };
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
