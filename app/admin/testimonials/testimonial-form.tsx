import type { Testimonial } from "@/lib/testimonials";

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const action = testimonial
    ? `/api/admin/testimonials/${testimonial.id}`
    : "/api/admin/testimonials";

  return (
    <form
      action={action}
      method="post"
      encType="multipart/form-data"
      className="grid gap-5 rounded-lg border border-[var(--lumivale-line)] bg-white p-6 shadow-[0_20px_60px_rgba(42,47,82,0.06)]"
    >
      <input type="hidden" name="action" value="save" />
      <input type="hidden" name="videoFileId" value={testimonial?.videoFileId ?? ""} />
      <Field label="Name" name="personName" required defaultValue={testimonial?.personName} />
      <Field
        label="Title or company"
        name="personTitle"
        defaultValue={testimonial?.personTitle}
      />
      <TextArea label="Quote" name="quote" required defaultValue={testimonial?.quote} rows={5} />
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-[var(--lumivale-ink)]">
          Type
          <select
            name="type"
            defaultValue={testimonial?.type ?? "text"}
            className="rounded-lg border border-[var(--lumivale-line)] px-4 py-3 font-normal"
          >
            <option value="text">Text</option>
            <option value="video">Video</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[var(--lumivale-ink)]">
          Status
          <select
            name="status"
            defaultValue={testimonial?.status ?? "draft"}
            className="rounded-lg border border-[var(--lumivale-line)] px-4 py-3 font-normal"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <Field
          label="Sort order"
          name="sortOrder"
          type="number"
          defaultValue={String(testimonial?.sortOrder ?? 0)}
        />
      </div>
      <label className="grid gap-2 text-sm font-semibold text-[var(--lumivale-ink)]">
        Upload video
        <input
          name="videoFile"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="rounded-lg border border-[var(--lumivale-line)] px-4 py-3 text-sm font-normal"
        />
      </label>
      <button
        type="submit"
        className="w-fit rounded-full bg-[var(--lumivale-accent)] px-6 py-3 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)]"
      >
        {testimonial ? "Save testimonial" : "Create testimonial"}
      </button>
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
    <label className="grid gap-2 text-sm font-semibold text-[var(--lumivale-ink)]">
      {label}
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        type={type}
        className="rounded-lg border border-[var(--lumivale-line)] px-4 py-3 font-normal outline-none transition focus:border-[var(--lumivale-accent)]"
      />
    </label>
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
    <label className="grid gap-2 text-sm font-semibold text-[var(--lumivale-ink)]">
      {label}
      <textarea
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue}
        className="rounded-lg border border-[var(--lumivale-line)] px-4 py-3 font-normal outline-none transition focus:border-[var(--lumivale-accent)]"
      />
    </label>
  );
}
