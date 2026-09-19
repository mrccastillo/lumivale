import { notFound } from "next/navigation";
import { CaseStudyStory } from "@/components/case-study-story";
import { getPublishedCaseStudyBySlugForSite } from "@/lib/case-studies";

export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const study = await getPublishedCaseStudyBySlugForSite((await params).slug);
  return study
    ? {
        title: `${study.headline || study.title} | Lumivale`,
        description: study.summary,
      }
    : { title: "Case study not found | Lumivale", robots: { index: false } };
}
export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const study = await getPublishedCaseStudyBySlugForSite((await params).slug);
  if (!study) notFound();
  return <CaseStudyStory study={study} />;
}
