import { beforeEach, expect, test, vi } from "vitest";
import { POST as create } from "@/app/api/admin/services/route";
import { POST as update } from "@/app/api/admin/services/[slug]/route";

const mocks = vi.hoisted(() => ({ upload: vi.fn(), auth: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/cloudinary", () => ({ uploadMediaToCloudinary: mocks.upload }));
vi.mock("@/lib/admin-auth", () => ({ requireAdminAccess: mocks.auth }));
vi.mock("@/lib/mongodb", () => ({ getMongoDb: vi.fn().mockResolvedValue({}) }));
vi.mock("@/lib/services", async (original) => ({ ...await original<typeof import("@/lib/services")>(), createService: mocks.create, updateService: mocks.update }));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ adminId: "admin" });
  mocks.upload.mockImplementation(async (file: File) => `https://example.com/${file.name}`);
  mocks.create.mockResolvedValue({ slug: "example" });
  mocks.update.mockResolvedValue({ slug: "example" });
});
function data() {
  const form = new FormData();
  const examples = Array.from({ length: 8 }, (_, i) => ({ id: `card-${i}`, platformId: i % 2 ? "two" : "one", title: `Card ${i}`, tag: "Proof", summary: "Summary", exampleType: i === 7 ? "photo" : "link", previewUrl: "https://example.com", imageUrl: "" }));
  // Reordered groups, a moved example, and a removed preceding card.
  examples[6].platformId = "two";
  examples.splice(2, 1);
  form.set("exampleManifest", JSON.stringify({ platforms: [{ id: "two", name: "YouTube" }, { id: "one", name: "Reddit" }], examples }));
  form.set("exampleCardPreviewMode-card-6", "cover");
  form.set("exampleCardImageFile-card-6", new File(["cover"], "cover.png", { type: "image/png" }));
  form.set("exampleCardImageFile-card-7", new File(["photo"], "photo.png", { type: "image/png" }));
  form.set("exampleCardVideoFile-card-7", new File(["video"], "video.mp4", { type: "video/mp4" }));
  return form;
}
const request = (form: FormData) => ({ formData: async () => form }) as Request;
const context = { params: Promise.resolve({ slug: "example" }) };
test.each(["create", "update"])("%s keeps stable upload associations through reorder, move and removal", async (action) => {
  const response = action === "create" ? await create(request(data())) : await update(request(data()), context);
  expect(response.headers.get("location")).not.toContain("error=");
  const saved = (action === "create" ? mocks.create : mocks.update).mock.calls[0].at(-1).privateContent;
  expect(saved.exampleCards).toHaveLength(7);
  expect(saved.exampleCards.find((card: { id: string }) => card.id === "card-6")).toMatchObject({ platformId: "two", imageUrl: "https://example.com/cover.png" });
  expect(saved.exampleCards.find((card: { id: string }) => card.id === "card-7")).toMatchObject({ imageUrl: "https://example.com/photo.png", videoUrl: "https://example.com/video.mp4" });
});
test("invalid platform references fail before any upload or persistence", async () => {
  const form = data();
  const manifest = JSON.parse(String(form.get("exampleManifest")));
  manifest.examples[0].platformId = "foreign";
  form.set("exampleManifest", JSON.stringify(manifest));
  const response = await create(request(form));
  expect(response.headers.get("location")).toContain("error=");
  expect(mocks.upload).not.toHaveBeenCalled(); expect(mocks.create).not.toHaveBeenCalled();
});
test("failed uploads do not persist", async () => {
  mocks.upload.mockRejectedValue(new Error("Upload failed"));
  const response = await update(request(data()), context);
  expect(response.headers.get("location")).toContain("Upload+failed");
  expect(mocks.update).not.toHaveBeenCalled();
});
test("unauthorized platform edits cannot upload or save", async () => {
  mocks.auth.mockRejectedValue(new Error("unauthorized"));
  await expect(create(request(data()))).rejects.toThrow("unauthorized");
  expect(mocks.upload).not.toHaveBeenCalled(); expect(mocks.create).not.toHaveBeenCalled();
});
