import { describe, expect, test } from "vitest";

import {
  createHeroClient,
  deleteHeroClient,
  getHeroClients,
} from "@/lib/hero-clients";

describe("hero clients repository", () => {
  test("creates, lists, and deletes hero clients", async () => {
    const db = createHeroClientsTestDb();

    const created = await createHeroClient(db, {
      clientName: " Northstar ",
      logoUrl: " https://example.com/northstar.svg ",
    });

    await expect(getHeroClients(db)).resolves.toEqual([
      expect.objectContaining({
        clientName: "Northstar",
        logoUrl: "https://example.com/northstar.svg",
      }),
    ]);

    await deleteHeroClient(db, created.id);

    await expect(getHeroClients(db)).resolves.toEqual([]);
  });

  test("requires client name and logo URL", async () => {
    const db = createHeroClientsTestDb();

    await expect(
      createHeroClient(db, {
        clientName: " ",
        logoUrl: "",
      }),
    ).rejects.toThrow("Client name and logo URL are required.");
  });
});

function createHeroClientsTestDb() {
  const documents: Record<string, unknown>[] = [];

  return {
    collection() {
      return {
        async insertOne(document: Record<string, unknown>) {
          documents.push({
            ...document,
            _id: `hero-client-${documents.length + 1}`,
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
