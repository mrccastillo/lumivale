import type { ReactNode } from "react";

import type { Faq } from "@/lib/faqs";

const fieldClassName =
  "min-h-12 w-full rounded-[18px] border border-[var(--lumivale-line)] bg-white px-4 py-3 text-sm text-[var(--lumivale-ink)] outline-none transition focus:border-[var(--lumivale-accent)]";

export function FaqForm({
  cancelHref,
  errorMessage,
  faq,
  submitLabel,
}: {
  cancelHref?: string;
  errorMessage?: string;
  faq?: Faq;
  submitLabel?: string;
}) {
  const action = faq ? `/api/admin/faqs/${faq.id}` : "/api/admin/faqs";

  return (
    <form
      action={action}
      method="post"
      className="grid gap-6 rounded-[24px] border border-[var(--lumivale-line)] bg-white p-6 shadow-[0_20px_60px_rgba(42,47,82,0.06)] sm:p-7"
    >
      <input type="hidden" name="action" value="save" />

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <Field
        label="Question"
        name="question"
        required
        defaultValue={faq?.question}
      />

      <TextArea
        label="Answer"
        name="answer"
        required
        defaultValue={faq?.answer}
        rows={6}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Sort order"
          name="sortOrder"
          type="number"
          defaultValue={String(faq?.sortOrder ?? 0)}
        />
        <div>
          <FieldLabel htmlFor="faq-status">Status</FieldLabel>
          <select
            id="faq-status"
            name="status"
            defaultValue={faq?.status ?? "draft"}
            className={fieldClassName}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--lumivale-accent)] px-6 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
        >
          {submitLabel ?? (faq ? "Save FAQ" : "Create FAQ")}
        </button>
        {cancelHref ? (
          <a
            href={cancelHref}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--lumivale-line)] px-6 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[var(--lumivale-accent)]"
          >
            Cancel
          </a>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  defaultValue,
  label,
  name,
  required,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <input
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        type={type}
        className={fieldClassName}
      />
    </div>
  );
}

function TextArea({
  defaultValue,
  label,
  name,
  required,
  rows,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  rows: number;
}) {
  return (
    <div>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue}
        className={fieldClassName}
      />
    </div>
  );
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#587184]"
    >
      {children}
    </label>
  );
}
