"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavSurface = "dark" | "light";
type SiteNavbarLink = {
  href: string;
  label: string;
};

type SiteNavbarClientProps = {
  calendlyUrl: string;
  hasTrustedAccess: boolean;
  publicLinks: readonly SiteNavbarLink[];
};

export function SiteNavbarClient({
  calendlyUrl,
  hasTrustedAccess,
  publicLinks,
}: SiteNavbarClientProps) {
  const pathname = usePathname() || "/";
  const [surface, setSurface] = useState<NavSurface>("dark");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLight = surface === "light";
  const sampleY = 56;
  const closeMenu = () => setIsMenuOpen(false);

  const updateSurface = () => {
    const surfaces = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-surface]"),
    ).reverse();
    const activeSurface = surfaces.find((element) => {
      const rect = element.getBoundingClientRect();

      return rect.top <= sampleY && rect.bottom > sampleY;
    });

    setSurface((activeSurface?.dataset.navSurface as NavSurface) ?? "dark");
    setIsScrolled(window.scrollY > 8);
  };

  useEffect(() => {
    const updateTimeout = window.setTimeout(updateSurface, 0);

    window.addEventListener("scroll", updateSurface, { passive: true });
    window.addEventListener("resize", updateSurface);

    return () => {
      window.clearTimeout(updateTimeout);
      window.removeEventListener("scroll", updateSurface);
      window.removeEventListener("resize", updateSurface);
    };
  }, []);

  useEffect(() => {
    const updateTimeout = window.setTimeout(() => {
      updateSurface();
      closeMenu();
    }, 0);

    return () => window.clearTimeout(updateTimeout);
  }, [pathname]);

  const shellClass = isLight
    ? "border-[var(--lumivale-line)] bg-white text-[var(--lumivale-ink)]"
    : isScrolled
      ? "border-white/10 bg-[#031410]/68 text-white shadow-[0_16px_42px_rgba(0,0,0,0.22)] backdrop-blur-xl"
      : "border-transparent bg-transparent text-white";
  const logoChipClass = isLight
    ? "bg-[var(--lumivale-ink)] text-[var(--lumivale-accent-soft)]"
    : "bg-[var(--lumivale-accent-soft)]/14 text-[var(--lumivale-accent-soft)] ring-1 ring-white/10";
  const navListClass = isLight ? "text-[var(--lumivale-muted)]" : "text-[#c7e7d7]";
  const navItemBase = isLight
    ? "hover:text-[var(--lumivale-ink)]"
    : "hover:text-white";
  const navItemActive = isLight
    ? "text-[var(--lumivale-ink)]"
    : "text-white";
  const mobileButtonClass = isLight
    ? "border-[var(--lumivale-line)] bg-white text-[var(--lumivale-ink)]"
    : "border-white/12 bg-white/10 text-white";
  const mobilePanelClass = isLight
    ? "border-[var(--lumivale-line)] bg-white text-[var(--lumivale-ink)] shadow-[0_18px_45px_rgba(42,47,82,0.12)]"
    : "border-white/10 bg-[#031410]/92 text-white shadow-[0_22px_54px_rgba(0,0,0,0.32)] backdrop-blur-xl";
  const mobileLinkClass = isLight
    ? "border-[var(--lumivale-line)] text-[var(--lumivale-muted)] hover:text-[var(--lumivale-ink)]"
    : "border-white/10 text-[#c7e7d7] hover:text-white";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${shellClass}`}>
      <div
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5"
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 text-base font-semibold sm:gap-3 sm:text-lg"
        >
          <span className={`grid size-7 place-items-center rounded-full text-xs sm:size-8 sm:text-sm ${logoChipClass}`}>
            L
          </span>
          Lumivale
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className={`flex items-center gap-8 text-sm font-medium ${navListClass}`}>
            {publicLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`transition ${
                      isActive ? navItemActive : ""
                    } ${navItemBase}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {hasTrustedAccess ? (
              <li>
                <Link
                  href="/pricing"
                  className={`transition ${
                    pathname === "/pricing" ? navItemActive : ""
                  } ${navItemBase}`}
                >
                  Pricing
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>

        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center rounded-full bg-[var(--lumivale-accent)] px-5 py-2.5 text-sm font-semibold text-[#010807] shadow-[0_14px_34px_rgba(20,201,131,0.22)] transition hover:bg-[var(--lumivale-accent-soft)] md:inline-flex"
        >
          Contact Us
        </a>

        <button
          type="button"
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
          className={`grid size-10 place-items-center rounded-full border transition md:hidden ${mobileButtonClass}`}
        >
          <span aria-hidden="true" className="flex w-4 flex-col gap-1">
            <span
              className={`h-0.5 rounded-full bg-current transition ${
                isMenuOpen ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 rounded-full bg-current transition ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 rounded-full bg-current transition ${
                isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {isMenuOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className={`mx-4 mb-4 rounded-lg border p-3 md:hidden ${mobilePanelClass}`}
        >
          <div className="flex flex-col">
            {publicLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`border-b px-3 py-3 text-sm font-medium transition last:border-b-0 ${
                    isActive ? navItemActive : ""
                  } ${mobileLinkClass}`}
                >
                  {link.label}
                </Link>
              );
            })}
            {hasTrustedAccess ? (
              <Link
                href="/pricing"
                onClick={closeMenu}
                className={`border-b px-3 py-3 text-sm font-medium transition ${
                  pathname === "/pricing" ? navItemActive : ""
                } ${mobileLinkClass}`}
              >
                Pricing
              </Link>
            ) : null}
          </div>
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="mt-3 flex items-center justify-center rounded-full bg-[var(--lumivale-accent)] px-5 py-2.5 text-sm font-semibold text-[#010807] shadow-[0_12px_28px_rgba(20,201,131,0.24)] transition hover:bg-[var(--lumivale-accent-soft)]"
          >
            Book a call
          </a>
        </nav>
      ) : null}
    </header>
  );
}
