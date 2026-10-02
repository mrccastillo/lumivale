import { beforeEach, expect, test, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), db: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), upload: vi.fn() }));
vi.mock("@/lib/admin-auth", () => ({ requireAdminAccess: mocks.auth }));
vi.mock("@/lib/mongodb", () => ({ getMongoDb: mocks.db }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/reels", async original => ({ ...await original<typeof import("@/lib/reels")>(), createReel: mocks.create, updateReel: mocks.update, deleteReel: mocks.remove }));
vi.mock("@/app/api/admin/reels/upload-thumbnail", () => ({ uploadReelThumbnail: mocks.upload }));
import { POST as create } from "@/app/api/admin/reels/route";
import { POST as update } from "@/app/api/admin/reels/[id]/route";
import { ReelValidationError } from "@/lib/reels";
const context = { params: Promise.resolve({ id: "abc" }) };
function request(action = "save") { const form = new FormData(); form.set("action", action); form.set("title", "Test"); form.set("thumbnailUrl", "old"); return new Request("http://localhost/api/admin/reels", { method: "POST", body: form }); }
beforeEach(() => { vi.resetAllMocks(); mocks.db.mockResolvedValue({}); mocks.upload.mockResolvedValue("uploaded"); });
test("protects creation and every mutation before reading data or uploading", async () => {
  mocks.auth.mockRejectedValue(new Error("Unauthorized"));
  await expect(create(request())).rejects.toThrow("Unauthorized");
  for(const action of ["save", "publish", "draft", "delete"]) await expect(update(request(action), context)).rejects.toThrow("Unauthorized");
  expect(mocks.db).not.toHaveBeenCalled(); expect(mocks.upload).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
});
test("creates and replaces thumbnails", async () => {
  expect((await create(request())).status).toBe(201);
  expect(mocks.create).toHaveBeenCalledWith({}, expect.objectContaining({ title: "Test", thumbnailUrl: "uploaded" }));
  expect((await update(request(), context)).status).toBe(200);
  mocks.upload.mockResolvedValue(""); await update(request(), context);
  expect(mocks.update).toHaveBeenLastCalledWith({}, "abc", expect.objectContaining({ thumbnailUrl: "old" }));
});
test("supports publish, draft, deletion and validation errors", async () => {
  await update(request("publish"), context); expect(mocks.update).toHaveBeenLastCalledWith({}, "abc", { status: "published" });
  await update(request("draft"), context); expect(mocks.update).toHaveBeenLastCalledWith({}, "abc", { status: "draft" });
  await update(request("delete"), context); expect(mocks.remove).toHaveBeenCalledWith({}, "abc");
  mocks.update.mockRejectedValue(new ReelValidationError("Upload a thumbnail before publishing."));
  const response = await update(request("publish"), context); expect(response.status).toBe(400); expect(await response.json()).toEqual({ error: "Upload a thumbnail before publishing." });
});
