import { requireAdminAccess } from "@/lib/admin-auth";
import { getAdminUsers } from "@/lib/admin-users";
import { getMongoDb } from "@/lib/mongodb";

export default async function AdminUsersPage() {
  await requireAdminAccess();
  const db = await getMongoDb();
  const users = await getAdminUsers(db);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
            Users
          </h1>
        </div>
      </div>

      <form
        action="/api/admin/users"
        method="post"
        className="grid gap-5 rounded-lg border border-[var(--lumivale-line)] bg-white p-6 shadow-[0_20px_60px_rgba(42,47,82,0.06)] sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="grid gap-2 text-sm font-semibold text-[var(--lumivale-ink)]">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-lg border border-[var(--lumivale-line)] px-4 py-3 font-normal outline-none transition focus:border-[var(--lumivale-accent)]"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[var(--lumivale-ink)]">
          Initial password
          <input
            name="password"
            type="password"
            required
            className="rounded-lg border border-[var(--lumivale-line)] px-4 py-3 font-normal outline-none transition focus:border-[var(--lumivale-accent)]"
          />
        </label>
        <button
          type="submit"
          className="w-fit rounded-full bg-[var(--lumivale-accent)] px-6 py-3 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
        >
          Create admin
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-[var(--lumivale-line)] bg-white">
        {users.length ? (
          users.map((user) => (
            <article
              key={user.id}
              className="border-b border-[var(--lumivale-line)] p-5 last:border-b-0"
            >
              <h2 className="text-lg font-semibold text-[var(--lumivale-ink)]">
                {user.email}
              </h2>
              <p className="mt-2 text-sm text-[var(--lumivale-muted)]">
                Created {user.createdAt.toLocaleDateString("en-US")}
              </p>
            </article>
          ))
        ) : (
          <p className="p-6 text-sm text-[var(--lumivale-muted)]">No admins yet.</p>
        )}
      </div>
    </section>
  );
}
