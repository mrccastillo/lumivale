## Context

See proposal.md for motivation and reference URLs. Discovery found:

- `lib/case-studies.ts` stores fixed `challenge`, `solution`, `outcomes`, and `metrics` alongside identity and status. MongoDB overrides merge with three built-in stories. Seed slugs cannot change or be deleted. Public helpers currently fall back to built-in published stories on database errors.
- `app/admin/case-studies/case-study-form.tsx` uses plain textareas, pipe-delimited metrics, and redirect-based form submission. Existing create/edit routes already call `requireAdminAccess`.
- `app/case-studies/[slug]/page.tsx` renders only title, summary, challenge, solution, and outcomes. `components/case-study-cards.tsx` renders text-only cards.
- The index uses the published repository, but `app/page.tsx` calls synchronous `getAllCaseStudies()`, bypassing admin edits/status. Its Case Studies section was recently moved before Services and must remain there.
- `app/admin/blogs/blog-rich-text-editor.tsx` supplies useful Tiptap toolbar patterns but includes HTML mode and embedded images; those capabilities must not be copied into this editor wholesale.
- `lib/cloudinary.ts` already performs server-side uploads. Existing upload routes and validation patterns can be reused without changing other content types.
- No main OpenSpec capabilities currently exist. Existing uncommitted homepage, testimonials, and Site Content changes must be preserved.

## Goals / Non-Goals

**Goals:** A bounded editorial model that supports both references' narrative patterns, predictable public rendering, accessible admin controls, safe media handling, and non-destructive legacy reads.

**Non-Goals:** Free-positioned page design, arbitrary CSS/HTML, automatic copying from URLs, publishing fabricated results, or an independently versioned draft of an already published story. Scope exclusions otherwise follow the proposal.

## Decisions

### 1. Versioned structured story model

Extend the existing collection rather than introduce a second content source. Version-2 records retain slug, title, category, headline, summary, metrics, sortOrder, status, and timestamps, and add `schemaVersion: 2`, client/context fields, media, `sections`, and optional `cta`.

| Field group | Shape / behavior |
| --- | --- |
| Client | Optional client name, website URL, logo; title remains the existing admin/card identity and headline becomes the detail H1 |
| Context | Optional industry, timeframe, channels (string list), budget text; no automatic currency/math claims |
| Media | `{ url, alt, caption? }`; only HTTPS URLs from the configured Cloudinary account are accepted for new media references |
| Metrics | Array of `{ id, value, label }`, 1–8 when published, order preserved |
| Sections | Ordered discriminated union with stable IDs, maximum 30 |
| CTA | Absent or `{ heading, text?, buttonText, buttonUrl }`; all required members validated when enabled |

Section variants:

- `narrative`: heading and rich-text document.
- `imageText`: heading, rich text, image, and desktop image side (`left`/`right`).
- `image`: image, optional heading, optional evidence/source link.
- `gallery`: heading, ordered array of 1–8 images with captions and stable image IDs.
- `comparison`: heading, before/after labels and formatted content for each side.
- `quote`: quote text, person name, optional role/company and portrait.

All section IDs are unique within a story. Stable IDs, never array indices, associate upload completions, form errors, and reorder actions. Quote placement remains flexible through the section list. A dedicated global testimonial relationship would create unnecessary cross-editor coupling.

Draft completeness is separate from structural validity: allow empty editorial fields in drafts, but always reject malformed shapes, unsupported types, invalid populated URLs, or excessive sizes. Publish requires complete fields for every retained section, so admins must complete or remove unfinished sections. Limit headings to 200 characters, short context fields to 200, summary to 2,000, quotes to 4,000, each rich-text document to 50,000 serialized characters, nesting to 10 levels, and total story JSON to 1 MiB. Enforce the spec's smaller metric limits.

Alternative: one giant HTML body would simplify initial editing but make image layout, comparison blocks, validation, and predictable responsive rendering harder. Fixed challenge/solution inputs cannot represent either reference well.

### 2. Constrained rich text and shared rendering

Create a case-study rich-text control using installed Tiptap packages. Allow doc/paragraph/text, H3/H4 subheadings beneath section H2s, bold/italic/underline, ordered/unordered lists, list items, and links. Disable raw HTML, scripts, embeds, inline images, and unsupported nodes/attributes. Store validated JSON and render it through explicit React elements; do not render admin HTML with `dangerouslySetInnerHTML`.

Use a pure shared `components/case-study-story.tsx` for public detail and editor preview. Its data contains no database credentials or draft-fetching logic. Public pages load published data on the server; admin pages authenticate before loading draft content. Editor preview is local to the authorized form and toggles wide/narrow containers without saving or creating a public preview URL.

Text and CTA links allow safe root-relative paths or HTTP(S); reject protocol-relative paths, backslashes, controls, and executable schemes. New media references use only the configured Cloudinary host/account. Rendering remains defensive against unsupported legacy database values.

### 3. Editorial visual direction

Keep Lumivale's typography, emerald accent, dark introductory area, and restrained light reading surfaces. Use a prominent outcome headline, compact client/context row, a simple metric row, then spacious narrative and evidence sections. Image/text sections use balanced desktop columns; screenshots use contain sizing and their full aspect ratio, while cover thumbnails can crop in listings. Avoid copying the references' cloud backgrounds, exact layouts, brand styling, or campaign assets.

Logical DOM order is heading/text then image; desktop CSS changes the image side without changing screen-reader order. On mobile, splits and comparisons stack. Galleries show all images in a responsive grid rather than hiding evidence behind mandatory tabs. Each evidence image includes a descriptive full-size link, avoiding an unnecessary custom lightbox. One H1, sequential section H2s, visible keyboard focus, captions, and reduced-motion support are required. Reserve image dimensions/aspect ratio and lazy-load below-fold media. Preview must match public typography, widths, spacing, and image behavior.

### 4. Admin workflow and uploads

Retain `/admin/case-studies` dashboard/status controls and use full-page create/edit forms for long stories. Organize the editor into Story details, Results, Story sections, and Closing CTA. Use labeled repeatable rows, explicit section types, move-up/down buttons, and image pickers. Newly created stories can start with empty Challenge, Campaign, Results narrative sections that remain editable/removable.

Add authenticated `POST /api/admin/case-studies/upload-image` accepting one multipart image, validating file kind and 5 MiB limit before uploading to `lumivale/case-studies/images`. Return the secure URL and field-usable error response; reject non-file entries and invalid payloads. Uploads occur independently before saving a story so JSON submissions remain small. Ignore stale completions for removed/replaced sections and keep the old image until a replacement succeeds. Save is disabled while an upload is pending; a failed field can be retried or cleared.

Change the editor's create/save path to fetch-based JSON responses, retaining entered state and inline errors on failure. Existing dashboard form actions can keep their redirect contract; route handling distinguishes JSON editor requests from existing form actions. Authenticate before parsing/uploading and preserve publish/draft/delete authorization and seeded restrictions. Add origin checks to mutating endpoints consistent with deployment origin to prevent cross-site authenticated writes.

Successful save updates editor state, clears dirty status, and refreshes public paths. Display that saving published content updates the live story. Browser unload/internal navigation handling warns only for dirty content. No autosave or local storage of client campaign content.

Alternative: a single multipart form POST for every image would magnify payload sizes and currently loses form state on redirects. Upload-on-selection trades that for potential unused Cloudinary assets; cleanup is explicitly deferred and no shared asset is automatically destroyed.

### 5. Legacy compatibility and publication consistency

Normalize old records in `lib/case-studies.ts` into a read model: challenge and solution become narrative sections, outcomes become a Results section with a bullet list, and existing metrics receive deterministic IDs. Leave raw database records unchanged on read. First explicit save writes version 2 while retaining original legacy fields for recovery. Version-2 fields are authoritative after conversion, including intentionally removed sections; do not merge legacy sections back in.

Keep seed overrides/fixed slugs/deletion rules, default ordering, and uniqueness checks. Existing default content remains as-is until admins revise or unpublish it; this work does not add reference-company claims. New stories default to draft. Existing custom-slug editing remains supported; after an allowed slug edit, invalidate old and new detail paths and make the old path not found, matching current behavior rather than adding a redirect registry.

Replace the homepage's synchronous seed getter with `getPublishedCaseStudiesForSite()` and use it consistently with the index. Only merge defaults after a successful database read. On outages, return an empty list or unavailable detail rather than seed fallbacks; this prevents drafts from becoming visible again. Public draft detail access returns not found. Add a unique slug index after checking existing data for collisions; migration reports duplicates and stops without deleting data. The same idempotent preparation runs before the first write per database connection, and a standalone preflight script supports rollout checks.

Invalidate `/`, `/case-studies`, and affected detail paths after successful save/status/delete. Keep dynamic slug lookup for new records rather than relying exclusively on build-time `generateStaticParams`. Generate title/description metadata from the published story only.

## Risks / Trade-offs

- [Image-heavy stories can become slow] → Bound galleries/sections, reserve media space, use appropriately sized Cloudinary delivery for inline images, and retain an original-resolution evidence link.
- [Screenshots can contain unwanted personal information] → Provide concise upload guidance to crop/redact before upload; no automated redaction is promised.
- [Legacy migration can lose formatting/content] → Deterministic read adapters, fixture-based round-trip tests, no bulk writes, and retained original fields.
- [Abandoned uploads consume storage] → No automatic destructive cleanup; record the limitation and handle cleanup separately later.
- [Outage handling reduces fallback availability] → Prefer correct publication visibility; show a useful listing state and log server errors without exposing internals.
- [Full-suite checks already have unrelated TypeScript failures] → Capture the pre-implementation baseline; resolve introduced issues and report unrelated failures explicitly rather than masking them.

## Migration Plan

1. Back up representative existing records and establish tests for custom stories, seed overrides, unpublished seeds, and the current homepage order.
2. Introduce versioned types, limits, read adapter, validation, and collision-reporting/index setup. No content rewrite on read/deploy.
3. Add upload/save APIs, editor, and shared renderer together; switch listing/homepage data access and invalidation.
4. Verify legacy and new stories, upload failures, draft isolation, mobile evidence readability, and saved edits appearing on all public surfaces.
5. Admins revise stories and upload their own images through the editor. Real client copy and assets are a content-entry dependency, not a reason to fabricate sample results.

Rollback: preserve version-2 records and media. Disable the new editor first and retain a version-2-compatible read renderer while reverting other presentation changes. Do not roll an old writer onto version-2 records: it could discard their sections. A full rollback requires restoring the pre-change backup with explicit operational authorization, not an automatic down-migration.
