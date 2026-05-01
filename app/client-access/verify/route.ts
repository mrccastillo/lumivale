import { NextResponse } from "next/server";

import {
  TRUSTED_CLIENT_COOKIE,
  TRUSTED_CLIENT_SESSION_MAX_AGE_SECONDS,
  createTrustedClientSessionToken,
  readMagicLinkToken,
} from "@/lib/trusted-client";

function redirectTo(path: string, status: 307 | 303 = 307) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), status);
  response.headers.set("location", path);

  return response;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return redirectTo("/client-access?error=invalid-link");
  }

  try {
    const payload = readMagicLinkToken(token);

    if (!payload) {
      return redirectTo("/client-access?error=invalid-link");
    }

    const response = redirectTo("/pricing");

    response.cookies.set({
      name: TRUSTED_CLIENT_COOKIE,
      value: createTrustedClientSessionToken(payload.email),
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: TRUSTED_CLIENT_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch {
    return redirectTo("/client-access?error=invalid-link");
  }
}
