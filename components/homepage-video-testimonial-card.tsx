"use client";

import { useState } from "react";

type HomepageVideoTestimonialCardProps = {
  testimonial: {
    personName: string;
    personTitle: string;
    quote: string;
    videoFileId: string;
    placeholder?: boolean;
  };
};

export function HomepageVideoTestimonialCard({
  testimonial,
}: HomepageVideoTestimonialCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const showOverlay = testimonial.placeholder || !isPlaying;

  return (
    <article
      data-testid="homepage-video-testimonial"
      className="overflow-hidden rounded-[18px] border border-white/5 bg-[#111111] text-left shadow-[0_18px_40px_rgba(0,0,0,0.26)]"
    >
      <div className="relative overflow-hidden bg-[#0b0b0b]">
        {testimonial.videoFileId ? (
          <video
            controls
            preload="metadata"
            src={`/api/testimonial-videos/${testimonial.videoFileId}`}
            className="aspect-[9/13] w-full bg-black object-cover"
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
        ) : (
          <div className="grid aspect-[9/13] w-full place-items-center bg-[linear-gradient(180deg,#202020_0%,#111111_100%)] p-6">
            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/28 text-xl text-white/90">
                &gt;
              </span>
              <p className="mt-4 text-sm font-medium text-white/88">Video placeholder</p>
              <p className="mt-2 text-xs leading-6 text-white/56">
                Client clip preview
              </p>
            </div>
          </div>
        )}

        {showOverlay ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.82))] p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[1.05rem] font-semibold text-white">{testimonial.personName}</p>
                {testimonial.personTitle ? (
                  <p className="mt-1 text-sm text-white/78">{testimonial.personTitle}</p>
                ) : null}
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-base text-black shadow-[0_10px_20px_rgba(0,0,0,0.22)]">
                &gt;
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
