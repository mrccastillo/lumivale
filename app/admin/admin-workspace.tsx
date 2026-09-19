"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content-defaults";

import {
  ADMIN_NAV_COLLAPSED_OFFSET_CLASS,
  ADMIN_NAV_EXPANDED_OFFSET_CLASS,
  AdminNav,
} from "@/app/admin/admin-nav";

import styles from "./workspace.module.css";

const pageTitles: Record<string, string> = {
  "/admin/site-content": "Site Content",
  "/admin/blogs": "Blogs",
  "/admin/services": "Services",
  "/admin/case-studies": "Case Studies",
  "/admin/testimonials": "Testimonials",
  "/admin/hero-clients": "Hero Clients",
  "/admin/faqs": "FAQs",
  "/admin/users": "Users",
  "/admin/trusted-clients": "Trusted Clients",
};

export function AdminWorkspace({ children, content = defaultSiteContent }: { children: ReactNode; content?: SiteContent }) {
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
      className={`${styles.shell} ${shellOffsetClass}`}
    >
      <AdminNav
        content={content}
        isDesktopExpanded={isDesktopExpanded}
        onDesktopToggle={() => setIsDesktopExpanded((expanded) => !expanded)}
      />
      <header aria-label="Admin header" className={styles.header}>
        <div>
          <p className={styles.headerTitle}>{title}</p>
          <p className={styles.headerSubtitle}>{content.brandName} staff portal</p>
        </div>
        <div className={styles.identity}>
          <span className={styles.avatar}>A</span>
          <span className="hidden sm:inline">Admin</span>
        </div>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}

function getPageTitle(pathname: string) {
  const match = Object.entries(pageTitles).find(([path]) =>
    pathname === path || pathname.startsWith(`${path}/`),
  );

  return match?.[1] ?? "Admin";
}
