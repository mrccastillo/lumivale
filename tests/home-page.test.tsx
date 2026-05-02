import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import Home from "@/app/page";
import { getAllCaseStudies } from "@/lib/case-studies";
import { getAllServices } from "@/lib/services";

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

  test("reduces vertical section padding while leaving the hero unchanged", async () => {
    const { container } = render(await Home());

    expect(container.querySelector("#hero")).toHaveClass("pb-8", "pt-20");
    expect(container.querySelector("#proof")).toHaveClass("pb-[68px]", "pt-0");
    expect(container.querySelector("#services")).toHaveClass("py-24");
    expect(container.querySelector("#case-studies")).toHaveClass("py-24");
    expect(container.querySelector("#testimonials")).toHaveClass("py-24");
    expect(container.querySelector("#faqs")).toHaveClass("py-24");
    expect(container.querySelector("#conversion")).toHaveClass("py-24");
  });

  test("renders Lumivale growth copy and a seeded case study link", async () => {
    render(await Home());

    const heroHeading = screen.getByRole("heading", {
      level: 1,
      name: /Light up your growth with simple execution systems/i,
    });
    expect(heroHeading).toBeInTheDocument();
    expect(heroHeading).toHaveClass("text-3xl", "sm:text-4xl", "lg:text-5xl");
    expect(heroHeading).not.toHaveClass("text-4xl", "sm:text-5xl", "lg:text-6xl");
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
            link.getAttribute("href") ===
            "https://calendly.com/lumivale/discovery-call",
        ),
    ).toBe(true);

    const [featuredStudy] = getAllCaseStudies();
    expect(
      screen.getByRole("link", {
        name: `Read the full story: ${featuredStudy.title}`,
      }),
    ).toHaveAttribute("href", `/case-studies/${featuredStudy.slug}`);
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
    expect(firstFaq).toHaveClass("border-b", "border-[var(--lumivale-line)]", "py-6");
    expect(firstFaq).not.toHaveClass("rounded-lg", "bg-[#fbfcff]", "shadow-[0_14px_40px_rgba(42,47,82,0.04)]");
    expect(
      within(faqSection as HTMLElement).getByText("How soon can Lumivale start?"),
    ).toBeInTheDocument();
    expect(
      within(faqSection as HTMLElement).getByText("Can we choose only one channel?"),
    ).toBeInTheDocument();
  });
});
