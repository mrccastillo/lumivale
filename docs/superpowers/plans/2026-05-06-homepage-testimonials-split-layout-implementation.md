# Homepage Testimonials Split Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the homepage testimonials section into a fixed desktop composition with four video testimonials on the first row and six compact text testimonials in a 3x2 grid, using type-specific placeholders when content is missing.

**Architecture:** Keep the existing Mongo-backed testimonial source and published sort behavior, but split published homepage testimonials into typed video and text arrays inside `app/page.tsx`. Render each group through dedicated layout blocks and variant card styling so videos read as the primary proof layer and text testimonials read as compact supporting quote tiles.

**Tech Stack:** Next.js App Router, React server components, TypeScript, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Homepage Testimonials Tests For Split Layout

**Files:**
- Modify: `tests/home-page.test.tsx`

- [ ] **Step 1: Write the failing layout test updates**

Replace the current mixed-grid testimonial assertions with checks for separate video and text groups, explicit slot counts, and placeholder fill behavior.

- [ ] **Step 2: Run the targeted homepage test file to verify it fails**

Run: `npm test -- tests/home-page.test.tsx`
Expected: FAIL because the homepage still renders one mixed testimonial grid and only six total placeholders.

- [ ] **Step 3: Commit the failing-test checkpoint**

```bash
git add tests/home-page.test.tsx
git commit -m "test: cover split homepage testimonials layout"
```

### Task 2: Homepage Testimonials Split Layout Implementation

**Files:**
- Modify: `app/page.tsx`
- Test: `tests/home-page.test.tsx`

- [ ] **Step 1: Add fixed-count placeholder pools and typed slot selection**

Create separate placeholder arrays for video and text testimonials, plus small helpers that select the first four videos and first six text testimonials from the published set and then pad the remainder with placeholders.

- [ ] **Step 2: Replace the mixed testimonial grid with explicit video and text sections**

Render a top video grid and a lower compact text grid inside `#testimonials`, preserving the current section copy and dark section framing.

- [ ] **Step 3: Split the testimonial card component into type-aware variants**

Keep one shared entry component if convenient, but render clearly different card treatments:
- video cards: taller, portrait-leaning, more media-forward
- text cards: smaller, denser, quote-tile style

- [ ] **Step 4: Run the targeted homepage tests to verify they pass**

Run: `npm test -- tests/home-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit the split-layout implementation**

```bash
git add app/page.tsx tests/home-page.test.tsx
git commit -m "feat: split homepage testimonials into video and text grids"
```

### Task 3: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run the focused homepage test surface**

Run: `npm test -- tests/home-page.test.tsx tests/testimonials.test.ts`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: Review the final diff**

Run: `git diff -- app/page.tsx tests/home-page.test.tsx`
Expected: Only the homepage testimonial layout changes and related test updates are present.
