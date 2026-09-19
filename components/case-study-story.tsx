/* eslint-disable @next/next/no-img-element */
import { Fragment, type ReactNode } from "react";
import Link from "next/link";
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
    <div className="space-y-4 break-words text-[1rem] leading-8 text-[#506259]">
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
    <figure className="min-w-0 space-y-3">
      <div className="overflow-hidden rounded-xl border border-[#dce7e0] bg-[#edf3ef]">
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
        <figcaption className="flex flex-wrap items-start justify-between gap-2 text-xs leading-5 text-[#61796c]">
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
      <h2 className="mb-6 text-2xl font-medium leading-tight tracking-tight text-[#10281e] @min-[700px]:text-3xl">
        {section.heading}
      </h2>
    ) : null;
  switch (section.type) {
    case "narrative":
      return (
        <section className="mx-auto max-w-3xl">
          {heading}
          <StoryRichText node={section.body} />
        </section>
      );
    case "imageText":
      return (
        <section className="grid items-center gap-8 @min-[700px]:grid-cols-2 @min-[700px]:gap-12">
          <div>
            {heading}
            <StoryRichText node={section.body} />
          </div>
          <div
            className={
              section.side === "left" ? "@min-[700px]:order-first" : ""
            }
          >
            <StoryFigure image={section.image} />
          </div>
        </section>
      );
    case "image":
      return (
        <section>
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
        <section>
          {heading}
          <div className="grid gap-6 @min-[700px]:grid-cols-2">
            {section.images.map((image) => (
              <StoryFigure key={image.id} image={image} />
            ))}
          </div>
        </section>
      );
    case "comparison":
      return (
        <section>
          {heading}
          <div className="grid gap-8 border-y border-[#dce7e0] py-8 @min-[700px]:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#61796c]">
                {section.beforeLabel}
              </h3>
              <StoryRichText node={section.before} />
            </div>
            <div className="border-t border-[#dce7e0] pt-8 @min-[700px]:border-l @min-[700px]:border-t-0 @min-[700px]:pl-8 @min-[700px]:pt-0">
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
        <figure className="mx-auto max-w-3xl border-l-2 border-emerald-500 pl-6 @min-[700px]:pl-10">
          <blockquote className="whitespace-pre-line text-2xl font-medium leading-relaxed tracking-tight text-[#10281e]">
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
    <article className="@container overflow-hidden bg-[#fafcfb] text-[#10281e]">
      <header
        data-nav-surface="dark"
        className="bg-[#031410] px-6 pb-14 pt-28 text-white @min-[700px]:px-10 @min-[700px]:pb-20 @min-[700px]:pt-36"
      >
        <div className="mx-auto max-w-6xl">
          <Link
            href="/case-studies"
            className="text-sm text-[#9fbbae] transition hover:text-white"
          >
            ← All case studies
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#25d699]">
            Case study{study.category ? ` / ${study.category}` : ""}
          </p>
          {(study.logo || study.clientName) && (
            <div className="mt-6 flex items-center gap-3">
              {study.logo && safeImageUrl(study.logo.url) && (
                <img
                  src={study.logo.url}
                  alt={study.logo.alt}
                  width={48}
                  height={48}
                  className="size-12 rounded-lg object-contain"
                />
              )}
              {study.clientName &&
                (study.clientUrl && safeStoryUrl(study.clientUrl) ? (
                  <a
                    href={study.clientUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-4"
                  >
                    {study.clientName} ↗
                  </a>
                ) : (
                  <p className="font-medium">{study.clientName}</p>
                ))}
            </div>
          )}
          <h1 className="mt-5 max-w-4xl break-words text-4xl font-medium leading-[1.12] tracking-tight @min-[700px]:text-6xl">
            {study.headline || study.title}
          </h1>
          {study.summary && (
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#b0c9bc] @min-[700px]:text-lg">
              {study.summary}
            </p>
          )}
          {contexts.length > 0 && (
            <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-white/15 pt-7">
              {contexts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wider text-[#91ab9d]">
                    {label}
                  </dt>
                  <dd className="mt-2 max-w-xs text-sm">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {study.metrics.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-7 border-t border-white/15 pt-8 @min-[700px]:grid-cols-4">
              {study.metrics.map((metric, index) => (
                <div key={metric.id ?? index}>
                  <dd className="break-words text-3xl font-medium tracking-tight text-[#8fe7bc] @min-[700px]:text-4xl">
                    {metric.value}
                  </dd>
                  <dt className="mt-2 text-sm leading-6 text-[#b0c9bc]">
                    {metric.label}
                  </dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-6xl space-y-16 px-6 py-14 @min-[700px]:space-y-24 @min-[700px]:px-10 @min-[700px]:py-20">
        {study.cover && <StoryFigure image={study.cover} evidence={false} />}
        {storySections(study).map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>
      {study.cta && (
        <section className="bg-[#eaf7ef] px-6 py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight">
              {study.cta.heading}
            </h2>
            {study.cta.text && (
              <p className="mt-4 leading-7 text-[#506259]">{study.cta.text}</p>
            )}
            {safeStoryUrl(study.cta.buttonUrl) && (
              <a
                href={study.cta.buttonUrl}
                className="mt-7 inline-flex rounded-full bg-[#0bc68a] px-7 py-3 text-sm font-semibold text-[#031410]"
              >
                {study.cta.buttonText}
              </a>
            )}
          </div>
        </section>
      )}
    </article>
  );
}
