## Purpose

Enable authorized administrators to compose, illustrate, preview, and publish case studies without writing code or losing existing story content.

## ADDED Requirements

### Requirement: Structured story editor
Admins SHALL create and edit story identity, slug, category, summary, optional campaign context, cover/logo, metrics, ordered sections, and an optional closing call to action. Metrics SHALL use separate value/label fields. Sections SHALL support add, edit, remove, and keyboard-operable move-up/move-down actions. Removing or reordering sections SHALL NOT change the media attached to other sections.

#### Scenario: Compose a reference-style story
- **WHEN** an admin adds a challenge narrative, campaign image/text section, before/after section, evidence gallery, and quote
- **THEN** each section provides controls appropriate to its content type
- **AND** saving and reopening preserves text formatting, image attachments, metrics, and order

#### Scenario: Reorder while uploading
- **WHEN** a section is moved while its image upload is pending
- **THEN** the completed upload remains attached to that section rather than another section at its former position

### Requirement: Image upload lifecycle
Admins SHALL upload JPG, PNG, or WEBP images up to 5 MiB each for covers, logos, section evidence, galleries, and quote portraits. Uploads SHALL show progress or pending state, preview, replacement, and removal controls. Evidence/cover images SHALL have alt text before publication; captions SHALL be optional. Failed or invalid uploads SHALL retain the previous image and unsaved editor content. Removing an image SHALL detach it from the story without deleting shared storage assets.

#### Scenario: Replace and remove an image
- **WHEN** an admin successfully uploads a replacement and saves
- **THEN** the replacement and its metadata appear after reopening and in the published page
- **AND** removing it followed by saving detaches that image only

#### Scenario: Upload failure
- **WHEN** the selected file is unsupported, larger than 5 MiB, or the media service fails
- **THEN** an actionable error is shown next to the affected field
- **AND** the current image and other edits remain intact and the story is not falsely reported as saved

### Requirement: Drafts and publishing validation
New stories SHALL default to draft. Draft saves SHALL require a valid unique slug and title but allow incomplete editorial content. Publishing SHALL require category, headline, summary, at least one complete metric, at least one complete story section, and valid populated optional fields. The editor SHALL retain unsaved content on validation or persistence failure and identify fields needing correction. A pending upload SHALL prevent save/publish until it completes or is removed.

#### Scenario: Incomplete draft
- **WHEN** an admin supplies a unique slug and title with unfinished sections and saves as draft
- **THEN** the draft is persisted and remains unavailable on all public routes

#### Scenario: Publish validation fails
- **WHEN** an admin publishes with a partial metric, incomplete section, missing evidence alt text, or invalid destination
- **THEN** publishing is rejected, existing saved content/status is unchanged, and the editor retains the attempted edits with field-specific errors

#### Scenario: Duplicate slug
- **WHEN** an admin saves a slug already belonging to another case study or reserved seed
- **THEN** the save fails without overwriting either story

### Requirement: Authenticated preview and explicit save behavior
Admins SHALL preview the current unsaved content with the same rendering rules as the public page, including narrow and wide layouts. Preview SHALL NOT persist or publish changes. The editor SHALL distinguish unsaved changes from saved content and warn before abandoning unsaved edits. Saving an already published story SHALL update its public content; creating a private revision history is outside this capability.

#### Scenario: Preview a draft
- **WHEN** an admin previews unsaved text and a successfully uploaded image
- **THEN** the preview reflects those edits without making the story public or changing saved data

#### Scenario: Save published edits
- **WHEN** an admin successfully saves changes while status remains published
- **THEN** public surfaces show the edited content and the editor confirms completion

### Requirement: Authorization and input limits
All story mutations, media uploads, and draft previews SHALL require existing admin authorization. Validation SHALL run on the server as well as in the editor. Stories SHALL allow at most 30 sections, 8 metrics, 8 images per gallery, 24 characters per metric value, and 80 per metric label. Unsupported section types, oversized documents, and executable link or rich-text content SHALL be rejected without altering saved stories.

#### Scenario: Unauthorized request
- **WHEN** an unauthenticated caller requests a mutation, upload, or draft preview
- **THEN** access is denied before database changes, media uploads, or draft content disclosure

#### Scenario: Invalid payload
- **WHEN** a caller submits an unsupported section, excessive items, or unsafe rich-text/link content directly to the API
- **THEN** the API returns a validation error and leaves saved content unchanged
