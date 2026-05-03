export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  void searchParams;

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-32">
      <div>
        <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
          Lumivale
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
          Admin Login
        </h1>
      </div>

      <form
        action="/api/admin/login"
        method="post"
        className="flex flex-col gap-4 rounded-lg border border-[var(--lumivale-line)] bg-white p-6 shadow-[0_20px_60px_rgba(42,47,82,0.06)]"
      >
        <label htmlFor="email" className="text-sm font-semibold text-[var(--lumivale-ink)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-[var(--lumivale-line)] px-4 py-3 text-[var(--lumivale-ink)] outline-none transition focus:border-[var(--lumivale-accent)]"
        />

        <label htmlFor="password" className="text-sm font-semibold text-[var(--lumivale-ink)]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded-lg border border-[var(--lumivale-line)] px-4 py-3 text-[var(--lumivale-ink)] outline-none transition focus:border-[var(--lumivale-accent)]"
        />

        <button
          type="submit"
          className="mt-2 w-fit rounded-full bg-[var(--lumivale-accent)] px-6 py-3 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
        >
          Log in
        </button>
      </form>
    </section>
  );
}
