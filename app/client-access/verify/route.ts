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

function invalidLink() {
  return new Response("This pricing access link is invalid or expired. Please ask the team to send a new magic link.", {
    status: 400,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return invalidLink();
  }

  try {
    const payload = readMagicLinkToken(token);

    if (!payload) {
      return invalidLink();
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
    return invalidLink();
  }
}
