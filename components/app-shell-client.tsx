"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function AppShellClient({
  children,
  footer,
  navbar,
}: {
  children: ReactNode;
  footer: ReactNode;
  navbar: ReactNode;
}) {
  const pathname = usePathname() || "/";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <div className="min-h-screen bg-[#f7f8fb]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {navbar}
      <main data-nav-surface="light" className="flex-1">
        {children}
      </main>
      {footer}
    </div>
  );
}
