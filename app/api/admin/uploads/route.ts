import { NextResponse } from "next/server";

import { uploadCoverImage } from "@/app/api/admin/blogs/upload-cover";
import { requireAdminAccess } from "@/lib/admin-auth";

export async function POST(request: Request) {
  await requireAdminAccess();
  const formData = await request.formData();
  const imageUrl = await uploadCoverImage(formData.get("file") as File | null);

  return NextResponse.json({ imageUrl });
}
