## Why

Each service currently has one free-text platform label, such as "Reddit | LinkedIn", above an unrelated flat list of examples. Admins need to manage platforms independently for each service and place examples under the appropriate platform so visitors can browse relevant work.

## What Changes

- Replace the single Example platform field with per-service platform management: add, rename, reorder, and remove empty platforms.
- Let admins add examples inside a platform, edit them there, and move an example to another platform belonging to the same service.
- Replace the combined pricing-page badge with dynamic platform tabs. Selecting a tab shows only its examples; default to the first non-empty platform. Empty platforms remain available to admins but do not appear to visitors.
- Preserve existing link previews, custom covers, photos, videos, card tags, and trusted access.
- Adapt legacy platform labels and flat cards without losing examples. Ambiguous assignments go into a visible General group for admin review.
- Remove the parser's silent six-example cutoff and ensure media remains attached to the correct example when groups change.

## Capabilities

### New Capabilities

- `service-example-platforms`: Per-service platform management, example assignment, visitor filtering, and compatibility with legacy example data.

### Modified Capabilities

None; no main specs exist yet. The completed `enhance-pricing-example-previews` change remains the baseline for media rendering. This change adds organizational platforms; it does not add a provider selector or alter URL-based embed detection.

## Impact

- Admin service forms and create/update routes, service types/parsing/validation and MongoDB persistence, default service normalization, pricing service detail rendering, and tests.
- Adds an ordered platform list and platform association on example cards. A read adapter supports existing documents and stores the new structure on the next admin save; no destructive bulk migration.
- Cloudinary image/video upload mapping must remain correct across platform movement and reordering. No new media providers, email changes, authentication changes, or global platform catalog.
- Non-goals: assigning an example to multiple platforms, automatic grouping based on URLs, changing per-card tags into platforms, changing price cards, or redesigning the pricing overview.
