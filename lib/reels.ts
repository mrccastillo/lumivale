import { ObjectId, type Collection } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";

export type ReelInput = { title: string; clientName: string; platform: string; url: string; thumbnailUrl: string; views: string; likes: string; comments: string; sortOrder: number; status: "draft" | "published" };
export type Reel = ReelInput & { id: string };
type ReelDocument = ReelInput & { _id: ObjectId; createdAt: Date; updatedAt: Date };
type ReelDb = { collection(name: string): unknown };
export class ReelValidationError extends Error {}
const collection = (db: ReelDb) => db.collection("reels") as Collection<ReelDocument>;

export function safeReelUrl(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
export function validateReelInput(input: ReelInput): ReelInput {
  const result = { ...input };
  for (const key of ["title", "clientName", "platform", "url", "thumbnailUrl", "views", "likes", "comments"] as const) result[key] = String(input[key] ?? "").trim();
  if (!result.title || !result.clientName || !result.platform) throw new ReelValidationError("Title, client name and platform are required.");
  if ([result.title, result.clientName, result.platform].some(value => value.length > 160)) throw new ReelValidationError("Title, client name and platform must be 160 characters or fewer.");
  if (!safeReelUrl(result.url) || result.url.length > 2048) throw new ReelValidationError("Enter a valid HTTPS link to the original reel.");
  if (result.thumbnailUrl && (!safeReelUrl(result.thumbnailUrl) || new URL(result.thumbnailUrl).hostname !== "res.cloudinary.com")) throw new ReelValidationError("Upload a thumbnail using the image picker.");
  if (result.status !== "draft" && result.status !== "published") throw new ReelValidationError("Choose draft or published.");
  if (result.status === "published" && !result.thumbnailUrl) throw new ReelValidationError("Upload a thumbnail before publishing.");
  if ([result.views, result.likes, result.comments].some(value => value.length > 30)) throw new ReelValidationError("Metric values must be 30 characters or fewer.");
  if (!Number.isSafeInteger(result.sortOrder) || Math.abs(result.sortOrder) > 100000) throw new ReelValidationError("Display order must be a whole number between -100000 and 100000.");
  return result;
}
export function parseReelForm(form: FormData): ReelInput {
  const text = (key: string) => String(form.get(key) ?? "");
  return { title: text("title"), clientName: text("clientName"), platform: text("platform"), url: text("url"), thumbnailUrl: text("thumbnailUrl"), views: text("views"), likes: text("likes"), comments: text("comments"), sortOrder: Number(text("sortOrder") || 0), status: text("status") as ReelInput["status"] };
}
function toReel(doc: ReelDocument): Reel { const { _id, createdAt, updatedAt, ...input } = doc; void createdAt; void updatedAt; return { ...input, id: String(_id) }; }
function idFilter(id: string) { if (!ObjectId.isValid(id)) throw new ReelValidationError("Reel not found."); return { _id: new ObjectId(id) }; }
export async function getReels(db: ReelDb, publishedOnly = false): Promise<Reel[]> {
  return (await collection(db).find(publishedOnly ? { status: "published" } : {}).sort({ sortOrder: 1, createdAt: -1, _id: 1 }).toArray()).map(toReel);
}
export async function createReel(db: ReelDb, input: ReelInput) {
  const normalized = validateReelInput(input); const now = new Date();
  const result = await collection(db).insertOne({ ...normalized, createdAt: now, updatedAt: now } as ReelDocument);
  return { ...normalized, id: String(result.insertedId) };
}
export async function updateReel(db: ReelDb, id: string, input: Partial<ReelInput>) {
  const query = idFilter(id); const current = await collection(db).findOne(query);
  if (!current) throw new ReelValidationError("Reel not found.");
  const next = validateReelInput({ ...toReel(current), ...input });
  const { id: ignored, ...fields } = next as ReelInput & { id?: string }; void ignored;
  await collection(db).updateOne(query, { $set: { ...fields, updatedAt: new Date() } });
}
export async function deleteReel(db: ReelDb, id: string) { await collection(db).deleteOne(idFilter(id)); }
export async function getPublishedReelsForSite(): Promise<Reel[]> {
  try { return (await getReels(await getMongoDb(), true)).filter(reel => safeReelUrl(reel.url) && safeReelUrl(reel.thumbnailUrl)); }
  catch { return []; }
}
