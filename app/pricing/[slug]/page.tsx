import Link from "next/link";
import Image from "next/image";
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

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.8fr)] lg:items-stretch lg:gap-12">
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

              <div className="mt-10 space-y-3">
                {service.privateContent.pricingLines.map((line) => (
                  <p key={`${line.label}-${line.value}`} className="text-lg leading-8 text-white">
                    <span className="font-medium">{line.label}:</span> {line.value}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.22)]">
              <div className="flex h-full min-h-[320px] flex-col justify-between rounded-[16px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-accent-soft)]">
                    Private detail
                  </span>
                  <span className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-accent-soft)]">
                    {service.privateContent.examplePlatform}
                  </span>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
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

                <div className="mt-8 rounded-[18px] border border-dashed border-white/[0.14] bg-[rgba(255,255,255,0.03)] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-accent-soft)]">
                    Example channel
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {service.privateContent.examplePlatform}
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-7 text-[#d7eee1]">
                    Placeholder visual panel for trusted-service examples. Replace with
                    real screenshots or embeds when assets are available.
                  </p>
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
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[var(--lumivale-line)] bg-[#f7f8fb] px-4 py-2 text-sm font-semibold text-[var(--lumivale-ink)]">
              {service.privateContent.examplePlatform}
            </span>
            <p className="text-sm text-[var(--lumivale-muted)]">
              Placeholder examples for trusted pricing conversations.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {service.privateContent.exampleCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[18px] border border-[var(--lumivale-line)] bg-[#fbfcff] p-6 shadow-[0_18px_44px_rgba(42,47,82,0.06)]"
              >
                <span className="inline-flex rounded-full border border-[var(--lumivale-line)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-muted)]">
                  {card.tag}
                </span>
                <h2 className="mt-5 text-xl font-semibold text-[var(--lumivale-ink)]">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
                  {card.summary}
                </p>
                {card.exampleType === "photo" && card.imageFileId ? (
                  <figure className="mt-5 overflow-hidden rounded-xl border border-[var(--lumivale-line)] bg-white">
                    <Image
                      src={`/api/service-example-images/${card.imageFileId}`}
                      alt={card.imageAlt || card.title}
                      width={960}
                      height={540}
                      unoptimized
                      className="aspect-video w-full object-cover"
                    />
                    {card.imageAlt ? (
                      <figcaption className="px-4 py-3 text-sm leading-6 text-[var(--lumivale-muted)]">
                        {card.imageAlt}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : null}
                {card.exampleType !== "photo" && card.previewUrl ? (
                  <a
                    href={card.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 block rounded-xl border border-[var(--lumivale-line)] bg-white p-4 text-sm transition hover:border-[var(--lumivale-accent)]"
                  >
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-muted)]">
                      Preview link
                    </span>
                    <span className="mt-2 block font-semibold text-[var(--lumivale-ink)]">
                      {formatPreviewHost(card.previewUrl)}
                    </span>
                    <span className="mt-1 block break-all text-xs leading-5 text-[var(--lumivale-muted)]">
                      {card.previewUrl}
                    </span>
                  </a>
                ) : null}
                {card.videoFileId ? (
                  <div className="mt-5 overflow-hidden rounded-xl border border-[var(--lumivale-line)] bg-white">
                    <video
                      controls
                      preload="metadata"
                      className="aspect-video w-full bg-black"
                      src={`/api/service-example-videos/${card.videoFileId}`}
                    />
                    {card.videoDescription ? (
                      <p className="px-4 py-3 text-sm leading-6 text-[var(--lumivale-muted)]">
                        {card.videoDescription}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function formatPreviewHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "Open preview";
  }
}
