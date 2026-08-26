# Homepage Paint Story

## Goal

Replace the separate campaign hero and painted-product chapter with one continuous, three-act homepage story inspired by the supplied black/orange framed product reference and governed by `prompts/GSAP-design.md`.

## Current behaviour

The homepage renders a configurable image carousel followed by a separate warm-white pinned paint-frame sequence. Both are individually polished, but the brush does not provide continuity between them and the overall composition does not match the requested cinematic framed stage.

## Visual references generated

- Act 1: black/orange framed hero with an oversized typographic statement and central brush.
- Act 2: enlarged, rolling brush partially leaving the right edge with a wet cobalt trail and product strip.
- Act 3: normal-size horizontal brush centered over three product presentations and a catalogue CTA.

The generated references are design aids only. Production uses real HTML, the existing transparent brush asset, and Laravel catalogue data.

## Relevant files inspected

- `prompts/GSAP-design.md`
- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `components/home/HeroCarousel.tsx`
- `components/home/ScrollPaintFrame.tsx`
- `components/layout/SiteHeader.tsx`
- `components/layout/DesktopMegaMenu.tsx`
- `types/storefront.ts`
- `types/product.ts`
- `ui-registry.md`

## Laravel endpoints involved

- `GET /api/v1/products?category=paints&per_page=8`
- Existing storefront configuration endpoint for logo, navigation, campaign slides and footer.

## Expected API shape

No API changes. Existing `Product` and `StorefrontConfiguration` TypeScript contracts remain the source of truth.

## Implementation decisions

- Build one `PaintStory` Client Component orchestrating one shared brush across three presentational child components.
- Keep server-side data fetching in `app/page.tsx` and pass serializable product/configuration data into the client boundary.
- Use the existing transparent high-resolution brush rather than adding Three.js or a WebGL shader dependency.
- Use GSAP `ScrollTrigger` for one pinned desktop narrative, transforms/opacity for the brush and panels, and SVG dash offsets for the paint trail.
- Preserve campaign carousel content inside Act 1 with autoplay pause behaviour and accessible previous/next controls.
- Preserve the live colour picker in Act 2; it updates the brush bristles and trail without React scroll state.
- Use real Paints products in Acts 2 and 3. Missing media uses existing local decorative placeholders.
- Hide the utility bar and restyle the existing configurable navigation transparently over the homepage story only. Do not duplicate or hardcode navigation.
- Do not add account, shopping bag, price, cart, checkout, rating, or stock-count UI from the reference.
- Add no new dependencies.

## Component boundaries

- `PaintStory`: GSAP orchestration, colour control, shared brush/trail and carousel state.
- `PaintStoryHero`: Act 1 campaign content.
- `PaintStoryFeature`: Act 2 enlarged-brush narrative and first product strip.
- `PaintStoryProducts`: Act 3 resolved product presentation.
- `StoryFlowLink`: shared animated catalogue CTA.
- `StoryProduct`: compact real-product presentation.

## UI behaviour

- A 24px burnt-orange outer frame surrounds one rounded near-black stage.
- The existing site navigation becomes transparent and overlays the stage.
- Act 1 enters with staggered headline letters, a spotlighted brush, campaign copy and catalogue CTA.
- On scroll, the brush grows to roughly 1.6×, rolls clockwise, and moves partly beyond the right edge as Act 2 replaces the hero.
- Layered cobalt paint paths reveal around the inner perimeter with dry, body, wet and bristle detail, feathered at their endpoints.
- Act 2 presents three real products and a live colour picker.
- Act 3 returns the brush to a calm normal-size horizontal pose and presents three more products with a final catalogue CTA.

## Responsive behaviour

- Desktop/landscape tablet with normal motion: one pinned scrubbed story.
- Mobile and reduced-motion: three normal-flow static chapters; each receives a deliberate brush composition and no pinning.
- No horizontal overflow at any viewport.

## Loading, error and empty behaviour

- Story HTML is meaningful before GSAP initializes.
- If configuration is unavailable, existing safe fallback copy is used.
- If products are unavailable, product strips remain absent without fake data; CTAs still lead to the catalogue.
- Missing product media uses local decorative placeholders.

## SEO and accessibility

- Maintain a single meaningful homepage `h1`; Acts 2 and 3 use `h2`.
- Decorative brush/trail imagery is hidden from assistive technology.
- Buttons and links retain visible focus states and labels.
- Respect `prefers-reduced-motion` with a complete non-animated layout.

## Performance and security

- One isolated client animation boundary; no client-side Laravel fetching.
- Animate transforms, opacity and SVG dash offsets only.
- Use `next/image` with responsive sizes and eager loading only for the hero brush/active campaign image.
- Clean up timelines, timers and media-query contexts.
- No remote scripts, unsafe HTML, new secrets or backend writes.

## Acceptance criteria

- Homepage matches the black/orange framed visual hierarchy without copying commerce.
- Brush remains one continuous visual subject through all three desktop acts.
- Act 2 shows the requested enlarged, rotating, partially cropped brush state.
- Act 3 shows the requested normal-size centered brush state.
- Paint trail is layered, coloured live by the picker, and fades naturally at its ends.
- Real Laravel products are visible in the story.
- Configurable campaign content and navigation remain functional.
- Mobile/reduced-motion experiences remain readable and stable.
- No hydration warnings, console errors, broken links, or horizontal overflow.

## Checks

- `npm run lint`
- `npm run build`
- `git diff --check`
- Browser verification at Act 1, Act 2, Act 3, mobile/reduced-motion where available, `/products`, colour-picker interaction and navigation.
