import { CALENDLY_URL } from "@/lib/site-config";

export const defaultSiteContent = {
  brandName: "Lumivale",
  logoText: "L",
  logoUrl: "",
  heroHeading: "Light up your growth with",
  heroHighlight: "simple execution systems",
  heroDescription: "Lumivale helps early-stage teams find the channels that actually bring customers, then turns those channels into clear, repeatable growth actions.",
  heroPrompt: "Ready to grow?",
  heroButtonText: "Book a call",
  heroButtonUrl: CALENDLY_URL,
};
export type SiteContent = typeof defaultSiteContent;
