/* eslint-disable @next/next/no-img-element */
import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import styles from "./case-study-story.module.css";
import {
  safeImageUrl,
  safeStoryUrl,
  storySections,
  type RichNode,
  type StoryImage,
  type StoryInput,
  type StorySection,
} from "@/lib/case-study-story";

export function StoryRichText({ node }: { node: RichNode }) {
  function render(n: RichNode, depth = 0): ReactNode {
    if (depth > 10) return null;
    const children = n.content?.map((child, i) => (
      <Fragment key={i}>{render(child, depth + 1)}</Fragment>
    ));
    if (n.type === "text")
      return (n.marks ?? []).reduce<ReactNode>((text, mark) => {
        if (mark.type === "bold") return <strong>{text}</strong>;
        if (mark.type === "italic") return <em>{text}</em>;
        if (mark.type === "underline") return <u>{text}</u>;
        if (
          mark.type === "link" &&
          typeof mark.attrs?.href === "string" &&
          safeStoryUrl(mark.attrs.href)
        )
          return (
            <a
              href={mark.attrs.href}
              className="font-medium text-emerald-700 underline underline-offset-4"
              target={mark.attrs.href.startsWith("/") ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              {text}
            </a>
          );
        return text;
      }, n.text);
    switch (n.type) {
      case "doc":
        return children;
      case "paragraph":
        return <p className="whitespace-pre-line">{children}</p>;
      case "heading":
        return n.attrs?.level === 4 ? (
          <h4 className="pt-3 text-lg font-semibold text-[#10281e]">
            {children}
          </h4>
        ) : (
          <h3 className="pt-3 text-xl font-semibold text-[#10281e]">
            {children}
          </h3>
        );
      case "bulletList":
        return <ul className="list-disc space-y-2 pl-6">{children}</ul>;
      case "orderedList":
        return <ol className="list-decimal space-y-2 pl-6">{children}</ol>;
      case "listItem":
        return <li>{children}</li>;
      default:
        return null;
    }
  }
  return (
    <div className={styles.prose}>
      {render(node)}
    </div>
  );
}
export function StoryFigure({
  image,
  evidence = true,
}: {
  image?: StoryImage;
  evidence?: boolean;
}) {
  if (!image || !safeImageUrl(image.url)) return null;
  const inlineUrl = image.url.replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto,w_1400,c_limit/",
  );
  return (
    <figure className={styles.figure}>
      <div className={styles.imageFrame}>
        <img
          src={inlineUrl}
          alt={image.alt}
          width={image.width ?? 1200}
          height={image.height ?? 800}
          loading="lazy"
          className="h-auto max-h-[800px] w-full object-contain"
        />
      </div>
      {(image.caption || evidence) && (
        <figcaption className={styles.caption}>
          {image.caption && <span>{image.caption}</span>}
          {evidence && (
            <a
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-medium underline underline-offset-4"
              aria-label={`View full image: ${image.alt || "Campaign evidence"}`}
            >
              View full image ↗
            </a>
          )}
        </figcaption>
      )}
    </figure>
  );
}
function Section({ section }: { section: StorySection }) {
  const heading =
    "heading" in section && section.heading ? (
      <h2 className={styles.sectionHeading}>
        {section.heading}
      </h2>
    ) : null;
  switch (section.type) {
    case "narrative":
      return (
        <section className={styles.narrative}>
          {heading}
          <StoryRichText node={section.body} />
        </section>
      );
    case "imageText":
      return (
        <section className={styles.imageText}>
          <div>
            {heading}
            <StoryRichText node={section.body} />
          </div>
          <div
            className={
              section.side === "left" ? styles.imageFirst : ""
            }
          >
            <StoryFigure image={section.image} />
          </div>
        </section>
      );
    case "image":
      return (
        <section className={styles.visualSection}>
          {heading}
          <StoryFigure image={section.image} />
          {section.sourceUrl && safeStoryUrl(section.sourceUrl) && (
            <a
              href={section.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-emerald-700 underline underline-offset-4"
            >
              View source ↗
            </a>
          )}
        </section>
      );
    case "gallery":
      return (
        <section className={styles.visualSection}>
          {heading}
          <div className={styles.gallery}>
            {section.images.map((image) => (
              <StoryFigure key={image.id} image={image} />
            ))}
          </div>
        </section>
      );
    case "comparison":
      return (
        <section className={styles.visualSection}>
          {heading}
          <div className={styles.comparison}>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#61796c]">
                {section.beforeLabel}
              </h3>
              <StoryRichText node={section.before} />
            </div>
            <div className={styles.after}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {section.afterLabel}
              </h3>
              <StoryRichText node={section.after} />
            </div>
          </div>
        </section>
      );
    case "quote":
      return (
        <figure className={styles.quote}>
          <blockquote className={styles.quoteText}>
            “{section.quote}”
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            {section.image && safeImageUrl(section.image.url) && (
              <img
                src={section.image.url}
                alt={section.image.alt}
                width={48}
                height={48}
                loading="lazy"
                className="size-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-[#10281e]">
                {section.personName}
              </p>
              {section.role && (
                <p className="mt-1 text-sm text-[#61796c]">{section.role}</p>
              )}
            </div>
          </figcaption>
        </figure>
      );
  }
}
export function CaseStudyStory({ study }: { study: StoryInput }) {
  const contexts = [
    ["Industry", study.industry],
    ["Timeframe", study.timeframe],
    ["Channels", study.channels?.filter(Boolean).join(", ")],
    ["Budget", study.budget],
  ].filter(([, value]) => value);
  return (
    <article className={styles.story} data-nav-surface="light">
      <header className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.topline}>
            <Link href="/#case-studies" scroll={false} className={styles.back}>&larr; All case studies</Link>
            <p className={styles.category}>Case study{study.category ? ` / ${study.category}` : ""}</p>
          </div>
          {(study.logo || study.clientName) && (
            <div className={styles.client}>
              {study.logo && safeImageUrl(study.logo.url) && (
                <img src={study.logo.url} alt={study.logo.alt} width={44} height={44} className={styles.logo} />
              )}
              {study.clientName && (study.clientUrl && safeStoryUrl(study.clientUrl) ? (
                <a href={study.clientUrl} target="_blank" rel="noopener noreferrer">{study.clientName} <span aria-hidden="true">&#8599;</span></a>
              ) : <p>{study.clientName}</p>)}
            </div>
          )}
          <h1>{study.headline || study.title}</h1>
          {study.summary && <p className={styles.summary}>{study.summary}</p>}
          {study.cover && <div className={styles.cover}><StoryFigure image={study.cover} evidence={false} /></div>}
          {contexts.length > 0 && (
            <dl className={styles.contexts}>
              {contexts.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          )}
        </div>
      </header>
      {study.metrics.length > 0 && (
        <section className={styles.results} aria-label="Campaign results" data-nav-surface="dark">
          <div className={styles.wrap}>
            <p className={styles.resultsLabel}>The results</p>
            <dl className={styles.metrics}>
              {study.metrics.map((metric, index) => (
                <div key={metric.id ?? index}><dd>{metric.value}</dd><dt>{metric.label}</dt></div>
              ))}
            </dl>
          </div>
        </section>
      )}
      <div className={`${styles.wrap} ${styles.body}`}>
        {storySections(study).map((section) => <Section key={section.id} section={section} />)}
      </div>
      {study.cta && (
        <section className={styles.cta} data-nav-surface="dark">
          <div className={styles.wrap}>
            <div><h2>{study.cta.heading}</h2>
              {study.cta.text && <p>{study.cta.text}</p>}
            </div>
            {safeStoryUrl(study.cta.buttonUrl) && (
              <a href={study.cta.buttonUrl} className={styles.button}>
                {study.cta.buttonText}<span aria-hidden="true">&#8599;</span>
              </a>
            )}
          </div>
        </section>
      )}
      <div className={`${styles.wrap} ${styles.endNav}`}>
        <span>Lumivale / Case studies</span>
        <Link href="/#case-studies" scroll={false}>Explore more stories <span aria-hidden="true">&#8599;</span></Link>
      </div>
    </article>
  );
}
