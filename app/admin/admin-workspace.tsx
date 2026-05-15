"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  ADMIN_NAV_COLLAPSED_OFFSET_CLASS,
  ADMIN_NAV_EXPANDED_OFFSET_CLASS,
  AdminNav,
} from "@/app/admin/admin-nav";

const pageTitles: Record<string, string> = {
  "/admin/blogs": "Blogs",
  "/admin/services": "Services",
  "/admin/case-studies": "Case Studies",
  "/admin/testimonials": "Testimonials",
  "/admin/hero-clients": "Hero Clients",
  "/admin/faqs": "FAQs",
  "/admin/users": "Users",
  "/admin/trusted-clients": "Trusted Clients",
};

export function AdminWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/admin/blogs";
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const title = getPageTitle(pathname);
  const shellOffsetClass = isDesktopExpanded
    ? ADMIN_NAV_EXPANDED_OFFSET_CLASS
    : ADMIN_NAV_COLLAPSED_OFFSET_CLASS;

  return (
    <div
      data-testid="admin-workspace-shell"
      className={`min-h-screen bg-[#f7f8fb] text-[var(--lumivale-ink)] ${shellOffsetClass}`}
    >
      <AdminNav
        isDesktopExpanded={isDesktopExpanded}
        onDesktopToggle={() => setIsDesktopExpanded((expanded) => !expanded)}
      />
      <header
        aria-label="Admin header"
        className="sticky top-0 z-30 border-b border-[var(--lumivale-line)] bg-white/92 px-4 py-3 backdrop-blur-xl sm:px-6 md:px-8"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-[var(--lumivale-ink)]">{title}</p>
            <p className="text-xs text-[var(--lumivale-muted)]">Lumivale staff portal</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--lumivale-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--lumivale-ink)]">
            <span className="grid size-8 place-items-center rounded-full bg-[#31586a] text-white">
              A
            </span>
            <span className="hidden sm:inline">Admin</span>
          </div>
        </div>
      </header>
      <main className="px-4 py-8 sm:px-6 md:px-8">{children}</main>
    </div>
  );
}

function getPageTitle(pathname: string) {
  const match = Object.entries(pageTitles).find(([path]) =>
    pathname === path || pathname.startsWith(`${path}/`),
  );

  return match?.[1] ?? "Admin";
}
