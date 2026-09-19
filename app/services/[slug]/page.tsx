import styles from "@/components/service-detail.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDefaultServices, getPublishedServiceBySlugForSite, getPublishedServicesForSite } from "@/lib/services";

export async function generateStaticParams() {
  return getDefaultServices().map((service) => ({ slug: service.slug }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, services] = await Promise.all([getPublishedServiceBySlugForSite(slug), getPublishedServicesForSite()]);

  if (!service) {
    notFound();
  }

  return (
    <div className={styles.page} data-nav-surface="light">
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <Link href="/#services" scroll={false} className={styles.back}>&larr; All services</Link>
          <p className={styles.eyebrow}>Lumivale / Services</p>
          <h1>{service.title}</h1>
          <p className={styles.description}>{service.description}</p>
          <nav aria-label="Lumivale Services" className={styles.serviceNav}>
            {services.map((item) => <Link key={item.slug} href={`/services/${item.slug}`} aria-current={item.slug === service.slug ? "page" : undefined}>{item.title}</Link>)}
          </nav>
        </div>
      </section>
      <section aria-labelledby="service-faqs-title" className={styles.section}>
        <div className={`${styles.wrap} ${styles.faqLayout}`}>
          <div><p className={styles.eyebrow}>A little more clarity</p><h2 id="service-faqs-title">Your questions,<br />answered.</h2><p className={styles.muted}>More about how {service.title.toLowerCase()} works.</p></div>
          <div className={styles.faqs}>
            {service.faqs?.length ? service.faqs.map((faq) => <details key={faq.id} name="service-faq">
              <summary><span>{faq.question}</span><span aria-hidden="true">+</span></summary>
              <p className="whitespace-pre-line">{faq.answer}</p>
            </details>) : <div className={styles.empty}><h3>Have a question?</h3><p>Let?s talk through what this service could look like for your team.</p><Link href="/#faqs" scroll={false} className={styles.textLink}>Explore our general FAQ <span aria-hidden="true">&#8599;</span></Link></div>}
          </div>
        </div>
      </section>
    </div>
  );
}
