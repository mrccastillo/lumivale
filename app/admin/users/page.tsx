import { requireAdminAccess } from "@/lib/admin-auth";
import { type AdminUser, getAdminUsers } from "@/lib/admin-users";
import { getMongoDb } from "@/lib/mongodb";

const SORT_OPTIONS = ["newest", "oldest", "email"] as const;
const RANGE_OPTIONS = ["all", "recent", "older"] as const;
const RECENT_WINDOW_DAYS = 30;

type UserSort = (typeof SORT_OPTIONS)[number];
type UserRange = (typeof RANGE_OPTIONS)[number];

type AdminUsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps = {}) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const users = await getAdminUsers(db);
  const params = await searchParams;
  const query = firstValue(params?.q).trim();
  const sort = parseSort(firstValue(params?.sort));
  const range = parseRange(firstValue(params?.range));
  const visibleUsers = filterAndSortUsers(users, { query, range, sort });
  const newestUser = [...users].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  )[0];

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-panel)]">
          Admin Directory
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">Users</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
          Create admin access, review the current directory, and scan activity with
          a quieter workspace built for everyday operations.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total admins" value={users.length} note="All active admin accounts" />
        <MetricCard
          label="Visible results"
          value={visibleUsers.length}
          note="Matches the current search and range"
        />
        <MetricCard
          label="Newest account"
          value={newestUser ? formatShortDate(newestUser.createdAt) : "None"}
          note={newestUser ? "Most recently created admin" : "No admins yet"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[24px] border border-[var(--lumivale-admin-border)] bg-white p-6 shadow-[0_20px_60px_rgba(5,43,32,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lumivale-panel)]">
            Create Access
          </p>
          <h2 className="mt-3 text-xl font-semibold text-[var(--lumivale-ink)]">
            Add A New Admin
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
            Provision a new staff account with an email and temporary password.
          </p>

          <form action="/api/admin/users" method="post" className="mt-6 grid gap-4">
            <Field label="Email" name="email" type="email" required />
            <Field label="Initial password" name="password" type="password" required />
            <button
              type="submit"
              className="mt-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--lumivale-panel)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--lumivale-admin-panel-soft)]"
            >
              Create admin
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
                Current Admins
              </h2>
            </div>
            <p className="text-sm text-[var(--lumivale-muted)]">
              {visibleUsers.length} of {users.length} visible
            </p>
          </div>

          <form action="/admin/users" className="mt-5 rounded-[20px] border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto] lg:items-end">
              <div>
                <label
                  htmlFor="user-search"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]"
                >
                  Search
                </label>
                <input
                  id="user-search"
                  aria-label="Search admin email"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Search admin email"
                  className={fieldClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="user-sort"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]"
                >
                  Sort
                </label>
                <select
                  id="user-sort"
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

              <div>
                <label
                  htmlFor="user-range"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]"
                >
                  Range
                </label>
                <select
                  id="user-range"
                  name="range"
                  defaultValue={range}
                  aria-label="Range"
                  className={fieldClassName}
                >
                  <option value="all">All admins</option>
                  <option value="recent">Recent 30 days</option>
                  <option value="older">Older than 30 days</option>
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
            {users.length === 0 ? (
              <div className="p-8">
                <p className="text-lg font-semibold text-[var(--lumivale-ink)]">No admins yet.</p>
                <p className="mt-2 text-sm leading-7 text-[var(--lumivale-muted)]">
                  Use the create panel to provision the first admin account.
                </p>
              </div>
            ) : visibleUsers.length === 0 ? (
              <div className="p-8">
                <p className="text-lg font-semibold text-[var(--lumivale-ink)]">
                  No matching admins.
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--lumivale-muted)]">
                  Try a different search, or reset the range and sort controls.
                </p>
                <a
                  href="/admin/users"
                  className="mt-5 inline-flex rounded-xl border border-[var(--lumivale-admin-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--lumivale-panel)] transition hover:border-[var(--lumivale-panel)]"
                >
                  Clear filters
                </a>
              </div>
            ) : (
              visibleUsers.map((user) => (
                <article
                  key={user.id}
                  className="border-b border-[var(--lumivale-line)] px-5 py-4 last:border-b-0"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--lumivale-ink)]">
                        {user.email}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--lumivale-muted)]">
                        Created {formatLongDate(user.createdAt)}
                      </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lumivale-panel)]">
                      Admin access
                    </span>
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

function filterAndSortUsers(
  users: AdminUser[],
  {
    query,
    range,
    sort,
  }: {
    query: string;
    range: UserRange;
    sort: UserSort;
  },
) {
  const normalizedQuery = query.toLowerCase();
  const now = new Date();
  const recentCutoff = new Date(now.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  return [...users]
    .filter((user) => {
      const matchesQuery =
        !normalizedQuery || user.email.toLowerCase().includes(normalizedQuery);
      const matchesRange =
        range === "all" ||
        (range === "recent" && user.createdAt >= recentCutoff) ||
        (range === "older" && user.createdAt < recentCutoff);

      return matchesQuery && matchesRange;
    })
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

function parseSort(value: string): UserSort {
  return SORT_OPTIONS.includes(value as UserSort) ? (value as UserSort) : "newest";
}

function parseRange(value: string): UserRange {
  return RANGE_OPTIONS.includes(value as UserRange) ? (value as UserRange) : "all";
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
