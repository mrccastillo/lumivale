import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { createReel, parseReelForm, ReelValidationError } from "@/lib/reels";
import { uploadReelThumbnail } from "./upload-thumbnail";
export async function POST(request: Request) {
  await requireAdminAccess();
  try {
    const form = await request.formData();
    const input = parseReelForm(form);
    const thumbnailUrl = await uploadReelThumbnail(form.get("thumbnailFile"));
    await createReel(await getMongoDb(), { ...input, thumbnailUrl: thumbnailUrl || input.thumbnailUrl });
    revalidatePath("/"); revalidatePath("/admin/reels");
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ReelValidationError ? error.message : "Could not save the reel. Please try again." }, { status: error instanceof ReelValidationError ? 400 : 500 });
  }
}
