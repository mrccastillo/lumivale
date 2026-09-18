import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { hasTrustedClientApproval } from "@/lib/trusted-clients";
import { sendTrustedClientMagicLink } from "@/lib/trusted-client-email";
import { createMagicLinkToken, normalizeTrustedClientEmail } from "@/lib/trusted-client";

export async function POST(request: Request) {
  await requireAdminAccess();
  try {
    const formData = await request.formData();
    const email = normalizeTrustedClientEmail(String(formData.get("email") ?? ""));
    const db = await getMongoDb();
    if (!email || !(await hasTrustedClientApproval(db, email))) {
      return NextResponse.json({ error: "This email is not approved for private pricing access." }, { status: 400 });
    }
    const verifyUrl = new URL("/client-access/verify", request.url);
    verifyUrl.searchParams.set("token", createMagicLinkToken(email));
    const result = await sendTrustedClientMagicLink({ email, magicLink: verifyUrl.toString() });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to send trusted client magic link", error);
    return NextResponse.json({ error: "Could not send the magic link. Please try again." }, { status: 500 });
  }
}
