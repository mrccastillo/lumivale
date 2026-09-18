## Context

`app/services/[slug]/page.tsx` currently renders a white hero using `service.description`, followed by highlight cards. `app/pricing/[slug]/page.tsx` provides the requested visual reference, with dark/light navbar surface markers, a published-service strip, private copy, rates, and platform examples. It enforces trusted access. `tests/services.test.tsx` explicitly asserts the current white hero and must be updated.

`lib/services.ts` centralizes service types, defaults, normalization, FormData parsing, and MongoDB operations. Service create/update routes authenticate admins and use that parser before uploads and persistence. The admin form already manages platform/example drafts and constructs multipart submissions. `lib/faqs.ts` and `/admin/faqs` manage the homepage FAQ collection; `app/page.tsx` uses native details/summary rows. There are no main specs yet. See proposal.md for scope and motivation.

## Goals / Non-Goals

**Goals:** Add public FAQ content to the existing service save transaction; reuse the reference's visual language without coupling public rendering to private data; preserve older documents and submissions.

**Non-Goals:** A new FAQ collection, global FAQ reassignment, per-question publication workflows, rich-text editing, changing trusted pricing templates, or deleting service highlights.

## Decisions

1. **Embed ordered FAQs on the service.** Add `ServiceFaq = { id: string; question: string; answer: string }` and a public top-level `faqs` list. Persist order through array position. Use stable generated IDs in the editor so reordering/removal does not swap input state. Missing stored lists normalize to `[]`; defaults explicitly expose an empty list. A separate collection or linking homepage FAQs would introduce unnecessary ownership and deletion complexity. Service status controls FAQ visibility; there is no per-row status in this scope.

2. **Keep omission distinct from an explicit empty list.** Add a dedicated JSON `serviceFaqs` field to the current multipart form, separate from `exampleManifest`. Validate shape, IDs, and trimmed question/answer strings in the parser and repository write path. Missing fields on updates retain the current list, while `[]` clears it; creates default to empty. Avoid filling an omitted update with `[]` during parsing or normalization. Validate FAQs before uploading example files, and preserve the existing platform manifest and upload-key behavior. Plain text supports multiline answers without new sanitization dependencies or editor infrastructure.

3. **Edit FAQs within the service form.** Add a clearly labeled Public Service FAQs section outside Private Pricing. Use repeatable question/answer fields with add, remove, and move up/down controls, boundary buttons disabled, and an explanation that FAQs appear on the public service page after Save service. Keep FAQ state separate from example modal drafts; FAQ edits must not discard selected example files. Use field-associated validation and retain entered values when client validation fails. The existing `/admin/faqs` remains dedicated to homepage content.

4. **Adapt the public route's composition.** Fetch the current published service and published navigation list server-side. Reuse the pricing hero's gradient, max-width, spacing, pill treatment, and `data-nav-surface="dark"`, then a light FAQS heading band and white content region. Use `service.description`, not private hero copy. Remove the rate panel and its grid column, using a readable text width rather than a blank placeholder. Replace the detail Highlights region but retain its data and editor fields. Home links back to the homepage services section. Match the reference using scoped styling rather than importing the private page or introducing a broad shared-template refactor.

5. **Render native FAQ disclosure rows.** Follow the homepage details/summary pattern with stable row keys, visible focus, a state indicator, and `whitespace-pre-line` answers. Start collapsed and allow independent expansion. Use a semantic heading for FAQS and the specified empty message. Native disclosure provides keyboard behavior without shipping service objects to a client component. If a component is extracted, pass only the FAQ list; public navigation receives only public title/slug data. No private-content object is passed to client components or embedded in public markup.

## Risks / Trade-offs

- Accidental private-data exposure through visual reuse → keep the public route server-rendered and test distinct private sentinel values against HTML and serialized client props; never render the private page with CSS-hidden prices.
- Older service forms could erase new FAQs → test omitted-field preservation separately from explicit empty-list removal.
- Public and private hero styles could drift → verify the reference visually at desktop and responsive widths; do not expand this change into a private-page refactor.
- Existing services initially have no FAQ copy → show the explicit empty state and let admins author each service's content; do not invent business answers.
- Shared admin submission could regress media handling → test a combined FAQ edit and pending example upload, and retain platform/upload regression suites.

## Migration Plan

Deploy the additive data handling, editor, and public rendering together. No bulk database migration is required; missing lists read as empty and are stored on subsequent saves. Verify a legacy service, a service with FAQs, and an unpublished service. Rollback can restore the old public layout while retaining FAQ data, but older admin builds that replace whole documents must not write over the new field. Use isolated fixtures for browser verification and remove them afterward.
