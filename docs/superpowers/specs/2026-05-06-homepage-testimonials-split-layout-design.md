# Homepage Testimonials Split Layout Design

## Summary

Redesign the public homepage testimonials section into a structured split layout:

- first row: `4` video testimonial cards
- second area: `6` compact text testimonial cards in a `3x2` grid

The section should always preserve that composition on desktop by filling missing slots with type-specific placeholders. The visual direction should feel closer to the provided reference: video-first, denser text tiles, and a more editorial testimonial hierarchy.

## Goals

- Match the requested homepage composition with a dedicated video row and compact text grid.
- Keep the section stable even when Mongo does not contain enough published testimonials.
- Preserve the existing Mongo-backed testimonial source and sort behavior.
- Keep the dark testimonial section visually aligned with the rest of the homepage.

## Non-Goals

- No testimonial carousel, slider, or pagination.
- No admin-side reordering workflow beyond the existing published sort behavior.
- No changes to the testimonial data model or repository.
- No video playback modal or custom player controls.

## Current State

The homepage currently renders all published testimonials as one mixed responsive grid in `app/page.tsx`. Video and text testimonials use the same overall card footprint, which makes the section feel visually flat and does not preserve a clear hierarchy between richer video proof and smaller written quotes.

The current fallback behavior also treats placeholders as a generic mixed set rather than preserving a fixed desktop composition by testimonial type.

## Proposed Design

### Content Partitioning

Split published homepage testimonials into two typed groups:

- video testimonials
- text testimonials

The homepage section should derive:

- the first `4` video testimonials
- the first `6` text testimonials

using the existing published testimonial ordering from the repository.

### Placeholder Strategy

If there are fewer than `4` published video testimonials, fill the remaining video slots with video placeholders.

If there are fewer than `6` published text testimonials, fill the remaining text slots with text placeholders.

This keeps the homepage layout composition stable and avoids sections collapsing unevenly when the database is sparse.

### Desktop Layout

The section should render in two explicit blocks:

1. a top grid with `4` video cards in one row
2. a lower grid with `6` compact text cards arranged as `3` columns by `2` rows

The video row should feel more prominent, with portrait-oriented cards and stronger media presence. The text cards should be visibly smaller and denser than the current design so that six of them can sit comfortably in the lower grid without feeling oversized.

### Mobile And Tablet Behavior

The strict desktop composition should relax responsively on smaller screens.

Expected behavior:

- video testimonials remain first
- text testimonials remain second
- cards stack naturally into narrower responsive grids
- text cards stay visually lighter and more compact than video cards

The content hierarchy should remain obvious even when the desktop `4 + 6` arrangement collapses.

### Section Copy

Keep the existing testimonial section framing and dark background treatment, but let the layout carry more of the impact.

The redesign should avoid adding extra explanatory copy or controls. The main change is the card system and composition.

### Video Card Treatment

Video cards should feel closer to creator or client clips:

- taller portrait-style proportions
- stronger visual emphasis on the media area
- preserved client name and title metadata
- preserved support for real uploaded video playback
- placeholder state that still reads clearly as a video slot

### Text Card Treatment

Text testimonial cards should be redesigned as smaller quote tiles:

- tighter padding
- smaller type scale than video cards
- shorter vertical footprint
- cleaner, lighter chrome
- preserved client name and title

These cards should feel intentionally secondary to the video row while still remaining readable and polished.

## Data Flow

- `getPublishedTestimonials(db)` remains the source of published homepage testimonials.
- `app/page.tsx` splits that array into video and text subsets.
- The homepage section renders fixed-count arrays for each group, padding with placeholders when necessary.
- The testimonial repository and admin workflows remain unchanged.

## Testing Plan

Update homepage tests to cover:

1. typed partitioning into video and text groups
2. `4` video testimonial slots on desktop data shape
3. `6` text testimonial slots on desktop data shape
4. placeholder fill behavior when Mongo returns too few testimonials of either type
5. continued support for real uploaded video testimonials

## Risks And Mitigations

- The section could become visually heavy if text cards remain too large.
  - Mitigation: use a clearly smaller text-card footprint and reduced padding.
- Sparse testimonial data could break the layout.
  - Mitigation: enforce fixed slot counts with type-specific placeholders.
- Mixed testimonial sorting could produce surprising visible selections.
  - Mitigation: preserve current published sort behavior and take the first matching items per type.

## Implementation Notes

- Primary file: `app/page.tsx`
- Primary test file: `tests/home-page.test.tsx`
- No repository or admin changes expected
