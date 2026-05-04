# Admin Sidebar Collapse Design

## Summary

Update the desktop admin shell so the collapsed sidebar remains visible as a narrow icon rail, the expanded sidebar shows icons with text labels, the logo block disappears entirely when collapsed, and the main content width adjusts to the active sidebar width.

## Goals

- Replace the desktop admin nav letter badges with icons.
- Keep a visible narrow desktop rail when the sidebar is collapsed.
- Hide the logo block in collapsed desktop mode.
- Make the admin workspace content offset respond to the expanded and collapsed desktop widths.
- Preserve the current mobile admin menu behavior.

## Non-Goals

- No redesign of the mobile navigation.
- No persistence of the collapse state across reloads.
- No changes to admin page content outside the shared shell and navigation.

## Current State

`AdminNav` owns its desktop expanded/collapsed state internally and uses a fixed-position sidebar. `AdminWorkspace` always applies the expanded desktop left padding, so collapsing the sidebar only changes the nav width and leaves unused space beside the content.

## Proposed Design

### State Ownership

Move the desktop expanded/collapsed state to `AdminWorkspace`. This makes the workspace shell the source of truth for both:

- the fixed sidebar width rendered by `AdminNav`
- the left padding applied to the content shell

`AdminNav` will receive the current desktop expansion state and a toggle callback as props.

### Desktop Sidebar Behavior

- Expanded desktop state:
  - show the Lumivale logo block
  - show `icon + text label` for each navigation item
  - show `icon + text label` for logout
  - use the existing expanded width
- Collapsed desktop state:
  - remove the logo block from the layout
  - keep the collapse/expand trigger visible
  - show icon-only navigation items in a narrow rail
  - show icon-only logout action in the same rail
  - use the existing collapsed width

### Icons

Use small inline SVG React components for:

- Blogs
- Testimonials
- Users
- Logout
- Collapse/expand chevron if needed

This avoids introducing a new icon package and keeps the implementation self-contained.

### Workspace Layout

`AdminWorkspace` will switch its desktop left padding between the expanded and collapsed sidebar widths so the header and main content expand when the rail is collapsed. The nav remains fixed on the left; only the workspace offset changes.

### Accessibility

- Keep the desktop toggle button `aria-expanded` state accurate.
- Keep toggle labels explicit: `Collapse navigation` and `Expand navigation`.
- Ensure icon-only links retain accessible names through visible text still present in the accessibility tree or explicit `aria-label` values.
- Preserve link `title` attributes in collapsed desktop mode for hover context.

### Mobile

No behavior change. The existing floating mobile menu button and dropdown remain as-is.

## Testing Plan

Follow TDD in `tests/admin-shell.test.tsx`:

1. Add a failing test that verifies collapsing the desktop nav removes the logo text while keeping the nav rail visible.
2. Add a failing test that verifies the admin workspace switches from expanded desktop padding to collapsed desktop padding after the toggle is used.
3. Update or add assertions that the desktop nav links are icon-based while preserving the expected accessible link names.
4. Implement the minimal production changes required to make those tests pass.

## Risks And Mitigations

- Fixed sidebar and workspace offset can drift if widths are duplicated.
  - Mitigation: centralize the expanded and collapsed width values in shared constants used by both workspace and nav.
- Icon-only collapsed controls can lose clarity.
  - Mitigation: preserve accessible names and `title` attributes in collapsed mode.
- Existing mobile behavior could regress if desktop state is over-shared.
  - Mitigation: keep mobile open/close state local to `AdminNav` and only lift the desktop expansion state.

## Implementation Notes

- Update `app/admin/admin-workspace.tsx` to own the desktop expansion state and compute the responsive content offset.
- Update `app/admin/admin-nav.tsx` to accept desktop state props and render inline SVG icons instead of letter badges.
- Extend `tests/admin-shell.test.tsx` first, then implement the production changes.
