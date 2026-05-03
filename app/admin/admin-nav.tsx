"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin/blogs", icon: "B", label: "Blogs" },
  { href: "/admin/testimonials", icon: "T", label: "Testimonials" },
  { href: "/admin/users", icon: "U", label: "Users" },
];

export function AdminNav() {
  const pathname = usePathname() || "/admin/blogs";
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <nav
      aria-label="Admin navigation"
      className={`pointer-events-none fixed left-0 top-0 z-40 h-screen border-r border-transparent transition-[width] duration-200 md:pointer-events-auto md:flex md:flex-col md:border-[var(--lumivale-line)] md:bg-white md:px-3 md:py-4 md:shadow-[12px_0_44px_rgba(42,47,82,0.06)] ${
        isDesktopExpanded ? "w-[17.5rem]" : "w-[5.5rem]"
      }`}
    >
      <div className="hidden items-center justify-between gap-3 px-1 md:flex">
        <Link href="/admin/blogs" className="flex min-w-0 items-center gap-3 font-semibold text-[var(--lumivale-ink)]">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-lg bg-[var(--lumivale-ink)] text-sm text-[var(--lumivale-accent-soft)]"
          >
            L
          </span>
          {isDesktopExpanded ? (
            <span className="truncate">
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lumivale-accent)]">
                Lumivale
              </span>
              <span className="block text-sm">Admin Portal</span>
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          aria-expanded={isDesktopExpanded}
          aria-label={isDesktopExpanded ? "Collapse navigation" : "Expand navigation"}
          onClick={() => setIsDesktopExpanded((expanded) => !expanded)}
          className="grid size-8 place-items-center rounded-lg border border-[var(--lumivale-line)] text-xs font-semibold text-[var(--lumivale-muted)] transition hover:border-[var(--lumivale-accent)] hover:text-[var(--lumivale-ink)]"
        >
          {isDesktopExpanded ? "<" : ">"}
        </button>
      </div>

      <div className="mt-8 hidden flex-1 flex-col gap-1 md:flex">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              title={isDesktopExpanded ? undefined : link.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#eafaf2] text-[var(--lumivale-ink)]"
                  : "text-[var(--lumivale-muted)] hover:bg-[#f7f8fb] hover:text-[var(--lumivale-ink)]"
              }`}
            >
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-md bg-white/70 text-xs ring-1 ring-[var(--lumivale-line)]"
              >
                {link.icon}
              </span>
              {isDesktopExpanded ? <span>{link.label}</span> : null}
            </Link>
          );
        })}
      </div>

      <form action="/api/admin/logout" method="post" className="mt-auto hidden md:block">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-md bg-red-50 text-xs"
          >
            X
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
