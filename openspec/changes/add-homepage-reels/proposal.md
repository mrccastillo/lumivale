## Why
The user wants a social reel gallery immediately below the existing landscape Results panel, with admin management for reels from any social platform.

## What Changes
- Add a persistent reels collection with authenticated create/edit/publish/unpublish/delete controls and numeric display ordering.
- Accept HTTPS links to any social platform, a platform label, client, title, uploaded portrait thumbnail and optional views/likes/comments.
- Add a four-column desktop gallery under Results, with tablet reflow and a horizontally scrollable mobile row. Play and View reel links open the original post in a new tab.
- Preserve the current landscape panel, counters, case-study redesign and other public/admin behavior. No third-party embed scripts or platform credentials are required.

## Capabilities
### New Capabilities
- `homepage-reels`: Admin-managed cross-platform reel gallery.
### Modified Capabilities
None.

## Impact
New `/admin/reels`, `/api/admin/reels` and `/api/admin/reels/[id]` routes, `reels` MongoDB collection, Cloudinary thumbnail uploads, homepage integration, and admin navigation. No seeded production content or migration is required.
