## Decisions
Use the existing admin session authorization and MongoDB/Cloudinary services. Store manual display metrics as text so values such as 1.2M remain supported. Reels are independent of testimonials. Only published records appear publicly, sorted by order and stable date/id tie-breakers. Empty or failed reads omit the gallery without fictional content.

Support any platform through a validated HTTPS source link. Play controls link to the original post, rather than promising inline playback across incompatible social embeds. No source URL is fetched by the server. Require an uploaded Cloudinary thumbnail for publication; drafts may omit the image. Enforce a 5MB image limit, allowed raster types, field limits and finite whole-number ordering. Return actionable validation errors and generic infrastructure errors while retaining client-side form input. Publication revalidates the homepage.

Use the current white, cool-neutral, dark-ink and emerald theme. Portrait imagery is the dominant visual, followed by client/title, three optional metrics and View reel. Four cards fit desktop, two tablet, and mobile shows a swipeable row. Keep keyboard links, descriptive image text, visible focus and reduced-motion behavior. Empty metrics are omitted rather than replaced by zero.

Existing local uncommitted case-study work is preserved. The earlier design-only contract does not apply to this separately requested functional addition.
