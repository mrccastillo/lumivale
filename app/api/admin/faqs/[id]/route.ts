import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { deleteFaq, parseFaqFormData, updateFaq } from "@/lib/faqs";
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
    await deleteFaq(db, id);

    return redirectTo("/admin/faqs");
  }

  if (action === "publish" || action === "draft") {
    await updateFaq(db, id, {
      status: action === "publish" ? "published" : "draft",
    });

    return redirectTo("/admin/faqs");
  }

  const input = parseFaqFormData(formData);

  await updateFaq(db, id, input);

  return redirectTo(`/admin/faqs/${id}/edit`);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdminAccess();
  const { id } = await params;
  const db = await getMongoDb();

  await deleteFaq(db, id);

  return NextResponse.json({ ok: true });
}
