import Image from "next/image";
import type { ServiceExampleCard } from "@/lib/services";
import { getExamplePreview, safeExampleUrl } from "@/lib/service-example-preview";

const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--lumivale-accent)]";

export function ServiceExamplePreview({ card }: { card: ServiceExampleCard }) {
  const isPhoto = card.exampleType === "photo";
  const preview = getExamplePreview(card.previewUrl);
  const image = safeExampleUrl(card.imageUrl);
  const imageDestination = isPhoto ? image?.href : preview?.href;
  return (
    <>
      {image && imageDestination ? (
        <figure className="mt-5 overflow-hidden rounded-xl border border-[var(--lumivale-line)] bg-white">
          <a href={imageDestination} target="_blank" rel="noopener noreferrer" className={`block ${focusClass}`}
            aria-label={`Open ${card.title}${isPhoto ? " full-size image" : ""} (opens in a new tab)`}>
            <Image src={image.href} alt={card.imageAlt || card.title} width={960} height={540} unoptimized className="aspect-video w-full object-cover" />
          </a>
          {isPhoto && card.imageAlt ? <figcaption className="px-4 py-3 text-sm leading-6 text-[var(--lumivale-muted)]">{card.imageAlt}</figcaption> : null}
        </figure>
      ) : null}
      {!isPhoto && preview ? (
        <div className="mt-5 min-w-0 overflow-hidden rounded-xl border border-[var(--lumivale-line)] bg-white">
          {!image && preview.embedUrl ? (
            <iframe src={preview.embedUrl} title={`${preview.provider} preview: ${card.title}`} loading="lazy" allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
              className={`block w-full border-0 ${preview.portrait ? "h-[460px]" : "aspect-video min-h-[200px]"}`} />
          ) : null}
          <a href={preview.href} target="_blank" rel="noopener noreferrer" className={`block break-words p-4 text-sm transition hover:bg-[#f7f8fb] ${focusClass}`}>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-muted)]">{preview.provider}</span>
            <span className="mt-2 block font-semibold text-[var(--lumivale-ink)]">{preview.host}</span>
            <span className="mt-2 block text-xs text-[var(--lumivale-muted)]">Open original <span aria-hidden="true">↗</span><span className="sr-only">: {card.title} (opens in a new tab)</span></span>
          </a>
        </div>
      ) : null}
    </>
  );
}
