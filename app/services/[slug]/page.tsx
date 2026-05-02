import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllServices, getServiceBySlug } from "@/lib/services";

export async function generateStaticParams() {
  return getAllServices().map((service) => ({ slug: service.slug }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <section className="bg-white px-6 pb-[68px] pt-32">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/#services"
            className="text-sm font-semibold uppercase text-[var(--lumivale-accent)] transition hover:text-[var(--lumivale-ink)]"
          >
            Services
          </Link>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-5xl">
            {service.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--lumivale-muted)] sm:text-lg">
            {service.description}
          </p>
        </div>
      </section>

      <section className="px-6 py-[68px]">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
              Highlights
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              What this service focuses on.
            </h2>
          </div>
          <div className="grid gap-4">
            {service.highlights.map((highlight) => (
              <article
                key={highlight}
                className="rounded-lg border border-[var(--lumivale-line)] bg-white p-6 shadow-[0_20px_60px_rgba(42,47,82,0.06)]"
              >
                <p className="font-semibold">{highlight}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
