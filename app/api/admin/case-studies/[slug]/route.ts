import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import {
  deleteCaseStudy,
  parseCaseStudyFormData,
  updateCaseStudy,
} from "@/lib/case-studies";
import { getMongoDb } from "@/lib/mongodb";
import {
  checkStoryOrigin,
  readStoryRequest,
  refreshCaseStudies,
  storyApiError,
} from "@/lib/case-study-api";

function redirectTo(path: string) {
  const response = NextResponse.redirect(
    new URL(path, "http://localhost"),
    303,
  );
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
  const rejected = checkStoryOrigin(request);
  if (rejected) return rejected;
  if (request.headers.get("content-type")?.includes("application/json")) {
    try {
      const input = await readStoryRequest(request);
      const study = await updateCaseStudy(await getMongoDb(), slug, input);
      refreshCaseStudies(slug, study.slug);
      return NextResponse.json({ study });
    } catch (error) {
      return storyApiError(error);
    }
  }
  const db = await getMongoDb();
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "save");

  try {
    if (action === "delete") {
      await deleteCaseStudy(db, slug);
      refreshCaseStudies(slug);

      return redirectTo("/admin/case-studies");
    }

    if (action === "publish" || action === "draft") {
      await updateCaseStudy(db, slug, {
        status: action === "publish" ? "published" : "draft",
      });
      refreshCaseStudies(slug);

      return redirectTo("/admin/case-studies");
    }

    const study = await updateCaseStudy(
      db,
      slug,
      parseCaseStudyFormData(formData),
    );
    refreshCaseStudies(slug, study.slug);

    return redirectTo(`/admin/case-studies/${study.slug}/edit`);
  } catch (error) {
    return redirectTo(buildEditErrorHref(slug, getErrorMessage(error)));
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await requireAdminAccess();
  const rejected = checkStoryOrigin(request);
  if (rejected) return rejected;
  const { slug } = await params;
  const db = await getMongoDb();

  await deleteCaseStudy(db, slug);
  refreshCaseStudies(slug);

  return NextResponse.json({ ok: true });
}
