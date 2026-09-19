import Link from "next/link";

import { TestimonialForm } from "@/app/admin/testimonials/testimonial-form";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { type Testimonial, getAdminTestimonials } from "@/lib/testimonials";

const PAGE_SIZE = 6;
const STATUS_OPTIONS = ["all", "published", "draft"] as const;
const TYPE_OPTIONS = ["all", "text", "video"] as const;

type TestimonialStatusFilter = (typeof STATUS_OPTIONS)[number];
type TestimonialTypeFilter = (typeof TYPE_OPTIONS)[number];

type AdminTestimonialsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function AdminTestimonialsPage({
  searchParams,
}: AdminTestimonialsPageProps = {}) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const testimonials = await getAdminTestimonials(db);
  const params = await searchParams;
  const query = firstValue(params?.q).trim();
  const status = parseStatus(firstValue(params?.status));
  const type = parseType(firstValue(params?.type));
  const mode = parseMode(firstValue(params?.mode));
  const errorMessage = firstValue(params?.error).trim();
  const requestedPage = parsePage(firstValue(params?.page));
  const filteredTestimonials = filterTestimonials(testimonials, { query, status, type });
  const totalPages = Math.max(1, Math.ceil(filteredTestimonials.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageTestimonials = filteredTestimonials.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const publishedCount = pageTestimonials.filter(
    (testimonial) => testimonial.status === "published",
  ).length;
  const draftCount = pageTestimonials.filter(
    (testimonial) => testimonial.status === "draft",
  ).length;
  const baseHref = buildTestimonialsHref({
    page: currentPage,
    query,
    status,
    type,
  });

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-7">
      <section data-admin-overview className="overflow-hidden rounded-lg border border-[var(--lumivale-admin-panel-soft)] bg-[linear-gradient(135deg,var(--lumivale-panel),var(--lumivale-ink))] shadow-[0_26px_80px_rgba(5,43,32,0.2)]">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/72">
              Content Management
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
              Testimonials
            </h1>
            <p className="mt-4 text-base leading-8 text-white/74">
              Manage text and video testimonials with a faster review workflow,
              clearer filters, and a dedicated create modal for new entries.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={buildTestimonialsHref({ page: currentPage, query, status, type })}
              className="inline-flex items-center gap-2 rounded-lg border border-white/18 bg-white px-5 py-3 text-sm font-semibold text-[var(--lumivale-panel)] transition hover:border-white/40"
            >
              Refresh
            </Link>
            <Link
              href={buildTestimonialsHref({ query, status, type, mode: "create" })}
              className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-[var(--lumivale-panel)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(1,8,7,0.28)] transition hover:bg-[var(--lumivale-admin-panel-soft)]"
            >
              <span aria-hidden="true">+</span>
              New testimonial
            </Link>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 bg-white/6 p-6 sm:grid-cols-2 sm:p-8 xl:grid-cols-4">
          <MetricCard
            label="Matching testimonials"
            value={filteredTestimonials.length}
            note="Total results for current filters"
          />
          <MetricCard
            label="Published on page"
            value={publishedCount}
            note="Public-ready testimonials in view"
          />
          <MetricCard
            label="Drafts on page"
            value={draftCount}
            note="Testimonials still being prepared"
          />
          <MetricCard
            label="Current mode"
            value={mode === "create" ? "Create" : "Library"}
            note={mode === "create" ? "Modal editor is open" : "Browsing testimonials"}
          />
        </div>
      </section>

      <section className="rounded-lg border border-[var(--lumivale-admin-border)] bg-white p-5 shadow-[0_22px_70px_rgba(5,43,32,0.08)] sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--lumivale-panel)]">
              Testimonial Library
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
              Browse And Manage Testimonials
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--lumivale-admin-muted)]">
              Search by person, company, or quote, then narrow the library by
              publication status and testimonial type.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] px-5 py-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-admin-muted)]">
              Current view
            </p>
            <p className="mt-2 font-semibold text-[var(--lumivale-ink)]">
              Page {currentPage} of {totalPages}
            </p>
            <p className="mt-1 text-xs text-[var(--lumivale-admin-muted)]">
              {filteredTestimonials.length} total testimonials
            </p>
          </div>
        </div>

        <form
          action="/admin/testimonials"
          className="mt-6 rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4"
        >
          <label
            htmlFor="testimonial-search"
            className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lumivale-admin-muted)]"
          >
            Search
          </label>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              id="testimonial-search"
              aria-label="Search name, title, or quote"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search name, title, or quote"
              className="min-h-12 flex-1 rounded-lg border border-[var(--lumivale-admin-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--lumivale-panel)]"
            />
            {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
            {type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
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
                href={buildTestimonialsHref({ query, status: option, type })}
                className={filterChipClassName(status === option)}
              >
                {option === "all" ? "All Statuses" : capitalize(option)}
              </Link>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((option) => (
              <Link
                key={option}
                href={buildTestimonialsHref({ query, status, type: option })}
                className={filterChipClassName(type === option)}
              >
                {option === "all" ? "All Types" : capitalize(option)}
              </Link>
            ))}
          </div>
        </form>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {pageTestimonials.length ? (
            pageTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--lumivale-admin-border)] p-8 text-center lg:col-span-2">
              <p className="text-lg font-semibold text-[var(--lumivale-ink)]">
                {testimonials.length ? "No matching testimonials." : "No testimonials yet."}
              </p>
              <p className="mt-2 text-sm text-[var(--lumivale-admin-muted)]">
                {testimonials.length
                  ? "Adjust search or filter controls to see more testimonials."
                  : "Create the first testimonial to start building the library."}
              </p>
              <Link
                href={
                  testimonials.length
                    ? "/admin/testimonials"
                    : "/admin/testimonials?mode=create"
                }
                className="mt-5 inline-flex rounded-lg bg-[var(--lumivale-panel)] px-5 py-3 text-sm font-semibold text-white"
              >
                {testimonials.length ? "Clear filters" : "New testimonial"}
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
                href={buildTestimonialsHref({
                  page: currentPage - 1,
                  query,
                  status,
                  type,
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
                href={buildTestimonialsHref({ page: currentPage + 1, query, status, type })}
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

      {mode === "create" ? (
        <CreateTestimonialModal cancelHref={baseHref} errorMessage={errorMessage} />
      ) : null}
    </section>
  );
}

function CreateTestimonialModal({
  cancelHref,
  errorMessage,
}: {
  cancelHref: string;
  errorMessage?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(3,20,16,0.62)] p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-testimonial-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-5 shadow-[0_32px_90px_rgba(1,8,7,0.3)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--lumivale-admin-muted)]">
              Testimonial Editor
            </p>
            <h2
              id="create-testimonial-title"
              className="mt-2 text-3xl font-semibold text-[var(--lumivale-ink)]"
            >
              Create Testimonial
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--lumivale-muted)]">
              Add a text or video testimonial without leaving the management page.
              Video testimonials still include a quote for list previews and context.
            </p>
          </div>
          <a
            href={cancelHref}
            aria-label="Close create testimonial modal"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--lumivale-admin-border)] bg-white text-lg text-[var(--lumivale-panel)] transition hover:border-[var(--lumivale-panel)]"
          >
            x
          </a>
        </div>

        <div className="mt-6">
          <TestimonialForm
            cancelHref={cancelHref}
            errorMessage={errorMessage}
            submitLabel="Create testimonial"
          />
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="overflow-hidden rounded-lg border border-[var(--lumivale-admin-border)] bg-white">
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--lumivale-admin-chip)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-panel)]">
            {testimonial.type}
          </span>
          <span className="rounded-full bg-[#fff8ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a96700]">
            {testimonial.status}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]">
            Sort {testimonial.sortOrder}
          </span>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-[var(--lumivale-ink)]">
          {testimonial.personName}
        </h2>
        <p className="mt-2 text-sm text-[var(--lumivale-admin-muted)]">
          {testimonial.personTitle || "No title or company added yet."}
        </p>
        <p className="mt-4 text-sm leading-7 text-[var(--lumivale-ink)]">{testimonial.quote}</p>

        <div className="mt-5 rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-admin-muted)]">
            Review notes
          </p>
          <p className="mt-2 text-sm text-[var(--lumivale-ink)]">
            {testimonial.type === "video"
              ? "Video testimonial with a quote preview for the dashboard."
              : "Text testimonial ready for review and publishing."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/admin/testimonials/${testimonial.id}/edit`}
            className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
          >
            Edit
          </Link>
          <form action={`/api/admin/testimonials/${testimonial.id}`} method="post">
            <input
              type="hidden"
              name="action"
              value={testimonial.status === "published" ? "draft" : "publish"}
            />
            <button
              type="submit"
              className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
            >
              {testimonial.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </form>
          <form action={`/api/admin/testimonials/${testimonial.id}`} method="post">
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
    <article data-admin-metric className="rounded-lg border border-white/12 bg-white/6 p-5 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/68">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-white/68">{note}</p>
    </article>
  );
}

function filterTestimonials(
  testimonials: Testimonial[],
  {
    query,
    status,
    type,
  }: {
    query: string;
    status: TestimonialStatusFilter;
    type: TestimonialTypeFilter;
  },
) {
  const normalizedQuery = query.toLowerCase();

  return testimonials.filter((testimonial) => {
    const matchesStatus = status === "all" || testimonial.status === status;
    const matchesType = type === "all" || testimonial.type === type;
    const matchesQuery =
      !normalizedQuery ||
      testimonial.personName.toLowerCase().includes(normalizedQuery) ||
      testimonial.personTitle.toLowerCase().includes(normalizedQuery) ||
      testimonial.quote.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesType && matchesQuery;
  });
}

function buildTestimonialsHref({
  includePageOne = false,
  mode,
  page = 1,
  query = "",
  status = "all",
  type = "all",
}: {
  includePageOne?: boolean;
  mode?: "create";
  page?: number;
  query?: string;
  status?: TestimonialStatusFilter;
  type?: TestimonialTypeFilter;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (status !== "all") {
    params.set("status", status);
  }

  if (type !== "all") {
    params.set("type", type);
  }

  if (page > 1 || includePageOne) {
    params.set("page", String(page));
  }

  if (mode === "create") {
    params.set("mode", "create");
  }

  const queryString = params.toString();

  return queryString ? `/admin/testimonials?${queryString}` : "/admin/testimonials";
}

function filterChipClassName(isActive: boolean) {
  return `rounded-full border px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "border-[var(--lumivale-panel)] bg-[var(--lumivale-admin-chip)] text-[var(--lumivale-panel)]"
      : "border-[var(--lumivale-admin-border)] text-[var(--lumivale-ink)] hover:border-[var(--lumivale-admin-border-strong)]"
  }`;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePage(value: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseStatus(value: string): TestimonialStatusFilter {
  return STATUS_OPTIONS.includes(value as TestimonialStatusFilter)
    ? (value as TestimonialStatusFilter)
    : "all";
}

function parseType(value: string): TestimonialTypeFilter {
  return TYPE_OPTIONS.includes(value as TestimonialTypeFilter)
    ? (value as TestimonialTypeFilter)
    : "all";
}

function parseMode(value: string) {
  return value === "create" ? "create" : "list";
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
