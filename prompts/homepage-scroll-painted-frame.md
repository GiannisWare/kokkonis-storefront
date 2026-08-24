# Homepage Scroll-Painted Frame

## Goal

Add one homepage-only editorial chapter where a realistic paint brush travels around a portrait canvas while scrolling and reveals a tactile painted border. The scene should feel mesmerizing and premium without interfering with catalogue browsing.

## Current behaviour

The homepage renders a server-driven hero carousel followed by the scroll-painted Paints presentation. The former separate three-product featured grid has been removed because this chapter now owns the homepage featured-product role.

## Relevant files inspected

- `app/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `components/home/HeroCarousel.tsx`
- `ui-registry.md`
- `package.json`
- `public/images/`

## Laravel endpoints involved

- `GET /api/v1/products?category=paints&per_page=8`

Laravel remains the catalogue source of truth. The homepage fetches a small Paints subset server-side and passes it into the isolated client animation.

## Expected API shape

No API contract changes. Existing `Product` resources provide the product name, slug, category, brand, availability label, and converted media URLs.

## Implementation decisions

- Create one focused Client Component mounted by the existing Server Component homepage.
- Place it directly after the hero carousel as the homepage's only featured-product presentation.
- Use GSAP `ScrollTrigger` with a pinned, scrubbed timeline on capable desktop/tablet devices.
- Use an SVG rectangular path as the deterministic motion route and painted-border reveal source.
- Layer several irregular SVG strokes and a restrained displacement/noise filter for bristle texture, uneven opacity, and wet edge detail.
- Select one colour once per browser visit from a curated paint palette, then let the visitor override it with a labelled native colour picker. Never randomize during server render.
- Shuffle up to four real Paints products after hydration and present them sequentially inside the portrait canvas.
- Move and rotate a transparent brush cutout along the SVG path so the bristles lead the stroke.
- Use a subtle pointer-based tilt and bristle-pressure response only while the scene is active.
- Keep the existing global typography and flat geometry. Do not redesign the hero, navigation, product cards, or footer.
- Do not add Laravel fields or dependencies. Use the installed `gsap` package directly.

## Files expected to change

- `app/page.tsx`
- `app/globals.css`
- `components/home/ScrollPaintFrame.tsx` (new)
- `public/images/paint-brush-cutout.png` (new generated asset)
- `ui-registry.md`

## UI behaviour

- The chapter begins as an open warm-white field with a centered portrait canvas.
- The left editorial statement reveals progressively and includes a live colour picker instead of instructional scroll copy.
- Up to four real Paints products appear one by one inside the canvas as the brush advances.
- The brush enters near the upper-left corner, paints clockwise around all four sides, and exits with a gentle lift.
- Paint consists of a primary body, translucent wet edge, fine bristle streaks, and subtle corner buildup.
- A quiet typographic paint-language band supports the scene without covering the canvas.
- Hover/pointer movement adds controlled three-dimensional tilt and wet-highlight movement; it does not become a freehand drawing tool.

## Responsive behaviour

- Desktop and landscape tablet: pinned scrubbed sequence.
- Narrow/mobile or coarse pointer: no pinning and no pointer tracking; show the completed frame with the brush resting naturally.
- Section must never create horizontal scrolling.

## Loading behaviour

- The static HTML/SVG composition renders before GSAP initializes.
- Brush uses a local optimized asset with explicit dimensions to avoid layout shift.

## Error behaviour

- If GSAP initialization cannot run, the completed painted frame remains visible and readable.
- If the image fails, the text and painted frame remain usable without a broken-image icon.

## Empty states

Not data-driven. No empty state required.

## SEO considerations

- Keep meaningful statement text in semantic HTML.
- Treat the brush and painted texture as decorative.
- Do not change metadata or heading hierarchy incorrectly.

## Performance considerations

- One isolated Client Component.
- Dynamically initialize GSAP after mount and scope all selectors with `gsap.context()`.
- Animate transforms, opacity, and SVG dash offsets only.
- Avoid per-frame React state updates, canvas bitmap painting, and global pointer listeners outside the active section.
- Clean up timelines, ScrollTriggers, listeners, and media-query contexts on unmount.

## Security considerations

- No API access, remote script, user-generated HTML, or new environment variables.
- Local decorative asset only.

## Accessibility

- Respect `prefers-reduced-motion` and provide a complete static presentation.
- Hide decorative SVG and brush imagery from assistive technology.
- Preserve readable contrast and normal document scrolling.

## Acceptance criteria

- Homepage-only placement directly after the hero, with no duplicate featured-products grid below it.
- Brush visibly follows all four canvas edges and rotates with its travel direction.
- Paint border is progressively revealed and looks layered rather than like a single perfect vector line.
- Colour changes between visits but remains stable during one visit.
- Pointer interaction is subtle and does not block links or scrolling.
- Mobile and reduced-motion modes are static and lightweight, showing one real Paints product when available.
- The colour overlay affects the bristles only and leaves the silver ferrule and `60` stamp untouched.
- No price, cart, checkout, or backend changes.
- No runtime console errors, hydration mismatch, horizontal overflow, or lingering ScrollTriggers after navigation.

## Checks to run

- `npm run lint`
- `npm run build`
- `git diff --check`

## Manual testing

1. Open the homepage at desktop width and scroll slowly through the new chapter.
2. Confirm the canvas pins, brush paints clockwise, and text reveals smoothly.
3. Move the pointer over the active canvas and confirm the small tilt/highlight response.
4. Reload and confirm a palette colour can change while remaining consistent through the sequence.
5. Enable reduced motion and confirm the completed static frame appears.
6. Test at mobile width and confirm there is no pinning or horizontal overflow.
7. Navigate to `/products` and confirm the effect is absent.
