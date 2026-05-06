# Pricing Page Design

## Summary

Redesign the private `/pricing` page into a clean, minimalist service-by-service price list for trusted Lumivale clients. The page should keep the existing private-access gate and simple page shell while replacing the current sparse placeholder copy with a structured pricing panel that lists each service, a short description, and a placeholder `Starting at $X/mo` amount.

## Goals

- Keep the pricing page visually simple and aligned with the current Lumivale marketing style.
- Present pricing as a service-by-service list rather than package cards.
- Use flexible `Starting at` placeholder pricing labels instead of fixed amounts.
- Reuse existing service summaries so pricing copy stays consistent with the services catalog.
- Preserve the current private-access behavior for trusted visitors only.

## Non-Goals

- No public pricing access.
- No package-card layout or bundled pricing matrix.
- No deliverables lists, FAQs, filters, toggles, or interactive pricing controls.
- No custom pricing logic, calculators, or quote forms.
- No change to the service data model or trusted-client access flow.

## Current State

`app/pricing/page.tsx` currently renders a private route with only a heading and one supporting sentence:

- `Pricing`
- `Private flat-rate growth packages for approved Lumivale clients.`

The page has the correct spacing and access control, but it does not yet present actual pricing structure or the existing list of Lumivale services.

## Proposed Design

### Page Structure

The page should keep a restrained single-column layout with the existing top and bottom spacing contract:

- `pt-32`
- `pb-[54px]`

Inside that shell, the content should render in three parts:

1. a restrained header block
2. one main pricing panel containing all service rows
3. a small closing note under the panel

### Header Block

The header should keep the current title and private-access framing while slightly improving the message hierarchy.

Expected content:

- heading: `Pricing`
- existing private-access line: `Private flat-rate growth packages for approved Lumivale clients.`
- one short supporting line that frames the page as simple monthly pricing for focused growth support

The tone should stay plain, direct, and understated.

### Pricing Panel

The main pricing content should appear inside a single rounded container with:

- soft border
- white background
- very light shadow
- generous but not oversized padding

This panel should feel consistent with the surfaces already used on the About and Services sections.

### Service Rows

Render one row per existing service:

- Comment Campaign
- UGC Content Creation
- Creator Collabs
- LinkedIn Outreaching
- Email B2B Campaigns

Each row should contain:

- service title
- one-line description sourced from the existing service summary
- placeholder price label formatted as `Starting at $X/mo`

Rows should be separated by subtle dividers. No icons, badges, or dense feature bullets should appear in this list.

### Desktop Layout

On larger screens, each service row should read as a two-column layout:

- left: service title and one-line description
- right: placeholder `Starting at` price

The price should be visually stronger than the description, but it should not dominate the layout.

### Mobile Layout

On smaller screens, the service row should stack naturally:

- title first
- description second
- `Starting at $X/mo` beneath the description

Spacing should remain even and readable without introducing card-per-row styling.

### Closing Note

Below the pricing panel, include a short plain-text note that leaves room for custom scoping or bundled support discussions after a call.

This should remain a text note only, not a CTA block or conversion panel.

## Content Source

The pricing page should source service names and one-line descriptions from the existing service catalog in `lib/services.ts` so that:

- titles stay consistent with the homepage services section
- descriptions stay consistent with service detail pages
- the pricing page does not introduce a second, drifting source of truth for service copy

Pricing amounts remain placeholder strings for now and should be rendered consistently across all rows.

## Access Control

The existing trusted-client gate remains unchanged:

- approved visitors can view the page
- unapproved visitors should still hit `notFound()`

No design change should weaken or bypass this behavior.

## Testing Plan

Expand the pricing page test coverage to verify:

1. the trusted-client copy still renders for approved visitors
2. all five service titles render
3. each service row includes a placeholder `Starting at` label
4. service descriptions appear from the service catalog
5. the section keeps `pt-32` and `pb-[54px]`
6. public visitors are still blocked by the existing `notFound()` behavior
7. no generic placeholder-dev copy leaks into the UI

## Risks And Mitigations

- The page could drift into a busier sales layout.
  - Mitigation: keep one panel, one row pattern, and no extra widgets.
- Placeholder pricing could read unfinished.
  - Mitigation: use one consistent `Starting at $X/mo` format across all services.
- Pricing copy could diverge from service detail pages.
  - Mitigation: source descriptions from `lib/services.ts`.

## Implementation Notes

- Primary file: `app/pricing/page.tsx`
- Primary test file: `tests/pricing-page.test.tsx`
- Existing service source: `lib/services.ts`
- Existing trusted-client access helper: `lib/trusted-client`
