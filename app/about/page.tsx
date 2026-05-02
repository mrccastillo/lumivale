const principles = [
  {
    title: "We keep it Simple.",
    copy: "No complex strategies or agency jargon. We focus on clear channels, practical activity, and growth work a lean team can understand.",
  },
  {
    title: "Make it Affordable.",
    copy: "You get focused growth support for a fraction of agency cost, with flat-rate packages and clear expectations before work starts.",
  },
  {
    title: "Ensure Excellence.",
    copy: "Lumivale brings hands-on startup experience and quality execution across experiments that help early teams find footing.",
  },
];

const capabilities = [
  "Comment campaigns",
  "UGC content",
  "Creator collabs",
  "LinkedIn outreach",
  "B2B email campaigns",
];

export default function AboutPage() {
  return (
    <div className="bg-white text-[var(--lumivale-ink)]">
      <section className="bg-white px-6 pb-24 pt-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
              About Lumivale
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-[var(--lumivale-ink)] sm:text-5xl">
              About Us
            </h1>
            <p className="mt-6 max-w-xl text-xl font-semibold leading-8 text-[var(--lumivale-ink)]">
              A compact growth partner for early-stage teams.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--lumivale-muted)] sm:text-lg">
              Lumivale is a growth partner for early-stage teams that need clear channels,
              affordable execution, and hands-on support without agency jargon.
            </p>
          </div>

          <div className="space-y-8">
            <div className="rounded-lg border border-[var(--lumivale-line)] bg-[#fbfcff] p-7 shadow-[0_20px_60px_rgba(42,47,82,0.06)]">
              <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
                What we support
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="rounded-full border border-[var(--lumivale-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--lumivale-ink)]"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {principles.map((principle) => (
                <article
                  key={principle.title}
                  className="rounded-lg border border-[var(--lumivale-line)] bg-white p-6"
                >
                  <h2 className="text-xl font-semibold text-[var(--lumivale-ink)]">
                    {principle.title}
                  </h2>
                  <p className="mt-3 leading-7 text-[var(--lumivale-muted)]">
                    {principle.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
