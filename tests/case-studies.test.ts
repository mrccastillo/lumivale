import { describe, expect, test } from "vitest";

import {
  getAllCaseStudies,
  getCaseStudyBySlug,
} from "@/lib/case-studies";
import { generateStaticParams } from "@/app/case-studies/[slug]/page";

describe("case studies data", () => {
  test("lists seeded case studies for previews and index pages", () => {
    const studies = getAllCaseStudies();

    expect(studies.length).toBeGreaterThan(1);
    expect(studies.every((study) => study.slug && study.title)).toBe(true);
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
});
