# Homepage Scroll Motion Design

## Summary

Add subtle, premium scroll motion across the full homepage using `framer-motion`, while keeping the current structure, typography, and content intact. The motion should feel atmospheric and polished rather than loud or decorative.

## Goals

- Add scroll-linked motion across the whole homepage.
- Keep the motion subtle on both desktop and mobile.
- Use `framer-motion` for parallax and reveal effects.
- Preserve the current homepage layout and content hierarchy.
- Respect `prefers-reduced-motion` for all animated sections.
- Keep the existing hero platform marquee compatible with the new motion system.

## Non-Goals

- No redesign of homepage content or section order.
- No heavy cinematic transitions or large motion distances.
- No full-page client-side conversion of the homepage.
- No animation system outside the homepage in this change.

## Current State

`app/page.tsx` is an async server component that renders the homepage structure and data-backed sections. The homepage currently uses static layout with a CSS-based marquee for the platform row. The project does not currently include `framer-motion`, and there is no shared motion primitive layer in `components/`.

## User Intent

The requested direction is:

- subtle and premium
- applied across the whole homepage
- enabled on both desktop and mobile
- implemented with `framer-motion`

This rules out a hero-only treatment and rules out dependency-free CSS-only motion for this feature.

## Proposed Design

### Motion Principles

The homepage motion should support the content rather than compete with it:

- slow, restrained parallax rather than dramatic depth shifts
- short reveal distances
- limited scaling, used only where it improves softness
- consistent easing and timing across sections
- lower travel distances on mobile than desktop

### Rendering Architecture

Keep `app/page.tsx` as the server-rendered source of homepage structure and data loading. Introduce a thin client-side motion layer through small reusable components in `components/` that wrap section content without forcing the entire page into a client component.

Recommended client components:

- `components/reveal.tsx`
  - handles fade-up / fade-in-on-view animations
- `components/parallax.tsx`
  - handles scroll-linked vertical drift, opacity modulation, and optional scale
- `components/motion-group.tsx`
  - provides shared stagger timing for card grids and grouped content

These wrappers should expose a small prop surface so the homepage can tune intensity per section without embedding large animation objects inline throughout the page file.

### Section-by-Section Motion Plan

#### Hero

- Add a very subtle parallax drift to a hero content group so the section feels responsive to scroll.
- Keep movement primarily vertical with a small range.
- Optionally add slight opacity easing tied to scroll progress.
- Do not animate the main heading with aggressive transform ranges.

#### Platform Marquee

- Preserve the existing horizontal marquee behavior.
- Avoid stacking a second strong horizontal scroll effect on top of it.
- Allow only mild scroll-linked opacity or vertical drift on the marquee container so it feels integrated with the hero.

#### Proof Section

- Reveal the section heading and metric cards on entry.
- Use staggered fade-up for the metric grid.
- Keep scale adjustments minimal or omitted if they make the cards feel unstable.

#### Services Section

- Reveal the section heading first.
- Stagger the service cards on entry with a short upward offset.
- Keep hover motion as-is unless it conflicts with entrance animation timing.

#### Case Studies Section

- Reveal the section heading on entry.
- Stagger case study cards similarly to services, but slightly slower to fit the larger card footprint.

#### Testimonials Section

- Use a gentler reveal than the hero and card sections.
- Avoid strong parallax on testimonial content so readability remains stable.

#### FAQ Section

- Reveal the intro copy and FAQ list on entry.
- Keep the FAQ items themselves mostly static beyond reveal so the interaction model remains clear.

#### Conversion Section

- Add a soft upward reveal and mild glow or opacity lift around the CTA region.
- Keep the CTA readable and stable; no large scale pulses or looping attention grabs.

### Motion Tuning

Use motion ranges that feel restrained:

- short upward reveal offsets
- slow scroll-linked parallax bands
- consistent easing across sections
- reduced distances on mobile

If a section feels visibly animated before the user notices the content, the effect is too strong and should be tuned down.

### Reduced Motion

All motion wrappers must use reduced-motion-aware behavior:

- disable scroll-linked transforms when `prefers-reduced-motion` is active
- reduce or remove staggered entrance motion
- preserve content visibility and layout without animation dependency

### Dependency Change

Add `framer-motion` to the project dependencies. This is justified because the requested effect set includes coordinated scroll-linked motion and reusable section reveals across the entire homepage.

## File Plan

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/page.tsx`
- Create: `components/reveal.tsx`
- Create: `components/parallax.tsx`
- Create: `components/motion-group.tsx`
- Modify if needed: `tests/home-page.test.tsx`

## Testing Plan

Follow TDD for the implementation:

1. Add failing homepage tests that confirm the new motion wrapper structure exists where expected.
2. Add failing tests for reduced-motion-safe structural behavior where practical.
3. Implement the smallest reusable motion components needed to satisfy those tests.
4. Run the focused homepage suite.
5. Run a production build check after dependency installation if the environment allows it.

## Risks And Mitigations

- Risk: the homepage becomes visually busy.
  - Mitigation: keep transform distances short and use section-specific restraint.
- Risk: mobile motion feels heavy.
  - Mitigation: clamp mobile distances lower than desktop.
- Risk: the marquee and parallax effects fight each other.
  - Mitigation: keep marquee motion primary and marquee parallax secondary.
- Risk: turning too much of the page into a client tree increases complexity.
  - Mitigation: keep `app/page.tsx` server-rendered and isolate motion to wrapper components.
- Risk: accessibility regressions for motion-sensitive users.
  - Mitigation: use `useReducedMotion` in all motion wrappers.

## Acceptance Criteria

- `framer-motion` is installed and used for homepage scroll effects.
- The homepage remains structurally the same, with added subtle motion.
- Motion appears across the whole homepage, not only in the hero.
- Motion intensity remains restrained on desktop and mobile.
- Reduced-motion users receive simplified or disabled motion behavior.
- The hero marquee still functions correctly after the motion layer is added.
- The homepage test suite passes after the change.
