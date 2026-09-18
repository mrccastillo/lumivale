## Purpose

Help trusted clients inspect service examples through social previews, readable website cards, and full-size photos while keeping pricing detail pages clear and focused.

## ADDED Requirements

### Requirement: Supported social previews
The system SHALL provide inline previews for recognized public YouTube video URLs (watch, shortened youtu.be, shorts, and embed forms), TikTok canonical video URLs, and Facebook public post or video permalink URLs supported by the provider's embed facility when no custom cover is selected. It SHALL identify the provider and retain an accessible link to the original destination even when an inline preview is displayed. Playback SHALL NOT autoplay.

#### Scenario: Recognized social video
- **WHEN** a trusted visitor views an example with a supported public YouTube, TikTok, or Facebook video URL and no custom cover
- **THEN** the example displays the corresponding inline preview, the saved title and summary, and an action to open the original in a new tab

#### Scenario: Facebook public post
- **WHEN** an example contains a supported public Facebook post permalink and no custom cover
- **THEN** the example uses a post preview and retains its original-destination action

#### Scenario: Provider content unavailable
- **WHEN** a provider blocks embedding, requires login, removes the post, or fails to load
- **THEN** the saved title, summary, hostname, and original-destination action remain usable independently of the embed
- **AND** the examples section and other cards continue to render

### Requirement: Generic website and unsupported social previews
The system SHALL accept valid HTTP or HTTPS example links for other social platforms and non-social websites and present a linked preview using the saved title, summary, and destination hostname. Unsupported URL shapes, including unresolved shortened TikTok or Facebook share URLs, SHALL receive the generic preview rather than an invented embed. The system SHALL NOT require remote metadata to render these cards.

#### Scenario: Non-social destination
- **WHEN** an example points to a ChatGPT share URL, company site, article, or other valid website
- **THEN** it displays a readable clickable preview with its saved content and hostname, opening the original URL in a new tab

#### Scenario: Unsupported social URL
- **WHEN** an example points to another social platform or an unsupported profile, share, or shortened URL
- **THEN** it displays a working generic preview without attempting an unsupported embed

#### Scenario: Unsafe or malformed URL
- **WHEN** an admin submits a malformed URL or a non-HTTP(S) destination
- **THEN** the save fails with a validation error and leaves the saved service unchanged
- **AND** an unsafe legacy destination encountered during rendering is not made clickable or embedded

### Requirement: Admin-selected cover photos
For each link example, the admin editor SHALL offer Automatic preview and Custom cover photo options for both social and non-social destinations. Admins SHALL be able to upload, preview, replace, and remove a cover and provide its alternative text. Custom cover selection SHALL require a saved or newly uploaded image and a valid destination URL. Saving SHALL retain the choice across editing sessions. Removing the cover or choosing Automatic preview SHALL restore automatic embed or generic preview rendering after save.

#### Scenario: Save a custom link cover
- **WHEN** an authorized admin selects Custom cover photo, supplies a valid image and destination, and saves the service
- **THEN** subsequent editing sessions show the saved cover
- **AND** the pricing example shows that cover instead of embedded or automatic preview media, while retaining its title, summary, and hostname
- **AND** clicking or keyboard-activating the cover opens the destination URL in a new tab with opener isolation
- **AND** no social embed is loaded for that example

#### Scenario: Replace or remove a cover
- **WHEN** an admin replaces the cover and saves
- **THEN** the example displays the replacement image
- **WHEN** the admin removes the cover or chooses Automatic preview and saves
- **THEN** the example resumes its supported social embed or generic website preview and retains its destination

#### Scenario: Cover validation or upload failure
- **WHEN** the admin selects Custom cover photo without an image, submits an unsupported image type or oversized image, or the image upload fails
- **THEN** the save reports an actionable error and does not overwrite the previously saved service
- **AND** cover uploads use the existing service-photo file-type and size limits

#### Scenario: Cover unavailable to a visitor
- **WHEN** a saved cover image cannot load
- **THEN** the example title, summary, and original-destination action remain usable

### Requirement: Clickable example images
The system SHALL make each standalone photo example an accessible link to its original full-size image, opening in a new tab while preserving the pricing page. Link-example cover photos SHALL open their destination URL instead. Existing image descriptions and captions SHALL remain visible where provided.

#### Scenario: Inspect a photo
- **WHEN** a visitor clicks an example photo or activates its focused link with Enter
- **THEN** the original image URL opens in a new tab
- **AND** the link name identifies the image and announces the new-tab action

### Requirement: Focused pricing detail layout
The system SHALL remove the hero's "Private detail" and platform badges, the entire "Example channel" placeholder panel, and the left-column textual pricing list from all `/pricing/[slug]` pages. It SHALL keep each configured rate visible once in the structured pricing cards and adjust the containing panel to avoid empty reserved placeholder space. The examples introduction SHALL use finished copy rather than placeholder instructions.

#### Scenario: Clean service detail
- **WHEN** a trusted visitor opens a service detail page
- **THEN** the title, description, service navigation, back link, pricing cards, and examples remain present
- **AND** the two hero badges, placeholder channel panel, and duplicate pricing paragraphs are absent
- **AND** the removed elements do not leave a fixed empty panel

### Requirement: Access and content compatibility
The system SHALL preserve trusted-client access checks and admin editing authorization. Existing example records SHALL work without re-entry or migration; photo examples and uploaded videos SHALL retain their existing media behavior except for the new photo-opening action. The existing service editor SHALL explain supported social previews and generic website fallback without requiring a provider selector.

#### Scenario: Untrusted visitor
- **WHEN** a visitor without trusted access requests a pricing detail page
- **THEN** the route returns its existing not-found behavior without rendering private examples or embeds

#### Scenario: Existing content
- **WHEN** an existing service with link examples, photos, and uploaded videos is loaded
- **THEN** its saved content renders using the appropriate preview, clickable photo, or video controls without a data migration

### Requirement: Responsive and accessible previews
The system SHALL keep preview media and long destinations within the card width on mobile and desktop, provide descriptive embed titles and visible keyboard focus, and protect all new-tab actions with opener isolation.

#### Scenario: Narrow screen and keyboard navigation
- **WHEN** a visitor views examples at 320 CSS pixels wide or navigates with a keyboard
- **THEN** cards do not introduce horizontal page overflow and all original-link and image actions remain discoverable and operable
