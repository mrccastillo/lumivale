import Link from "next/link";
import styles from "@/components/public-listing.module.css";
import { notFound } from "next/navigation";

import { getPublishedServicesForSite } from "@/lib/services";
import { hasTrustedClientAccess } from "@/lib/trusted-client";

export default async function PricingPage() {
  const hasTrustedAccess = await hasTrustedClientAccess();

  if (!hasTrustedAccess) {
    notFound();
  }

  const services = await getPublishedServicesForSite();

  return (
    <div className={styles.page} data-nav-surface="light">
      <header className={`${styles.wrap} ${styles.hero}`}>
        <p className={styles.eyebrow}>Lumivale / Monthly services</p>
        <div className={styles.heroRow}>
          <h1>Pricing<span aria-hidden="true">.</span></h1>
          <p>Simple monthly pricing for focused growth support across Lumivale&apos;s core service channels.</p>
        </div>
      </header>
      <section className={`${styles.wrap} ${styles.pricing}`} aria-label="Monthly services">
        <div className={styles.rateHeader}>
          <div><h2>Monthly services</h2><p>Current private monthly rates for approved client discussions.</p></div>
          <span className={styles.eyebrow}>Rates</span>
        </div>
        <div className={styles.rates}>
          {services.map((service, index) => (
            <article key={service.slug} className={styles.rate}>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.serviceCopy}>
                <h2>{service.title}</h2>
                <p>{service.summary}</p>
              </div>
              <div className={styles.price}>
                <p className={styles.eyebrow}>Monthly rate</p>
                <p className={styles.amount}>{service.privateContent.pricePreview}</p>
                <Link href={`/pricing/${service.slug}`} className={styles.textLink}>View more <span aria-hidden="true">&#8599;</span></Link>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.pricingNote}>Final scope can still shift after a call if you need bundled support, custom pacing, or a narrower monthly execution focus.</p>
      </section>
    </div>
  );
}
