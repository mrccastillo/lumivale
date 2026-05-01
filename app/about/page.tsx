import Link from "next/link";

import { CALENDLY_URL } from "@/lib/site-config";

const principles = [
  {
    title: "Clarity before visuals",
    copy: "Every layout decision starts with the offer, the buyer, and the proof needed to move a qualified lead forward.",
  },
  {
    title: "Premium without clutter",
    copy: "The site should feel sharp, modern, and considered without relying on noise, decoration, or overbuilt interactions.",
  },
  {
    title: "Built for momentum",
    copy: "The end result is not only a better website. It is a reusable system for messaging, calls, content, and follow-up.",
  },
];

const capabilities = ["Positioning", "Website strategy", "Conversion copy", "Launch systems"];

export default function AboutPage() {
  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <section data-nav-surface="dark" className="bg-[radial-gradient(circle_at_50%_0%,rgba(20,201,131,0.22),transparent_28%),linear-gradient(180deg,#063322_0%,#031410_56%,#010807_100%)] px-6 py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent-soft)]">
              About Lumivale
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.04] sm:text-5xl">
              About Me
            </h1>
          </div>
          <p className="max-w-2xl text-base leading-8 text-[#c7e7d7] sm:text-lg">
            Lumivale is a founder-led studio for service brands that need a website with
            the clarity of a pitch deck and the polish of a SaaS product.
          </p>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
              Point of view
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              Good design should make the offer easier to trust.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <div
                key={capability}
                className="rounded-lg border border-[var(--lumivale-line)] bg-white p-6 shadow-[0_20px_60px_rgba(42,47,82,0.06)]"
              >
                <p className="text-base font-semibold">{capability}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
              Operating principles
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">How I work</h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="rounded-lg border border-[var(--lumivale-line)] bg-[#fbfcff] p-7"
              >
                <h3 className="text-xl font-semibold">{principle.title}</h3>
                <p className="mt-4 leading-7 text-[var(--lumivale-muted)]">
                  {principle.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div data-nav-surface="dark" className="mx-auto flex max-w-7xl flex-col gap-6 rounded-lg bg-[var(--lumivale-ink)] p-8 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent-soft)]">
              Next step
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Bring the same clarity to your site.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[var(--lumivale-accent)] px-6 py-3 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
            >
              Book a call
            </a>
            <Link
              href="/case-studies"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View case studies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
