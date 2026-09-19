"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent } from "@/lib/site-content-defaults";

import styles from "./site-content-form.module.css";

const sections = [
  { id: "branding", label: "Branding", description: "Manage the name and logo used across your website and staff portal." },
  { id: "hero", label: "Homepage hero", description: "Edit the first message visitors see and the action you want them to take." },
  { id: "about", label: "About Us", description: "Edit the About page introduction, approach, and founder profiles." },
  { id: "results", label: "Results", description: "Update your results headline and the four metrics displayed on the homepage." },
  { id: "cta", label: "Footer CTA", description: "Customize the invitation and booking link above your homepage footer." },
  { id: "footer", label: "Footer", description: "Manage footer branding, navigation, contact details, and the bottom bar." },
] as const;
type SectionId = (typeof sections)[number]["id"];

export function SiteContentForm({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [activeSection, setActiveSection] = useState<SectionId>("branding");
  const [founderFiles, setFounderFiles] = useState<Record<string, File>>({});
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
    const form = event.currentTarget;
    const invalid = event.currentTarget.querySelector<HTMLInputElement | HTMLTextAreaElement>("input:invalid, textarea:invalid");
    if (invalid) {
      const panel = invalid.closest<HTMLElement>("[data-content-section]");
      if (panel) setActiveSection(panel.dataset.contentSection as SectionId);
      const disclosure = invalid.closest("details");
      if (disclosure) disclosure.open = true;
      requestAnimationFrame(() => { invalid.focus(); invalid.reportValidity(); });
      return;
    }
    setSaving(true); setMessage(""); setError("");
    try {
      const data = new FormData();
      Object.entries(content).forEach(([key, value]) => data.set(key, value));
      Object.entries(founderFiles).forEach(([key, file]) => data.set(key, file));
      if (logoFile) data.set("logoFile", logoFile);
      const response = await fetch("/api/admin/site-content", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save site content.");
      setContent(result.content); setSavedContent(result.content); setFounderFiles({});
      form.querySelectorAll<HTMLInputElement>('[data-founder-upload]').forEach((input) => { input.value = ""; }); setLogoFile(null); setPreviewUrl("");
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
    return <label className="block text-sm font-semibold" htmlFor={key}>{label}{(key === "heroDescription" || key.endsWith("Description") || key.endsWith("Summary")) ? <textarea {...props} rows={4} /> : <input {...props} type={key === "footerEmail" ? "email" : ["heroButtonUrl", "logoUrl", "footerCtaButtonUrl", "footerLinkedinUrl"].includes(key) ? "url" : "text"} />}</label>;
  }
  const logo = logoFile ? previewUrl : content.logoUrl;
  const dirty = Object.keys(founderFiles).length > 0 || logoFile !== null || JSON.stringify(content) !== JSON.stringify(savedContent);
  const active = sections.find((section) => section.id === activeSection)!;
  function panel(id: SectionId) {
    return { id: `panel-${id}`, role: "tabpanel", "aria-labelledby": `tab-${id}`, "data-content-section": id, hidden: activeSection !== id, tabIndex: 0 };
  }
  return (
    <form onSubmit={save} noValidate className={styles.editor}>
      <div role="tablist" aria-label="Site content sections" className={styles.tabs}>
        {sections.map((section, index) => <button key={section.id} type="button" role="tab"
          id={`tab-${section.id}`} aria-controls={`panel-${section.id}`} aria-selected={activeSection === section.id}
          tabIndex={activeSection === section.id ? 0 : -1}
          onClick={() => setActiveSection(section.id)}
          onKeyDown={(event) => {
            let next = index;
            if (event.key === "ArrowRight") next = (index + 1) % sections.length;
            else if (event.key === "ArrowLeft") next = (index + sections.length - 1) % sections.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = sections.length - 1;
            else return;
            event.preventDefault(); setActiveSection(sections[next].id);
            document.getElementById(`tab-${sections[next].id}`)?.focus();
          }}><span className={styles.tabNumber}>0{index + 1}</span>{section.label}</button>)}
      </div>
      <div className={styles.sectionIntro}><span>EDIT SECTION</span><p>{active.description}</p></div>
      <fieldset disabled={saving} className="disabled:opacity-70">
        <section {...panel("branding")} className={styles.panel}>
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
        <section {...panel("hero")} className={styles.panel}>
          <h2 className="text-xl font-semibold">Homepage hero</h2>
          {field("heroHeading", "Headline", 500)}
          {field("heroHighlight", "Highlighted headline text (optional)", 500, true)}
          {field("heroDescription", "Description", 2000)}
          <div className="grid gap-5 sm:grid-cols-2">{field("heroPrompt", "Call-to-action prompt (optional)", 100, true)}{field("heroButtonText", "Button text", 80)}</div>
          {field("heroButtonUrl", "Button destination URL", 500)}
        </section>
        <section {...panel("about")} className={styles.panel}>
          <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">About Us</h2><a href="/about" target="_blank" rel="noopener noreferrer" className="text-sm underline">View page &#8599;</a></div>
          {field("aboutEyebrow", "Page label", 80)}
          {field("aboutHeading", "About headline", 200)}
          {field("aboutDescription", "About introduction", 500)}
          <details className="rounded-lg border border-[var(--lumivale-line)] p-5">
            <summary className="cursor-pointer font-semibold">Our approach</summary>
            <div className="mt-5 grid gap-5">{field("aboutApproachHeading", "Approach heading", 200)}{field("aboutApproachDescription", "Approach description", 500)}</div>
          </details>
          {field("aboutTeamHeading", "Team heading", 200)}
          {field("aboutTeamDescription", "Team introduction", 500)}
          <p className="text-sm text-[var(--lumivale-muted)]">Open a profile to edit it. Leave its name empty to hide it from the page. Portraits are cropped vertically; use a 4:5 image.</p>
          {([1, 2, 3] as const).map((index) => <details key={index} className="rounded-lg border border-[var(--lumivale-line)] p-5">
            <summary className="cursor-pointer font-semibold">0{index} / {content[`aboutFounder${index}Name`] || "Hidden profile"} <span className="ml-2 text-xs font-normal text-[var(--lumivale-muted)]">{content[`aboutFounder${index}Role`]}</span></summary>
            <div className="mt-5 grid gap-5">
              {field(`aboutFounder${index}Name`, `Founder ${index} name`, 100, true)}
              {field(`aboutFounder${index}Role`, `Founder ${index} role`, 150, true)}
              {field(`aboutFounder${index}Summary`, `Founder ${index} biography`, 500, true)}
              {field(`aboutFounder${index}Image`, `Founder ${index} image URL`, 500, true)}
              <label className="text-sm font-semibold">Upload portrait for founder {index}<input data-founder-upload type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="mt-2 block w-full text-sm" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file && file.size > 5 * 1024 * 1024) { setError("Portrait must be 5MB or smaller."); event.target.value = ""; return; }
                setError("");
                setFounderFiles((current) => { const next = { ...current }; if (file) next[`founder${index}File`] = file; else delete next[`founder${index}File`]; return next; });
              }} /></label>
              <p className="text-xs text-[var(--lumivale-muted)]">PNG, JPG, WEBP, or GIF, up to 5MB. Uploading replaces the image URL when you save.</p>
            </div>
          </details>)}
        </section>
        <section {...panel("results")} className={styles.panel}>
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
        <section {...panel("cta")} className={styles.panel}>
          <h2 className="text-xl font-semibold">Footer call to action</h2>
          <p className="text-sm text-[var(--lumivale-muted)]">The section above the footer on the homepage.</p>
          {field("footerCtaPrompt", "Footer call-to-action prompt", 500)}
          {field("footerCtaHeading", "Footer headline", 500)}
          {field("footerCtaButtonText", "Footer button text", 80)}
          {field("footerCtaButtonUrl", "Footer button destination URL", 500)}
        </section>
        <section {...panel("footer")} className={styles.panel}>
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
      </fieldset>
      <div className={styles.saveBar}>
        <div>
          <p className={styles.saveState}>{saving ? "Publishing your changes" : dirty ? "Unsaved changes" : "All changes saved"}</p>
          <p className={styles.saveHint}>Save changes across all sections to update the live website.</p>
          {message && !dirty ? <p role="status" className="text-sm text-emerald-800">{message}</p> : null}
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        </div>
        <button disabled={saving} type="submit" className="rounded-lg bg-[var(--lumivale-accent)] px-6 py-3 text-sm font-semibold text-[#010807]">{saving ? "Saving..." : "Save changes"}</button>
      </div>
    </form>
  );
}
