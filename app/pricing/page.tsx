import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllServices } from "@/lib/services";
import { hasTrustedClientAccess } from "@/lib/trusted-client";

export default async function PricingPage() {
  const hasTrustedAccess = await hasTrustedClientAccess();

  if (!hasTrustedAccess) {
    notFound();
  }

  const services = getAllServices();

  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-[54px] pt-32">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--lumivale-ink)] sm:text-4xl">
            Pricing
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--lumivale-muted)] sm:text-base">
            Simple monthly pricing for focused growth support across Lumivale&apos;s
            core service channels.
          </p>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-[var(--lumivale-line)] bg-white shadow-[0_18px_48px_rgba(21,28,56,0.06)]">
          <div className="px-5 pb-2 pt-5 sm:px-7 sm:pt-6">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--lumivale-line)] pb-4">
              <div>
                <p className="text-xs font-semibold text-[var(--lumivale-ink)] sm:text-sm">
                  Monthly services
                </p>
                <p className="mt-1 text-xs leading-6 text-[var(--lumivale-muted)] sm:text-sm">
                  Current private monthly rates for approved client discussions.
                </p>
              </div>
              <span className="hidden rounded-md border border-[var(--lumivale-line)] bg-[#fbfcff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-muted)] sm:inline-flex">
                Rates
              </span>
            </div>
          </div>

          <div>
            {services.map((service, index) => (
              <article
                key={service.slug}
                className={[
                  "grid gap-4 px-5 py-5 sm:px-7 sm:py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-8",
                  index < services.length - 1 ? "border-b border-[var(--lumivale-line)]" : "",
                ].join(" ")}
              >
                <div>
                  <h2 className="text-base font-semibold text-[var(--lumivale-ink)] sm:text-lg">
                    {service.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-xs leading-6 text-[var(--lumivale-muted)] sm:text-sm">
                    {service.summary}
                  </p>
                  <Link
                    href={`/pricing/${service.slug}`}
                    className="mt-4 inline-flex rounded-md border border-[var(--lumivale-line)] px-3 py-1.5 text-xs font-semibold text-[var(--lumivale-ink)] transition hover:border-[var(--lumivale-accent)] hover:text-[var(--lumivale-accent)] sm:text-sm"
                  >
                    View more
                  </Link>
                </div>

                <div className="lg:self-start lg:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-muted)] sm:text-xs">
                    Monthly rate
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--lumivale-ink)] sm:text-xl">
                    {service.privateContent.pricePreview}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <p className="max-w-3xl text-sm leading-7 text-[var(--lumivale-muted)] sm:text-base">
          Final scope can still shift after a call if you need bundled support, custom
          pacing, or a narrower monthly execution focus.
        </p>
      </section>
    </div>
  );
}
