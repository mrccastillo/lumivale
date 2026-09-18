## Purpose

Let admins organize each service's examples into named platforms and let trusted visitors browse examples by platform without losing existing media or content.

## ADDED Requirements

### Requirement: Per-service platform management
Admins SHALL be able to add, rename, reorder, and remove empty example platforms while editing a service. Platform names SHALL be free text, trimmed, non-empty, at most 60 characters, and unique within that service ignoring case. Platform identity SHALL survive renaming and reordering. Editing one service's platforms SHALL NOT change another service. Changes SHALL take effect when the service is saved.

#### Scenario: Add and rename platforms
- **WHEN** an admin creates Reddit, LinkedIn, and TikTok platforms, saves, and reopens the service
- **THEN** all three platforms remain in the saved order
- **WHEN** the admin renames LinkedIn to LinkedIn Outreach and saves
- **THEN** its examples stay associated with the renamed platform

#### Scenario: Invalid names
- **WHEN** an admin submits a blank name, a name exceeding 60 characters, or a duplicate such as " reddit " alongside "Reddit"
- **THEN** the save reports a validation error without overwriting saved content

#### Scenario: Service isolation
- **WHEN** an admin edits platforms on Comment Campaign
- **THEN** the platforms and examples of other services are unchanged

### Requirement: Examples belong to a platform
Admins SHALL be able to add and edit examples inside a selected platform and move examples to another platform in the same service. Every saved example SHALL belong to exactly one valid platform. Existing per-card tags SHALL remain independent descriptive labels. Moving examples SHALL preserve titles, descriptions, tags, link URLs, cover choices, photos, videos, and pending media uploads.

#### Scenario: Add examples within a platform
- **WHEN** an admin selects Reddit and adds a photo example and a link example
- **THEN** both examples are saved under Reddit and are visible there on subsequent edits

#### Scenario: Move an example
- **WHEN** an admin moves a covered link example from Reddit to LinkedIn and saves
- **THEN** it appears once under LinkedIn with the same cover, destination, and other content
- **AND** it no longer appears under Reddit

#### Scenario: Reject dangling or foreign assignments
- **WHEN** a save assigns an example to a platform absent from that service
- **THEN** the save fails with a validation error and saved content remains unchanged

### Requirement: Non-destructive platform removal
The system SHALL permit removal of empty platforms and SHALL prevent removal of platforms containing examples until those examples are moved or individually removed. Removing a platform SHALL NOT silently delete examples or uploaded media.

#### Scenario: Remove an occupied platform
- **WHEN** an admin attempts to remove a platform containing examples
- **THEN** the editor explains that its examples must first be moved or removed
- **AND** submitting a dangling association directly is also rejected

#### Scenario: Remove an empty platform
- **WHEN** an admin removes an empty platform and saves
- **THEN** it is no longer present in that service's platform list

### Requirement: Dynamic platform browsing
The Examples section on `/pricing/[slug]` SHALL replace the combined legacy platform badge with selectable tabs derived from that service's saved platforms with examples, in saved platform order. The first visible platform SHALL be selected initially. Selecting a platform SHALL display only its examples, in their saved order, without navigating away. Empty platforms SHALL remain editable in admin but SHALL be hidden from visitors. If no platform has examples, the section SHALL display "No examples available yet." without empty tabs.

#### Scenario: Select a platform
- **WHEN** a service has examples under Reddit and TikTok and a visitor selects TikTok
- **THEN** TikTok is visibly selected and only TikTok examples are displayed
- **AND** Reddit media is no longer mounted or playing

#### Scenario: Single populated platform
- **WHEN** only one platform contains examples
- **THEN** its label and examples are displayed with that platform selected

#### Scenario: Empty platform or service
- **WHEN** an admin creates an empty LinkedIn platform
- **THEN** LinkedIn does not appear in the visitor tabs until it has an example
- **WHEN** the service has no examples
- **THEN** the visitor sees the empty-state message instead of empty tabs

### Requirement: Accessible platform controls
Visitor tabs SHALL expose selected state and associated content to assistive technology, support keyboard navigation and activation, and provide visible focus. Platform controls SHALL remain usable without horizontal page overflow at 320 CSS pixels, including long names and many platforms.

#### Scenario: Keyboard browsing
- **WHEN** a visitor focuses the platform tabs and uses Left/Right or Home/End, then Enter or Space
- **THEN** focus moves predictably and activation displays the selected platform's examples

### Requirement: Legacy examples remain available
Existing services and default services without explicit platform associations SHALL remain readable and editable. A legacy combined label SHALL be split on the pipe separator into trimmed, case-insensitively unique platforms in label order. If there is one platform, all legacy examples SHALL belong to it. If there are multiple platforms, an example whose tag exactly matches one platform name ignoring case SHALL be assigned there; other examples SHALL be preserved under General. A blank legacy label SHALL also place examples under General. General SHALL be reused if already present. Saving migrated content SHALL preserve all examples and media.

#### Scenario: Ambiguous legacy group
- **WHEN** a legacy service has "Reddit | LinkedIn" with example tags Reddit, GEO, and UGC
- **THEN** the Reddit example is associated with Reddit and the other two remain available under General
- **AND** the admin can move the General examples to newly created platforms
- **AND** the empty LinkedIn platform stays available in admin

#### Scenario: Existing single platform
- **WHEN** a legacy service has one platform and multiple example cards
- **THEN** every example stays available under that platform without requiring manual re-entry

### Requirement: Complete persistence and media compatibility
Saving SHALL preserve all submitted valid examples across platforms, including examples beyond the previous first-six cutoff. Platform movement, platform reordering, and card removal SHALL NOT attach an image, custom cover, or video upload to a different example. Existing automatic embeds, generic link previews, custom covers, full-size photo links, and uploaded-video controls SHALL continue to behave as before within the selected group.

#### Scenario: More than six examples
- **WHEN** an admin saves eight examples spread across two platforms
- **THEN** all eight reappear in the correct platforms after reload, with their own media

#### Scenario: Upload after structural edits
- **WHEN** an admin selects files on multiple examples, moves an example to another platform, removes a different example, and saves
- **THEN** each retained example receives only its own selected files

### Requirement: Existing authorization remains enforced
Only authenticated admins SHALL change platforms or examples. Pricing detail content SHALL remain restricted to trusted clients. Failed validation SHALL NOT modify persisted service data.

#### Scenario: Unauthorized access
- **WHEN** an unauthenticated caller attempts to save platforms or an untrusted visitor requests pricing detail content
- **THEN** existing admin or trusted-client access restrictions apply before content is changed or private examples are rendered
