"use client";

import { useId, useState, type ReactNode } from "react";

import type { Testimonial } from "@/lib/testimonials";

const fieldClassName =
  "min-h-12 w-full rounded-[18px] border border-[var(--lumivale-line)] bg-white px-4 py-3 text-sm text-[var(--lumivale-ink)] outline-none transition focus:border-[var(--lumivale-accent)]";

export function TestimonialForm({
  cancelHref,
  errorMessage,
  submitLabel,
  testimonial,
}: {
  cancelHref?: string;
  errorMessage?: string;
  submitLabel?: string;
  testimonial?: Testimonial;
}) {
  const action = testimonial
    ? `/api/admin/testimonials/${testimonial.id}`
    : "/api/admin/testimonials";
  const [selectedType, setSelectedType] = useState(testimonial?.type ?? "text");
  const typeHintId = useId();

  return (
    <form
      action={action}
      method="post"
      encType="multipart/form-data"
      className="grid gap-6 rounded-[24px] border border-[var(--lumivale-line)] bg-white p-6 shadow-[0_20px_60px_rgba(42,47,82,0.06)] sm:p-7"
    >
      <input type="hidden" name="action" value="save" />
      <input type="hidden" name="videoUrl" value={testimonial?.videoUrl ?? ""} />

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="personName" required defaultValue={testimonial?.personName} />
        <Field
          label="Title or company"
          name="personTitle"
          defaultValue={testimonial?.personTitle}
        />
      </div>

      <TextArea label="Quote" name="quote" required defaultValue={testimonial?.quote} rows={5} />

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <FieldLabel htmlFor="testimonial-type">Type</FieldLabel>
          <select
            id="testimonial-type"
            name="type"
            value={selectedType}
            aria-describedby={typeHintId}
            onChange={(event) =>
              setSelectedType(event.target.value === "video" ? "video" : "text")
            }
            className={fieldClassName}
          >
            <option value="text">Text</option>
            <option value="video">Video</option>
          </select>
          <p id={typeHintId} className="mt-2 text-xs leading-6 text-[var(--lumivale-muted)]">
            Video testimonials still include a written quote for preview and context.
          </p>
        </div>

        <div>
          <FieldLabel htmlFor="testimonial-status">Status</FieldLabel>
          <select
            id="testimonial-status"
            name="status"
            defaultValue={testimonial?.status ?? "draft"}
            className={fieldClassName}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <Field
          label="Sort order"
          name="sortOrder"
          type="number"
          defaultValue={String(testimonial?.sortOrder ?? 0)}
        />
      </div>

      {selectedType === "video" ? (
        <div className="rounded-[22px] border border-[var(--lumivale-line)] bg-[#fbfcff] p-5">
          <FieldLabel htmlFor="testimonial-video">Upload video</FieldLabel>
          <input
            id="testimonial-video"
            name="videoFile"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className={fieldClassName}
          />
          <p className="mt-2 text-xs leading-6 text-[var(--lumivale-muted)]">
            Supported formats: MP4, WEBM, and MOV. Maximum file size: 50MB.
          </p>
          {testimonial?.videoUrl ? (
            <p className="mt-2 text-xs leading-6 text-[var(--lumivale-muted)]">
              A saved video is already attached. Upload a new file to replace it.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--lumivale-accent)] px-6 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
        >
          {submitLabel ?? (testimonial ? "Save testimonial" : "Create testimonial")}
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
