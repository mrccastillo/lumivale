import { HeroClientForm } from "@/app/admin/hero-clients/hero-client-form";
import { requireAdminAccess } from "@/lib/admin-auth";
import { type HeroClient, getHeroClients } from "@/lib/hero-clients";
import { getMongoDb } from "@/lib/mongodb";

type AdminHeroClientsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function AdminHeroClientsPage({
  searchParams,
}: AdminHeroClientsPageProps = {}) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const clients = await getHeroClients(db);
  const params = await searchParams;
  const status = firstValue(params?.status);
  const error = firstValue(params?.error);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-panel)]">
          Homepage Content
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
          Hero Clients
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
          Manage the client names and logos displayed in the homepage hero marquee.
        </p>
      </header>

      {status === "created" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Hero client added.
        </p>
      ) : null}
      {status === "removed" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Hero client removed.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Displayed clients"
          value={clients.length}
          note="Client logos currently powering the hero"
        />
        <MetricCard
          label="Fallback state"
          value={clients.length ? "Managed" : "Default"}
          note={clients.length ? "Using saved client logos" : "Using default text labels"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-[24px] border border-[var(--lumivale-admin-border)] bg-white p-6 shadow-[0_20px_60px_rgba(5,43,32,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lumivale-panel)]">
            Add Logo
          </p>
          <h2 className="mt-3 text-xl font-semibold text-[var(--lumivale-ink)]">
            New Hero Client
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
            Add a client name and drag in the logo image. Logos appear in the dark hero marquee.
          </p>

          <HeroClientForm />
        </section>

        <section className="rounded-[24px] border border-[var(--lumivale-admin-border)] bg-white p-6 shadow-[0_20px_60px_rgba(5,43,32,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lumivale-panel)]">
                Browse
              </p>
              <h2 className="mt-3 text-xl font-semibold text-[var(--lumivale-ink)]">
                Hero Client List
              </h2>
            </div>
            <p className="text-sm text-[var(--lumivale-muted)]">
              {clients.length} total
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-[20px] border border-[var(--lumivale-admin-border)] bg-[#fcfdff]">
            {clients.length === 0 ? (
              <div className="p-8">
                <p className="text-lg font-semibold text-[var(--lumivale-ink)]">
                  No hero clients yet.
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--lumivale-muted)]">
                  Add the first logo to replace the default hero marquee labels.
                </p>
              </div>
            ) : (
              clients.map((client) => <HeroClientCard key={client.id} client={client} />)
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function HeroClientCard({ client }: { client: HeroClient }) {
  return (
    <article className="border-b border-[var(--lumivale-line)] px-5 py-4 last:border-b-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-14 w-24 place-items-center rounded-xl border border-[var(--lumivale-admin-border)] bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={client.logoUrl}
              alt={`${client.clientName} logo`}
              className="max-h-8 max-w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[var(--lumivale-ink)]">
              {client.clientName}
            </h3>
            <p className="mt-1 truncate text-xs text-[var(--lumivale-muted)]">
              {client.logoUrl}
            </p>
          </div>
        </div>
        <form action={`/api/admin/hero-clients/${client.id}`} method="post">
          <button
            type="submit"
            className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)] transition hover:border-[var(--lumivale-panel)]"
          >
            Remove
          </button>
        </form>
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
    <article className="rounded-[20px] border border-[var(--lumivale-admin-border)] bg-white px-5 py-4 shadow-[0_16px_44px_rgba(5,43,32,0.05)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-panel)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[var(--lumivale-ink)]">{value}</p>
      <p className="mt-2 text-xs text-[var(--lumivale-muted)]">{note}</p>
    </article>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
