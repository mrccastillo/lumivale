import { notFound } from "next/navigation";

import { CaseStudyForm } from "@/app/admin/case-studies/case-study-form";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getAdminCaseStudyBySlug } from "@/lib/case-studies";
import { getMongoDb } from "@/lib/mongodb";

export default async function EditCaseStudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  await requireAdminAccess();
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const db = await getMongoDb();
  const study = await getAdminCaseStudyBySlug(db, slug);
  const errorMessage = firstValue(resolvedSearchParams?.error).trim();

  if (!study) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
            Edit Case Study
          </h1>
          <p className="mt-3 text-sm text-[var(--lumivale-muted)]">
            {study.slug}
          </p>
        </div>
        <a
          href="/admin/case-studies"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--lumivale-line)] px-5 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[var(--lumivale-accent)]"
        >
          Back to case studies
        </a>
      </div>
      <CaseStudyForm errorMessage={errorMessage} study={study} />
    </section>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
