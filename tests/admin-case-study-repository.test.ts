import { describe, expect, test } from "vitest";

import {
  createCaseStudy,
  deleteCaseStudy,
  getAdminCaseStudies,
  getPublishedCaseStudyBySlug,
  getPublishedCaseStudies,
  updateCaseStudy,
} from "@/lib/case-studies";

describe("admin case study repository", () => {
  test("creates, updates, publishes, and deletes MongoDB case studies", async () => {
    const db = createCaseStudyTestDb();

    const created = await createCaseStudy(db, makeCaseStudyInput());

    expect(created).toMatchObject({
      slug: "new-case-study",
      status: "draft",
      title: "New Case Study",
    });
    await expect(getPublishedCaseStudyBySlug(db, "new-case-study")).resolves.toBeNull();

    const updated = await updateCaseStudy(db, created.slug, {
      slug: "published-case-study",
      status: "published",
      title: "Published Case Study",
    });

    expect(updated).toMatchObject({
      slug: "published-case-study",
      status: "published",
      title: "Published Case Study",
    });
    await expect(getPublishedCaseStudyBySlug(db, "published-case-study")).resolves.toMatchObject({
      slug: "published-case-study",
      status: "published",
    });

    await deleteCaseStudy(db, "published-case-study");

    await expect(getAdminCaseStudies(db)).resolves.toHaveLength(3);
  });

  test("merges seeded case studies with saved overrides", async () => {
    const db = createCaseStudyTestDb();

    await updateCaseStudy(db, "comment-awareness-sprint", {
      status: "draft",
      summary: "Hidden while being revised.",
    });

    const adminStudies = await getAdminCaseStudies(db);

    expect(adminStudies).toHaveLength(3);
    expect(adminStudies.find((study) => study.slug === "comment-awareness-sprint")).toMatchObject({
      isDefault: true,
      status: "draft",
      summary: "Hidden while being revised.",
    });
    expect(await getPublishedCaseStudies(db)).toHaveLength(2);
  });

  test("rejects duplicate slugs and default deletion", async () => {
    const db = createCaseStudyTestDb();

    await createCaseStudy(db, makeCaseStudyInput({ slug: "duplicate-story" }));

    await expect(
      createCaseStudy(db, makeCaseStudyInput({ slug: "duplicate-story" })),
    ).rejects.toThrow("A case study with this slug already exists.");
    await expect(
      createCaseStudy(db, makeCaseStudyInput({ slug: "creator-content-launch" })),
    ).rejects.toThrow("A case study with this slug already exists.");
    await expect(deleteCaseStudy(db, "creator-content-launch")).rejects.toThrow(
      "Default case studies can be unpublished, but not deleted.",
    );
  });
});

function makeCaseStudyInput(
  overrides: Partial<Parameters<typeof createCaseStudy>[1]> = {},
) {
  return {
    slug: "new-case-study",
    title: "New Case Study",
    category: "Awareness",
    headline: "150 qualified conversations",
    summary: "A short summary.",
    challenge: "The client needed more relevant awareness.",
    solution: "Lumivale built a focused conversation plan.",
    outcomes: ["Clearer channel focus"],
    metrics: [{ value: "150", label: "qualified conversations" }],
    sortOrder: 4,
    status: "draft" as const,
    ...overrides,
  };
}

function createCaseStudyTestDb() {
  const documents: Record<string, unknown>[] = [];

  return {
    collection() {
      return {
        async findOne(query: Record<string, unknown>) {
          return documents.find((document) => matchesQuery(document, query)) ?? null;
        },
        async insertOne(document: Record<string, unknown>) {
          documents.push({ ...document, _id: `case-study-${documents.length + 1}` });
          return { insertedId: documents[documents.length - 1]._id };
        },
        find(query: Record<string, unknown> = {}) {
          const found = documents.filter((document) => matchesQuery(document, query));

          return {
            sort(sortSpec: Record<string, 1 | -1>) {
              const [sortKey, direction] = Object.entries(sortSpec)[0] ?? ["sortOrder", 1];

              found.sort((left, right) => {
                const leftValue = left[sortKey] as number;
                const rightValue = right[sortKey] as number;

                return direction === 1 ? leftValue - rightValue : rightValue - leftValue;
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
          options: { returnDocument: "after"; upsert?: boolean },
        ) {
          expect(options.returnDocument).toBe("after");
          const index = documents.findIndex((document) => matchesQuery(document, query));

          if (index === -1) {
            if (!options.upsert) {
              return null;
            }

            const inserted = {
              ...query,
              ...update.$set,
              _id: `case-study-${documents.length + 1}`,
            };
            documents.push(inserted);

            return inserted;
          }

          documents[index] = { ...documents[index], ...update.$set };

          return documents[index];
        },
        async deleteOne(query: Record<string, unknown>) {
          const index = documents.findIndex((document) => matchesQuery(document, query));

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

function matchesQuery(document: Record<string, unknown>, query: Record<string, unknown>) {
  return Object.entries(query).every(([key, value]) => document[key] === value);
}
