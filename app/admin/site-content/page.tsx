import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { getSiteContent } from "@/lib/site-content";
import { SiteContentForm } from "./site-content-form";

export default async function SiteContentPage() {
  await requireAdminAccess();
  const content = await getSiteContent(await getMongoDb());
  return (
    <section className="mx-auto w-full max-w-5xl">
      <h1 className="text-3xl font-semibold text-[var(--lumivale-ink)]">Site Content</h1>
      <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">Customize your homepage hero, results, navigation branding, footer, and footer call to action.</p>
      <SiteContentForm initialContent={content} />
    </section>
  );
}
