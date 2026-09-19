import Link from "next/link";

import { HomepageCaseStudies } from "@/components/homepage-case-studies";
import { HomepageFooter } from "@/components/homepage-footer";
import styles from "@/components/homepage-concept.module.css";
import { HeroClientMarquee } from "@/components/hero-client-marquee";
import { HeroGlowBlob } from "@/components/hero-glow-blob";
import { HeroScrollPin } from "@/components/hero-scroll-pin";
import { ResultCount } from "@/components/result-count";
import { HomepageTestimonialsCarousel } from "@/components/homepage-testimonials-carousel";
import { HomepageVideoTestimonialCard } from "@/components/homepage-video-testimonial-card";
import { MotionGroup, MotionItem } from "@/components/motion-group";
import { Parallax } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import { TestimonialsSpotlight } from "@/components/testimonials-spotlight";
import { getPublishedCaseStudiesForSite } from "@/lib/case-studies";
import { defaultFaqs, getPublishedFaqs } from "@/lib/faqs";
import { defaultHeroClients, getHeroClients, type HeroClientInput } from "@/lib/hero-clients";
import { getMongoDb } from "@/lib/mongodb";
import { getPublishedServicesForSite } from "@/lib/services";
import { getSiteContentForSite } from "@/lib/site-content";
import { getPublishedTestimonials, type Testimonial } from "@/lib/testimonials";

type HomepageTextTestimonialData = Pick<
  Testimonial,
  "id" | "personName" | "personTitle" | "quote" | "imageUrl"
> & {
  placeholder?: boolean;
};

type HomepageVideoTestimonialData = Pick<
  Testimonial,
  "id" | "personName" | "personTitle" | "quote" | "imageUrl" | "videoUrl"
> & {
  placeholder?: boolean;
};

const HOMEPAGE_TEXT_TESTIMONIAL_PAGE_SIZE = 4;
const HOMEPAGE_TEXT_TESTIMONIAL_MIN_PAGES = 2;

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
  const caseStudies = await getPublishedCaseStudiesForSite();
  const [services, testimonials, faqs, heroClients, content] = await Promise.all([
    getPublishedServicesForSite(),
    getHomeTestimonials(),
    getHomeFaqs(),
    getHomeHeroClients(),
    getSiteContentForSite(),
  ]);
  const textTestimonials = getHomepageTextTestimonials(testimonials);
  const showPlaceholderTestimonials = !testimonials.some(
    (testimonial) => testimonial.type === "text",
  );

  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <HeroScrollPin>
      <div data-nav-surface="dark" className={`${styles.heroBackdrop} relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_100%,rgba(8,20,14,0.22),transparent_42%),linear-gradient(180deg,#081d14_0%,#04110c_34%,#020605_68%,#000000_100%)] text-white`}>
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
                  {content.heroHeading}{" "}
                  <span className="text-[var(--lumivale-accent-soft)]">{content.heroHighlight}</span>
                </h1>
              </MotionItem>

              <MotionItem>
                <p className="mt-7 max-w-3xl text-[0.78rem] font-normal leading-6 text-[#c7e7d7] sm:mt-9 sm:text-[0.88rem] sm:leading-[2.25rem]">
                  {content.heroDescription}
                </p>
              </MotionItem>

              <MotionItem>
                <div data-testid="hero-cta-card" className="mt-10 flex w-full max-w-[22rem] flex-row gap-2 rounded-full border border-white/14 bg-white/12 p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:mt-12 sm:max-w-xl sm:gap-3 sm:p-2">
                  <div className="flex flex-1 items-center px-4 py-2.5 text-left text-xs text-[#add7c2] sm:px-5 sm:py-3 sm:text-sm">
                    {content.heroPrompt}
                  </div>
                  <a
                    href={content.heroButtonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 whitespace-nowrap rounded-full bg-[var(--lumivale-accent)] px-5 py-2.5 text-xs font-semibold text-[#010807] shadow-[0_10px_28px_rgba(20,201,131,0.34)] transition hover:bg-[var(--lumivale-accent-soft)] sm:px-7 sm:py-3 sm:text-sm"
                  >
                    {content.heroButtonText}
                  </a>
                </div>
              </MotionItem>
            </MotionGroup>
          </Parallax>

          <MotionGroup className="w-full" delay={0.28} stagger={0.1}>
            <MotionItem>
              <div className="border-t border-white/8 pb-5 pt-8 sm:pb-6 sm:pt-9">
                <p className="text-center text-[11px] font-medium uppercase tracking-[0.24em] text-[#8ebba4] sm:text-xs">
                  Clients we support
                </p>

                <HeroClientMarquee clients={heroClients} />
              </div>
            </MotionItem>
          </MotionGroup>
        </section>

      </div>
      </HeroScrollPin>
      <div className={styles.scope} data-homepage-concept data-nav-surface="light">
        <section id="proof" aria-labelledby="results-heading" className={`${styles.section} ${styles.resultsSection}`}>
          <div data-testid="proof-reveal" className={styles.wrap}>
            <div className={styles.resultsHead} data-scroll-reveal>
              <p className={styles.eyebrow}>{content.resultsEyebrow}</p>
              <h2 id="results-heading">{content.resultsHeading}</h2>
            </div>
            <div className={styles.metrics} data-scroll-landscape>
              {([1, 2, 3, 4] as const).map((index) => (
                <div key={index} className={styles.metric}>
                  <article>
                    <p className={styles.metricValue}><ResultCount value={content[`resultsMetric${index}Value`]} /></p>
                    <p className={styles.metricLabel}>{content[`resultsMetric${index}Label`]}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
        {caseStudies.length > 0 && <section id="case-studies" className={`${styles.section} ${styles.work}`}>
          <div className={styles.wrap}>
            <Reveal className={styles.head}>
              <div data-scroll-reveal><h2>Measured Growth, Built with Lumivale</h2>
                <p className={styles.description}>Explore our success stories across awareness, content, and outbound strategies with real client outcomes backed by consistent and measurable growth.</p>
              </div>
            </Reveal>
            <MotionGroup data-testid="case-studies-group"><MotionItem><HomepageCaseStudies caseStudies={caseStudies} /></MotionItem></MotionGroup>
          </div>
        </section>}
        <section id="services" className={`${styles.section} ${styles.services}`}>
          <div className={styles.wrap}>
            <Reveal className={styles.head}>
              <div data-scroll-reveal><h2>How We Can Help</h2><p className={styles.description}>Stop the guesswork and choose from one of our proven channels to unlock targeted growth that turns attention into revenue.</p></div>
            </Reveal>
            <MotionGroup data-testid="services-group" className={styles.serviceList}>
              {services.map((service) => <MotionItem key={service.slug}>
                <article className={styles.service} data-scroll-reveal><div>
                  <div className={styles.serviceTitle}>
                    <span><ServiceIcon slug={service.slug} title={service.title} /></span>
                    <h3><Link href={`/services/${service.slug}`}>{service.title}</Link></h3>
                  </div>
                  <p>{service.summary}</p>
                  <Link href={`/services/${service.slug}`} aria-label={`Learn more: ${service.title}`} className={styles.textLink}>Learn more <span aria-hidden="true">&#8599;</span></Link>
                </div></article>
              </MotionItem>)}
            </MotionGroup>
          </div>
        </section>
        <section id="testimonials" className={`${styles.section} ${styles.testimonials}`}>
          <TestimonialsSpotlight>
            <Reveal data-testid="testimonials-reveal" className={styles.wrap}>
              <div className={styles.head} data-scroll-reveal><h2>Hear it from our clients</h2></div>
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
        <section id="faqs" className={`${styles.section} ${styles.faq}`}>
          <Reveal data-testid="faqs-reveal" className={`${styles.wrap} ${styles.faqLayout}`}>
            <div data-scroll-reveal><h2>FAQ</h2><p className={styles.description}>Everything you need to know about Lumivale and how we help grow your customer channels.</p></div>
            <div className={styles.faqList}>
              {faqs.map((faq, index) => <details name="homepage-faq" data-scroll-reveal key={faq.question} open={index === 0}>
                <summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p>
              </details>)}
            </div>
          </Reveal>
        </section>
        <HomepageFooter content={content} />
      </div>
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
      imageUrl: testimonial.imageUrl,
      quote: testimonial.quote,
    }));

  if (!textTestimonials.length) {
    return [];
  }

  const minimumSlots =
    HOMEPAGE_TEXT_TESTIMONIAL_PAGE_SIZE * HOMEPAGE_TEXT_TESTIMONIAL_MIN_PAGES;
  const visibleSlots = Math.max(textTestimonials.length, minimumSlots);
  const remainder = visibleSlots % HOMEPAGE_TEXT_TESTIMONIAL_PAGE_SIZE;
  const paddedSlotCount =
    remainder === 0
      ? visibleSlots
      : visibleSlots + HOMEPAGE_TEXT_TESTIMONIAL_PAGE_SIZE - remainder;
  const placeholdersNeeded = paddedSlotCount - textTestimonials.length;

  if (placeholdersNeeded === 0) {
    return textTestimonials;
  }

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
    const homepageFaqs = faqs.length ? faqs : defaultFaqs;

    return homepageFaqs.slice(0, 5);
  } catch (error) {
    console.error("Unable to load homepage FAQs", error);

    return defaultFaqs.slice(0, 5);
  }
}

async function getHomeHeroClients(): Promise<HeroClientInput[]> {
  try {
    const db = await getMongoDb();
    const clients = await getHeroClients(db);

    return clients.length
      ? clients.map((client) => ({
          clientName: client.clientName,
          logoUrl: client.logoUrl,
        }))
      : defaultHeroClients;
  } catch (error) {
    console.error("Unable to load homepage hero clients", error);

    return defaultHeroClients;
  }
}
