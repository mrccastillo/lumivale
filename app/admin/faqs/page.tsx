import Link from "next/link";

import { FaqForm } from "@/app/admin/faqs/faq-form";
import {
  FaqReorderList,
  type FaqReorderItem,
} from "@/app/admin/faqs/faq-reorder-list";
import { requireAdminAccess } from "@/lib/admin-auth";
import { type Faq, getAdminFaqs } from "@/lib/faqs";
import { getMongoDb } from "@/lib/mongodb";

const PAGE_SIZE = 6;
const HOMEPAGE_FAQ_LIMIT = 5;
const STATUS_OPTIONS = ["all", "published", "draft"] as const;
const VISIBILITY_OPTIONS = ["displayed", "not-displayed"] as const;

type FaqStatusFilter = (typeof STATUS_OPTIONS)[number];
type FaqVisibilityFilter = (typeof VISIBILITY_OPTIONS)[number];

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
  const visibility = parseVisibility(firstValue(params?.visibility));
  const mode = parseMode(firstValue(params?.mode));
  const errorMessage = firstValue(params?.error).trim();
  const requestedPage = parsePage(firstValue(params?.page));
  const displayedFaqIds = getDisplayedFaqIds(faqs);
  const visibilityFaqs = filterFaqsByVisibility(faqs, displayedFaqIds, visibility);
  const filteredFaqs = filterFaqs(visibilityFaqs, { query, status });
  const totalPages = Math.max(1, Math.ceil(filteredFaqs.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageFaqs = filteredFaqs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const reorderFaqs = pageFaqs.map(toFaqReorderItem);
  const canReorder = !query && status === "all";
  const publishedCount = pageFaqs.filter((faq) => faq.status === "published").length;
  const draftCount = pageFaqs.filter((faq) => faq.status === "draft").length;
  const displayedCount = displayedFaqIds.size;
  const notDisplayedCount = faqs.length - displayedCount;
  const baseHref = buildFaqsHref({
    page: currentPage,
    query,
    status,
    visibility,
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
              The homepage displays up to five published FAQs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={buildFaqsHref({ page: currentPage, query, status, visibility })}
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
          <MetricCard label="Displayed FAQs" value={displayedCount} note="Published FAQs currently shown on the homepage" />
          <MetricCard label="Not displayed" value={notDisplayedCount} note="Drafts and published FAQs outside the first five" />
          <MetricCard label="Published in view" value={publishedCount} note="Published answers in this tab and filter" />
          <MetricCard
            label="Drafts in view"
            value={draftCount}
            note="Questions still being prepared"
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
              Switch between homepage-visible FAQs and the backlog, search by
              question or answer, and drag cards in the unfiltered view to
              control FAQ order.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] px-5 py-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-admin-muted)]">
              Current view
            </p>
            <p className="mt-2 font-semibold text-[var(--lumivale-ink)]">
              {visibility === "displayed" ? "Displayed FAQs" : "Not displayed FAQs"}
            </p>
            <p className="mt-1 text-xs text-[var(--lumivale-admin-muted)]">
              Page {currentPage} of {totalPages} · {filteredFaqs.length} total FAQs
            </p>
          </div>
        </div>

        <nav aria-label="FAQ visibility" className="mt-6 flex flex-wrap gap-2">
          {VISIBILITY_OPTIONS.map((option) => (
            <Link
              key={option}
              href={buildFaqsHref({ query, status, visibility: option })}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                visibility === option
                  ? "border-[var(--lumivale-panel)] bg-[var(--lumivale-admin-chip)] text-[var(--lumivale-panel)]"
                  : "border-[var(--lumivale-admin-border)] text-[var(--lumivale-ink)] hover:border-[var(--lumivale-admin-border-strong)]"
              }`}
            >
              {option === "displayed"
                ? `Displayed (${displayedCount}/${HOMEPAGE_FAQ_LIMIT})`
                : `Not displayed (${notDisplayedCount})`}
            </Link>
          ))}
        </nav>

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
            <input type="hidden" name="visibility" value={visibility} />
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
                href={buildFaqsHref({ query, status: option, visibility })}
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

        {pageFaqs.length ? (
          <FaqReorderList
            allFaqIds={faqs.map((faq) => faq.id)}
            canReorder={canReorder}
            faqs={reorderFaqs}
            returnTo={baseHref}
          />
        ) : null}

        {!pageFaqs.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-dashed border-[var(--lumivale-admin-border)] p-8 text-center lg:col-span-2">
              <p className="text-lg font-semibold text-[var(--lumivale-ink)]">
                {faqs.length ? "No matching FAQs in this tab." : "No FAQs yet."}
              </p>
              <p className="mt-2 text-sm text-[var(--lumivale-admin-muted)]">
                {faqs.length
                  ? "Adjust search, status, or visibility filters to see more FAQs."
                  : "Create the first FAQ to start filling the public questions section."}
              </p>
              <Link
                href={faqs.length ? buildFaqsHref({ visibility }) : "/admin/faqs?mode=create"}
                className="mt-5 inline-flex rounded-lg bg-[var(--lumivale-panel)] px-5 py-3 text-sm font-semibold text-white"
              >
                {faqs.length ? "Clear filters" : "New FAQ"}
              </Link>
            </div>
          </div>
        ) : null}

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
                  visibility,
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
                href={buildFaqsHref({ page: currentPage + 1, query, status, visibility })}
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

function getDisplayedFaqIds(faqs: Faq[]) {
  return new Set(
    faqs
      .filter((faq) => faq.status === "published")
      .slice(0, HOMEPAGE_FAQ_LIMIT)
      .map((faq) => faq.id),
  );
}

function filterFaqsByVisibility(
  faqs: Faq[],
  displayedFaqIds: Set<string>,
  visibility: FaqVisibilityFilter,
) {
  return faqs.filter((faq) =>
    visibility === "displayed"
      ? displayedFaqIds.has(faq.id)
      : !displayedFaqIds.has(faq.id),
  );
}

function toFaqReorderItem(faq: Faq): FaqReorderItem {
  return {
    answer: faq.answer,
    id: faq.id,
    question: faq.question,
    status: faq.status,
  };
}

function buildFaqsHref({
  includePageOne = false,
  mode,
  page = 1,
  query = "",
  status = "all",
  visibility = "displayed",
}: {
  includePageOne?: boolean;
  mode?: "create";
  page?: number;
  query?: string;
  status?: FaqStatusFilter;
  visibility?: FaqVisibilityFilter;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (status !== "all") {
    params.set("status", status);
  }

  if (visibility !== "displayed") {
    params.set("visibility", visibility);
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

function parseVisibility(value: string): FaqVisibilityFilter {
  return VISIBILITY_OPTIONS.includes(value as FaqVisibilityFilter)
    ? (value as FaqVisibilityFilter)
    : "displayed";
}

function parseMode(value: string) {
  return value === "create" ? "create" : "list";
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
