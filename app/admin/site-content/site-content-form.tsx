"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent } from "@/lib/site-content-defaults";

export function SiteContentForm({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage(""); setError("");
    try {
      const data = new FormData();
      Object.entries(content).forEach(([key, value]) => data.set(key, value));
      if (logoFile) data.set("logoFile", logoFile);
      const response = await fetch("/api/admin/site-content", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save site content.");
      setContent(result.content); setLogoFile(null); setPreviewUrl("");
      if (fileInput.current) fileInput.current.value = "";
      setMessage("Site content saved. Your changes are now live.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save site content.");
    } finally { setSaving(false); }
  }

  function field(key: keyof SiteContent, label: string, maxLength: number, optional = false) {
    const props = {
      id: key, name: key, value: content[key], maxLength, required: !optional,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setContent({ ...content, [key]: event.target.value }),
      className: "mt-2 w-full rounded-lg border border-[var(--lumivale-line)] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[var(--lumivale-accent)]",
    };
    return <label className="block text-sm font-semibold" htmlFor={key}>{label}{key === "heroDescription" ? <textarea {...props} rows={4} /> : <input {...props} type={key === "footerEmail" ? "email" : ["heroButtonUrl", "logoUrl", "footerCtaButtonUrl", "footerLinkedinUrl"].includes(key) ? "url" : "text"} />}</label>;
  }
  const logo = logoFile ? previewUrl : content.logoUrl;
  return (
    <form onSubmit={save} className="mt-6 space-y-6">
      <fieldset disabled={saving} className="space-y-6 disabled:opacity-70">
        <section className="space-y-5 rounded-3xl border border-[var(--lumivale-admin-border)] bg-white p-6">
          <h2 className="text-xl font-semibold">Navigation branding</h2>
          <div className="grid gap-5 sm:grid-cols-2">{field("brandName", "Brand name", 80)}{field("logoText", "Letter mark (shown without a logo)", 3)}</div>
          {field("logoUrl", "Logo image URL (optional)", 500, true)}
          <label className="block text-sm font-semibold" htmlFor="logoFile">Upload logo
            <input ref={fileInput} id="logoFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="mt-2 block w-full text-sm" onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              if (file && file.size > 5 * 1024 * 1024) { setError("Logo must be 5MB or smaller."); event.target.value = ""; setLogoFile(null); return; }
              setError(""); setLogoFile(file); setPreviewUrl(file ? URL.createObjectURL(file) : "");
            }} />
          </label>
          <p className="text-xs text-[var(--lumivale-muted)]">PNG, JPG, WEBP, or GIF, up to 5MB. Uploading replaces the logo URL. A transparent square image works best.</p>
          {logo ? <button type="button" className="text-sm font-semibold text-red-600" onClick={() => { setLogoFile(null); setPreviewUrl(""); setContent({ ...content, logoUrl: "" }); if (fileInput.current) fileInput.current.value = ""; }}>Remove logo</button> : null}
          <div aria-label="Brand preview" className="flex items-center gap-3 rounded-xl bg-[#031410] p-5 font-semibold text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logo ? <img src={logo} alt="Logo preview" className="size-8 object-contain" /> : <span className="grid size-8 place-items-center rounded-full bg-white/10 text-[#80ddb5]">{content.logoText}</span>}
            {content.brandName}
          </div>
        </section>
        <section className="space-y-5 rounded-3xl border border-[var(--lumivale-admin-border)] bg-white p-6">
          <h2 className="text-xl font-semibold">Homepage hero</h2>
          {field("heroHeading", "Headline", 500)}
          {field("heroHighlight", "Highlighted headline text (optional)", 500, true)}
          {field("heroDescription", "Description", 2000)}
          <div className="grid gap-5 sm:grid-cols-2">{field("heroPrompt", "Call-to-action prompt (optional)", 100, true)}{field("heroButtonText", "Button text", 80)}</div>
          {field("heroButtonUrl", "Button destination URL", 500)}
        </section>
        <section className="space-y-5 rounded-3xl border border-[var(--lumivale-admin-border)] bg-white p-6">
          <h2 className="text-xl font-semibold">Homepage results</h2>
          {field("resultsEyebrow", "Results section label", 80)}
          {field("resultsHeading", "Results heading", 200)}
          <p className="text-sm text-[var(--lumivale-muted)]">Enter your verified results. Values support numbers, percentages, and suffixes such as K or M. A dash means a result has not been entered.</p>
          {([1, 2, 3, 4] as const).map((index) => (
            <div key={index} className="grid gap-5 sm:grid-cols-2">
              {field(`resultsMetric${index}Value`, `Result ${index} value`, 24)}
              {field(`resultsMetric${index}Label`, `Result ${index} label`, 80)}
            </div>
          ))}
        </section>
        <section className="space-y-5 rounded-3xl border border-[var(--lumivale-admin-border)] bg-white p-6">
          <h2 className="text-xl font-semibold">Footer call to action</h2>
          <p className="text-sm text-[var(--lumivale-muted)]">The section above the footer on the homepage.</p>
          {field("footerCtaPrompt", "Footer call-to-action prompt", 500)}
          {field("footerCtaHeading", "Footer headline", 500)}
          {field("footerCtaButtonText", "Footer button text", 80)}
          {field("footerCtaButtonUrl", "Footer button destination URL", 500)}
        </section>
        <section className="space-y-5 rounded-3xl border border-[var(--lumivale-admin-border)] bg-white p-6">
          <h2 className="text-xl font-semibold">Footer</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("footerBrandName", "Footer brand name", 80)}
            {field("footerTagline", "Footer tagline", 500)}
          </div>
          <h3 className="font-semibold">Navigation links</h3>
          <p className="text-xs text-[var(--lumivale-muted)]">Use a page path such as /about or a full https:// URL.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("footerHomeLabel", "First link text", 80)}
            {field("footerHomeUrl", "First link destination", 500)}
            {field("footerAboutLabel", "Second link text", 80)}
            {field("footerAboutUrl", "Second link destination", 500)}
            {field("footerBlogsLabel", "Third link text", 80)}
            {field("footerBlogsUrl", "Third link destination", 500)}
          </div>
          <h3 className="font-semibold">Contact details</h3>
          {field("footerContactHeading", "Contact heading", 100)}
          {field("footerEmail", "Contact email", 254)}
          {field("footerLinkedinUrl", "LinkedIn URL", 500)}
          <h3 className="font-semibold">Bottom bar</h3>
          {field("footerSiteLabel", "Website label", 80)}
          {field("footerBottomText", "Bottom bar text", 500)}
        </section>
        <button type="submit" className="rounded-full bg-[var(--lumivale-accent)] px-6 py-3 text-sm font-semibold text-[#010807]">{saving ? "Saving…" : "Save changes"}</button>
      </fieldset>
      {message ? <p role="status" className="text-sm text-emerald-800">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
