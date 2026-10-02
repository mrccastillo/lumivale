"use client";

import { useState } from "react";
import type { Reel } from "@/lib/reels";
import { GalleryPagination } from "./gallery-pagination";
import styles from "./homepage-reels.module.css";
export function HomepageReels({ reels }: { reels: Reel[] }) {
  const [selectedPage, setPage] = useState(0);
  const pages = Math.ceil(reels.length / 4);
  const page = Math.min(selectedPage, Math.max(0, pages - 1));
  if (!reels.length) return null;
  return <section className={styles.gallery} aria-label="Campaign reels">
    <div className={styles.grid} key={page}>
      {reels.slice(page * 4, (page + 1) * 4).map(reel => <article key={reel.id} className={styles.card}>
        <a className={styles.preview} href={reel.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${reel.title} on ${reel.platform} (opens in a new tab)`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={reel.thumbnailUrl} alt={reel.title} width={360} height={640} loading="lazy" />
          <span className={styles.platform}>{reel.platform}</span>
          <span className={styles.play} aria-hidden="true"><svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor"><path d="M3 2l11 7-11 7V2Z" /></svg></span>
        </a>
        <div className={styles.copy}>
          <h3>{reel.clientName}</h3>
          <p className={styles.title}>{reel.title}</p>
          <dl className={styles.metrics}>{(["views", "likes", "comments"] as const).filter(key => reel[key]).map(key => <div key={key}><dt>{key}</dt><dd>{reel[key]}</dd></div>)}</dl>
          <a className={styles.link} href={reel.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${reel.title} on ${reel.platform} (opens in a new tab)`}>View reel <span aria-hidden="true">&#8599;</span></a>
        </div>
      </article>)}
    </div>
    {pages > 1 && <div className={styles.pagination}><GalleryPagination label="reels" page={page} pages={pages} onChange={setPage} /></div>}
  </section>;
}
