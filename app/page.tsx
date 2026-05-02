import Link from "next/link";

import { CaseStudyCards } from "@/components/case-study-cards";
import { getAllCaseStudies } from "@/lib/case-studies";
import { getAllServices } from "@/lib/services";
import { CALENDLY_URL } from "@/lib/site-config";

const platformNames = ["Reddit", "Quora", "X", "TikTok", "LinkedIn"];

const metrics = [
  {
    value: "We keep it Simple.",
    label:
      "No complex strategies or agency jargon. Clear, actionable steps that work.",
  },
  {
    value: "Make it Affordable.",
    label:
      "Dedicated growth support for a fraction of agency cost with flat-rate packages.",
  },
  {
    value: "Ensure Excellence.",
    label:
      "Hands-on experience with startups, experiments, and quality execution.",
  },
];

const faqs = [
  {
    question: "Is this only for startups?",
    answer:
      "No. Lumivale is built for early teams, founders, and lean brands that need practical growth execution without agency overhead.",
  },
  {
    question: "Do you handle the growth channels?",
    answer:
      "Yes. Lumivale supports targeted comments, UGC content, creator collaborations, LinkedIn outreach, and B2B email campaigns.",
  },
  {
    question: "How does pricing work?",
    answer:
      "Packages are flat-rate so you know exactly what you are paying for before the work starts.",
  },
  {
    question: "How soon can Lumivale start?",
    answer:
      "Most projects can begin after a short discovery call, once the channel focus, package, and first priorities are clear.",
  },
  {
    question: "Can we choose only one channel?",
    answer:
      "Yes. You can start with one focused growth channel, then add more support once the activity and results are easier to repeat.",
  },
];

function ServiceIcon({ slug, title }: { slug: string; title: string }) {
  const iconClass = "size-6";
  const commonProps = {
    "aria-label": `${title} icon`,
    className: iconClass,
    fill: "none",
    role: "img",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  switch (slug) {
    case "comment-campaign":
      return (
        <svg {...commonProps}>
          <path d="M5 7.5h14" />
          <path d="M5 12h9" />
          <path d="M8 18h4l4 3v-3h1.5A3.5 3.5 0 0 0 21 14.5v-8A3.5 3.5 0 0 0 17.5 3h-11A3.5 3.5 0 0 0 3 6.5v8A3.5 3.5 0 0 0 6.5 18H8Z" />
        </svg>
      );
    case "ugc-content-creation":
      return (
        <svg {...commonProps}>
          <path d="M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" />
          <path d="m10 9 5 3-5 3V9Z" />
        </svg>
      );
    case "creator-collabs":
      return (
        <svg {...commonProps}>
          <path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M2.5 21a5.5 5.5 0 0 1 11 0" />
          <path d="M17 8h4" />
          <path d="M19 6v4" />
          <path d="M16 15h5" />
          <path d="M16 19h5" />
        </svg>
      );
    case "linkedin-outreaching":
      return (
        <svg {...commonProps}>
          <path d="M6 10v8" />
          <path d="M6 6.5v.01" />
          <path d="M10 18v-8" />
          <path d="M10 13a3 3 0 0 1 6 0v5" />
          <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
          <path d="M18 4v4" />
          <path d="M20 6h-4" />
        </svg>
      );
  }
}

export default function Home() {
  const caseStudies = getAllCaseStudies();
  const services = getAllServices();

  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <div data-nav-surface="dark" className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(20,201,131,0.26),transparent_26%),radial-gradient(circle_at_50%_44%,rgba(20,201,131,0.12),transparent_30%),linear-gradient(180deg,#063322_0%,#031410_48%,#031410_74%,#010807_100%)] text-white">
        <section id="hero" data-theme="dark" className="px-6 pb-8 pt-20">
          <div className="mx-auto flex min-h-[56vh] max-w-7xl flex-col items-center justify-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-[#d7f0e3] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <span className="flex -space-x-2">
                <span className="grid size-7 place-items-center rounded-full bg-[#ff8a3d] text-xs text-white">Y</span>
                <span className="grid size-7 place-items-center rounded-full bg-[#4ecdc4] text-xs text-white">L</span>
                <span className="grid size-7 place-items-center rounded-full bg-[#7dba99] text-xs text-white">S</span>
              </span>
              Light up your growth
            </div>

            <h1 className="mt-8 max-w-6xl text-3xl font-semibold leading-[1.08] text-white sm:text-4xl lg:text-5xl">
              Light up your growth with{" "}
              <span className="text-[var(--lumivale-accent-soft)]">simple execution systems</span>
            </h1>

            <p className="mt-7 max-w-3xl text-base leading-8 text-[#c7e7d7] sm:text-lg">
              Lumivale helps early-stage teams find the channels that actually bring
              customers, then turns those channels into clear, repeatable growth actions.
            </p>

            <div className="mt-9 flex w-full max-w-xl flex-col gap-3 rounded-full border border-white/14 bg-white/12 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:flex-row">
              <div className="flex flex-1 items-center px-5 py-3 text-left text-sm text-[#add7c2]">
                Ready to grow?
              </div>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--lumivale-accent)] px-7 py-3 text-sm font-semibold text-[#010807] shadow-[0_10px_28px_rgba(20,201,131,0.34)] transition hover:bg-[var(--lumivale-accent-soft)]"
              >
                Book a call
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-5 text-xl font-semibold text-white/56">
              {platformNames.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="proof" className="px-6 pb-[68px] pt-0 text-white">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm font-medium uppercase text-[#8ebba4]">
              Built for lean growth teams
            </p>
            <h2 className="mx-auto mt-10 max-w-5xl text-3xl font-semibold leading-tight sm:text-4xl">
              Keep growth simple, affordable, and excellent without the agency overhead.
            </h2>
            <div className="mx-auto mt-12 grid max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] md:grid-cols-3">
              {metrics.map((metric) => (
                <article key={metric.value} className="border-white/10 p-8 text-left md:border-r last:border-r-0">
                  <p className="text-4xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-3 text-sm text-[#b9d9c8]">{metric.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section id="services" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
                Services
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-4xl">
                Our services
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--lumivale-muted)]">
                Choose focused growth support across targeted comments, UGC content,
                creator collaborations, LinkedIn outreach, and B2B email campaigns.
              </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.slug}
                className="flex min-h-[220px] flex-col rounded-lg border border-[var(--lumivale-line)] bg-[#fbfcff] p-7 shadow-[0_20px_60px_rgba(42,47,82,0.06)] transition hover:-translate-y-1 hover:border-[var(--lumivale-accent)] hover:shadow-[0_24px_70px_rgba(42,47,82,0.1)]"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#eafaf2] text-[var(--lumivale-accent)]">
                    <ServiceIcon slug={service.slug} title={service.title} />
                  </span>
                  <Link
                    href={`/services/${service.slug}`}
                    className="pt-2 text-xl font-semibold text-[var(--lumivale-ink)] transition hover:text-[var(--lumivale-accent)]"
                  >
                    {service.title}
                  </Link>
                </div>
                <p className="mt-5 flex-1 text-sm leading-7 text-[var(--lumivale-muted)]">
                  {service.summary}
                </p>
                <Link
                  href={`/services/${service.slug}`}
                  aria-label={`Learn more: ${service.title}`}
                  className="mt-6 w-fit text-sm font-semibold text-[var(--lumivale-accent)] transition hover:text-[var(--lumivale-ink)]"
                >
                  Learn more
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="case-studies" className="bg-[#f7f8fb] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
              Case studies
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-4xl">
              Measured Growth, Built with Lumivale
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-[var(--lumivale-muted)]">
              Each card shows practical growth activity across awareness, content, and
              outbound channels.
            </p>
          </div>

          <div className="mt-14">
            <CaseStudyCards caseStudies={caseStudies} />
          </div>
        </div>
      </section>

      <section data-nav-surface="dark" id="testimonials" className="bg-[var(--lumivale-ink)] px-6 py-24 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent-soft)]">
            Client signal
          </p>
          <blockquote className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
            Lumivale keeps growth focused on the channels that can actually bring users,
            awareness, and website traffic.
          </blockquote>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-[#b9d9c8]">
            The strongest early teams do not need more agency jargon. They need simple
            execution, clear packages, and consistent growth activity.
          </p>
        </div>
      </section>

      <section id="faqs" className="bg-white px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.74fr_1.26fr] lg:gap-20">
          <div className="lg:pt-2">
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
              Questions
            </p>
            <h2 className="mt-6 text-5xl font-semibold leading-none text-[var(--lumivale-ink)] sm:text-6xl">
              FAQ
            </h2>
            <p className="mt-7 max-w-md text-base leading-8 text-[var(--lumivale-muted)]">
              Everything you need to know about Lumivale and how we help grow
              your customer channels.
            </p>
          </div>
          <div className="border-t border-[var(--lumivale-line)]">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                open={index === 0}
                className="group border-b border-[var(--lumivale-line)] py-6"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-semibold leading-7 text-[var(--lumivale-ink)] transition hover:text-[var(--lumivale-accent)] [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="mt-0.5 shrink-0 text-2xl font-light leading-none text-[var(--lumivale-muted)] transition group-open:rotate-45 group-open:text-[var(--lumivale-accent)]">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--lumivale-muted)] sm:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="conversion" className="bg-[#f7f8fb] px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
            Start here
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-4xl">
            Light up the next growth channel for your brand.
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
