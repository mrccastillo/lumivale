## Purpose

Provide a cohesive concept-based homepage experience from Results through the footer while preserving the existing hero and the site's published, administrator-managed content.

## ADDED Requirements

### Requirement: Redesign begins at Results
The homepage SHALL retain the existing navbar and hero presentation and behavior, including its client marquee. The redesigned region SHALL begin at Results and retain the order Results, Case Studies when available, Services, Testimonials, FAQs, and closing CTA/footer. Existing section anchors SHALL continue to work.

#### Scenario: Visitor scrolls beyond the hero
- **WHEN** a visitor loads the homepage and scrolls beyond the client marquee
- **THEN** the hero retains its original typography, colors, spacing, animation, controls, and content
- **AND** Results is the first section using the new visual system
- **AND** Case Studies remains before Services

### Requirement: Every section retains its existing content
The redesign SHALL change presentation only. Every existing section SHALL preserve its headings, descriptions, body copy, labels, metric values, media, published items, links, destinations, and controls without removal, shortening, rewriting, or replacement with prototype content. Content SHALL remain available in its original section under the existing publication, pagination, disclosure, and fallback rules. Saving content in storage, moving it to another page, visually hiding it, truncating it, or removing its public rendering SHALL NOT satisfy preservation. No new content limits SHALL be introduced to fit the concept layout. Authorized future admin edits SHALL continue to update the corresponding public content.

#### Scenario: Compare content before and after restyling
- **WHEN** the same content fixtures are rendered before and after the redesign
- **THEN** every section contains the same text, media associations, item inventory, link labels and destinations, and controls
- **AND** only presentation and layout change
- **AND** existing paginated and collapsed content remains accessible through the same interactions

#### Scenario: Existing content exceeds the prototype layout
- **WHEN** a section has more items or longer text than the HTML concept
- **THEN** the layout expands or reflows to accommodate the full existing content
- **AND** no item or text is removed, shortened, hidden, or replaced to match the prototype

### Requirement: Concept visual system applies consistently
All sections in the redesigned region SHALL use the standalone concept's warm chalk and sage surfaces, forest text, daylight accent, Manrope display typography, DM Sans body typography, generous spacing, fine dividers, and restrained corners. Sections absent from the concept, including Testimonials, SHALL receive a compatible treatment rather than retaining the previous dark glass-card design.

#### Scenario: Compare the redesigned sections
- **WHEN** the visitor views Results through FAQs on desktop
- **THEN** section headings use the concept's editorial hierarchy and aligned content margins
- **AND** service and testimonial content use the same visual language as the case-study and FAQ sections
- **AND** the previous blue-gray surfaces, heavy shadows, and bright emerald pill controls are replaced within this region

### Requirement: Results remain administrator controlled
The redesigned Results section SHALL display the existing editable eyebrow, heading, and four value/label pairs. Placeholder values SHALL remain placeholders until an administrator supplies figures; the redesign SHALL NOT introduce fabricated metrics.

#### Scenario: Results are still placeholders
- **WHEN** the stored results contain placeholder values and labels
- **THEN** all four placeholders are displayed in the redesigned metric layout

#### Scenario: Administrator updates results
- **WHEN** an authorized administrator saves a heading, metric value, or label using Site Content
- **THEN** the next refreshed homepage displays that content without a code change

### Requirement: Published content and interactions are preserved
Case studies, services, testimonials, and FAQs SHALL continue using the existing publication rules and data sources. Case-study and service links SHALL retain their actual detail destinations. Testimonial photos/logos, video controls, pagination, and FAQ disclosure behavior SHALL remain usable. Prototype campaign illustrations and mock conversation text SHALL NOT replace real content.

#### Scenario: Published items are available
- **WHEN** published case studies, services, and testimonials exist
- **THEN** their titles, descriptions, media, and supported metrics appear in the new presentation
- **AND** unpublished records are not exposed
- **AND** selecting a case study or service navigates to its existing detail page

#### Scenario: Case studies or media are absent
- **WHEN** there are no published case studies or a displayed item has no usable image
- **THEN** the existing empty-case-study behavior is preserved
- **AND** missing images do not produce broken image elements or obstruct content and links

#### Scenario: Data loading fails
- **WHEN** an existing homepage data source fails
- **THEN** its current safe fallback behavior remains in effect
- **AND** the redesign does not introduce a new public-page failure or present mock content as verified client evidence

#### Scenario: Read more client feedback
- **WHEN** a visitor uses testimonial navigation or expands an FAQ
- **THEN** the requested testimonial page or answer is shown with accessible controls
- **AND** admin-supplied testimonial logos/photos retain their association with the correct person

### Requirement: Homepage footer matches the concept
The homepage closing CTA and footer SHALL match the HTML concept's closing composition: forest surface, large left-aligned heading with daylight emphasis, right-aligned daylight rectangular booking button, thin divider, compact email/link/copyright row, and oversized lowercase wordmark cropped at the bottom. On small screens the CTA and contact rows SHALL stack as in the reference. There SHALL be exactly one homepage closing CTA and one footer.

The visual match SHALL preserve production content editability: existing footer CTA fields supply the heading, prompt, button label and URL; existing email, LinkedIn URL, and footer brand name supply contact and brand content. Text differences caused by CMS values SHALL not be treated as visual-layout defects. The prototype-only brand-kit trigger SHALL be replaced by the existing accessible Admin login link in the same utility position. Every existing footer field SHALL remain visibly represented on the homepage, including the brand name, tagline, Home/About/Blogs labels and destinations, contact heading, email, LinkedIn link, site label, bottom text, and Admin login. These SHALL be arranged using the concept styling. Additional rows or space SHALL be allowed wherever needed to preserve all content; this requirement takes precedence over exact prototype geometry.

#### Scenario: Desktop footer visual comparison
- **WHEN** the homepage footer is compared with the HTML closing section at equal desktop width and matching text fixtures
- **THEN** its background, typefaces, heading scale, button geometry, row alignment, spacing, divider, and wordmark placement match the reference
- **AND** all existing footer content remains present in concept-styled rows, with additional height or reflow where needed

#### Scenario: Footer content is edited
- **WHEN** an authorized administrator changes any existing footer text or destination
- **THEN** the redesigned homepage reflects the updated values
- **AND** the CTA, Home, About, Blogs, email, LinkedIn, and Admin login links remain functional
- **AND** the redesigned public footer grants no additional admin permissions

### Requirement: Responsive and accessible presentation
The redesigned region SHALL reflow without horizontal page overflow at 360px, 390px, 768px, and 1440px widths. Controls SHALL be keyboard operable with visible focus, images SHALL preserve meaningful alternative text, text SHALL retain accessible contrast, and decorative motion SHALL respect reduced-motion preferences. The oversized footer wordmark SHALL not cause page overflow or replace accessible brand text.

#### Scenario: Small-screen visitor
- **WHEN** the homepage is viewed at 390px wide
- **THEN** metric pairs reflow into two columns, case-study/service layouts stack, and footer actions remain readable and reachable
- **AND** long content does not force horizontal scrolling

#### Scenario: Keyboard and reduced-motion visitor
- **WHEN** a visitor uses only the keyboard with reduced motion enabled
- **THEN** links, disclosures, testimonial navigation, and any service selector remain operable and visibly focused
- **AND** content remains visible without entrance or parallax motion

### Requirement: Other routes retain their current presentation
The concept redesign SHALL be limited to the homepage region below the hero. Other public routes SHALL retain their current footer and shared component appearance; admin routes SHALL retain their existing shell and controls.

#### Scenario: Visitor navigates away from home
- **WHEN** a visitor opens a service detail, case-study detail, about, blog, or pricing page
- **THEN** its body and footer retain their existing presentation and functionality
- **AND** returning to the homepage restores the concept footer without duplication
