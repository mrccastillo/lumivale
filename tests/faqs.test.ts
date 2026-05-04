import { describe, expect, test } from "vitest";

import {
  createFaq,
  deleteFaq,
  getAdminFaqs,
  getPublishedFaqs,
  updateFaq,
} from "@/lib/faqs";

describe("FAQ repository", () => {
  test("creates, publishes, sorts, updates, and deletes FAQs", async () => {
    const db = createTestDb();

    const draft = await createFaq(db, {
      question: "How soon can Lumivale start?",
      answer: "Most projects can begin after a short discovery call.",
      sortOrder: 2,
      status: "draft",
    });
    const published = await createFaq(db, {
      question: "Can we choose only one channel?",
      answer: "Yes. You can start with one focused growth channel.",
      sortOrder: 1,
      status: "published",
    });

    await expect(getPublishedFaqs(db)).resolves.toEqual([
      expect.objectContaining({ id: published.id, sortOrder: 1 }),
    ]);

    const publishedDraft = await updateFaq(db, draft.id, {
      status: "published",
    });

    await expect(getPublishedFaqs(db)).resolves.toEqual([
      expect.objectContaining({ id: published.id, sortOrder: 1 }),
      expect.objectContaining({ id: publishedDraft.id, sortOrder: 2 }),
    ]);

    await updateFaq(db, published.id, {
      answer: "Yes. Start with one focused growth channel and expand later.",
    });

    await expect(getAdminFaqs(db)).resolves.toContainEqual(
      expect.objectContaining({
        id: published.id,
        answer: "Yes. Start with one focused growth channel and expand later.",
      }),
    );

    await deleteFaq(db, draft.id);

    await expect(getAdminFaqs(db)).resolves.toHaveLength(1);
  });

  test("requires question and answer content", async () => {
    const db = createTestDb();

    await expect(
      createFaq(db, {
        question: " ",
        answer: "",
        sortOrder: 1,
        status: "published",
      }),
    ).rejects.toThrow("Question and answer are required.");
  });
});

function createTestDb() {
  const documents: Record<string, unknown>[] = [];

  return {
    collection() {
      return {
        async findOne(query: Record<string, unknown>) {
          return documents.find((document) => matches(document, query)) ?? null;
        },
        async insertOne(document: Record<string, unknown>) {
          documents.push({ ...document, _id: `faq-${documents.length + 1}` });
          return { insertedId: documents[documents.length - 1]._id };
        },
        find(query: Record<string, unknown> = {}) {
          const found = documents.filter((document) => matches(document, query));

          return {
            sort(sortSpec: Record<string, 1 | -1>) {
              found.sort((left, right) => {
                for (const [key, direction] of Object.entries(sortSpec)) {
                  const leftValue = left[key] as number | Date;
                  const rightValue = right[key] as number | Date;
                  const leftComparable = leftValue instanceof Date ? leftValue.getTime() : leftValue;
                  const rightComparable =
                    rightValue instanceof Date ? rightValue.getTime() : rightValue;

                  if (leftComparable === rightComparable) {
                    continue;
                  }

                  return leftComparable > rightComparable ? direction : -direction;
                }

                return 0;
              });

              return this;
            },
            async toArray() {
              return [...found];
            },
          };
        },
        async findOneAndUpdate(
          query: Record<string, unknown>,
          update: { $set: Record<string, unknown> },
          options: { returnDocument: "after" },
        ) {
          expect(options.returnDocument).toBe("after");
          const index = documents.findIndex((document) => matches(document, query));

          if (index === -1) {
            return null;
          }

          documents[index] = { ...documents[index], ...update.$set };

          return documents[index];
        },
        async deleteOne(query: Record<string, unknown>) {
          const index = documents.findIndex((document) => matches(document, query));

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

function matches(document: Record<string, unknown>, query: Record<string, unknown>) {
  return Object.entries(query).every(([key, value]) => document[key] === value);
}
