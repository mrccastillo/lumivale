import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      data-nav-surface="dark"
      data-theme="dark"
      className="bg-[#010807] text-white"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-2xl font-semibold text-white">
            Lumivale
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#b9d9c8]">
            Light up your growth.
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
          <p className="text-sm uppercase text-[#8ebba4]">Get in touch</p>
          <p className="text-sm text-[#b9d9c8]">kenny.lumivale@gmail.com</p>
          <a
            href="https://www.linkedin.com/company/lumivale-agency/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="grid size-11 place-items-center rounded-full bg-[var(--lumivale-accent)] text-base font-bold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
          >
            <span aria-hidden="true">in</span>
          </a>
        </div>
      </div>
      <div className="border-t border-white/8 px-6 py-[17px]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-[#8ebba4] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p>lumivale.net</p>
            <Link
              href="/admin/login"
              aria-label="Admin login"
              className="grid size-3 place-items-center rounded-full bg-[#8ebba4] opacity-35 transition hover:opacity-80"
            >
              <span className="sr-only">Admin login</span>
            </Link>
          </div>
          <p>Simple, affordable growth support for early-stage teams.</p>
        </div>
      </div>
    </footer>
  );
}
