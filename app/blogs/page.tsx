import Link from "next/link";

import { getPublicBlogPosts } from "@/lib/blogs";
import { getMongoDb } from "@/lib/mongodb";

const placeholderPosts = [
  {
    category: "Comment Campaigns",
    excerpt:
      "Placeholder article on turning active conversations into steady traffic and awareness.",
    readTime: "4 min read",
    title: "How comment campaigns can create warmer inbound attention.",
  },
  {
    category: "UGC Content",
    excerpt:
      "Placeholder article on creator-style short-form content systems for lean distribution.",
    readTime: "6 min read",
    title: "What a practical UGC publishing cadence looks like for early teams.",
  },
  {
    category: "Outreach",
    excerpt:
      "Placeholder article on simple outbound systems across LinkedIn and email motions.",
    readTime: "5 min read",
    title: "Keeping outreach simple without losing consistency or intent.",
  },
] as const;

export default async function BlogsPage() {
  const posts = await getBlogsPagePosts();
  const hasPosts = posts.length > 0;

  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <section className="bg-white px-6 py-16 pt-32">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl font-semibold leading-[1.04] text-[var(--lumivale-ink)] sm:text-4xl">Blogs</h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[var(--lumivale-muted)] sm:text-base">
            Field notes on comment campaigns, creator-led content, outreach, and direct
            response systems that help teams find traction.
          </p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--lumivale-accent)]">
                Latest thinking
              </p>
              <h2 className="mt-3 text-[1.75rem] font-semibold leading-tight sm:text-[1.9rem]">
                Practical ideas for turning attention into growth activity.
              </h2>
            </div>
            <p className="text-sm leading-6 text-[var(--lumivale-muted)] sm:text-[0.95rem]">
              Short articles for founders and lean teams that want simple, affordable,
              and consistent growth execution.
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {hasPosts ? posts.map((post) => (
              <Link
                key={post.title}
                href={`/blogs/${post.slug}`}
                aria-label={`Read ${post.title}`}
                className="group flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-[var(--lumivale-line)] bg-white shadow-[0_20px_60px_rgba(42,47,82,0.06)] transition hover:-translate-y-1 hover:border-[var(--lumivale-accent)] hover:shadow-[0_24px_70px_rgba(42,47,82,0.1)]"
              >
                {post.coverImageId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/blog-images/${post.coverImageId}`}
                    alt={post.coverAlt || post.title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : (
                  <div
                    aria-label={`${post.category} placeholder image`}
                    className="grid aspect-[16/9] place-items-center bg-[linear-gradient(135deg,#eafaf2_0%,#f7f8fb_52%,#ffffff_100%)]"
                  >
                    <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--lumivale-accent)] shadow-[0_10px_30px_rgba(42,47,82,0.08)]">
                      {post.category}
                    </span>
                  </div>
                )}
                <article className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                    <span className="rounded-full bg-[#eef8f2] px-3 py-1 font-semibold text-[var(--lumivale-ink)]">
                      {post.category}
                    </span>
                    <span className="text-[var(--lumivale-muted)]">{post.readTime}</span>
                  </div>
                  <h2 className="mt-5 text-[1.05rem] font-semibold leading-tight transition group-hover:text-[var(--lumivale-accent)] sm:text-[1.12rem]">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">{post.excerpt}</p>
                  <p className="mt-auto pt-5 text-sm font-semibold text-[var(--lumivale-ink)]">
                    Read more
                  </p>
                </article>
              </Link>
            )) : (
              placeholderPosts.map((post) => (
                <article
                  key={post.title}
                  className="flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-[var(--lumivale-line)] bg-white shadow-[0_20px_60px_rgba(42,47,82,0.06)]"
                >
                  <div
                    aria-label={`${post.category} placeholder image`}
                    className="grid aspect-[16/9] place-items-center bg-[linear-gradient(135deg,#eafaf2_0%,#f7f8fb_52%,#ffffff_100%)]"
                  >
                    <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--lumivale-accent)] shadow-[0_10px_30px_rgba(42,47,82,0.08)]">
                      Placeholder
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                      <span className="rounded-full bg-[#eef8f2] px-3 py-1 font-semibold text-[var(--lumivale-ink)]">
                        {post.category}
                      </span>
                      <span className="text-[var(--lumivale-muted)]">{post.readTime}</span>
                    </div>
                    <h2 className="mt-5 text-[1.05rem] font-semibold leading-tight sm:text-[1.12rem]">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
                      {post.excerpt}
                    </p>
                    <p className="mt-auto pt-5 text-sm font-semibold text-[var(--lumivale-muted)]">
                      Article placeholder
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

async function getBlogsPagePosts() {
  try {
    const db = await getMongoDb();

    return getPublicBlogPosts(db);
  } catch (error) {
    console.error("Unable to load blog posts", error);

    return [];
  }
}
