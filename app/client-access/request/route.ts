import { NextResponse } from "next/server";

import { getMongoDb } from "@/lib/mongodb";
import { hasTrustedClientApproval } from "@/lib/trusted-clients";
import { sendTrustedClientMagicLink } from "@/lib/trusted-client-email";
import {
  createMagicLinkToken,
  normalizeTrustedClientEmail,
} from "@/lib/trusted-client";

function redirectToClientAccess(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

export async function POST(request: Request) {
  const db = await getMongoDb();
  const formData = await request.formData();
  const email = normalizeTrustedClientEmail(String(formData.get("email") ?? ""));

  if (!email || !(await hasTrustedClientApproval(db, email))) {
    return redirectToClientAccess("/client-access?error=not-approved");
  }

  const token = createMagicLinkToken(email);
  const verifyUrl = new URL("/client-access/verify", request.url);
  verifyUrl.searchParams.set("token", token);

  let result: Awaited<ReturnType<typeof sendTrustedClientMagicLink>>;

  try {
    result = await sendTrustedClientMagicLink({
      email,
      magicLink: verifyUrl.toString(),
    });
  } catch (error) {
    console.error("Unable to send trusted client magic link", error);

    return redirectToClientAccess("/client-access?error=email-failed");
  }

  if (result.mode === "preview") {
    return redirectToClientAccess(
      `/client-access?sent=1&preview=${encodeURIComponent(result.previewUrl)}`,
    );
  }

  return redirectToClientAccess("/client-access?sent=1");
}
