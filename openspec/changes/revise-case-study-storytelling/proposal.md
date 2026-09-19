## Why

Lumivale's case studies currently use a short, fixed text template that cannot show campaign evidence or tell a detailed client story. Admins need to build and maintain image-rich stories with results, campaign context, and supporting screenshots, while visitors see the same published content on the homepage, listing, and detail page.

## What Changes

- Replace the fixed detail template with an editorial story: client identity, headline, summary, campaign context, key results, ordered narrative/evidence sections, an optional client quote, and a closing call to action.
- Add an admin section editor supporting formatted narrative, image/text splits, full-width evidence images, galleries, before/after comparisons, and quotes. Admins can add, edit, reorder, and remove sections without writing code.
- Support cover images, client logos, evidence screenshots, and quote portraits through authenticated Cloudinary uploads, including previews, replacement, removal, alt text, and captions.
- Replace pipe-delimited metrics entry with repeatable value/label fields. Support draft saves, publish validation, and an authenticated preview using the public renderer.
- Refresh case-study cards with optional imagery and published results. Connect homepage case studies to the published repository while preserving their position before Services.
- Preserve existing records, seeded-story override rules, and current URLs through a backward-compatible legacy adapter; never invent campaign results or import reference-site content as Lumivale work.

### Non-goals

- Reproducing the reference sites' visual design, text, client claims, or screenshots.
- Writing new factual client stories without supplied source material.
- A general website builder, arbitrary HTML/embed scripts, video hosting, analytics integration, a media library, collaboration/version history, or autosave.
- Changing site-wide navigation, testimonials, services, email, or admin roles.

## Capabilities

### New Capabilities

- `case-study-stories`: Rich public case studies, consistent discovery, and legacy compatibility.
- `case-study-authoring`: Structured admin authoring, image management, preview, validation, and publication.

### Modified Capabilities

None. The current OpenSpec main-spec inventory is empty; these capabilities document and extend the existing implementation.

## Impact

- Public surfaces: `/`, `/case-studies`, and `/case-studies/[slug]`; shared cards and a new shared story renderer.
- Admin: `/admin/case-studies`, create/edit flows, an authenticated preview, and `/api/admin/case-studies` routes plus an image-upload route.
- Persistence: additive versioned story fields in MongoDB `caseStudies`; legacy reads remain supported without a destructive migration.
- Media: existing Cloudinary integration; no credentials in clients and no automatic deletion of previously published assets.
- Rich text: reuse installed Tiptap primitives where appropriate, with a constrained document schema and safe rendering.
- Authentication: retain `requireAdminAccess` for every mutation, upload, and draft preview. No email changes.
- Tests: repositories, admin routes/editor, media validation, public rendering, homepage publication behavior, and production build.

### References

- https://naano.com/case-studies/blogseo — reference for an outcome-led introduction, campaign context, measurable results, and a structured narrative.
- https://www.getredditor.com/case-studies/coffeespace/ and the supplied screenshot — reference for pairing explanatory sections with readable evidence images and before/after context.

References were reviewed on 2026-09-19. They inform structure only; their figures and assets are not authorized Lumivale content.
