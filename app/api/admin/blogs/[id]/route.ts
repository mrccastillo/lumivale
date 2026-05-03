import { NextResponse } from "next/server";

import { uploadCoverImage } from "@/app/api/admin/blogs/upload-cover";
import { requireAdminAccess } from "@/lib/admin-auth";
import { deleteBlogPost, parseBlogFormData, updateBlogPost } from "@/lib/blogs";
import { getMongoDb } from "@/lib/mongodb";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdminAccess();
  const { id } = await params;
  const db = await getMongoDb();
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "save");

  if (action === "delete") {
    await deleteBlogPost(db, id);

    return redirectTo("/admin/blogs");
  }

  if (action === "publish" || action === "draft") {
    await updateBlogPost(db, id, {
      status: action === "publish" ? "published" : "draft",
    });

    return redirectTo("/admin/blogs");
  }

  const input = parseBlogFormData(formData);
  const coverImageId = await uploadCoverImage(db, formData.get("coverImage") as File | null);

  await updateBlogPost(db, id, {
    ...input,
    coverImageId: coverImageId || input.coverImageId,
  });

  return redirectTo(`/admin/blogs/${id}/edit`);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdminAccess();
  const { id } = await params;
  const db = await getMongoDb();

  await deleteBlogPost(db, id);

  return NextResponse.json({ ok: true });
}
