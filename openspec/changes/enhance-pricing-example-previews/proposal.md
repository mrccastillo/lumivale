## Why

Trusted pricing examples currently show plain URLs and cropped images that cannot be opened, making supporting work difficult to inspect. The detail hero also repeats prices and includes placeholder panels that distract from the service and examples.

## What Changes

- Add embedded previews for supported public TikTok, YouTube, and Facebook content, with an always-available link to the original.
- Let admins choose Automatic preview or Custom cover photo for each link example, upload/replace/remove the cover, and preview it before saving. A saved cover replaces the embed or generic preview media and opens the example's destination when clicked.
- Present other social and non-social URLs, including ChatGPT share links, as readable preview cards using the saved example title, summary, and destination hostname. Unsupported or unavailable embeds fall back to these cards.
- Make example photos open the original image in a new tab, with keyboard access and an accessible action name.
- Remove the hero's "Private detail" and platform badges (Image #2), the entire "Example channel" placeholder panel (Image #3), and the left-column duplicate pricing lines (Image #4). Retain the structured price cards.
- Replace the examples section's placeholder introduction with finished copy.

## Capabilities

### New Capabilities

- `pricing-example-previews`: Trusted service example previews, photo inspection, and detail-page cleanup.

### Modified Capabilities

None; no existing main capability specs are present.

## Impact

- Affects `/pricing/[slug]`, reusable preview components and URL classification in `components/` and `lib/`, service editor controls, service create/update upload handling, and focused tests.
- Reuses MongoDB example image fields and the Cloudinary service-image upload pipeline for optional link covers; no migration or new persisted fields required.
- Preserves trusted-client authorization, admin authorization, upload validation, existing videos, service navigation, and `/pricing` summaries. No email changes.
- Non-goals: removing all pricing, redesigning public service pages, scraping arbitrary websites for metadata, automatically following shortened links on the server, adding support for every provider's embed format, or replacing existing uploaded-video playback.
