"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const adminLinks = [
  { href: "/admin/blogs", icon: BlogsIcon, label: "Blogs" },
  { href: "/admin/services", icon: ServicesIcon, label: "Services" },
  { href: "/admin/testimonials", icon: TestimonialsIcon, label: "Testimonials" },
  { href: "/admin/hero-clients", icon: HeroClientsIcon, label: "Hero Clients" },
  { href: "/admin/faqs", icon: FaqsIcon, label: "FAQs" },
  { href: "/admin/users", icon: UsersIcon, label: "Users" },
  { href: "/admin/trusted-clients", icon: TrustedClientsIcon, label: "Trusted Clients" },
];

export const ADMIN_NAV_EXPANDED_OFFSET_CLASS = "md:pl-[17.5rem]";
export const ADMIN_NAV_COLLAPSED_OFFSET_CLASS = "md:pl-[5.5rem]";

type AdminNavProps = {
  isDesktopExpanded: boolean;
  onDesktopToggle: () => void;
};

type IconProps = {
  className?: string;
};

export function AdminNav({ isDesktopExpanded, onDesktopToggle }: AdminNavProps) {
  const pathname = usePathname() || "/admin/blogs";
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <nav
      aria-label="Admin navigation"
      className={`pointer-events-none fixed left-0 top-0 z-40 h-screen border-r border-transparent transition-[width] duration-200 md:pointer-events-auto md:flex md:flex-col md:border-[var(--lumivale-line)] md:bg-white md:px-3 md:py-4 md:shadow-[12px_0_44px_rgba(42,47,82,0.06)] ${
        isDesktopExpanded ? "w-[17.5rem]" : "w-[5.5rem]"
      }`}
    >
      <div
        className={`hidden px-1 md:flex ${
          isDesktopExpanded ? "items-center justify-between gap-3" : "justify-center"
        }`}
      >
        {isDesktopExpanded ? (
          <Link
            href="/admin/blogs"
            className="flex min-w-0 items-center gap-3 font-semibold text-[var(--lumivale-ink)]"
          >
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-lg bg-[var(--lumivale-ink)] text-[var(--lumivale-accent-soft)]"
            >
              <LumivaleMarkIcon className="size-4" />
            </span>
            <span className="truncate">
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lumivale-accent)]">
                Lumivale
              </span>
              <span className="block text-sm">Admin Portal</span>
            </span>
          </Link>
        ) : null}
        <button
          type="button"
          aria-expanded={isDesktopExpanded}
          aria-label={isDesktopExpanded ? "Collapse navigation" : "Expand navigation"}
          onClick={onDesktopToggle}
          className="grid size-8 place-items-center rounded-lg border border-[var(--lumivale-line)] text-[var(--lumivale-muted)] transition hover:border-[var(--lumivale-accent)] hover:text-[var(--lumivale-ink)]"
        >
          <ChevronIcon direction={isDesktopExpanded ? "left" : "right"} className="size-4" />
        </button>
      </div>

      <div className="mt-8 hidden flex-1 flex-col gap-1 md:flex">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              title={isDesktopExpanded ? undefined : link.label}
              className={`flex items-center rounded-lg px-3 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#eafaf2] text-[var(--lumivale-ink)]"
                  : "text-[var(--lumivale-muted)] hover:bg-[#f7f8fb] hover:text-[var(--lumivale-ink)]"
              } ${isDesktopExpanded ? "gap-3" : "justify-center"}`}
            >
              <span
                aria-hidden="true"
                className={`grid size-7 shrink-0 place-items-center rounded-md ring-1 ${
                  isActive
                    ? "bg-white text-[var(--lumivale-ink)] ring-[#d9ede3]"
                    : "bg-white/70 text-[var(--lumivale-muted)] ring-[var(--lumivale-line)]"
                }`}
              >
                <Icon className="size-4" />
              </span>
              {isDesktopExpanded ? <span>{link.label}</span> : null}
            </Link>
          );
        })}
      </div>

      <form action="/api/admin/logout" method="post" className="mt-auto hidden md:block">
        <button
          type="submit"
          aria-label="Logout"
          title={isDesktopExpanded ? undefined : "Logout"}
          className={`flex w-full items-center rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 ${
            isDesktopExpanded ? "gap-3" : "justify-center"
          }`}
        >
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-md bg-red-50"
          >
            <LogoutIcon className="size-4" />
          </span>
          {isDesktopExpanded ? <span>Logout</span> : null}
        </button>
      </form>

      <button
        type="button"
        aria-controls="admin-mobile-menu"
        aria-expanded={isMobileOpen}
        aria-label={isMobileOpen ? "Close admin menu" : "Open admin menu"}
        onClick={() => setIsMobileOpen((open) => !open)}
        className="pointer-events-auto fixed left-4 top-4 z-50 grid size-10 place-items-center rounded-full border border-[var(--lumivale-line)] bg-white text-[var(--lumivale-ink)] shadow-[0_12px_30px_rgba(42,47,82,0.12)] md:hidden"
      >
        <span aria-hidden="true" className="flex w-4 flex-col gap-1">
          <span
            className={`h-0.5 rounded-full bg-current transition ${
              isMobileOpen ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 rounded-full bg-current transition ${
              isMobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 rounded-full bg-current transition ${
              isMobileOpen ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {isMobileOpen ? (
        <div
          id="admin-mobile-menu"
          className="pointer-events-auto fixed inset-x-4 top-16 z-50 grid gap-2 rounded-lg border border-[var(--lumivale-line)] bg-white p-2 shadow-[0_18px_45px_rgba(42,47,82,0.12)] md:hidden"
        >
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:bg-[#f7f8fb]"
            >
              {link.label}
            </Link>
          ))}
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </nav>
  );
}

function LumivaleMarkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 3v10h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BlogsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="3" width="10" height="10" rx="2" />
      <path d="M5.5 6h5M5.5 8h5M5.5 10h3.5" strokeLinecap="round" />
    </svg>
  );
}

function TestimonialsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 5.5a2.5 2.5 0 0 1 5 0c0 2-1.25 3-2.5 4" strokeLinecap="round" />
      <path d="M9 5.5a2.5 2.5 0 0 1 5 0c0 2-1.25 3-2.5 4" strokeLinecap="round" />
      <path d="M6.5 11.5h3" strokeLinecap="round" />
    </svg>
  );
}

function ServicesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3.5 4.5h9" strokeLinecap="round" />
      <path d="M3.5 8h9" strokeLinecap="round" />
      <path d="M3.5 11.5h5" strokeLinecap="round" />
      <circle cx="11.5" cy="11.5" r="1.5" />
    </svg>
  );
}

function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="5.5" r="2.25" />
      <path d="M4.5 12.5c.7-1.7 2-2.5 3.5-2.5s2.8.8 3.5 2.5" strokeLinecap="round" />
    </svg>
  );
}

function TrustedClientsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="3.25" width="10" height="9.5" rx="2" />
      <path d="M5.25 6.25h5.5M5.25 8.5h5.5M5.25 10.75h3.5" strokeLinecap="round" />
    </svg>
  );
}

function HeroClientsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2.75" y="4" width="10.5" height="8" rx="1.75" />
      <path d="M5 10.5 7 8.25l1.5 1.5L10 8l1.25 2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.75" cy="6.5" r=".75" />
    </svg>
  );
}

function FaqsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M6.25 6a1.75 1.75 0 1 1 3.14 1.05c-.52.67-1.39 1.12-1.39 2.2" strokeLinecap="round" />
      <path d="M8 11.75h.01" strokeLinecap="round" />
      <circle cx="8" cy="8" r="5.25" />
    </svg>
  );
}

function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M6 3.5H4.75A1.75 1.75 0 0 0 3 5.25v5.5c0 .97.78 1.75 1.75 1.75H6" strokeLinecap="round" />
      <path d="M8.5 5.5 11 8l-2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 8H11" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({
  className,
  direction,
}: IconProps & {
  direction: "left" | "right";
}) {
  const path = direction === "left" ? "M10 3.5 6 8l4 4.5" : "M6 3.5 10 8l-4 4.5";

  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
