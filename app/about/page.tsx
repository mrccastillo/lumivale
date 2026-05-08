import Image from "next/image";

const founders = [
  {
    id: "john-doe-growth",
    name: "John Doe",
    role: "Founder, Growth Strategy",
    imageSrc: "/founders/marc-castillo.svg",
    summary:
      "Shapes focused growth plans, keeps priorities clear, and helps founders turn early traction into repeatable customer activity.",
  },
  {
    id: "john-doe-creative",
    name: "John Doe",
    role: "Founder, Creative Operations",
    imageSrc: "/founders/arielle-santos.svg",
    summary:
      "Leads creator, content, and campaign execution with a practical eye for speed, consistency, and brand fit.",
  },
  {
    id: "john-doe-outreach",
    name: "John Doe",
    role: "Founder, Outreach Systems",
    imageSrc: "/founders/daniel-reyes.svg",
    summary:
      "Builds lean outbound systems across LinkedIn and email so early teams can test channels without unnecessary complexity.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#f7f8fb] text-[var(--lumivale-ink)]">
      <section className="bg-white px-6 py-16 pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-semibold leading-[1.04] text-[var(--lumivale-ink)] sm:text-4xl">
              Meet the founders
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[var(--lumivale-muted)] sm:text-base">
              Lumivale is run by a small founding team that pairs strategy,
              creative execution, and outreach systems for early-stage teams.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {founders.map((founder) => (
              <article
                key={founder.id}
                className="overflow-hidden rounded-lg border border-[var(--lumivale-line)] bg-white shadow-[0_18px_50px_rgba(42,47,82,0.05)]"
              >
                <div className="bg-[#f7f8fb]">
                  <Image
                    src={founder.imageSrc}
                    alt={`${founder.name} portrait illustration`}
                    width={640}
                    height={520}
                    className="aspect-[16/11] w-full object-cover"
                    priority
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-[1.25rem] font-semibold leading-tight text-[var(--lumivale-ink)]">
                    {founder.name}
                  </h2>
                  <p className="mt-2 text-xs font-semibold uppercase text-[var(--lumivale-accent)]">
                    {founder.role}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[var(--lumivale-muted)]">
                    {founder.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
