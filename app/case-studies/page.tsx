import Link from "next/link";

import { getAllCaseStudies } from "@/lib/case-studies";

export default function CaseStudiesPage() {
  const caseStudies = getAllCaseStudies();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold text-stone-900">Case Studies</h1>
      <p className="max-w-2xl text-stone-600">
        Placeholder archive page listing the shared seeded case-study content.
      </p>
      <div className="grid gap-6">
        {caseStudies.map((study) => (
          <article key={study.slug} className="rounded-[1.5rem] border border-stone-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-stone-900">
              <Link href={`/case-studies/${study.slug}`}>{study.title}</Link>
            </h2>
            <p className="mt-3 text-stone-600">{study.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
