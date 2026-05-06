import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { createTrustedClient, parseTrustedClientFormData } from "@/lib/trusted-clients";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

function buildCreateErrorHref(message: string) {
  const params = new URLSearchParams({ error: message });

  return `/admin/trusted-clients?${params.toString()}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Could not create trusted client.";
}

export async function POST(request: Request) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const formData = await request.formData();

  try {
    await createTrustedClient(db, parseTrustedClientFormData(formData));
  } catch (error) {
    return redirectTo(buildCreateErrorHref(getErrorMessage(error)));
  }

  return redirectTo("/admin/trusted-clients?status=created");
}
