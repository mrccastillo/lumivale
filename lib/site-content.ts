import type { Db } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content-defaults";

type SiteContentDocument = SiteContent & { _id: string; updatedAt: Date };

export function parseSiteContent(input: Record<string, unknown>): SiteContent {
  const content = { ...defaultSiteContent };
  for (const key of Object.keys(content) as (keyof SiteContent)[]) {
    if (typeof input[key] !== "string") throw new Error(`Missing field: ${key}.`);
    content[key] = input[key].trim();
    if (content[key].length > (key === "heroDescription" ? 2000 : 500)) {
      throw new Error(`${key} is too long.`);
    }
  }
  if (!content.brandName || !content.logoText || !content.heroHeading || !content.heroDescription || !content.heroButtonText || !content.heroButtonUrl) {
    throw new Error("Complete the brand name, letter mark, headline, description, and button fields.");
  }
  for (const key of ["logoUrl", "heroButtonUrl", "footerCtaButtonUrl", "footerLinkedinUrl", "footerHomeUrl", "footerAboutUrl", "footerBlogsUrl", "aboutFounder1Image", "aboutFounder2Image", "aboutFounder3Image"] as const) {
    if (!content[key]) continue;
    if ((key.startsWith("aboutFounder") || ["footerHomeUrl", "footerAboutUrl", "footerBlogsUrl"].includes(key)) && /^\/(?!\/)/.test(content[key]) && !/[\\\s]/.test(content[key])) continue;
    let url: URL;
    try { url = new URL(content[key]); } catch { throw new Error(`${key} must be a valid HTTP or HTTPS URL.`); }
    if (!["http:", "https:"].includes(url.protocol)) throw new Error(`${key} must use HTTP or HTTPS.`);
  }
  if (content.brandName.length > 80 || content.logoText.length > 3 || content.heroPrompt.length > 100 || content.heroButtonText.length > 80) {
    throw new Error("Use a brand name and button label under 80 characters, a letter mark under 4, and a prompt under 100.");
  }
  for (const key of Object.keys(content) as (keyof SiteContent)[]) {
    if (key.startsWith("about") && !key.startsWith("aboutFounder") && !content[key]) throw new Error(`Complete the ${key} field.`);
    if (key.startsWith("footer") && !content[key]) throw new Error(`Complete the ${key} field.`);
    if (key.startsWith("results")) {
      if (!content[key]) throw new Error(`Complete the ${key} field.`);
      const limit = key.endsWith("Value") ? 24 : key === "resultsHeading" ? 200 : 80;
      if (content[key].length > limit) throw new Error(`${key} must be ${limit} characters or fewer.`);
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.footerEmail)) {
    throw new Error("Enter a valid footer email address.");
  }
  return content;
}

export async function getSiteContent(db: Db): Promise<SiteContent> {
  const document = await db.collection<SiteContentDocument>("siteContent").findOne({ _id: "main" });
  return Object.fromEntries(Object.entries(defaultSiteContent).map(([key, fallback]) => [
    key, document?.[key as keyof SiteContent] ?? fallback,
  ])) as SiteContent;
}

export async function saveSiteContent(db: Db, input: SiteContent) {
  const content = parseSiteContent(input);
  await db.collection<SiteContentDocument>("siteContent").updateOne(
    { _id: "main" }, { $set: { ...content, updatedAt: new Date() } }, { upsert: true },
  );
  return content;
}

export async function getSiteContentForSite(): Promise<SiteContent> {
  try {
    return await getSiteContent(await getMongoDb());
  } catch {
    return { ...defaultSiteContent };
  }
}
