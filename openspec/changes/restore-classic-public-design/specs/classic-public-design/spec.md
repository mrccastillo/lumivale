## Purpose

Restore Lumivale's established public visual identity while retaining the newer landscape Results and featured Case Studies compositions and current content management behavior.

## ADDED Requirements

### Requirement: Design-only change preserves current workings
The change SHALL alter presentation only. Current application behavior SHALL be the baseline for every interaction and workflow, including navigation, links, FAQ state and grouping, carousels, pagination, scrolling, animation triggers, media controls, CMS editing, publication, fallback handling, APIs, persistence, authentication, and trusted access. The historical commit SHALL supply visual reference only. No functionality or link SHALL be added, removed, or reverted to historical behavior to achieve a visual match, except the subsequently requested homepage Case Studies grid explicitly replaces slide navigation and adds a collection link.

#### Scenario: Compare the same user journey before and after
- **WHEN** a visitor or administrator performs the same actions with the same data and access state before and after the restyling
- **THEN** the same content, state transitions, destinations, outputs, and access decisions result
- **AND** only layout, typography, colors, surfaces, and visual decoration differ

### Requirement: Historical visual reference and scope
The shared public navigation and footers, homepage Services, Testimonials, and FAQs, and individual public service pages SHALL use the presentation at commit `e9cad74a7b0b46a588752beb9362d4b8a038587f` as their design reference. In-scope surfaces SHALL use Poppins, emerald `#14c983`, soft emerald `#7ee6b7`, ink `#031410`, deep green `#010807`, white, and cool neutral backgrounds and dividers from that reference. Results SHALL retain its supplied screenshot composition; Case Studies SHALL use the latest requested client-card reference with this theme. The homepage hero, other route bodies excluding the pricing listing, Blogs listing, and About Us, and admin interface SHALL retain their current presentation and behavior. Homepage section order and anchors SHALL remain intact.

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

### Requirement: Reference-inspired Case Studies grid
The homepage Case Studies section SHALL display a centered introduction and a responsive collection of white client cards on a cool-neutral framed surface. It SHALL use current Poppins, ink, emerald, and muted colors. Each compact card SHALL show the saved client name or story title, an industry/timeframe subtitle when available, category, all metrics, and its existing full-story destination. Full headlines and summaries SHALL remain on the linked detail pages. The complete card SHALL be a keyboard-accessible link. Safe saved logos SHALL be preferred, with a safe cover or initials fallback. The browser-style collection frame SHALL use three desktop columns, two tablet columns and one mobile column, with compact cards matching the latest supplied reference. The existing section entrance and restrained hover treatments SHALL respect reduced motion.

#### Scenario: Review published stories together
- **WHEN** a visitor reaches the homepage Case Studies section
- **THEN** all published stories appear in saved order without carousel pagination
- **AND** each full-story link retains its current destination
- **AND** a collection link opens `/case-studies`

#### Scenario: Missing or unsafe media and empty collections
- **WHEN** a story has no safe usable logo or cover
- **THEN** its initials appear without rendering unsafe image URLs
- **WHEN** there are no published stories
- **THEN** the homepage omits the section as before

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

### Requirement: Unified heading and body typography
Public and admin surfaces SHALL use Poppins for headings and Inter for body text, navigation, labels and controls. Shared font tokens SHALL replace Manrope and DM Sans overrides. Headings SHALL follow the Results reference with semibold weight and tight tracking, while retaining responsive size hierarchy. Large Results metrics SHALL retain the reference Poppins display; technical code and source editors MAY retain monospace.

#### Scenario: Typography across routes
- **WHEN** visitors navigate public routes or administrators open their workspace
- **THEN** headings use Poppins and ordinary text uses Inter consistently
- **AND** current content and controls remain usable without horizontal document overflow

### Requirement: Consistent type size hierarchy
Main public page and section headings SHALL use the Results reference scale of 57px at wide desktop widths, fluidly reducing to 32px on mobile. Supporting headings and card titles SHALL use shared 26-36px and 20-22px scales respectively. Body, small text and captions SHALL use shared 16-18px, 16px and 12px tokens. Route-specific mobile rules SHALL NOT shrink equivalent main headings differently.

#### Scenario: Compare homepage section headings
- **WHEN** Results, Case Studies, Services, Testimonials, FAQ and the closing CTA are compared at the same viewport
- **THEN** all six headings have the same computed font size and primary line height
- **AND** public and admin text reflows without document overflow
