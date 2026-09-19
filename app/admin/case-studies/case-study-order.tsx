"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Study = { slug: string; title: string; status: string };
export function CaseStudyOrder({ studies }: { studies: Study[] }) {
  const [items, setItems] = useState(studies);
  const [savedOrder, setSavedOrder] = useState(studies.map((study) => study.slug).join("|"));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const dirty = items.map((study) => study.slug).join("|") !== savedOrder;
  function move(index: number, direction: number) {
    const next = [...items];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setItems(next); setMessage(`${items[index].title} moved to position ${index + direction + 1}.`); setError("");
  }
  async function save() {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/case-studies/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: items.map((study) => study.slug) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save order.");
      setSavedOrder(items.map((study) => study.slug).join("|"));
      setMessage("Order saved. Published stories now appear in this order on the website.");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save order."); }
    finally { setSaving(false); }
  }
  const buttonClass = "rounded border border-[var(--lumivale-admin-border)] px-3 py-2 text-xs disabled:opacity-40 hover:bg-[var(--lumivale-admin-chip)]";
  return <details className="mt-6 rounded-lg border border-[var(--lumivale-admin-border)] p-4 sm:p-5">
    <summary className="cursor-pointer text-sm font-semibold">Reorder case studies</summary>
    <p className="mt-3 text-sm leading-6 text-[var(--lumivale-admin-muted)]">Set the order for the homepage carousel and case studies page. This list includes all stories; drafts stay hidden from visitors.</p>
    <fieldset disabled={saving} className="mt-4 min-w-0">
      <ol className="divide-y divide-[var(--lumivale-admin-border)]">{items.map((study, index) => <li key={study.slug} className="flex flex-wrap items-center gap-3 py-3">
        <span className="w-6 text-xs text-[var(--lumivale-admin-muted)]">{index + 1}</span>
        <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{study.title}</p><p className="text-xs text-[var(--lumivale-admin-muted)]">{study.status}</p></div>
        <div className="flex gap-2"><button type="button" className={buttonClass} disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move ${study.title} up`}>Move up</button><button type="button" className={buttonClass} disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${study.title} down`}>Move down</button></div>
      </li>)}</ol>
      <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" disabled={!dirty} onClick={save} className="rounded bg-[var(--lumivale-accent)] px-5 py-2.5 text-sm font-semibold disabled:opacity-40">{saving ? "Saving..." : "Save order"}</button><button type="button" disabled={!dirty} className={buttonClass} onClick={() => { const positions = savedOrder.split("|"); setItems([...items].sort((a,b) => positions.indexOf(a.slug) - positions.indexOf(b.slug))); setMessage(""); setError(""); }}>Reset</button>{dirty ? <span className="text-xs text-[var(--lumivale-admin-muted)]">Unsaved order</span> : null}</div>
    </fieldset>
    <p role="status" className="mt-3 text-xs text-[var(--lumivale-admin-muted)]">{message}</p>
    {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
  </details>;
}
