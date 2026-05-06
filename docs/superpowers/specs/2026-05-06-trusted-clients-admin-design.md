# Trusted Clients Admin Design

## Summary

Replace the env-based trusted client whitelist with a Mongo-backed admin workflow. Add a dedicated `/admin/trusted-clients` page where admins can add, browse, search, sort, and remove approved pricing-access emails. Trusted client records will store only email addresses plus timestamps. Removing a trusted client will block future magic-link requests, while existing trusted-client session cookies remain valid until they expire.

## Goals

- Move trusted client approval out of `TRUSTED_CLIENT_EMAILS` and into MongoDB.
- Add a dedicated admin screen for `add + list + remove` trusted client emails.
- Keep the new screen visually and structurally consistent with the existing admin dashboard pages.
- Preserve the existing magic-link email flow for approved clients.
- Keep the trusted session token system unchanged except for how approval is checked.

## Non-Goals

- No change to the trusted client session cookie lifetime or immediate revocation of active sessions.
- No support for storing names, companies, notes, or status fields on trusted clients.
- No bulk import, CSV upload, or multi-select removal workflow.
- No public-facing changes to the pricing page beyond continuing to require trusted access.
- No replacement of `TRUSTED_CLIENT_MAGIC_LINK_SECRET`; token signing remains env-backed.

## Current State

Trusted pricing access is currently controlled by `TRUSTED_CLIENT_EMAILS` in `lib/trusted-client.ts`. The request handler at `app/client-access/request/route.ts` checks the submitted email against that env-backed list before generating a magic link. This works for a small static list, but it requires env edits and usually redeploys whenever access needs to be added or removed.

The codebase already has an authenticated Mongo-backed admin area with server-rendered dashboards and form-post routes. That existing pattern is a good fit for managing trusted clients without introducing a separate management system.

## Proposed Design

### Data Model

Add a new Mongo collection named `trustedClients`.

Each record should store:

- `_id`
- `email`
- `createdAt`
- `updatedAt`

Email addresses should be normalized with the same trim-and-lowercase behavior already used by the trusted client flow. A trusted client email must be unique in the collection.

### Repository Layer

Add a new `lib/trusted-clients.ts` module that encapsulates trusted-client persistence and normalization.

It should provide:

- a `TrustedClient` type for the admin surface
- parsing for create-form input
- email normalization
- listing trusted clients in reverse chronological order
- duplicate-safe creation
- deletion by id
- an approval lookup by normalized email for the magic-link request flow

This keeps database concerns out of routes and keeps the approval rule in one place.

### Admin Page

Add a dedicated page at `/admin/trusted-clients`.

The page should follow the calmer two-panel dashboard pattern already used by `/admin/users`:

- a compact page header
- a slim metrics row
- a left-side create panel
- a right-side browse panel

The page title should clearly communicate that this area controls pricing access, not internal staff accounts.

### Create Panel

The create panel should contain:

- a short section label
- a heading such as `Add Trusted Client`
- brief helper copy explaining that approved emails can request pricing access links
- a single email input
- one primary submit button

The create form posts to `/api/admin/trusted-clients`.

If the email already exists, the create route should reject it and redirect back with a clear inline error state on the page.

### Browse Panel

The browse panel should render trusted clients as a stacked list or restrained rows rather than a dense table.

Each row should show:

- trusted client email as the primary line
- created date as the secondary line
- a `Remove` action

The panel should also include a small search-and-sort toolbar. To keep scope tight, this should support:

- search by email
- sort by newest first, oldest first, or email A-Z

Search and sort state should be URL-driven through `searchParams`, matching the existing admin page pattern.

### Removal Behavior

Removing a trusted client should delete the record from Mongo and redirect back to `/admin/trusted-clients`.

Removal only affects future pricing-link requests:

- the removed email can no longer request a new magic link
- any existing `trusted_client` cookie already issued remains valid until expiry

This avoids coupling the admin removal flow to cookie invalidation or session tracking work that is outside the approved scope.

### Navigation

Add a `Trusted Clients` entry to the admin sidebar in `app/admin/admin-nav.tsx`.

This keeps trusted pricing access management separate from internal admin account management and avoids overloading `/admin/users` with unrelated responsibilities.

### Magic-Link Flow Integration

Update the client-access request flow so approval is checked against Mongo instead of `TRUSTED_CLIENT_EMAILS`.

Specifically:

- `app/client-access/request/route.ts` should query the trusted-clients repository through Mongo
- `lib/trusted-client.ts` should stop treating env as the source of approved client emails
- `TRUSTED_CLIENT_MAGIC_LINK_SECRET` should remain required for signing and verifying magic-link and session tokens

The public behavior of the request page remains the same:

- approved emails receive a real email in configured environments
- approved emails receive a preview link in development when SMTP is absent
- unapproved emails still receive the generic `sent` response without confirming whether they are approved

## Interaction Model

- `/admin/trusted-clients` is server-rendered and protected by existing admin auth.
- Create and remove actions use standard server form posts with redirects.
- Search and sort use URL query params and standard form submissions.
- Success and error feedback should be shown on the page after redirects using query params such as `status` or `error`.

Recommended feedback states:

- create success
- duplicate email error
- remove success

This keeps the implementation consistent with the rest of the admin area and avoids adding client-side state management.

## Empty And Error States

- Empty state: explain that no trusted clients are configured yet and keep the create form visible.
- No-match state: explain that no trusted clients match the current search query.
- Duplicate create error: show a concise inline error near the top of the page.
- Invalid removal target: fail safely and return to the page with a generic error state rather than exposing internals.

## Testing Plan

Add or update tests to cover:

1. trusted-client repository behavior:
   - normalization
   - create
   - duplicate rejection
   - list ordering
   - delete
   - approval lookup
2. admin page rendering:
   - header
   - metrics
   - create form
   - search and sort controls
   - list rendering
   - empty and no-match states
3. admin routes:
   - create trusted client redirects correctly
   - remove trusted client redirects correctly
   - admin access is required
4. client access request flow:
   - approved Mongo-backed email generates a token and continues the send flow
   - unapproved email preserves the generic success redirect without sending access

## Risks And Mitigations

- Trusted client management could become visually inconsistent with the newer admin pages.
  - Mitigation: reuse the `/admin/users` layout pattern and existing admin design tokens.
- Duplicate email handling could become ambiguous if normalization is inconsistent.
  - Mitigation: centralize normalization in the trusted-clients repository and use it for both create and approval lookup.
- Removing env-backed approval could accidentally break the request flow.
  - Mitigation: cover the client-access route with focused tests that verify approved and unapproved behavior against Mongo-backed lookups.
- The remove action might be mistaken for full access revocation.
  - Mitigation: keep the implementation and any internal copy explicit that removal blocks future magic-link requests only.

## Implementation Notes

- New primary page: `app/admin/trusted-clients/page.tsx`
- New repository: `lib/trusted-clients.ts`
- New create route: `app/api/admin/trusted-clients/route.ts`
- New remove route: `app/api/admin/trusted-clients/[id]/route.ts`
- Update nav: `app/admin/admin-nav.tsx`
- Update request flow: `app/client-access/request/route.ts`
- Update trusted client helpers: `lib/trusted-client.ts`
- Expected new tests:
  - repository tests for trusted clients
  - admin page tests for trusted clients
  - admin route tests for create/remove
  - updated client-access request tests
