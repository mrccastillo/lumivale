## Context

See proposal.md for the motivation. `app/page.tsx` currently places `#hero` and `#proof` inside one dark gradient wrapper. Results uses Site Content fields, followed by CaseStudyCards, service cards, testimonial fallback grids/carousel, FAQ disclosures, and a separate conversion section. `app/layout.tsx` supplies SiteFooter to AppShellClient for all non-admin routes, so simply adding the concept footer would duplicate it.

`app/globals.css` defines global Poppins typography and existing emerald tokens used across public and admin pages. The HTML concept instead defines Manrope/DM Sans, chalk/forest/sage/daylight surfaces, and a large closing wordmark. Shared case-study cards also render on listing pages. The active `revise-case-study-storytelling` work already supplies published story media and safe image handling; preserve it.

## Goals / Non-Goals

**Goals:** reproduce the concept below the hero using production data; isolate new styles; preserve existing authoring and publication flows; make footer fidelity directly reviewable at matching viewport sizes.

**Non-Goals:** a global rebrand, a new CMS model, a new illustration pipeline, a copy rewrite, replacement of real content with HTML mock data, or adding concept-only homepage sections.

## Decisions

### 0. Treat content preservation as the primary constraint

Inventory each section's existing text, media, item count, link labels/destinations and controls before editing. Preserve that inventory under the same data fixtures and existing pagination/disclosure rules. Change wrappers, classes, layout and typography only; do not rewrite copy, drop fields, truncate text, impose new item limits or hide content. The existing concept provides visual styling, not replacement copy. Expand layouts when real content is longer or more numerous. Preserve all CMS bindings and fallback behavior.

### 1. Scope styles to a new below-hero region

Use a dedicated CSS module or explicit homepage-concept scope with independent tokens. Load Manrope/DM Sans without replacing the global body font or existing root tokens. Move `#proof` out of the hero's visual wrapper while preserving the wrapper's hero background, dimensions, glow, and marquee. Retain all anchor IDs and ensure navigation surface detection recognizes the new light sections and forest footer.

Alternative rejected: replacing global color/font tokens, which would change the explicitly protected hero and unrelated pages.

### 2. Translate the concept into the existing section inventory

| Section | Treatment | Data and behavior |
| --- | --- | --- |
| Results | Chalk surface; offset eyebrow/heading; four open metric columns and thin separators; 2x2 on mobile | Existing `results*` Site Content fields, including placeholder labels/values |
| Case Studies | Concept's image-led horizontal feature rows; forest media fallback for absent covers; sage text area, understated category and arrow link | All currently returned published stories, actual covers/headlines/metrics, safe URLs and detail routes; no mock campaign |
| Services | Sage surface; numbered editorial rows with descriptions and arrow links; generous desktop columns and mobile stack | All returned services rather than hard-coded three demo channels; keep every detail link visible; no invented conversation panel |
| Testimonials | Chalk/soft-sage quote surfaces with fine dividers, author image/name/title, forest text and restrained controls | Preserve carousel page size/padding, placeholder marking, uploaded images, and existing video fallback behavior |
| FAQs | Concept's split heading and ruled disclosures; chalk background | Existing FAQ ordering, first-open behavior, fallback and maximum count |
| Closing CTA + footer | Concept closing composition expanded to retain all existing content | Every existing footer field and navigation link; current year; Admin login in prototype utility slot |

Sections that have no literal equivalent in the HTML adopt its tokens, alignment, and hierarchy. Do not force the existing service inventory into three invented categories. Existing `Reveal`/motion utilities can animate section entry and control hover; no hero motion changes.

### 3. Use the HTML footer as the visual reference while preserving all content

Reference `lumivale-brand-concept.html` selectors `.closing`, `.closing-top`, `.closing-bottom`, `.footer-links`, `.footer-word`, and `.btn.light`, including responsive rules. Baseline:

- Forest `#122b22`, chalk `#f4f5ed`, daylight `#c0f275`; body muted copy follows the concept.
- Desktop inner width `min(1280px, 100% - 112px)`; 64px total gutters below 1000px and 40px below 700px.
- Closing top padding 85px; CTA row bottom padding 65px; heading `clamp(40px,5vw,70px)`, line-height 1.08; button 48px minimum height, 5px radius.
- Divider white at 12.5% opacity; lower row 28px vertical padding; 11px interface labels.
- Wordmark Manrope 500 at 19.7vw, line-height .9, tracking -.09em, matching left and negative bottom crop; contain horizontal overflow.
- At <=700px: 55px top padding, 43px heading, 28px button top margin, stacked lower row, and the concept's wordmark treatment.

"One-to-one" means matching the concept design rather than retaining the old footer shown in the user's screenshot. The screenshot identifies the end of the redesign scope. Production values still come from the CMS. Use the last word of the editable heading as daylight emphasis without hard-coding 'grow'; content naturally wraps. Render the large `footerBrandName` lowercase visually; preserve accessible brand text. For exceptionally long custom brand names, shrink the wordmark to fit the same canvas rather than creating page overflow.

The production utility substitution is Admin login in place of 'Brand & components'. Preserve its existing destination and accessible label, using the concept's utility-link style. Do not ship the prototype dialog. Preserve visible Home/About/Blogs navigation, the brand name and tagline, contact heading, email and LinkedIn, site label and bottom text on the homepage. Arrange this inventory in compact concept-styled rows between the CTA and oversized wordmark, allowing extra height and responsive wrapping. No existing saved values or hard-coded section copy are overwritten with concept copy. The user's explicit content-preservation requirement supersedes exact prototype geometry wherever they conflict.

### 4. Render the homepage footer once

Introduce a homepage closing component, rendered by `app/page.tsx` with already-fetched Site Content. Replace its current conversion section. AppShellClient omits the supplied legacy footer only for exact pathname `/`, preserving all other route behavior and admin exclusion. Keep the legacy SiteFooter implementation and shared component defaults unchanged. Use optional homepage variants or separate presentation components instead of silently restyling shared CaseStudyCards everywhere.

Alternative rejected: a global SiteFooter redesign, because the requested region is the homepage and global changes would extend scope.

### 5. Preserve data and accessibility boundaries

Keep database reads on the server, existing publication filters and fallback handling, URL validation, media alt text, and external-link protections. No new API, migration, upload behavior, or permissions. Client components handle only existing interactions. Retain semantic sections/headings, actual links, native disclosures, visible focus and reduced-motion behavior. The decorative wordmark is hidden from assistive technology when equivalent brand text is available.

### 6. Verify functionality and appearance separately

Extend focused coverage in `tests/home-page.test.tsx`, `tests/site-footer.test.tsx`, `tests/site-content.test.tsx`, `tests/testimonial-images.test.tsx`, and relevant video/carousel tests. Add shell route coverage for one homepage footer and unchanged non-home footer. Assert content, navigation and interactions rather than CSS snapshots. Browser verification provides the visual proof: capture baseline hero before edits and compare after at matching viewports, then compare concept footer versus implementation using identical text fixtures, accounting only for extra rows needed to retain existing content. Verify section-by-section content parity and every footer field/link explicitly.

## Risks / Trade-offs

- Shared hero/results wrapper removal may alter glow clipping or section height -> capture hero and transition baselines before markup changes; preserve its isolated background and glow treatment.
- Font/token leakage could silently redesign admin or details -> explicit scope and screenshots of representative unchanged routes.
- Live CMS text cannot always wrap exactly like short prototype text -> exact geometry checks use matching fixtures, plus long-content robustness checks with actual values.
- Exact prototype geometry has less content than the current footer -> retain all current content in concept-styled rows, let the footer grow, and document only the resulting spacing/reflow differences.
- Prototype animations can conceal content before initialization -> use existing progressive/reduced-motion patterns and verify content remains visible when motion is disabled.
- Unrelated uncommitted work exists -> keep changes limited to the named homepage areas; do not reset or overwrite other changes.

## Migration Plan

No persistence migration. Implement scoped presentation and route selection, run focused regressions, compare screenshots at 360/390/768/1440px widths, then run lint, the full suite, and production build. Record hero preservation, footer comparison, interactions and non-home smoke checks in verification.md. Rollback restores the prior homepage presentation and footer route selection without data changes. Deployment is outside this planning change.
