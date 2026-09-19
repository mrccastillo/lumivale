"use client";

import styles from "./service-detail.module.css";
import { useId, useRef, useState } from "react";
import type { PrivateServiceContent } from "@/lib/services";
import { normalizeExamplePlatforms } from "@/lib/service-example-platforms";
import { ServiceExamplePreview } from "@/components/service-example-preview";

export function ServiceExamplePlatforms({ content }: { content: PrivateServiceContent }) {
  const normalized = normalizeExamplePlatforms(content);
  const platforms = normalized.examplePlatforms.filter((platform) => normalized.exampleCards.some((card) => card.platformId === platform.id));
  const [selection, setSelection] = useState(platforms[0]?.id);
  const selected = platforms.some((platform) => platform.id === selection) ? selection : platforms[0]?.id;
  const [focus, setFocus] = useState(selected);
  const focused = platforms.some((platform) => platform.id === focus) ? focus : selected;
  const prefix = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  if (!platforms.length) return <p className="text-sm text-[var(--lumivale-muted)]">No examples available yet.</p>;

  return <div className="min-w-0">
    <div role="tablist" aria-label="Example platforms" className={styles.platformTabs}>
      {platforms.map((platform, index) => <button
        key={platform.id}
        ref={(element) => { tabs.current[index] = element; }}
        type="button"
        role="tab"
        id={`${prefix}-tab-${platform.id}`}
        aria-controls={`${prefix}-panel-${platform.id}`}
        aria-selected={selected === platform.id}
        tabIndex={focused === platform.id ? 0 : -1}
        onFocus={() => setFocus(platform.id)}
        onClick={() => setSelection(platform.id)}
        onKeyDown={(event) => {
          let next: number;
          if (event.key === "ArrowRight") next = (index + 1) % platforms.length;
          else if (event.key === "ArrowLeft") next = (index + platforms.length - 1) % platforms.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = platforms.length - 1;
          else return;
          event.preventDefault();
          tabs.current[next]?.focus();
        }}
        className={styles.platformTab}
      >{platform.name}</button>)}
    </div>
    <div key={selected} role="tabpanel" tabIndex={0} id={`${prefix}-panel-${selected}`} aria-labelledby={`${prefix}-tab-${selected}`} className={styles.examples}>
      {normalized.exampleCards.filter((card) => card.platformId === selected).map((card) => (
              <article
                key={card.id}
                className={styles.example}
              >
                <span className={styles.eyebrow}>
                  {card.tag}
                </span>
                <h3>
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
                  {card.summary}
                </p>
                <ServiceExamplePreview card={card} />
                {card.videoUrl ? (
                  <div className="mt-5 overflow-hidden rounded-xl border border-[var(--lumivale-line)] bg-white">
                    <video
                      controls
                      preload="metadata"
                      className="aspect-video w-full bg-black"
                      src={card.videoUrl}
                    />
                    {card.videoDescription ? (
                      <p className="px-4 py-3 text-sm leading-6 text-[var(--lumivale-muted)]">
                        {card.videoDescription}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </article>
      ))}
    </div>
  </div>;
}
