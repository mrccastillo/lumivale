import { notFound } from "next/navigation";

import {
  getPublishedCaseStudiesForSite,
  getPublishedCaseStudyBySlugForSite,
} from "@/lib/case-studies";

export async function generateStaticParams() {
  const studies = await getPublishedCaseStudiesForSite();

  return studies.map((study) => ({ slug: study.slug }));
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = await getPublishedCaseStudyBySlugForSite(slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-[54px] pt-32">
      <header className="space-y-4">
        <h1 className="text-3xl font-medium text-stone-900">{caseStudy.title}</h1>
        <p className="max-w-2xl text-stone-600">{caseStudy.summary}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-stone-900">Challenge</h2>
        <p className="text-stone-600">{caseStudy.challenge}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-stone-900">Solution</h2>
        <p className="text-stone-600">{caseStudy.solution}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-stone-900">Outcomes</h2>
        <ul className="list-disc space-y-2 pl-5 text-stone-600">
          {caseStudy.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
