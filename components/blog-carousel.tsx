"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./public-listing.module.css";

export function BlogCarousel({ children }: { children: ReactNode }) {
  const cards = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ index: 0, visible: 2 });
  const count = cards.length - 1;
  const canNavigate = count > position.visible;
  const maxIndex = Math.max(0, count - position.visible);
  const index = Math.min(position.index, maxIndex);

  function syncPosition() {
    const element = track.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (!element || !first) return;
    const stride = first.offsetWidth + 32;
    setPosition({
      index: Math.round(element.scrollLeft / stride),
      visible: Math.max(1, Math.round((element.clientWidth + 32) / stride)),
    });
  }

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(syncPosition);
    observer.observe(element);
    return () => observer.disconnect();
  }, [count]);

  function navigate(direction: number) {
    const element = track.current;
    if (!element || !canNavigate) return;
    const next = direction > 0
      ? index >= maxIndex ? 0 : Math.min(index + position.visible, maxIndex)
      : index === 0 ? maxIndex : Math.max(0, index - position.visible);
    const first = element.firstElementChild as HTMLElement;
    const target = element.children[next] as HTMLElement;
    element.scrollTo({ left: target.offsetLeft - first.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return <>
    {cards[0]}
    {count > 0 && <div className={styles.blogCarousel} role="region" aria-label="More articles" aria-roledescription="carousel">
      <div className={styles.blogTrack} ref={track} onScroll={syncPosition} tabIndex={canNavigate ? 0 : undefined}
        aria-label="Blog slides" onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault(); navigate(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}>
        {cards.slice(1).map((card, i) => <div className={styles.blogSlide} key={i} role="group"
          aria-roledescription="slide" aria-label={`Article ${i + 1} of ${count}`}>{card}</div>)}
      </div>
      {canNavigate && <div className={styles.blogControls}>
        <button type="button" aria-label="Previous articles" onClick={() => navigate(-1)}>&larr;</button>
        <p role="status" aria-live="polite" aria-atomic="true">Articles {index + 1}{position.visible > 1 ? `–${Math.min(index + position.visible, count)}` : ""} of {count}</p>
        <button type="button" aria-label="Next articles" onClick={() => navigate(1)}>&rarr;</button>
      </div>}
    </div>}
  </>;
}
