import Link from "next/link";

import type { CaseStudy } from "@/lib/case-studies";

type CaseStudyCardsProps = {
  caseStudies: CaseStudy[];
};

export function CaseStudyCards({
  caseStudies,
}: CaseStudyCardsProps) {
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-3">
        {caseStudies.map((study) => (
          <article
            key={study.slug}
            className="group flex min-h-[360px] flex-col rounded-lg border border-[var(--lumivale-line)] bg-white/95 p-6 shadow-[0_14px_40px_rgba(42,47,82,0.07)] transition hover:-translate-y-1 hover:border-[var(--lumivale-accent)] hover:shadow-[0_18px_48px_rgba(42,47,82,0.1)]"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="max-w-[14rem] text-base font-semibold leading-6 text-[var(--lumivale-ink)]">
                {study.title}
              </p>
              <span className="rounded-full border border-[var(--lumivale-line)] bg-[#f8fafc] px-3 py-1 text-[11px] font-medium text-[var(--lumivale-muted)]">
                {study.category}
              </span>
            </div>

            <div className="mt-5 border-t border-[var(--lumivale-line)] pt-5">
              <h2 className="text-xl font-semibold leading-snug text-[var(--lumivale-ink)]">
                {study.headline}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[var(--lumivale-muted)]">
                {study.summary}
              </p>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4 pt-7">
              {study.metrics.map((metric) => (
                <div key={`${study.slug}-${metric.label}`}>
                  <p
                    data-case-study-metric
                    className="text-2xl font-semibold tracking-normal text-[var(--lumivale-accent)]"
                  >
                    {metric.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-[var(--lumivale-muted)]">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={`/case-studies/${study.slug}`}
              aria-label={`Read the full story: ${study.title}`}
              className="mt-6 inline-flex w-fit rounded-full border border-[var(--lumivale-accent)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-accent)] transition group-hover:bg-[var(--lumivale-accent)] group-hover:text-[#010807] hover:bg-[var(--lumivale-accent)] hover:text-[#010807]"
            >
              Read the full story
            </Link>
          </article>
        ))}
      </div>

    </div>
  );
}
