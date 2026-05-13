import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { deleteHeroClient } from "@/lib/hero-clients";
import { getMongoDb } from "@/lib/mongodb";

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
  const { id } = await params;
  const db = await getMongoDb();

  try {
    await deleteHeroClient(db, id);
  } catch {
    return redirectTo("/admin/hero-clients?error=Could+not+remove+hero+client.");
  }

  return redirectTo("/admin/hero-clients?status=removed");
}
