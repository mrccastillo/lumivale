import { uploadMediaToCloudinary } from "@/lib/cloudinary";

export async function uploadTestimonialImage(file: FormDataEntryValue | null) {
  if (file === null) return "";
  if (typeof file === "string") {
    throw new Error("Please upload a valid testimonial image.");
  }
  if (file.size === 0) return "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Testimonial image must be a JPG, PNG, or WEBP file.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Testimonial image must be 5MB or smaller.");
  }
  return uploadMediaToCloudinary(file, {
    folder: "lumivale/testimonials/images",
    resourceType: "image",
  });
}
