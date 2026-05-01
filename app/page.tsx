import Link from "next/link";

import { getAllCaseStudies } from "@/lib/case-studies";
import { CALENDLY_URL } from "@/lib/site-config";

const platformNames = ["Webflow", "Shopify", "Wix", "Framer", "Squarespace"];

const metrics = [
  { value: "3x", label: "clearer offer hierarchy", client: "Positioning" },
  { value: "+42%", label: "more qualified inquiries", client: "Conversion" },
  { value: "<30 days", label: "to a sharper launch plan", client: "Delivery" },
  { value: "100%", label: "built around your buyer", client: "Strategy" },
];

const services = [
  {
    step: "1",
    title: "Clarify the offer",
    copy: "We tighten your positioning, page story, and buyer logic before a single section gets designed.",
  },
  {
    step: "2",
    title: "Design the system",
    copy: "We shape a modern web presence with focused pages, proof points, CTAs, and clean visual hierarchy.",
  },
  {
    step: "3",
    title: "Launch with momentum",
    copy: "You get a site and campaign-ready messaging system that can support calls, content, and follow-up.",
  },
];

const faqs = [
  {
    question: "Is this only for SaaS companies?",
    answer:
      "No. The visual direction is SaaS-grade, but the work is built for expert-led service brands, consultants, and studios.",
  },
  {
    question: "Do you handle copy and structure?",
    answer:
      "Yes. Messaging, page structure, proof hierarchy, and conversion paths are part of the core engagement.",
  },
  {
    question: "Can this work with our current platform?",
    answer:
      "Yes. The strategy and interface system can be adapted to common platforms or prepared for a custom build.",
  },
];

export default function Home() {
  const [featuredStudy, ...supportingStudies] = getAllCaseStudies();

  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <div data-nav-surface="dark" className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(20,201,131,0.26),transparent_26%),radial-gradient(circle_at_50%_44%,rgba(20,201,131,0.12),transparent_30%),linear-gradient(180deg,#063322_0%,#031410_48%,#031410_74%,#010807_100%)] text-white">
        <section id="hero" data-theme="dark" className="px-6 pb-16 pt-20">
          <div className="mx-auto flex min-h-[68vh] max-w-7xl flex-col items-center justify-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-[#d7f0e3] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <span className="flex -space-x-2">
                <span className="grid size-7 place-items-center rounded-full bg-[#ff8a3d] text-xs text-white">Y</span>
                <span className="grid size-7 place-items-center rounded-full bg-[#4ecdc4] text-xs text-white">L</span>
                <span className="grid size-7 place-items-center rounded-full bg-[#7dba99] text-xs text-white">S</span>
              </span>
              Backed by strategy, design, and launch systems
            </div>

            <h1 className="mt-8 max-w-6xl text-4xl font-semibold leading-[1.04] text-white sm:text-5xl lg:text-6xl">
              Launch a premium website that turns trust into{" "}
              <span className="text-[var(--lumivale-accent-soft)]">booked calls</span>
            </h1>

            <p className="mt-7 max-w-3xl text-base leading-8 text-[#c7e7d7] sm:text-lg">
              Lumivale builds modern websites, message systems, and conversion paths for
              service brands that need to look credible before the first sales call.
            </p>

            <div className="mt-9 flex w-full max-w-xl flex-col gap-3 rounded-full border border-white/14 bg-white/12 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:flex-row">
              <div className="flex flex-1 items-center px-5 py-3 text-left text-sm text-[#add7c2]">
                Enter your domain...
              </div>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--lumivale-accent)] px-7 py-3 text-sm font-semibold text-[#010807] shadow-[0_10px_28px_rgba(20,201,131,0.34)] transition hover:bg-[var(--lumivale-accent-soft)]"
              >
                Start
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-5 text-xl font-semibold text-white/56">
              {platformNames.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="proof" className="px-6 pb-28 pt-8 text-white">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm font-medium uppercase text-[#8ebba4]">
              Trusted by ambitious service teams
            </p>
            <h2 className="mx-auto mt-10 max-w-5xl text-3xl font-semibold leading-tight sm:text-4xl">
              Lumivale drives premium positioning and conversion-ready websites at a
              fraction of agency bloat.
            </h2>
            <div className="mt-16 grid overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] md:grid-cols-4">
              {metrics.map((metric) => (
                <article key={metric.value} className="border-white/10 p-8 text-left md:border-r last:border-r-0">
                  <p className="text-4xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-3 text-sm text-[#b9d9c8]">{metric.label}</p>
                  <p className="mt-8 text-base font-semibold text-white">{metric.client}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section id="services" className="bg-white px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-4xl">
              Lumivale works like a compact growth team.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--lumivale-muted)]">
              Strategy, design, and launch structure move together so the website feels
              expensive and performs like a system.
            </p>
          </div>

          <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              {services.map((service) => (
                <article key={service.step} className="grid gap-5 sm:grid-cols-[48px_1fr]">
                  <span className="grid size-12 place-items-center rounded-lg bg-[#efecff] text-sm font-semibold text-[var(--lumivale-accent)]">
                    {service.step}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--lumivale-ink)]">
                      {service.title}
                    </h3>
                    <p className="mt-3 leading-7 text-[var(--lumivale-muted)]">
                      {service.copy}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-lg border border-[var(--lumivale-line)] bg-[#fbfcff] p-5 shadow-[0_28px_80px_rgba(42,47,82,0.12)]">
              <div className="rounded-md border border-[var(--lumivale-line)] bg-white">
                <div className="flex items-center gap-2 border-b border-[var(--lumivale-line)] px-4 py-3">
                  <span className="size-2 rounded-full bg-[#d6dbe8]" />
                  <span className="size-2 rounded-full bg-[#d6dbe8]" />
                  <span className="size-2 rounded-full bg-[#d6dbe8]" />
                  <span className="ml-auto rounded-full bg-[#f4f6fb] px-16 py-2" />
                </div>
                <div className="grid gap-4 p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                    <div className="h-44 rounded-md bg-[#f3f5fb]" />
                    <div className="space-y-3">
                      <div className="h-16 rounded-md bg-[#efecff]" />
                      <div className="h-16 rounded-md bg-[#f3f5fb]" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="h-20 rounded-md bg-[#f3f5fb]" />
                    <div className="h-20 rounded-md bg-[#f3f5fb]" />
                    <div className="h-20 rounded-md bg-[#f3f5fb]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="results" className="bg-[#f7f8fb] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
                Case studies
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-4xl">
                Designed to make expertise easier to believe.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[var(--lumivale-muted)]">
                {featuredStudy.summary}
              </p>
              <Link
                href={`/case-studies/${featuredStudy.slug}`}
                className="mt-8 inline-flex rounded-full bg-[var(--lumivale-ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--lumivale-deep)]"
              >
                {featuredStudy.title}
              </Link>
            </div>
            <div className="grid gap-4">
              {supportingStudies.slice(0, 2).map((study) => (
                <article key={study.slug} className="rounded-lg border border-[var(--lumivale-line)] bg-white p-6">
                  <h3 className="text-lg font-semibold text-[var(--lumivale-ink)]">{study.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--lumivale-muted)]">
                    {study.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-nav-surface="dark" id="testimonials" className="bg-[var(--lumivale-ink)] px-6 py-28 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent-soft)]">
            Client signal
          </p>
          <blockquote className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
            The site stopped feeling like a brochure and started working like a serious
            sales asset.
          </blockquote>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-[#b9d9c8]">
            The strongest brands do not need louder pages. They need sharper hierarchy,
            stronger proof, and fewer reasons for a buyer to hesitate.
          </p>
        </div>
      </section>

      <section id="faqs" className="bg-white px-6 py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
              Questions
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-[var(--lumivale-ink)]">
              What teams ask before we start.
            </h2>
          </div>
          <div className="divide-y divide-[var(--lumivale-line)] border-y border-[var(--lumivale-line)]">
            {faqs.map((faq) => (
              <article key={faq.question} className="py-6">
                <h3 className="text-lg font-semibold text-[var(--lumivale-ink)]">
                  {faq.question}
                </h3>
                <p className="mt-3 leading-7 text-[var(--lumivale-muted)]">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="conversion" className="bg-[#f7f8fb] px-6 py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
            Start here
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-4xl">
            Build a website that makes the next conversation easier to win.
          </h2>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex rounded-full bg-[var(--lumivale-accent)] px-7 py-3 text-sm font-semibold text-[#010807] shadow-[0_14px_34px_rgba(20,201,131,0.28)] transition hover:bg-[var(--lumivale-accent-soft)]"
          >
            Book a call
          </a>
        </div>
      </section>
    </div>
  );
}
