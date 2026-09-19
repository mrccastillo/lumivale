"use client";

import { useEffect, useRef } from "react";
import { formatResultCount } from "@/lib/result-count";

export function ResultCount({ value }: { value: string }) {
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = text.current;
    if (!element || !/\d/.test(value)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;

    let frame = 0;
    let startedAt: number | undefined;
    const animate = (now: number) => {
      startedAt ??= now;
      const progress = Math.min((now - startedAt) / 1600, 1);
      element.textContent = formatResultCount(value, 1 - Math.pow(1 - progress, 3));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      element.textContent = formatResultCount(value, 0);
      frame = requestAnimationFrame(animate);
    }, { threshold: .5 });
    observer.observe(element);

    const finish = () => {
      if (!preference.matches) return;
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.textContent = value;
    };
    preference.addEventListener("change", finish);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", finish);
      element.textContent = value;
    };
  }, [value]);

  return (
    <span style={{ display: "inline-grid", fontVariantNumeric: "tabular-nums" }}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{value}</span>
      <span ref={text} aria-hidden="true" style={{ gridArea: "1 / 1" }}>{value}</span>
    </span>
  );
}
