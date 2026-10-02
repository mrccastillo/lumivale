import styles from "./service-example-preview.module.css";

export function ServiceExampleEmbed({ src, title, provider, portrait }: { src: string; title: string; provider: string; portrait?: boolean }) {
  const scrollable = ["X", "LinkedIn", "Instagram", "Facebook"].includes(provider);
  return <div className={styles.embedViewport} data-portrait={portrait || undefined} data-scrollable={scrollable || undefined}>
    <iframe src={src} title={title} loading="lazy" scrolling="auto"
      allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
      className={styles.embed} />
  </div>;
}
