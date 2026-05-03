import { GridFSBucket, ObjectId, type Db } from "mongodb";

import { validateTestimonialVideoFile } from "@/lib/testimonials";

export async function uploadTestimonialVideo(db: Db, file: File | null) {
  const validationError = validateTestimonialVideoFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  if (!file || file.size === 0) {
    return "";
  }

  const bucket = new GridFSBucket(db, { bucketName: "testimonialVideos" });
  const videoId = new ObjectId();
  const uploadStream = bucket.openUploadStreamWithId(videoId, file.name, {
    metadata: { contentType: file.type },
  });
  const buffer = Buffer.from(await file.arrayBuffer());

  await new Promise<void>((resolve, reject) => {
    uploadStream.once("error", reject);
    uploadStream.once("finish", resolve);
    uploadStream.end(buffer);
  });

  return videoId.toString();
}
