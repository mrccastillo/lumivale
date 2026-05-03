import { TestimonialForm } from "@/app/admin/testimonials/testimonial-form";
import { requireAdminAccess } from "@/lib/admin-auth";

export default async function NewTestimonialPage() {
  await requireAdminAccess();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
            Create Testimonial
          </h1>
        </div>
      </div>
      <TestimonialForm />
    </section>
  );
}
