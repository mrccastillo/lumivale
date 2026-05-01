import Link from "next/link";

import { hasTrustedClientAccess } from "@/lib/trusted-client";

const CALENDLY_URL = "https://calendly.com/lumivale/discovery-call";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blogs", label: "Blogs" },
] as const;

export async function SiteNavbar() {
  const hasTrustedAccess = await hasTrustedClientAccess();

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-[0.18em] text-stone-900 uppercase">
          Lumivale
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-4 text-sm font-medium text-stone-700">
            {publicLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-stone-950">
                  {link.label}
                </Link>
              </li>
            ))}
            {hasTrustedAccess ? (
              <li>
                <Link href="/pricing" className="transition hover:text-stone-950">
                  Pricing
                </Link>
              </li>
            ) : null}
            <li>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-stone-50 transition hover:bg-stone-700"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
