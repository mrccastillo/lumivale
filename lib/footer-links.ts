import type { FooterLink, SiteContent } from "./site-content-defaults";

export function footerNavigation(content: SiteContent): FooterLink[] {
  return content.footerNavigationLinks ?? [
    { label: content.footerHomeLabel, url: content.footerHomeUrl },
    { label: content.footerAboutLabel, url: content.footerAboutUrl },
    { label: content.footerBlogsLabel, url: content.footerBlogsUrl },
  ];
}
export function footerSocials(content: SiteContent): FooterLink[] {
  return content.footerSocialLinks ?? [{ label: "LinkedIn", url: content.footerLinkedinUrl }];
}
export function parseFooterLinks(input: unknown, field: string, allowPaths: boolean): FooterLink[] {
  let value = input;
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { throw new Error(`${field} must be a valid list of links.`); }
  }
  if (!Array.isArray(value) || value.length > 50) throw new Error(`${field} must contain at most 50 links.`);
  return value.map((entry, index) => {
    if (!entry || typeof entry.label !== "string" || typeof entry.url !== "string") throw new Error(`Complete ${field} link ${index + 1}.`);
    const label = entry.label.trim();
    const url = entry.url.trim();
    if (!label || label.length > 80 || !url || url.length > 500) throw new Error(`Use a label of 1-80 characters and a URL of 1-500 characters for ${field} link ${index + 1}.`);
    if (/[\\\s]/.test(url)) throw new Error(`Enter a valid URL for ${field} link ${index + 1}.`);
    if (allowPaths && /^\/(?!\/)/.test(url)) return { label, url };
    let parsed: URL;
    try { parsed = new URL(url); } catch { throw new Error(`Enter a valid HTTP or HTTPS URL for ${field} link ${index + 1}.`); }
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(`Use an HTTP or HTTPS URL without credentials for ${field} link ${index + 1}.`);
    return { label, url };
  });
}
