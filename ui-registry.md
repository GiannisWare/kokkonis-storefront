# Storefront UI Registry

## Baseline — Established 2026-08-22 (Zara hierarchy + DESIGN-nike)

| Property | Correct pattern |
| --- | --- |
| Page surface | `--canvas: #fff`; product media on `--soft-cloud: #f5f5f5` |
| Primary text | `--ink: #111` |
| Secondary text | `--mute: #707072` |
| Dividers | `1px solid --hairline-soft`; never card shadows |
| Display type | Bebas Neue, uppercase, reserved for campaign/page statements |
| UI type | Geist 400/500 at 14–16px |
| Spacing | 8px base; 48px desktop section rhythm |
| Card geometry | Square media, zero radius, zero shadow, zero internal frame padding |
| Controls | 48px pills or 44px circular Phosphor icon controls |
| Product grid | 3 desktop → 2 tablet → 1 mobile, 8px horizontal gutters |

**Pattern notes:** Zara informs sparse page composition while `DESIGN-nike.md` supplies the mechanical token and component system. Never import pricing, sale, bag, cart, checkout, ratings, or proprietary brand assets.

### Site Header

File: `components/layout/SiteHeader.tsx`
Last updated: 2026-08-23

| Property | Pattern |
| --- | --- |
| Background | `--canvas`, with a `--soft-cloud` utility strip |
| Border | Bottom hairline using `--hairline-soft`; rectangular outlines for active navigation |
| Border radius | None |
| Text — primary | `--ink`, uppercase navigation labels |
| Text — secondary | Small utility text in `--mute` |
| Spacing | `28px 32px`, `72px` desktop navigation height |
| Hover state | Thin rectangular outline; no color flourish |
| Shadow | None |
| Accent usage | Hover and focus only |

**Pattern notes:** Header navigation stays centered, typographic and restrained. The whole header shell is sticky at the top of the viewport. Use Phosphor icons for search/menu controls. Do not add commerce controls.

### Image-led Mega Menu

File: `components/layout/DesktopMegaMenu.tsx`
Last updated: 2026-08-23

| Property | Pattern |
| --- | --- |
| Background | `--canvas` panel with a quiet page veil underneath |
| Border | Hairline panel edges; active child uses an exact rectangular outline |
| Border radius | None |
| Text | Large uppercase child labels; inactive siblings recede with opacity |
| Layout | Approximately 42% navigation labels and 58% preview image |
| Media | Landscape 8:5 preview, cover crop, neutral fallback when absent |
| Motion | 280ms panel reveal and image crossfade; disabled for reduced motion |
| Icon | Phosphor Plus at the end of the active child row |
| Shadow | None |
| Accent usage | None; hierarchy comes from type, outline and imagery |

**Pattern notes:** Desktop parents with children open the full-width panel on hover, focus or click. Child hover/focus changes the preview image. Escape closes and returns focus to the parent. Mobile navigation stays lightweight and does not load decorative submenu previews. Admin-uploaded media is optional, and a missing or failed image must degrade to the neutral placeholder without layout shift.

### Framed Paint Story

Files: `components/home/PaintStory.tsx` and its section components
Last updated: 2026-08-24

| Property | Pattern |
| --- | --- |
| Composition | White breathing space around one floating rounded black stage; three full-viewport narrative acts |
| Display type | Oversized Bebas Neue words remain intact behind a smaller centered hero object |
| UI type | Geist for navigation, product names, controls and supporting copy |
| Motion | Desktop GSAP ScrollTrigger pin/scrub; hero → oversized rotating brush → centered product finale |
| Paint | Layered SVG perimeter at homepage layer 1000, with rough, wet and bristle strokes; live native colour control |
| Products | Six real published Paints products, split into two three-column editorial slices |
| CTA | White pill with black border/text at rest; orange circular fill expands across the surface on hover and the shape resolves to 12px corners |
| Shadow | Broad, low-contrast ambient shadow around the complete black stage |
| Responsive | Sequential static acts with dedicated brush placements below 900px; same fallback for reduced motion |

**Pattern notes:** This is the homepage's sole featured-product story. Keep scroll progress in GSAP rather than React state. Use a moderately compact pinned distance (about 2.9 viewport heights, with a 2200px minimum) and a 0.8-second scrub so the three acts advance promptly without losing smooth interpolation. The painted perimeter owns layer 1000; the transparent third-act content plane sits at 1001 so its CTA and product labels are never crossed by the trail. On the homepage, mount the header inside the clipped `.paint-story__stage`, hide the global layout header, and move the inner header upward beneath the perimeter so navigation never crosses the white frame. Every other route keeps the normal global header. Never use a rectangular header backdrop over the rounded top corners. On the homepage only, current, hovered, and keyboard-focused navigation items use orange text without a rectangular border; navigation on every other route keeps the global outlined interaction pattern. Hero words are never split into partial strings. The initial brush stays smaller than the word and receives only a subtle hover drift. Eyebrow, description, products, picker, and actions each own a protected zone: Act 2 reserves the lower-left for products and the lower-right for the colour picker. Campaign copy and imagery remain Laravel-configurable; product data stays read-only and comes from the versioned API. The brush ferrule is never tinted, and no price, bag, cart, ratings or checkout language belongs in the composition. Three.js is intentionally unnecessary while the supplied photographic cutout remains the primary object.

### Product Card

File: `components/catalogue/ProductCard.tsx`
Last updated: 2026-08-22

| Property | Pattern |
| --- | --- |
| Background | Open `--canvas`; media uses `--soft-cloud` |
| Border | None around the card; grid rhythm comes from gutters |
| Border radius | None |
| Text — primary | Compact uppercase `--ink` heading |
| Text — secondary | Small uppercase `--mute` metadata |
| Spacing | Zero frame padding; 16px information gap below media |
| Hover state | Media scales subtly; no card lift |
| Shadow | None |
| Accent usage | Minimal; product state remains typographic |

**Pattern notes:** Cards stay flat and editorial. Product imagery uses a fixed square frame with `object-fit: contain`. The first desktop row loads eagerly for LCP; later rows remain lazy-loaded. Hide missing optional metadata instead of printing empty values.

### Product Placeholder Media

File: `components/catalogue/ProductCard.tsx`
Last updated: 2026-08-22

| Property | Pattern |
| --- | --- |
| Background | Neutral `--soft-cloud` field |
| Border | None inside the media frame |
| Border radius | None |
| Image treatment | Square, centered, clean studio object, `object-fit: contain` |
| Spacing | Eight-percent inset inside the media frame |
| Shadow | Subtle photographed grounding shadow only |
| Accent usage | Neutral product details; no logos or text inside imagery |

**Pattern notes:** Rotate the four local placeholder assets deterministically when backend media is missing. Keep placeholder `alt` empty because it is decorative and may not depict the exact product. Real backend media always takes precedence.

### Footer

File: `components/layout/SiteFooter.tsx`
Last updated: 2026-08-22

| Property | Pattern |
| --- | --- |
| Background | `--ink` |
| Text | White display wordmark with muted supporting copy |
| Layout | Wide brand statement plus compact catalogue links |
| Border radius | None |
| Shadow | None |

**Pattern notes:** The footer closes the editorial composition without introducing account, bag, price or checkout language.

### Catalogue Facet Rail

File: `components/catalogue/CatalogueFilters.tsx`
Last updated: 2026-08-22

| Property | Pattern |
| --- | --- |
| Background | Open `--canvas` surface |
| Border | `1px solid --hairline-soft` between groups |
| Border radius | None |
| Text — primary | 10–12px uppercase Geist labels in `--ink` |
| Text — secondary | Counts and supporting labels in `--mute` |
| Spacing | 20px vertical group padding; compact 8px option rhythm |
| Hover state | Native control affordances; strong focus outline |
| Shadow | None |
| Accent usage | Real attribute swatches only; primary action remains black |

**Pattern notes:** Desktop filters remain a persistent open left rail. At the 980px compact breakpoint the client boundary closes the native disclosure and resynchronizes it when the breakpoint changes. Do not hide the summary of a closed `<details>` element without also guaranteeing an open desktop state. Filter state is encoded in GET query parameters so filtered views stay server-rendered and shareable.
