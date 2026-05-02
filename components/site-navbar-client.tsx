"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [surface, setSurface] = useState<NavSurface>("dark");
  const [pathname, setPathname] = useState("/");
  const [isScrolled, setIsScrolled] = useState(false);
  const isLight = surface === "light";

  useEffect(() => {
    const sampleY = 56;

    const updateSurface = () => {
      const surfaces = Array.from(
        document.querySelectorAll<HTMLElement>("[data-nav-surface]"),
      ).reverse();
      const activeSurface = surfaces.find((element) => {
        const rect = element.getBoundingClientRect();

        return rect.top <= sampleY && rect.bottom > sampleY;
      });

      setSurface((activeSurface?.dataset.navSurface as NavSurface) ?? "dark");
      setPathname(window.location.pathname || "/");
      setIsScrolled(window.scrollY > 8);
    };

    updateSurface();
    window.addEventListener("scroll", updateSurface, { passive: true });
    window.addEventListener("resize", updateSurface);

    return () => {
      window.removeEventListener("scroll", updateSurface);
      window.removeEventListener("resize", updateSurface);
    };
  }, []);

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

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${shellClass}`}>
      <div
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-5"
      >
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className={`grid size-8 place-items-center rounded-full text-sm ${logoChipClass}`}>
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
          className="inline-flex items-center rounded-full bg-[var(--lumivale-accent)] px-5 py-2.5 text-sm font-semibold text-[#010807] shadow-[0_14px_34px_rgba(20,201,131,0.22)] transition hover:bg-[var(--lumivale-accent-soft)]"
        >
          Contact Us
        </a>
      </div>
    </header>
  );
}
