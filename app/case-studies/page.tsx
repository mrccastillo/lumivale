import { CaseStudyCards } from "@/components/case-study-cards";
import { getAllCaseStudies } from "@/lib/case-studies";

export default function CaseStudiesPage() {
  const caseStudies = getAllCaseStudies();

  return (
    <section className="bg-[#f7f8fb] px-6 py-[68px] text-[var(--lumivale-ink)]">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold leading-tight">
            Measured Growth, Built with Lumivale
          </h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[var(--lumivale-muted)]">
            Explore our success stories across awareness, content, and outbound
            strategies with real client outcomes backed by consistent and measurable
            growth.
          </p>
        </div>

        <div className="mt-14">
          <CaseStudyCards caseStudies={caseStudies} />
        </div>
      </div>
    </section>
  );
}
