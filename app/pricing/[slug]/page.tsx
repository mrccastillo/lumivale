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
      <section className={styles.hero} data-nav-surface="dark">
        <div className={styles.wrap}>
          <nav aria-label="Lumivale Services" className={styles.serviceNav}>
            {services.map((item) => <Link key={item.slug} href={`/pricing/${item.slug}`} aria-current={item.slug === service.slug ? "page" : undefined}>{item.title}</Link>)}
          </nav>
          <Link href="/pricing" className={styles.back}>&larr; All pricing</Link>
          <div className={styles.pricingHero}>
            <div><p className={styles.eyebrow}>Lumivale / Monthly services</p><h1>{service.title}</h1><p className={styles.description}>{service.privateContent.heroDescription}</p></div>
            <aside className={styles.ratePanel} aria-label="Service rates">
              <dl>{service.privateContent.pricingLines.map((line, index) => <div key={`${line.label}-${index}`}><dt>{line.label}</dt><dd>{line.value}</dd></div>)}</dl>
            </aside>
          </div>

        </div>
      </section>
      <section className={styles.section} data-nav-surface="light" aria-labelledby="examples-title">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>From plan to practice</p><h2 id="examples-title">Examples of Our Work</h2></div></div>
          <ServiceExamplePlatforms content={service.privateContent} />
        </div>
      </section>
    </div>
  );
}
