# Homepage Platform Marquee Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static homepage hero platform label row with a seamless, continuously auto-scrolling marquee that respects reduced-motion settings.

**Architecture:** Keep the existing hero markup in `app/page.tsx`, but wrap the platform row in an `overflow-hidden` viewport and animate a duplicated inner track using CSS keyframes from `app/globals.css`. Verify the structure in the existing homepage test file so the change stays local to the current hero implementation.

**Tech Stack:** Next.js App Router, React server components, Tailwind CSS v4, global CSS, Vitest, Testing Library

---

### Task 1: Lock the marquee structure with a failing homepage test

**Files:**
- Modify: `tests/home-page.test.tsx`
- Test: `tests/home-page.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
  test("renders the hero platform labels as an infinite marquee", async () => {
    const { container } = render(await Home());
    const hero = container.querySelector("#hero");
    const platformRow = hero?.querySelector("[data-testid='platform-row']");
    const marqueeTrack = hero?.querySelector("[data-testid='platform-track']");
    const sequences = hero?.querySelectorAll("[data-testid='platform-sequence']");

    expect(platformRow).toHaveClass("overflow-hidden");
    expect(marqueeTrack).toHaveClass("lumivale-marquee-track");
    expect(sequences).toHaveLength(2);
    expect(sequences?.[1]).toHaveAttribute("aria-hidden", "true");
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/home-page.test.tsx`
Expected: FAIL because the static row does not yet render marquee classes, duplicate sequences, or a hidden duplicate track.

- [ ] **Step 3: Add order assertions for the primary sequence**

```tsx
    const primaryLabels = Array.from(
      sequences?.[0].querySelectorAll("[data-testid='platform-item']") ?? [],
    ).map((item) => item.textContent);

    expect(primaryLabels).toEqual(["Reddit", "Quora", "X", "TikTok", "LinkedIn"]);
```

- [ ] **Step 4: Run the test to verify it still fails for the intended behavior**

Run: `npm test -- tests/home-page.test.tsx`
Expected: FAIL on missing marquee structure, not a test syntax error.

- [ ] **Step 5: Commit**

```bash
git add tests/home-page.test.tsx
git commit -m "test: cover homepage platform marquee"
```

### Task 2: Implement the marquee markup and animation

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `tests/home-page.test.tsx`

- [ ] **Step 1: Add the duplicated marquee structure in the hero**

```tsx
            <div data-testid="platform-row" className="lumivale-marquee-fade mt-8 max-w-full overflow-hidden sm:mt-10">
              <div data-testid="platform-track" className="lumivale-marquee-track flex w-max items-center">
                {[false, true].map((isDuplicate) => (
                  <div
                    key={isDuplicate ? "duplicate" : "primary"}
                    data-testid="platform-sequence"
                    aria-hidden={isDuplicate || undefined}
                    className="flex shrink-0 items-center gap-x-4 pr-4 text-sm font-semibold whitespace-nowrap text-white/56 sm:gap-x-12 sm:pr-12 sm:text-xl"
                  >
```

- [ ] **Step 2: Add the marquee keyframes and reduced-motion override**

```css
@keyframes lumivale-marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

.lumivale-marquee-track {
  animation: lumivale-marquee 18s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .lumivale-marquee-track {
    animation: none;
    transform: translateX(0);
  }
}
```

- [ ] **Step 3: Run the homepage test to verify it passes**

Run: `npm test -- tests/home-page.test.tsx`
Expected: PASS

- [ ] **Step 4: Refine only if needed while keeping tests green**

Run: `npm test -- tests/home-page.test.tsx`
Expected: PASS after any class-name or spacing cleanup.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/globals.css tests/home-page.test.tsx
git commit -m "feat: add homepage platform marquee"
```

### Task 3: Verify the final homepage scope

**Files:**
- Test: `tests/home-page.test.tsx`
- Modify: `docs/superpowers/specs/2026-05-04-homepage-platform-marquee-design.md`
- Modify: `docs/superpowers/plans/2026-05-04-homepage-platform-marquee-implementation.md`

- [ ] **Step 1: Run the focused homepage test suite**

Run: `npm test -- tests/home-page.test.tsx`
Expected: PASS

- [ ] **Step 2: Review the final diff for scope**

```bash
git diff -- app/page.tsx app/globals.css tests/home-page.test.tsx docs/superpowers/specs/2026-05-04-homepage-platform-marquee-design.md docs/superpowers/plans/2026-05-04-homepage-platform-marquee-implementation.md
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/globals.css tests/home-page.test.tsx docs/superpowers/specs/2026-05-04-homepage-platform-marquee-design.md docs/superpowers/plans/2026-05-04-homepage-platform-marquee-implementation.md
git commit -m "chore: add homepage marquee docs"
```
