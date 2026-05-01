const posts = [
  {
    category: "Positioning",
    title: "Why premium service brands need proof before polish",
    excerpt:
      "A modern website works harder when the offer, buyer pain, and credibility signals are visible before the design tries to impress.",
    readTime: "6 min read",
  },
  {
    category: "Website Strategy",
    title: "The SaaS page patterns service brands can borrow",
    excerpt:
      "Clear hero copy, proof blocks, productized process sections, and confident CTAs can make expert-led services easier to evaluate.",
    readTime: "8 min read",
  },
  {
    category: "Conversion",
    title: "How to turn a simple website into a sales asset",
    excerpt:
      "A stronger site does not need more pages. It needs sharper hierarchy, fewer distractions, and a better path to the next call.",
    readTime: "5 min read",
  },
];

export default function BlogsPage() {
  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <section data-nav-surface="dark" className="bg-[radial-gradient(circle_at_50%_0%,rgba(20,201,131,0.22),transparent_28%),linear-gradient(180deg,#063322_0%,#031410_56%,#010807_100%)] px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent-soft)]">
            Insights
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.04] sm:text-5xl">Blogs</h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#c7e7d7] sm:text-lg">
            Field notes on positioning, website strategy, and building a digital presence
            that earns trust faster.
          </p>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
                Latest thinking
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                Practical ideas for making expert services easier to buy.
              </h2>
            </div>
            <p className="leading-7 text-[var(--lumivale-muted)]">
              Short articles for founders and service teams who want a cleaner site,
              stronger proof, and a sharper path from attention to inquiry.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.title}
                className="flex min-h-[320px] flex-col rounded-lg border border-[var(--lumivale-line)] bg-white p-7 shadow-[0_20px_60px_rgba(42,47,82,0.06)]"
              >
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="rounded-full bg-[#eef8f2] px-3 py-1 font-semibold text-[var(--lumivale-ink)]">
                    {post.category}
                  </span>
                  <span className="text-[var(--lumivale-muted)]">{post.readTime}</span>
                </div>
                <h2 className="mt-8 text-xl font-semibold leading-tight">{post.title}</h2>
                <p className="mt-4 leading-7 text-[var(--lumivale-muted)]">{post.excerpt}</p>
                <p className="mt-auto pt-8 text-sm font-semibold text-[var(--lumivale-ink)]">
                  Coming soon
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
