import { footerNavigation, footerSocials } from "@/lib/footer-links";
import Link from "next/link";
import type { SiteContent } from "@/lib/site-content-defaults";
import styles from "./homepage-footer.module.css";

export function HomepageFooter({ content }: { content: SiteContent }) {
  const navigation = footerNavigation(content);
  const socials = footerSocials(content);
  return (
    <section id="conversion" data-nav-surface="dark" className={styles.closing}>
      <div className={styles.wrap}>
        <div data-testid="conversion-reveal" className={styles.invitation}>
          <div className={styles.invitationCopy}>
            <h2>{content.footerCtaHeading}</h2>
          </div>
          <a className={styles.booking} href={content.footerCtaButtonUrl} target="_blank" rel="noopener noreferrer">
            {content.footerCtaButtonText}<span aria-hidden="true">&#8599;</span>
          </a>
        </div>
        <footer aria-label="Site footer" data-theme="dark">
          <div className={styles.directory}>
            <div className={styles.brand}>
              <h3>{content.footerBrandName}<span aria-hidden="true">.</span></h3>
              <p>{content.footerTagline}</p>
            </div>
            {navigation.length > 0 && <nav className={styles.navigation} aria-label="Footer">
              <p className={styles.label}>Explore</p>
              {navigation.map((link, index) => <Link key={`${link.url}-${index}`} href={link.url}>{link.label}</Link>)}
            </nav>}
            <div className={styles.contact}>
              <p className={styles.label}>{content.footerContactHeading}</p>
              <a className={styles.email} href={`mailto:${content.footerEmail}`}>{content.footerEmail}<span aria-hidden="true">&#8599;</span></a>
              <div className={styles.socials}>{socials.map((link, index) => <a key={`${link.url}-${index}`} className={styles.social} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                {link.label}<span aria-hidden="true">&#8599;</span>
              </a>)}</div>
            </div>
          </div>
          <div className={styles.bottom}>
            <p>&copy; {new Date().getFullYear()} {content.footerBrandName}</p>
            <p>{content.footerSiteLabel}</p>
            <p>{content.footerBottomText}</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
