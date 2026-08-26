# Homepage Soothing Paint Story Motion

## Goal

Refine the existing desktop homepage paint story into one continuous, scroll-bound brush journey. The brush begins in its established central hero position, eases naturally toward the left edge, deposits the realistic textured trail while travelling around the stage, carries the viewer through all three narrative acts without positional jumps, and finishes by following an extended curved exit while rotating continuously, shrinking, and fading beyond the viewport.

## Language agreed on

- **One screen**: the existing pinned black story stage remains visually fixed while scroll progress advances three overlapping narrative acts inside it; the page does not become three stacked desktop screens.
- **Follows the user**: brush position, tangent, scale, rotation, trail reveal, and panel transitions are derived from the same normalized scroll progress, with a smooth scrub delay rather than autonomous time-based playback.
- **Circular journey**: after leaving the hero centre, the brush follows the existing rounded perimeter route around the safe content area before continuing into its final exit curve.
- **No teleportation**: no second tween or path callback may take ownership of the brush transform at a hand-off point. Every position must be continuous with the previous frame.
- **Rotating exit**: rotation accumulates through multiple complete turns only during the final departure, while the brush follows a curved route off the left side and fades near—not at the start of—the exit.

## Design plan

```text
seed = len(request) % 4 -> hero: preserve Cinematic Center; typography: preserve Geist/Bebas system
components = [single journey controller, textured perimeter canvas, protected narrative panels]
gsap = [pinned scrubbed ScrollTrigger, progress-driven transform and canvas rendering]
```

- AIDA remains unchanged: hero/nav = Attention, feature act = Interest, travelling textured brush/product reveals = Desire, finale CTA = Action.
- The existing wide hero composition and typography remain intact; this is a motion refinement, not a visual redesign.
- The existing complete three-column product rows remain unchanged and contain no empty bento cells.
- No new labels, commerce controls, decorative badges, or dependencies are introduced. CTA contrast remains unchanged.

## Current behaviour and cause

- The desktop story uses one pinned `ScrollTrigger`, but the brush has competing transform owners.
- A timeline tween first moves the brush from the centre toward the first path point.
- The trail callback then immediately writes `x`, `y`, and `rotation` from the SVG path sample.
- That hand-off can produce a visible jump in position or angle, especially during fast scroll, reverse scroll, refresh, and responsive recalculation.
- The final exit is a direct point-to-point tween with one target rotation, so it reads as a sudden departure rather than a continuation of the perimeter journey.

## Relevant files inspected

- `AGENTS.md`
- `CLAUDE.md`
- `prompts/GSAP-design.md`
- `prompts/homepage-paint-story.md`
- `prompts/homepage-textured-paint-trail.md`
- `ui-registry.md`
- `components/home/PaintStory.tsx`
- `components/home/PaintTrailCanvas.tsx`
- `components/home/PaintStoryHero.tsx`
- `components/home/PaintStoryFeature.tsx`
- `components/home/PaintStoryProducts.tsx`
- `app/globals.css`
- Installed Next.js 16.3.2 documentation for Client Components, hydration, and image handling
- Official GSAP ScrollTrigger and `gsap.context()` documentation

## Laravel endpoints involved

- Existing server-side Paints product query used by the homepage
- Existing storefront configuration endpoint

No API request, response shape, caching, backend, or Laravel change is required.

## Implementation decisions

### Single journey controller

- Replace the separate centre-to-path tween, trail-progress tween, and final exit tween with one normalized `journey.progress` value driven by the pinned `ScrollTrigger` timeline.
- Add one `renderJourney(progress)` function as the sole writer of brush `x`, `y`, `rotation`, `scale`, and opacity and as the sole caller of the trail renderer.
- Keep content-panel timelines separate only for opacity/scale/y reveals. They must never write to the brush transform.
- Use direct GSAP setters or cached `quickSetter` functions in the progress callback. Do not update React state while scrubbing.

### Continuous motion route

Split the normalized journey into continuous segments with matched endpoints:

1. **Hero settle (0.00–0.12)**: brush remains centred with only a very subtle breathing scale and angle drift.
2. **Centre-to-left approach (0.12–0.28)**: brush follows a responsive cubic curve from its exact current centre anchor to the first perimeter sample. Position uses a smooth in/out interpolation; angle blends toward the perimeter tangent instead of snapping.
3. **Painted perimeter (0.28–0.82)**: brush and textured trail use the same SVG path sample. The trail begins only after the bristles reach the perimeter and draws progressively around the protected content area.
4. **Extended exit (0.82–1.00)**: brush continues from the exact final perimeter sample into a responsive curved route that travels leftward and outside the stage. It accumulates approximately two full rotations, gently reduces scale, and fades during the final third of this segment.

- Use continuous angle unwrapping so crossing `-180/180` cannot reverse or snap the brush.
- Compute all responsive anchors from the current stage and brush dimensions during initialization and `ScrollTrigger.refresh()`.
- Preserve deterministic reverse scrolling: decreasing progress reconstructs the exact prior position, rotation, scale, opacity, and amount of paint.

### Soothing scroll feel

- Keep the current overall scroll distance near `2.9` viewport heights so the story does not become slow again.
- Use a numeric scrub around `0.85–1.0` for gentle catch-up without a delayed, heavy feel.
- Apply `power2.inOut` or a similarly restrained curve to segment-local progress, not to the global scroll timeline.
- Crossfade acts with generous overlap: the departing act fades before the incoming act reaches full visibility; neither should blink or become suddenly replaced.
- Update the `01 / 03` indicator using stable journey thresholds matching the actual chapter hand-offs.

### Content safety and layering

- Preserve the current protected content plane: header, titles, product rows, picker, and CTA remain above the paint canvas.
- Keep the brush route at the outer safe perimeter during acts 2 and 3.
- The exit curve must pass beneath the finale product/CTA plane and then move left, never across the CTA.
- Do not change the homepage-only white outer frame, existing navigation behaviour, product data, or CTA styling.

## Files expected to change

- `components/home/PaintStory.tsx`
- `app/globals.css` only if a minor transform-origin/will-change adjustment is needed
- `ui-registry.md`

`PaintTrailCanvas.tsx` should remain unchanged unless the journey needs one small read-only sampling method to avoid drawing during the approach/exit. Any such addition must stay focused and backwards compatible.

## Responsive and reduced-motion behaviour

- Desktop and landscape tablet at the existing animation breakpoint: one pinned, scroll-scrubbed journey.
- Mobile/compact tablet: preserve the current normal-flow static chapters; do not pin or run the continuous canvas loop.
- `prefers-reduced-motion`: preserve readable static content and hide continuous brush/trail travel.
- Prevent horizontal overflow while the brush exits beyond the stage.

## Loading, errors, and empty products

- Semantic content renders before GSAP initializes.
- If the trail texture is unavailable, the brush may still follow the continuous route without throwing or blocking scroll.
- Empty product arrays remain valid and do not generate GSAP target warnings.
- Reverse scroll and refresh must remain safe before the texture is decoded.

## SEO, accessibility, performance, and security

- Preserve headings, links, colour input, server-rendered content, and all current accessibility semantics.
- Keep decorative brush/canvas elements `aria-hidden` and non-interactive.
- Animate transforms and opacity only; avoid per-frame layout reads by caching journey geometry and recomputing it only on refresh.
- Keep the canvas DPR cap and deterministic redraw strategy.
- Clean up GSAP context, media matchers, ScrollTrigger, and canvas state on unmount.
- No unsafe HTML, remote script, dependency, API write, secret, or user-controlled URL is introduced.

## Acceptance criteria

- Brush starts at the exact current centre position with a calm initial presence.
- Centre-to-left movement is curved and continuous with no position, scale, or angle jump when painting starts.
- Brush visibly deposits the generated textured trail and stays aligned to its leading edge.
- All three acts feel like chapters inside one pinned screen driven directly by the user's scroll.
- Fast forward scroll, slow scroll, reverse scroll, and direction changes produce no teleportation.
- Chapter crossfades are gradual and sequenced.
- Final motion continues from the perimeter into a curved leftward exit, rotates through multiple complete turns, scales down, and fades fully offscreen.
- Final brush and trail never cover the product row or CTA.
- Mobile, reduced-motion, empty-product, texture-failure, resize, and refresh states remain stable.
- No hydration warning, console error, horizontal overflow, or regression on `/products`.

## Checks to run

- `npm run lint`
- `npm run build`
- `git diff --check`
- Browser console inspection
- Desktop slow/fast/reverse scrub testing
- Refresh and resize at each chapter
- Mobile and reduced-motion testing
- `/products` navigation regression check

## Manual testing

1. Start the Laravel API and Next.js development server.
2. Open `/` at a desktop viewport and reload at the top.
3. Scroll a few pixels at a time through the centre-to-left hand-off; verify no positional or angular jump.
4. Scroll steadily through all three chapters and verify the brush feels attached to scroll progress.
5. Flick the scroll wheel/trackpad forward and backward; verify the brush follows smoothly and reconstructs the paint deterministically.
6. Confirm the trail is deposited only from the perimeter contact point onward.
7. Confirm the final brush rotates continuously, passes below the CTA plane, fades late, and exits fully left.
8. Resize during each chapter and repeat the journey.
9. Verify mobile, reduced-motion, colour-picker, empty-products, and `/products` behaviour.
