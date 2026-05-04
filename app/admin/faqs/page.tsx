import Link from "next/link";

import { FaqForm } from "@/app/admin/faqs/faq-form";
import { requireAdminAccess } from "@/lib/admin-auth";
import { type Faq, getAdminFaqs } from "@/lib/faqs";
import { getMongoDb } from "@/lib/mongodb";

const PAGE_SIZE = 6;
const STATUS_OPTIONS = ["all", "published", "draft"] as const;

type FaqStatusFilter = (typeof STATUS_OPTIONS)[number];

type AdminFaqsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function AdminFaqsPage({ searchParams }: AdminFaqsPageProps = {}) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const faqs = await getAdminFaqs(db);
  const params = await searchParams;
  const query = firstValue(params?.q).trim();
  const status = parseStatus(firstValue(params?.status));
  const mode = parseMode(firstValue(params?.mode));
  const errorMessage = firstValue(params?.error).trim();
  const requestedPage = parsePage(firstValue(params?.page));
  const filteredFaqs = filterFaqs(faqs, { query, status });
  const totalPages = Math.max(1, Math.ceil(filteredFaqs.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageFaqs = filteredFaqs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const publishedCount = pageFaqs.filter((faq) => faq.status === "published").length;
  const draftCount = pageFaqs.filter((faq) => faq.status === "draft").length;
  const baseHref = buildFaqsHref({
    page: currentPage,
    query,
    status,
  });

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-7">
      <section className="overflow-hidden rounded-lg border border-[var(--lumivale-admin-panel-soft)] bg-[linear-gradient(135deg,var(--lumivale-panel),var(--lumivale-ink))] shadow-[0_26px_80px_rgba(5,43,32,0.2)]">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/72">
              Content Management
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">FAQs</h1>
            <p className="mt-4 text-base leading-8 text-white/74">
              Manage public questions and answers with clearer publishing controls,
              search, and a faster create flow for the homepage FAQ section.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={buildFaqsHref({ page: currentPage, query, status })}
              className="inline-flex items-center gap-2 rounded-lg border border-white/18 bg-white px-5 py-3 text-sm font-semibold text-[var(--lumivale-panel)] transition hover:border-white/40"
            >
              Refresh
            </Link>
            <Link
              href="/admin/faqs?mode=create"
              className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-[var(--lumivale-panel)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(1,8,7,0.28)] transition hover:bg-[var(--lumivale-admin-panel-soft)]"
            >
              <span aria-hidden="true">+</span>
              New FAQ
            </Link>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 bg-white/6 p-6 sm:grid-cols-2 sm:p-8 xl:grid-cols-4">
          <MetricCard label="Matching FAQs" value={filteredFaqs.length} note="Total results for current filters" />
          <MetricCard label="Published on page" value={publishedCount} note="Visible public-ready answers in view" />
          <MetricCard label="Drafts on page" value={draftCount} note="Questions still being prepared" />
          <MetricCard
            label="Current mode"
            value={mode === "create" ? "Create" : "Library"}
            note={mode === "create" ? "Modal editor is open" : "Browsing FAQs"}
          />
        </div>
      </section>

      <section className="rounded-lg border border-[var(--lumivale-admin-border)] bg-white p-5 shadow-[0_22px_70px_rgba(5,43,32,0.08)] sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--lumivale-panel)]">
              FAQ Library
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
              Browse And Manage FAQs
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--lumivale-admin-muted)]">
              Search by question or answer, narrow the list by status, and update
              public guidance without leaving the admin workspace.
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
              {filteredFaqs.length} total FAQs
            </p>
          </div>
        </div>

        <form
          action="/admin/faqs"
          className="mt-6 rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4"
        >
          <label
            htmlFor="faq-search"
            className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lumivale-admin-muted)]"
          >
            Search
          </label>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              id="faq-search"
              aria-label="Search question or answer"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search question or answer"
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
                href={buildFaqsHref({ query, status: option })}
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
          {pageFaqs.length ? (
            pageFaqs.map((faq) => <FaqCard key={faq.id} faq={faq} />)
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--lumivale-admin-border)] p-8 text-center lg:col-span-2">
              <p className="text-lg font-semibold text-[var(--lumivale-ink)]">
                {faqs.length ? "No matching FAQs." : "No FAQs yet."}
              </p>
              <p className="mt-2 text-sm text-[var(--lumivale-admin-muted)]">
                {faqs.length
                  ? "Adjust search or status filters to see more FAQs."
                  : "Create the first FAQ to start filling the public questions section."}
              </p>
              <Link
                href={faqs.length ? "/admin/faqs" : "/admin/faqs?mode=create"}
                className="mt-5 inline-flex rounded-lg bg-[var(--lumivale-panel)] px-5 py-3 text-sm font-semibold text-white"
              >
                {faqs.length ? "Clear filters" : "New FAQ"}
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
                href={buildFaqsHref({
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
                href={buildFaqsHref({ page: currentPage + 1, query, status })}
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
        <CreateFaqModal cancelHref={baseHref} errorMessage={errorMessage} />
      ) : null}
    </section>
  );
}

function CreateFaqModal({
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
        aria-labelledby="create-faq-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-5 shadow-[0_32px_90px_rgba(1,8,7,0.3)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--lumivale-admin-muted)]">
              FAQ Editor
            </p>
            <h2
              id="create-faq-title"
              className="mt-2 text-3xl font-semibold text-[var(--lumivale-ink)]"
            >
              Create FAQ
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--lumivale-muted)]">
              Add a new public question and answer without leaving the FAQ management page.
            </p>
          </div>
          <a
            href={cancelHref}
            aria-label="Close create FAQ modal"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--lumivale-admin-border)] bg-white text-lg text-[var(--lumivale-panel)] transition hover:border-[var(--lumivale-panel)]"
          >
            x
          </a>
        </div>

        <div className="mt-6">
          <FaqForm
            cancelHref={cancelHref}
            errorMessage={errorMessage}
            submitLabel="Create FAQ"
          />
        </div>
      </div>
    </div>
  );
}

function FaqCard({ faq }: { faq: Faq }) {
  return (
    <article className="overflow-hidden rounded-lg border border-[var(--lumivale-admin-border)] bg-white">
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--lumivale-admin-chip)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-panel)]">
            {faq.status}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]">
            Sort {faq.sortOrder}
          </span>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-[var(--lumivale-ink)]">{faq.question}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--lumivale-admin-muted)]">
          {faq.answer}
        </p>

        <div className="mt-5 rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-admin-muted)]">
            Publishing notes
          </p>
          <p className="mt-2 text-sm text-[var(--lumivale-ink)]">
            {faq.status === "published"
              ? "Visible on the public FAQ section."
              : "Draft answer. Publish when the copy is ready for visitors."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/admin/faqs/${faq.id}/edit`}
            className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
          >
            Edit
          </Link>
          <form action={`/api/admin/faqs/${faq.id}`} method="post">
            <input
              type="hidden"
              name="action"
              value={faq.status === "published" ? "draft" : "publish"}
            />
            <button
              type="submit"
              className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
            >
              {faq.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </form>
          <form action={`/api/admin/faqs/${faq.id}`} method="post">
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

function filterFaqs(
  faqs: Faq[],
  { query, status }: { query: string; status: FaqStatusFilter },
) {
  const normalizedQuery = query.toLowerCase();

  return faqs.filter((faq) => {
    const matchesStatus = status === "all" || faq.status === status;
    const matchesQuery =
      !normalizedQuery ||
      faq.question.toLowerCase().includes(normalizedQuery) ||
      faq.answer.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

function buildFaqsHref({
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
  status?: FaqStatusFilter;
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

  return queryString ? `/admin/faqs?${queryString}` : "/admin/faqs";
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePage(value: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseStatus(value: string): FaqStatusFilter {
  return STATUS_OPTIONS.includes(value as FaqStatusFilter)
    ? (value as FaqStatusFilter)
    : "all";
}

function parseMode(value: string) {
  return value === "create" ? "create" : "list";
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
