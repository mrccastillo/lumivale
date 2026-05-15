"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import type { Service, ServiceExampleCard } from "@/lib/services";

const fieldClassName =
  "min-h-12 w-full rounded-[18px] border border-[var(--lumivale-line)] bg-white px-4 py-3 text-sm text-[var(--lumivale-ink)] outline-none transition focus:border-[var(--lumivale-accent)]";

type ExampleDraft = {
  exampleType: "link" | "photo";
  imageAlt: string;
  imageFile: File | null;
  imageUrl: string;
  imageFileName: string;
  previewUrl: string;
  summary: string;
  tag: string;
  title: string;
  videoFile: File | null;
  videoDescription: string;
  videoFileName: string;
  videoUrl: string;
};

const emptyExample: ExampleDraft = {
  exampleType: "link",
  imageAlt: "",
  imageFile: null,
  imageUrl: "",
  imageFileName: "",
  previewUrl: "",
  summary: "",
  tag: "",
  title: "",
  videoFile: null,
  videoDescription: "",
  videoFileName: "",
  videoUrl: "",
};

export function ServiceForm({
  cancelHref,
  errorMessage,
  service,
  submitLabel,
}: {
  cancelHref?: string;
  errorMessage?: string;
  service?: Service;
  submitLabel?: string;
}) {
  const action = service ? `/api/admin/services/${service.slug}` : "/api/admin/services";
  const [examples, setExamples] = useState<ExampleDraft[]>(
    (service?.privateContent.exampleCards ?? []).map(toExampleDraft),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    examples.forEach((example, index) => {
      if (example.imageFile) {
        formData.set(`exampleCardImageFile-${index}`, example.imageFile);
      }

      if (example.videoFile) {
        formData.set(`exampleCardVideoFile-${index}`, example.videoFile);
      }
    });

    const response = await fetch(action, {
      body: formData,
      method: "POST",
    });

    window.location.href = response.url || action;
  }

  return (
    <form
      action={action}
      method="post"
      encType="multipart/form-data"
      onSubmit={handleSubmit}
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

      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_140px_170px]">
        <Field label="Title" name="title" required defaultValue={service?.title} />
        <Field
          label="Sort order"
          name="sortOrder"
          type="number"
          defaultValue={String(service?.sortOrder ?? 0)}
        />
        <div>
          <FieldLabel htmlFor="service-status">Status</FieldLabel>
          <select
            id="service-status"
            name="status"
            defaultValue={service?.status ?? "draft"}
            className={fieldClassName}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <TextArea
        label="Summary"
        name="summary"
        required
        defaultValue={service?.summary}
        rows={3}
      />

      <TextArea
        label="Description"
        name="description"
        required
        defaultValue={service?.description}
        rows={4}
      />

      <TextArea
        label="Highlights"
        name="highlights"
        required
        defaultValue={service?.highlights.join("\n")}
        rows={4}
      />

      <section className="grid gap-5 rounded-[20px] border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lumivale-panel)]">
            Private Pricing
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--lumivale-muted)]">
            These fields power the private pricing list and trusted-client service pages.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Price preview"
            name="pricePreview"
            required
            defaultValue={service?.privateContent.pricePreview}
          />
          <Field
            label="Example platform"
            name="examplePlatform"
            required
            defaultValue={service?.privateContent.examplePlatform}
          />
        </div>

        <TextArea
          label="Private hero description"
          name="heroDescription"
          required
          defaultValue={service?.privateContent.heroDescription}
          rows={4}
        />

        <TextArea
          label="Pricing lines"
          name="pricingLines"
          required
          defaultValue={service?.privateContent.pricingLines
            .map((line) => `${line.label} | ${line.value}`)
            .join("\n")}
          placeholder="Monthly rate | $850"
          rows={4}
        />

        <ExamplesManager examples={examples} onChange={setExamples} />
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--lumivale-accent)] px-6 text-sm font-semibold text-[#010807] transition hover:bg-[var(--lumivale-accent-soft)] disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : submitLabel ?? (service ? "Save service" : "Create service")}
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

function ExamplesManager({
  examples,
  onChange,
}: {
  examples: ExampleDraft[];
  onChange: (examples: ExampleDraft[]) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<ExampleDraft>(emptyExample);

  function openAddModal() {
    setDraft(emptyExample);
    setEditingIndex(null);
    setStep(1);
    setIsModalOpen(true);
  }

  function openEditModal(index: number) {
    setDraft(examples[index] ?? emptyExample);
    setEditingIndex(index);
    setStep(2);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setStep(1);
    setEditingIndex(null);
    setDraft(emptyExample);
  }

  function saveExample() {
    const next = [...examples];

    if (editingIndex === null) {
      next.push(draft);
    } else {
      next[editingIndex] = draft;
    }

    onChange(next);
    closeModal();
  }

  function removeExample(index: number) {
    onChange(examples.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#587184]">
            Examples
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--lumivale-muted)]">
            Add link previews or photo examples for the private pricing service page.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--lumivale-panel)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--lumivale-admin-panel-soft)]"
        >
          Add Example
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {examples.length ? (
          examples.map((example, index) => (
            <article
              key={`${example.title}-${index}`}
              className="rounded-[16px] border border-[var(--lumivale-admin-border)] bg-white p-4"
            >
              <input type="hidden" name={`exampleCardType-${index}`} value={example.exampleType} />
              <input type="hidden" name={`exampleCardTitle-${index}`} value={example.title} />
              <input type="hidden" name={`exampleCardTag-${index}`} value={example.tag} />
              <input type="hidden" name={`exampleCardSummary-${index}`} value={example.summary} />
              <input
                type="hidden"
                name={`exampleCardPreviewUrl-${index}`}
                value={example.previewUrl}
              />
              <input
                type="hidden"
                name={`exampleCardImageAlt-${index}`}
                value={example.imageAlt}
              />
              <input
                type="hidden"
                name={`exampleCardImageUrl-${index}`}
                value={example.imageUrl}
              />
              <input
                type="hidden"
                name={`exampleCardVideoDescription-${index}`}
                value={example.videoDescription}
              />
              <input
                type="hidden"
                name={`exampleCardVideoUrl-${index}`}
                value={example.videoUrl}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--lumivale-admin-chip)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-panel)]">
                      {example.exampleType === "photo" ? "Photo" : "Link preview"}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]">
                      {example.tag || "No tag"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-[var(--lumivale-ink)]">
                    {example.title || "Untitled example"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--lumivale-muted)]">
                    {example.exampleType === "photo"
                      ? example.imageFileName || example.imageAlt || "Photo example"
                      : example.previewUrl || "No preview link set"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(index)}
                    className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[16px] border border-dashed border-[var(--lumivale-admin-border)] bg-white p-5 text-sm text-[var(--lumivale-muted)]">
            No examples yet.
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(3,20,16,0.62)] p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-example-modal-title"
            className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[24px] border border-[var(--lumivale-admin-border)] bg-white p-5 shadow-[0_32px_90px_rgba(1,8,7,0.3)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-panel)]">
                  Step {step} of 2
                </p>
                <h2
                  id="service-example-modal-title"
                  className="mt-2 text-2xl font-semibold text-[var(--lumivale-ink)]"
                >
                  {step === 1 ? "Choose Example Type" : "Example Details"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close example modal"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--lumivale-admin-border)] text-lg text-[var(--lumivale-panel)]"
              >
                x
              </button>
            </div>

            {step === 1 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ ...draft, exampleType: "photo", previewUrl: "" });
                    setStep(2);
                  }}
                  className="rounded-[18px] border border-[var(--lumivale-admin-border)] p-5 text-left transition hover:border-[var(--lumivale-panel)]"
                >
                  <span className="text-lg font-semibold text-[var(--lumivale-ink)]">
                    Photo
                  </span>
                  <span className="mt-2 block text-sm leading-7 text-[var(--lumivale-muted)]">
                    Upload a screenshot, sample, or visual proof image.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ ...draft, exampleType: "link", imageFile: null });
                    setStep(2);
                  }}
                  className="rounded-[18px] border border-[var(--lumivale-admin-border)] p-5 text-left transition hover:border-[var(--lumivale-panel)]"
                >
                  <span className="text-lg font-semibold text-[var(--lumivale-ink)]">
                    Link Preview
                  </span>
                  <span className="mt-2 block text-sm leading-7 text-[var(--lumivale-muted)]">
                    Add a URL that opens as a preview link on the pricing page.
                  </span>
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-5">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                  <ModalField
                    label="Card title"
                    value={draft.title}
                    onChange={(value) => setDraft({ ...draft, title: value })}
                  />
                  <ModalField
                    label="Tag"
                    value={draft.tag}
                    onChange={(value) => setDraft({ ...draft, tag: value })}
                  />
                </div>
                <ModalTextArea
                  label="Description"
                  value={draft.summary}
                  onChange={(value) => setDraft({ ...draft, summary: value })}
                  rows={4}
                />

                {draft.exampleType === "photo" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ModalField
                      label="Photo alt text"
                      value={draft.imageAlt}
                      onChange={(value) => setDraft({ ...draft, imageAlt: value })}
                    />
                    <div>
                      <FieldLabel htmlFor="modal-example-photo">Upload photo</FieldLabel>
                      <input
                        id="modal-example-photo"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;

                          setDraft({
                            ...draft,
                            imageFile: file,
                            imageFileName: file?.name ?? draft.imageFileName,
                          });
                        }}
                        className={fieldClassName}
                      />
                      <p className="mt-2 text-xs leading-6 text-[var(--lumivale-muted)]">
                        PNG, JPG, WEBP, or GIF. Maximum file size: 5MB.
                      </p>
                      {draft.imageFileName ? (
                        <p className="mt-2 text-xs font-semibold text-[var(--lumivale-panel)]">
                          Selected: {draft.imageFileName}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <ModalField
                    label="Preview link"
                    type="url"
                    value={draft.previewUrl}
                    onChange={(value) => setDraft({ ...draft, previewUrl: value })}
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <ModalField
                    label="Video description"
                    value={draft.videoDescription}
                    onChange={(value) => setDraft({ ...draft, videoDescription: value })}
                  />
                  <div>
                    <FieldLabel htmlFor="modal-example-video">Upload video</FieldLabel>
                    <input
                      id="modal-example-video"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;

                        setDraft({
                          ...draft,
                          videoFile: file,
                          videoFileName: file?.name ?? draft.videoFileName,
                        });
                      }}
                      className={fieldClassName}
                    />
                    <p className="mt-2 text-xs leading-6 text-[var(--lumivale-muted)]">
                      Optional MP4, WEBM, or MOV walkthrough. Maximum file size: 50MB.
                    </p>
                    {draft.videoFileName ? (
                      <p className="mt-2 text-xs font-semibold text-[var(--lumivale-panel)]">
                        Selected: {draft.videoFileName}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 border-t border-[var(--lumivale-admin-border)] pt-5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--lumivale-admin-border)] px-5 text-sm font-semibold text-[var(--lumivale-panel)]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={saveExample}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--lumivale-panel)] px-5 text-sm font-semibold text-white"
                  >
                    {editingIndex === null ? "Add example" : "Save example"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function toExampleDraft(card: ServiceExampleCard): ExampleDraft {
  return {
    exampleType: card.exampleType ?? (card.imageUrl ? "photo" : "link"),
    imageAlt: card.imageAlt ?? "",
    imageFile: null,
    imageUrl: card.imageUrl ?? "",
    imageFileName: "",
    previewUrl: card.previewUrl ?? "",
    summary: card.summary,
    tag: card.tag,
    title: card.title,
    videoFile: null,
    videoDescription: card.videoDescription ?? "",
    videoFileName: "",
    videoUrl: card.videoUrl ?? "",
  };
}

function ModalField({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  const id = `modal-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName}
      />
    </div>
  );
}

function ModalTextArea({
  label,
  onChange,
  rows,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  rows: number;
  value: string;
}) {
  const id = `modal-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName}
      />
    </div>
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
