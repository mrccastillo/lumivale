import Link from "next/link";

import { BlogForm } from "@/app/admin/blogs/blog-form";
import { requireAdminAccess } from "@/lib/admin-auth";
import { type BlogPost, getAdminBlogPosts } from "@/lib/blogs";
import { getMongoDb } from "@/lib/mongodb";

const PAGE_SIZE = 6;
const STATUS_OPTIONS = ["all", "published", "draft"] as const;

type BlogStatusFilter = (typeof STATUS_OPTIONS)[number];

type AdminBlogsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function AdminBlogsPage({ searchParams }: AdminBlogsPageProps = {}) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const posts = await getAdminBlogPosts(db);
  const params = await searchParams;
  const query = firstValue(params?.q).trim();
  const status = parseStatus(firstValue(params?.status));
  const mode = parseMode(firstValue(params?.mode));
  const requestedPage = parsePage(firstValue(params?.page));
  const filteredPosts = filterPosts(posts, { query, status });
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const publishedCount = pagePosts.filter((post) => post.status === "published").length;
  const draftCount = pagePosts.filter((post) => post.status === "draft").length;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-7">
      <section className="overflow-hidden rounded-lg border border-[var(--lumivale-admin-panel-soft)] bg-[linear-gradient(135deg,var(--lumivale-panel),var(--lumivale-ink))] shadow-[0_26px_80px_rgba(5,43,32,0.2)]">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/72">
              Content Management
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
              Blogs
            </h1>
            <p className="mt-4 text-base leading-8 text-white/74">
              Manage SEO-ready blog posts for the public landing site with a cleaner
              editorial workflow, faster filtering, and clearer publish controls.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={buildBlogsHref({ page: currentPage, query, status })}
              className="inline-flex items-center gap-2 rounded-lg border border-white/18 bg-white px-5 py-3 text-sm font-semibold text-[var(--lumivale-panel)] transition hover:border-white/40"
            >
              Refresh
            </Link>
            <Link
              href="/admin/blogs?mode=create"
              className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-[var(--lumivale-panel)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(1,8,7,0.28)] transition hover:bg-[var(--lumivale-admin-panel-soft)]"
            >
              <span aria-hidden="true">+</span>
              New Blog
            </Link>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 bg-white/6 p-6 sm:grid-cols-2 sm:p-8 xl:grid-cols-4">
          <MetricCard label="Matching posts" value={filteredPosts.length} note="Total results for current filters" />
          <MetricCard label="Published on page" value={publishedCount} note="Visible public-ready articles" />
          <MetricCard label="Drafts on page" value={draftCount} note="Posts still being prepared" />
          <MetricCard
            label="Current mode"
            value={mode === "create" ? "Editor" : status === "all" ? "Library" : `${capitalize(status)} posts`}
            note={mode === "create" ? "Editing content" : "Browsing posts"}
          />
        </div>
      </section>

      <div className="w-fit rounded-lg border border-[var(--lumivale-admin-border)] bg-white p-1 shadow-[0_16px_46px_rgba(5,43,32,0.08)]">
        <Link
          href={buildBlogsHref({ query, status: "all" })}
          className={`inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition ${
            mode === "list"
              ? "bg-[var(--lumivale-admin-chip)] text-[var(--lumivale-panel)]"
              : "text-[var(--lumivale-admin-muted)]"
          }`}
        >
          View Blogs
        </Link>
        <Link
          href="/admin/blogs?mode=create"
          className={`inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition ${
            mode === "create"
              ? "bg-[var(--lumivale-admin-chip)] text-[var(--lumivale-panel)]"
              : "text-[var(--lumivale-admin-muted)] hover:text-[var(--lumivale-panel)]"
          }`}
        >
          Create Blog
        </Link>
      </div>

      {mode === "create" ? (
        <CreateBlogPanel />
      ) : (
      <section className="rounded-lg border border-[var(--lumivale-admin-border)] bg-white p-5 shadow-[0_22px_70px_rgba(5,43,32,0.08)] sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--lumivale-panel)]">
              Blog Library
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
              Browse And Manage Posts
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--lumivale-admin-muted)]">
              Search by title or slug, narrow the list by status, and jump directly
              into editing without losing context.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] px-5 py-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-admin-muted)]">
              Current view
            </p>
            <p className="mt-2 font-semibold text-[var(--lumivale-ink)]">
              Page {currentPage} of {totalPages}
            </p>
            <p className="mt-1 text-xs text-[var(--lumivale-admin-muted)]">{filteredPosts.length} total posts</p>
          </div>
        </div>

        <form
          action="/admin/blogs"
          className="mt-6 rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4"
        >
          <label
            htmlFor="blog-search"
            className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lumivale-admin-muted)]"
          >
            Search
          </label>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              id="blog-search"
              aria-label="Search title or slug"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search title or slug"
              className="min-h-12 flex-1 rounded-lg border border-[var(--lumivale-admin-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--lumivale-panel)]"
            />
            {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
            <button
              type="submit"
              className="min-h-12 rounded-lg bg-[var(--lumivale-panel)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--lumivale-admin-panel-soft)]"
            >
              Search
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <Link
                key={option}
                href={buildBlogsHref({ query, status: option })}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  status === option
                    ? "border-[var(--lumivale-panel)] bg-[var(--lumivale-admin-chip)] text-[var(--lumivale-panel)]"
                    : "border-[var(--lumivale-admin-border)] text-[var(--lumivale-ink)] hover:border-[var(--lumivale-admin-border-strong)]"
                }`}
              >
                {option === "all" ? "All Posts" : capitalize(option)}
              </Link>
            ))}
          </div>
        </form>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {pagePosts.length ? (
            pagePosts.map((post) => <BlogCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--lumivale-admin-border)] p-8 text-center lg:col-span-2">
              <p className="text-lg font-semibold text-[var(--lumivale-ink)]">
                {posts.length ? "No matching posts." : "No blog posts yet."}
              </p>
              <p className="mt-2 text-sm text-[var(--lumivale-admin-muted)]">
                {posts.length
                  ? "Adjust search or status filters to see more posts."
                  : "Create the first post to start building the public blog library."}
              </p>
              <Link
                href={posts.length ? "/admin/blogs" : "/admin/blogs?mode=create"}
                className="mt-5 inline-flex rounded-lg bg-[var(--lumivale-panel)] px-5 py-3 text-sm font-semibold text-white"
              >
                {posts.length ? "Clear filters" : "New Blog"}
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[var(--lumivale-admin-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--lumivale-admin-muted)]">
            Showing page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildBlogsHref({
                  page: currentPage - 1,
                  query,
                  status,
                  includePageOne: true,
                })}
                className="rounded-lg border border-[var(--lumivale-admin-border)] px-5 py-3 text-sm font-semibold text-[var(--lumivale-panel)]"
              >
                Previous
              </Link>
            ) : (
              <span className="rounded-lg border border-[var(--lumivale-admin-border)] px-5 py-3 text-sm font-semibold text-[#92a49b]">
                Previous
              </span>
            )}
            {currentPage < totalPages ? (
              <Link
                href={buildBlogsHref({ page: currentPage + 1, query, status })}
                className="rounded-lg border border-[var(--lumivale-admin-border)] px-5 py-3 text-sm font-semibold text-[var(--lumivale-panel)]"
              >
                Next
              </Link>
            ) : (
              <span className="rounded-lg border border-[var(--lumivale-admin-border)] px-5 py-3 text-sm font-semibold text-[#92a49b]">
                Next
              </span>
            )}
          </div>
        </div>
      </section>
      )}
    </section>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="overflow-hidden rounded-lg border border-[var(--lumivale-admin-border)] bg-white">
      {post.coverImageId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/blog-images/${post.coverImageId}`}
          alt={post.coverAlt || post.title}
          className="aspect-[16/9] w-full object-cover"
        />
      ) : (
        <div className="grid aspect-[16/9] place-items-center bg-[var(--lumivale-admin-surface-strong)]">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]">
            {post.category}
          </span>
        </div>
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-[var(--lumivale-admin-chip)] px-3 py-1 text-xs font-semibold uppercase text-[var(--lumivale-panel)]">
            {post.status}
          </span>
          <span className="text-xs text-[var(--lumivale-admin-muted)]">{post.readTime}</span>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-[var(--lumivale-ink)]">
          {post.title}
        </h2>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lumivale-panel)]">
          /blog/{post.slug}
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--lumivale-admin-muted)]">{post.excerpt}</p>
        <div className="mt-5 rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-admin-muted)]">
            Editorial notes
          </p>
          <p className="mt-2 text-sm text-[var(--lumivale-ink)]">
            {post.status === "published"
              ? "Visible on the public site."
              : "Draft post. Publish when ready."}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/admin/blogs/${post.id}/edit`}
            className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
          >
            Edit
          </Link>
          <form action={`/api/admin/blogs/${post.id}`} method="post">
            <input
              type="hidden"
              name="action"
              value={post.status === "published" ? "draft" : "publish"}
            />
            <button
              type="submit"
              className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
            >
              {post.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </form>
          <form action={`/api/admin/blogs/${post.id}`} method="post">
            <input type="hidden" name="action" value="delete" />
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

function MetricCard({
  label,
  note,
  value,
}: {
  label: string;
  note: string;
  value: number | string;
}) {
  return (
    <article className="rounded-lg border border-white/12 bg-white/6 p-5 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/68">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-white/68">{note}</p>
    </article>
  );
}

function CreateBlogPanel() {
  return (
    <section className="rounded-lg border border-[var(--lumivale-admin-border)] bg-white p-5 shadow-[0_22px_70px_rgba(5,43,32,0.08)] sm:p-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--lumivale-panel)]">
          Blog Editor
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
          Create Blog Post
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--lumivale-admin-muted)]">
          Write the article, prepare the summary, and manage the public URL before
          publishing it to the website.
        </p>
      </div>
      <div className="mt-6">
        <BlogForm submitLabel="Create Blog Post" />
      </div>
    </section>
  );
}

function filterPosts(
  posts: BlogPost[],
  { query, status }: { query: string; status: BlogStatusFilter },
) {
  const normalizedQuery = query.toLowerCase();

  return posts.filter((post) => {
    const matchesStatus = status === "all" || post.status === status;
    const matchesQuery =
      !normalizedQuery ||
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.slug.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

function buildBlogsHref({
  includePageOne = false,
  page = 1,
  query = "",
  status = "all",
}: {
  includePageOne?: boolean;
  page?: number;
  query?: string;
  status?: BlogStatusFilter;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (status !== "all") {
    params.set("status", status);
  }

  if (page > 1 || includePageOne) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString ? `/admin/blogs?${queryString}` : "/admin/blogs";
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePage(value: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseStatus(value: string): BlogStatusFilter {
  return STATUS_OPTIONS.includes(value as BlogStatusFilter)
    ? (value as BlogStatusFilter)
    : "all";
}

function parseMode(value: string) {
  return value === "create" ? "create" : "list";
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
