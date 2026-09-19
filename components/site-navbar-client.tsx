"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content-defaults";

import styles from "./site-navbar.module.css";

type NavSurface = "dark" | "light";
type SiteNavbarLink = {
  href: string;
  label: string;
};

type SiteNavbarClientProps = {
  content?: SiteContent;
  calendlyUrl: string;
  hasTrustedAccess: boolean;
  publicLinks: readonly SiteNavbarLink[];
};

export function SiteNavbarClient({
  content = defaultSiteContent,
  calendlyUrl,
  hasTrustedAccess,
  publicLinks,
}: SiteNavbarClientProps) {
  const pathname = usePathname() || "/";
  const isPricingActive = pathname === "/pricing" || pathname.startsWith("/pricing/");
  const [activeSection, setActiveSection] = useState("/");
  const [surface, setSurface] = useState<NavSurface>("dark");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1100) setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (pathname !== "/") return;
    const updateActiveSection = () => {
      const threshold = 120;
      let active = "/";
      publicLinks.forEach((link) => {
        if (!link.href.startsWith("/#")) return;
        const section = document.getElementById(link.href.slice(2));
        if (section && section.getBoundingClientRect().top <= threshold) active = link.href;
      });
      setActiveSection(active);
    };
    const frame = requestAnimationFrame(updateActiveSection);
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [pathname, publicLinks]);

  const isLinkActive = (href: string) => pathname === "/"
    ? activeSection === href
    : !href.includes("#") && href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));
  const sectionHref = (href: string) => href === "/" ? "/#hero" : href;
  const navigateSection = (event: { preventDefault: () => void }, href: string) => {
    closeMenu();
    if (pathname !== "/" || !sectionHref(href).startsWith("/#")) return;
    event.preventDefault();
    window.history.pushState(null, "", sectionHref(href));
    window.dispatchEvent(new Event("homepage:navigate"));
  };

  const shellClass = isLight ? styles.light : styles.dark;
  const logoChipClass = styles.mark;
  const navListClass = styles.links;
  const navItemBase = styles.link;
  const navItemActive = styles.active;
  const mobileButtonClass = styles.menuButton;
  const mobilePanelClass = styles.mobilePanel;
  const mobileLinkClass = styles.mobileLink;

  return (
    <header data-surface={surface} data-scrolled={isScrolled} className={`${styles.header} ${shellClass}`}>
      <div
        className={styles.inner}
      >
        <Link
          href="/#hero"
          scroll={false}
          onNavigate={(event) => navigateSection(event, "/")}
          onClick={closeMenu}
          className={styles.brand}
        >
          {content.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.logoUrl} alt="" className={styles.logo} />
          ) : (
            <span aria-hidden="true" className={logoChipClass}>
              {content.logoText}
            </span>
          )}
          {content.brandName}
        </Link>

        <nav aria-label="Primary" className={styles.desktopNav}>
          <ul className={navListClass}>
            {publicLinks.map((link) => {
              const isActive = isLinkActive(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={sectionHref(link.href)}
                    scroll={link.href !== "/" && !link.href.startsWith("/#")}
                    onNavigate={(event) => navigateSection(event, link.href)}
                    aria-current={isActive ? "page" : undefined}
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
                  aria-current={isPricingActive ? "page" : undefined}
                  className={`transition ${
                    isPricingActive ? navItemActive : ""
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
          className={`${styles.cta} ${styles.desktopCta}`}
        >
          Contact Us <span aria-hidden="true">&#8599;</span>
        </a>

        <button
          ref={menuButton}
          type="button"
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
          className={mobileButtonClass}
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
          className={mobilePanelClass}
        >
          <div className="flex flex-col">
            {publicLinks.map((link) => {
              const isActive = isLinkActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={sectionHref(link.href)}
                    scroll={link.href !== "/" && !link.href.startsWith("/#")}
                    onNavigate={(event) => navigateSection(event, link.href)}
                  onClick={closeMenu}
                  aria-current={isActive ? "page" : undefined}
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
                  isPricingActive ? navItemActive : ""
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
            className={styles.cta}
          >
            Book a call <span aria-hidden="true">&#8599;</span>
          </a>
        </nav>
      ) : null}
    </header>
  );
}
