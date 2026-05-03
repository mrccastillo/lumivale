import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { AppShellClient } from "@/components/app-shell-client";

export const metadata: Metadata = {
  title: "Lumivale",
  description: "Simple, affordable growth services for early-stage teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <AppShellClient footer={<SiteFooter />} navbar={<SiteNavbar />}>
          {children}
        </AppShellClient>
      </body>
    </html>
  );
}
