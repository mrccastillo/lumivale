import { uploadMediaToCloudinary } from "@/lib/cloudinary";
import { ReelValidationError } from "@/lib/reels";
export async function uploadReelThumbnail(value: FormDataEntryValue | null) {
  if (!value || typeof value === "string" || value.size === 0) return "";
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(value.type)) throw new ReelValidationError("Choose a JPG, PNG, WEBP or GIF thumbnail.");
  if (value.size > 5 * 1024 * 1024) throw new ReelValidationError("Thumbnail must be 5MB or smaller.");
  return uploadMediaToCloudinary(value, { folder: "lumivale/reels", resourceType: "image" });
}
