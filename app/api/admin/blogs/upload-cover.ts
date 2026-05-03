import { GridFSBucket, ObjectId, type Db } from "mongodb";

const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function uploadCoverImage(db: Db, file: File | null) {
  if (!file || file.size === 0) {
    return "";
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Cover image must be a PNG, JPG, WEBP, or GIF.");
  }

  if (file.size > MAX_COVER_IMAGE_BYTES) {
    throw new Error("Cover image must be 5MB or smaller.");
  }

  const bucket = new GridFSBucket(db, { bucketName: "blogImages" });
  const imageId = new ObjectId();
  const uploadStream = bucket.openUploadStreamWithId(imageId, file.name, {
    metadata: { contentType: file.type },
  });
  const buffer = Buffer.from(await file.arrayBuffer());

  await new Promise<void>((resolve, reject) => {
    uploadStream.once("error", reject);
    uploadStream.once("finish", resolve);
    uploadStream.end(buffer);
  });

  return imageId.toString();
}
