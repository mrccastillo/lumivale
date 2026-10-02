## Why

The client prefers the site's design at commit `e9cad74` over the current chalk-and-sage concept. Restore that established visual identity while retaining the landscape Results section and image-led Case Studies carousel shown in the two supplied screenshots.

## What Changes

- Design only: the current implementation is the authority for all functionality, interactions, content, links, and workflows. `e9cad74` supplies visual styling only. If historical appearance conflicts with current behavior, preserve current behavior and adapt the styling.
- Restore the shared public navbar and every public footer, including the closing CTA, to the visual language of `e9cad74a7b0b46a588752beb9362d4b8a038587f`.
- Restore the homepage Services card grid, dark glass Testimonials section, and white split-layout FAQs from that reference.
- Restore individual public service pages to the reference's white hero, Poppins hierarchy, emerald links, and cool neutral supporting surfaces. Keep current service navigation and service-specific FAQs, styled to match the old FAQ design; do not replace FAQs with the historical Highlights section.
- Retain Image #1's landscape, four glass metric cards, centered heading, and responsive layout. Retain Image #2's image/copy split, complete story content, metrics, full-story link, carousel arrows, and position indicator.
- Retheme these two retained sections with Poppins, emerald accents, deep green, white, and cool neutral surfaces from the old design. Screenshots govern their composition; the commit governs their theme. Screenshot example text and figures are not replacement production data.
- Preserve current CMS bindings, published content, media, navigation destinations, access restrictions, and working interactions.
- Confirmed scope: Services and FAQs include both the homepage and individual public service pages. "All footing" is interpreted as all public footers.

Non-goals: resetting the repository to the old commit; reverting backend or admin work; changing the hero, unlisted route bodies, pricing detail pages, case-study storytelling, content models, or stored data; rewriting marketing copy.

- Follow-up scope: restore the `/pricing` listing to the compact historical rate table; retain `/blogs` and `/about` layouts and implementation while applying the historical palette and Poppins. Current content, links, carousel behavior, and trusted access remain unchanged.

## Capabilities

### New Capabilities

- `classic-public-design`: Historical public chrome and homepage section presentation with retained, rethemed Results and Case Studies compositions.

### Modified Capabilities

None. `openspec list --specs` reports no main specs. The completed but unarchived `apply-brand-concept-below-hero` change contains earlier visual requirements; this proposal explicitly supersedes its chalk/sage/daylight styling and concept footer requirements for the surfaces in scope. Its content-preservation requirements remain applicable. This also supersedes the dark pricing-style hero requirement in `redesign-public-service-pages-with-faqs` with the white hero from `e9cad74`. Current implemented behavior takes precedence over historical plans: preserve the existing single-open FAQ groups and current link inventory, including the current absence of a footer Admin login link. Do not reconcile unrelated behavior discrepancies as part of this design change.

## Impact

- Routes: `/`, `/pricing`, `/blogs`, `/about`, and public `/services/[slug]` bodies, plus shared navbar/footer on `/about`, `/blogs`, `/blogs/[slug]`, `/case-studies`, `/case-studies/[slug]`, `/pricing`, and `/pricing/[slug]` where currently rendered. Admin shells remain unchanged.
- Code: `app/page.tsx`, `app/services/[slug]/page.tsx`; navbar, footer, homepage, carousel, testimonial, and shell components and their scoped styles. `components/service-detail.module.css` is shared with pricing, so public-service styling must be isolated. Global CSS is a token reference; unrelated route typography must not change.
- Verification: existing homepage, navigation, footer, site-content, case-study carousel, testimonial-media, and admin-shell tests; visual comparison at mobile, tablet, and desktop sizes.
- No MongoDB migration, API change, new dependency, Cloudinary upload, email change, or authorization change. Reuse `public/results-landscape.jpg` and current published cover media.
