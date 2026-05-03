import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.redirect(new URL("/admin/login", "http://localhost"), 303);
  response.headers.set("location", "/admin/login");
  response.cookies.delete(ADMIN_SESSION_COOKIE);

  return response;
}
