import { NextResponse } from "next/server";

import { uploadTestimonialVideo } from "@/app/api/admin/testimonials/upload-video";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import {
  deleteTestimonial,
  parseTestimonialFormData,
  updateTestimonial,
} from "@/lib/testimonials";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdminAccess();
  const { id } = await params;
  const db = await getMongoDb();
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "save");

  if (action === "delete") {
    await deleteTestimonial(db, id);

    return redirectTo("/admin/testimonials");
  }

  if (action === "publish" || action === "draft") {
    await updateTestimonial(db, id, {
      status: action === "publish" ? "published" : "draft",
    });

    return redirectTo("/admin/testimonials");
  }

  const input = parseTestimonialFormData(formData);
  const videoUrl = await uploadTestimonialVideo(formData.get("videoFile") as File | null);

  await updateTestimonial(db, id, {
    ...input,
    videoUrl: videoUrl || input.videoUrl,
  });

  return redirectTo(`/admin/testimonials/${id}/edit`);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdminAccess();
  const { id } = await params;
  const db = await getMongoDb();

  await deleteTestimonial(db, id);

  return NextResponse.json({ ok: true });
}
