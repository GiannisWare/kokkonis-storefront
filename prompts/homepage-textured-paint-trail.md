# Homepage Textured Paint Trail

## Goal

Replace the current layered SVG-stroke approximation in the homepage paint story with the generated realistic bristle texture at `/images/textures/paint-trail-bristle-v1.png`. The brush must visibly deposit the textured, live-tinted paint as the user scrolls, reveal each narrative act in sequence, preserve protected content zones, and finish by travelling beyond the left edge and fading out so the final products, statement, and CTA own the centre.

## Design plan

```text
seed = len(request) % 4 -> hero: Cinematic Center; typography: Geist (with the established Bebas Neue display face)
components = [textured canvas trail, protected editorial product slices, live colour control]
gsap = [pinned scrubbed chapter timeline, progress-driven brush/trail path rendering]
```

- AIDA remains intact: configurable navigation and campaign hero provide Attention; the tool-and-paint feature act provides Interest; the textured brush journey and real products provide Desire; the final catalogue CTA provides Action.
- The existing wide hero title remains full-width and limited to the established two-to-three-line composition. No stamp icons, tags, commerce controls, or fabricated copy are added.
- There is no bento grid in this focused change. The existing three-column product slices remain mathematically complete: three products across three columns with no empty grid cell.
- No cheap numbered section labels are introduced. The chapter progress is a functional navigation/status affordance. CTA contrast remains white/black at rest and orange/white on hover.

## Current behaviour

- `PaintStory` owns one desktop `ScrollTrigger` timeline pinned to the black stage.
- A shared photographic brush scales and rotates between three acts.
- Five SVG strokes reveal along a perimeter path with `strokeDashoffset`.
- The colour picker updates `--paint-color` for the SVG strokes and bristle tint.
- Act 3 returns the brush to the centre, where it competes with the headline, product presentations, and CTA.
- Mobile and reduced-motion layouts are static and hide the animated trail.

## Relevant files inspected

- `AGENTS.md`
- `prompts/GSAP-design.md`
- `prompts/homepage-paint-story.md`
- `ui-registry.md`
- `app/page.tsx`
- `app/globals.css`
- `components/home/PaintStory.tsx`
- `components/home/PaintStoryHero.tsx`
- `components/home/PaintStoryFeature.tsx`
- `components/home/PaintStoryProducts.tsx`
- `public/images/paint-brush-cutout.png`
- `public/images/textures/paint-trail-bristle-v1.png`
- Installed Next.js documentation for Server/Client Components and image handling
- Current official GSAP ScrollTrigger, `gsap.context()`, and MotionPath documentation

## Laravel endpoints involved

- `GET /api/v1/products?category=paints&per_page=8`
- Existing storefront configuration endpoint used by `getStorefrontConfiguration()`

## Expected API shape

No Laravel or API contract changes. The server page continues to fetch published Paints products and storefront configuration and passes serializable data into `PaintStory`.

## Implementation decisions

### Trail renderer

- Introduce a focused `PaintTrailCanvas` client component or imperative helper owned by `PaintStory`.
- Keep the SVG guide path in the DOM as an invisible geometric source. Remove the visible dry/body/wet/bristle SVG strokes and their displacement filter.
- Load the same-origin PNG texture directly for canvas drawing. This is intentionally not a `next/image` presentation image: canvas requires decoded pixel access, and the canvas itself owns a fixed stage-sized box with no layout shift.
- Build a smaller offscreen tinted texture buffer whenever `--paint-color` changes. Preserve the source alpha and luminance so wet highlights, grooves, translucent gaps, and feathered edges remain visible.
- Stamp consecutive cropped texture segments along the SVG guide path. Position each stamp with `getPointAtLength()`, rotate it to the local tangent, and overlap adjacent stamps slightly to avoid seams.
- Cap canvas device-pixel ratio at 1.5 or 2. Draw only newly revealed stamps during forward scrolling. On reverse scrolling, clear and deterministically redraw to the requested progress.
- Never update React state from scroll progress. Use refs, GSAP setters, and an imperative render function.

### Shared brush/trail motion

- Use one GSAP proxy value for trail progress. Its `onUpdate` both paints the canvas and positions/rotates the brush contact point from the same guide-path sample.
- Do not use responsive `MotionPathPlugin` alignment. Official GSAP documentation notes that alignment is calculated at animation creation and is not automatically reapplied after responsive layout changes.
- Recalculate canvas dimensions and SVG-to-stage coordinate scale on `ScrollTrigger` refresh/resize while retaining timeline progress.
- Keep the ferrule and wooden handle untinted. Continue tinting only the existing bristle mask.

### Narrative timeline

- Preserve one pinned desktop timeline and the current approximately `2.9svh`/2200px minimum scroll distance with the established smooth numeric scrub.
- Act 1: retain the central, smaller brush and protected hero zones. The headline, eyebrow, description, controls, and CTA remain unobstructed.
- Transition to Act 2: move the brush toward the safe outer guide, enlarge it, rotate it naturally, and begin depositing the textured trail. Fade Act 1 before the brush crosses its content.
- Act 2: reveal the feature copy, three products, and live picker only after the brush has passed their corresponding perimeter waypoint. The trail remains at the perimeter and below the content plane.
- Transition to Act 3: complete the textured perimeter, fade the feature act, then reveal the finale headline and products in sequence.
- Extended ending: do not park the brush in the centre. Reduce it toward a calm horizontal scale, continue it below or outside the protected product/CTA plane toward the left boundary, then translate it fully beyond the left edge while fading `autoAlpha` to zero. The centre remains clear for the headline, three product presentations, and final CTA.
- Reverse scrolling must reconstruct the trail and brush state correctly.

### Layering and protected zones

- Outer white page/frame remains visually dominant and homepage-only.
- Canvas paint belongs behind all readable and interactive content but above the dark stage background.
- Brush may temporarily sit above the trail but must not cover navigation, hero copy, feature products, colour picker, finale products, or CTA.
- Header, product slices, picker, progress, and CTA each receive explicit content-plane z-index values. Avoid arbitrary extreme z-index escalation outside the isolated story stage.
- Keep a minimum safe inset between the trail and interactive content. Trail width scales responsively and never intrudes into the central editorial column.

## Files expected to change

- `components/home/PaintStory.tsx`
- A focused new trail component/helper under `components/home/` if it keeps canvas concerns out of `PaintStory`
- `app/globals.css`
- `ui-registry.md`

No dependency, Laravel, API, product type, or unrelated route changes.

## UI behaviour

- The trail looks like genuine wet paint: bristle grooves, opacity breakup, edge feathering, and highlights from the generated texture.
- The picker recolours both the brush bristles and deposited trail immediately.
- Paint remains after the brush passes and fades subtly only at the leading and terminal ends, not across the entire useful trail.
- Content reveals are synchronized with brush waypoints, creating an uncovering story without using the paint as an opaque wipe over text.
- The final act matches the supplied reference hierarchy: a large statement, horizontal product presentation, central CTA, and clear negative space after the brush exits left.

## Responsive behaviour

- Desktop and landscape tablet (`min-width: 900px`, no reduced motion): pinned canvas/brush story.
- Compact tablet/mobile: retain normal-flow chapters. Use restrained static texture accents at section edges only if they remain readable; do not run the canvas stamping loop or pin the page.
- Reduced motion: no pinning, path travel, or continuous drawing. Show meaningful static acts and optionally one faint, already-painted decorative perimeter texture.
- No horizontal overflow at any viewport.

## Loading behaviour

- Render all semantic content before GSAP and before the texture is decoded.
- Keep the trail transparent until the PNG is ready; never flash a solid rectangle or fallback stroke.
- The brush and story remain usable if texture decoding is delayed.

## Error and empty states

- If the texture fails to load, keep the story readable and run the panel transitions without a visible trail. Do not throw or block scrolling.
- If products are empty, preserve existing behaviour: omit product slices and keep the catalogue CTA.
- If configuration is unavailable, continue using existing safe fallback content.

## SEO and accessibility

- Preserve the single homepage `h1` and existing `h2` hierarchy.
- Canvas, guide path, brush, and decorative texture remain `aria-hidden` and non-interactive.
- Keep links, colour input, carousel buttons, and CTA keyboard accessible with visible focus states.
- Do not add commerce semantics, pricing, fake availability, or inaccessible scroll controls.

## Performance considerations

- Keep product/configuration fetching server-side; only the existing story boundary remains client-side.
- Reuse one decoded texture and one offscreen tinted buffer.
- Cap DPR, use cropped source segments, skip duplicate progress renders, and avoid full-canvas redraw while scrolling forward.
- Animate transforms, opacity, and one numeric progress proxy. Avoid layout-triggering properties in the scrubbed timeline.
- Clean up GSAP context, match-media registrations, resize/refresh listeners, decoded image references, and any animation frame work.
- Do not add Three.js, another smooth-scroll library, `@gsap/react`, or any new dependency for this focused change.

## Security considerations

- Texture is a committed same-origin static asset.
- Colour input remains a browser-native validated hexadecimal colour value.
- No unsafe HTML, remote script, secret, backend write, or client-side Laravel fetch is introduced.

## Acceptance criteria

- Generated PNG is the visible trail texture; the old layered SVG strokes are no longer rendered.
- Brush and trail remain spatially synchronized throughout forward and reverse scrubbing.
- The trail can be recoloured live without losing luminance, transparency, or bristle detail.
- Trail and brush never cover navigation, readable copy, products, picker, or CTA.
- Each act reveals only after the brush reaches the appropriate safe waypoint.
- Final brush continues left and fades fully outside the centre composition.
- Act 3 centre remains dedicated to its statement, three real products, and CTA.
- Mobile and reduced-motion layouts remain stable and readable.
- No hydration warnings, canvas exceptions, console errors, horizontal overflow, or regressions on `/products`.

## Checks to run

- `npm run lint`
- `npm run build`
- `git diff --check`
- Browser console inspection
- Desktop forward and reverse scrub verification
- Resize verification at mid-scroll
- Live colour-picker verification
- Mobile and reduced-motion verification
- `/products` navigation regression check

## Manual testing

1. Start Laravel and the Next.js storefront with their configured development commands.
2. Open the homepage at a desktop viewport and reload at the top.
3. Scroll slowly and quickly through all three acts; confirm brush-tip/trail alignment and protected content zones.
4. Reverse-scroll from Act 3 to Act 1; confirm trail removal/redraw is deterministic.
5. Change trail colour during Act 2 and confirm existing and new paint recolour together.
6. Resize at Act 2 and confirm the brush and canvas realign after refresh.
7. Confirm the final brush travels out left and leaves the finale centre unobstructed.
8. Test keyboard navigation and reduced-motion mode.
9. Check a compact mobile viewport for normal-flow readability and no horizontal overflow.
