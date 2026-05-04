# Homepage Platform Marquee Design

## Summary

Replace the static hero platform label row with a continuously auto-scrolling horizontal marquee that loops infinitely without changing the current visual tone of the homepage.

## Goals

- Keep the platform labels in the hero section.
- Make the row auto-scroll continuously from right to left.
- Make the loop visually seamless.
- Preserve the current typography and spacing feel of the row.
- Respect reduced-motion preferences by disabling the animation when motion is reduced.

## Non-Goals

- No draggable carousel behavior.
- No hover-only animation.
- No new JavaScript animation controller.
- No content changes to the platform names themselves.

## Current State

`app/page.tsx` renders a single static flex row of platform labels inside the homepage hero. The row is centered and responsive, but it does not move and cannot loop because it only renders one copy of the label set.

## Proposed Design

### Structure

Keep the existing `data-testid="platform-row"` wrapper, but convert it into an `overflow-hidden` viewport that contains one animated inner track. Render the platform label list twice inside that track so the second sequence follows the first immediately.

### Animation

Use a CSS keyframes animation that translates the track to the left by half of its total width. Because the content is duplicated exactly once, moving the track by `-50%` creates a seamless loop back to the starting position.

### Styling

- Preserve the current text sizing, weight, color, and responsive spacing as closely as possible.
- Add a subtle horizontal fade at the viewport edges so the moving text does not feel abruptly clipped.
- Keep the row non-interactive and visually lightweight.

### Accessibility

- Mark the duplicate sequence `aria-hidden="true"` so screen readers only announce one set of labels.
- Disable the animation for users with `prefers-reduced-motion: reduce`.

## Testing Plan

Follow TDD in `tests/home-page.test.tsx`:

1. Add a failing test that verifies the hero platform row renders a marquee viewport and animated track.
2. Add assertions that the primary sequence contains the expected platform names in order.
3. Add assertions that the duplicate sequence exists and is hidden from assistive technology.
4. Implement the minimal JSX and CSS required to make the test pass.

## Risks And Mitigations

- The loop can visibly jump if spacing differs between the original and duplicate sequences.
  - Mitigation: render both sequences from the same array and apply the same shared item classes.
- The moving row can reduce readability for users sensitive to motion.
  - Mitigation: disable animation under `prefers-reduced-motion`.
- Hero layout can regress on small screens if the track is allowed to wrap.
  - Mitigation: keep the track and items on a single line with `whitespace-nowrap`.

## Implementation Notes

- Update `app/page.tsx` to render the marquee viewport, animated track, and duplicate sequence.
- Update `app/globals.css` to add the marquee keyframes, animation utility class, edge fade utility, and reduced-motion override.
- Extend `tests/home-page.test.tsx` before changing production code.
