import Image from "next/image";

const founderPhotoPlaceholder = "/founders/about-placeholder.jpg";

const founders = [
  {
    id: "john-doe-growth",
    name: "John Doe",
    role: "Founder, Growth Strategy",
    imageSrc: founderPhotoPlaceholder,
    summary:
      "Shapes focused growth plans, keeps priorities clear, and helps founders turn early traction into repeatable customer activity.",
  },
  {
    id: "john-doe-creative",
    name: "John Doe",
    role: "Founder, Creative Operations",
    imageSrc: founderPhotoPlaceholder,
    summary:
      "Leads creator, content, and campaign execution with a practical eye for speed, consistency, and brand fit.",
  },
  {
    id: "john-doe-outreach",
    name: "John Doe",
    role: "Founder, Outreach Systems",
    imageSrc: founderPhotoPlaceholder,
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

          <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
            {founders.map((founder) => (
              <article
                key={founder.id}
                tabIndex={0}
                className="group relative overflow-hidden rounded-lg border border-[var(--lumivale-line)] bg-[#f7f8fb] shadow-[0_18px_50px_rgba(42,47,82,0.05)] outline-none transition focus-visible:border-[var(--lumivale-accent)] focus-visible:ring-4 focus-visible:ring-[rgba(20,201,131,0.14)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={founder.imageSrc}
                    alt={`${founder.name} portrait photo`}
                    width={640}
                    height={720}
                    className="size-full object-cover grayscale transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-focus:scale-[1.06]"
                    priority
                  />
                  <Image
                    src={founder.imageSrc}
                    alt=""
                    aria-hidden="true"
                    width={640}
                    height={720}
                    className="absolute inset-0 size-full object-cover transition-[clip-path,transform] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] [clip-path:inset(100%_0_0_0)] group-hover:scale-[1.06] group-hover:[clip-path:inset(0_0_0_0)] group-focus:scale-[1.06] group-focus:[clip-path:inset(0_0_0_0)]"
                    priority
                  />
                </div>
                <div className="absolute inset-0 z-10 flex flex-col justify-end bg-[linear-gradient(180deg,rgba(3,20,16,0.02)_0%,rgba(3,20,16,0.54)_58%,rgba(3,20,16,0.88)_100%)] p-6 text-white opacity-0 transition duration-300 group-hover:opacity-100 group-focus:opacity-100">
                  <h2 className="text-[1.25rem] font-semibold leading-tight text-white">
                    {founder.name}
                  </h2>
                  <p className="mt-2 text-xs font-semibold uppercase text-[var(--lumivale-accent-soft)]">
                    {founder.role}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/82">
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
