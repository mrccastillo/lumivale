import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { createCaseStudy, parseCaseStudyFormData } from "@/lib/case-studies";
import { getMongoDb } from "@/lib/mongodb";

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

  return `/admin/case-studies?${params.toString()}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Could not create case study.";
}

export async function POST(request: Request) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const formData = await request.formData();

  try {
    const study = await createCaseStudy(db, parseCaseStudyFormData(formData));

    return redirectTo(`/admin/case-studies/${study.slug}/edit`);
  } catch (error) {
    return redirectTo(buildCreateErrorHref(getErrorMessage(error)));
  }
}
