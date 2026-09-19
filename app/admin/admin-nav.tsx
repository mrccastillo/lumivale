"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content-defaults";

import styles from "./workspace.module.css";

const adminLinks = [
  { href: "/admin/site-content", icon: ServicesIcon, label: "Site Content" },
  { href: "/admin/blogs", icon: BlogsIcon, label: "Blogs" },
  { href: "/admin/services", icon: ServicesIcon, label: "Services" },
  { href: "/admin/case-studies", icon: CaseStudiesIcon, label: "Case Studies" },
  { href: "/admin/testimonials", icon: TestimonialsIcon, label: "Testimonials" },
  { href: "/admin/hero-clients", icon: HeroClientsIcon, label: "Hero Clients" },
  { href: "/admin/faqs", icon: FaqsIcon, label: "FAQs" },
  { href: "/admin/users", icon: UsersIcon, label: "Users" },
  { href: "/admin/trusted-clients", icon: TrustedClientsIcon, label: "Trusted Clients" },
];

export const ADMIN_NAV_EXPANDED_OFFSET_CLASS = "md:pl-[17.5rem]";
export const ADMIN_NAV_COLLAPSED_OFFSET_CLASS = "md:pl-[5.5rem]";

type AdminNavProps = {
  content?: SiteContent;
  isDesktopExpanded: boolean;
  onDesktopToggle: () => void;
};

type IconProps = {
  className?: string;
};

export function AdminNav({ content = defaultSiteContent, isDesktopExpanded, onDesktopToggle }: AdminNavProps) {
  const pathname = usePathname() || "/admin/blogs";
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const links = (mobile = false) => adminLinks.map((link) => {
    const Icon = link.icon;
    const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
    return <Link key={link.href} href={link.href} aria-label={link.label}
      aria-current={active ? "page" : undefined}
      title={!mobile && !isDesktopExpanded ? link.label : undefined}
      onClick={mobile ? () => setIsMobileOpen(false) : undefined} className={styles.navLink}>
      <span aria-hidden="true" className={styles.navIcon}><Icon className="size-4" /></span>
      {mobile || isDesktopExpanded ? <span>{link.label}</span> : null}
    </Link>;
  });
  const logout = (mobile = false) => <form action="/api/admin/logout" method="post" className={styles.logoutForm}>
    <button type="submit" aria-label="Logout" title={!mobile && !isDesktopExpanded ? "Logout" : undefined} className={styles.logout}>
      <span aria-hidden="true" className={styles.navIcon}><LogoutIcon className="size-4" /></span>
      {mobile || isDesktopExpanded ? <span>Logout</span> : null}
    </button>
  </form>;
  return <nav aria-label="Admin navigation"
    onKeyDown={(event) => { if (event.key === "Escape" && isMobileOpen) { setIsMobileOpen(false); mobileToggle.current?.focus(); } }}
    className={`left-0 top-0 h-screen ${styles.sidebar} ${isDesktopExpanded ? styles.sidebarExpanded : styles.sidebarCollapsed}`}>
    <div className={styles.navTop}>
      {isDesktopExpanded ? <Link href="/admin/blogs" className={styles.brand}>
        <span aria-hidden="true" className={styles.brandMark}>
          {content.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.logoUrl} alt="" />
          ) : content.logoText}
        </span>
        <span><span className={styles.brandName}>{content.brandName}</span><span className={styles.brandCaption}>Admin Portal</span></span>
      </Link> : null}
      <button type="button" aria-expanded={isDesktopExpanded}
        aria-label={isDesktopExpanded ? "Collapse navigation" : "Expand navigation"}
        onClick={onDesktopToggle} className={styles.collapse}>
        <ChevronIcon direction={isDesktopExpanded ? "left" : "right"} className="size-4" />
      </button>
    </div>
    <div className={styles.navLinks}>{links()}</div>
    {logout()}
    <button ref={mobileToggle} type="button" aria-controls="admin-mobile-menu" aria-expanded={isMobileOpen}
      aria-label={isMobileOpen ? "Close admin menu" : "Open admin menu"}
      onClick={() => setIsMobileOpen((open) => !open)} className={styles.mobileToggle}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d={isMobileOpen ? "M4 4l10 10M14 4L4 14" : "M2 5h14M2 9h14M2 13h14"} />
      </svg>
    </button>
    {isMobileOpen ? <div id="admin-mobile-menu" className={styles.mobileMenu}>{links(true)}{logout(true)}</div> : null}
  </nav>;
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

function CaseStudiesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2.75" y="3" width="10.5" height="10" rx="2" />
      <path d="M5 6h6M5 8.25h3.5" strokeLinecap="round" />
      <path d="M5 11l1.35-1.4 1 1 1.75-2.1L11 11" strokeLinecap="round" strokeLinejoin="round" />
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
