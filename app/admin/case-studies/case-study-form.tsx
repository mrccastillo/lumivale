"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { CaseStudy } from "@/lib/case-studies";
import {
  asStoryInput,
  newSection,
  parseStoryInput,
  StoryValidationError,
  type StoryInput,
  type StorySection,
} from "@/lib/case-study-story";
import { CaseStudyStory } from "@/components/case-study-story";
import { StoryRichEditor } from "./story-rich-editor";
import { StoryImagePicker } from "./story-image-picker";

const fieldClass =
  "mt-2 w-full rounded-lg border border-[var(--lumivale-line)] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[var(--lumivale-accent)]";
const buttonClass =
  "rounded-lg border border-[var(--lumivale-line)] bg-white px-3 py-2 text-xs font-semibold hover:border-emerald-500 disabled:opacity-40";
const sectionNames: Record<StorySection["type"], string> = {
  narrative: "Text",
  imageText: "Image + text",
  image: "Full-width image",
  gallery: "Image gallery",
  comparison: "Before / after",
  quote: "Client quote",
};

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
  const [content, setContent] = useState<StoryInput>(() => asStoryInput(study));
  const [saved, setSaved] = useState(() => JSON.stringify(asStoryInput(study)));
  const [savedSlug, setSavedSlug] = useState(study?.slug ?? "");
  const [manualSlug, setManualSlug] = useState(!!study?.slug);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState(errorMessage ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState(0);
  const [preview, setPreview] = useState<"none" | "wide" | "narrow">("none");
  const router = useRouter();
  const dirty = JSON.stringify(content) !== saved;
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const click = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (
        !dirtyRef.current ||
        !link ||
        link.target === "_blank" ||
        link.getAttribute("href")?.startsWith("#")
      )
        return;
      if (!window.confirm("Leave without saving your case study changes?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, []);
  function update<K extends keyof StoryInput>(key: K, value: StoryInput[K]) {
    setContent((current) => ({ ...current, [key]: value }));
    setMessage("");
  }
  function sectionUpdate(
    id: string,
    updater: (section: StorySection) => StorySection,
  ) {
    setContent((current) => ({
      ...current,
      sections: current.sections?.map((section) =>
        section.id === id ? updater(section) : section,
      ),
    }));
  }
  const onPending = (delta: number) =>
    setPending((count) => Math.max(0, count + delta));
  function field(
    key:
      | "category"
      | "headline"
      | "clientName"
      | "clientUrl"
      | "industry"
      | "timeframe"
      | "budget",
    label: string,
    required = false,
    maxLength = 200,
  ) {
    return (
      <Field
        label={label}
        name={key}
        value={String(content[key] ?? "")}
        required={required}
        maxLength={maxLength}
        error={errors[key]}
        onChange={(value) => update(key, value)}
      />
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (pending || saving) return;
    setErrors({});
    setError("");
    setMessage("");
    let input: StoryInput;
    try {
      input = parseStoryInput(content);
    } catch (cause) {
      if (cause instanceof StoryValidationError) setErrors(cause.errors);
      setError("Check the highlighted fields before saving.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(
        savedSlug
          ? `/api/admin/case-studies/${savedSlug}`
          : "/api/admin/case-studies",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors ?? {});
        throw new Error(result.error || "Could not save case study.");
      }
      const next = asStoryInput(result.study);
      setContent(next);
      setSaved(JSON.stringify(next));
      setSavedSlug(next.slug);
      dirtyRef.current = false;
      setMessage(
        next.status === "published"
          ? "Case study saved. Your changes are live."
          : "Draft saved. This story is not public.",
      );
      if (savedSlug !== next.slug)
        router.replace(`/admin/case-studies/${next.slug}/edit`);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save case study.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="space-y-6">
      <form onSubmit={save} noValidate className="space-y-6">
        <fieldset
          disabled={saving}
          className="min-w-0 space-y-6 disabled:opacity-70"
        >
          <Panel title="Story details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Title"
                name="title"
                value={content.title}
                required
                error={errors.title}
                onChange={(value) =>
                  setContent((current) => ({
                    ...current,
                    title: value,
                    slug:
                      manualSlug || study?.isDefault
                        ? current.slug
                        : slugify(value),
                  }))
                }
              />
              <Field
                label="Case Study Link Ending"
                name="slug"
                value={content.slug}
                required
                readOnly={study?.isDefault}
                error={errors.slug}
                onChange={(value) => {
                  setManualSlug(true);
                  update("slug", slugify(value));
                }}
              />
            </div>
            {study?.isDefault && (
              <p className="text-xs text-[var(--lumivale-muted)]">
                Seeded case study links stay fixed. You can unpublish the story
                if it should be hidden.
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-3">
              {field("category", "Category")}
              <label className="block text-sm font-semibold">
                Status
                <select
                  name="status"
                  value={content.status}
                  className={fieldClass}
                  onChange={(event) =>
                    update("status", event.target.value as StoryInput["status"])
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <Field
                label="Sort order"
                name="sortOrder"
                type="number"
                value={String(content.sortOrder)}
                onChange={(value) => update("sortOrder", Number(value))}
              />
            </div>
            {field("headline", "Headline")}
            <Field
              label="Summary"
              name="summary"
              value={content.summary}
              multiline
              maxLength={2000}
              error={errors.summary}
              onChange={(value) => update("summary", value)}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              {field("clientName", "Client name (optional)")}
              {field("clientUrl", "Client website (optional)", false, 2000)}
              {field("industry", "Industry (optional)")}
              {field("timeframe", "Timeframe (optional)")}
              {field("budget", "Budget (optional)")}
              <Field
                label="Channels (comma separated, optional)"
                value={content.channels?.join(",") ?? ""}
                onChange={(value) => update("channels", value.split(","))}
                maxLength={1000}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <StoryImagePicker
                label="Cover image"
                value={content.cover}
                onChange={(image) => update("cover", image)}
                onPending={onPending}
              />
              <StoryImagePicker
                label="Client logo"
                value={content.logo}
                onChange={(image) => update("logo", image)}
                onPending={onPending}
              />
            </div>
            <Errors errors={errors} prefix="cover" />
            <Errors errors={errors} prefix="logo" />
          </Panel>
          <Panel title="Results">
            <p className="text-sm text-[var(--lumivale-muted)]">
              Add verified results as a value and a short label. Up to eight
              metrics.
            </p>
            {content.metrics.map((metric, index) => (
              <div key={metric.id} className="flex items-start gap-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <Field
                    label={`Metric ${index + 1} value`}
                    value={metric.value}
                    maxLength={24}
                    error={errors[`metrics.${index}.value`]}
                    onChange={(value) =>
                      update(
                        "metrics",
                        content.metrics.map((item) =>
                          item.id === metric.id ? { ...item, value } : item,
                        ),
                      )
                    }
                  />
                  <Field
                    label={`Metric ${index + 1} label`}
                    value={metric.label}
                    maxLength={80}
                    error={errors[`metrics.${index}.label`]}
                    onChange={(label) =>
                      update(
                        "metrics",
                        content.metrics.map((item) =>
                          item.id === metric.id ? { ...item, label } : item,
                        ),
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-1 pt-6">
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={!index}
                    onClick={() =>
                      update("metrics", move(content.metrics, index, -1))
                    }
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={index === content.metrics.length - 1}
                    onClick={() =>
                      update("metrics", move(content.metrics, index, 1))
                    }
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove metric ${index + 1}`}
                    className={buttonClass}
                    onClick={() =>
                      update(
                        "metrics",
                        content.metrics.filter((item) => item.id !== metric.id),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {errors.metrics && (
              <p className="text-sm text-red-700">{errors.metrics}</p>
            )}
            <button
              type="button"
              className={buttonClass}
              disabled={content.metrics.length >= 8}
              onClick={() =>
                update("metrics", [
                  ...content.metrics,
                  { id: crypto.randomUUID(), value: "", label: "" },
                ])
              }
            >
              Add metric
            </button>
          </Panel>
          <Panel title="Story sections">
            <p className="text-sm text-[var(--lumivale-muted)]">
              Build the story in reading order. Add text, evidence, comparisons,
              and quotes.
            </p>
            {(content.sections ?? []).map((section, index) => (
              <section
                key={section.id}
                aria-label={`Section ${index + 1}: ${sectionNames[section.type]}`}
                className="space-y-5 rounded-xl border border-[var(--lumivale-line)] p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {sectionNames[section.type]}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={buttonClass}
                      disabled={!index}
                      onClick={() =>
                        update(
                          "sections",
                          move(content.sections ?? [], index, -1),
                        )
                      }
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      className={buttonClass}
                      disabled={index === (content.sections?.length ?? 0) - 1}
                      onClick={() =>
                        update(
                          "sections",
                          move(content.sections ?? [], index, 1),
                        )
                      }
                    >
                      Move down
                    </button>
                    <button
                      type="button"
                      className={buttonClass}
                      onClick={() =>
                        update(
                          "sections",
                          content.sections?.filter(
                            (item) => item.id !== section.id,
                          ),
                        )
                      }
                    >
                      Remove section
                    </button>
                  </div>
                </div>
                <SectionEditor
                  section={section}
                  update={(updater) => sectionUpdate(section.id, updater)}
                  onPending={onPending}
                />
                <Errors errors={errors} prefix={`sections.${index}`} />
              </section>
            ))}
            {errors.sections && (
              <p className="text-sm text-red-700">{errors.sections}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(sectionNames) as StorySection["type"][]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    className={buttonClass}
                    disabled={(content.sections?.length ?? 0) >= 30}
                    onClick={() =>
                      update("sections", [
                        ...(content.sections ?? []),
                        newSection(type),
                      ])
                    }
                  >
                    Add {sectionNames[type].toLowerCase()}
                  </button>
                ),
              )}
            </div>
          </Panel>
          <Panel title="Closing call to action">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!content.cta}
                onChange={(event) =>
                  update(
                    "cta",
                    event.target.checked
                      ? { heading: "", text: "", buttonText: "", buttonUrl: "" }
                      : undefined,
                  )
                }
              />
              Include a closing call to action
            </label>
            {content.cta && (
              <>
                {(["heading", "text", "buttonText", "buttonUrl"] as const).map(
                  (key) => (
                    <Field
                      key={key}
                      label={
                        {
                          heading: "CTA heading",
                          text: "CTA description",
                          buttonText: "CTA button text",
                          buttonUrl: "CTA button URL",
                        }[key]
                      }
                      value={content.cta![key]}
                      maxLength={
                        key === "text" || key === "buttonUrl" ? 2000 : 200
                      }
                      error={errors[`cta.${key}`]}
                      onChange={(value) =>
                        update("cta", { ...content.cta!, [key]: value })
                      }
                    />
                  ),
                )}
              </>
            )}
          </Panel>
          <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--lumivale-line)] bg-white/95 p-4 shadow-lg backdrop-blur">
            <button
              type="submit"
              disabled={pending > 0}
              className="rounded-lg bg-[var(--lumivale-accent)] px-5 py-3 text-sm font-semibold text-[#031410] disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : (submitLabel ??
                  (savedSlug ? "Save case study" : "Create case study"))}
            </button>
            <button
              type="button"
              className={buttonClass}
              onClick={() => setPreview(preview === "none" ? "wide" : "none")}
            >
              {preview === "none" ? "Preview story" : "Close preview"}
            </button>
            <a
              href={cancelHref ?? "/admin/case-studies"}
              className="text-sm font-medium"
            >
              Cancel
            </a>
            <span className="text-xs text-[var(--lumivale-muted)]">
              {pending
                ? "Waiting for image uploads..."
                : dirty
                  ? "Unsaved changes"
                  : "No unsaved changes"}
            </span>
          </div>
        </fieldset>
        {content.status === "published" && (
          <p className="text-sm text-[var(--lumivale-muted)]">
            Saving a published story updates the live website.
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>
            {Object.entries(errors).map(([key, value]) => (
              <p key={key} className="mt-1">
                {key}: {value}
              </p>
            ))}
          </div>
        )}
        {message && (
          <p role="status" className="text-sm text-emerald-800">
            {message}
          </p>
        )}
      </form>
      {preview !== "none" && (
        <section aria-label="Story preview" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-semibold">Preview - unsaved content</h2>
            <button
              type="button"
              className={buttonClass}
              aria-pressed={preview === "wide"}
              onClick={() => setPreview("wide")}
            >
              Desktop
            </button>
            <button
              type="button"
              className={buttonClass}
              aria-pressed={preview === "narrow"}
              onClick={() => setPreview("narrow")}
            >
              Mobile
            </button>
          </div>
          <div
            className={`mx-auto overflow-hidden rounded-xl border border-[var(--lumivale-line)] ${preview === "narrow" ? "max-w-[390px]" : "w-full"}`}
          >
            <div data-preserve-preview><CaseStudyStory study={content} /></div>
          </div>
        </section>
      )}
    </div>
  );
}

function SectionEditor({
  section,
  update,
  onPending,
}: {
  section: StorySection;
  update: (updater: (current: StorySection) => StorySection) => void;
  onPending: (delta: number) => void;
}) {
  function change(key: string, value: unknown) {
    update((current) => ({ ...current, [key]: value }) as StorySection);
  }
  return (
    <>
      {"heading" in section && (
        <Field
          label="Section heading"
          value={section.heading}
          onChange={(value) => change("heading", value)}
        />
      )}
      {"body" in section && (
        <StoryRichEditor
          label="Section text"
          value={section.body}
          onChange={(value) => change("body", value)}
        />
      )}
      {section.type === "imageText" && (
        <label className="block text-sm font-semibold">
          Image placement
          <select
            value={section.side}
            className={fieldClass}
            onChange={(event) => change("side", event.target.value)}
          >
            <option value="left">Image on left</option>
            <option value="right">Image on right</option>
          </select>
        </label>
      )}
      {("image" in section ||
        ["image", "imageText", "quote"].includes(section.type)) && (
        <StoryImagePicker
          label={
            section.type === "quote"
              ? "Quote portrait (optional)"
              : "Section image"
          }
          value={"image" in section ? section.image : undefined}
          onChange={(value) => change("image", value)}
          onPending={onPending}
        />
      )}
      {section.type === "image" && (
        <Field
          label="Evidence source URL (optional)"
          value={section.sourceUrl}
          maxLength={2000}
          onChange={(value) => change("sourceUrl", value)}
        />
      )}
      {section.type === "gallery" && (
        <div className="space-y-4">
          {section.images.map((image, index) => (
            <div key={image.id} className="space-y-2">
              <StoryImagePicker
                label={`Gallery image ${index + 1}`}
                value={image.url ? image : undefined}
                onPending={onPending}
                onChange={(value) =>
                  update((current) =>
                    current.type === "gallery"
                      ? {
                          ...current,
                          images: value
                            ? current.images.map((item) =>
                                item.id === image.id
                                  ? { ...value, id: image.id }
                                  : item,
                              )
                            : current.images.filter(
                                (item) => item.id !== image.id,
                              ),
                        }
                      : current,
                  )
                }
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className={buttonClass}
                  disabled={!index}
                  onClick={() =>
                    change("images", move(section.images, index, -1))
                  }
                >
                  Move image up
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  disabled={index === section.images.length - 1}
                  onClick={() =>
                    change("images", move(section.images, index, 1))
                  }
                >
                  Move image down
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() =>
                    change(
                      "images",
                      section.images.filter((item) => item.id !== image.id),
                    )
                  }
                >
                  Remove gallery item
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className={buttonClass}
            disabled={section.images.length >= 8}
            onClick={() =>
              change("images", [
                ...section.images,
                { id: crypto.randomUUID(), url: "", alt: "" },
              ])
            }
          >
            Add gallery image
          </button>
        </div>
      )}
      {section.type === "comparison" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <Field
              label="Before label"
              value={section.beforeLabel}
              onChange={(value) => change("beforeLabel", value)}
            />
            <StoryRichEditor
              label="Before text"
              value={section.before}
              onChange={(value) => change("before", value)}
            />
          </div>
          <div className="space-y-3">
            <Field
              label="After label"
              value={section.afterLabel}
              onChange={(value) => change("afterLabel", value)}
            />
            <StoryRichEditor
              label="After text"
              value={section.after}
              onChange={(value) => change("after", value)}
            />
          </div>
        </div>
      )}
      {section.type === "quote" && (
        <>
          <Field
            label="Quote"
            value={section.quote}
            multiline
            maxLength={4000}
            onChange={(value) => change("quote", value)}
          />
          <Field
            label="Person name"
            value={section.personName}
            onChange={(value) => change("personName", value)}
          />
          <Field
            label="Role or company (optional)"
            value={section.role}
            onChange={(value) => change("role", value)}
          />
        </>
      )}
    </>
  );
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-5 rounded-2xl border border-[var(--lumivale-line)] bg-white p-5 sm:p-7">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
function Field({
  label,
  value,
  onChange,
  name,
  type = "text",
  maxLength = 200,
  required,
  readOnly,
  multiline,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  type?: string;
  maxLength?: number;
  required?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  error?: string;
}) {
  const props = {
    name,
    value,
    maxLength,
    required,
    readOnly,
    "aria-invalid": !!error,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
    className: fieldClass,
  };
  return (
    <label className="block text-sm font-semibold">
      {label}
      {multiline ? (
        <textarea {...props} rows={4} />
      ) : (
        <input {...props} type={type} />
      )}
      {error && (
        <span className="mt-1 block text-xs font-normal text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}
function Errors({
  errors,
  prefix,
}: {
  errors: Record<string, string>;
  prefix: string;
}) {
  return (
    <>
      {Object.entries(errors)
        .filter(([key]) => key === prefix || key.startsWith(`${prefix}.`))
        .map(([key, message]) => (
          <p key={key} className="text-sm text-red-700">
            {key.split(".").slice(2).join(" ") || "Image"}: {message}
          </p>
        ))}
    </>
  );
}
function move<T>(items: T[], index: number, direction: number): T[] {
  const next = [...items];
  const destination = index + direction;
  if (destination < 0 || destination >= items.length) return next;
  [next[index], next[destination]] = [next[destination], next[index]];
  return next;
}
function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
