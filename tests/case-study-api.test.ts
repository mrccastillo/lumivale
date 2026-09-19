// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { asStoryInput } from "@/lib/case-study-story";
import { POST as create } from "@/app/api/admin/case-studies/route";
import {
  POST as edit,
  DELETE as remove,
} from "@/app/api/admin/case-studies/[slug]/route";
import { POST as upload } from "@/app/api/admin/case-studies/upload-image/route";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  upload: vi.fn(),
  revalidate: vi.fn(),
  db: vi.fn(),
}));
vi.mock("@/lib/admin-auth", () => ({ requireAdminAccess: mocks.auth }));
vi.mock("@/lib/mongodb", () => ({ getMongoDb: mocks.db }));
vi.mock("@/lib/cloudinary", () => ({ uploadMediaToCloudinary: mocks.upload }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/case-studies", () => ({
  createCaseStudy: mocks.create,
  updateCaseStudy: mocks.update,
  deleteCaseStudy: mocks.remove,
  parseCaseStudyFormData: vi.fn(),
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ adminId: "test" });
  mocks.db.mockResolvedValue({});
  mocks.create.mockImplementation(async (_db, input) => input);
  mocks.update.mockImplementation(async (_db, _slug, input) => input);
  mocks.upload.mockResolvedValue(
    "https://res.cloudinary.com/demo/image/upload/proof.png",
  );
});
afterEach(() => vi.unstubAllEnvs());
const input = () => ({ ...asStoryInput(), slug: "new-story", title: "Story" });
const request = (body: unknown, origin = "http://localhost") =>
  new Request("http://localhost/api/admin/case-studies", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });

test("JSON draft saves return content and invalidate public paths; slug edits invalidate both URLs", async () => {
  const response = await create(request(input()));
  expect(response.status).toBe(200);
  expect((await response.json()).study.status).toBe("draft");
  expect(mocks.revalidate.mock.calls.map((call) => call[0])).toEqual([
    "/",
    "/case-studies",
    "/case-studies/new-story",
  ]);
  mocks.revalidate.mockClear();
  await edit(request(input()), {
    params: Promise.resolve({ slug: "old-story" }),
  });
  expect(mocks.revalidate.mock.calls.map((call) => call[0])).toEqual([
    "/",
    "/case-studies",
    "/case-studies/old-story",
    "/case-studies/new-story",
  ]);
});
test("invalid publish and persistence failure retain saved state and return errors", async () => {
  const invalid = await create(request({ ...input(), status: "published" }));
  expect(invalid.status).toBe(400);
  expect((await invalid.json()).errors.metrics).toBeTruthy();
  expect(mocks.create).not.toHaveBeenCalled();
  expect(mocks.revalidate).not.toHaveBeenCalled();
  mocks.create.mockRejectedValueOnce(new Error("Save unavailable"));
  expect((await create(request(input()))).status).toBe(400);
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
test("rejects cross-site writes and unauthorized users before data or media access", async () => {
  expect((await create(request(input(), "https://other.example"))).status).toBe(
    403,
  );
  expect(mocks.db).not.toHaveBeenCalled();
  mocks.auth.mockRejectedValue(new Error("Unauthorized"));
  await expect(create(request(input()))).rejects.toThrow("Unauthorized");
  await expect(upload(request(input()))).rejects.toThrow("Unauthorized");
  await expect(
    remove(request(input()), { params: Promise.resolve({ slug: "story" }) }),
  ).rejects.toThrow("Unauthorized");
  expect(mocks.upload).not.toHaveBeenCalled();
  expect(mocks.remove).not.toHaveBeenCalled();
});
test("rejects oversized or malformed JSON before persistence", async () => {
  expect(
    (await create(request({ ...input(), summary: "a".repeat(1024 * 1024) })))
      .status,
  ).toBe(400);
  const malformed = new Request("http://localhost/api/admin/case-studies", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });
  expect((await create(malformed)).status).toBe(400);
  expect(mocks.create).not.toHaveBeenCalled();
});
function uploadRequest(file: File | string) {
  const data = new FormData();
  data.set("image", file);
  return new Request("http://localhost/api/admin/case-studies/upload-image", {
    method: "POST",
    body: data,
  });
}
test.each([
  ["image/png", [137, 80, 78, 71, 13, 10, 26, 10]],
  ["image/jpeg", [255, 216, 255]],
  ["image/webp", [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]],
])("accepts validated %s images", async (type, bytes) => {
  const response = await upload(
    uploadRequest(
      new File([new Uint8Array(bytes as number[])], "proof", {
        type: type as string,
      }),
    ),
  );
  expect(response.status, JSON.stringify(await response.json())).toBe(200);
  expect(mocks.upload).toHaveBeenCalledWith(expect.any(File), {
    folder: "lumivale/case-studies/images",
    resourceType: "image",
  });
});
test("upload errors reject wrong files, mismatched bytes, oversized files, and service failure", async () => {
  for (const file of [
    "not a file",
    new File(["bad"], "x.svg", { type: "image/svg+xml" }),
    new File(["bad"], "fake.png", { type: "image/png" }),
    new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", {
      type: "image/png",
    }),
  ]) {
    expect((await upload(uploadRequest(file))).status).toBe(400);
  }
  expect(mocks.upload).not.toHaveBeenCalled();
  mocks.upload.mockRejectedValueOnce(new Error("Provider unavailable"));
  expect(
    (
      await upload(
        uploadRequest(
          new File([new Uint8Array([255, 216, 255])], "image.jpg", {
            type: "image/jpeg",
          }),
        ),
      )
    ).status,
  ).toBe(400);
});
