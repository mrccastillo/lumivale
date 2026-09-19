# Implementation verification

Baseline: 35 tests passed across existing case-study repository, routes, dashboard, public pages, and homepage tests. TypeScript already reports errors in tests/admin-service-form-uploads.test.tsx, tests/admin-service-platforms.test.tsx, and tests/services-repository.test.ts. Existing tests contain custom stories, seed overrides, unpublished seeds, and homepage ordering fixtures.

No production content is rewritten or media deleted by this change. Before production rollout, back up the caseStudies collection and run `node scripts/prepare-case-study-index.mjs`; it reports duplicate slugs without deleting records. Version-2 data is added on explicit save only. Retain a version-2-compatible reader on rollback and disable the new editor before reverting presentation. Old writers must not edit version-2 records. Unused uploads are retained; automatic media cleanup is outside this change.

## Administrator workflow

Open Admin > Case Studies > New Case Study, or edit an existing story. Supply the story details and metrics, then use the section buttons to add text, image/text splits, full-width images, galleries, comparisons, and quotes. Upload JPG/PNG/WEBP images up to 5 MiB, add alternative text, and optionally add captions. Move sections or gallery items with their up/down buttons. Preview uses the current unsaved content and offers desktop/mobile widths. Save as Draft to keep unfinished work private; choose Published and save to make a complete story visible. Saving an existing published story updates live content.

Existing records adapt on read without writes. The first explicit save uses schema version 2 while retaining legacy narrative fields. Seeded slugs remain fixed and can be unpublished rather than deleted. The homepage reads published records and retains Case Studies before Services. An unavailable repository does not fall back to built-in published stories. Empty homepage case-study sections are omitted.

## Verification evidence

- Chromium browser checks used the running local Next.js app with a local verification session. Save and upload HTTP requests were intercepted; no client story or image was written to the live database or Cloudinary account.
- The browser exercised rich-text editing, both image/text placements, full-width evidence, a gallery upload, before/after content, and a quote. Nine sections survived a validated published save payload. Move-up/down controls worked using keyboard Enter. Desktop/mobile previews rendered; the public detail page had no horizontal overflow at 390px and no browser page errors.
- Screenshots inspected locally: `C:/Users/marcc/AppData/Local/Temp/lumivale-preview-desktop.png`, `lumivale-preview-mobile.png`, and `lumivale-public-mobile.png`. Reference imagery was used only as a transient intercepted browser fixture, not as stored Lumivale content.
- The lifecycle integration test exercises actual mutation routes and repository code against an in-memory database through draft create, validated upload (mocked Cloudinary transport), publish, edit, unpublish, and reopen. Unit tests additionally cover malicious/oversized payloads, authorization, origin rejection, media signature validation, failed upload retention, cancellation, seeded restrictions, legacy conversion, and outage visibility.
- The unique-slug preparation is tested for duplicate reporting and idempotent setup. Runtime writes invoke it once per database connection; the standalone script also supports a pre-deployment check.
- The production build passed. Standalone `npx tsc --noEmit` continues to report only the three pre-existing service-test file errors recorded in the baseline; no new TypeScript diagnostics were introduced.

Final checks: `npm test` passed all 300 tests in 61 files; `npm run lint` passed; `npm run build` passed (45 routes/pages generated).
