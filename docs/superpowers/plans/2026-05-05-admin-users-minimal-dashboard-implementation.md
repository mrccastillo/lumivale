# Admin Users Minimal Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the admin Users page into a minimalist dashboard with compact metrics, search, sort/filter controls, and a refined create-and-browse layout.

**Architecture:** Keep the page server-rendered and URL-driven, following the admin dashboard pattern already used for Blogs and Testimonials while staying visually quieter. Implement search and simple sort/filter logic directly in `app/admin/users/page.tsx`, backed by the existing `getAdminUsers` repository function and covered with focused page tests.

**Tech Stack:** Next.js App Router, React server components, TypeScript, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Users Dashboard Tests

**Files:**
- Modify: `tests/admin-pages.test.tsx`
- Create: `tests/admin-users-dashboard.test.tsx`

- [ ] **Step 1: Write the failing smoke-test updates**

Add assertions in `tests/admin-pages.test.tsx` for the redesigned users page header, metric copy, and toolbar controls.

- [ ] **Step 2: Run the targeted users tests to verify they fail**

Run: `npm test -- tests/admin-pages.test.tsx tests/admin-users-dashboard.test.tsx`
Expected: FAIL because the current users page does not render metrics, search, or utility controls.

- [ ] **Step 3: Write focused dashboard behavior tests**

Cover:
- header + compact metrics
- search by email
- sort/filter behavior
- no-match state
- create form presence

- [ ] **Step 4: Re-run the targeted users tests**

Run: `npm test -- tests/admin-pages.test.tsx tests/admin-users-dashboard.test.tsx`
Expected: FAIL with behavior gaps only from the current users page implementation.

### Task 2: Users Page Redesign

**Files:**
- Modify: `app/admin/users/page.tsx`

- [ ] **Step 1: Implement URL-driven search, sort, and filter parsing**

Add `searchParams` handling for:
- `q`
- `sort`
- `range`

- [ ] **Step 2: Implement the minimalist dashboard layout**

Add:
- compact header and supporting copy
- small metrics row
- refined create-admin panel
- browse panel with slim utilities toolbar
- filtered/sorted user list

- [ ] **Step 3: Implement empty and no-match states**

Keep the create panel visible while the browse panel communicates either:
- no admins yet
- no users match current controls

- [ ] **Step 4: Run the targeted users tests to verify they pass**

Run: `npm test -- tests/admin-pages.test.tsx tests/admin-users-dashboard.test.tsx`
Expected: PASS

### Task 3: Full Verification

**Files:**
- Verify only

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: PASS
