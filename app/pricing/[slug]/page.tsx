import Link from "next/link";
import { ServiceExamplePlatforms } from "@/components/service-example-platforms";
import { notFound } from "next/navigation";

import {
  getDefaultServices,
  getPublishedServiceBySlugForSite,
  getPublishedServicesForSite,
} from "@/lib/services";
import { hasTrustedClientAccess } from "@/lib/trusted-client";

const privateNavLabel = "Lumivale Services";

export async function generateStaticParams() {
  return getDefaultServices().map((service) => ({ slug: service.slug }));
}

export default async function PrivatePricingServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const hasTrustedAccess = await hasTrustedClientAccess();

  if (!hasTrustedAccess) {
    notFound();
  }

  const { slug } = await params;
  const [service, services] = await Promise.all([
    getPublishedServiceBySlugForSite(slug),
    getPublishedServicesForSite(),
  ]);

  if (!service) {
    notFound();
  }

  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <section
        data-nav-surface="dark"
        className="bg-[radial-gradient(circle_at_top_left,rgba(20,201,131,0.18),transparent_30%),linear-gradient(180deg,#063322_0%,#031410_52%,#010807_100%)] px-6 pb-16 pt-24 text-white sm:pb-20 sm:pt-28"
      >
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label={privateNavLabel}
            className="overflow-x-auto border-b border-white/10 pb-4"
          >
            <div className="flex min-w-max items-center gap-3 text-xs font-medium text-[#c7e7d7]">
              <span className="mr-4 whitespace-nowrap text-[11px] uppercase tracking-[0.22em] text-white/70">
                {privateNavLabel}
              </span>
              {services.map((navService) => {
                const isActive = navService.slug === service.slug;

                return (
                  <Link
                    key={navService.slug}
                    href={`/pricing/${navService.slug}`}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 transition ${
                      isActive
                        ? "bg-[var(--lumivale-accent)] text-[#010807]"
                        : "text-[#c7e7d7] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {navService.title}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.8fr)] lg:items-center lg:gap-12">
            <div className="max-w-2xl">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#d7f0e3]"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  &lt;
                </span>
                Home
              </Link>

              <h1 className="mt-10 max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl">
                {service.title}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#d7eee1] sm:text-lg">
                {service.privateContent.heroDescription}
              </p>

            </div>

            <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.22)]">
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {service.privateContent.pricingLines.map((line) => (
                    <div
                      key={`visual-${line.label}`}
                      className="rounded-xl border border-white/10 bg-white/[0.06] p-4"
                    >
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--lumivale-accent-soft)]">
                        {line.label}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">{line.value}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        data-nav-surface="light"
        className="border-y border-[var(--lumivale-line)] bg-white px-6 py-5 text-center"
      >
        <p className="text-3xl font-semibold tracking-[0.1em] text-[var(--lumivale-ink)] sm:text-4xl">
          EXAMPLES
        </p>
      </section>

      <section className="bg-white px-6 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <ServiceExamplePlatforms content={service.privateContent} />
        </div>
      </section>
    </div>
  );
}
