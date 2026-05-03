import { NextResponse } from "next/server";

import { uploadCoverImage } from "@/app/api/admin/blogs/upload-cover";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const formData = await request.formData();
  const imageId = await uploadCoverImage(db, formData.get("file") as File | null);

  return NextResponse.json({ imageId });
}
