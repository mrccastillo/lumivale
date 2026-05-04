# Admin Sidebar Collapse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the desktop admin shell so the sidebar uses icons, collapses into a visible narrow rail, hides the logo block when collapsed, and expands the content area to match the active sidebar width.

**Architecture:** Lift the desktop sidebar expansion state from `AdminNav` into `AdminWorkspace` so both the fixed sidebar and the workspace content offset are driven by the same source of truth. Keep mobile menu state local to `AdminNav`, replace text badges with inline SVG icons, and verify the behavior through focused shell tests.

**Tech Stack:** Next.js App Router, React client components, Tailwind CSS utility classes, Vitest, Testing Library

---

### Task 1: Lock in the desktop shell behavior with tests

**Files:**
- Modify: `tests/admin-shell.test.tsx`
- Test: `tests/admin-shell.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
  test("hides the desktop logo text and keeps the icon rail visible when collapsed", () => {
    pathnameMock.mockReturnValue("/admin/blogs");

    render(<AdminNav isDesktopExpanded onDesktopToggle={() => {}} />);

    expect(screen.getByText("Lumivale")).toBeInTheDocument();
    expect(screen.getByText("Admin Portal")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));

    expect(screen.queryByText("Lumivale")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Portal")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Admin navigation" })).toHaveClass("w-[5.5rem]");
  });

  test("reduces the workspace desktop offset when the sidebar is collapsed", () => {
    pathnameMock.mockReturnValue("/admin/blogs");

    render(
      <AdminWorkspace>
        <p>Blog dashboard</p>
      </AdminWorkspace>,
    );

    const shell = screen.getByTestId("admin-workspace-shell");

    expect(shell).toHaveClass("md:pl-[17.5rem]");

    fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));

    expect(shell).toHaveClass("md:pl-[5.5rem]");
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/admin-shell.test.tsx`
Expected: FAIL because `AdminNav` does not accept desktop state props yet and `AdminWorkspace` never changes its desktop padding.

- [ ] **Step 3: Write minimal assertions for icon-based nav items**

```tsx
    const blogsLink = screen.getByRole("link", { name: "Blogs" });
    expect(blogsLink.querySelector("svg")).not.toBeNull();
```

- [ ] **Step 4: Run the test to verify it still fails for the intended missing behavior**

Run: `npm test -- tests/admin-shell.test.tsx`
Expected: FAIL with assertions around the unchanged desktop shell implementation, not a test syntax error.

- [ ] **Step 5: Commit**

```bash
git add tests/admin-shell.test.tsx
git commit -m "test: cover admin sidebar collapse shell behavior"
```

### Task 2: Lift desktop sidebar state and update the nav rendering

**Files:**
- Modify: `app/admin/admin-workspace.tsx`
- Modify: `app/admin/admin-nav.tsx`
- Test: `tests/admin-shell.test.tsx`

- [ ] **Step 1: Add shared desktop width constants and controlled props**

```tsx
export const ADMIN_NAV_EXPANDED_WIDTH_CLASS = "md:pl-[17.5rem]";
export const ADMIN_NAV_COLLAPSED_WIDTH_CLASS = "md:pl-[5.5rem]";
```

```tsx
type AdminNavProps = {
  isDesktopExpanded: boolean;
  onDesktopToggle: () => void;
};
```

- [ ] **Step 2: Implement the minimal workspace state and responsive shell offset**

```tsx
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  const shellOffsetClass = isDesktopExpanded
    ? ADMIN_NAV_EXPANDED_WIDTH_CLASS
    : ADMIN_NAV_COLLAPSED_WIDTH_CLASS;

  return (
    <div
      data-testid="admin-workspace-shell"
      className={`min-h-screen bg-[#f7f8fb] text-[var(--lumivale-ink)] ${shellOffsetClass}`}
    >
      <AdminNav
        isDesktopExpanded={isDesktopExpanded}
        onDesktopToggle={() => setIsDesktopExpanded((expanded) => !expanded)}
      />
```

- [ ] **Step 3: Implement the minimal nav changes to satisfy the tests**

```tsx
        {isDesktopExpanded ? (
          <Link href="/admin/blogs" className="flex min-w-0 items-center gap-3 font-semibold text-[var(--lumivale-ink)]">
            ...
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
```

```tsx
        <button
          type="button"
          aria-expanded={isDesktopExpanded}
          aria-label={isDesktopExpanded ? "Collapse navigation" : "Expand navigation"}
          onClick={onDesktopToggle}
        >
```

```tsx
              <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-md bg-white/70 ring-1 ring-[var(--lumivale-line)]">
                <BlogsIcon className="size-4" />
              </span>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/admin-shell.test.tsx`
Expected: PASS with the new controlled desktop sidebar behavior.

- [ ] **Step 5: Commit**

```bash
git add app/admin/admin-workspace.tsx app/admin/admin-nav.tsx tests/admin-shell.test.tsx
git commit -m "feat: update admin sidebar collapse behavior"
```

### Task 3: Verify no regression in the broader admin test surface

**Files:**
- Test: `tests/admin-shell.test.tsx`
- Test: `tests/admin-pages.test.tsx`
- Test: `tests/admin-blogs-dashboard.test.tsx`

- [ ] **Step 1: Run the focused admin shell test suite**

Run: `npm test -- tests/admin-shell.test.tsx`
Expected: PASS

- [ ] **Step 2: Run the related admin page suites**

Run: `npm test -- tests/admin-pages.test.tsx tests/admin-blogs-dashboard.test.tsx`
Expected: PASS, or if an unrelated pre-existing failure appears, document it explicitly before closing the task.

- [ ] **Step 3: Review the final diff for scope**

```bash
git diff -- app/admin/admin-nav.tsx app/admin/admin-workspace.tsx tests/admin-shell.test.tsx docs/superpowers/plans/2026-05-04-admin-sidebar-collapse-implementation.md
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/admin-nav.tsx app/admin/admin-workspace.tsx tests/admin-shell.test.tsx docs/superpowers/plans/2026-05-04-admin-sidebar-collapse-implementation.md
git commit -m "chore: add admin sidebar implementation plan"
```
