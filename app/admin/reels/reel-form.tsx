"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Reel } from "@/lib/reels";
import styles from "./reels.module.css";

async function submit(url: string, form: FormData) {
  const response = await fetch(url, { method: "POST", body: form });
  if (response.redirected) { window.location.assign(response.url); return false; }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not save the reel.");
  return true;
}
export function ReelForm({ reel }: { reel?: Reel }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError("");
    try { if (await submit(reel ? `/api/admin/reels/${reel.id}` : "/api/admin/reels", form)) { router.push("/admin/reels"); router.refresh(); } }
    catch (error) { setError(error instanceof Error ? error.message : "Could not save the reel. Please try again."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className={styles.form}>
    <h2>{reel ? "Edit reel" : "Add reel"}</h2>
    <p>Link to a post on any social platform. Visitors open the original post to watch it.</p>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <fieldset disabled={busy} className={styles.fields}>
      <label>Reel title<input name="title" required maxLength={160} defaultValue={reel?.title} /></label>
      <label>Client or brand<input name="clientName" required maxLength={160} defaultValue={reel?.clientName} /></label>
      <label>Platform<input name="platform" list="reel-platforms" required maxLength={160} defaultValue={reel?.platform} placeholder="Instagram, TikTok, YouTube, or another platform" /></label>
      <datalist id="reel-platforms">{["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn", "X"].map(name => <option key={name} value={name} />)}</datalist>
      <label>Original reel URL<input name="url" type="url" required maxLength={2048} defaultValue={reel?.url} placeholder="https://" /></label>
      <label className={styles.wide}>Portrait thumbnail<input name="thumbnailFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /><span>JPG, PNG, WEBP or GIF, up to 5MB. Required to publish. Upload a new image to replace the current thumbnail.</span></label>
      <input type="hidden" name="thumbnailUrl" value={reel?.thumbnailUrl || ""} />
      {reel?.thumbnailUrl && <div className={styles.wide}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.thumbnail} src={reel.thumbnailUrl} alt="Current reel thumbnail" /></div>}
      {(["views", "likes", "comments"] as const).map(key => <label key={key}>{key[0].toUpperCase() + key.slice(1)}<input name={key} maxLength={30} defaultValue={reel?.[key]} placeholder="Optional, e.g. 1.2M" /></label>)}
      <label>Display order<input name="sortOrder" type="number" min={-100000} max={100000} step={1} defaultValue={reel?.sortOrder ?? 0} required /><span>Lower numbers appear first.</span></label>
      <label>Visibility<select name="status" defaultValue={reel?.status || "draft"}><option value="draft">Draft</option><option value="published">Published</option></select></label>
    </fieldset>
    <div className={styles.actions}><button disabled={busy} type="submit">{busy ? "Saving..." : "Save reel"}</button><Link href="/admin/reels">Cancel</Link></div>
  </form>;
}
export function ReelActions({ reel }: { reel: Reel }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function run(action: string) {
    if (action === "delete" && !window.confirm(`Delete "${reel.title}"? This removes it from the reel gallery.`)) return;
    setBusy(true); setError(""); const form = new FormData(); form.set("action", action);
    try { if (await submit(`/api/admin/reels/${reel.id}`, form)) router.refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not update the reel."); }
    finally { setBusy(false); }
  }
  return <div><div className={styles.actions}><Link href={`/admin/reels?edit=${reel.id}`}>Edit</Link><button disabled={busy} onClick={() => run(reel.status === "published" ? "draft" : "publish")}>{reel.status === "published" ? "Unpublish" : "Publish"}</button><button disabled={busy} className={styles.delete} onClick={() => run("delete")}>Delete</button></div>{error && <p role="alert" className={styles.error}>{error}</p>}</div>;
}
