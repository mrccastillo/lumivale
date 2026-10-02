## 1. Shared navigation and footer

- [x] 1.1 Restore historical navbar presentation in `site-navbar-client.tsx` and its CSS module while retaining current CMS branding, links, anchor integration, trusted Pricing, and mobile behavior; update relevant assertions in `tests/site-navbar.test.tsx` and verify the focused suite plus dark/light/scrolled browser states.
- [x] 1.2 Restore the centered closing CTA and historical three-column footer through `HomepageFooter`/`SiteFooter`, retaining all editable fields and the exact current link inventory without adding historical Admin login; verify saved custom values, unchanged destinations, and one footer/CTA per public route with footer/content tests.
- [x] 1.3 Verify shell routing with existing homepage-concept and admin-shell tests: public navigation/footer remain present through public route transitions, homepage footer is not duplicated, and admin routes omit public chrome.

## 2. Homepage restoration and retained sections

- [x] 2.1 Restore Services' centered introduction and bordered responsive card grid in `app/page.tsx`; verify every published service summary and destination with existing homepage tests and compare desktop/mobile layouts to `e9cad74`.
- [x] 2.2 Restore dark Testimonials, spotlight, glass cards, and historical controls by removing conflicting light concept styles; run homepage and testimonial-media tests to verify four-item pagination, wraparound, author images, and the existing labeled fallback grids.
- [x] 2.3 Restore the white split FAQ layout while preserving first-open state, exclusive disclosure grouping, and current data/count rules; run focused homepage coverage and verify that selecting another question closes the previous answer as it does before the restyling.
- [x] 2.4 Retheme Results to historical Poppins and emerald/deep-green/cool-neutral colors while preserving the mountain panel and four glass cards; run result-count and homepage content tests and compare the desktop row/mobile 2x2 with `references/results-layout.png`.
- [x] 2.5 Retheme the current Case Studies feature and carousel without replacing their structure or content; run case-study-carousel and homepage-concept tests and compare full image/copy layout, metrics, arrows, and index with `references/case-studies-layout.png`.
- [x] 2.6 Narrow the remaining homepage concept styles so restored sections cannot inherit Manrope/DM Sans, sage backgrounds, or light testimonial overrides; verify computed typography/colors and unchanged hero appearance in browser captures.

## 3. Individual public service pages

- [x] 3.1 Add isolated public-service styles and apply the reference's white hero, constrained width, Poppins hierarchy, emerald return link, and cool neutral supporting area in `app/services/[slug]/page.tsx`; verify current public description/navigation with `tests/services.test.tsx` and `tests/service-faq-pages.test.tsx`, and compare service-page captures to `e9cad74`.
- [x] 3.2 Apply historical FAQ styling to service-specific questions while preserving all initially collapsed and current exclusive grouping; run focused service FAQ coverage and verify the same single-open behavior, order, multiline safe text, empty state, and not-found behavior as before restyling.
- [x] 3.3 Verify that public service rendering contains no private fields and that isolated styles leave pricing and example-platform bodies unchanged; run service FAQ, pricing-service-page, and service-example-platform suites and compare representative public/private route captures.

## 4. Integration and review evidence

- [x] 4.1 Review all changed surfaces at 360px, 390px, 768px, and 1440px using ordinary and long CMS content; save screenshots and a concise verification record showing historical restored sections, both retained compositions, service details, and representative inner-page footers without overflow.
- [x] 4.2 Compare the same before/after user journeys for keyboard navigation, mobile menu Escape/focus, anchor navigation, single-open FAQs, carousel pagination/touch scrolling, media, CMS edits, fallbacks, and access checks; verify identical behavior and link inventory, along with contrast and reduced motion, and record results.
- [x] 4.3 Run `npm test`, `npm run lint`, and `npm run build`; record results and any environment blockers in the change's verification notes. Confirm the final diff changes only intended presentation and visual assertions, with no changes to functionality, interactions, workflows, persistence, APIs, authorization, or unrelated route bodies.

## 5. Additional route styling requested by the user

- [x] 5.1 Restore the pricing listing table presentation from `e9cad74`, preserving service data, destinations, and trusted access.
- [x] 5.2 Retheme Blogs and About Us to the historical palette and Poppins while retaining current layouts and interactions; isolate unrelated route bodies.
- [x] 5.3 Verify content and destination parity, responsive widths, relevant behavior suites, lint and production build; record evidence.

## 6. Latest client-card reference

- [x] 6.1 Replace the homepage split carousel with a centered introduction and responsive client-card collection in the existing classic theme; preserve published content, safe media and story destinations.
- [x] 6.2 Verify grid rendering, logo safety/fallback, complete metrics, mobile reflow, keyboard links, reduced motion, focused tests, lint and production build.

## 7. Uniform typography

- [x] 7.1 Apply shared Poppins heading/Inter body typography across public and admin surfaces, using Results as the heading reference.
- [x] 7.2 Verify computed fonts and responsive wrapping on representative routes and complete the production build.

- [x] 7.3 Standardize type sizes across public/admin routes and verify that all six homepage section headings match Results at desktop and mobile widths.
