## Outcome

Implemented the design-only restoration on 2026-10-03. Navbar, public footers, homepage Services/Testimonials/FAQs, and individual public services use the historical Poppins/emerald/white/deep-green treatment. Results retains its landscape and four glass cards; Case Studies retains its split feature and carousel. Existing copy takes precedence over historical-only section labels. The LinkedIn link keeps its accessible name and destination with the historical circular visual treatment.

The production diff changes scoped CSS, the public service stylesheet import, the testimonial navbar surface marker, and footer layout. No navigation handlers, disclosure grouping, carousel logic, repositories, APIs, persistence, admin implementation, or authorization code changed. The hero and shared pricing stylesheet are unchanged.

## Browser verification

Chromium checked the production build on a temporary local port against a before-change capture from the current development site. Evidence is in [verification/](verification/), including `browser-checks.json`, `pricing-checks.json`, both supplied references, historical-commit captures, and before/after screenshots.

- At 360, 390, 768, and 1440px: no horizontal page overflow on home or public service pages; Results is 2x2 on phones and four columns at tablet/desktop widths. Poppins is applied in the restored areas.
- Long heading, service description, and FAQ text fixtures reflow without page overflow. These fixtures were temporary browser DOM changes, not CMS writes.
- All original homepage link destinations and content remain available; FAQ initial state and the transition to another open question match the baseline.
- Case-study next/previous/keyboard navigation and counter, testimonial four-item pagination/wraparound, mobile menu selection/Escape/focus return, and service FAQ keyboard toggles passed.
- Normal-motion hero anchor navigation and navbar transparent-dark, white/light, and scrolled-dark states passed. Reduced-motion content remains visible. Zero browser page errors in the production run.
- Homepage and About/Blogs/Case Studies/service pages render one public footer and closing CTA. The admin login shell has no public navbar/footer; unauthenticated pricing remains protected.
- An ephemeral local trusted session verified the pricing body against a clean pre-change checkout: complete body text, links, and computed typography/colors/sizes match. Trusted Pricing navigation remains available and fits at 1100px. No session credentials were saved in evidence.
- Compared rendered historical sections with `e9cad74`; current content and interactions were retained where the historical tree differs. Contrast uses darker emerald for small text on white, white on dark glass, and readable muted text on dark testimonials.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run build` | Passed, including TypeScript and all 46 generated static pages |
| Full suite, `npm test -- --maxWorkers=2` | 340 passed, 4 pre-existing failures; no unhandled errors in the final run |
| Final focused run after adding regression assertions | 27 passed across homepage, footer/content, and service FAQ suites |
| Other relevant suites in the full run | Navbar, footer, case-study carousel, result counts, testimonial media, CMS content, admin shell, pricing, and service examples passed |
| ESLint on every changed TypeScript/TSX file | Passed |
| `npm run lint` | One pre-existing error in `tests/case-study-carousel.test.tsx:26` (`no-html-link-for-pages`) |
| `git diff --check` | Passed |

The full-suite failures were independently reproduced in a clean checkout of pre-change `04fe71b`:

1. `tests/admin-pages.test.tsx`: missing App Router context for the case-study ordering control.
2. `tests/admin-trusted-clients-dashboard.test.tsx`: stale expectation for `Total trusted clients`.
3. `tests/admin-users-dashboard.test.tsx`: stale expectation for `Total admins`.
4. `tests/case-studies.test.ts`: stale `pt-28` class expectation on the case-study detail header.

The identical lint error also reproduces in that checkout. These unrelated issues were not changed. Homepage test setup was corrected to supply jsdom's missing `matchMedia`, isolate asynchronous scroll-pinning setup from content tests, and reference the current default Results copy. Production scroll pinning was verified in the browser. Regression assertions now explicitly protect the current FAQ groups and exact footer link inventory.

## Delivery

All implementation checklist items are complete. No deployment, data write, email, or OpenSpec archive was performed. The existing development server remains the user's preview; temporary review servers are stopped after verification.


## Follow-up: pricing listing, Blogs, and About Us

The user subsequently extended the design-only scope to these three route bodies. Earlier notes about pricing being unchanged refer to the initial scope; pricing detail bodies remain unchanged.

- Restored the pricing listing's compact introduction, white rounded rate table, bordered View more controls, historical width, typography and spacing from `e9cad74`. Preserved trusted-access checks, published service data, rates, copy and destinations.
- Retained Blogs' featured story, image treatment and carousel layout, applying a route-scoped Poppins/white/cool-neutral/emerald theme. Empty and unavailable states use the same theme and existing text.
- Rethemed About solely through its existing stylesheet. Founder grid, CMS content, portrait crops, grayscale hover, approach section and destinations remain intact.
- Before/after browser comparisons confirm every heading, paragraph and link destination is unchanged on all three routes. Production captures at 360, 390, 768 and 1440px show no horizontal document overflow. See `verification/follow-up-*.png` and before/after JSON inventories.
- Production browser checks passed for carousel next button and keyboard navigation, unauthorized pricing 404, and zero page errors. Trusted listing capture used a temporary local browser session, without database writes or emails.
- Focused suites: 5 files, 12 tests passed (pricing listing/detail, Blogs, About, blog carousel).
- Full suite: 340 passed, same four pre-existing failures documented above; no new failures.
- Full lint: same pre-existing case-study-carousel test anchor error. Changed TSX files pass targeted ESLint.
- Production build and OpenSpec strict validation passed. No data modules, authentication, API handlers or interaction logic changed.
