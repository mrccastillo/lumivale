import type { BlogPost } from "@/lib/blogs";

export function BlogForm({
  post,
  submitLabel = post ? "Save Blog Post" : "Create Blog Post",
}: {
  post?: BlogPost;
  submitLabel?: string;
}) {
  const action = post ? `/api/admin/blogs/${post.id}` : "/api/admin/blogs";

  return (
    <form
      action={action}
      method="post"
      encType="multipart/form-data"
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start"
    >
      <input type="hidden" name="action" value="save" />
      <div className="grid gap-5 rounded-lg border border-[#cfe0e8] bg-[#fbfdfe] p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" name="title" required defaultValue={post?.title} />
          <Field label="Slug" name="slug" required defaultValue={post?.slug} />
        </div>
        <div className="rounded-lg border border-[#cfe0e8] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#526d7a]">
            Public URL
          </p>
          <p className="mt-2 break-all text-sm text-[var(--lumivale-ink)]">
            https://lumivale.com/blog/{post?.slug || "your-link"}
          </p>
        </div>
        <Field label="Excerpt" name="excerpt" required defaultValue={post?.excerpt} />
        <TextArea label="Body" name="body" required defaultValue={post?.body} rows={14} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" name="category" required defaultValue={post?.category} />
          <Field label="Read time" name="readTime" required defaultValue={post?.readTime} />
        </div>
        <Field label="Tags" name="tags" defaultValue={post?.tags.join(", ")} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="SEO title" name="seoTitle" defaultValue={post?.seoTitle} />
          <Field
            label="SEO description"
            name="seoDescription"
            defaultValue={post?.seoDescription}
          />
        </div>
      </div>

      <aside className="grid gap-5">
        <section className="rounded-lg border border-[#cfe0e8] bg-white p-5 shadow-[0_18px_48px_rgba(49,88,106,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#526d7a]">
            Publish controls
          </p>
          <h3 className="mt-3 text-lg font-semibold text-[var(--lumivale-ink)]">
            Save And Manage
          </h3>
          <label className="mt-5 grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#526d7a]">
            Status
            <select
              name="status"
              defaultValue={post?.status ?? "draft"}
              className="rounded-lg border border-[#cfe0e8] px-4 py-3 text-sm font-normal normal-case tracking-normal text-[var(--lumivale-ink)] outline-none transition focus:border-[#31586a]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-[#31586a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#264757]"
          >
            {submitLabel}
          </button>
          <a
            href="/admin/blogs?mode=create"
            className="mt-3 inline-flex w-full justify-center rounded-lg border border-[#cfe0e8] px-5 py-3 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[#31586a]"
          >
            New Draft
          </a>
          <button
            type="reset"
            className="mt-3 w-full rounded-lg border border-[#cfe0e8] px-5 py-3 text-sm font-semibold text-[var(--lumivale-ink)] transition hover:border-[#31586a]"
          >
            Clear Form
          </button>
        </section>

        <section className="rounded-lg border border-[#cfe0e8] bg-white p-5 shadow-[0_18px_48px_rgba(49,88,106,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#526d7a]">
            Media
          </p>
          <h3 className="mt-3 text-lg font-semibold text-[var(--lumivale-ink)]">
            Cover Image
          </h3>
          <input type="hidden" name="coverImageId" value={post?.coverImageId ?? ""} />
          <label className="mt-4 grid min-h-32 cursor-pointer place-items-center rounded-lg border border-dashed border-[#cfe0e8] bg-[#fbfdfe] p-5 text-center text-sm font-semibold text-[var(--lumivale-ink)]">
            Upload cover image
            <span className="mt-1 block text-xs font-normal text-[#526d7a]">
              JPG, PNG, WebP, or GIF
            </span>
            <input
              aria-label="Upload cover image"
              name="coverImage"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
            />
          </label>
          <div className="mt-5">
            <Field label="Cover alt" name="coverAlt" defaultValue={post?.coverAlt} />
          </div>
        </section>
      </aside>
    </form>
  );
}

function Field({
  defaultValue,
  label,
  name,
  required,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--lumivale-ink)]">
      {label}
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
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
