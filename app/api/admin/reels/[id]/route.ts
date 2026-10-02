import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { deleteReel, updateReel, parseReelForm, ReelValidationError } from "@/lib/reels";
import { uploadReelThumbnail } from "../upload-thumbnail";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdminAccess();
  try {
    const { id } = await params; const db = await getMongoDb(); const form = await request.formData();
    const action = String(form.get("action") || "save");
    if (action === "delete") await deleteReel(db, id);
    else if (action === "publish" || action === "draft") await updateReel(db, id, { status: action === "publish" ? "published" : "draft" });
    else if (action === "save") {
      const input = parseReelForm(form); const thumbnailUrl = await uploadReelThumbnail(form.get("thumbnailFile"));
      await updateReel(db, id, { ...input, thumbnailUrl: thumbnailUrl || input.thumbnailUrl });
    } else throw new ReelValidationError("Unknown reel action.");
    revalidatePath("/"); revalidatePath("/admin/reels");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ReelValidationError ? error.message : "Could not update the reel. Please try again." }, { status: error instanceof ReelValidationError ? 400 : 500 });
  }
}
