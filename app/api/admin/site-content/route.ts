import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { uploadMediaToCloudinary } from "@/lib/cloudinary";
import { getMongoDb } from "@/lib/mongodb";
import { parseSiteContent, saveSiteContent } from "@/lib/site-content";

export async function POST(request: Request) {
  await requireAdminAccess();
  try {
    const formData = await request.formData();
    const content = parseSiteContent(Object.fromEntries(formData));
    const logo = formData.get("logoFile");
    if (logo instanceof File && logo.size > 0) {
      if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(logo.type)) {
        throw new Error("Logo must be a PNG, JPG, WEBP, or GIF.");
      }
      if (logo.size > 5 * 1024 * 1024) throw new Error("Logo must be 5MB or smaller.");
      content.logoUrl = await uploadMediaToCloudinary(logo, { folder: "lumivale/branding", resourceType: "image" });
    }
    for (const index of [1, 2, 3] as const) {
      const portrait = formData.get(`founder${index}File`);
      if (!(portrait instanceof File) || portrait.size === 0) continue;
      if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(portrait.type)) throw new Error("Portrait must be a PNG, JPG, WEBP, or GIF.");
      if (portrait.size > 5 * 1024 * 1024) throw new Error("Portrait must be 5MB or smaller.");
      content[`aboutFounder${index}Image`] = await uploadMediaToCloudinary(portrait, { folder: "lumivale/founders", resourceType: "image" });
    }
    const saved = await saveSiteContent(await getMongoDb(), content);
    revalidatePath("/", "layout");
    return NextResponse.json({ content: saved });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save site content." }, { status: 400 });
  }
}
