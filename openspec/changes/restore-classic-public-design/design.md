## Context

See proposal.md for motivation and confirmed scope. The reference is the complete tree at `e9cad74a7b0b46a588752beb9362d4b8a038587f`, not only that commit's patch. Current `app/page.tsx` uses a scoped concept stylesheet for Results through the footer. `SiteFooter` delegates to `HomepageFooter`; `AppShellClient` suppresses the shared footer on `/`, where the page renders its own. Navbar behavior now includes editable branding, anchor tracking, hero navigation integration, and Escape handling absent from the historical version.

`app/services/[slug]/page.tsx` now renders service navigation and service-specific FAQs. At the reference commit it rendered a white title/description hero and Highlights. Its current stylesheet, `components/service-detail.module.css`, is also used by trusted pricing pages and example-platform controls. Global Poppins and historical color tokens still exist in `app/globals.css`; other routes independently use Manrope/DM Sans.

The two supplied screenshots are preserved under `references/results-layout.png` and `references/case-studies-layout.png`. They establish layout, not literal fixture content or final colors.

## Goals / Non-Goals

**Goals:** selectively restore historical presentation, preserve current data bindings and useful interactions, scope public-service changes away from trusted pricing, and make the two retained compositions independently verifiable.

**Non-Goals:** replacing whole historical files, restoring historical hard-coded data, removing current service FAQs, modifying repositories or admin editors, or removing font imports still used by other routes.

**Behavior baseline:** preserve all current workings without exception. The historical tree is a visual reference only. Keep current event handlers, state transitions, animation triggers, navigation destinations, link inventory, data flow, APIs, and authorization. If a historical presentation depends on different functionality, adapt its appearance to the existing functionality.

## Decisions

### 1. Port presentation selectively

Use `git show e9cad74:<path>` to transfer relevant layout and style decisions into current components. Preserve server/client boundaries and current `lib/site-content.ts`, `lib/services.ts`, `lib/faqs.ts`, `lib/testimonials.ts`, and `lib/case-studies.ts` calls. A Git revert or checkout of the historical files would discard CMS fields, media handling, and later functionality, so it is unsuitable.

Restore these concrete historical treatments:

| Surface | Target | Current integration |
| --- | --- | --- |
| Navbar | Poppins, circular default mark, emerald pill CTA, white/light and transparent/glass dark states | `site-navbar-client.tsx` and its CSS module; preserve current props, logo, links, active anchors, Escape focus return, and `homepage:navigate` event |
| Services on home | Centered introduction; white section; `#fbfcff` bordered cards; emerald icon tiles; desktop three-column grid | `app/page.tsx`; preserve all returned services and links |
| Testimonials | Near-black/green gradient, spotlight, translucent rounded cards, historical carousel controls | Remove light concept overrides; retain carousel, uploaded author images, video controls, and current placeholder conditions |
| Homepage FAQs | White surface; split heading/rows; Poppins semibold questions and emerald open indicators | Preserve FAQ loading/count/order, first-open state, and current exclusive disclosure grouping |
| Public service detail | Historical white introduction, max-width-5xl content, muted description, emerald return link, cool neutral supporting area | Add a dedicated public service CSS module; retain current navigation and FAQs in place of historical Highlights |
| Closing CTA/footer | Centered dark-gradient CTA and emerald pill; three-column deep-green footer and divided utility row | Restyle current shared footer composition with all CMS bindings |

Use the historical navbar's proportions but retain a breakpoint large enough for the expanded current link inventory, including trusted Pricing. Do not force the historical 768px desktop breakpoint if it causes overlap.

### 2. Keep Results and Case Studies structures, change their theme

Retain `HomepageCaseStudies`, `CaseStudyCarousel`, `ResultCount`, `public/results-landscape.jpg`, and the current safe cover transformation. Refactor or narrow `homepage-concept.module.css` so restored sections cannot inherit the concept fonts or testimonial overrides. Keeping a narrowly scoped module is preferable to global token replacement, which would restyle unrelated routes.

| Retained area | Preserve | Retheme |
| --- | --- | --- |
| Results | Centered eyebrow/heading; wide rounded landscape; four frosted cards; desktop row/mobile 2x2; count and landscape behavior | Outer background `#f7f8fb`, Poppins ink heading, emerald-family eyebrow with sufficient contrast, deep-green glass overlay and white metric text |
| Case Studies | Introduction, image-left/copy-right feature, full content, flexible metrics, full-story link, arrows and index; mobile stack | White section, `#fbfcff` copy panel, `#e6e9f2` borders, Poppins, ink `#031410`, muted `#68708a`, emerald interactive accents |

Maintain existing image crops, broad proportions, rounded landscape/glass shapes, and carousel geometry. Allow headings to wrap naturally with Poppins. Avoid exact pixel assertions against the original typography; compare composition separately from theme. Do not copy the screenshots' Northstar sample or numerical results into production data.

### 3. Preserve footer ownership and all content

Keep the current homepage-owned footer and shell-owned inner-page footer arrangement unless implementation identifies a concrete need to simplify it. Both should use the same historical presentation. `HomepageFooter` can retain its current API while composing the centered CTA and semantic footer as separate visual regions. This preserves the existing inner-page CTA rather than silently deleting it to match the older tree.

Map every `SiteContent` footer field into the restored columns/utility row; keep copyright and the exact current link inventory and destinations. Do not add the historical Admin login link, which is absent from the current footer. Extra content can expand the utility row. Tests must verify one semantic footer and one closing CTA per route where currently rendered. Admin routes continue to omit public chrome.

### 4. Isolate service presentation from pricing

Create `components/public-service-detail.module.css` or an equivalently isolated route-local module and update only the public service route to use it. Do not replace shared `service-detail.module.css` colors or selectors in place: pricing and platform controls depend on them. The historical white hero supersedes the older OpenSpec dark-hero plan. Service-specific FAQs remain in the supporting area and take the historical homepage disclosure styling, with all initially collapsed and the current single-open grouping preserved. Preserve current empty-state copy/link, safe multiline text, service ordering, active semantics, public projection, and not-found handling.

Alternative rejected: copying the historical service route wholesale, which would remove service FAQs/navigation and reintroduce Highlights contrary to the confirmed scope's preservation of current functionality.

### 5. Reconcile planning history explicitly

There are no main specs yet. Add `classic-public-design` as a new capability. Treat this change as the successor to `apply-brand-concept-below-hero` visual rules and the public-service hero styling in `redesign-public-service-pages-with-faqs`. Keep current data, publication, and authoring behavior. Historical plans differ from the implementation on FAQ grouping and the footer Admin login link; the user's explicit instruction to preserve current workings takes precedence. Keep current exclusive FAQ groups and the existing footer link inventory. Do not fix or reconcile other behavioral discrepancies in this change. Do not edit or archive those completed changes as part of this planning request. When later synchronizing history, resolve overlapping requirements to this newer design-only contract.

### 6. Verification and accessibility

Use existing behavior coverage in `tests/home-page.test.tsx`, `tests/homepage-concept.test.tsx`, `tests/site-navbar.test.tsx`, `tests/site-footer.test.tsx`, and `tests/service-faq-pages.test.tsx` as regression guards. Keep current content, media, carousel, result-count, site-content, pricing-access, and admin-shell tests. Only replace assertions tied to deliberately changed visual styling; do not weaken behavior, content, grouping, or authorization assertions. Verify the same interaction sequences before and after restyling, including single-open FAQs and unchanged footer links.

Compare the historical sections with the reference tree at equal viewport sizes, and compare retained structures with the saved screenshots. Record visual evidence at 360, 390, 768, and 1440px, including navbar dark/light/scrolled states, long content, and service details. Check keyboard use, visible focus, FAQ toggles, carousel arrows, touch scrolling, and reduced motion. Use darker emerald text where needed for AA contrast; bright emerald on white is primarily an accent or button background, not a mandatory small-text color. Run focused tests followed by `npm test`, `npm run lint`, and `npm run build`.

## Risks / Trade-offs

- Historical code predates editable content and security improvements -> port only presentation and retain current repositories and props.
- Shared service styles could restyle trusted pricing -> isolate the public service stylesheet and verify pricing body appearance.
- Long current navigation labels exceed old desktop spacing -> retain a suitable mobile breakpoint and test trusted/public inventories.
- Concept styles can override restored testimonial cards or fonts -> narrow selectors and inspect computed styles in the browser.
- Poppins changes text wrapping in retained sections -> allow intrinsic height and metric wrapping; preserve every word.
- Multiple OpenSpec changes describe contradictory visual states -> document successor precedence and reconcile at later archive time.

## Migration Plan

No persistence migration or data backfill is needed. Implement as a presentation-only application change, validate in a local preview, and retain before/after screenshots with matching content. Deploy through the existing application process only when requested. Rollback consists of reverting the implementation commit; stored content, CMS editing, and media remain compatible in either direction.

## Follow-up: pricing listing, Blogs, and About Us

The user extends the scope to three additional route bodies. Restore `/pricing` with the historical compact introduction and rounded white bordered rate table, muted copy, right-aligned desktop rates, and bordered View more controls below service summaries. Preserve its current trusted-access check and published-service data. Keep pricing detail styles isolated.

Retain all `/blogs` composition, featured media, carousel, copy and fallback behavior; apply a route-specific classic theme in the shared listing module so case-study listing styles stay unchanged. Retheme only colors and fonts in the About stylesheet, preserving founder grid, portraits, grayscale hover, CMS fields, and approach link. The visual direction is cool neutral and white surfaces, Poppins, ink text and emerald accents. No new motion or content is introduced; existing image hover, carousel transitions, and founder hover remain.

## Latest revision: reference-inspired case-study grid

The user now explicitly replaces the retained homepage split carousel with a client-card collection inspired by their new reference, keeping the current classic palette. This supersedes the earlier carousel-preservation requirement for this homepage section only. The centered introduction sits over a softly bordered cool-neutral collection with white cards, saved client identities/logos (safe cover or initials fallback), categories, complete headlines/summaries, all metrics and existing full-story destinations. Up to four stories use two desktop columns; larger collections use three, then two on tablet and one on mobile. Every published story is visible without pagination. A collection link leads to the existing case-studies listing. Existing entrance motion, restrained card lift and arrow hover respect reduced motion. No CMS schema, data, access, detail-page or other carousel behavior changes.

### Refined compact reference

The clearer reference at https://dianaguingab.vercel.app/ supersedes the expanded story-card treatment: use a 1040px browser-style frame with three neutral window dots and a muted collection label, three desktop columns, compact 36px identities, small category pills and ruled metric rows. Cards are full-area links. Headlines and summaries remain on the existing detail pages rather than inside these compact cards. Every saved metric is retained, including additional rows. Do not invent client records to fill the reference layout. Tablet uses two columns and mobile one.

## Latest typography standard

The user requests uniform typography across public pages and the admin workspace. The Results screenshot establishes Poppins semibold (600) and tight heading tracking as the heading standard; Inter is the body/UI font. Central `--font-heading` and `--font-body` tokens replace route-specific Poppins body, Manrope and DM Sans declarations. Preserve the large Results metric display in Poppins and technical code/source blocks in monospace. Existing responsive type sizes and functionality remain intact. This supersedes earlier Poppins-for-all-text requirements.

### Uniform type sizes

The user additionally requires consistent font sizes, using the Results heading as the reference. Shared tokens now define main page/section headings as `clamp(32px, 4vw, 57px)` with 1.13 leading; supporting headings use 26-36px, card titles 20-22px, body 16-18px, small text 16px and captions 12px. All six main homepage headings share the same scale, including Services, Testimonials, Case Studies, FAQ and closing CTA. Route-specific heading size overrides and conflicting mobile sizes use these tokens. Numeric metrics, icons and technical editor content retain role-specific sizing.
