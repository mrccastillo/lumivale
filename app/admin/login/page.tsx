import Link from "next/link";
import { getSiteContentForSite } from "@/lib/site-content";
import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export default async function AdminLoginPage({ searchParams }: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const { error } = await searchParams;
  const content = await getSiteContentForSite();
  return (
    <main className={styles.page}>
      <aside className={styles.brandPanel} aria-label={content.brandName}>
        <Link href="/" className={styles.brand} aria-label={`${content.brandName} home`}>
          {content.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.logoUrl} alt="" className={styles.logoImage} />
          ) : <span className={styles.letterMark} aria-hidden="true">{content.logoText}</span>}
          <span>{content.brandName}</span>
        </Link>
        <div className={styles.brandCenter} aria-hidden="true">
          <div className={styles.emblem}>
            {content.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={content.logoUrl} alt="" className={styles.emblemImage} />
            ) : <span className={styles.emblemLetter}>{content.logoText}</span>}
          </div>
          <span className={styles.centerLabel}>THE {content.brandName.toUpperCase()} WORKSPACE</span>
        </div>
        <div className={styles.brandBottom}>
          <p>Light up your growth.</p>
          <span>FOCUS. CLARITY. MOMENTUM.</span>
        </div>
        <div className={styles.wordmark} aria-hidden="true">{content.brandName.toLowerCase()}</div>
      </aside>
      <section className={styles.workspace} aria-labelledby="login-heading">
        <header className={styles.topbar}>
          <span className={styles.portalLabel}><span /> Staff portal</span>
          <Link href="/" className={styles.backLink}><span aria-hidden="true">&#8592;</span> Back to website</Link>
        </header>
        <div className={styles.formArea}>
          <div className={styles.formHeading}>
            <p className={styles.eyebrow}>YOUR WORKSPACE</p>
            <h1 id="login-heading">Admin Login</h1>
            <p className={styles.description}>Sign in to manage your site and content.</p>
          </div>
          <LoginForm invalid={error === "invalid"} />
          <p className={styles.accessNote}><svg width="13" height="15" viewBox="0 0 16 18" fill="none" aria-hidden="true"><rect x="2" y="7" width="12" height="9" rx="2" stroke="currentColor"/><path d="M5 7V5a3 3 0 0 1 6 0v2M8 10v3" stroke="currentColor"/></svg> Access for authorized team members.</p>
        </div>
        <footer className={styles.footer}><span>{content.brandName}</span><span>Content &amp; operations</span></footer>
      </section>
    </main>
  );
}
