import { GridFSBucket, ObjectId, type Db } from "mongodb";

import { type ServiceInput, validateServiceExampleImageFile } from "@/lib/services";

export async function uploadServiceExampleImage(db: Db, file: File | null) {
  const validationError = validateServiceExampleImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  if (!file || file.size === 0) {
    return "";
  }

  const bucket = new GridFSBucket(db, { bucketName: "serviceExampleImages" });
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

export async function applyServiceExampleImageUploads(
  db: Db,
  formData: FormData,
  input: ServiceInput,
) {
  const exampleCards = await Promise.all(
    input.privateContent.exampleCards.map(async (card, index) => {
      const imageFileId = await uploadServiceExampleImage(
        db,
        formData.get(`exampleCardImageFile-${index}`) as File | null,
      );

      return {
        ...card,
        imageFileId: imageFileId || card.imageFileId || "",
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
