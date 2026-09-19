import styles from "@/components/service-detail.module.css";
import Link from "next/link";
import { ServiceExamplePlatforms } from "@/components/service-example-platforms";
import { notFound } from "next/navigation";

import {
  getDefaultServices,
  getPublishedServiceBySlugForSite,
  getPublishedServicesForSite,
} from "@/lib/services";
import { hasTrustedClientAccess } from "@/lib/trusted-client";



export async function generateStaticParams() {
  return getDefaultServices().map((service) => ({ slug: service.slug }));
}

export default async function PrivatePricingServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const hasTrustedAccess = await hasTrustedClientAccess();

  if (!hasTrustedAccess) {
    notFound();
  }

  const { slug } = await params;
  const [service, services] = await Promise.all([
    getPublishedServiceBySlugForSite(slug),
    getPublishedServicesForSite(),
  ]);

  if (!service) {
    notFound();
  }

  return (
    <div className={styles.page} data-nav-surface="light">
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <Link href="/pricing" className={styles.back}>&larr; All pricing</Link>
          <div className={styles.pricingHero}>
            <div><p className={styles.eyebrow}>Lumivale / Monthly services</p><h1>{service.title}</h1><p className={styles.description}>{service.privateContent.heroDescription}</p></div>
            <aside className={styles.ratePanel} aria-label="Service rates">
              <p className={styles.rateEyebrow}>Your investment</p>
              <dl>{service.privateContent.pricingLines.map((line, index) => <div key={`${line.label}-${index}`}><dt>{line.label}</dt><dd>{line.value}</dd></div>)}</dl>
              <p className={styles.rateNote}>Focused support for your next growth channel.</p>
            </aside>
          </div>
          <nav aria-label="Lumivale Services" className={styles.serviceNav}>
            {services.map((item) => <Link key={item.slug} href={`/pricing/${item.slug}`} aria-current={item.slug === service.slug ? "page" : undefined}>{item.title}</Link>)}
          </nav>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="examples-title">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>From plan to practice</p><h2 id="examples-title">The work in action.</h2></div><p className={styles.muted}>Explore the formats and execution behind this service.</p></div>
          <ServiceExamplePlatforms content={service.privateContent} />
        </div>
      </section>
    </div>
  );
}
