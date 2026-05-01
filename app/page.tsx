import Link from "next/link";

import { getAllCaseStudies } from "@/lib/case-studies";

export default function Home() {
  const caseStudies = getAllCaseStudies();

  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(193,180,151,0.28),_transparent_38%),linear-gradient(180deg,_#fffdf8_0%,_#f5efe4_100%)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-12">
        <section
          id="hero"
          className="rounded-[2rem] border border-stone-200 bg-white/85 px-8 py-16 shadow-[0_20px_80px_rgba(77,56,28,0.08)]"
        >
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Lumivale headline placeholder.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-stone-600">
            Short subcopy placeholder for positioning, audience, and next step.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/case-studies"
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-700"
            >
              View case studies
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-900"
            >
              Learn about Lumivale
            </Link>
          </div>
        </section>

        <section id="case-studies" className="py-16">
          <h2 className="text-2xl font-semibold text-stone-900">Case studies</h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            Placeholder previews sourced from the shared local dataset.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {caseStudies.map((study) => (
              <article
                key={study.slug}
                className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-6"
              >
                <h3 className="text-lg font-semibold text-stone-900">
                  <Link href={`/case-studies/${study.slug}`}>{study.title}</Link>
                </h3>
                <p className="mt-3 text-sm text-stone-600">{study.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="services" className="py-16">
          <h2 className="text-2xl font-semibold text-stone-900">Services</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {["Strategy", "Messaging", "Delivery"].map((service) => (
              <article
                key={service}
                className="rounded-[1.5rem] border border-stone-200 bg-white/75 p-6"
              >
                <h3 className="text-lg font-semibold text-stone-900">{service}</h3>
                <p className="mt-3 text-sm text-stone-650">
                  Placeholder service description for {service.toLowerCase()}.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="testimonials" className="py-16">
          <h2 className="text-2xl font-semibold text-stone-900">Testimonials</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {["Client quote placeholder one.", "Client quote placeholder two."].map(
              (quote) => (
                <blockquote
                  key={quote}
                  className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-6 text-stone-700"
                >
                  {quote}
                </blockquote>
              ),
            )}
          </div>
        </section>

        <section id="faqs" className="py-16">
          <h2 className="text-2xl font-semibold text-stone-900">FAQs</h2>
          <div className="mt-8 space-y-4">
            {[
              {
                question: "What belongs here?",
                answer: "Placeholder answer for a common client question.",
              },
              {
                question: "How does engagement begin?",
                answer: "Placeholder answer for intake and discovery details.",
              },
            ].map((faq) => (
              <article
                key={faq.question}
                className="rounded-[1.25rem] border border-stone-200 bg-white/75 p-6"
              >
                <h3 className="text-lg font-semibold text-stone-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-stone-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
