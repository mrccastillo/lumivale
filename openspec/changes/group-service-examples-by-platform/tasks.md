## 1. Platform data and compatibility

- [x] 1.1 Extend service types with ordered platforms and stable example/platform IDs, and implement the shared legacy adapter. Add tests for single labels, combined labels, matching tags, General fallback, empty data, stable repeated normalization, and explicit structured data; verify every original card and media field survives.
- [x] 1.2 Update normalization, validation, defaults, repository reads, and saves for structured platforms, preserving the derived legacy label. Verify tests reject invalid/duplicate names and IDs, foreign/dangling assignments, and retain associations on rename/reorder without affecting other services.

## 2. Form parsing and upload integrity

- [x] 2.1 Implement the new ordered FormData manifest and stable-ID media lookup, retaining a dynamic legacy indexed-parser path with source indices. Verify parsing tests cover malformed manifests, sparse old indices, empty lists, and at least eight examples across multiple platforms without truncation.
- [x] 2.2 Update service create/update routes and image/video upload helpers to validate platform structure and preserve each file's example association. Verify integration tests cover moves, removals, platform reordering, mixed photos/covers/videos, upload errors, and unauthorized saves with no unintended persisted changes.

## 3. Admin platform management

- [x] 3.1 Replace the single Example platform field with per-service platform sections and add/rename/reorder/remove-empty controls. Verify editor tests cover persistence after reload, case-insensitive duplicate errors, occupied-platform removal prevention, and a new service with no platforms.
- [x] 3.2 Scope Add Example to the chosen platform and add a platform selector for moving existing examples. Preserve draft files and all existing modal fields; verify tests for moves, cancellation, saved cover reload, and removing a different example before submission.

## 4. Visitor platform browsing

- [x] 4.1 Add the accessible client platform browser and integrate it into the trusted pricing detail server page. Reuse existing preview and video rendering; verify tests cover initial selection, filtering, saved order, hidden empty platforms, no-examples state, and removal of inactive media on tab changes.
- [x] 4.2 Verify keyboard tab controls, selected-state semantics, and unchanged trusted-client authorization with focused tests. Confirm card tags and URL-based provider detection remain independent of platform names.

## 5. Integrated verification

- [x] 5.1 Use an isolated test service to create platforms, add more than six mixed examples, upload covers/videos, move examples, rename/reorder platforms, and save/reload. Verify visitor tabs show only the selected group's persisted content and empty groups remain admin-only; clean up test records and assets.
- [x] 5.2 Inspect mobile (320px), tablet, and desktop layouts with long platform names and multiple tabs. Verify no page overflow, visible keyboard focus, usable controls, and stopped/unmounted media after selection changes.
- [x] 5.3 Run focused platform, repository, admin, upload, and pricing tests, then `npm test`, `npm run lint`, and `npm run build`. Record results and any pre-existing failures, review the diff, and preserve unrelated working-tree changes.
