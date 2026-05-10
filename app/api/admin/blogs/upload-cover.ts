import { uploadMediaToCloudinary } from "@/lib/cloudinary";

const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function uploadCoverImage(file: File | null) {
  if (!file || file.size === 0) {
    return "";
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Cover image must be a PNG, JPG, WEBP, or GIF.");
  }

  if (file.size > MAX_COVER_IMAGE_BYTES) {
    throw new Error("Cover image must be 5MB or smaller.");
  }

  return uploadMediaToCloudinary(file, {
    folder: "lumivale/blogs",
    resourceType: "image",
  });
}
