## Purpose

Present detailed, evidence-led client stories and keep published case studies consistent across Lumivale's homepage, listing, and detail pages.

## ADDED Requirements

### Requirement: Editorial story presentation
The public detail page SHALL display the saved client identity, headline, summary, category, optional campaign context (industry, timeframe, channels, budget), optional cover/logo, key metrics, ordered story sections, and an optional closing call to action. It SHALL use Lumivale's visual language and omit unconfigured optional elements without empty wrappers.

#### Scenario: Complete story
- **WHEN** a visitor opens a published story containing metadata, metrics, media, and a call to action
- **THEN** those saved values appear with one page-level heading, readable content hierarchy, and working links
- **AND** section content follows the admin-defined order

#### Scenario: Optional content omitted
- **WHEN** a published story has no logo, budget, quote, or closing call to action
- **THEN** those elements are absent and the rest of the story remains readable

### Requirement: Flexible evidence and narrative sections
Stories SHALL support repeatable narrative sections with formatted text; image/text sections with left or right desktop placement; full-width images; galleries with captions; before/after comparisons; and attributed client quotes with optional portraits. Formatted text SHALL support paragraphs, subheadings, emphasis, ordered and unordered lists, and links. Screenshots SHALL retain their full aspect ratio without cropping away evidence.

#### Scenario: Image-supported campaign explanation
- **WHEN** a story contains left-image and right-image sections followed by a gallery
- **THEN** desktop readers see the requested placements and the gallery's saved image order
- **AND** mobile readers see text followed by its supporting image in a single column without horizontal overflow

#### Scenario: Comparison and client quote
- **WHEN** an admin provides before/after lists and a quote with attribution
- **THEN** visitors can distinguish each comparison side and identify the quoted person and their role
- **AND** comparison columns stack in before-then-after order on narrow screens

### Requirement: Accessible and safe public media
Evidence images SHALL expose saved alternative text and captions. Visitors SHALL be able to open a full-size evidence image using a keyboard-accessible control. Public content SHALL reject executable markup and unsafe destinations; external links opened in new tabs SHALL use safe relationship attributes. Nonessential motion SHALL respect reduced-motion preferences.

#### Scenario: Inspecting a screenshot
- **WHEN** a visitor activates an evidence image's full-size link
- **THEN** the complete image opens with a descriptive accessible link name
- **AND** its inline rendering reserves space and does not crop the screenshot

#### Scenario: Unsafe stored content
- **WHEN** stored content contains unsupported markup or an unsafe link
- **THEN** public rendering does not execute the markup or expose an executable destination

### Requirement: Consistent published discovery
The homepage and case-study index SHALL use published case-study records with existing sort-order behavior. Cards SHALL show the saved title/headline, summary, category, metrics, and optional cover image and link to the matching detail page. Case Studies SHALL remain before Services on the homepage. Successful saves, publication changes, and deletion SHALL refresh all affected public surfaces.

#### Scenario: Publication lifecycle
- **WHEN** an admin publishes a new story and subsequently updates its headline or cover
- **THEN** the homepage, index, and detail page show that published story and its latest saved content after each successful save
- **AND** unpublishing removes it from public discovery and makes its detail URL return not found

#### Scenario: No published stories
- **WHEN** no stories are published
- **THEN** the homepage omits the case-study block and the index shows an honest empty state
- **AND** no sample client results are invented to fill the space

### Requirement: Existing stories and visibility remain compatible
Existing case studies SHALL remain readable and editable without a bulk rewrite. Their challenge, solution, outcomes, metrics, status, and slugs SHALL be preserved when adapted to the new editor. Existing seeded stories SHALL retain their fixed-slug and unpublish-rather-than-delete behavior. A database outage SHALL NOT cause an unpublished seeded story to reappear publicly.

#### Scenario: First edit of an existing story
- **WHEN** an admin opens an old-format story and saves it in the new editor
- **THEN** its original narrative and results are present, its URL stays the same unless an allowed slug edit is explicitly made, and its publication state is retained

#### Scenario: Data cannot be loaded
- **WHEN** the public repository cannot determine current publication state
- **THEN** it does not serve built-in stories as a fallback that could bypass unpublication
- **AND** listing surfaces remain usable with an empty/unavailable state while detail pages return not found
