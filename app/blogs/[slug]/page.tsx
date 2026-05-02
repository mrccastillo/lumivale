import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blogs";

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-[54px] pt-32">
      <header className="space-y-4">
        <Link
          href="/blogs"
          className="text-sm font-semibold uppercase text-[var(--lumivale-accent)] transition hover:text-[var(--lumivale-ink)]"
        >
          Blogs
        </Link>
        <p className="text-sm font-semibold text-[var(--lumivale-muted)]">
          {post.category} · {post.readTime}
        </p>
        <h1 className="text-3xl font-medium text-stone-900">{post.title}</h1>
        <p className="max-w-2xl text-stone-600">{post.excerpt}</p>
      </header>

      <div
        aria-label={`${post.category} placeholder image`}
        className="grid aspect-[16/9] place-items-center rounded-lg border border-[var(--lumivale-line)] bg-[linear-gradient(135deg,#eafaf2_0%,#f7f8fb_52%,#ffffff_100%)]"
      >
        <span className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[var(--lumivale-accent)] shadow-[0_10px_30px_rgba(42,47,82,0.08)]">
          {post.category}
        </span>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-stone-900">Overview</h2>
        <p className="text-stone-600">{post.body}</p>
      </section>
    </article>
  );
}
