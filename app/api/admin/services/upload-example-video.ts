import { uploadMediaToCloudinary } from "@/lib/cloudinary";
import { type ServiceInput, validateServiceExampleVideoFile } from "@/lib/services";

export async function uploadServiceExampleVideo(file: File | null) {
  const validationError = validateServiceExampleVideoFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  if (!file || file.size === 0) {
    return "";
  }

  return uploadMediaToCloudinary(file, {
    folder: "lumivale/services/videos",
    resourceType: "video",
  });
}

export async function applyServiceExampleVideoUploads(
  formData: FormData,
  input: ServiceInput,
) {
  const exampleCards = await Promise.all(
    input.privateContent.exampleCards.map(async (card, index) => {
      const videoUrl = await uploadServiceExampleVideo(
        formData.get(`exampleCardVideoFile-${index}`) as File | null,
      );

      return {
        ...card,
        videoUrl: videoUrl || card.videoUrl || "",
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
