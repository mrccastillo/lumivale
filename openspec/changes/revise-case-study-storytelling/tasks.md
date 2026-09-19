## 1. Versioned data and compatibility

- [x] 1.1 Capture current test/typecheck failures and legacy fixtures (custom story, seed override, unpublished seed); verify fixtures cover current URLs, status, and homepage section order without changing unrelated work.
- [x] 1.2 Add version-2 story/section/media types, stable IDs, rich-text validation, bounded payloads, URL rules, and draft/publish validation; verify unit tests cover every section type, incomplete drafts, publish errors, unsafe URLs, unknown nodes, and size limits.
- [x] 1.3 Implement legacy-to-story adaptation and version-2 persistence in `lib/case-studies.ts`; verify create/edit/reopen round trips preserve old content, metrics, status, fixed seed slugs, and explicitly removed sections.
- [x] 1.4 Add unique-slug index setup with a non-destructive collision report and preserve slug-change/default-delete rules; verify duplicate creates/renames fail without overwriting data and seed deletion remains rejected.

## 2. Media and mutation APIs

- [x] 2.1 Add authenticated image upload to `lumivale/case-studies/images` using the existing Cloudinary helper; verify route tests for valid JPG/PNG/WEBP, over-limit files, wrong file types/non-files, unauthorized requests, unsafe origins, and provider failure.
- [x] 2.2 Add fetch-based JSON create/save responses and field errors while retaining dashboard form publish/draft/delete actions; verify route tests cover authorization, incomplete draft saves, publication requirements, persistence failure, and unchanged saved state on rejected writes.
- [x] 2.3 Add public path invalidation after successful saves/status changes/deletes, including old/new slug paths; verify tests assert affected paths and that failures never signal successful publication.

## 3. Shared public story presentation

- [x] 3.1 Build the constrained rich-text React renderer and shared story renderer for identity, context, metrics, all six section types, and optional CTA; verify rendering tests exercise allowed formatting and prevent unsafe markup/links.
- [x] 3.2 Implement Lumivale-styled responsive evidence layouts, captions, full-size image links, and optional cover/logo/portrait handling; verify desktop/mobile layouts, unbroken screenshot aspect ratios, keyboard controls, missing optional fields, and reduced-motion behavior.
- [x] 3.3 Replace the detail template in `app/case-studies/[slug]/page.tsx`, add published-only metadata, and retain dynamic new-slug resolution; verify legacy/new published pages render and drafts/unknown slugs return not found.

## 4. Admin authoring and preview

- [x] 4.1 Build full-page create/edit forms with context fields, repeatable metric rows, optional CTA, draft defaults, and constrained Tiptap narrative editing; verify editor tests submit structured content and reopen saved values without pipe-delimited entry.
- [x] 4.2 Add section add/remove and accessible move-up/down controls using stable IDs; verify tests for every section type, preserved formatting, gallery order, item limits, and attachment identity after reorder.
- [x] 4.3 Add image pickers with preview, alt/caption fields, replacement/removal, and pending/error state; verify upload failure retains prior images/edits, stale upload completions cannot attach to the wrong section, and pending uploads block save.
- [x] 4.4 Add local wide/narrow preview using the shared renderer, dirty-state navigation warnings, and save/publish feedback; verify preview makes no persistence/publication request, failed saves retain edits, and published saves clearly update live content.
- [x] 4.5 Integrate the revised editor with the dashboard and existing create/edit entry points; verify existing status/delete actions and seed restrictions still work, and unauthorized users cannot load draft editor/preview data.

## 5. Public discovery and publication consistency

- [x] 5.1 Update shared cards with optional imagery and saved metrics; verify both homepage and index cards display saved values and link to the correct detail slug, with a usable text-only fallback.
- [x] 5.2 Switch `app/page.tsx` to the published repository and retain Case Studies before Services; verify homepage/index tests include newly published stories, hide drafts, and reflect edits/unpublishing/deletion.
- [x] 5.3 Remove public seed fallback on repository failure and implement no-published-story states; verify outage tests cannot resurrect unpublished seeds and the homepage omits an empty case-study block.

## 6. Integrated verification and release notes

- [x] 6.1 Exercise one full story with narrative, both image/text placements, gallery, comparison, quote, metrics, and CTA through create, upload, preview, publish, edit, unpublish, and reopen; record desktop/mobile and keyboard verification results.
- [x] 6.2 Run focused case-study repository, route, editor, public-rendering, and homepage tests, then `npm test`, `npm run lint`, and `npm run build`; record results and distinguish any pre-existing unrelated failures from introduced regressions.
- [x] 6.3 Document additive rollout, slug-index collision handling, legacy adaptation, publication/outage behavior, unused-upload limitation, and rollback constraints; verify no existing content or shared media is deleted and no reference-company content is published as Lumivale work.
