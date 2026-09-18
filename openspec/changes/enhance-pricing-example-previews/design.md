## Context

See proposal.md for the user-visible scope. `app/pricing/[slug]/page.tsx` already guards trusted access before loading services. It renders each `previewUrl` as a hostname and raw URL, each photo as an unlinked figure, and each `videoUrl` with native controls. Its hero renders `pricingLines` twice and wraps decorative placeholders in a minimum-height panel.

`lib/services.ts` defines optional `exampleType`, `previewUrl`, `imageUrl`, `imageAlt`, and video fields. It normalizes HTTP(S) links and validates uploaded photos. `app/admin/services/service-form.tsx` already supports link/photo examples. `tests/pricing-service-page.test.tsx` currently expects the duplicate textual rate representation and must be updated.

## Goals / Non-Goals

**Goals:** Keep provider classification deterministic, use the existing data model, and ensure saved example content stays usable regardless of third-party availability.

**Non-Goals:** No remote metadata scraper, oEmbed proxy, provider account integration, new secrets, database migration, or changes to service pricing persistence. No lightbox dependency: full-size images open as ordinary links.

## Decisions

1. Add a pure URL classifier in `lib/service-example-preview.ts` and a reusable renderer in `components/service-example-preview.tsx`. Parse URLs with the URL API; match exact allowed hostnames and supported path/ID shapes rather than substring checks. Generate provider embed destinations from validated IDs or encoded canonical permalinks. Never accept stored iframe HTML or insert raw external markup. Unrecognized HTTP(S) destinations use a generic card; malformed legacy values render saved text without a link. This is simpler and more predictable than guessing embed support from the card tag.

2. Support YouTube watch, youtu.be, shorts, and embed video forms; canonical TikTok `/@creator/video/<id>` links; and Facebook public post/video permalink forms supported by official plugins. Use provider-documented embed facilities with lazy loading, descriptive iframe titles, bounded responsive dimensions, playback controls, and no autoplay. Final provider URL details must be checked against official documentation during implementation, especially Facebook permalink variants. No server redirect resolution for shortened links.

   References: [YouTube player documentation](https://developers.google.com/youtube/player_parameters), [TikTok embed player](https://developers.tiktok.com/docs/en/embed-player), and [Facebook plugin documentation](https://developers.facebook.com/docs/plugins/). The current TikTok and YouTube documentation confirms dedicated embed players; Facebook format compatibility requires a live implementation smoke check.

3. Always render the saved title/summary, hostname, and original-link action outside any embed. Generic previews use those existing fields rather than fetched Open Graph data. A permanently available fallback avoids relying on cross-origin iframe load events, which do not reliably reveal blocked or private content. Do not promise automatic detection of every provider error. Render one coherent card without unnecessary duplicate title/summary blocks.

4. Wrap photo media in a native anchor to the validated original image URL, with `target="_blank"`, `rel="noopener noreferrer"`, visible focus, and an action name such as "Open [title] full-size image (opens in a new tab)". Retain image alt text and captions. An anchor gives keyboard access without adding modal focus management; the original image supports browser zoom.

5. Keep structured price cards in the hero. Remove only the duplicate left-side pricing list, badge row, and placeholder channel block identified by the screenshots. Remove obsolete minimum heights and spacing from their containers. Keep the platform label above the examples because that label was not marked for removal. Change placeholder introduction copy to "Explore examples of this service in action." Preserve `/pricing` overview rates and the service editor's pricing fields.

6. Keep the page as a server component and preserve authorization before rendering embeds. Use a client component only if a provider integration actually requires browser lifecycle management. External embeds contact providers in the visitor's browser; never forward trusted-access tokens. No arbitrary server URL fetching means no added SSRF surface. Update the service editor's preview-field helper copy to explain supported providers and general website fallback, preserving validation and saving behavior.

7. Add Automatic preview / Custom cover photo controls to link examples in `app/admin/services/service-form.tsx`, including image selection, local preview, alternative text, replacement, and removal. Reuse `imageUrl` and `imageAlt` on `exampleType: "link"`; a non-empty image URL represents the cover override, while an empty image URL represents automatic preview. Keep `previewUrl` as the click destination. The editor tracks pending mode separately so selecting Custom cover photo without an image produces an error rather than silently switching modes. Validate the submitted mode and image presence in create/update handling before persistence; the mode need not be stored because the saved image determines it. Choosing Automatic preview clears the submitted cover URL and pending file. Preserve saved covers when editing unrelated fields. Unlike a new persisted mode field, this representation uses the existing model without requiring a migration.

8. Reuse `app/api/admin/services/upload-example-image.ts` and the existing create/update routes for cover uploads, including existing MIME/size checks and authenticated access. Ensure form serialization retains link covers instead of clearing them on link selection. Cover rendering takes precedence over provider classification; no iframe or provider script is mounted for a covered link. The cover anchor opens `previewUrl`, with title/summary and a separate original-link action remaining usable if the image fails. Standalone photo examples still open `imageUrl` full-size. Cover removal detaches the image from the example; it does not delete a Cloudinary asset that other records might reference. Test editor save/reload, upload failures, and renderer precedence together.

## Risks / Trade-offs

- Provider restrictions, private posts, deleted content, or browser blockers can prevent playback → retain readable saved content and the original link at all times; perform live smoke checks and report any provider limitation.
- Generic previews do not automatically show external thumbnails → use saved title/summary rather than introduce scraping, external API credentials, or unreliable metadata requirements.
- Tall vertical embeds can distort the grid → use provider-appropriate bounded media areas and test at 320px, tablet, and desktop widths.
- Removing duplicate prices changes existing test assertions → assert each configured rate card remains and the redundant paragraphs disappear; do not delete pricing data or weaken trusted access tests.

## Migration Plan

No data migration. Deploy the renderer, URL helper, service-editor cover controls, upload handling, and detail-layout change together. Existing records derive their preview on read; link records already containing an image use that image as their cover, and records without one retain automatic previews. Verify representative saved examples and all service detail routes after deployment. Rollback is a code revert; saved data and uploads remain compatible, although older rendering ignores link covers.
