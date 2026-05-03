import { notFound } from "next/navigation";

import { TestimonialForm } from "@/app/admin/testimonials/testimonial-form";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { getTestimonialById } from "@/lib/testimonials";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess();
  const { id } = await params;
  const db = await getMongoDb();
  const testimonial = await getTestimonialById(db, id);

  if (!testimonial) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
            Edit Testimonial
          </h1>
        </div>
      </div>
      <TestimonialForm testimonial={testimonial} />
    </section>
  );
}
