import { ObjectId } from "mongodb";
import { describe, expect, test, vi } from "vitest";
import { createReel, updateReel, deleteReel, getReels, validateReelInput, type ReelInput } from "@/lib/reels";
import { uploadReelThumbnail } from "@/app/api/admin/reels/upload-thumbnail";
vi.mock("@/lib/cloudinary", () => ({ uploadMediaToCloudinary: vi.fn(async () => "https://res.cloudinary.com/demo/image/upload/reel.jpg") }));
export const input: ReelInput = { title: "Creator launch", clientName: "Client", platform: "TikTok", url: "https://www.tiktok.com/@client/video/123", thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/reel.jpg", views: "1.2M", likes: "27K", comments: "200", status: "draft", sortOrder: 1 };
function database() {
  type Doc = Record<string, unknown> & { _id: ObjectId };
  const docs: Doc[] = [];
  const matches = (doc: Doc, query: Record<string, unknown>) => Object.entries(query).every(([key, value]) => String(doc[key]) === String(value));
  return { collection: vi.fn(() => ({
    insertOne: async (document: Record<string, unknown>) => { const _id = new ObjectId(); docs.push({ ...document, _id }); return { insertedId: _id }; },
    find: (query: Record<string, unknown>) => ({ sort: () => ({ toArray: async () => docs.filter(doc => matches(doc, query)).sort((a,b) => Number(a.sortOrder) - Number(b.sortOrder)) }) }),
    findOne: async (query: Record<string, unknown>) => docs.find(doc => matches(doc, query)) || null,
    updateOne: async (query: Record<string, unknown>, update: { $set: Record<string, unknown> }) => Object.assign(docs.find(doc => matches(doc, query))!, update.$set),
    deleteOne: async (query: Record<string, unknown>) => { const index = docs.findIndex(doc => matches(doc, query)); if(index >= 0) docs.splice(index,1); },
  })) };
}
describe("reels repository", () => {
  test("creates drafts, edits, publishes in order, unpublishes and deletes", async () => {
    const db = database(); const first = await createReel(db, input);
    expect(await getReels(db, true)).toEqual([]);
    await updateReel(db, first.id, { status: "published", title: "Updated title" });
    const second = await createReel(db, { ...input, sortOrder: 0, status: "published" });
    expect((await getReels(db, true)).map(reel => reel.id)).toEqual([second.id, first.id]);
    expect((await getReels(db, true))[1].title).toBe("Updated title");
    await updateReel(db, first.id, { status: "draft" });
    await deleteReel(db, second.id);
    expect(await getReels(db, true)).toEqual([]);
    expect(await getReels(db)).toHaveLength(1);
    await expect(updateReel(db, new ObjectId().toString(), { status: "published" })).rejects.toThrow("not found");
  });
  test.each(["https://instagram.com/reel/123", "https://youtube.com/shorts/123", "https://new-social.example/post/123"])("supports arbitrary social platforms: %s", url => {
    expect(validateReelInput({ ...input, url }).url).toBe(url);
  });
  test.each(["javascript:alert(1)", "data:text/html,hi", "http://example.com/reel", "https://user:secret@example.com/reel"])("rejects unsafe source URLs: %s", url => {
    expect(() => validateReelInput({ ...input, url })).toThrow("HTTPS");
  });
  test("requires uploaded thumbnail before publishing and validates order and metrics", () => {
    expect(() => validateReelInput({ ...input, thumbnailUrl: "", status: "published" })).toThrow("thumbnail");
    expect(() => validateReelInput({ ...input, thumbnailUrl: "https://attacker.example/image.jpg" })).toThrow("image picker");
    expect(() => validateReelInput({ ...input, sortOrder: NaN })).toThrow("whole number");
    expect(() => validateReelInput({ ...input, views: "x".repeat(31) })).toThrow("30 characters");
  });
  test("validates thumbnail type and size before upload", async () => {
    await expect(uploadReelThumbnail(new File(["x"], "x.html", { type: "text/html" }))).rejects.toThrow("JPG");
    const large = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" });
    await expect(uploadReelThumbnail(large)).rejects.toThrow("5MB");
    await expect(uploadReelThumbnail(new File(["x"], "ok.jpg", { type: "image/jpeg" }))).resolves.toContain("cloudinary");
  });
});
