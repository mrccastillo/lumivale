import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { checkStoryOrigin, storyApiError } from "@/lib/case-study-api";
import { uploadMediaToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  await requireAdminAccess();
  const rejected = checkStoryOrigin(request);
  if (rejected) return rejected;
  try {
    if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024)
      throw new Error("Image must be 5 MiB or smaller.");
    const data = await request.formData();
    const file = data.get("image");
    if (!(file instanceof File) || !file.size)
      throw new Error("Choose an image file.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      throw new Error("Use a JPG, PNG, or WEBP image.");
    if (file.size > 5 * 1024 * 1024)
      throw new Error("Image must be 5 MiB or smaller.");
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const matches =
      file.type === "image/jpeg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : file.type === "image/png"
          ? [137, 80, 78, 71, 13, 10, 26, 10].every(
              (byte, i) => bytes[i] === byte,
            )
          : String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
            String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    if (!matches)
      throw new Error("The file contents do not match its image format.");
    const url = await uploadMediaToCloudinary(file, {
      folder: "lumivale/case-studies/images",
      resourceType: "image",
    });
    return NextResponse.json({ url });
  } catch (error) {
    return storyApiError(error);
  }
}
