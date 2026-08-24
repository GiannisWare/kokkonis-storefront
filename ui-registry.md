# Storefront UI Registry

## Baseline — Established 2026-08-22 (Zara hierarchy + DESIGN-nike)

| Property | Correct pattern |
| --- | --- |
| Page surface | `--canvas: #fff`; product media on `--soft-cloud: #f5f5f5` |
| Primary text | `--ink: #111` |
| Secondary text | `--mute: #707072` |
| Dividers | `1px solid --hairline-soft`; never card shadows |
| Display type | Bebas Neue, uppercase, reserved for campaign/page statements |
| UI type | Inter 400/500 at 14–16px |
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

### Campaign Hero

File: `app/page.tsx`
Last updated: 2026-08-22

| Property | Pattern |
| --- | --- |
| Composition | Full-width dark photographic/collage field with text anchored low-left |
| Display type | Bebas Neue, uppercase, compact leading |
| CTA | White 48px pill with dark text |
| Spacing | Large desktop inset, reduced predictably at tablet/mobile widths |
| Image treatment | Cover/edge-to-edge; local placeholders until the generated master assets are committed |

**Pattern notes:** Keep the opening statement immediate and spacious. One statement and one action only; avoid badge clouds, floating panels and decorative gradients.

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

### Configurable Campaign Carousel

File: `components/home/HeroCarousel.tsx`
Last updated: 2026-08-22

| Property | Pattern |
| --- | --- |
| Background | Full-bleed campaign image; warm mineral neutral is the safe fallback |
| Border | None; controls use a `1px` translucent ink border |
| Border radius | Square campaign field; only directional controls are circular |
| Text — primary | Bebas Neue uppercase display statement, `--ink` |
| Text — secondary | Inter body copy, `--charcoal` |
| Spacing | Low-left editorial copy with 24–32px internal rhythm |
| Hover state | Autoplay pauses on hover and keyboard focus |
| Shadow | None |
| Accent usage | Black primary CTA; campaign imagery supplies visual colour |

**Pattern notes:** Campaign images keep their subjects toward the right and reserve negative space for left-aligned copy. Transitions stop for reduced-motion users. Never place campaign copy inside a floating card.

### Catalogue Facet Rail

File: `components/catalogue/CatalogueFilters.tsx`
Last updated: 2026-08-22

| Property | Pattern |
| --- | --- |
| Background | Open `--canvas` surface |
| Border | `1px solid --hairline-soft` between groups |
| Border radius | None |
| Text — primary | 10–12px uppercase Inter labels in `--ink` |
| Text — secondary | Counts and supporting labels in `--mute` |
| Spacing | 20px vertical group padding; compact 8px option rhythm |
| Hover state | Native control affordances; strong focus outline |
| Shadow | None |
| Accent usage | Real attribute swatches only; primary action remains black |

**Pattern notes:** Desktop filters remain a persistent open left rail. At the 980px compact breakpoint the client boundary closes the native disclosure and resynchronizes it when the breakpoint changes. Do not hide the summary of a closed `<details>` element without also guaranteeing an open desktop state. Filter state is encoded in GET query parameters so filtered views stay server-rendered and shareable.

### Scroll-Painted Frame

File: `components/home/ScrollPaintFrame.tsx`
Last updated: 2026-08-24

| Property | Pattern |
| --- | --- |
| Background | Warm mineral `#f4f1ea` with a restrained paper/canvas texture |
| Border | Paint supplies the frame; structural dividers remain hairline |
| Border radius | None |
| Text — primary | Bebas Neue uppercase statement in `--ink`, maximum three lines |
| Text — secondary | Inter utility label in `--charcoal`; monospace colour value |
| Spacing | Full-viewport desktop chapter with generous 48–120px editorial gaps |
| Motion | GSAP ScrollTrigger pin and scrub; SVG dash reveal synchronized to MotionPath brush travel |
| Hover state | Small perspective tilt and wet-highlight shift inside the active canvas only |
| Shadow | Physical canvas and brush grounding shadows only; no UI-card shadow |
| Accent usage | Random initial mineral colour with a user-controlled native colour picker |

**Pattern notes:** This is the homepage's only featured-product presentation and sits directly after the campaign hero. Keep the animation isolated to one Client Component and never route scroll progress through React state. The Server Component supplies a small real Paints subset; the client only randomizes presentation order and animates one product at a time inside the portrait canvas. Desktop animates transforms, opacity, and SVG dash offsets; mobile, coarse layouts, and reduced-motion users receive the completed frame with one static product. The colour picker controls the frame and bristles live, but the ferrule remains untinted. Do not reuse this pinned treatment on catalogue or filtering pages.
