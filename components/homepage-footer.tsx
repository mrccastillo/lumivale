import Link from "next/link";
import type { CSSProperties } from "react";
import type { SiteContent } from "@/lib/site-content-defaults";
import { Reveal } from "./reveal";
import styles from "./homepage-concept.module.css";

export function HomepageFooter({ content }: { content: SiteContent }) {
  const heading = content.footerCtaHeading;
  const lastSpace = heading.lastIndexOf(" ");
  // Reserve a full glyph width for custom names so even wide or non-Latin
  // characters fit. The standard wordmark keeps the reference's exact scale.
  const wordmarkSize = content.footerBrandName.toLowerCase() === "lumivale"
    ? 19.7
    : Math.min(19.7, 90 / Math.max(Array.from(content.footerBrandName).length, 1));
  const wordmarkStyle = { "--wordmark-size": `${wordmarkSize}vw` } as CSSProperties;
  return <section id="conversion" data-nav-surface="dark" className={styles.closing}>
    <div className={styles.wrap}>
      <Reveal data-testid="conversion-reveal" className={styles.closingTop}>
        <div><p className={styles.eyebrow}>{content.footerCtaPrompt}</p><h2>{lastSpace >= 0 ? heading.slice(0, lastSpace + 1) : ""}<span>{heading.slice(lastSpace + 1)}</span></h2></div>
        <a className={styles.button} href={content.footerCtaButtonUrl} target="_blank" rel="noopener noreferrer">{content.footerCtaButtonText}<span className={styles.arrow} aria-hidden="true">↗</span></a>
      </Reveal>
    </div>
    <footer aria-label="Site footer" data-theme="dark">
      <div className={styles.wrap}>
        <div className={styles.footerInfo}>
          <div><h3>{content.footerBrandName}</h3><p>{content.footerTagline}</p></div>
          <nav className={styles.footerNav} aria-label="Footer">
            <Link href={content.footerHomeUrl}>{content.footerHomeLabel}</Link>
            <Link href={content.footerAboutUrl}>{content.footerAboutLabel}</Link>
            <Link href={content.footerBlogsUrl}>{content.footerBlogsLabel}</Link>
          </nav>
          <div className={styles.footerContact}><p>{content.footerContactHeading}</p><a href={`mailto:${content.footerEmail}`}>{content.footerEmail}</a></div>
        </div>
        <div className={styles.closingBottom}>
          <p>{content.footerSiteLabel}</p>
          <div className={styles.footerLinks}>
            <a href={content.footerLinkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn <span aria-hidden="true">↗</span></a>
            <Link className={styles.footerUtility} href="/admin/login">Admin login</Link>
            <span>© {new Date().getFullYear()} {content.footerBrandName}</span>
          </div>
        </div>
        <p className={styles.footerNote}>{content.footerBottomText}</p>
      </div>
      <div className={styles.footerWord} style={wordmarkStyle} aria-hidden="true">{content.footerBrandName}</div>
    </footer>
  </section>;
}
