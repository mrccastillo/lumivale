// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
import { POST as create } from "@/app/api/admin/case-studies/route";
import { POST as edit } from "@/app/api/admin/case-studies/[slug]/route";
import { POST as upload } from "@/app/api/admin/case-studies/upload-image/route";
import {
  getAdminCaseStudyBySlug,
  getPublishedCaseStudies,
  getPublishedCaseStudyBySlug,
} from "@/lib/case-studies";
import { getMongoDb } from "@/lib/mongodb";
import { fullStory } from "./fixtures/case-study-story";
vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: vi.fn(async () => ({ adminId: "test" })),
}));
vi.mock("@/lib/mongodb", () => ({ getMongoDb: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/cloudinary", () => ({
  uploadMediaToCloudinary: vi.fn(
    async () => "https://res.cloudinary.com/demo/image/upload/proof.png",
  ),
}));
afterEach(() => vi.unstubAllEnvs());

test("complete story create/upload/publish/edit/unpublish/reopen lifecycle uses real routes and repository", async () => {
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
  const records: Record<string, unknown>[] = [];
  const createIndex = vi.fn(async () => "case_study_slug_unique");
  const db = {
    collection: () => ({
      createIndex,
      aggregate: () => ({ toArray: async () => [] }),
      findOne: async (query: Record<string, unknown>) =>
        records.find((record) => record.slug === query.slug) ?? null,
      insertOne: async (record: Record<string, unknown>) => {
        records.push(record);
        return { insertedId: record._id };
      },
      find: () => ({ sort: () => ({ toArray: async () => records }) }),
      findOneAndUpdate: async (
        query: Record<string, unknown>,
        update: { $set: Record<string, unknown> },
      ) => {
        const record = records.find((item) => item.slug === query.slug)!;
        Object.assign(record, update.$set);
        return record;
      },
    }),
  };
  vi.mocked(getMongoDb).mockResolvedValue(db as never);
  const draft = { ...fullStory(), status: "draft" as const };
  const request = (input: unknown) =>
    new Request("http://localhost/api/admin/case-studies", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost",
      },
      body: JSON.stringify(input),
    });
  expect((await create(request(draft))).status).toBe(200);
  expect(await getPublishedCaseStudyBySlug(db, draft.slug)).toBeNull();
  const form = new FormData();
  form.set(
    "image",
    new File([new Uint8Array([255, 216, 255])], "proof.jpg", {
      type: "image/jpeg",
    }),
  );
  const uploaded = await upload(
    new Request("http://localhost/api/admin/case-studies/upload-image", {
      method: "POST",
      body: form,
    }),
  );
  expect(uploaded.status).toBe(200);
  const published = {
    ...draft,
    status: "published",
    cover: { ...(await uploaded.json()), alt: "Campaign report" },
  };
  const params = { params: Promise.resolve({ slug: draft.slug }) };
  expect((await edit(request(published), params)).status).toBe(200);
  expect(
    (await getPublishedCaseStudyBySlug(db, draft.slug))?.sections,
  ).toHaveLength(7);
  expect(
    (await getPublishedCaseStudies(db)).some(
      (story) => story.slug === draft.slug,
    ),
  ).toBe(true);
  expect(
    (await edit(request({ ...published, headline: "Updated outcome" }), params))
      .status,
  ).toBe(200);
  expect((await getPublishedCaseStudyBySlug(db, draft.slug))?.headline).toBe(
    "Updated outcome",
  );
  const unpublish = new FormData();
  unpublish.set("action", "draft");
  expect(
    (
      await edit(
        new Request("http://localhost/api/admin/case-studies/new-story", {
          method: "POST",
          body: unpublish,
        }),
        params,
      )
    ).status,
  ).toBe(303);
  expect(await getPublishedCaseStudyBySlug(db, draft.slug)).toBeNull();
  const reopened = await getAdminCaseStudyBySlug(db, draft.slug);
  expect(reopened?.sections).toHaveLength(7);
  expect(reopened?.status).toBe("draft");
  expect(reopened?.cover?.alt).toBe("Campaign report");
  expect(createIndex).toHaveBeenCalledExactlyOnceWith(
    { slug: 1 },
    { unique: true, name: "case_study_slug_unique" },
  );
  vi.unstubAllEnvs();
});
