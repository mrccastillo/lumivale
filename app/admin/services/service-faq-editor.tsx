"use client";

import type { ServiceFaq } from "@/lib/service-faqs";

const fieldClass = "mt-2 w-full min-w-0 rounded-xl border border-[var(--lumivale-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--lumivale-accent)]";
const buttonClass = "rounded-lg border border-[var(--lumivale-line)] px-3 py-2 text-sm font-semibold disabled:opacity-40";

export function ServiceFaqEditor({ faqs, onChange, showValidation }: {
  faqs: ServiceFaq[];
  onChange: (faqs: ServiceFaq[]) => void;
  showValidation: boolean;
}) {
  function edit(id: string, field: "question" | "answer", value: string) {
    onChange(faqs.map((faq) => faq.id === id ? { ...faq, [field]: value } : faq));
  }
  function move(index: number, offset: number) {
    const next = [...faqs];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }
  return <section aria-labelledby="service-faq-heading" className="grid min-w-0 gap-5 rounded-[20px] border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-5">
    <div>
      <h2 id="service-faq-heading" className="text-base font-semibold">Public Service FAQs</h2>
      <p className="mt-2 text-sm leading-7 text-[var(--lumivale-muted)]">These questions appear on this service&apos;s public page after you save the service. Homepage FAQs are managed separately.</p>
    </div>
    {!faqs.length ? <p className="text-sm text-[var(--lumivale-muted)]">No FAQs yet. Add a question to help visitors understand this service.</p> : null}
    {faqs.map((faq, index) => <fieldset key={faq.id} className="grid min-w-0 gap-4 rounded-xl border border-[var(--lumivale-line)] bg-white p-4">
      <legend className="px-2 text-sm font-semibold">FAQ {index + 1}</legend>
      {(["question", "answer"] as const).map((field) => {
        const invalid = showValidation && !faq[field].trim();
        const id = `faq-${faq.id}-${field}`;
        const props = { id, value: faq[field], required: true, "aria-invalid": invalid, "aria-describedby": invalid ? `${id}-error` : undefined, className: fieldClass, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => edit(faq.id, field, event.target.value) };
        return <div key={field}>
          <label htmlFor={id} className="text-sm font-semibold">{field === "question" ? "Question" : "Answer"}</label>
          {field === "question" ? <input {...props} /> : <textarea {...props} rows={4} />}
          {invalid ? <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-700">{field === "question" ? "Enter a question." : "Enter an answer."}</p> : null}
        </div>;
      })}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} disabled={index === 0} onClick={() => move(index, -1)}>Move up</button>
        <button type="button" className={buttonClass} disabled={index === faqs.length - 1} onClick={() => move(index, 1)}>Move down</button>
        <button type="button" className={`${buttonClass} text-red-700`} onClick={() => onChange(faqs.filter((item) => item.id !== faq.id))}>Remove FAQ</button>
      </div>
    </fieldset>)}
    <button type="button" className="justify-self-start rounded-xl bg-[var(--lumivale-panel)] px-5 py-3 text-sm font-semibold text-white" onClick={() => onChange([...faqs, { id: crypto.randomUUID(), question: "", answer: "" }])}>Add FAQ</button>
  </section>;
}
