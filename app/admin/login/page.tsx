export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  void searchParams;

  return (
    <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f8fb_0%,#f3f6f5_100%)] px-6 py-10 sm:px-8 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,201,131,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(69,215,180,0.12),transparent_28%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0))]"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <div className="w-full">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-accent)]">
              Lumivale
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--lumivale-ink)] sm:text-[2.85rem]">
              Admin Login
            </h1>
          </div>

          <form
            action="/api/admin/login"
            method="post"
            className="rounded-[28px] border border-[rgba(207,221,213,0.85)] bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_32px_100px_rgba(5,43,32,0.10)] backdrop-blur-xl sm:p-8"
          >
            <div className="flex flex-col gap-5">
              <Field label="Email" name="email" type="email" />
              <Field label="Password" name="password" type="password" />
            </div>

            <button
              type="submit"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--lumivale-accent)] px-7 text-sm font-semibold text-[#02110d] shadow-[0_10px_24px_rgba(20,201,131,0.24)] transition hover:bg-[var(--lumivale-accent-soft)]"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type,
}: {
  label: string;
  name: string;
  type: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        className="min-h-14 w-full rounded-[18px] border border-[rgba(207,221,213,0.92)] bg-[rgba(255,255,255,0.88)] px-4 py-3 text-[15px] text-[var(--lumivale-ink)] outline-none transition placeholder:text-[rgba(104,112,138,0.7)] focus:border-[var(--lumivale-accent)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(20,201,131,0.10)]"
      />
    </div>
  );
}
