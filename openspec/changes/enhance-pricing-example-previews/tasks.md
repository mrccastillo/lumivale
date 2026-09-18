## 1. Link classification and preview rendering

- [x] 1.1 Implement the URL classifier in `lib/service-example-preview.ts`, checking official provider documentation for embed formats. Add unit cases for YouTube watch/shorts/youtu.be/embed, canonical TikTok videos, supported Facebook post/video permalinks, unsupported shares, generic websites, malformed URLs, unsafe protocols, and deceptive hostnames; verify the focused classifier tests pass.
- [x] 1.2 Implement the reusable preview component with provider embeds, no autoplay, lazy loading, descriptive titles, responsive dimensions, and an always-visible original-link fallback. Add component tests for each provider and generic/non-social destinations, including a ChatGPT share URL; verify saved content and the fallback action remain present independently of iframe success.

## 2. Detail page and admin integration

- [x] 2.1 Integrate previews into `app/pricing/[slug]/page.tsx` and make photo media link to the original image with accessible new-tab labeling and opener isolation. Extend pricing-detail tests to verify link destinations, captions, existing video controls, invalid legacy URL handling, and trusted-access rejection.
- [x] 2.2 Remove the hero badge row, entire placeholder channel panel, and duplicate left-column rate list; simplify obsolete wrapper heights/spacing and finish the examples introduction. Update pricing-detail tests to verify those elements are absent and every rate still appears once in the structured price cards.
- [x] 2.3 Add Automatic preview / Custom cover photo controls to the service editor with upload, local preview, alt text, replacement, and removal. Preserve destination URLs and unchanged covers; verify editor tests cover choosing each mode, missing-image errors, switching back, and saved-cover reload.
- [x] 2.4 Integrate cover serialization and validation into the existing service create/update image-upload pipeline using link examples' image fields. Verify route/repository tests cover successful save, replacement, removal, unsupported or oversized files, upload failure leaving saved data unchanged, and unauthorized submissions; retain existing photo/video tests.
- [x] 2.5 Render custom covers before automatic preview selection, linking them to the example destination while standalone photos still open full-size. Verify component tests cover social and non-social covers, absence of embeds for covered links, broken-image fallback actions, and restoration of automatic previews after removal.

## 3. Integrated verification

- [x] 3.1 Check representative public TikTok, YouTube, and Facebook embeds in a browser alongside generic/ChatGPT links, blocked or unavailable content, clickable standalone images, and admin-uploaded link covers. Save, replace, and remove a cover through the admin editor and verify the pricing page updates correctly. Verify original destinations remain usable and record any provider limitations; do not depend on live third-party requests in unit tests.
- [x] 3.2 Inspect the pricing detail page at 320px, tablet, and desktop widths and navigate actions with the keyboard. Verify no horizontal overflow, visible focus, readable previews, and no empty space left by the removed hero elements.
- [x] 3.3 Run focused preview and pricing tests, then `npm test`, `npm run lint`, and `npm run build`. Record outcomes and distinguish pre-existing failures from regressions; review the diff to preserve unrelated working-tree changes.

## Verification results

- 2026-09-19: 52 focused tests passed; full suite passed with 227 tests across 50 files. ESLint and the Next.js production build passed.
- Browser checks at 320px, 768px, and 1440px found no horizontal overflow; reviewed pricing screenshots and confirmed removed badges, placeholder panel, and duplicate rate text. Keyboard activation opened the original image in a new tab with visible focus.
- Representative TikTok, YouTube, and Facebook video embeds loaded provider content. Existing ChatGPT links retained their original-destination action. Fallback links render outside the iframe and are tested independently of provider content; third-party availability remains outside application control.
- A temporary draft exercised real admin cover upload, saved-cover reload, replacement, removal, and automatic-mode reload. The draft and its two Cloudinary test assets were deleted afterward. Component tests verified that saved cover data overrides embeds on the pricing page and preserves the original link when image loading fails.
