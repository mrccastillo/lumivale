import { hasTrustedClientAccess } from "@/lib/trusted-client";
import { CALENDLY_URL } from "@/lib/site-config";
import { SiteNavbarClient } from "@/components/site-navbar-client";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#case-studies", label: "Case Studies" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/about", label: "About Us" },
  { href: "/blogs", label: "Blogs" },
] as const;

export async function SiteNavbar() {
  const hasTrustedAccess = await hasTrustedClientAccess();

  return (
    <SiteNavbarClient
      calendlyUrl={CALENDLY_URL}
      hasTrustedAccess={hasTrustedAccess}
      publicLinks={publicLinks}
    />
  );
}

export type SiteNavbarLink = (typeof publicLinks)[number];
