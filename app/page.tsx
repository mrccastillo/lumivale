import Link from "next/link";

import { CaseStudyCards } from "@/components/case-study-cards";
import { MotionGroup, MotionItem } from "@/components/motion-group";
import { Parallax } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import { getAllCaseStudies } from "@/lib/case-studies";
import { defaultFaqs, getPublishedFaqs } from "@/lib/faqs";
import { getMongoDb } from "@/lib/mongodb";
import { getAllServices } from "@/lib/services";
import { CALENDLY_URL } from "@/lib/site-config";
import { getPublishedTestimonials, type Testimonial } from "@/lib/testimonials";

const platformNames = ["Reddit", "Quora", "X", "TikTok", "LinkedIn"];
const platformSequenceCopies = 4;

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

type HomepageTestimonialCardData = Pick<
  Testimonial,
  "id" | "personName" | "personTitle" | "quote" | "type" | "videoFileId"
> & {
  placeholder?: boolean;
};

const HOMEPAGE_VIDEO_TESTIMONIAL_SLOTS = 4;
const HOMEPAGE_TEXT_TESTIMONIAL_SLOTS = 6;

const videoTestimonialPlaceholders: HomepageTestimonialCardData[] = [
  {
    id: "placeholder-video-1",
    personName: "Founder placeholder",
    personTitle: "B2B SaaS team",
    quote:
      "Short video feedback about how Lumivale helped simplify execution and keep weekly growth activity moving.",
    type: "video",
    videoFileId: "",
    placeholder: true,
  },
  {
    id: "placeholder-video-2",
    personName: "Operator placeholder",
    personTitle: "Lean growth team",
    quote:
      "Video feedback placeholder showing how the team gained structure, cleaner messaging, and a more repeatable growth process.",
    type: "video",
    videoFileId: "",
    placeholder: true,
  },
  {
    id: "placeholder-video-3",
    personName: "Revenue lead placeholder",
    personTitle: "Growth-focused startup",
    quote:
      "Video placeholder describing a smoother way to test outreach, content, and awareness plays without agency overhead.",
    type: "video",
    videoFileId: "",
    placeholder: true,
  },
  {
    id: "placeholder-video-4",
    personName: "Product lead placeholder",
    personTitle: "Fast-moving launch team",
    quote:
      "Video placeholder about clearer offers, steadier publishing, and growth activity that keeps momentum visible.",
    type: "video",
    videoFileId: "",
    placeholder: true,
  },
];

const textTestimonialPlaceholders: HomepageTestimonialCardData[] = [
  {
    id: "placeholder-text-1",
    personName: "Marketing lead placeholder",
    personTitle: "Consumer startup",
    quote:
      "Text testimonial placeholder for clear channel strategy, faster shipping, and more confidence in what to focus on next.",
    type: "text",
    videoFileId: "",
    placeholder: true,
  },
  {
    id: "placeholder-text-2",
    personName: "CEO placeholder",
    personTitle: "Early-stage brand",
    quote:
      "Text testimonial placeholder focused on practical support, straightforward deliverables, and steady momentum across channels.",
    type: "text",
    videoFileId: "",
    placeholder: true,
  },
  {
    id: "placeholder-text-3",
    personName: "Team lead placeholder",
    personTitle: "Service business",
    quote:
      "Text feedback placeholder about keeping priorities clear, reporting simple, and progress visible every week.",
    type: "text",
    videoFileId: "",
    placeholder: true,
  },
  {
    id: "placeholder-text-4",
    personName: "Operator placeholder",
    personTitle: "Scaling media team",
    quote:
      "Text placeholder about smoother reviews, stronger content direction, and more confidence in what ships next.",
    type: "text",
    videoFileId: "",
    placeholder: true,
  },
  {
    id: "placeholder-text-5",
    personName: "Founder placeholder",
    personTitle: "B2B software company",
    quote:
      "Text placeholder focused on practical support, lighter oversight, and output that feels consistent week to week.",
    type: "text",
    videoFileId: "",
    placeholder: true,
  },
  {
    id: "placeholder-text-6",
    personName: "Growth lead placeholder",
    personTitle: "Lean acquisition team",
    quote:
      "Text placeholder about better execution quality, more useful reporting, and stronger channel follow-through.",
    type: "text",
    videoFileId: "",
    placeholder: true,
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

export default async function Home() {
  const caseStudies = getAllCaseStudies();
  const services = getAllServices();
  const [testimonials, faqs] = await Promise.all([getHomeTestimonials(), getHomeFaqs()]);
  const { textTestimonials, videoTestimonials } = getHomepageTestimonialSlots(testimonials);

  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <div data-nav-surface="dark" className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(20,201,131,0.26),transparent_26%),radial-gradient(circle_at_50%_44%,rgba(20,201,131,0.12),transparent_30%),linear-gradient(180deg,#063322_0%,#031410_48%,#031410_74%,#010807_100%)] text-white">
        <section id="hero" data-theme="dark" className="px-4 pb-6 pt-[72px] sm:px-6 sm:pb-8 sm:pt-20">
          <Parallax
            data-testid="hero-parallax"
            className="mx-auto flex min-h-[52vh] max-w-7xl flex-col items-center justify-center text-center sm:min-h-[56vh]"
            offset={18}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#d7f0e3] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-4 sm:py-2 sm:text-sm">
              <span className="flex -space-x-2">
                <span className="grid size-6 place-items-center rounded-full bg-[#ff8a3d] text-[10px] text-white sm:size-7 sm:text-xs">Y</span>
                <span className="grid size-6 place-items-center rounded-full bg-[#4ecdc4] text-[10px] text-white sm:size-7 sm:text-xs">L</span>
                <span className="grid size-6 place-items-center rounded-full bg-[#7dba99] text-[10px] text-white sm:size-7 sm:text-xs">S</span>
              </span>
              Light up your growth
            </div>

            <h1 className="mt-6 max-w-6xl text-[1.7rem] font-semibold leading-[1.08] text-white sm:mt-8 sm:text-4xl lg:text-5xl">
              Light up your growth with{" "}
              <span className="text-[var(--lumivale-accent-soft)]">simple execution systems</span>
            </h1>

            <p className="mt-5 max-w-3xl text-[0.95rem] leading-7 text-[#c7e7d7] sm:mt-7 sm:text-lg sm:leading-8">
              Lumivale helps early-stage teams find the channels that actually bring
              customers, then turns those channels into clear, repeatable growth actions.
            </p>

            <div data-testid="hero-cta-card" className="mt-7 flex w-full max-w-[22rem] flex-row gap-2 rounded-full border border-white/14 bg-white/12 p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:mt-9 sm:max-w-xl sm:gap-3 sm:p-2">
              <div className="flex flex-1 items-center px-4 py-2.5 text-left text-xs text-[#add7c2] sm:px-5 sm:py-3 sm:text-sm">
                Ready to grow?
              </div>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 whitespace-nowrap rounded-full bg-[var(--lumivale-accent)] px-5 py-2.5 text-xs font-semibold text-[#010807] shadow-[0_10px_28px_rgba(20,201,131,0.34)] transition hover:bg-[var(--lumivale-accent-soft)] sm:px-7 sm:py-3 sm:text-sm"
              >
                Book a call
              </a>
            </div>

            <div
              data-testid="platform-row"
              className="lumivale-marquee-fade mt-8 w-full max-w-4xl overflow-hidden sm:mt-10"
            >
              <div
                data-testid="platform-track"
                className="lumivale-marquee-track flex w-max items-center"
              >
                {Array.from({ length: platformSequenceCopies }, (_, index) => (
                  <div
                    key={`sequence-${index}`}
                    data-testid="platform-sequence"
                    aria-hidden={index > 0 || undefined}
                    className="flex shrink-0 items-center gap-x-4 pr-4 text-sm font-semibold text-white/56 sm:gap-x-12 sm:pr-12 sm:text-xl"
                  >
                    {platformNames.map((name) => (
                      <span
                        key={`sequence-${index}-${name}`}
                        data-testid="platform-item"
                        className="whitespace-nowrap"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Parallax>
        </section>

        <section id="proof" className="px-4 pb-14 pt-0 text-white sm:px-6 sm:pb-[68px]">
          <Reveal data-testid="proof-reveal" className="mx-auto max-w-7xl text-center">
            <p className="text-xs font-medium uppercase text-[#8ebba4] sm:text-sm">
              Built for lean growth teams
            </p>
            <h2 className="mx-auto mt-8 max-w-5xl text-2xl font-semibold leading-tight sm:mt-10 sm:text-4xl">
              Keep growth simple, affordable, and excellent without the agency overhead.
            </h2>
            <MotionGroup className="mx-auto mt-8 grid max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] sm:mt-12 md:grid-cols-3">
              {metrics.map((metric) => (
                <MotionItem key={metric.value}>
                  <article className="border-white/10 p-6 text-left sm:p-8 md:border-r last:border-r-0">
                    <p className="text-3xl font-semibold text-white sm:text-4xl">{metric.value}</p>
                    <p className="mt-3 text-sm text-[#b9d9c8]">{metric.label}</p>
                  </article>
                </MotionItem>
              ))}
            </MotionGroup>
          </Reveal>
        </section>
      </div>

      <section id="services" className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
                Services
              </p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-4xl">
                Our services
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--lumivale-muted)] sm:mt-5 sm:text-base">
                Choose focused growth support across targeted comments, UGC content,
                creator collaborations, LinkedIn outreach, and B2B email campaigns.
              </p>
          </Reveal>

          <MotionGroup
            data-testid="services-group"
            className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-2 xl:grid-cols-3"
          >
            {services.map((service) => (
              <MotionItem key={service.slug}>
                <article className="flex min-h-[220px] flex-col rounded-lg border border-[var(--lumivale-line)] bg-[#fbfcff] p-6 shadow-[0_20px_60px_rgba(42,47,82,0.06)] transition hover:-translate-y-1 hover:border-[var(--lumivale-accent)] hover:shadow-[0_24px_70px_rgba(42,47,82,0.1)] sm:p-7">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#eafaf2] text-[var(--lumivale-accent)]">
                      <ServiceIcon slug={service.slug} title={service.title} />
                    </span>
                    <Link
                      href={`/services/${service.slug}`}
                      className="pt-2 text-lg font-semibold text-[var(--lumivale-ink)] transition hover:text-[var(--lumivale-accent)] sm:text-xl"
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
              </MotionItem>
            ))}
          </MotionGroup>
        </div>
      </section>

      <section id="case-studies" className="bg-[#f7f8fb] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
              Case studies
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-4xl">
              Measured Growth, Built with Lumivale
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--lumivale-muted)] sm:mt-5 sm:text-base">
              Each card shows practical growth activity across awareness, content, and
              outbound channels.
            </p>
          </Reveal>

          <MotionGroup data-testid="case-studies-group" className="mt-10 sm:mt-14">
            <MotionItem>
              <CaseStudyCards caseStudies={caseStudies} />
            </MotionItem>
          </MotionGroup>
        </div>
      </section>

      <section data-nav-surface="dark" id="testimonials" className="bg-[var(--lumivale-ink)] px-4 py-16 text-white sm:px-6 sm:py-24">
        <Reveal data-testid="testimonials-reveal" className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent-soft)]">
            Client signal
          </p>
          <div className="mx-auto mt-5 max-w-4xl text-center sm:mt-6">
            <blockquote className="text-2xl font-semibold leading-tight sm:text-4xl">
              Lumivale keeps growth focused on the channels that can actually bring users,
              awareness, and website traffic.
            </blockquote>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#b9d9c8] sm:mt-6 sm:text-base">
              The strongest early teams do not need more agency jargon. They need simple
              execution, clear packages, and consistent growth activity.
            </p>
          </div>

          <div className="mt-10">
            <div
              data-testid="testimonials-video-grid"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {videoTestimonials.map((testimonial) => (
                <HomepageTestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>

            <div
              data-testid="testimonials-text-grid"
              className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {textTestimonials.map((testimonial) => (
                <HomepageTestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section id="faqs" className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <Reveal
          data-testid="faqs-reveal"
          className="mx-auto grid max-w-7xl gap-10 sm:gap-12 lg:grid-cols-[0.74fr_1.26fr] lg:gap-20"
        >
          <div className="lg:pt-2">
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
              Questions
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-none text-[var(--lumivale-ink)] sm:mt-6 sm:text-6xl">
              FAQ
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--lumivale-muted)] sm:mt-7 sm:text-base sm:leading-8">
              Everything you need to know about Lumivale and how we help grow
              your customer channels.
            </p>
          </div>
          <div className="border-t border-[var(--lumivale-line)]">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                open={index === 0}
                className="group border-b border-[var(--lumivale-line)] py-5 sm:py-6"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-base font-semibold leading-7 text-[var(--lumivale-ink)] transition hover:text-[var(--lumivale-accent)] sm:gap-6 sm:text-lg [&::-webkit-details-marker]:hidden">
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
        </Reveal>
      </section>

      <section id="conversion" className="bg-[#f7f8fb] px-4 py-16 sm:px-6 sm:py-24">
        <Reveal data-testid="conversion-reveal" className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
            Start here
          </p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-4xl">
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
        </Reveal>
      </section>
    </div>
  );
}

function HomepageTestimonialCard({
  testimonial,
}: {
  testimonial: HomepageTestimonialCardData;
}) {
  return testimonial.type === "video"
    ? <HomepageVideoTestimonialCard testimonial={testimonial} />
    : <HomepageTextTestimonialCard testimonial={testimonial} />;
}

function HomepageVideoTestimonialCard({
  testimonial,
}: {
  testimonial: HomepageTestimonialCardData;
}) {
  const badgeLabel = testimonial.placeholder ? "Video placeholder" : "Video testimonial";

  return (
    <article
      data-testid="homepage-video-testimonial"
      className="flex min-h-[420px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 text-left shadow-[0_26px_72px_rgba(0,0,0,0.24)] backdrop-blur-sm"
    >
      <div className="relative overflow-hidden rounded-[20px] border border-white/8 bg-[#091310]">
        {testimonial.videoFileId ? (
          <video
            controls
            preload="metadata"
            src={`/api/testimonial-videos/${testimonial.videoFileId}`}
            className="aspect-[9/13] w-full bg-black object-cover"
          />
        ) : (
          <div className="grid aspect-[9/13] w-full place-items-center bg-[linear-gradient(145deg,rgba(20,201,131,0.18),rgba(69,215,180,0.08)_38%,rgba(255,255,255,0.03))] p-6">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-white/14 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
                Play
              </span>
              <p className="mt-4 text-sm font-semibold text-white">Preview frame</p>
              <p className="mt-2 text-xs leading-6 text-[#b9d9c8]">
                Drop in a client clip, founder reaction, or operator recap here.
              </p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(1,8,7,0.88))] p-4">
          <span className="inline-flex rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-accent-soft)]">
            {badgeLabel}
          </span>
          <p className="mt-3 text-base font-semibold text-white">{testimonial.personName}</p>
          {testimonial.personTitle ? (
            <p className="mt-1 text-xs leading-5 text-[#b9d9c8]">{testimonial.personTitle}</p>
          ) : null}
        </div>
      </div>

      <blockquote className="mt-4 flex-1 px-1 text-base font-semibold leading-7 text-white">
        {testimonial.quote}
      </blockquote>
    </article>
  );
}

function HomepageTextTestimonialCard({
  testimonial,
}: {
  testimonial: HomepageTestimonialCardData;
}) {
  const badgeLabel = testimonial.placeholder ? "Text placeholder" : "Text testimonial";

  return (
    <article
      data-testid="homepage-text-testimonial"
      className="rounded-[20px] border border-white/8 bg-white/[0.04] p-5 text-left shadow-[0_18px_44px_rgba(0,0,0,0.18)] backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--lumivale-accent-soft)]">
          {badgeLabel}
        </span>
        <span className="text-3xl leading-none text-[var(--lumivale-accent-soft)]">&quot;</span>
      </div>

      <blockquote className="mt-4 text-sm leading-7 text-[#d7eee1]">
        {testimonial.quote}
      </blockquote>

      <div className="mt-5 border-t border-white/8 pt-4">
        <p className="text-sm font-semibold text-white">{testimonial.personName}</p>
        {testimonial.personTitle ? (
          <p className="mt-1 text-xs leading-5 text-[#9cc7b2]">{testimonial.personTitle}</p>
        ) : null}
      </div>
    </article>
  );
}

function getHomepageTestimonialSlots(testimonials: HomepageTestimonialCardData[]) {
  const videoTestimonials = testimonials.filter((testimonial) => testimonial.type === "video");
  const textTestimonials = testimonials.filter((testimonial) => testimonial.type === "text");

  return {
    videoTestimonials: fillHomepageTestimonialSlots(
      videoTestimonials,
      videoTestimonialPlaceholders,
      HOMEPAGE_VIDEO_TESTIMONIAL_SLOTS,
    ),
    textTestimonials: fillHomepageTestimonialSlots(
      textTestimonials,
      textTestimonialPlaceholders,
      HOMEPAGE_TEXT_TESTIMONIAL_SLOTS,
    ),
  };
}

function fillHomepageTestimonialSlots(
  testimonials: HomepageTestimonialCardData[],
  placeholders: HomepageTestimonialCardData[],
  count: number,
) {
  const filled = [...testimonials.slice(0, count)];

  if (filled.length < count) {
    filled.push(...placeholders.slice(0, count - filled.length));
  }

  return filled;
}

async function getHomeTestimonials() {
  try {
    const db = await getMongoDb();

    return getPublishedTestimonials(db);
  } catch (error) {
    console.error("Unable to load homepage testimonials", error);

    return [];
  }
}

async function getHomeFaqs() {
  try {
    const db = await getMongoDb();
    const faqs = await getPublishedFaqs(db);

    return faqs.length ? faqs : defaultFaqs;
  } catch (error) {
    console.error("Unable to load homepage FAQs", error);

    return defaultFaqs;
  }
}

