import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { type TrustedClient, getTrustedClients } from "@/lib/trusted-clients";

const SORT_OPTIONS = ["newest", "oldest", "email"] as const;

type TrustedClientSort = (typeof SORT_OPTIONS)[number];

type AdminTrustedClientsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function AdminTrustedClientsPage({
  searchParams,
}: AdminTrustedClientsPageProps = {}) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const clients = await getTrustedClients(db);
  const params = await searchParams;
  const query = firstValue(params?.q).trim();
  const sort = parseSort(firstValue(params?.sort));
  const status = firstValue(params?.status);
  const error = firstValue(params?.error);
  const visibleClients = filterAndSortTrustedClients(clients, { query, sort });
  const newestClient = [...clients].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  )[0];

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-panel)]">
          Pricing Access
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
          Trusted Clients
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
          Approve client emails that can request private pricing links.
        </p>
      </header>

      {status === "created" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Trusted client added.
        </p>
      ) : null}
      {status === "removed" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Trusted client removed.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total trusted clients"
          value={clients.length}
          note="All approved pricing emails"
        />
        <MetricCard
          label="Visible results"
          value={visibleClients.length}
          note="Matches the current search"
        />
        <MetricCard
          label="Newest approval"
          value={newestClient ? formatShortDate(newestClient.createdAt) : "None"}
          note={newestClient ? "Most recently approved email" : "No trusted clients yet"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[24px] border border-[var(--lumivale-admin-border)] bg-white p-6 shadow-[0_20px_60px_rgba(5,43,32,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lumivale-panel)]">
            Create Access
          </p>
          <h2 className="mt-3 text-xl font-semibold text-[var(--lumivale-ink)]">
            Add Trusted Client
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
            Approved emails can request private pricing access links from the client
            access page.
          </p>

          <form action="/api/admin/trusted-clients" method="post" className="mt-6 grid gap-4">
            <Field label="Email" name="email" required type="email" />
            <button
              type="submit"
              className="mt-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--lumivale-panel)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--lumivale-admin-panel-soft)]"
            >
              Add trusted client
            </button>
          </form>
        </section>

        <section className="rounded-[24px] border border-[var(--lumivale-admin-border)] bg-white p-6 shadow-[0_20px_60px_rgba(5,43,32,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lumivale-panel)]">
                Browse
              </p>
              <h2 className="mt-3 text-xl font-semibold text-[var(--lumivale-ink)]">
                Approved Email List
              </h2>
            </div>
            <p className="text-sm text-[var(--lumivale-muted)]">
              {visibleClients.length} of {clients.length} visible
            </p>
          </div>

          <form
            action="/admin/trusted-clients"
            className="mt-5 rounded-[20px] border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4"
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto] lg:items-end">
              <div>
                <label
                  htmlFor="trusted-client-search"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]"
                >
                  Search
                </label>
                <input
                  id="trusted-client-search"
                  aria-label="Search trusted client email"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Search trusted client email"
                  className={fieldClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="trusted-client-sort"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]"
                >
                  Sort
                </label>
                <select
                  id="trusted-client-sort"
                  name="sort"
                  defaultValue={sort}
                  aria-label="Sort"
                  className={fieldClassName}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="email">Email A-Z</option>
                </select>
              </div>

              <button
                type="submit"
                className="min-h-12 rounded-xl border border-[var(--lumivale-admin-border)] bg-white px-5 text-sm font-semibold text-[var(--lumivale-panel)] transition hover:border-[var(--lumivale-panel)]"
              >
                Apply
              </button>
            </div>
          </form>

          <div className="mt-5 overflow-hidden rounded-[20px] border border-[var(--lumivale-admin-border)] bg-[#fcfdff]">
            {clients.length === 0 ? (
              <div className="p-8">
                <p className="text-lg font-semibold text-[var(--lumivale-ink)]">
                  No trusted clients yet.
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--lumivale-muted)]">
                  Use the create panel to approve the first pricing-access email.
                </p>
              </div>
            ) : visibleClients.length === 0 ? (
              <div className="p-8">
                <p className="text-lg font-semibold text-[var(--lumivale-ink)]">
                  No matching trusted clients.
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--lumivale-muted)]">
                  Try a different search or reset the sort controls.
                </p>
                <a
                  href="/admin/trusted-clients"
                  className="mt-5 inline-flex rounded-xl border border-[var(--lumivale-admin-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--lumivale-panel)] transition hover:border-[var(--lumivale-panel)]"
                >
                  Clear filters
                </a>
              </div>
            ) : (
              visibleClients.map((client) => (
                <article
                  key={client.id}
                  className="border-b border-[var(--lumivale-line)] px-5 py-4 last:border-b-0"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--lumivale-ink)]">
                        {client.email}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--lumivale-muted)]">
                        Created {formatLongDate(client.createdAt)}
                      </p>
                    </div>
                    <form action={`/api/admin/trusted-clients/${client.id}`} method="post">
                      <button
                        type="submit"
                        className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)] transition hover:border-[var(--lumivale-panel)]"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  required,
  type,
}: {
  label: string;
  name: string;
  required?: boolean;
  type: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]"
      >
        {label}
      </label>
      <input id={name} name={name} required={required} type={type} className={fieldClassName} />
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
    <article className="rounded-[20px] border border-[var(--lumivale-admin-border)] bg-white px-5 py-4 shadow-[0_16px_44px_rgba(5,43,32,0.05)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-panel)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[var(--lumivale-ink)]">{value}</p>
      <p className="mt-2 text-xs text-[var(--lumivale-muted)]">{note}</p>
    </article>
  );
}

function filterAndSortTrustedClients(
  clients: TrustedClient[],
  {
    query,
    sort,
  }: {
    query: string;
    sort: TrustedClientSort;
  },
) {
  const normalizedQuery = query.toLowerCase();

  return [...clients]
    .filter((client) =>
      !normalizedQuery || client.email.toLowerCase().includes(normalizedQuery),
    )
    .sort((left, right) => {
      if (sort === "oldest") {
        return left.createdAt.getTime() - right.createdAt.getTime();
      }

      if (sort === "email") {
        return left.email.localeCompare(right.email);
      }

      return right.createdAt.getTime() - left.createdAt.getTime();
    });
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseSort(value: string): TrustedClientSort {
  return SORT_OPTIONS.includes(value as TrustedClientSort)
    ? (value as TrustedClientSort)
    : "newest";
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const fieldClassName =
  "min-h-12 w-full rounded-[16px] border border-[var(--lumivale-line)] bg-white px-4 py-3 text-sm text-[var(--lumivale-ink)] outline-none transition focus:border-[var(--lumivale-accent)]";
