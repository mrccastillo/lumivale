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
  const relatedPosts = await getRelatedPosts(post.slug);

  return (
    <article className="mx-auto w-full max-w-7xl px-6 pb-[54px] pt-32">
      <div className="grid gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          {tableOfContents.length ? (
            <div className="sticky top-28 rounded-[22px] border border-[var(--lumivale-line)] bg-white p-5 shadow-[0_18px_44px_rgba(42,47,82,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-accent)]">
                Table of Contents
              </p>
              <nav className="mt-4">
                <ul className="space-y-3 text-sm text-[var(--lumivale-muted)]">
                  {tableOfContents.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={`block transition hover:text-[var(--lumivale-accent)] ${
                          item.level === 3 ? "pl-4 text-[13px]" : ""
                        }`}
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <header className="space-y-4">
            <Link
              href="/blogs"
              className="text-sm font-semibold uppercase text-[var(--lumivale-accent)] transition hover:text-[var(--lumivale-ink)]"
            >
              Blogs
            </Link>
            <p className="text-sm font-semibold text-[var(--lumivale-muted)]">{post.category} · {post.readTime}</p>
            <h1 className="max-w-4xl text-3xl font-medium text-stone-900 sm:text-5xl sm:leading-[1.06]">
              {post.title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-stone-600">{post.excerpt}</p>
          </header>

          {post.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImageUrl}
              alt={post.coverAlt || post.title}
              className="aspect-[16/9] w-full rounded-[20px] border border-[var(--lumivale-line)] object-cover"
            />
          ) : (
            <div
              aria-label={`${post.category} placeholder image`}
              className="grid aspect-[16/9] place-items-center rounded-[20px] border border-[var(--lumivale-line)] bg-[linear-gradient(135deg,#eafaf2_0%,#f7f8fb_52%,#ffffff_100%)]"
            >
              <span className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[var(--lumivale-accent)] shadow-[0_10px_30px_rgba(42,47,82,0.08)]">
                {post.category}
              </span>
            </div>
          )}

          <section className="max-w-none text-stone-700">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => {
                  const title = String(children).trim();

                  return (
                    <h2
                      id={slugifyHeading(title)}
                      className="mt-10 text-[1.9rem] font-semibold leading-tight text-stone-900 first:mt-0"
                    >
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const title = String(children).trim();

                  return (
                    <h3
                      id={slugifyHeading(title)}
                      className="mt-7 text-[1.25rem] font-semibold leading-tight text-stone-900"
                    >
                      {children}
                    </h3>
                  );
                },
                p: ({ children }) => (
                  <p className="mt-4 text-[1.02rem] leading-8 text-stone-700">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mt-5 list-disc space-y-2 pl-6 text-[1.02rem] leading-8 text-stone-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mt-5 list-decimal space-y-2 pl-6 text-[1.02rem] leading-8 text-stone-700">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,
              }}
            >
              {post.body}
            </ReactMarkdown>
          </section>

          {relatedPosts.length ? (
            <section className="pt-6">
              <div className="flex items-center gap-3">
                <span className="inline-block size-2.5 rounded-full bg-[var(--lumivale-accent)]" />
                <h2 className="text-2xl font-semibold text-[var(--lumivale-ink)]">
                  Related Articles
                </h2>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blogs/${relatedPost.slug}`}
                    className="group overflow-hidden rounded-[20px] border border-[var(--lumivale-line)] bg-white shadow-[0_18px_54px_rgba(42,47,82,0.06)] transition hover:-translate-y-1 hover:border-[var(--lumivale-accent)] hover:shadow-[0_24px_70px_rgba(42,47,82,0.1)]"
                  >
                    {relatedPost.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={relatedPost.coverImageUrl}
                        alt={relatedPost.coverAlt || relatedPost.title}
                        className="aspect-[16/9] w-full object-cover"
                      />
                    ) : (
                      <div className="grid aspect-[16/9] place-items-center bg-[linear-gradient(135deg,#eafaf2_0%,#f7f8fb_52%,#ffffff_100%)]">
                        <span className="rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[var(--lumivale-accent)] shadow-[0_10px_30px_rgba(42,47,82,0.08)]">
                          {relatedPost.category}
                        </span>
                      </div>
                    )}

                    <div className="flex h-full flex-col p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--lumivale-muted)]">
                        Our Blog
                      </p>
                      <h3 className="mt-3 text-[1.18rem] font-semibold leading-tight text-[var(--lumivale-ink)] transition group-hover:text-[var(--lumivale-accent)]">
                        {relatedPost.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
                        {relatedPost.excerpt}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-5 text-xs text-[var(--lumivale-muted)]">
                        <span>{relatedPost.category}</span>
                        <span>{relatedPost.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
