import { uploadMediaToCloudinary } from "@/lib/cloudinary";
import { validateTestimonialVideoFile } from "@/lib/testimonials";

export async function uploadTestimonialVideo(file: File | null) {
  const validationError = validateTestimonialVideoFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  if (!file || file.size === 0) {
    return "";
  }

  return uploadMediaToCloudinary(file, {
    folder: "lumivale/testimonials",
    resourceType: "video",
  });
}
