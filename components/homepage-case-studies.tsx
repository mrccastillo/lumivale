import Link from "next/link";
import type { CaseStudy } from "@/lib/case-studies";
import { safeImageUrl } from "@/lib/case-study-story";
import styles from "./homepage-concept.module.css";
import { CaseStudyCarousel } from "./case-study-carousel";

export function HomepageCaseStudies({ caseStudies }: { caseStudies: CaseStudy[] }) {
  return <CaseStudyCarousel>{caseStudies.map((study) => (
    <article className={styles.case} key={study.slug}>
      <div className={styles.caseMedia}>
        {study.cover && safeImageUrl(study.cover.url) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={study.cover.url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1000,c_limit/")} alt={study.cover.alt} width={1000} height={700} loading="lazy" />
        ) : <div className={styles.caseFallback} aria-hidden="true"><span className={styles.caseInitial}>{study.title.slice(0, 2)}</span></div>}
      </div>
      <div className={styles.caseCopy} data-scroll-reveal>
        <div className={styles.caseMeta}><p className={styles.caseTitle}>{study.title}</p><span className={styles.tag}>{study.category}</span></div>
        <h3>{study.headline}</h3>
        <p>{study.summary}</p>
        <div className={styles.caseMetrics}>{study.metrics.map((metric, index) => <div key={`${metric.label}-${index}`}><strong data-case-study-metric>{metric.value}</strong><p>{metric.label}</p></div>)}</div>
        <Link className={styles.textLink} href={`/case-studies/${study.slug}`} aria-label={`Read the full story: ${study.title}`}>Read the full story <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  ))}</CaseStudyCarousel>;
}
