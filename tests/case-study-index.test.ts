import { expect, test, vi } from "vitest";
import { prepareCaseStudyIndex } from "@/scripts/case-study-index.mjs";
test("duplicate slug report stops index setup without deleting data", async () => {
  const collection = {
    aggregate: vi.fn(() => ({
      toArray: async () => [{ _id: "duplicate", count: 2 }],
    })),
    createIndex: vi.fn(),
  };
  await expect(prepareCaseStudyIndex(collection)).rejects.toThrow(
    "duplicate (2 records)",
  );
  expect(collection.createIndex).not.toHaveBeenCalled();
});
test("clean collections receive an idempotent unique slug index", async () => {
  const collection = {
    aggregate: vi.fn(() => ({ toArray: async () => [] })),
    createIndex: vi.fn(),
  };
  await prepareCaseStudyIndex(collection);
  expect(collection.createIndex).toHaveBeenCalledWith(
    { slug: 1 },
    { unique: true, name: "case_study_slug_unique" },
  );
});
