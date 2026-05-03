import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { createAdminUser, parseAdminUserFormData } from "@/lib/admin-users";
import { getMongoDb } from "@/lib/mongodb";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

export async function POST(request: Request) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const formData = await request.formData();

  await createAdminUser(db, parseAdminUserFormData(formData));

  return redirectTo("/admin/users");
}
