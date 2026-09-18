# Verification

Completed September 19, 2026.

- `npm test`: 53 files, 258 tests passed. jsdom reports its known document-navigation limitation in form tests; browser navigation was checked separately.
- `npm run lint`: passed after removing the temporary browser script.
- `npm run build`: passed, including TypeScript and page generation.
- `git diff --check`: passed.
- `openspec validate group-service-examples-by-platform`: passed.

The browser check created an isolated service through the admin UI with three platforms and eight examples. It uploaded a custom cover, a standalone photo, and a video; moved the pending cover to another platform; renamed and reordered platforms; and verified persistence after saving and reloading. The empty platform remained editable but absent from visitor tabs. Five examples appeared in the first tab and three in the second.

Keyboard checks covered arrow navigation with manual activation, Enter, Home, and Space. Switching groups removed the previous video element from the DOM. Screenshots at 320, 768, and 1440 CSS pixels confirmed wrapping platform labels and visible focus; document width did not exceed viewport width. The existing tablet site header remains crowded, independently of the platform controls.

An initial generated video fixture contained no usable frames and Cloudinary rejected it. The fixture was corrected, and Cloudinary errors now propagate as Error objects so admin saves display the provider's message. The subsequent browser run passed. The temporary service, all recorded successful uploads, and six partial image uploads from failed fixture attempts were removed. The temporary browser script was removed from the workspace.

Repository and UI tests additionally cover legacy grouping, stable IDs, duplicate/invalid names and assignments, eight-card manifests, sparse legacy upload indices, independent services, draft file retention during moves/removals, empty states, tab semantics, and unchanged authorization. Existing unrelated working-tree changes were preserved.
