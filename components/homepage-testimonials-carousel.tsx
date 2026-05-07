"use client";

import { useState } from "react";

type HomepageTestimonialCardData = {
  id: string;
  personName: string;
  personTitle: string;
  quote: string;
  placeholder?: boolean;
};

type HomepageTestimonialsCarouselProps = {
  testimonials: HomepageTestimonialCardData[];
};

const PAGE_SIZE = 4;

export function HomepageTestimonialsCarousel({
  testimonials,
}: HomepageTestimonialsCarouselProps) {
  const pages = chunkTestimonials(testimonials, PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState(0);
  const activePage = pages[pageIndex] ?? [];
  const canPaginate = pages.length > 1;

  function goToPreviousPage() {
    setPageIndex((current) => (current === 0 ? pages.length - 1 : current - 1));
  }

  function goToNextPage() {
    setPageIndex((current) => (current === pages.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="mt-10 md:mt-12">
      <div className="grid items-center gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <PagerButton
          direction="previous"
          hidden={!canPaginate}
          onClick={goToPreviousPage}
        />

        <div
          data-testid="testimonials-text-grid"
          className="grid gap-3 md:grid-cols-2"
        >
          {activePage.map((testimonial) => (
            <HomepageTextTestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
            />
          ))}
        </div>

        <PagerButton
          direction="next"
          hidden={!canPaginate}
          onClick={goToNextPage}
        />
      </div>

      {canPaginate ? (
        <p className="mt-5 text-center text-xs font-medium uppercase tracking-[0.22em] text-white/40">
          Page {pageIndex + 1} of {pages.length}
        </p>
      ) : null}
    </div>
  );
}

function HomepageTextTestimonialCard({
  testimonial,
}: {
  testimonial: HomepageTestimonialCardData;
}) {
  return (
    <article
      data-testid="homepage-text-testimonial"
      className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 text-left shadow-[0_16px_36px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition duration-300 hover:border-white/12 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))]"
    >
      <blockquote className="text-[0.95rem] leading-7 text-[#f1f1f1]">
        &quot;{testimonial.quote}&quot;
      </blockquote>

      <div className="mt-5 border-t border-white/6 pt-4">
        <p className="text-base font-semibold text-white">{testimonial.personName}</p>
        {testimonial.personTitle ? (
          <p className="mt-1 text-sm text-white/62">{testimonial.personTitle}</p>
        ) : null}
        {testimonial.placeholder ? (
          <p className="mt-3 text-[11px] font-medium text-white/38">
            Placeholder
          </p>
        ) : null}
      </div>
    </article>
  );
}

function PagerButton({
  direction,
  hidden,
  onClick,
}: {
  direction: "next" | "previous";
  hidden: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "next" ? "Next testimonials" : "Previous testimonials"}
      onClick={onClick}
      className={`grid size-12 place-items-center rounded-full border border-white/8 bg-[#0d0d0d] text-white transition hover:border-white/18 hover:bg-[#141414] ${
        hidden ? "pointer-events-none opacity-0" : ""
      }`}
    >
      <span aria-hidden="true" className="text-2xl leading-none">
        {direction === "next" ? ">" : "<"}
      </span>
    </button>
  );
}

function chunkTestimonials(testimonials: HomepageTestimonialCardData[], pageSize: number) {
  const pages: HomepageTestimonialCardData[][] = [];

  for (let index = 0; index < testimonials.length; index += pageSize) {
    pages.push(testimonials.slice(index, index + pageSize));
  }

  return pages;
}
