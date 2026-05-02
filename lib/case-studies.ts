export type CaseStudy = {
  slug: string;
  title: string;
  category: string;
  headline: string;
  summary: string;
  challenge: string;
  solution: string;
  outcomes: string[];
  metrics: Array<{
    value: string;
    label: string;
  }>;
};

const caseStudies: CaseStudy[] = [
  {
    slug: "comment-awareness-sprint",
    title: "Comment Awareness Sprint",
    category: "Awareness",
    headline: "100-140 targeted comments per month",
    summary: "A focused comment campaign built to show up in relevant Reddit, Quora, and X conversations.",
    challenge: "The brand needed early awareness without committing to a large paid media or agency program.",
    solution: "Lumivale mapped relevant threads, shaped simple talking points, and supported consistent comment activity.",
    outcomes: [
      "Clearer channel focus",
      "Consistent conversation coverage",
      "More repeatable awareness activity",
    ],
    metrics: [
      { value: "100-140", label: "comments per month" },
      { value: "8", label: "optional monthly posts" },
    ],
  },
  {
    slug: "creator-content-launch",
    title: "Creator Content Launch",
    category: "Content",
    headline: "30-60 short-form videos per month",
    summary: "A UGC and creator collaboration setup designed to increase content output around a young brand.",
    challenge: "The team needed more short-form content and creator coverage without building an internal media operation.",
    solution: "Lumivale structured UGC publishing and creator collaboration outreach around clear monthly activity.",
    outcomes: [
      "Defined content cadence",
      "Creator outreach pipeline",
      "Brand-specific publishing focus",
    ],
    metrics: [
      { value: "30-60", label: "short-form videos" },
      { value: "5-10", label: "creator collaboration deals" },
    ],
  },
  {
    slug: "outbound-pipeline-setup",
    title: "Outbound Pipeline Setup",
    category: "Outbound",
    headline: "LinkedIn and B2B email activity in one system",
    summary: "A LinkedIn and B2B email campaign structure for direct communication with targeted users.",
    challenge: "The team needed a practical outbound system with clear targeting, setup, and daily activity.",
    solution: "Lumivale organized LinkedIn outreach, inbox setup, domains, lead generation, and email sending structure.",
    outcomes: [
      "Targeted outreach foundation",
      "Cleaner inbox and domain setup",
      "Repeatable direct communication",
    ],
    metrics: [
      { value: "15-20/day", label: "LinkedIn connections" },
      { value: "60/day", label: "B2B emails sent" },
    ],
  },
];

export function getAllCaseStudies() {
  return caseStudies;
}

export function getCaseStudyBySlug(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
