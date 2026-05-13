import { NextResponse } from "next/server";

import { uploadCoverImage } from "@/app/api/admin/blogs/upload-cover";
import { requireAdminAccess } from "@/lib/admin-auth";
import { createHeroClient, parseHeroClientFormData } from "@/lib/hero-clients";
import { getMongoDb } from "@/lib/mongodb";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

function buildCreateErrorHref(message: string) {
  const params = new URLSearchParams({ error: message });

  return `/admin/hero-clients?${params.toString()}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Could not add hero client.";
}

export async function POST(request: Request) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const formData = await request.formData();

  try {
    const logoUrl = await uploadCoverImage(formData.get("logoFile") as File | null);

    if (logoUrl) {
      formData.set("logoUrl", logoUrl);
    }

    await createHeroClient(db, parseHeroClientFormData(formData));
  } catch (error) {
    return redirectTo(buildCreateErrorHref(getErrorMessage(error)));
  }

  return redirectTo("/admin/hero-clients?status=created");
}
