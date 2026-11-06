"use client";

type HomepageVideoTestimonialCardProps = {
  testimonial: {
    personName: string;
    personTitle: string;
    imageUrl?: string;
    quote: string;
    videoUrl: string;
    placeholder?: boolean;
  };
};

export function HomepageVideoTestimonialCard({
  testimonial,
}: HomepageVideoTestimonialCardProps) {
  return (
    <article
      data-testid="homepage-video-testimonial"
      className="w-full max-w-[224px] min-w-0 text-left sm:max-w-[238px]"
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-colors duration-200 hover:border-white/25 motion-reduce:transition-none">
        {testimonial.videoUrl ? (
          <video
            aria-label={`Video testimonial from ${testimonial.personName}`}
            controls
            playsInline
            preload="metadata"
            src={testimonial.videoUrl}
            className="block aspect-[9/16] w-full bg-black object-contain"
          />
        ) : (
          <div className="grid aspect-[9/16] w-full place-items-center bg-[#111111] p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-white/80">Video placeholder</p>
              <p className="mt-2 text-xs leading-6 text-white/50">Client clip preview</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-start gap-3 px-1 pt-4">
        {testimonial.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={testimonial.imageUrl} alt="" loading="lazy" className="size-10 shrink-0 rounded-full border border-white/10 object-cover" />
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-white">{testimonial.personName}</p>
          {testimonial.personTitle ? (
            <p className="mt-1 text-xs leading-5 text-white/60 [overflow-wrap:anywhere]">{testimonial.personTitle}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
