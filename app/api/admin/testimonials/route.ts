import { NextResponse } from "next/server";

import { uploadTestimonialVideo } from "@/app/api/admin/testimonials/upload-video";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { createTestimonial, parseTestimonialFormData } from "@/lib/testimonials";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

export async function POST(request: Request) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const formData = await request.formData();
  const input = parseTestimonialFormData(formData);
  const videoFileId = await uploadTestimonialVideo(
    db,
    formData.get("videoFile") as File | null,
  );
  const testimonial = await createTestimonial(db, {
    ...input,
    videoFileId: videoFileId || input.videoFileId,
  });

  return redirectTo(`/admin/testimonials/${testimonial.id}/edit`);
}
