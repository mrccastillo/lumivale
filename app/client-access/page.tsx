import Link from "next/link";

export default async function ClientAccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    sent?: string;
    preview?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const hasSent = params.sent === "1";
  const hasInvalidLinkError = params.error === "invalid-link";

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold text-stone-900">Client Access</h1>
      <p className="max-w-2xl text-stone-600">
        Enter your approved email address and we&apos;ll send a pricing access link.
      </p>

      <form
        action="/client-access/request"
        method="post"
        className="flex max-w-xl flex-col gap-4 rounded-[1.5rem] border border-stone-200 bg-white p-6"
      >
        <label htmlFor="email" className="text-sm font-semibold text-stone-900">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
          placeholder="client@example.com"
        />
        <button
          type="submit"
          className="inline-flex w-fit items-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-700"
        >
          Send magic link
        </button>
      </form>

      {hasSent ? (
        <p className="max-w-2xl rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          If that email is approved, a magic link is on its way.
        </p>
      ) : null}

      {hasInvalidLinkError ? (
        <p className="max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          That access link is invalid or expired. Request a fresh one.
        </p>
      ) : null}

      {params.preview ? (
        <div className="max-w-2xl rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          <p className="font-semibold">Development preview</p>
          <p className="mt-1">SMTP is not configured, so the magic link is shown here.</p>
          <Link href={params.preview} className="mt-3 inline-block underline">
            Open preview magic link
          </Link>
        </div>
      ) : null}
    </section>
  );
}
