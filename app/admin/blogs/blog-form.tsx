"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";

import { BlogRichTextEditor } from "@/app/admin/blogs/blog-rich-text-editor";
import type { BlogPost } from "@/lib/blogs";

type BlogFormState = {
  body: string;
  bodyHtml: string;
  category: string;
  coverAlt: string;
  coverImageId: string;
  excerpt: string;
  readTime: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: "draft" | "published";
  tags: string;
  title: string;
};

export function BlogForm({
  post,
  submitLabel = post ? "Save Blog Post" : "Create Blog Post",
}: {
  post?: BlogPost;
  submitLabel?: string;
}) {
  const action = post ? `/api/admin/blogs/${post.id}` : "/api/admin/blogs";
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(post?.slug));
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(
    post?.coverImageId ? `/api/blog-images/${post.coverImageId}` : "",
  );
  const [form, setForm] = useState<BlogFormState>(() => ({
    body: post?.body ?? "",
    bodyHtml: markdownToPreviewHtml(post?.body ?? ""),
    category: post?.category ?? "",
    coverAlt: post?.coverAlt ?? "",
    coverImageId: post?.coverImageId ?? "",
    excerpt: post?.excerpt ?? "",
    readTime: post?.readTime ?? "",
    seoDescription: post?.seoDescription ?? "",
    seoTitle: post?.seoTitle ?? "",
    slug: post?.slug ?? "",
    status: post?.status ?? "draft",
    tags: post?.tags.join(", ") ?? "",
    title: post?.title ?? "",
  }));

  useEffect(() => {
    return () => {
      if (coverPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  const publicUrl = useMemo(
    () => `https://lumivale.com/blog/${form.slug || "your-link"}`,
    [form.slug],
  );

  function handleFieldChange<K extends keyof BlogFormState>(field: K, value: BlogFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: isSlugManuallyEdited ? current.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setIsSlugManuallyEdited(true);
    handleFieldChange("slug", slugify(value));
  }

  function handleCoverImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (coverPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    const nextPreview = URL.createObjectURL(file);
    setCoverPreviewUrl(nextPreview);

    setForm((current) => ({
      ...current,
      coverAlt: current.coverAlt || current.title || file.name.replace(/\.[^.]+$/, ""),
    }));
  }

  function handleReset() {
    if (coverPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    setIsSlugManuallyEdited(Boolean(post?.slug));
    setCoverPreviewUrl(post?.coverImageId ? `/api/blog-images/${post.coverImageId}` : "");
    setForm({
      body: post?.body ?? "",
      bodyHtml: markdownToPreviewHtml(post?.body ?? ""),
      category: post?.category ?? "",
      coverAlt: post?.coverAlt ?? "",
      coverImageId: post?.coverImageId ?? "",
      excerpt: post?.excerpt ?? "",
      readTime: post?.readTime ?? "",
      seoDescription: post?.seoDescription ?? "",
      seoTitle: post?.seoTitle ?? "",
      slug: post?.slug ?? "",
      status: post?.status ?? "draft",
      tags: post?.tags.join(", ") ?? "",
      title: post?.title ?? "",
    });
  }

  return (
    <form
      action={action}
      method="post"
      encType="multipart/form-data"
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
    >
      <input type="hidden" name="action" value="save" />

      <div className="space-y-6">
        <SectionHeading
          eyebrow="Blog Editor"
          title={post ? "Edit Blog Post" : "Create Blog Post"}
          description="Write the article, prepare the summary, and manage the public URL before publishing it to the website."
        />

        <section className="rounded-[22px] border border-[var(--lumivale-line)] bg-[#fbfcff] p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Title"
              name="title"
              required
              placeholder="Write a strong article title"
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
            />
            <div>
              <Field
                label="Blog Link Ending"
                name="slug"
                required
                placeholder="Example: growth-systems"
                value={form.slug}
                onChange={(event) => handleSlugChange(event.target.value)}
              />
              <p className="mt-2 text-xs leading-6 text-[var(--lumivale-muted)]">
                Only enter the last part of the blog link, not the full website address.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-[var(--lumivale-line)] bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lumivale-muted)]">
              Public URL
            </p>
            <p className="mt-2 break-all text-sm text-[var(--lumivale-ink)]">{publicUrl}</p>
          </div>
        </section>

        <section className="rounded-[22px] border border-[var(--lumivale-line)] bg-[#fbfcff] p-4 sm:p-5">
          <FieldLabel>Short Summary</FieldLabel>
          <textarea
            name="excerpt"
            required
            rows={4}
            value={form.excerpt}
            onChange={(event) => handleFieldChange("excerpt", event.target.value)}
            placeholder="Write a short preview that customers will see before opening the full blog post"
            className={fieldClassName}
          />
          <p className="mt-2 text-xs leading-6 text-[var(--lumivale-muted)]">
            A concise summary makes the listing page easier to scan and improves SEO snippets.
          </p>
        </section>

        <section className="rounded-[22px] border border-[var(--lumivale-line)] bg-[#fbfcff] p-4 sm:p-5">
          <FieldLabel>Body Content</FieldLabel>
          <BlogRichTextEditor
            htmlValue={form.bodyHtml}
            name="body"
            required
            value={form.body}
            onChange={({ html, markdown }) =>
              setForm((current) => ({ ...current, body: markdown, bodyHtml: html }))
            }
          />
          <p className="mt-3 text-xs leading-6 text-[var(--lumivale-muted)]">
            Use the editor toolbar to format the article, upload inline images, or switch to HTML mode for direct markup editing.
          </p>
        </section>

        <section
          aria-label="Blog preview"
          className="rounded-[22px] border border-[var(--lumivale-line)] bg-[#fbfcff] p-4 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-5 w-1 rounded-full bg-[var(--lumivale-accent)]" />
            <p className="text-lg font-semibold text-[var(--lumivale-ink)]">Preview</p>
          </div>

          <div className="mt-4 overflow-hidden rounded-[24px] border border-[var(--lumivale-line)] bg-white">
            {coverPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreviewUrl}
                alt={form.coverAlt || form.title || "Cover image preview"}
                className="max-h-[340px] w-full object-cover"
              />
            ) : (
              <div className="flex min-h-[220px] items-center justify-center bg-[linear-gradient(135deg,#edf8ff_0%,#ffffff_100%)] text-[#3b6273]">
                <div className="text-center">
                  <ImageIcon />
                  <p className="mt-3 text-sm font-medium">Cover image preview</p>
                </div>
              </div>
            )}

            <div className="p-6">
              <StatusBadge status={form.status} />
              <p className="mt-4 text-3xl font-semibold text-[var(--lumivale-ink)]">
                {form.title || "Blog title preview"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--lumivale-muted)]">
                {form.excerpt ||
                  "Your short summary will appear here before the full article content."}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lumivale-muted)]">
                /blog/{form.slug || "your-link"}
              </p>
              <div
                className="prose prose-stone mt-6 max-w-none"
                dangerouslySetInnerHTML={{
                  __html: form.bodyHtml || "<p></p>",
                }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-[var(--lumivale-line)] bg-[#fbfcff] p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Category"
              name="category"
              required
              value={form.category}
              onChange={(event) => handleFieldChange("category", event.target.value)}
            />
            <Field
              label="Read Time"
              name="readTime"
              required
              value={form.readTime}
              onChange={(event) => handleFieldChange("readTime", event.target.value)}
            />
          </div>
          <div className="mt-4">
            <Field
              label="Tags"
              name="tags"
              value={form.tags}
              onChange={(event) => handleFieldChange("tags", event.target.value)}
            />
          </div>
        </section>

        <section className="rounded-[22px] border border-[var(--lumivale-line)] bg-[#fbfcff] p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="SEO Title"
              name="seoTitle"
              value={form.seoTitle}
              onChange={(event) => handleFieldChange("seoTitle", event.target.value)}
            />
            <Field
              label="SEO Description"
              name="seoDescription"
              value={form.seoDescription}
              onChange={(event) => handleFieldChange("seoDescription", event.target.value)}
            />
          </div>
        </section>
      </div>

      <aside
        aria-label="Publishing and media controls"
        className="space-y-6 lg:sticky lg:top-28 lg:self-start"
      >
        <section className="rounded-[22px] border border-[var(--lumivale-line)] bg-white p-4 sm:p-5 shadow-[0_18px_48px_rgba(42,47,82,0.08)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-accent)]">
              Publish Controls
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--lumivale-ink)]">
              Save And Manage
            </p>
          </div>

          <div className="mt-4">
            <FieldLabel>Status</FieldLabel>
            <select
              name="status"
              value={form.status}
              onChange={(event) =>
                handleFieldChange(
                  "status",
                  event.target.value === "published" ? "published" : "draft",
                )
              }
              className={fieldClassName}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--lumivale-accent)] px-4 py-3 text-sm font-semibold text-[var(--lumivale-deep)] transition hover:bg-[var(--lumivale-accent-soft)]"
          >
            {submitLabel}
          </button>
          <a
            href="/admin/blogs?mode=create"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[var(--lumivale-line)] px-4 py-3 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[var(--lumivale-accent)]"
          >
            New Draft
          </a>
          <button
            type="reset"
            onClick={handleReset}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[var(--lumivale-line)] px-4 py-3 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[var(--lumivale-accent)]"
          >
            Clear Form
          </button>
        </section>

        <section className="rounded-[22px] border border-[var(--lumivale-line)] bg-white p-4 sm:p-5 shadow-[0_18px_48px_rgba(42,47,82,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-accent)]">
            Media
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--lumivale-ink)]">Cover Image</p>

          <input type="hidden" name="coverImageId" value={form.coverImageId} />
          <label className="mt-4 grid min-h-32 cursor-pointer place-items-center rounded-[18px] border border-dashed border-[var(--lumivale-line)] bg-[#fbfcff] p-5 text-center text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[var(--lumivale-accent)]">
            Upload cover image
            <span className="mt-1 block text-xs font-normal text-[var(--lumivale-muted)]">
              JPG, PNG, WebP, or GIF
            </span>
            <input
              aria-label="Upload cover image"
              name="coverImage"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              onChange={handleCoverImageChange}
            />
          </label>

          <div className="mt-5">
            <Field
              label="Cover Image Description"
              name="coverAlt"
              value={form.coverAlt}
              onChange={(event) => handleFieldChange("coverAlt", event.target.value)}
            />
          </div>
        </section>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  onChange,
  placeholder,
  required,
  value,
}: {
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        aria-label={label}
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={fieldClassName}
      />
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#587184]">
      {children}
    </label>
  );
}

function SectionHeading({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#587184]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[var(--lumivale-ink)]">{title}</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--lumivale-muted)]">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "published" }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
        status === "published"
          ? "bg-[#e9fbf3] text-[#127e59]"
          : "bg-[#fff5e8] text-[#c46f00]"
      }`}
    >
      {status}
    </span>
  );
}

function ImageIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mx-auto h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="10" r="1.5" />
      <path d="m21 15-5-5-4 4-2-2-5 5" />
    </svg>
  );
}

const fieldClassName =
  "min-h-12 w-full rounded-[18px] border border-[var(--lumivale-line)] bg-white px-4 py-3 text-sm text-[var(--lumivale-ink)] outline-none transition focus:border-[var(--lumivale-accent)]";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function markdownToPreviewHtml(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .reduce<{ html: string[]; list: "ul" | "ol" | null }>(
      (state, line) => {
        const trimmed = line.trim();

        if (!trimmed) {
          if (state.list) {
            state.html.push(`</${state.list}>`);
            state.list = null;
          }
          return state;
        }

        const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
        if (heading) {
          if (state.list) {
            state.html.push(`</${state.list}>`);
            state.list = null;
          }
          state.html.push(`<h${heading[1].length}>${escapeHtml(heading[2])}</h${heading[1].length}>`);
          return state;
        }

        const unordered = trimmed.match(/^[-*]\s+(.+)$/);
        if (unordered) {
          if (state.list !== "ul") {
            if (state.list) {
              state.html.push(`</${state.list}>`);
            }
            state.html.push("<ul>");
            state.list = "ul";
          }
          state.html.push(`<li>${escapeHtml(unordered[1])}</li>`);
          return state;
        }

        const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
        if (ordered) {
          if (state.list !== "ol") {
            if (state.list) {
              state.html.push(`</${state.list}>`);
            }
            state.html.push("<ol>");
            state.list = "ol";
          }
          state.html.push(`<li>${escapeHtml(ordered[1])}</li>`);
          return state;
        }

        if (trimmed.startsWith("> ")) {
          if (state.list) {
            state.html.push(`</${state.list}>`);
            state.list = null;
          }
          state.html.push(`<blockquote>${escapeHtml(trimmed.slice(2))}</blockquote>`);
          return state;
        }

        const image = trimmed.match(/^!\[(.*?)]\((.*?)\)$/);
        if (image) {
          if (state.list) {
            state.html.push(`</${state.list}>`);
            state.list = null;
          }
          state.html.push(
            `<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" /></figure>`,
          );
          return state;
        }

        if (state.list) {
          state.html.push(`</${state.list}>`);
          state.list = null;
        }

        state.html.push(`<p>${escapeHtml(trimmed)}</p>`);
        return state;
      },
      { html: [], list: null },
    )
    .html.join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
