import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { reorderFaqs } from "@/lib/faqs";
import { getMongoDb } from "@/lib/mongodb";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

function parseOrder(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch {
    return value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }
}

function parseRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/admin/faqs")) {
    return "/admin/faqs";
  }

  return value;
}

export async function POST(request: Request) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const formData = await request.formData();
  const orderedIds = parseOrder(formData.get("order"));

  await reorderFaqs(db, orderedIds);

  if (request.headers.get("X-FAQ-Reorder") === "autosave") {
    return NextResponse.json({ ok: true });
  }

  return redirectTo(parseRedirect(formData.get("redirectTo")));
}
