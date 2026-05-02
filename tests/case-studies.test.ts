import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  getAllCaseStudies,
  getCaseStudyBySlug,
} from "@/lib/case-studies";
import CaseStudyDetailPage, {
  generateStaticParams,
} from "@/app/case-studies/[slug]/page";

describe("case studies data", () => {
  test("lists seeded case studies for previews and index pages", () => {
    const studies = getAllCaseStudies();

    expect(studies.length).toBeGreaterThan(1);
    expect(studies.every((study) => study.slug && study.title)).toBe(true);
    expect(studies.map((study) => study.title)).toEqual([
      "Comment Awareness Sprint",
      "Creator Content Launch",
      "Outbound Pipeline Setup",
    ]);
    expect(JSON.stringify(studies)).not.toMatch(/Placeholder/i);
  });

  test("looks up a study by slug", () => {
    const [firstStudy] = getAllCaseStudies();

    expect(getCaseStudyBySlug(firstStudy.slug)).toEqual(firstStudy);
    expect(getCaseStudyBySlug("missing-study")).toBeUndefined();
  });

  test("generates static params for every seeded study", async () => {
    const params = await generateStaticParams();

    expect(params).toEqual(
      getAllCaseStudies().map((study) => ({ slug: study.slug })),
    );
  });

  test("adds fixed-navbar clearance on case study detail pages", async () => {
    const study = getCaseStudyBySlug("creator-content-launch");

    if (!study) {
      throw new Error("Expected seeded creator content launch case study");
    }

    const { container } = render(
      await CaseStudyDetailPage({
        params: Promise.resolve({ slug: study.slug }),
      }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: study.title }),
    ).toBeInTheDocument();
    expect(container.querySelector("article")).toHaveClass("pt-32", "pb-[54px]");
  });
});
