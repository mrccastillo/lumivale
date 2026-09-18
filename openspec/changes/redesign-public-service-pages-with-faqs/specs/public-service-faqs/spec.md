## Purpose

Provide consistent public service details with a dark hero and accessible service-specific FAQs that admins can maintain independently for each service.

## ADDED Requirements

### Requirement: Public service layout
Published service pages at `/services/[slug]` SHALL use the pricing-detail reference's dark green gradient hero, service navigation, active service pill, Home link, title hierarchy, and spacing. The hero SHALL display the public service description in a balanced text-only layout without a pricing panel or an empty reserved price column. A white section headed FAQS SHALL follow the hero in place of the existing Highlights section. Stored highlights SHALL remain intact for other uses.

#### Scenario: View a public service
- **WHEN** a visitor without a magic-link session opens a published service
- **THEN** the redesigned hero displays that service's title and public description, followed by FAQS
- **AND** the old Highlights detail section and pricing panel are absent

### Requirement: Public service navigation
The hero SHALL list only published services in their configured order, link each item to `/services/[slug]`, and identify the active service visually and with accessible current-page semantics. Home SHALL link to `/#services`. Unknown and unpublished service routes SHALL retain not-found behavior.

#### Scenario: Switch services
- **WHEN** a visitor selects another service in the hero navigation
- **THEN** its public service page opens and its navigation item becomes active
- **AND** no navigation item in this service strip leads to a trusted pricing route

#### Scenario: Unpublished service
- **WHEN** a service is unpublished
- **THEN** it disappears from the public service strip and its public detail URL returns not found

### Requirement: Per-service FAQ administration
Authenticated admins SHALL be able to add, edit, remove, and reorder FAQs within the service editor. Each FAQ SHALL have a stable identity, a question, and an answer. Changes SHALL publish with the service's existing save action and visibility status; unsaved edits SHALL NOT affect visitors. Service FAQs SHALL remain independent of homepage FAQs and of other services.

#### Scenario: Save and reopen
- **WHEN** an admin adds three FAQs, edits an answer, changes their order, and saves the service
- **THEN** reopening the editor and visiting its published detail page shows the saved questions, answers, and order

#### Scenario: Remove and isolate
- **WHEN** an admin removes an FAQ from one service and saves
- **THEN** that FAQ disappears from that service
- **AND** other services' FAQs and homepage FAQs remain unchanged

### Requirement: FAQ validation and safe display
Questions and answers SHALL be trimmed non-empty plain text. Duplicate or invalid FAQ identities, malformed lists, and incomplete entries SHALL be rejected before persistence with an actionable validation message. Failed saves SHALL leave stored content unchanged. Answers SHALL preserve line breaks and render supplied markup as text rather than executable HTML.

#### Scenario: Invalid FAQ submission
- **WHEN** an admin submits a blank question, whitespace-only answer, duplicate identity, or malformed FAQ list
- **THEN** the save fails with a validation error and existing service data remains unchanged

#### Scenario: Multiline answer with markup
- **WHEN** an answer contains multiple lines or HTML-like text
- **THEN** its line breaks remain readable and its markup cannot execute

### Requirement: Accessible FAQ browsing
The public page SHALL display only the current service's FAQs in saved order as expandable question-and-answer rows, initially collapsed. Each question SHALL be keyboard operable with visible focus and expose its expanded state. Multiple rows SHALL be allowed open. Long questions and answers SHALL wrap, and the layout SHALL remain usable at 320px, tablet, and desktop widths without horizontal page overflow.

#### Scenario: Keyboard expansion
- **WHEN** a visitor focuses a question and activates it using Enter or Space
- **THEN** its answer opens or closes and its accessible state reflects the change
- **AND** expanding another question does not force previously opened answers closed

### Requirement: Empty and legacy service compatibility
Services without stored FAQs SHALL behave as having an empty list. The FAQS section SHALL show "No FAQs available yet." when empty, without fabricated questions or homepage FAQ fallback. Explicitly saving an empty list SHALL remove all service FAQs. An older update request that omits the FAQ field SHALL preserve existing FAQs; a new service with an omitted field SHALL start empty.

#### Scenario: Existing service without FAQs
- **WHEN** a visitor opens a legacy service lacking FAQ data
- **THEN** its public page loads normally with the FAQ empty state
- **AND** the admin can add FAQs without migrating or re-entering other service content

#### Scenario: Omitted versus empty
- **WHEN** an older client updates a service without submitting FAQ data
- **THEN** its saved FAQs remain intact
- **WHEN** an admin explicitly saves an empty FAQ list
- **THEN** that service displays the empty state

### Requirement: Public and trusted content boundaries
The public service route SHALL remain accessible without authentication and SHALL NOT render or serialize private pricing fields, private hero copy, example platforms, examples, or private media URLs to public page clients. Trusted sessions SHALL NOT change the public route into a pricing page. Existing trusted pricing routes, examples, magic-link handling, and admin authorization SHALL retain their behavior.

#### Scenario: Private values stay private
- **WHEN** the same service has distinct public copy, private copy, prices, and example media
- **THEN** the public page response and any client-component props contain only the public fields needed for that page
- **AND** the trusted pricing page continues to require trusted access and display its existing pricing and examples

#### Scenario: Unauthorized write
- **WHEN** an unauthenticated caller submits service FAQs
- **THEN** existing admin access restrictions prevent any persistence
