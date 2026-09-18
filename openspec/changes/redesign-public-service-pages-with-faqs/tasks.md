## 1. Service FAQ data and persistence

- [x] 1.1 Add stable FAQ identities and an ordered public FAQ list to service types, defaults, and repository reads. Verify legacy documents and default services normalize to an empty list without changing private content or highlights.
- [x] 1.2 Add FAQ normalization and validation plus the dedicated multipart JSON field. Verify tests cover trimming, multiline text, malformed lists, duplicate/invalid IDs, incomplete entries, and ordered save/reload.
- [x] 1.3 Integrate FAQ writes into service create/update operations. Verify omitted updates preserve FAQs, explicit empty arrays clear them, other services remain unchanged, invalid FAQs fail before uploads/writes, and unauthorized callers cannot save.

## 2. Admin service FAQ editor

- [x] 2.1 Add the Public Service FAQs section with question/answer fields, add/edit/remove, and move up/down controls using stable identities. Verify tests cover empty state, field validation, ordering boundaries, cancellation without persistence, and serialization through Save service.
- [x] 2.2 Preserve FAQ and example drafts independently within the existing form. Verify save/reload, removal of all FAQs, and a combined FAQ edit with pending photo/video files without changing example platform associations or file lookup keys.

## 3. Public service page

- [x] 3.1 Replace the public white hero and Highlights detail section with the reference's dark hero, published-service strip, active pill, Home link, and FAQS heading band. Update service-page tests for public description, public navigation destinations/order, current-page semantics, missing/unpublished routes, retained highlight data, and absence of pricing columns.
- [x] 3.2 Render ordered native FAQ disclosure rows and the specified empty state. Verify service-specific filtering, safe plain-text output, preserved line breaks, initially collapsed independent rows, and no homepage FAQ fallback.
- [x] 3.3 Verify the public response excludes distinct private price/copy/example/media sentinel values and passes only public data to any client components. Run trusted pricing, homepage FAQ, navbar, and authorization regression tests to confirm their existing behavior.

## 4. Integrated verification

- [x] 4.1 Use an isolated service to add/edit/reorder/remove FAQs, save and reload, then browse its public page without a trusted cookie and with one. Verify identical public content, unchanged private-page access, correct empty state after clearing, and cleanup of the fixture.
- [x] 4.2 Compare the hero and FAQ section against the supplied reference at 320px, tablet, and desktop widths. Verify long text wraps without page overflow, service navigation remains reachable, navbar surface transitions work, and native FAQ controls support Tab/Enter/Space with visible focus.
- [x] 4.3 Run focused service/repository/admin/FAQ tests, then `npm test`, `npm run lint`, and `npm run build`. Record results, review the diff, and preserve unrelated working-tree changes.
