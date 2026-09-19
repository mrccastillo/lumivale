import Link from "next/link";
import { getSiteContentForSite } from "@/lib/site-content";

export async function SiteFooter() {
  const content = await getSiteContentForSite();
  return (
    <footer
      data-nav-surface="dark"
      data-theme="dark"
      className="bg-[#010807] text-white"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-2xl font-semibold text-white">
            {content.footerBrandName}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#b9d9c8]">
            {content.footerTagline}
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-3 text-sm text-[#b9d9c8]">
          <Link href={content.footerHomeUrl} className="transition hover:text-white">
            {content.footerHomeLabel}
          </Link>
          <Link href={content.footerAboutUrl} className="transition hover:text-white">
            {content.footerAboutLabel}
          </Link>
          <Link href={content.footerBlogsUrl} className="transition hover:text-white">
            {content.footerBlogsLabel}
          </Link>
        </nav>
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm uppercase text-[#8ebba4]">{content.footerContactHeading}</p>
          <a href={`mailto:${content.footerEmail}`} className="break-all text-sm text-[#b9d9c8] transition hover:text-white">{content.footerEmail}</a>
          <a
            href={content.footerLinkedinUrl}
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
            <p>{content.footerSiteLabel}</p>
            <Link
              href="/admin/login"
              aria-label="Admin login"
              className="grid size-3 place-items-center rounded-full bg-[#8ebba4] opacity-35 transition hover:opacity-80"
            >
              <span className="sr-only">Admin login</span>
            </Link>
          </div>
          <p>{content.footerBottomText}</p>
        </div>
      </div>
    </footer>
  );
}
