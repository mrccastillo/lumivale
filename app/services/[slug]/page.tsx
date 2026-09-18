import Link from "next/link";
import { notFound } from "next/navigation";

import { getDefaultServices, getPublishedServiceBySlugForSite, getPublishedServicesForSite } from "@/lib/services";

export async function generateStaticParams() {
  return getDefaultServices().map((service) => ({ slug: service.slug }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, services] = await Promise.all([getPublishedServiceBySlugForSite(slug), getPublishedServicesForSite()]);

  if (!service) {
    notFound();
  }

  return (
    <div className="bg-white text-[var(--lumivale-ink)]">
      <section data-nav-surface="dark" className="bg-[radial-gradient(circle_at_top_left,rgba(20,201,131,0.18),transparent_30%),linear-gradient(180deg,#063322_0%,#031410_52%,#010807_100%)] px-6 pb-16 pt-24 text-white sm:pb-20 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Lumivale Services" className="overflow-x-auto border-b border-white/10 pb-4">
            <div className="flex min-w-max items-center gap-3 text-xs font-medium text-[#c7e7d7]">
              <span className="mr-4 whitespace-nowrap text-[11px] uppercase tracking-[0.22em] text-white/70">Lumivale Services</span>
              {services.map((item) => <Link key={item.slug} href={`/services/${item.slug}`} aria-current={item.slug === service.slug ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 transition focus-visible:outline-2 focus-visible:outline-offset-2 ${item.slug === service.slug ? "bg-[var(--lumivale-accent)] text-[#010807]" : "text-[#c7e7d7] hover:bg-white/10 hover:text-white"}`}>
                {item.title}
              </Link>)}
            </div>
          </nav>
          <div className="mt-10 max-w-3xl">
            <Link href="/#services" className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#d7f0e3]">
              <span aria-hidden="true" className="text-lg leading-none">&lt;</span> Home
            </Link>
            <h1 className="mt-10 break-words text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">{service.title}</h1>
            <p className="mt-7 break-words text-base leading-8 text-[#d7eee1] sm:text-lg">{service.description}</p>
          </div>
        </div>
      </section>
      <section data-nav-surface="light" aria-labelledby="service-faqs-title" className="bg-white">
        <div className="border-y border-[var(--lumivale-line)] px-6 py-5 text-center">
          <h2 id="service-faqs-title" className="text-3xl font-semibold tracking-[0.1em] sm:text-4xl">FAQS</h2>
        </div>
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
          {service.faqs?.length ? <div className="divide-y divide-[var(--lumivale-line)] border-y border-[var(--lumivale-line)]">
            {service.faqs.map((faq) => <details key={faq.id} className="group py-6 sm:py-7">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-5 rounded-sm text-base font-semibold leading-7 transition hover:text-[var(--lumivale-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--lumivale-accent)] sm:text-lg [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 break-words">{faq.question}</span>
                <span aria-hidden="true" className="shrink-0 text-xl text-[var(--lumivale-accent)] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-4xl whitespace-pre-line break-words text-sm leading-7 text-[var(--lumivale-muted)] sm:text-base">{faq.answer}</p>
            </details>)}
          </div> : <p className="text-sm text-[var(--lumivale-muted)]">No FAQs available yet.</p>}
        </div>
      </section>
    </div>
  );
}
