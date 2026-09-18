## Context

See proposal.md for motivation and scope. `PrivateServiceContent` in `lib/services.ts` stores a single `examplePlatform` string and flat `exampleCards`. The admin form's `ExamplesManager` maintains one array and serializes cards by numeric index. `parseExampleCardFormData` reads exactly six slots and filters empty entries. Both media upload helpers then map file fields using the parsed array index. This already risks losing later cards and associating files incorrectly when indices are compacted.

`app/pricing/[slug]/page.tsx` renders the legacy platform badge and all cards. `components/service-example-preview.tsx` implements provider previews and cover precedence; keep this reusable renderer. No main specs exist yet. The completed preview change is a baseline, not a change to reopen; platform grouping adds content organization without replacing automatic URL-based provider detection.

## Goals / Non-Goals

**Goals:** Stable platform/example associations, complete media persistence, predictable legacy conversion, and accessible filtering while preserving server-side access checks.

**Non-Goals:** Global platform entities, platform icons, many-to-many example assignments, automatic URL categorization, a new media pipeline, or new email/access workflows.

## Decisions

1. Extend private content with `examplePlatforms: { id: string; name: string }[]` and each example with stable `id` and `platformId`. Array order determines display order; use opaque IDs for new platforms and examples. Keep cards flat to reuse media/domain routines. Grouping by name would break associations on rename, and nested card arrays would complicate uploads unnecessarily. Keep `tag` independent so labels like GEO and UGC need not become platform names.

2. Add one shared normalization/legacy adapter in `lib/` and use it for database reads, defaults, editor initialization, and public rendering. Missing `examplePlatforms` indicates legacy data; an explicitly empty array indicates a deliberate empty state. Split the legacy string on `|`, deduplicate names ignoring case, and use deterministic IDs for legacy platforms and cards. Single-platform records keep all cards there. Multiple-platform records match tags exactly or assign General, appending/reusing that group. Never infer a platform from a URL or discard ambiguous cards. Remove the old required platform input; maintain a derived `examplePlatform` string on new saves for temporary backward read compatibility. New reads treat the structured fields as authoritative.

3. Replace the standalone platform input in `app/admin/services/service-form.tsx` with platform sections and add/rename/move-up/move-down/remove controls. Each section shows its examples and an Add Example action preselecting its platform. The existing example modal gets a platform selector for moves. New services start with no platforms; offer Add platform before adding examples. Empty services remain valid if the other service fields pass validation. Block removal of occupied platforms and explain how to move or remove their examples. No bulk destructive deletion flow is needed.

4. Serialize ordered platform and example metadata using an explicit JSON manifest in FormData; send pending files and cover-mode choices keyed by stable example ID. Parse and validate the manifest shape, unique IDs, names, and platform references before upload or persistence. Avoid filtering cards before joining files. Update `app/api/admin/services/upload-example-image.ts` and `upload-example-video.ts` to read by stable IDs for the new format. Keep the old indexed submission parser as a compatibility path, discovering all submitted card indices instead of using six slots, and retain source indices for media lookup until upload completes. Distinguish malformed new payloads from genuinely absent legacy fields; never fall back silently after a malformed manifest. Persist only domain fields, not pending files or transient form bookkeeping. Server validation rejects duplicate IDs, invalid names, foreign/dangling platform IDs, and incomplete examples; saves remain atomic at the service-document level.

5. Add a client-side platform browser in `components/` receiving only the normalized platform/card data after trusted access is checked in the server page. Render only the active platform's card list and reuse `ServiceExamplePreview`; inactive iframes and video elements unmount to stop playback. Default to the first populated platform, resetting to the first available group if the selection disappears. Render one tablist and one active tabpanel with stable IDs, `aria-selected`, roving tab focus, Left/Right/Home/End navigation, and Enter/Space manual activation. Use wrapping controls with bounded labels rather than forcing page overflow. No URL query state or All tab in this scope.

6. Hide empty platforms only on the visitor page. This lets admins prepare a platform without exposing empty tabs. No populated platforms means a clear empty-state message. Platforms belong solely to the service being edited; changing one document never mutates another. Keep all existing private pricing access checks, media validation, cover selection rules, and original-link fallbacks.

## Risks / Trade-offs

- Legacy labels do not establish ownership of mixed examples -> preserve ambiguous examples under General and make reassignment available in admin.
- Index-based uploads can drift when examples are removed or moved -> stable example IDs for new submissions and explicit source-index preservation for old submissions, with regression tests covering more than six cards and pending uploads.
- Older application code can drop the new fields when rewriting private content -> back up service documents before deployment and avoid concurrent old-version admin writes. Retain compatibility projections, but prefer rolling forward if a rollback would overwrite new associations.
- Many long platform names can overwhelm narrow layouts -> enforce the 60-character limit, wrap tabs, and verify keyboard behavior and overflow at 320px.
- Tab changes could leave media playing -> unmount inactive content and verify playback elements are removed when switching.

## Migration Plan

Deploy the shared adapter, repository/parser changes, upload handling, admin controls, and visitor browser together. No bulk write is required: existing documents normalize on read and gain stable structured fields on the next save. Update default service fixtures to explicit platform associations and use legacy fixtures to retain conversion coverage. Verify single-label, combined-label, empty, and already-structured services before rollout.

Retain legacy fields during this change so an older renderer can still show a combined label and flat cards. Back up data before rollout; on rollback, prevent older admin forms from saving over structured associations until a compatible version is restored.
