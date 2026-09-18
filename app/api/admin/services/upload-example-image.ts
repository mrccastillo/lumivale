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
      const key = card.uploadKey ?? index;
      const mode = formData.get(`exampleCardPreviewMode-${key}`);
      if (card.exampleType === "link" && mode !== null && mode !== "automatic" && mode !== "cover") {
        throw new Error("Choose Automatic preview or Custom cover photo.");
      }
      if (card.exampleType === "link" && mode === "automatic") {
        return { ...card, imageUrl: "", imageAlt: "" };
      }
      const imageUrl = await uploadServiceExampleImage(
        formData.get(`exampleCardImageFile-${key}`) as File | null,
      );
      if (card.exampleType === "link" && mode === "cover" && !imageUrl && !card.imageUrl) {
        throw new Error("Custom cover photo requires an uploaded image.");
      }

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
