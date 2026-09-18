"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";

import { normalizeExamplePlatforms, type ExamplePlatform } from "@/lib/service-example-platforms";
import type { Service, ServiceExampleCard } from "@/lib/services";

const fieldClassName =
  "min-h-12 w-full rounded-[18px] border border-[var(--lumivale-line)] bg-white px-4 py-3 text-sm text-[var(--lumivale-ink)] outline-none transition focus:border-[var(--lumivale-accent)]";

type ExampleDraft = {
  id: string;
  platformId: string;
  previewMode: "automatic" | "cover";
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
  id: "",
  platformId: "",
  previewMode: "automatic",
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
  const initialContent = service ? normalizeExamplePlatforms(service.privateContent) : null;
  const [platforms, setPlatforms] = useState<ExamplePlatform[]>(initialContent?.examplePlatforms ?? []);
  const [examples, setExamples] = useState<ExampleDraft[]>(
    (initialContent?.exampleCards ?? []).map(toExampleDraft),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    examples.forEach((example) => {
      formData.set(`exampleCardPreviewMode-${example.id}`, example.previewMode);
      if (example.imageFile) {
        formData.set(`exampleCardImageFile-${example.id}`, example.imageFile);
      }

      if (example.videoFile) {
        formData.set(`exampleCardVideoFile-${example.id}`, example.videoFile);
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
      <input type="hidden" name="exampleManifest" value={JSON.stringify({ platforms, examples: examples.map(({ id, platformId, title, tag, summary, exampleType, imageAlt, imageUrl, previewUrl, videoUrl, videoDescription }) => ({ id, platformId, title, tag, summary, exampleType, imageAlt, imageUrl, previewUrl, videoUrl, videoDescription })) })} />

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

        <ExamplesManager examples={examples} onChange={setExamples} platforms={platforms} onPlatformsChange={setPlatforms} />
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
  platforms,
  onPlatformsChange,
}: {
  platforms: ExamplePlatform[];
  onPlatformsChange: (platforms: ExamplePlatform[]) => void;
  examples: ExampleDraft[];
  onChange: (examples: ExampleDraft[]) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<ExampleDraft>(emptyExample);
  const [draftError, setDraftError] = useState("");

  const [platformName, setPlatformName] = useState("");
  const [platformError, setPlatformError] = useState("");

  function savePlatform(id?: string, value = platformName) {
    const name = value.trim();
    if (!name || name.length > 60 || platforms.some((item) => item.id !== id && item.name.toLowerCase() === name.toLowerCase())) {
      setPlatformError("Use a unique platform name with 1 to 60 characters.");
      return;
    }
    onPlatformsChange(id ? platforms.map((item) => item.id === id ? { ...item, name } : item) : [...platforms, { id: crypto.randomUUID(), name }]);
    setPlatformName("");
    setPlatformError("");
  }

  function movePlatform(index: number, offset: number) {
    const next = [...platforms];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onPlatformsChange(next);
  }

  function openAddModal(platformId: string) {
    setDraftError("");
    setDraft({ ...emptyExample, id: crypto.randomUUID(), platformId });
    setEditingIndex(null);
    setStep(1);
    setIsModalOpen(true);
  }

  function openEditModal(index: number) {
    setDraftError("");
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
    if (draft.exampleType === "link" && draft.previewMode === "cover" && !draft.imageFile && !draft.imageUrl) {
      setDraftError("Upload a cover photo or choose Automatic preview.");
      return;
    }
    if (draft.imageFile && (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(draft.imageFile.type) || draft.imageFile.size > 5 * 1024 * 1024)) {
      setDraftError("Choose a PNG, JPG, WEBP, or GIF image up to 5MB.");
      return;
    }
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
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-sm font-semibold">New platform
          <input className={`${fieldClassName} mt-2`} value={platformName} maxLength={60} onChange={(event) => setPlatformName(event.target.value)} />
        </label>
        <button type="button" className="rounded-xl bg-[var(--lumivale-panel)] px-4 py-3 text-sm font-semibold text-white" onClick={() => savePlatform()}>Add platform</button>
      </div>
      {platformError ? <p role="alert" className="mt-2 text-sm text-red-700">{platformError}</p> : null}
      {!platforms.length ? <p className="mt-4 text-sm">Add a platform to start adding examples.</p> : null}
      <div className="mt-4 grid gap-5">
        {platforms.map((platform, platformIndex) => {
          const cards = examples.map((example, index) => ({ example, index })).filter(({ example }) => example.platformId === platform.id);
          return <section key={platform.id} aria-label={`${platform.name} examples`} className="min-w-0 rounded-2xl border border-[var(--lumivale-admin-border)] p-4">
            <PlatformName platform={platform} onSave={(name) => savePlatform(platform.id, name)} />
            <div className="my-4 flex flex-wrap gap-2 text-sm">
              <button type="button" disabled={platformIndex === 0} className="rounded-lg border px-3 py-2 disabled:opacity-40" onClick={() => movePlatform(platformIndex, -1)}>Move up</button>
              <button type="button" disabled={platformIndex === platforms.length - 1} className="rounded-lg border px-3 py-2 disabled:opacity-40" onClick={() => movePlatform(platformIndex, 1)}>Move down</button>
              <button type="button" disabled={cards.length > 0} title={cards.length ? "Move or remove the examples in this platform first." : undefined} className="rounded-lg border px-3 py-2 disabled:opacity-40" onClick={() => onPlatformsChange(platforms.filter((item) => item.id !== platform.id))}>Remove platform</button>
              <button type="button" className="rounded-lg bg-[var(--lumivale-panel)] px-4 py-2 font-semibold text-white" onClick={() => openAddModal(platform.id)}>Add Example</button>
            </div>
            {cards.length > 0 ? <p className="mb-3 text-xs text-[var(--lumivale-muted)]">Move or remove all examples before removing this platform.</p> : <p className="text-sm text-[var(--lumivale-muted)]">No examples yet. This platform is hidden from visitors.</p>}
            <div className="grid gap-3">{cards.map(({ example, index }) => (
            <article
              key={example.id}
              className="rounded-[16px] border border-[var(--lumivale-admin-border)] bg-white p-4"
            >
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
            ))}</div>
          </section>;
        })}
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
                    setDraft({ ...draft, exampleType: "link" });
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
                <label className="text-sm font-semibold">Platform
                  <select aria-label="Platform" className={`${fieldClassName} mt-2`} value={draft.platformId} onChange={(event) => setDraft({ ...draft, platformId: event.target.value })}>
                    {platforms.map((platform) => <option key={platform.id} value={platform.id}>{platform.name}</option>)}
                  </select>
                </label>
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
                  <div className="grid gap-4">
                  <ModalField
                    label="Preview link"
                    type="url"
                    value={draft.previewUrl}
                    onChange={(value) => setDraft({ ...draft, previewUrl: value })}
                  />
                  <p className="text-xs leading-6 text-[var(--lumivale-muted)]">YouTube, TikTok, and supported Facebook links show embedded previews. Other websites show a link card. Choose a cover photo to show your own image instead.</p>
                  <label className="text-sm font-semibold">Preview appearance
                    <select className={`${fieldClassName} mt-2`} value={draft.previewMode} onChange={(event) => {
                      setDraftError("");
                      setDraft({ ...draft, previewMode: event.target.value as ExampleDraft["previewMode"], ...(event.target.value === "automatic" ? { imageUrl: "", imageAlt: "", imageFile: null, imageFileName: "" } : {}) });
                    }}>
                      <option value="automatic">Automatic preview</option>
                      <option value="cover">Custom cover photo</option>
                    </select>
                  </label>
                  {draft.previewMode === "cover" ? (
                    <div className="grid gap-4">
                      <ModalField label="Cover alt text" value={draft.imageAlt} onChange={(value) => setDraft({ ...draft, imageAlt: value })} />
                      <label className="text-sm font-semibold">Upload cover photo
                        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={`${fieldClassName} mt-2`} onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setDraftError("");
                          setDraft({ ...draft, imageFile: file, imageFileName: file?.name ?? "" });
                        }} />
                      </label>
                      <p className="text-xs text-[var(--lumivale-muted)]">PNG, JPG, WEBP, or GIF, up to 5MB. Clicking the cover opens the preview link.</p>
                      <CoverPreview file={draft.imageFile} url={draft.imageUrl} alt={draft.imageAlt || draft.title} />
                      {draft.imageFile || draft.imageUrl ? <button type="button" className="justify-self-start text-sm font-semibold text-red-600" onClick={() => {
                        setDraftError("");
                        setDraft({ ...draft, previewMode: "automatic", imageUrl: "", imageAlt: "", imageFile: null, imageFileName: "" });
                      }}>Remove cover photo</button> : null}
                    </div>
                  ) : null}
                  </div>
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

                {draftError ? <p role="alert" className="text-sm text-red-700">{draftError}</p> : null}
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

function PlatformName({ platform, onSave }: { platform: ExamplePlatform; onSave: (name: string) => void }) {
  const [name, setName] = useState(platform.name);
  return <div className="flex flex-wrap items-end gap-3">
    <label className="min-w-0 flex-1 text-sm font-semibold">Platform name
      <input className={`${fieldClassName} mt-2`} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} />
    </label>
    <button type="button" className="rounded-lg border px-3 py-3 text-sm font-semibold" onClick={() => onSave(name)}>Rename platform</button>
  </div>;
}

function toExampleDraft(card: ServiceExampleCard): ExampleDraft {
  return {
    id: card.id!,
    platformId: card.platformId!,
    previewMode: card.imageUrl ? "cover" : "automatic",
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

function CoverPreview({ file, url, alt }: { file: File | null; url: string; alt: string }) {
  const [localUrl, setLocalUrl] = useState("");
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLocalUrl(String(reader.result));
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);
  const src = file ? localUrl : url;
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt={alt || "Cover preview"} className="max-h-52 w-full rounded-xl object-contain" /> : null;
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
