## Why

The homepage below the hero still uses the previous dark panels, white card grids, and rounded controls. Apply the approved standalone Lumivale concept to this portion of the site so Results through the closing footer share its premium editorial layout, warm surfaces, forest typography, and daylight accent.

## What Changes

- Preserve the existing navbar, hero, hero animation, booking control, and client marquee exactly. Start the new design at Results (`#proof`).
- Restyle Results, Case Studies, Services, Testimonials, FAQs, and the closing CTA using `lumivale-brand-concept.html` as the visual source of truth. Keep this section order and existing published/admin-managed content.
- Match the concept's closing/footer composition one-to-one: forest background, left-aligned large CTA, right-side rectangular daylight button, fine divider, compact contact/link row, and oversized lowercase wordmark at the bottom. Match responsive behavior as well as desktop appearance, accommodating all existing footer content. Content preservation takes precedence over exact prototype geometry where extra space is needed.
- Keep homepage changes scoped; the existing footer on other routes remains unchanged. All existing editable footer content remains visibly rendered on the homepage and connected to its current admin fields; retaining a field only in storage or on another route is not sufficient.
- This is a presentation-only change: preserve every existing section heading, paragraph, label, value, image, video, item, link, and control. Do not remove, shorten, rewrite, replace with concept copy, or hide content to fit the layout. Existing publication, pagination, disclosure, and fallback rules continue unchanged.
- Preserve functioning links, testimonial images/video and pagination, FAQ interaction, data fallbacks, and admin controls. Do not publish the prototype brand-kit dialog or illustrative campaign data.

Non-goals: redesigning the hero/navbar, admin, service/case-study detail pages, blogs, pricing or about page; importing the concept's landscape hero; adding its process section; inventing results; changing authentication, uploads, email delivery, or CMS schemas.

## Capabilities

### New Capabilities

- `homepage-brand-concept`: Scoped below-hero visual system, section presentation, live content continuity, and concept-matched homepage footer.

### Modified Capabilities

None. No main specifications currently exist. The active case-study-storytelling change remains intact; this change only adapts its homepage presentation.

## Impact

- `/`: `app/page.tsx`, scoped styles/fonts in `app/globals.css` or a dedicated CSS module, homepage section components, and a homepage closing/footer component.
- `components/app-shell-client.tsx` and `components/site-footer.tsx`: prevent duplicate homepage footer while preserving the existing footer on other public routes and its absence on admin routes.
- `components/case-study-cards.tsx` and testimonial components may receive opt-in homepage variants; shared defaults must remain unchanged elsewhere.
- Reuse `lib/site-content*`, published repositories, existing media URLs and URL safety checks. No database migration, API change, media upload change, new authorization permission, or email behavior change is required.
- Focused homepage/footer/content regression tests, browser screenshot comparison against the HTML reference, then lint, tests, and build.
