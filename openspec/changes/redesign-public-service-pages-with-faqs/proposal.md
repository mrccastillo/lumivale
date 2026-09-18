## Why

Public service details currently use a different visual layout from trusted pricing details and cannot answer service-specific questions. Matching the dark service hero and navigation while displaying FAQs gives public visitors a consistent experience without exposing private prices or examples.

## What Changes

- Redesign `/services/[slug]` to follow the second reference image: dark green gradient hero, published-service navigation with an active pill, Home link, service title and public description, then a white section headed FAQS.
- Omit the pricing panel entirely and use a balanced text-only hero. Replace the current Highlights detail section with service-specific FAQ accordions; retain stored highlights and their uses elsewhere.
- Add an ordered FAQ editor to Admin → Services with add, edit, remove, and move up/down controls. FAQs belong to the service and save with its existing form.
- Treat services with no saved FAQs as an empty list and show a concise public empty state. Do not populate them from homepage FAQs.
- Scope assumption: the first screenshot is the public `/services/[slug]` route, available without a magic link. Its design remains public even when a trusted visitor opens it; `/pricing/[slug]` retains its existing trusted behavior.
- Non-goals: changing trusted pricing pages, platform examples, global homepage FAQs, authentication or magic-link flows, pricing data, uploads, or adding rich-text/media FAQ editing.

## Capabilities

### New Capabilities

- `public-service-faqs`: Public service-page layout and navigation, per-service FAQ editing and persistence, accessible display, and separation from private content.

### Modified Capabilities

None. The completed platform-example change remains unchanged.

## Impact

- Public rendering: `app/services/[slug]/page.tsx`, a focused FAQ component if needed, and existing navbar surface detection.
- Admin/data: `app/admin/services/service-form.tsx`, `lib/services.ts`, existing service create/update routes, and MongoDB service documents gain an additive public `faqs` array.
- Tests: service detail, repository, admin form/routes, homepage FAQ regression, and trusted pricing regression checks.
- Existing documents remain readable without a bulk migration; omitted FAQ fields in older requests must preserve saved FAQs on updates. No new dependencies, collections, email, media uploads, or authorization changes.
