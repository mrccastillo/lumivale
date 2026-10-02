import { ServiceExampleEmbed } from "./service-example-embed";
import styles from "./service-example-preview.module.css";
import Image from "next/image";
import type { ServiceExampleCard } from "@/lib/services";
import { getExamplePreview, safeExampleUrl } from "@/lib/service-example-preview";

const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--lumivale-accent)]";

export function ServiceExamplePreview({ card, showSource = true }: { card: ServiceExampleCard; showSource?: boolean }) {
  const isPhoto = card.exampleType === "photo";
  const preview = getExamplePreview(card.previewUrl);
  const image = safeExampleUrl(card.imageUrl);
  const imageDestination = isPhoto ? image?.href : preview?.href;
  return (
    <>
      {image && imageDestination ? (
        <figure className={styles.image}>
          <a href={imageDestination} target="_blank" rel="noopener noreferrer" className={`block ${focusClass}`}
            aria-label={`Open ${card.title}${isPhoto ? " full-size image" : ""} (opens in a new tab)`}>
            <Image src={image.href} alt={card.imageAlt || card.title} width={960} height={540} unoptimized className={styles.photo} />
          </a>
          {isPhoto && card.imageAlt ? <figcaption className="px-4 py-3 text-sm leading-6 text-[var(--lumivale-muted)]">{card.imageAlt}</figcaption> : null}
        </figure>
      ) : null}
      {!isPhoto && preview ? (
        <div className={styles.preview}>
          {!image && preview.embedUrl ? (
            <ServiceExampleEmbed key={preview.embedUrl} src={preview.embedUrl} title={`${preview.provider} preview: ${card.title}`} provider={preview.provider} portrait={preview.portrait} />
          ) : null}
          {showSource && <a href={preview.href} target="_blank" rel="noopener noreferrer" className={`${styles.source} ${focusClass}`}>
            <span className={styles.host}>{preview.host}</span>
            <span className={styles.open}>Open original <span aria-hidden="true">&#8599;</span><span className="sr-only">: {card.title} (opens in a new tab)</span></span>
          </a>}
        </div>
      ) : null}
    </>
  );
}
