import styles from "./article.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getPlaceholderBlogPostBySlug, placeholderBlogPosts, type PlaceholderBlogPost } from "@/lib/blog-placeholders";
import { getPublicBlogPostBySlug, getPublicBlogPosts, type BlogPost } from "@/lib/blogs";
import { getMongoDb } from "@/lib/mongodb";

type TocItem = {
  id: string;
  level: 2 | 3;
  title: string;
};

function slugifyHeading(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getTableOfContents(body: string) {
  const items: TocItem[] = [];
  const seenCounts = new Map<string, number>();

  for (const line of body.split("\n")) {
    const match = /^(##|###)\s+(.+)$/.exec(line.trim());

    if (!match) {
      continue;
    }

    const title = match[2].trim();
    const baseId = slugifyHeading(title);
    const count = seenCounts.get(baseId) ?? 0;
    seenCounts.set(baseId, count + 1);

    items.push({
      id: count === 0 ? baseId : `${baseId}-${count + 1}`,
      level: match[1] === "##" ? 2 : 3,
      title,
    });
  }

  return items;
}

function getHeadingId(
  title: string,
  level: TocItem["level"],
  headings: TocItem[],
  usedIndexes: Set<number>,
) {
  const index = headings.findIndex(
    (heading, headingIndex) =>
      !usedIndexes.has(headingIndex) &&
      heading.level === level &&
      heading.title === title,
  );

  if (index === -1) {
    return slugifyHeading(title);
  }

  usedIndexes.add(index);

  return headings[index].id;
}

async function getRelatedPosts(currentSlug: string) {
  try {
    const db = await getMongoDb();
    const posts = await getPublicBlogPosts(db);

    if (Array.isArray(posts) && posts.length > 0) {
      const relatedPublished = posts.filter((post) => post.slug !== currentSlug).slice(0, 3);

      if (relatedPublished.length === 3) {
        return relatedPublished;
      }

      const placeholderFill = placeholderBlogPosts
        .filter((post) => post.slug !== currentSlug)
        .filter((post) => !relatedPublished.some((published) => published.slug === post.slug))
        .slice(0, 3 - relatedPublished.length);

      return [...relatedPublished, ...placeholderFill];
    }
  } catch (error) {
    console.error("Unable to load related blog posts", error);
  }

  return placeholderBlogPosts.filter((post) => post.slug !== currentSlug).slice(0, 3);
}

export async function generateStaticParams() {
  const db = await getMongoDb();
  const posts = await getPublicBlogPosts(db);

  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post: (BlogPost | PlaceholderBlogPost) | null = null;

  try {
    const db = await getMongoDb();
    post = await getPublicBlogPostBySlug(db, slug);
  } catch (error) {
    console.error("Unable to load blog detail page", error);
  }

  post ??= getPlaceholderBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const tableOfContents = getTableOfContents(post.body);
  const usedHeadingIndexes = new Set<number>();
  const relatedPosts = await getRelatedPosts(post.slug);

  return (
    <article className={styles.page} data-nav-surface="light">
      <header className={`${styles.wrap} ${styles.header}`}>
        <Link href="/blogs" className={styles.back}>&larr; All articles</Link>
        <div className={styles.meta}><span>{post.category}</span><span>{post.readTime}</span></div>
        <h1>{post.title}</h1>
        <p className={styles.excerpt}>{post.excerpt}</p>
      </header>
      <div className={styles.wrap}>
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt={post.coverAlt || post.title} className={styles.cover} />
        ) : <div className={styles.artwork} aria-label={`${post.category} placeholder image`}>
          <span className={styles.artLabel}>Lumivale / Perspectives</span><strong>{post.category}</strong><span className={styles.artFoot}>Ideas for clearer growth <span aria-hidden="true">&#8599;</span></span>
        </div>}
      </div>
      <div className={`${styles.wrap} ${styles.readingLayout}`}>
        <aside className={styles.sidebar}>
          {tableOfContents.length ? <details className={styles.toc} open>
            <summary>Table of Contents</summary>
            <nav aria-label="Table of contents"><ul>{tableOfContents.map((item) => <li key={item.id} className={item.level === 3 ? styles.subheading : undefined}><a href={`#${item.id}`}>{item.title}</a></li>)}</ul></nav>
          </details> : null}
        </aside>
        <section className={styles.body} aria-label="Article content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            h2: ({ children }) => <h2 id={getHeadingId(String(children).trim(), 2, tableOfContents, usedHeadingIndexes)}>{children}</h2>,
            h3: ({ children }) => <h3 id={getHeadingId(String(children).trim(), 3, tableOfContents, usedHeadingIndexes)}>{children}</h3>,
            table: ({ children }) => <div className={styles.tableWrap}><table>{children}</table></div>,
          }}>{post.body}</ReactMarkdown>
          <div className={styles.articleEnd}><span>Lumivale / Perspectives</span><Link href="/blogs">Back to all articles <span aria-hidden="true">&#8599;</span></Link></div>
        </section>
      </div>
      {relatedPosts.length ? <section className={styles.related} aria-labelledby="related-title">
        <div className={styles.wrap}>
          <div className={styles.relatedHead}><h2 id="related-title">Related Articles</h2><Link href="/blogs">Explore the journal <span aria-hidden="true">&#8599;</span></Link></div>
          <div className={styles.relatedGrid}>{relatedPosts.map((relatedPost) => <Link key={relatedPost.slug} href={`/blogs/${relatedPost.slug}`} className={styles.relatedPost}>
            {relatedPost.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={relatedPost.coverImageUrl} alt={relatedPost.coverAlt || relatedPost.title} loading="lazy" />
            ) : <div className={styles.relatedArtwork}><span>Lumivale / Perspectives</span><strong>{relatedPost.category}</strong></div>}
            <div className={styles.meta}><span>{relatedPost.category}</span><span>{relatedPost.readTime}</span></div>
            <h3>{relatedPost.title}</h3><p>{relatedPost.excerpt}</p><span className={styles.readMore}>Read article <span aria-hidden="true">&#8599;</span></span>
          </Link>)}</div>
        </div>
      </section> : null}
    </article>
  );
}
