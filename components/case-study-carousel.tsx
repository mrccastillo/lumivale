"use client";

import { Children, useRef, useState, type ReactNode } from "react";
import styles from "./homepage-concept.module.css";

export function CaseStudyCarousel({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const activeIndex = Math.min(index, Math.max(0, slides.length - 1));
  const canNavigate = slides.length > 1;

  function navigate(direction: number) {
    const element = track.current;
    if (!element || !canNavigate) return;
    const next = (activeIndex + direction + slides.length) % slides.length;
    const slide = element.children[next] as HTMLElement;
    element.scrollTo({
      left: slide.offsetLeft - (element.children[0] as HTMLElement).offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  if (!slides.length) return null;

  return <div role="region" aria-roledescription="carousel" aria-label="Case studies">
    <div ref={track} className={styles.caseTrack} tabIndex={canNavigate ? 0 : undefined}
      aria-label="Case study slides"
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault(); navigate(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onScroll={() => {
        const element = track.current;
        if (!element) return;
        const first = element.children[0] as HTMLElement;
        const nearest = Array.from(element.children).reduce((best, child, position) => {
          const distance = Math.abs((child as HTMLElement).offsetLeft - first.offsetLeft - element.scrollLeft);
          return distance < best.distance ? { position, distance } : best;
        }, { position: 0, distance: Infinity });
        setIndex(nearest.position);
      }}>
      {slides.map((slide, position) => <div key={position} className={styles.caseSlide}
        role="group" aria-roledescription="slide" aria-label={`${position + 1} of ${slides.length}`}>
        {slide}
      </div>)}
    </div>
    <div className={styles.caseControls}>
      <button type="button" aria-label="Previous case study" disabled={!canNavigate} onClick={() => navigate(-1)}><span aria-hidden="true">←</span></button>
      <p role="status" aria-live="polite" aria-atomic="true">Case study {activeIndex + 1} of {slides.length}</p>
      <button type="button" aria-label="Next case study" disabled={!canNavigate} onClick={() => navigate(1)}><span aria-hidden="true">→</span></button>
    </div>
  </div>;
}
