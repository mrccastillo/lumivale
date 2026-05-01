export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  outcomes: string[];
};

const caseStudies: CaseStudy[] = [
  {
    slug: "atelier-relaunch",
    title: "Atelier Relaunch",
    summary: "Placeholder summary for a premium retail relaunch engagement.",
    challenge: "Placeholder challenge describing a fragmented digital experience.",
    solution: "Placeholder solution focused on a structured website rebuild.",
    outcomes: [
      "Placeholder outcome one",
      "Placeholder outcome two",
      "Placeholder outcome three",
    ],
  },
  {
    slug: "harbor-growth",
    title: "Harbor Growth Sprint",
    summary: "Placeholder summary for a service business growth sprint.",
    challenge: "Placeholder challenge describing unclear positioning and low conversion.",
    solution: "Placeholder solution centered on sharper messaging and page flow.",
    outcomes: [
      "Placeholder outcome one",
      "Placeholder outcome two",
      "Placeholder outcome three",
    ],
  },
  {
    slug: "northstar-platform",
    title: "Northstar Platform Launch",
    summary: "Placeholder summary for a product launch support engagement.",
    challenge: "Placeholder challenge describing launch complexity across teams.",
    solution: "Placeholder solution combining launch structure and content systems.",
    outcomes: [
      "Placeholder outcome one",
      "Placeholder outcome two",
      "Placeholder outcome three",
    ],
  },
];

export function getAllCaseStudies() {
  return caseStudies;
}

export function getCaseStudyBySlug(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
