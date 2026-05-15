import Link from "next/link";

import { CaseStudyForm } from "@/app/admin/case-studies/case-study-form";
import { requireAdminAccess } from "@/lib/admin-auth";
import { type CaseStudy, getAdminCaseStudies } from "@/lib/case-studies";
import { getMongoDb } from "@/lib/mongodb";

const PAGE_SIZE = 6;
const STATUS_OPTIONS = ["all", "published", "draft"] as const;

type CaseStudyStatusFilter = (typeof STATUS_OPTIONS)[number];

type AdminCaseStudiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function AdminCaseStudiesPage({
  searchParams,
}: AdminCaseStudiesPageProps = {}) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const studies = await getAdminCaseStudies(db);
  const params = await searchParams;
  const query = firstValue(params?.q).trim();
  const status = parseStatus(firstValue(params?.status));
  const mode = parseMode(firstValue(params?.mode));
  const errorMessage = firstValue(params?.error).trim();
  const requestedPage = parsePage(firstValue(params?.page));
  const filteredStudies = filterCaseStudies(studies, { query, status });
  const totalPages = Math.max(1, Math.ceil(filteredStudies.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStudies = filteredStudies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const publishedCount = studies.filter((study) => study.status === "published").length;
  const draftCount = studies.filter((study) => study.status === "draft").length;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-7">
      <section className="overflow-hidden rounded-lg border border-[var(--lumivale-admin-panel-soft)] bg-[linear-gradient(135deg,var(--lumivale-panel),var(--lumivale-ink))] shadow-[0_26px_80px_rgba(5,43,32,0.2)]">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/72">
              Story Management
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
              Case Studies
            </h1>
            <p className="mt-4 text-base leading-8 text-white/74">
              Manage the public success stories shown on the Lumivale case studies
              page, including outcomes, metrics, and publish status.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={buildCaseStudiesHref({ page: currentPage, query, status })}
              className="inline-flex items-center gap-2 rounded-lg border border-white/18 bg-white px-5 py-3 text-sm font-semibold text-[var(--lumivale-panel)] transition hover:border-white/40"
            >
              Refresh
            </Link>
            <Link
              href={buildCaseStudiesHref({ mode: "create", query, status })}
              className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-[var(--lumivale-panel)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(1,8,7,0.28)] transition hover:bg-[var(--lumivale-admin-panel-soft)]"
            >
              <span aria-hidden="true">+</span>
              New Case Study
            </Link>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 bg-white/6 p-6 sm:grid-cols-2 sm:p-8 xl:grid-cols-4">
          <MetricCard label="Matching stories" value={filteredStudies.length} note="Total results for current filters" />
          <MetricCard label="Published" value={publishedCount} note="Visible on the public site" />
          <MetricCard label="Drafts" value={draftCount} note="Hidden from public visitors" />
          <MetricCard
            label="Current mode"
            value={mode === "create" ? "Create" : "Library"}
            note={mode === "create" ? "Creating a story" : "Browsing stories"}
          />
        </div>
      </section>

      {mode === "create" ? (
        <CreateCaseStudyPanel
          cancelHref={buildCaseStudiesHref({ page: currentPage, query, status })}
          errorMessage={errorMessage}
        />
      ) : (
        <section className="rounded-lg border border-[var(--lumivale-admin-border)] bg-white p-5 shadow-[0_22px_70px_rgba(5,43,32,0.08)] sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--lumivale-panel)]">
                Case Study Library
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
                Browse And Manage Stories
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--lumivale-admin-muted)]">
                Search by title, category, or summary, then update the results shown
                on public case-study pages.
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
                {studies.length} total case studies
              </p>
            </div>
          </div>

          <form
            action="/admin/case-studies"
            className="mt-6 rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4"
          >
            <label
              htmlFor="case-study-search"
              className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lumivale-admin-muted)]"
            >
              Search
            </label>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
              <input
                id="case-study-search"
                aria-label="Search case studies"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search title, category, or summary"
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
                  href={buildCaseStudiesHref({ query, status: option })}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    status === option
                      ? "border-[var(--lumivale-panel)] bg-[var(--lumivale-admin-chip)] text-[var(--lumivale-panel)]"
                      : "border-[var(--lumivale-admin-border)] text-[var(--lumivale-ink)] hover:border-[var(--lumivale-admin-border-strong)]"
                  }`}
                >
                  {option === "all" ? "All Statuses" : capitalize(option)}
                </Link>
              ))}
            </div>
          </form>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {pageStudies.length ? (
              pageStudies.map((study) => (
                <CaseStudyCard key={study.slug} study={study} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--lumivale-admin-border)] p-8 text-center lg:col-span-2">
                <p className="text-lg font-semibold text-[var(--lumivale-ink)]">
                  {studies.length ? "No matching case studies." : "No case studies yet."}
                </p>
                <p className="mt-2 text-sm text-[var(--lumivale-admin-muted)]">
                  {studies.length
                    ? "Adjust search or status filters to see more case studies."
                    : "Create the first case study to start filling the public story library."}
                </p>
                <Link
                  href={studies.length ? "/admin/case-studies" : "/admin/case-studies?mode=create"}
                  className="mt-5 inline-flex rounded-lg bg-[var(--lumivale-panel)] px-5 py-3 text-sm font-semibold text-white"
                >
                  {studies.length ? "Clear filters" : "New Case Study"}
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
                  href={buildCaseStudiesHref({
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
                  href={buildCaseStudiesHref({ page: currentPage + 1, query, status })}
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

function CreateCaseStudyPanel({
  cancelHref,
  errorMessage,
}: {
  cancelHref: string;
  errorMessage?: string;
}) {
  return (
    <section className="rounded-lg border border-[var(--lumivale-admin-border)] bg-white p-5 shadow-[0_22px_70px_rgba(5,43,32,0.08)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--lumivale-panel)]">
            Case Study Editor
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
            Create Case Study
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--lumivale-admin-muted)]">
            New case studies start as drafts unless you choose Published.
          </p>
        </div>
        <Link
          href={cancelHref}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--lumivale-line)] px-5 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[var(--lumivale-accent)]"
        >
          Back to case studies
        </Link>
      </div>
      <div className="mt-6">
        <CaseStudyForm
          cancelHref={cancelHref}
          errorMessage={errorMessage}
          submitLabel="Create Case Study"
        />
      </div>
    </section>
  );
}

function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <article className="overflow-hidden rounded-lg border border-[var(--lumivale-admin-border)] bg-white">
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--lumivale-admin-chip)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-panel)]">
            {study.status}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]">
            Sort {study.sortOrder}
          </span>
          {study.isDefault ? (
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]">
              Default
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 text-xl font-semibold text-[var(--lumivale-ink)]">
          {study.title}
        </h2>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lumivale-panel)]">
          /case-studies/{study.slug}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--lumivale-admin-muted)]">
          {study.summary}
        </p>

        <div className="mt-5 rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-admin-muted)]">
            Primary result
          </p>
          <p className="mt-2 font-semibold text-[var(--lumivale-ink)]">
            {study.metrics[0]?.value ?? "No metric"} {study.metrics[0]?.label ?? ""}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/admin/case-studies/${study.slug}/edit`}
            className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
          >
            Edit
          </Link>
          <form action={`/api/admin/case-studies/${study.slug}`} method="post">
            <input
              type="hidden"
              name="action"
              value={study.status === "published" ? "draft" : "publish"}
            />
            <button
              type="submit"
              className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
            >
              {study.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </form>
          {!study.isDefault ? (
            <form action={`/api/admin/case-studies/${study.slug}`} method="post">
              <input type="hidden" name="action" value="delete" />
              <button
                type="submit"
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
              >
                Delete
              </button>
            </form>
          ) : null}
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

function filterCaseStudies(
  studies: CaseStudy[],
  { query, status }: { query: string; status: CaseStudyStatusFilter },
) {
  const normalizedQuery = query.toLowerCase();

  return studies.filter((study) => {
    const matchesStatus = status === "all" || study.status === status;
    const matchesQuery =
      !normalizedQuery ||
      study.title.toLowerCase().includes(normalizedQuery) ||
      study.category.toLowerCase().includes(normalizedQuery) ||
      study.headline.toLowerCase().includes(normalizedQuery) ||
      study.summary.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

function buildCaseStudiesHref({
  includePageOne = false,
  mode,
  page = 1,
  query = "",
  status = "all",
}: {
  includePageOne?: boolean;
  mode?: "create";
  page?: number;
  query?: string;
  status?: CaseStudyStatusFilter;
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

  if (mode === "create") {
    params.set("mode", "create");
  }

  const queryString = params.toString();

  return queryString ? `/admin/case-studies?${queryString}` : "/admin/case-studies";
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePage(value: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseStatus(value: string): CaseStudyStatusFilter {
  return STATUS_OPTIONS.includes(value as CaseStudyStatusFilter)
    ? (value as CaseStudyStatusFilter)
    : "all";
}

function parseMode(value: string) {
  return value === "create" ? "create" : "list";
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
