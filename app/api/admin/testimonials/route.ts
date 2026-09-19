import { NextResponse } from "next/server";

import { uploadTestimonialImage } from "@/app/api/admin/testimonials/upload-image";
import { uploadTestimonialVideo } from "@/app/api/admin/testimonials/upload-video";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { createTestimonial, parseTestimonialFormData } from "@/lib/testimonials";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

function buildCreateErrorHref(message: string) {
  const params = new URLSearchParams({
    error: message,
    mode: "create",
  });

  return `/admin/testimonials?${params.toString()}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Could not create testimonial.";
}

export async function POST(request: Request) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const formData = await request.formData();

  try {
    const input = parseTestimonialFormData(formData);
    const imageUrl = await uploadTestimonialImage(formData.get("imageFile"));
    const videoUrl = await uploadTestimonialVideo(formData.get("videoFile") as File | null);

    await createTestimonial(db, {
      ...input,
      imageUrl: imageUrl || (formData.get("removeImage") === "on" ? "" : input.imageUrl),
      videoUrl: videoUrl || input.videoUrl,
    });
  } catch (error) {
    return redirectTo(buildCreateErrorHref(getErrorMessage(error)));
  }

  return redirectTo("/admin/testimonials");
}
