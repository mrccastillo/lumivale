import { notFound } from "next/navigation";

import { ServiceForm } from "@/app/admin/services/service-form";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { getAdminServiceBySlug } from "@/lib/services";

export default async function EditServicePage({
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
  const service = await getAdminServiceBySlug(db, slug);
  const errorMessage = firstValue(resolvedSearchParams?.error).trim();

  if (!service) {
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
            Edit Service
          </h1>
          <p className="mt-3 text-sm text-[var(--lumivale-muted)]">
            {service.slug}
          </p>
        </div>
        <a
          href="/admin/services"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--lumivale-line)] px-5 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[var(--lumivale-accent)]"
        >
          Back to services
        </a>
      </div>
      <ServiceForm errorMessage={errorMessage} service={service} />
    </section>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
