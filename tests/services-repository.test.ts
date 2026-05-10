import { describe, expect, test } from "vitest";

import {
  createService,
  getAdminServiceBySlug,
  getAdminServices,
  getDefaultServices,
  getPublishedServiceBySlug,
  getPublishedServices,
  parseServiceFormData,
  updateService,
} from "@/lib/services";

type ServiceDocument = Record<string, unknown>;

function createFakeDb(seed: ServiceDocument[] = []) {
  const documents = [...seed];
  const collection = {
    deleteOne: async (query: ServiceDocument) => {
      const index = documents.findIndex((document) => matches(document, query));

      if (index === -1) {
        return { deletedCount: 0 };
      }

      documents.splice(index, 1);

      return { deletedCount: 1 };
    },
    find: () => ({
      sort: (sortSpec: Record<string, 1 | -1>) => ({
        toArray: async () => sortDocuments(documents, sortSpec),
      }),
    }),
    findOne: async (query: ServiceDocument) =>
      documents.find((document) => matches(document, query)) ?? null,
    findOneAndUpdate: async (
      query: ServiceDocument,
      update: { $set: ServiceDocument },
      options: { upsert?: boolean },
    ) => {
      const index = documents.findIndex((document) => matches(document, query));

      if (index === -1) {
        if (!options.upsert) {
          return null;
        }

        const next = {
          _id: `service-${documents.length + 1}`,
          ...query,
          ...update.$set,
        };

        documents.push(next);

        return next;
      }

      documents[index] = {
        ...documents[index],
        ...update.$set,
      };

      return documents[index];
    },
    insertOne: async (document: ServiceDocument) => {
      documents.push(document);

      return { insertedId: document._id };
    },
  };

  return {
    collection: () => collection,
    documents,
  };
}

function matches(document: ServiceDocument, query: ServiceDocument) {
  return Object.entries(query).every(([key, value]) => String(document[key]) === String(value));
}

function sortDocuments(documents: ServiceDocument[], sortSpec: Record<string, 1 | -1>) {
  const entries = Object.entries(sortSpec);

  return [...documents].sort((left, right) => {
    for (const [field, direction] of entries) {
      const leftValue = left[field];
      const rightValue = right[field];

      if (leftValue < rightValue) {
        return -1 * direction;
      }

      if (leftValue > rightValue) {
        return direction;
      }
    }

    return 0;
  });
}

function buildFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("title", overrides.title ?? "New Service");
  formData.set("summary", overrides.summary ?? "A focused service summary.");
  formData.set("description", overrides.description ?? "A longer service description.");
  formData.set("highlights", overrides.highlights ?? "First highlight\nSecond highlight");
  formData.set("sortOrder", overrides.sortOrder ?? "7");
  formData.set("status", overrides.status ?? "draft");
  formData.set("pricePreview", overrides.pricePreview ?? "$850/mo");
  formData.set("examplePlatform", overrides.examplePlatform ?? "Reddit");
  formData.set("heroDescription", overrides.heroDescription ?? "Private service detail.");
  formData.set("pricingLines", overrides.pricingLines ?? "Monthly rate | $850");
  formData.set(
    "exampleCards",
    overrides.exampleCards ?? "Creator shortlist | Sourcing | Match relevant creators.",
  );
  formData.set("exampleCardTitle-0", "Creator shortlist");
  formData.set("exampleCardTag-0", "Sourcing");
  formData.set("exampleCardSummary-0", "Match relevant creators.");
  formData.set("exampleCardType-0", overrides.exampleCardType ?? "link");
  formData.set("exampleCardPreviewUrl-0", overrides.exampleCardPreviewUrl ?? "https://example.com/demo");
  formData.set("exampleCardImageUrl-0", overrides.exampleCardImageUrl ?? "");
  formData.set("exampleCardImageAlt-0", overrides.exampleCardImageAlt ?? "");
  formData.set(
    "exampleCardVideoDescription-0",
    overrides.exampleCardVideoDescription ?? "",
  );

  return formData;
}

describe("services repository", () => {
  test("returns default services when no overrides exist", async () => {
    const db = createFakeDb();
    const services = await getAdminServices(db);

    expect(services.map((service) => service.title)).toEqual(
      getDefaultServices().map((service) => service.title),
    );
    expect(await getPublishedServices(db)).toHaveLength(getDefaultServices().length);
  });

  test("creates a draft custom service with parsed pricing fields", async () => {
    const db = createFakeDb();
    const input = parseServiceFormData(
      buildFormData({
        exampleCardPreviewUrl: "https://example.com/demo",
        exampleCardVideoDescription: "Optional walkthrough video.",
      }),
    );
    const service = await createService(db, input);

    expect(service.slug).toBe("new-service");
    expect(service.status).toBe("draft");
    expect(service.privateContent.pricingLines).toEqual([
      { label: "Monthly rate", value: "$850" },
    ]);
    expect(service.privateContent.exampleCards[0]).toMatchObject({
      previewUrl: "https://example.com/demo",
      videoDescription: "Optional walkthrough video.",
    });
    expect(db.documents).toHaveLength(1);
  });

  test("saves overrides for a default service and hides draft services from public lookups", async () => {
    const db = createFakeDb();
    const input = parseServiceFormData(
      buildFormData({
        title: "Comment Campaign Plus",
        status: "draft",
        pricePreview: "$950/mo",
      }),
    );

    await updateService(db, "comment-campaign", input);

    const adminService = await getAdminServiceBySlug(db, "comment-campaign");

    expect(adminService?.title).toBe("Comment Campaign Plus");
    expect(adminService?.privateContent.pricePreview).toBe("$950/mo");
    expect(await getPublishedServiceBySlug(db, "comment-campaign")).toBeNull();
  });

  test("generates a unique slug when the title collides with an existing service", async () => {
    const db = createFakeDb();
    const input = parseServiceFormData(buildFormData({ title: "Comment Campaign" }));
    const service = await createService(db, input);

    expect(service.slug).toBe("comment-campaign-2");
  });

  test("rejects malformed delimited admin fields", () => {
    const formData = buildFormData({ pricingLines: "Monthly rate only" });

    expect(() => parseServiceFormData(formData)).toThrow(
      "Pricing lines must use: Label | Value.",
    );
  });

  test("rejects invalid preview links", () => {
    const formData = buildFormData({ exampleCardPreviewUrl: "not-a-url" });

    expect(() => parseServiceFormData(formData)).toThrow(
      "Preview links must be valid URLs.",
    );
  });

  test("requires uploaded photos for photo examples", async () => {
    const db = createFakeDb();
    const input = parseServiceFormData(
      buildFormData({
        exampleCardImageAlt: "Screenshot of a placed comment.",
        exampleCardPreviewUrl: "",
        exampleCardType: "photo",
      }),
    );

    await expect(createService(db, input)).rejects.toThrow(
      "Photo examples require an uploaded photo.",
    );
  });

  test("accepts uploaded photo URLs for photo examples", async () => {
    const db = createFakeDb();
    const input = parseServiceFormData(
      buildFormData({
        exampleCardImageAlt: "Screenshot of a placed comment.",
        exampleCardImageUrl: "https://res.cloudinary.com/demo/image/upload/example.jpg",
        exampleCardPreviewUrl: "",
        exampleCardType: "photo",
      }),
    );

    await expect(createService(db, input)).resolves.toMatchObject({
      privateContent: {
        exampleCards: [
          expect.objectContaining({
            imageUrl: "https://res.cloudinary.com/demo/image/upload/example.jpg",
          }),
        ],
      },
    });
  });
});
