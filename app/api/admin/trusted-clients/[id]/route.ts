import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { deleteTrustedClient } from "@/lib/trusted-clients";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const { id } = await params;

  try {
    await deleteTrustedClient(db, id);
  } catch {
    return redirectTo("/admin/trusted-clients?error=Could+not+remove+trusted+client.");
  }

  return redirectTo("/admin/trusted-clients?status=removed");
}
