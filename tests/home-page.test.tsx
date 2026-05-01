import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import Home from "@/app/page";
import { getAllCaseStudies } from "@/lib/case-studies";

describe("home page", () => {
  test("renders the planned sections in order", async () => {
    const { container } = render(await Home());

    const sections = Array.from(container.querySelectorAll("main > section"));

    expect(sections.map((section) => section.getAttribute("id"))).toEqual([
      "hero",
      "case-studies",
      "services",
      "testimonials",
      "faqs",
    ]);
  });

  test("links case study previews to seeded detail pages", async () => {
    render(await Home());

    for (const study of getAllCaseStudies()) {
      expect(
        screen.getByRole("link", { name: study.title }),
      ).toHaveAttribute("href", `/case-studies/${study.slug}`);
    }
  });
});
