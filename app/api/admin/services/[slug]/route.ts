import { NextResponse } from "next/server";

import { applyServiceExampleImageUploads } from "@/app/api/admin/services/upload-example-image";
import { applyServiceExampleVideoUploads } from "@/app/api/admin/services/upload-example-video";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { deleteService, parseServiceFormData, updateService } from "@/lib/services";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

function buildEditErrorHref(slug: string, message: string) {
  const params = new URLSearchParams({ error: message });

  return `/admin/services/${slug}/edit?${params.toString()}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Could not update service.";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await requireAdminAccess();
  const { slug } = await params;
  const db = await getMongoDb();
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "save");

  try {
    if (action === "delete") {
      await deleteService(db, slug);

      return redirectTo("/admin/services");
    }

    if (action === "publish" || action === "draft") {
      await updateService(db, slug, {
        status: action === "publish" ? "published" : "draft",
      });

      return redirectTo("/admin/services");
    }

    const inputWithImages = await applyServiceExampleImageUploads(
      formData,
      parseServiceFormData(formData),
    );
    const input = await applyServiceExampleVideoUploads(formData, inputWithImages);

    await updateService(db, slug, input);
  } catch (error) {
    return redirectTo(buildEditErrorHref(slug, getErrorMessage(error)));
  }

  return redirectTo(`/admin/services/${slug}/edit`);
}
