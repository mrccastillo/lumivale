import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import Home from "@/app/page";
import { getAllCaseStudies } from "@/lib/case-studies";
import { getMongoDb } from "@/lib/mongodb";
import { getPublishedFaqs } from "@/lib/faqs";
import { getAllServices } from "@/lib/services";
import { CALENDLY_URL } from "@/lib/site-config";
import { getPublishedTestimonials } from "@/lib/testimonials";

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/testimonials", () => ({
  getPublishedTestimonials: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/faqs", () => ({
  getPublishedFaqs: vi.fn().mockResolvedValue([]),
  defaultFaqs: [
    {
      question: "Is this only for startups?",
      answer:
        "No. Lumivale is built for early teams, founders, and lean brands that need practical growth execution without agency overhead.",
      sortOrder: 1,
      status: "published",
    },
    {
      question: "Do you handle the growth channels?",
      answer:
        "Yes. Lumivale supports targeted comments, UGC content, creator collaborations, LinkedIn outreach, and B2B email campaigns.",
      sortOrder: 2,
      status: "published",
    },
    {
      question: "How does pricing work?",
      answer:
        "Packages are flat-rate so you know exactly what you are paying for before the work starts.",
      sortOrder: 3,
      status: "published",
    },
    {
      question: "How soon can Lumivale start?",
      answer:
        "Most projects can begin after a short discovery call, once the channel focus, package, and first priorities are clear.",
      sortOrder: 4,
      status: "published",
    },
    {
      question: "Can we choose only one channel?",
      answer:
        "Yes. You can start with one focused growth channel, then add more support once the activity and results are easier to repeat.",
      sortOrder: 5,
      status: "published",
    },
  ],
}));

describe("home page", () => {
  test("renders the landing sections in order", async () => {
    const { container } = render(await Home());

    const sections = Array.from(container.querySelectorAll("section"));

    expect(sections.map((section) => section.getAttribute("id"))).toEqual([
      "hero",
      "proof",
      "services",
      "case-studies",
      "testimonials",
      "faqs",
      "conversion",
    ]);
  });

  test("uses tighter mobile section spacing", async () => {
    const { container } = render(await Home());

    expect(container.querySelector("#hero")).toHaveClass(
      "px-4",
      "pb-6",
      "pt-[72px]",
      "sm:px-6",
      "sm:pb-8",
      "sm:pt-20",
    );
    expect(container.querySelector("#proof")).toHaveClass(
      "px-4",
      "pb-14",
      "sm:px-6",
      "sm:pb-[68px]",
    );
    expect(container.querySelector("#services")).toHaveClass("py-16", "sm:py-24");
    expect(container.querySelector("#case-studies")).toHaveClass("py-16", "sm:py-24");
    expect(container.querySelector("#testimonials")).toHaveClass("py-16", "sm:py-24");
    expect(container.querySelector("#faqs")).toHaveClass("py-16", "sm:py-24");
    expect(container.querySelector("#conversion")).toHaveClass("py-16", "sm:py-24");
  });

  test("renders Lumivale growth copy and a seeded case study link", async () => {
    const { container } = render(await Home());

    const heroHeading = screen.getByRole("heading", {
      level: 1,
      name: /Light up your growth with simple execution systems/i,
    });
    expect(heroHeading).toBeInTheDocument();
    expect(heroHeading).toHaveClass("text-[1.7rem]", "sm:text-4xl", "lg:text-5xl");
    expect(heroHeading).not.toHaveClass("text-3xl", "text-4xl", "sm:text-5xl", "lg:text-6xl");
    expect(
      screen.getByText(
        "Lumivale helps early-stage teams find the channels that actually bring customers, then turns those channels into clear, repeatable growth actions.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Light up your growth")).toBeInTheDocument();
    expect(screen.getByText("We keep it Simple.")).toBeInTheDocument();
    expect(screen.getByText("Make it Affordable.")).toBeInTheDocument();
    expect(screen.getByText("Ensure Excellence.")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "Book a call" })
        .some(
          (link) =>
            link.getAttribute("href") === CALENDLY_URL,
        ),
    ).toBe(true);

    const hero = container.querySelector("#hero");
    const heroCta = hero?.querySelector("[data-testid='hero-cta-card']");
    const platformRow = hero?.querySelector("[data-testid='platform-row']");

    expect(heroCta).toHaveClass(
      "max-w-[22rem]",
      "flex-row",
      "gap-2",
      "p-1.5",
      "sm:max-w-xl",
      "sm:gap-3",
      "sm:p-2",
    );
    expect(heroCta).not.toHaveClass("flex-col");
    expect(platformRow).toHaveClass(
      "w-full",
      "max-w-4xl",
      "overflow-hidden",
      "lumivale-marquee-fade",
    );
    expect(platformRow).not.toHaveClass("flex-wrap", "gap-y-4", "text-base");

    const [featuredStudy] = getAllCaseStudies();
    expect(
      screen.getByRole("link", {
        name: `Read the full story: ${featuredStudy.title}`,
      }),
    ).toHaveAttribute("href", `/case-studies/${featuredStudy.slug}`);
  });

  test("renders the hero platform labels as an infinite marquee", async () => {
    const { container } = render(await Home());
    const hero = container.querySelector("#hero");
    const platformRow = hero?.querySelector("[data-testid='platform-row']");
    const marqueeTrack = hero?.querySelector("[data-testid='platform-track']");
    const sequences = hero?.querySelectorAll("[data-testid='platform-sequence']");
    const [primarySequence, ...duplicateSequences] = Array.from(sequences ?? []);

    expect(platformRow).toHaveClass("overflow-hidden");
    expect(marqueeTrack).toHaveClass("lumivale-marquee-track");
    expect(sequences).toHaveLength(4);
    expect(primarySequence).not.toHaveClass("min-w-full", "justify-center");
    const primaryLabels = Array.from(
      primarySequence?.querySelectorAll("[data-testid='platform-item']") ?? [],
    ).map((item) => item.textContent);
    expect(primaryLabels).toEqual(["Reddit", "Quora", "X", "TikTok", "LinkedIn"]);
    expect(duplicateSequences.every((sequence) => sequence.getAttribute("aria-hidden") === "true")).toBe(true);
  });

  test("renders homepage sections inside motion wrappers", async () => {
    const { container } = render(await Home());

    expect(container.querySelector("[data-testid='hero-parallax']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='proof-reveal']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='services-group']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='case-studies-group']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='testimonials-reveal']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='faqs-reveal']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='conversion-reveal']")).toBeInTheDocument();
  });

  test("does not render the old website studio positioning", async () => {
    const { container } = render(await Home());

    expect(container).not.toHaveTextContent(/premium website/i);
    expect(container).not.toHaveTextContent(/SaaS-grade/i);
    expect(container).not.toHaveTextContent(/booked calls/i);
    expect(container).not.toHaveTextContent(/website strategy/i);
  });

  test("does not render extra proof card captions", async () => {
    const { container } = render(await Home());

    expect(container).not.toHaveTextContent(/Growth principle/i);
  });

  test("renders service summaries without bullet highlights or full detail copy", async () => {
    const { container } = render(await Home());
    const serviceSection = container.querySelector("#services");

    if (!serviceSection) {
      throw new Error("Expected services section to render");
    }

    const serviceQueries = within(serviceSection as HTMLElement);

    for (const service of getAllServices()) {
      expect(
        serviceQueries.getByRole("link", { name: service.title }),
      ).toHaveAttribute("href", `/services/${service.slug}`);

      expect(serviceQueries.getByLabelText(`${service.title} icon`)).toBeInTheDocument();
      expect(serviceQueries.getByText(service.summary)).toBeInTheDocument();
      expect(
        serviceQueries.getByRole("link", { name: `Learn more: ${service.title}` }),
      ).toHaveAttribute("href", `/services/${service.slug}`);

      for (const highlight of service.highlights) {
        expect(serviceQueries.queryByText(highlight)).not.toBeInTheDocument();
      }

      expect(serviceQueries.queryByText(service.description)).not.toBeInTheDocument();
    }

    expect(serviceSection.querySelector("ul")).not.toBeInTheDocument();
    expect(serviceSection.querySelectorAll("article")).toHaveLength(5);
  });

  test("renders case studies in measured impact card layout", async () => {
    const { container } = render(await Home());
    const caseStudySection = container.querySelector("#case-studies");

    expect(caseStudySection).toHaveTextContent("Measured Growth, Built with Lumivale");
    expect(caseStudySection).toHaveTextContent(
      "Each card shows practical growth activity across awareness, content, and outbound channels.",
    );
    expect(caseStudySection?.querySelectorAll("article")).toHaveLength(3);

    for (const study of getAllCaseStudies()) {
      expect(caseStudySection).toHaveTextContent(study.category);
      expect(caseStudySection).toHaveTextContent(study.headline);
      for (const metric of study.metrics) {
        expect(caseStudySection).toHaveTextContent(metric.value);
        expect(caseStudySection).toHaveTextContent(metric.label);
      }
      expect(
        screen.getByRole("link", { name: `Read the full story: ${study.title}` }),
      ).toHaveAttribute("href", `/case-studies/${study.slug}`);
    }

    expect(
      within(caseStudySection as HTMLElement).queryByRole("link", {
        name: "Book a call",
      }),
    ).not.toBeInTheDocument();
  });

  test("renders published text and video testimonials from MongoDB", async () => {
    vi.mocked(getPublishedTestimonials).mockResolvedValueOnce([
      {
        id: "testimonial-1",
        personName: "Maya Lee",
        personTitle: "Founder, Northstar",
        quote: "Lumivale made growth activity simpler to repeat.",
        sortOrder: 1,
        status: "published",
        type: "text",
        videoFileId: "",
        createdAt: new Date("2026-05-03T08:00:00.000Z"),
        updatedAt: new Date("2026-05-03T08:00:00.000Z"),
      },
      {
        id: "testimonial-2",
        personName: "Jon Ramos",
        personTitle: "CEO, Signal Labs",
        quote: "The execution support helped us move faster.",
        sortOrder: 2,
        status: "published",
        type: "video",
        videoFileId: "video-1",
        createdAt: new Date("2026-05-03T08:01:00.000Z"),
        updatedAt: new Date("2026-05-03T08:01:00.000Z"),
      },
    ]);

    const { container } = render(await Home());
    const testimonialSection = container.querySelector("#testimonials");

    expect(testimonialSection).toHaveTextContent("Maya Lee");
    expect(testimonialSection).toHaveTextContent("Founder, Northstar");
    expect(testimonialSection).toHaveTextContent(
      "Lumivale made growth activity simpler to repeat.",
    );
    expect(testimonialSection).toHaveTextContent("Jon Ramos");
    expect(testimonialSection?.querySelector("video")).toHaveAttribute(
      "src",
      "/api/testimonial-videos/video-1",
    );
    expect(testimonialSection?.querySelector("video")).toHaveAttribute("controls");
  });

  test("renders six testimonial placeholders when no published testimonials are available", async () => {
    const { container } = render(await Home());
    const testimonialSection = container.querySelector("#testimonials");

    expect(testimonialSection).toHaveTextContent(
      "Lumivale keeps growth focused on the channels that can actually bring users, awareness, and website traffic.",
    );
    expect(testimonialSection).toHaveTextContent(
      "The strongest early teams do not need more agency jargon. They need simple execution, clear packages, and consistent growth activity.",
    );
    expect(within(testimonialSection as HTMLElement).getAllByText("Video placeholder")).toHaveLength(3);
    expect(within(testimonialSection as HTMLElement).getAllByText("Text placeholder")).toHaveLength(3);
    expect(testimonialSection?.querySelectorAll("article")).toHaveLength(6);
  });

  test("keeps the homepage available when MongoDB authentication fails", async () => {
    vi.mocked(getMongoDb).mockRejectedValueOnce(new Error("bad auth"));

    const { container } = render(await Home());

    expect(container.querySelector("#testimonials")).toHaveTextContent(
      "Lumivale keeps growth focused on the channels that can actually bring users, awareness, and website traffic.",
    );
    expect(
      within(container.querySelector("#testimonials") as HTMLElement).getAllByText(
        "Video placeholder",
      ),
    ).toHaveLength(3);
  });

  test("renders at least five collapsible FAQs", async () => {
    const { container } = render(await Home());
    const faqSection = container.querySelector("#faqs");

    if (!faqSection) {
      throw new Error("Expected FAQ section to render");
    }

    const faqItems = Array.from(faqSection.querySelectorAll("details"));
    const [firstFaq] = faqItems;

    expect(faqItems.length).toBeGreaterThanOrEqual(5);
    expect(faqSection.querySelectorAll("summary")).toHaveLength(faqItems.length);
    expect(faqSection.querySelector("article")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "FAQ" })).toBeInTheDocument();
    expect(
      within(faqSection as HTMLElement).getByText(
        "Everything you need to know about Lumivale and how we help grow your customer channels.",
      ),
    ).toBeInTheDocument();
    expect(firstFaq).toHaveAttribute("open");
    expect(firstFaq).toHaveClass(
      "border-b",
      "border-[var(--lumivale-line)]",
      "py-5",
      "sm:py-6",
    );
    expect(firstFaq).not.toHaveClass("rounded-lg", "bg-[#fbfcff]", "shadow-[0_14px_40px_rgba(42,47,82,0.04)]");
    expect(
      within(faqSection as HTMLElement).getByText("How soon can Lumivale start?"),
    ).toBeInTheDocument();
    expect(
      within(faqSection as HTMLElement).getByText("Can we choose only one channel?"),
    ).toBeInTheDocument();
  });

  test("renders published FAQs from MongoDB", async () => {
    vi.mocked(getPublishedFaqs).mockResolvedValueOnce([
      {
        id: "faq-1",
        question: "What does Lumivale actually handle?",
        answer: "Lumivale supports outreach, content, and awareness execution.",
        sortOrder: 1,
        status: "published",
        createdAt: new Date("2026-05-03T08:00:00.000Z"),
        updatedAt: new Date("2026-05-03T08:00:00.000Z"),
      },
      {
        id: "faq-2",
        question: "Can we start small?",
        answer: "Yes. Start with one focused channel and expand later.",
        sortOrder: 2,
        status: "published",
        createdAt: new Date("2026-05-03T08:01:00.000Z"),
        updatedAt: new Date("2026-05-03T08:01:00.000Z"),
      },
    ]);

    const { container } = render(await Home());
    const faqSection = container.querySelector("#faqs");

    expect(faqSection).toHaveTextContent("What does Lumivale actually handle?");
    expect(faqSection).toHaveTextContent(
      "Lumivale supports outreach, content, and awareness execution.",
    );
    expect(faqSection).toHaveTextContent("Can we start small?");
    expect(faqSection).not.toHaveTextContent("How soon can Lumivale start?");
  });
});
