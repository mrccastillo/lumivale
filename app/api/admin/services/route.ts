import { NextResponse } from "next/server";

import { applyServiceExampleImageUploads } from "@/app/api/admin/services/upload-example-image";
import { applyServiceExampleVideoUploads } from "@/app/api/admin/services/upload-example-video";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { createService, parseServiceFormData } from "@/lib/services";

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

  return `/admin/services?${params.toString()}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Could not create service.";
}

export async function POST(request: Request) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const formData = await request.formData();

  try {
    const inputWithImages = await applyServiceExampleImageUploads(
      formData,
      parseServiceFormData(formData),
    );
    const input = await applyServiceExampleVideoUploads(formData, inputWithImages);
    const service = await createService(db, input);

    return redirectTo(`/admin/services/${service.slug}/edit`);
  } catch (error) {
    return redirectTo(buildCreateErrorHref(getErrorMessage(error)));
  }
}
