"use client";

import { type ReactNode, useState } from "react";

import type { CaseStudy } from "@/lib/case-studies";

const fieldClassName =
  "min-h-12 w-full rounded-[18px] border border-[var(--lumivale-line)] bg-white px-4 py-3 text-sm text-[var(--lumivale-ink)] outline-none transition focus:border-[var(--lumivale-accent)]";

export function CaseStudyForm({
  cancelHref,
  errorMessage,
  study,
  submitLabel,
}: {
  cancelHref?: string;
  errorMessage?: string;
  study?: CaseStudy;
  submitLabel?: string;
}) {
  const action = study ? `/api/admin/case-studies/${study.slug}` : "/api/admin/case-studies";
  const [slug, setSlug] = useState(study?.slug ?? "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(study?.slug));
  const isDefaultStudy = Boolean(study?.isDefault);

  function handleTitleChange(value: string) {
    if (!isSlugManuallyEdited && !isDefaultStudy) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setIsSlugManuallyEdited(true);
    setSlug(slugify(value));
  }

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

      <section className="grid gap-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <input
              id="title"
              name="title"
              required
              defaultValue={study?.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <FieldLabel htmlFor="slug">Case Study Link Ending</FieldLabel>
            <input
              id="slug"
              name="slug"
              required
              readOnly={isDefaultStudy}
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              className={`${fieldClassName} ${isDefaultStudy ? "bg-[#f7f8fb] text-[var(--lumivale-muted)]" : ""}`}
            />
            {isDefaultStudy ? (
              <p className="mt-2 text-xs leading-6 text-[var(--lumivale-muted)]">
                Seeded case study links stay fixed. You can unpublish the story if it should be hidden.
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_140px_170px]">
          <Field
            label="Category"
            name="category"
            required
            defaultValue={study?.category}
          />
          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            defaultValue={String(study?.sortOrder ?? 0)}
          />
          <div>
            <FieldLabel htmlFor="case-study-status">Status</FieldLabel>
            <select
              id="case-study-status"
              name="status"
              defaultValue={study?.status ?? "draft"}
              className={fieldClassName}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </section>

      <TextArea
        label="Headline"
        name="headline"
        required
        defaultValue={study?.headline}
        rows={2}
      />

      <TextArea
        label="Summary"
        name="summary"
        required
        defaultValue={study?.summary}
        rows={4}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <TextArea
          label="Challenge"
          name="challenge"
          required
          defaultValue={study?.challenge}
          rows={5}
        />
        <TextArea
          label="Solution"
          name="solution"
          required
          defaultValue={study?.solution}
          rows={5}
        />
      </div>

      <section className="grid gap-5 rounded-[20px] border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lumivale-panel)]">
            Results
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--lumivale-muted)]">
            Enter one outcome per line. Metrics use the format Value | Label.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <TextArea
            label="Outcomes"
            name="outcomes"
            required
            defaultValue={study?.outcomes.join("\n")}
            rows={5}
          />
          <TextArea
            label="Metrics"
            name="metrics"
            required
            defaultValue={study?.metrics.map((metric) => `${metric.value} | ${metric.label}`).join("\n")}
            placeholder="100-140 | comments per month"
            rows={5}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--lumivale-accent)] px-6 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
        >
          {submitLabel ?? (study ? "Save case study" : "Create case study")}
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
  placeholder,
  required,
  rows,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
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
        placeholder={placeholder}
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

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
