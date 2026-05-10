import { GridFSBucket, ObjectId, type Db } from "mongodb";

import { type ServiceInput, validateServiceExampleVideoFile } from "@/lib/services";

export async function uploadServiceExampleVideo(db: Db, file: File | null) {
  const validationError = validateServiceExampleVideoFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  if (!file || file.size === 0) {
    return "";
  }

  const bucket = new GridFSBucket(db, { bucketName: "serviceExampleVideos" });
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

export async function applyServiceExampleVideoUploads(
  db: Db,
  formData: FormData,
  input: ServiceInput,
) {
  const exampleCards = await Promise.all(
    input.privateContent.exampleCards.map(async (card, index) => {
      const videoFileId = await uploadServiceExampleVideo(
        db,
        formData.get(`exampleCardVideoFile-${index}`) as File | null,
      );

      return {
        ...card,
        videoFileId: videoFileId || card.videoFileId || "",
      };
    }),
  );

  return {
    ...input,
    privateContent: {
      ...input.privateContent,
      exampleCards,
    },
  };
}
