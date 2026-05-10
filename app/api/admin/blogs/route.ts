import { NextResponse } from "next/server";

import { uploadCoverImage } from "@/app/api/admin/blogs/upload-cover";
import { requireAdminAccess } from "@/lib/admin-auth";
import { createBlogPost, parseBlogFormData } from "@/lib/blogs";
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
  const input = parseBlogFormData(formData);
  const coverImageUrl = await uploadCoverImage(formData.get("coverImage") as File | null);
  const post = await createBlogPost(db, {
    ...input,
    coverImageUrl: coverImageUrl || input.coverImageUrl,
  });

  return redirectTo(`/admin/blogs/${post.id}/edit`);
}
