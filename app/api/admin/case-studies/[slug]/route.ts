import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import {
  deleteCaseStudy,
  parseCaseStudyFormData,
  updateCaseStudy,
} from "@/lib/case-studies";
import { getMongoDb } from "@/lib/mongodb";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);

  return response;
}

function buildEditErrorHref(slug: string, message: string) {
  const params = new URLSearchParams({ error: message });

  return `/admin/case-studies/${slug}/edit?${params.toString()}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Could not update case study.";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await requireAdminAccess();
  const { slug } = await params;
  const db = await getMongoDb();
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "save");

  try {
    if (action === "delete") {
      await deleteCaseStudy(db, slug);

      return redirectTo("/admin/case-studies");
    }

    if (action === "publish" || action === "draft") {
      await updateCaseStudy(db, slug, {
        status: action === "publish" ? "published" : "draft",
      });

      return redirectTo("/admin/case-studies");
    }

    const study = await updateCaseStudy(db, slug, parseCaseStudyFormData(formData));

    return redirectTo(`/admin/case-studies/${study.slug}/edit`);
  } catch (error) {
    return redirectTo(buildEditErrorHref(slug, getErrorMessage(error)));
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await requireAdminAccess();
  const { slug } = await params;
  const db = await getMongoDb();

  await deleteCaseStudy(db, slug);

  return NextResponse.json({ ok: true });
}
