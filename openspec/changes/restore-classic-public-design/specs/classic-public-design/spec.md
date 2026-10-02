## Purpose

Restore Lumivale's established public visual identity while retaining the newer landscape Results and featured Case Studies compositions and current content management behavior.

## ADDED Requirements

### Requirement: Design-only change preserves current workings
The change SHALL alter presentation only. Current application behavior SHALL be the baseline for every interaction and workflow, including navigation, links, FAQ state and grouping, carousels, pagination, scrolling, animation triggers, media controls, CMS editing, publication, fallback handling, APIs, persistence, authentication, and trusted access. The historical commit SHALL supply visual reference only. No functionality or link SHALL be added, removed, or reverted to historical behavior to achieve a visual match.

#### Scenario: Compare the same user journey before and after
- **WHEN** a visitor or administrator performs the same actions with the same data and access state before and after the restyling
- **THEN** the same content, state transitions, destinations, outputs, and access decisions result
- **AND** only layout, typography, colors, surfaces, and visual decoration differ

### Requirement: Historical visual reference and scope
The shared public navigation and footers, homepage Services, Testimonials, and FAQs, and individual public service pages SHALL use the presentation at commit `e9cad74a7b0b46a588752beb9362d4b8a038587f` as their design reference. In-scope surfaces SHALL use Poppins, emerald `#14c983`, soft emerald `#7ee6b7`, ink `#031410`, deep green `#010807`, white, and cool neutral backgrounds and dividers from that reference. Results and Case Studies SHALL retain the supplied screenshot compositions with this theme. The homepage hero, other route bodies excluding the pricing listing, Blogs listing, and About Us, and admin interface SHALL retain their current presentation and behavior. Homepage section order and anchors SHALL remain intact.

#### Scenario: Review the restored homepage
- **WHEN** the homepage is compared with the historical reference at the same viewport and equivalent content
- **THEN** navigation, Services, Testimonials, FAQs, and the closing CTA/footer reproduce the reference's typography, layout, surfaces, spacing, and control shapes
- **AND** the two retained sections use the historical theme with their current compositions
- **AND** the hero and client marquee retain their existing appearance and behavior

### Requirement: Public navigation restoration
The public navbar SHALL restore the historical circular default brand mark, Poppins wordmark, emerald pill CTA, transparent dark-hero state, scrolled dark glass state, and white light-section state. Current editable branding and CTA content, links, section navigation, active states, mobile navigation, and trusted-only pricing visibility SHALL remain functional. A saved custom logo SHALL remain visible in place of the default mark. Responsive breakpoints SHALL accommodate the current link inventory without overlap.

#### Scenario: Scroll and navigate
- **WHEN** a visitor moves between dark and light sections or navigates between public routes
- **THEN** the navbar uses the appropriate historical surface and readable foreground immediately
- **AND** homepage anchor links reach the intended sections without hiding their headings behind the navbar

#### Scenario: Mobile and trusted navigation
- **WHEN** a visitor opens the mobile menu
- **THEN** every currently available link and CTA is readable and operable, and the menu closes on selection or Escape
- **AND** Pricing is available only when the existing trusted-access check permits it

### Requirement: Every public footer uses the historical composition
Every route that currently renders a public footer SHALL display exactly one footer using the historical deep-green background, three desktop columns for brand, navigation, and contact, circular emerald LinkedIn control, and divided bottom utility row. Existing closing CTAs SHALL use the historical centered prompt, heading, and emerald pill button. Current editable footer fields, email link, destinations, and current copyright content SHALL remain represented. The current footer link inventory SHALL remain unchanged; the historical Admin login utility link SHALL NOT be added. Mobile layouts SHALL stack without clipping.

#### Scenario: Homepage and inner-page footers
- **WHEN** a visitor opens the homepage and then an inner public page
- **THEN** each has one footer in the restored style and no duplicated closing CTA
- **AND** brand, tagline, navigation, contact heading, email, LinkedIn, site label, bottom text, and closing CTA reflect current configured content
- **AND** no footer link is added or removed and every destination remains unchanged

### Requirement: Services and Testimonials restore their old layouts
Homepage Services SHALL restore the white section, centered heading and description, and responsive bordered card grid with emerald icon tiles and service links from the reference. Testimonials SHALL restore the dark gradient and spotlight, centered heading, rounded translucent cards, and historical pagination controls. All current service records, testimonial author images, full quotes, and applicable fallback media SHALL remain available under existing publication and pagination rules.

#### Scenario: Browse services and feedback
- **WHEN** published services and text testimonials are available
- **THEN** Services presents cards in one, two, or three columns according to available width
- **AND** Testimonials presents the existing four-item pages with working previous/next wraparound controls and correctly associated author media
- **AND** each service retains its current detail destination

#### Scenario: Testimonial fallback
- **WHEN** no published text testimonials are available
- **THEN** the existing labeled video and text placeholder presentation remains available in the restored dark theme
- **AND** placeholder content is not represented as verified client feedback

### Requirement: Homepage FAQ restoration
Homepage FAQs SHALL restore the white split layout, emerald disclosure accents, large heading, muted description, and ruled question rows from the reference. The current heading and description inventory SHALL be preserved rather than reintroducing historical-only copy. The first displayed question SHALL initially be open, questions SHALL retain the current single-open group behavior, and the plus indicator SHALL reflect open state. Existing FAQ content, order, displayed-count limit, and data fallbacks SHALL remain intact.

#### Scenario: Switch the open answer
- **WHEN** a visitor opens another homepage question while the first is open
- **THEN** the newly selected answer opens and the first answer closes, exactly as in the current implementation
- **AND** keyboard activation and visible focus are available on each question

### Requirement: Individual public services and FAQs use the historical theme
Individual public service pages SHALL restore the reference's white introductory section, constrained content width, Poppins title hierarchy, emerald return link, muted description, and cool neutral supporting surfaces. The current published-service navigation and service-specific FAQs SHALL remain available, with white ruled disclosures and emerald accents matching the historical homepage FAQ style. The historical Highlights section SHALL NOT replace service FAQs. All service FAQs SHALL initially be collapsed and SHALL retain their current single-open group behavior. Current saved order, multiline answers, safe text rendering, and empty-state content and links SHALL be preserved.

#### Scenario: Read a service and its questions
- **WHEN** a visitor opens a published service page
- **THEN** its current title, public description, service navigation, active-page indication, and saved questions appear in the historical theme
- **AND** opening another question closes the previously open answer, exactly as in the current implementation
- **AND** returning to Services reaches the homepage section

#### Scenario: Missing data and protected fields
- **WHEN** a service has no FAQs, or its slug is missing or unpublished
- **THEN** the existing FAQ empty state or not-found behavior applies respectively
- **AND** public service responses never include private pricing, private copy, or private example media
- **AND** trusted pricing detail pages retain their current body presentation and access requirements

### Requirement: Retained landscape Results composition
Results SHALL retain Image #1's centered eyebrow and heading above one rounded mountain-landscape panel containing four individually rounded glass metric cards, arranged in one desktop row and two columns on narrow screens. Its outer surface SHALL use the historical cool neutral theme, heading SHALL use Poppins and historical ink, and accents and glass overlays SHALL harmonize with the historical emerald/deep-green palette. All four administrator-controlled value/label pairs and existing count/reduced-motion behavior SHALL remain intact. The landscape and glass-card hierarchy SHALL NOT be replaced with the old commit's Results layout.

#### Scenario: Updated metrics on desktop and mobile
- **WHEN** an administrator saves new Results text and the visitor reloads the homepage
- **THEN** the current text appears in the retained landscape composition at desktop and mobile sizes
- **AND** all values and labels are readable, including long and nonnumeric values
- **AND** screenshot figures are not hard-coded over saved content

### Requirement: Retained featured Case Studies carousel
Case Studies SHALL retain Image #2's left-aligned section introduction, large split feature with cover image on the left and story information on the right, category, headline, full summary, metrics, full-story link, and centered previous/position/next controls. The section SHALL use Poppins, historical ink and muted text, white/cool neutral surfaces, and emerald accents in place of chalk, sage, and daylight colors. On mobile, image and copy SHALL stack and metrics SHALL wrap. The carousel SHALL preserve all published slides, ordering, keyboard navigation, touch/scroll behavior, and links to current full stories.

#### Scenario: Browse published stories
- **WHEN** a visitor changes carousel slides
- **THEN** the selected story and position indicator update while its complete content and detail link remain available in the retained split composition
- **AND** the displayed cover and metrics belong to that published story rather than the example shown in the screenshot

#### Scenario: Empty and incomplete case studies
- **WHEN** there are no published stories
- **THEN** the homepage omits the section as it currently does
- **WHEN** a story lacks a safe usable cover, or only one story exists
- **THEN** the existing safe media fallback is shown and single-story navigation remains disabled

### Requirement: Content and functional compatibility
Restoration SHALL preserve current CMS values, complete visible content, media associations, publication rules, data-failure fallbacks, link inventory and destinations, interaction behavior, and authorization boundaries without functional exceptions. It SHALL NOT restore historical hard-coded content, overwrite stored records, expose unpublished or private content, or change admin and trusted-client access.

#### Scenario: CMS changes and unavailable data
- **WHEN** saved site content changes or an existing data source fails
- **THEN** the restored presentation displays the updated values or current safe fallback behavior respectively
- **AND** layout differences do not suppress content or introduce new failures

#### Scenario: Public and administrative boundaries
- **WHEN** a public visitor browses the restored site or directly visits the existing admin login route
- **THEN** private pricing remains protected and administrative actions still require authorization
- **AND** admin routes do not acquire public navigation or footers

### Requirement: Responsive and accessible visual acceptance
In-scope layouts SHALL remain readable without horizontal page overflow at 360px, 390px, 768px, and 1440px widths. Text SHALL meet WCAG AA contrast, controls SHALL be keyboard operable with visible focus, meaningful media SHALL preserve alt text, and reduced-motion preferences SHALL keep all content available without decorative motion. Changes in font metrics SHALL allow content reflow rather than clipping or truncation.

#### Scenario: Review at responsive widths
- **WHEN** representative content and long-content fixtures are viewed at the required widths
- **THEN** navigation, cards, metrics, carousel, questions, and footer actions remain fully reachable and readable
- **AND** Results and Case Studies remain recognizably the supplied compositions in the historical theme

#### Scenario: Reduced motion and keyboard use
- **WHEN** reduced motion is enabled and a visitor uses only the keyboard
- **THEN** every section remains visible and all navigation, carousel, FAQ, and footer controls remain usable

### Requirement: Additional listing and About page styling
The pricing listing SHALL restore the compact introduction, rounded white rate table, bordered service links, and responsive rate alignment from `e9cad74`. Blogs and About Us SHALL retain their current layouts and implementation with Poppins, cool neutrals, white, ink, and emerald styling. Current data, copy, media, destinations, carousel behavior, fallbacks, and access checks SHALL remain unchanged. Pricing detail, blog article, and case-study listing bodies SHALL remain unchanged.

#### Scenario: Review the additional pages
- **WHEN** an authorized visitor opens Pricing, or a visitor opens Blogs or About Us
- **THEN** the requested historical styling appears while all current content and destinations remain available
- **AND** Blogs retains its feature and carousel, and About retains its founder portraits and section structure
- **AND** an unauthorized pricing request still returns not-found
