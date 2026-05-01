import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold text-stone-900">About</h1>
      <p className="max-w-2xl text-stone-600">
        Placeholder copy for Lumivale background, point of view, and collaboration style.
      </p>
      <Link href="/case-studies" className="text-sm font-semibold text-stone-900 underline">
        Browse the case studies
      </Link>
    </section>
  );
}
