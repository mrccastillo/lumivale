import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const db = await getMongoDb();
  const admin = await db.collection("adminUsers").findOne<{
    _id: unknown;
    email: string;
    passwordHash: string;
  }>({ email });

  if (!admin || !(await verifyAdminPassword(password, admin.passwordHash))) {
    return redirectTo("/admin/login?error=invalid");
  }

  const response = redirectTo("/admin/blogs");

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionToken({
      adminId: String(admin._id),
      email: admin.email,
    }),
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
