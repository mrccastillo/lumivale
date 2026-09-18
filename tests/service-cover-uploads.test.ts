import { beforeEach, expect, test, vi } from "vitest";
import { getDefaultServices, type ServiceInput } from "@/lib/services";
import { applyServiceExampleImageUploads } from "@/app/api/admin/services/upload-example-image";
import { POST as create } from "@/app/api/admin/services/route";
import { POST as update } from "@/app/api/admin/services/[slug]/route";

const mocks = vi.hoisted(() => ({ upload: vi.fn(), auth: vi.fn(), create: vi.fn(), update: vi.fn(), parse: vi.fn() }));
vi.mock("@/lib/cloudinary", () => ({ uploadMediaToCloudinary: mocks.upload }));
vi.mock("@/lib/admin-auth", () => ({ requireAdminAccess: mocks.auth }));
vi.mock("@/lib/mongodb", () => ({ getMongoDb: vi.fn().mockResolvedValue({}) }));
vi.mock("@/lib/services", async (original) => ({
  ...await original<typeof import("@/lib/services")>(),
  createService: mocks.create, updateService: mocks.update, parseServiceFormData: mocks.parse,
}));

function input(): ServiceInput {
  const service = getDefaultServices()[0];
  return { ...service, privateContent: { ...service.privateContent, exampleCards: [{
    title: "Cover", tag: "Example", summary: "Proof", exampleType: "link",
    previewUrl: "https://example.com/article", imageUrl: "https://example.com/old.png", imageAlt: "Old cover",
  }] } };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ adminId: "admin" });
  mocks.upload.mockResolvedValue("https://example.com/new.png");
  mocks.parse.mockReturnValue(input());
  mocks.create.mockResolvedValue({ slug: "example" });
  mocks.update.mockResolvedValue({ slug: "example" });
});
function data(mode = "cover", file?: File) {
  const form = new FormData();
  form.set("exampleCardPreviewMode-0", mode);
  if (file) form.set("exampleCardImageFile-0", file);
  return form;
}
const request = (form: FormData) => ({ formData: async () => form }) as Request;
const context = { params: Promise.resolve({ slug: "example" }) };

test("preserves a saved cover when no replacement is uploaded", async () => {
  const saved = await applyServiceExampleImageUploads(data(), input());
  expect(saved.privateContent.exampleCards[0].imageUrl).toBe("https://example.com/old.png");
  expect(mocks.upload).not.toHaveBeenCalled();
});
test("automatic mode removes the cover and preserves destination", async () => {
  const saved = await applyServiceExampleImageUploads(data("automatic"), input());
  expect(saved.privateContent.exampleCards[0]).toMatchObject({ imageUrl: "", imageAlt: "", previewUrl: "https://example.com/article" });
});
test("cover mode cannot save without an image", async () => {
  const value = input(); value.privateContent.exampleCards[0].imageUrl = "";
  await expect(applyServiceExampleImageUploads(data(), value)).rejects.toThrow("requires an uploaded image");
});
test.each(["create", "update"])("%s route persists uploaded covers", async (action) => {
  const req = request(data("cover", new File(["photo"], "cover.png", { type: "image/png" })));
  const response = action === "create" ? await create(req) : await update(req, context);
  expect(response.status).toBe(303);
  const call = (action === "create" ? mocks.create : mocks.update).mock.calls[0];
  expect(call.at(-1).privateContent.exampleCards[0].imageUrl).toBe("https://example.com/new.png");
});
test.each([
  new File(["bad"], "cover.svg", { type: "image/svg+xml" }),
  new File([new Uint8Array(5 * 1024 * 1024 + 1)], "cover.png", { type: "image/png" }),
])("rejects invalid files before saving", async (file) => {
  const response = await update(request(data("cover", file)), context);
  expect(response.headers.get("location")).toContain("error=");
  expect(mocks.update).not.toHaveBeenCalled();
  expect(mocks.upload).not.toHaveBeenCalled();
});
test("upload failure leaves saved service unchanged", async () => {
  mocks.upload.mockRejectedValueOnce(new Error("Upload failed"));
  const response = await update(request(data("cover", new File(["photo"], "cover.png", { type: "image/png" }))), context);
  expect(response.headers.get("location")).toContain("Upload+failed");
  expect(mocks.update).not.toHaveBeenCalled();
});
test("unauthorized submissions cannot upload or save", async () => {
  mocks.auth.mockRejectedValueOnce(new Error("unauthorized"));
  await expect(update(request(data()), context)).rejects.toThrow("unauthorized");
  expect(mocks.update).not.toHaveBeenCalled(); expect(mocks.upload).not.toHaveBeenCalled();
});
