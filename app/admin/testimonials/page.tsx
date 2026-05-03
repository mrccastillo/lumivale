import Link from "next/link";

import { requireAdminAccess } from "@/lib/admin-auth";
import { getAdminTestimonials } from "@/lib/testimonials";
import { getMongoDb } from "@/lib/mongodb";

export default async function AdminTestimonialsPage() {
  await requireAdminAccess();
  const db = await getMongoDb();
  const testimonials = await getAdminTestimonials(db);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
            Testimonials
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/testimonials/new"
            className="w-fit rounded-full bg-[var(--lumivale-accent)] px-5 py-3 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
          >
            New testimonial
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--lumivale-line)] bg-white">
        {testimonials.length ? (
          testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="grid gap-4 border-b border-[var(--lumivale-line)] p-5 last:border-b-0 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--lumivale-muted)]">
                  {testimonial.type} · {testimonial.status} · sort {testimonial.sortOrder}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[var(--lumivale-ink)]">
                  {testimonial.personName}
                </h2>
                <p className="mt-2 text-sm text-[var(--lumivale-muted)]">
                  {testimonial.personTitle}
                </p>
                <p className="mt-3 text-sm text-[var(--lumivale-ink)]">
                  {testimonial.quote}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/testimonials/${testimonial.id}/edit`}
                  className="rounded-full border border-[var(--lumivale-line)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[var(--lumivale-accent)]"
                >
                  Edit
                </Link>
                <form action={`/api/admin/testimonials/${testimonial.id}`} method="post">
                  <input
                    type="hidden"
                    name="action"
                    value={testimonial.status === "published" ? "draft" : "publish"}
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-[var(--lumivale-line)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[var(--lumivale-accent)]"
                  >
                    {testimonial.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <form action={`/api/admin/testimonials/${testimonial.id}`} method="post">
                  <input type="hidden" name="action" value="delete" />
                  <button
                    type="submit"
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <p className="p-6 text-sm text-[var(--lumivale-muted)]">
            No testimonials yet.
          </p>
        )}
      </div>
    </section>
  );
}
