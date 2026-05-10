import { uploadMediaToCloudinary } from "@/lib/cloudinary";
import { type ServiceInput, validateServiceExampleImageFile } from "@/lib/services";

export async function uploadServiceExampleImage(file: File | null) {
  const validationError = validateServiceExampleImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  if (!file || file.size === 0) {
    return "";
  }

  return uploadMediaToCloudinary(file, {
    folder: "lumivale/services/images",
    resourceType: "image",
  });
}

export async function applyServiceExampleImageUploads(
  formData: FormData,
  input: ServiceInput,
) {
  const exampleCards = await Promise.all(
    input.privateContent.exampleCards.map(async (card, index) => {
      const imageUrl = await uploadServiceExampleImage(
        formData.get(`exampleCardImageFile-${index}`) as File | null,
      );

      return {
        ...card,
        imageUrl: imageUrl || card.imageUrl || "",
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
