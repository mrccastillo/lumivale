import { getSiteContentForSite } from "@/lib/site-content";
import { HomepageFooter } from "./homepage-footer";

export async function SiteFooter() {
  const content = await getSiteContentForSite();
  return <HomepageFooter content={content} />;
}
