import Link from "next/link";
import { getSiteContentForSite } from "@/lib/site-content";
import styles from "./about.module.css";

export default async function AboutPage() {
  const content = await getSiteContentForSite();
  const founders = ([1, 2, 3] as const).map((index) => ({
    id: index,
    name: content[`aboutFounder${index}Name`],
    role: content[`aboutFounder${index}Role`],
    image: content[`aboutFounder${index}Image`],
    summary: content[`aboutFounder${index}Summary`],
  })).filter((founder) => founder.name.trim());

  return (
    <div className={styles.page} data-nav-surface="light">
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}><span />{content.aboutEyebrow}</p>
          <h1>{content.aboutHeading}</h1>
          <div className={styles.heroFoot}><span className={styles.signature}>{content.brandName} / Our story</span><p>{content.aboutDescription}</p></div>
        </div>
      </section>
      <section className={styles.team} aria-labelledby="team-heading">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}><h2 id="team-heading">{content.aboutTeamHeading}</h2><p>{content.aboutTeamDescription}</p></div>
          <div className={styles.founders}>
            {founders.map((founder, index) => <article key={founder.id} className={styles.founder}>
              <div className={styles.portrait}>
                {founder.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={founder.image} alt={`${founder.name} portrait`} loading={index === 0 ? "eager" : "lazy"} width={640} height={800} />
                ) : <span className={styles.initials} aria-hidden="true">{founder.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</span>}
                <span className={styles.index}>0{index + 1}</span>
              </div>
              <div className={styles.profile}><p className={styles.role}>{founder.role}</p><h3>{founder.name}</h3><p className={styles.bio}>{founder.summary}</p></div>
            </article>)}
          </div>
        </div>
      </section>
      <section className={styles.approach} aria-labelledby="approach-heading">
        <div className={`${styles.wrap} ${styles.approachGrid}`}><p className={styles.eyebrow}>Our approach</p><div><h2 id="approach-heading">{content.aboutApproachHeading}</h2><p>{content.aboutApproachDescription}</p><Link href="/#services" scroll={false}>Explore our services <span aria-hidden="true">&#8599;</span></Link></div></div>
      </section>
    </div>
  );
}
