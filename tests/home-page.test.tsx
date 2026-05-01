import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import Home from "@/app/page";
import { getAllCaseStudies } from "@/lib/case-studies";

describe("home page", () => {
  test("renders the premium landing sections in order", async () => {
    const { container } = render(await Home());

    const sections = Array.from(container.querySelectorAll("section"));

    expect(sections.map((section) => section.getAttribute("id"))).toEqual([
      "hero",
      "proof",
      "services",
      "results",
      "testimonials",
      "faqs",
      "conversion",
    ]);
  });

  test("renders production homepage copy and a seeded case study link", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Launch a premium website that turns trust into booked calls/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Lumivale builds modern websites, message systems, and conversion paths for service brands that need to look credible before the first sales call.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Backed by strategy, design, and launch systems")).toBeInTheDocument();

    const [featuredStudy] = getAllCaseStudies();
    expect(screen.getByRole("link", { name: featuredStudy.title })).toHaveAttribute(
      "href",
      `/case-studies/${featuredStudy.slug}`,
    );
  });
});
