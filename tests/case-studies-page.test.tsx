import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import CaseStudiesPage from "@/app/case-studies/page";
import { getAllCaseStudies } from "@/lib/case-studies";

describe("case studies page", () => {
  test("renders the measured impact card layout", async () => {
    const { container } = render(await CaseStudiesPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Measured Growth, Built with Lumivale",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Explore our success stories across awareness, content, and outbound strategies with real client outcomes backed by consistent and measurable growth.",
      ),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("article")).toHaveLength(3);

    const [firstCard] = Array.from(container.querySelectorAll("article"));
    expect(firstCard).toHaveClass("min-h-[360px]", "shadow-[0_14px_40px_rgba(42,47,82,0.07)]");
    expect(firstCard).not.toHaveClass("min-h-[420px]", "shadow-[0_18px_52px_rgba(42,47,82,0.1)]");

    const firstHeadline = firstCard.querySelector("h2");
    const firstMetric = firstCard.querySelector("[data-case-study-metric]");
    expect(firstHeadline).toHaveClass("text-xl");
    expect(firstMetric).toHaveClass("text-2xl");

    for (const study of getAllCaseStudies()) {
      expect(screen.getByText(study.category)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: study.headline }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: `Read the full story: ${study.title}` }),
      ).toHaveAttribute("href", `/case-studies/${study.slug}`);
    }

    expect(screen.queryByRole("link", { name: "Book a call" })).not.toBeInTheDocument();
  });
});
