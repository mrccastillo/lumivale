import Link from "next/link";

import { CALENDLY_URL } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer data-nav-surface="dark" data-theme="dark" className="bg-[var(--lumivale-ink)] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-2xl font-semibold text-white">
            Lumivale
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#b9d9c8]">
            Premium websites for service brands.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-3 text-sm text-[#b9d9c8]">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <Link href="/about" className="transition hover:text-white">
            About
          </Link>
          <Link href="/blogs" className="transition hover:text-white">
            Blogs
          </Link>
        </nav>
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm uppercase text-[#8ebba4]">Ready for a sharper presence?</p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[var(--lumivale-accent)] px-5 py-3 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
          >
            Book a call
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-[#8ebba4] sm:flex-row sm:items-center sm:justify-between">
          <p>lumivale.net</p>
          <p>Modern SaaS-grade web presence for expert-led service teams.</p>
        </div>
      </div>
    </footer>
  );
}
