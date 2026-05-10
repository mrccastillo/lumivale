import Link from "next/link";

import { CaseStudyCards } from "@/components/case-study-cards";
import { HeroGlowBlob } from "@/components/hero-glow-blob";
import { HomepageTestimonialsCarousel } from "@/components/homepage-testimonials-carousel";
import { HomepageVideoTestimonialCard } from "@/components/homepage-video-testimonial-card";
import { MotionGroup, MotionItem } from "@/components/motion-group";
import { Parallax } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import { TestimonialsSpotlight } from "@/components/testimonials-spotlight";
import { getAllCaseStudies } from "@/lib/case-studies";
import { defaultFaqs, getPublishedFaqs } from "@/lib/faqs";
import { getMongoDb } from "@/lib/mongodb";
import { getPublishedServicesForSite } from "@/lib/services";
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

type HomepageTextTestimonialData = Pick<
  Testimonial,
  "id" | "personName" | "personTitle" | "quote"
> & {
  placeholder?: boolean;
};

type HomepageVideoTestimonialData = Pick<
  Testimonial,
  "id" | "personName" | "personTitle" | "quote" | "videoUrl"
> & {
  placeholder?: boolean;
};

const HOMEPAGE_TEXT_TESTIMONIAL_PAGE_SIZE = 4;

const videoTestimonialPlaceholders: HomepageVideoTestimonialData[] = [
  {
    id: "placeholder-video-1",
    personName: "Founder placeholder",
    personTitle: "B2B SaaS team",
    quote:
      "Short video feedback about how Lumivale helped simplify execution and keep weekly growth activity moving.",
    videoUrl: "",
    placeholder: true,
  },
  {
    id: "placeholder-video-2",
    personName: "Operator placeholder",
    personTitle: "Lean growth team",
    quote:
      "Video feedback placeholder showing how the team gained structure, cleaner messaging, and a more repeatable growth process.",
    videoUrl: "",
    placeholder: true,
  },
  {
    id: "placeholder-video-3",
    personName: "Revenue lead placeholder",
    personTitle: "Growth-focused startup",
    quote:
      "Video placeholder describing a smoother way to test outreach, content, and awareness plays without agency overhead.",
    videoUrl: "",
    placeholder: true,
  },
  {
    id: "placeholder-video-4",
    personName: "Product lead placeholder",
    personTitle: "Fast-moving launch team",
    quote:
      "Video placeholder about clearer offers, steadier publishing, and growth activity that keeps momentum visible.",
    videoUrl: "",
    placeholder: true,
  },
];

const textTestimonialPlaceholders: HomepageTextTestimonialData[] = [
  {
    id: "placeholder-text-1",
    personName: "Marketing lead placeholder",
    personTitle: "Consumer startup",
    quote:
      "Text testimonial placeholder for clear channel strategy, faster shipping, and more confidence in what to focus on next.",
    placeholder: true,
  },
  {
    id: "placeholder-text-2",
    personName: "CEO placeholder",
    personTitle: "Early-stage brand",
    quote:
      "Text testimonial placeholder focused on practical support, straightforward deliverables, and steady momentum across channels.",
    placeholder: true,
  },
  {
    id: "placeholder-text-3",
    personName: "Team lead placeholder",
    personTitle: "Service business",
    quote:
      "Text feedback placeholder about keeping priorities clear, reporting simple, and progress visible every week.",
    placeholder: true,
  },
  {
    id: "placeholder-text-4",
    personName: "Operator placeholder",
    personTitle: "Scaling media team",
    quote:
      "Text placeholder about smoother reviews, stronger content direction, and more confidence in what ships next.",
    placeholder: true,
  },
  {
    id: "placeholder-text-5",
    personName: "Founder placeholder",
    personTitle: "B2B software company",
    quote:
      "Text placeholder focused on practical support, lighter oversight, and output that feels consistent week to week.",
    placeholder: true,
  },
  {
    id: "placeholder-text-6",
    personName: "Growth lead placeholder",
    personTitle: "Lean acquisition team",
    quote:
      "Text placeholder about better execution quality, more useful reporting, and stronger channel follow-through.",
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
  const [services, testimonials, faqs] = await Promise.all([
    getPublishedServicesForSite(),
    getHomeTestimonials(),
    getHomeFaqs(),
  ]);
  const textTestimonials = getHomepageTextTestimonials(testimonials);
  const showPlaceholderTestimonials = !testimonials.some(
    (testimonial) => testimonial.type === "text",
  );

  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <div data-nav-surface="dark" className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_100%,rgba(8,20,14,0.22),transparent_42%),linear-gradient(180deg,#081d14_0%,#04110c_34%,#020605_68%,#000000_100%)] text-white">
        <HeroGlowBlob />

        <section id="hero" data-theme="dark" className="relative z-10 flex min-h-screen flex-col px-4 pb-6 pt-[72px] sm:px-6 sm:pb-8 sm:pt-20">
          <Parallax
            data-testid="hero-parallax"
            className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center pb-14 pt-10 text-center sm:pb-20 sm:pt-14"
            offset={18}
          >
            <MotionGroup className="flex w-full flex-col items-center" delay={0.08} stagger={0.16}>
              <MotionItem>
                <h1 className="max-w-6xl text-[1.9rem] font-medium leading-[1.06] text-white sm:text-[3.5rem] lg:text-[3.7rem]">
                  Light up your growth with{" "}
                  <span className="text-[var(--lumivale-accent-soft)]">simple execution systems</span>
                </h1>
              </MotionItem>

              <MotionItem>
                <p className="mt-7 max-w-3xl text-[0.78rem] font-normal leading-6 text-[#c7e7d7] sm:mt-9 sm:text-[0.88rem] sm:leading-[2.25rem]">
                  Lumivale helps early-stage teams find the channels that actually bring
                  customers, then turns those channels into clear, repeatable growth actions.
                </p>
              </MotionItem>

              <MotionItem>
                <div data-testid="hero-cta-card" className="mt-10 flex w-full max-w-[22rem] flex-row gap-2 rounded-full border border-white/14 bg-white/12 p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:mt-12 sm:max-w-xl sm:gap-3 sm:p-2">
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
              </MotionItem>
            </MotionGroup>
          </Parallax>

          <MotionGroup className="w-full" delay={0.28} stagger={0.1}>
            <MotionItem>
              <div className="border-t border-white/8 pb-5 pt-8 sm:pb-6 sm:pt-9">
                <p className="text-center text-[11px] font-medium uppercase tracking-[0.24em] text-[#8ebba4] sm:text-xs">
                  Channels we activate
                </p>

                <div
                  data-testid="platform-row"
                  className="lumivale-marquee-fade mt-8 w-[calc(100%+2rem)] -translate-x-4 overflow-hidden sm:mt-9 sm:w-[calc(100%+3rem)] sm:-translate-x-6"
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
                        className="flex shrink-0 items-center gap-x-8 pr-8 text-sm font-semibold text-white/56 sm:gap-x-16 sm:pr-16 sm:text-xl"
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
              </div>
            </MotionItem>
          </MotionGroup>
        </section>

        <section id="proof" className="relative z-10 -mt-2 px-4 pb-16 pt-10 text-white sm:px-6 sm:pb-20 sm:pt-12">
          <Reveal data-testid="proof-reveal" className="mx-auto max-w-6xl text-center">
            <h2 className="mx-auto max-w-4xl text-[1.72rem] font-medium leading-tight sm:text-[2.2rem]">
              Keep growth simple, affordable, and excellent without the agency overhead.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[0.92rem] leading-7 text-[#9eb8ac] sm:mt-6 sm:text-[0.98rem] sm:leading-8">
              Practical support across channel strategy, execution, and reporting, without
              the layers and drag that usually come with agency retainers.
            </p>
            <MotionGroup className="mx-auto mt-10 grid max-w-5xl overflow-hidden rounded-[24px] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] shadow-[0_22px_64px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:mt-12 md:grid-cols-3">
              {metrics.map((metric) => (
                <MotionItem key={metric.value}>
                  <article className="border-white/7 p-6 text-left sm:p-8 md:border-r last:border-r-0">
                    <p className="text-[1.55rem] font-medium leading-[1.1] text-white sm:text-[2.05rem]">{metric.value}</p>
                    <p className="mt-3 text-[0.88rem] leading-[1.85rem] text-[#abc4b8]">{metric.label}</p>
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
                How We Can Help
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--lumivale-muted)] sm:mt-5 sm:text-base">
                Stop the guesswork and choose from one of our proven channels to unlock
                targeted growth that turns attention into revenue.
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
              Explore our success stories across awareness, content, and outbound
              strategies with real client outcomes backed by consistent and measurable
              growth.
            </p>
          </Reveal>

          <MotionGroup data-testid="case-studies-group" className="mt-10 sm:mt-14">
            <MotionItem>
              <CaseStudyCards caseStudies={caseStudies} />
            </MotionItem>
          </MotionGroup>
        </div>
      </section>

      <section data-nav-surface="dark" id="testimonials" className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(12,78,50,0.34),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(6,34,22,0.22),transparent_40%),linear-gradient(180deg,#020302_0%,#050505_100%)] text-white">
        <TestimonialsSpotlight className="px-4 py-16 sm:px-6 sm:py-24">
          <Reveal data-testid="testimonials-reveal" className="relative z-10 mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
                  <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
              Case studies
            </p>
              <h2 className="text-2xl font-semibold leading-tight sm:text-4xl">
                Hear it from our clients
              </h2>
            </div>

            {showPlaceholderTestimonials ? (
              <div className="mt-10">
                <div
                  data-testid="testimonials-video-grid"
                  className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                >
                  {videoTestimonialPlaceholders.map((testimonial) => (
                    <HomepageVideoTestimonialCard key={testimonial.id} testimonial={testimonial} />
                  ))}
                </div>

                <div
                  data-testid="testimonials-text-grid"
                  className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
                >
                  {textTestimonialPlaceholders.map((testimonial) => (
                    <LegacyHomepageTextTestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <HomepageTestimonialsCarousel testimonials={textTestimonials} />
            )}
          </Reveal>
        </TestimonialsSpotlight>
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

      <section id="conversion" data-nav-surface="dark" className="bg-[radial-gradient(circle_at_50%_0%,rgba(20,201,131,0.12),transparent_32%),linear-gradient(180deg,#03110c_0%,#02100b_44%,#010807_100%)] px-4 py-16 text-white sm:px-6 sm:py-24">
        <Reveal data-testid="conversion-reveal" className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
            Start here
          </p>
          <h2 className="mt-4 text-[1.8rem] font-medium leading-tight text-white sm:text-[3rem]">
            Light up the next growth channel for your brand.
          </h2>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex rounded-full bg-[var(--lumivale-accent)] px-7 py-3 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
          >
            Book a call
          </a>
        </Reveal>
      </section>
    </div>
  );
}

function LegacyHomepageTextTestimonialCard({
  testimonial,
}: {
  testimonial: HomepageTextTestimonialData;
}) {
  return (
    <article
      data-testid="homepage-text-testimonial"
      className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium text-white/62 backdrop-blur-md">
          Text placeholder
        </span>
        <span className="text-2xl leading-none text-white/28">&quot;</span>
      </div>

      <blockquote className="mt-4 text-sm leading-7 text-[#efefef]">
        {testimonial.quote}
      </blockquote>

      <div className="mt-5 border-t border-white/6 pt-4">
        <p className="text-base font-semibold text-white">{testimonial.personName}</p>
        {testimonial.personTitle ? (
          <p className="mt-1 text-sm leading-5 text-white/62">{testimonial.personTitle}</p>
        ) : null}
      </div>
    </article>
  );
}

function getHomepageTextTestimonials(testimonials: Testimonial[]) {
  const textTestimonials = testimonials
    .filter((testimonial) => testimonial.type === "text")
    .map((testimonial) => ({
      id: testimonial.id,
      personName: testimonial.personName,
      personTitle: testimonial.personTitle,
      quote: testimonial.quote,
    }));

  if (!textTestimonials.length) {
    return [];
  }

  const remainder = textTestimonials.length % HOMEPAGE_TEXT_TESTIMONIAL_PAGE_SIZE;

  if (remainder === 0) {
    return textTestimonials;
  }

  const placeholdersNeeded = HOMEPAGE_TEXT_TESTIMONIAL_PAGE_SIZE - remainder;
  const placeholderFill = Array.from({ length: placeholdersNeeded }, (_, index) => {
    const placeholder = textTestimonialPlaceholders[index % textTestimonialPlaceholders.length];

    return {
      ...placeholder,
      id: `${placeholder.id}-page-fill-${index + 1}`,
    };
  });

  return [...textTestimonials, ...placeholderFill];
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

