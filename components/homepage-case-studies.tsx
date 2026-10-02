"use client";

import { useState } from "react";
import Link from "next/link";
import { GalleryPagination } from "./gallery-pagination";
import type { CaseStudy } from "@/lib/case-studies";
import { safeImageUrl } from "@/lib/case-study-story";
import styles from "./homepage-case-studies.module.css";

export function HomepageCaseStudies({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const [selectedPage, setPage] = useState(0);
  const pages = Math.ceil(caseStudies.length / 6);
  const page = Math.min(selectedPage, Math.max(0, pages - 1));
  if (!caseStudies.length) return null;

  return (
    <div className={styles.collection}>
      <div className={styles.collectionHeader}>
        <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
        <span className={styles.collectionLabel}>Selected case studies</span>
        <span className={styles.collectionCount}>{String(caseStudies.length).padStart(2, "0")} {caseStudies.length === 1 ? "story" : "stories"}</span>
      </div>
      <div className={styles.grid} key={page}>
        {caseStudies.slice(page * 6, (page + 1) * 6).map((study) => {
          const logo = study.logo && safeImageUrl(study.logo.url) ? study.logo : undefined;
          const media = logo ?? (study.cover && safeImageUrl(study.cover.url) ? study.cover : undefined);
          const identity = study.clientName || study.title;
          const initials = identity.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("");

          return (
            <article className={styles.card} key={study.slug}>
              <Link className={styles.cardLink} href={`/case-studies/${study.slug}`} aria-label={`Read the full story: ${study.title}`}>
              <div className={styles.identity}>
                <div className={styles.mark} data-logo={Boolean(logo)}>
                  {media ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_160,c_limit/")} alt={media.alt} width={48} height={48} loading="lazy" />
                  ) : <span aria-hidden="true">{initials}</span>}
                </div>
                <div className={styles.identityCopy}>
                  <h3 className={styles.name}>{identity}</h3>
                  <p className={styles.industry}>{study.industry || study.timeframe || "Case study"}</p>
                </div>
              </div>
              <span className={styles.category}>{study.category}</span>
              <dl className={styles.metrics} data-paired={study.metrics.length === 2 || study.metrics.length === 4}>
                {study.metrics.map((metric, index) => (
                  <div key={`${metric.label}-${index}`}>
                    <dt>{metric.label}</dt>
                    <dd data-case-study-metric>{metric.value}</dd>
                  </div>
                ))}
              </dl>
              </Link>
            </article>
          );
        })}
      </div>
      <div className={styles.collectionFooter}>
        <span>Discover the strategy behind each result.</span>
        <GalleryPagination label="case studies" page={page} pages={pages} onChange={setPage} />
      </div>
    </div>
  );
}
