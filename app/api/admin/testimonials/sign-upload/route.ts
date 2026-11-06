import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { signTestimonialUpload } from "@/lib/cloudinary";

export async function POST(request: Request) {
  await requireAdminAccess();
  try {
    const { resourceType } = await request.json();
    if (resourceType !== "image" && resourceType !== "video") {
      return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });
    }
    return NextResponse.json(signTestimonialUpload(resourceType), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Could not prepare upload. Please try again." }, { status: 500 });
  }
}
