## 1. Baselines and scoped foundation

- [x] 1.1 Capture current hero/navbar and HTML concept footer at desktop and mobile widths; save baseline paths and viewport details in verification.md so preservation and footer fidelity can be checked directly.
- [x] 1.2 Add regression coverage for existing section order, editable Results content, published item links and hero controls in tests/home-page.test.tsx; verify these tests pass against the current behavior before restyling.
- [x] 1.3 Introduce scoped concept tokens, Manrope/DM Sans typography, content widths and reduced-motion styles; separate Results from the hero visual wrapper and verify the hero baseline, anchors and navbar surface detection remain unchanged.

- [x] 1.4 Capture a section-by-section content inventory and add parity assertions for headings, full copy, labels, item counts, media associations, links/destinations and controls using the same fixtures; verify the baseline passes before restyling and no content is removed or hidden afterward.

## 2. Homepage sections

- [x] 2.1 Restyle Results as concept metric columns with mobile 2x2 reflow; verify all four admin values/labels, placeholders and heading overrides render through the focused homepage/content tests.
- [x] 2.2 Implement homepage-only image-led case-study rows using actual published content; verify covers, missing-cover layout, metric content, detail links and empty section behavior without changing the case-study listing presentation.
- [x] 2.3 Replace the service card grid with numbered editorial rows in the concept visual language; verify every returned service remains visible with its summary and correct detail link at desktop/mobile widths.
- [x] 2.4 Apply matching typography, surfaces, author-image treatment and controls to testimonial carousel/fallback variants; verify existing pagination, placeholder marking, uploaded logos/photos and video behavior with focused tests and browser interaction.
- [x] 2.5 Restyle FAQs as the concept's split layout and ruled disclosures; verify existing order, first-open behavior, fallbacks, keyboard toggling and long-answer wrapping.

## 3. Concept-matched homepage footer

- [x] 3.1 Add a homepage closing/footer component using the HTML styling and all existing Site Content props; retain visible brand/tagline, Home/About/Blogs navigation, contact heading, email/LinkedIn, site label, bottom text and Admin login; verify every field override, destination, copyright and wordmark fit with focused component tests.
- [x] 3.2 Replace the homepage conversion section and suppress the legacy shell footer only on exact `/`; verify one homepage footer, unchanged other public footers, no admin footer and correct behavior after client-side navigation.
- [x] 3.3 Compare implementation and HTML footer screenshots using matching text at 390px, 768px and 1440px; correct differences in colors, font metrics, spacing, CTA alignment, divider, contact row and oversized wordmark crop, and record the evidence in verification.md, allowing only additional layout space required to preserve all existing footer content.

## 4. Integration verification

- [x] 4.1 Verify the complete homepage at 360px, 390px, 768px and 1440px with long CMS text and missing media; compare every section against the baseline content inventory and confirm no horizontal overflow, usable targets, visible focus, readable contrast and reduced-motion content visibility.
- [x] 4.2 Compare protected hero/nav baselines and smoke-check service/case-study detail pages, about/blog/pricing pages and admin; confirm scoped styles and homepage variants do not leak into existing presentations.
- [x] 4.3 Run focused changed-area tests, then npm test, npm run lint and npm run build; record outcomes and any pre-existing failures separately in verification.md, and mark tasks complete only after the required behavior is verified.
