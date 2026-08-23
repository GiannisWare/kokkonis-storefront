# Image-led mega menu

## Goal

Replace the compact desktop dropdown with an admin-driven, image-led mega menu inspired by the interaction and proportions of `https://www.leandra-isler.ch/en`, while preserving Kokkonios typography, palette, catalogue scope, accessibility, and mobile navigation.

## Current behaviour

- Laravel stores ordered top-level and one-level child navigation items.
- `GET /api/v1/storefront` exposes navigation labels, resolved URLs, targets, and children.
- The desktop storefront uses native `<details>` elements with a small floating dropdown.
- The header is not sticky.
- Navigation items do not currently own media.

## Relevant files inspected

### Laravel

- `app/Models/NavigationItem.php`
- `app/Filament/Resources/NavigationItems/Schemas/NavigationItemForm.php`
- `app/Actions/Storefront/GetStorefrontConfiguration.php`
- `app/Http/Resources/StorefrontResource.php`
- `database/migrations/2026_08_22_143958_create_navigation_items_table.php`
- `tests/Feature/Api/StorefrontConfigurationTest.php`

### Next.js

- `components/layout/SiteHeader.tsx`
- `lib/api/storefront.ts`
- `types/storefront.ts`
- `app/globals.css`
- `ui-registry.md`

## Laravel endpoint involved

- `GET /api/v1/storefront`

## Expected additive API shape

Each navigation item gains a nullable `preview_image` field:

```json
{
  "id": 12,
  "label": "Interior paints",
  "url": "/products?category=interior-paints",
  "open_in_new_tab": false,
  "preview_image": {
    "url": "https://media.example/menu-preview.webp",
    "original": "https://media.example/original.jpg",
    "alt": "Interior paint tins and colour cards"
  },
  "children": []
}
```

## Implementation decisions

- Use the existing Spatie Media Library installation; add no package.
- Make `NavigationItem` implement `HasMedia` and use a single-file `menu_preview` collection on the configured `MEDIA_DISK`.
- Preserve the uploaded original.
- Generate one queued WebP conversion named `menu-preview`, fitted inside approximately 1280 × 800 without upscaling or destructive database-side cropping.
- Accept JPG, PNG, WebP, and AVIF up to 10 MB; recommend landscape originals around 1600–2400 px wide and 8:5 framing.
- Store alt text in a nullable `preview_image_alt` navigation-item column so non-technical staff can manage it next to the upload.
- Show the image controls only for header submenu items, since the desktop mega menu consumes child images.
- Eager-load navigation media to avoid N+1 queries.
- Keep API changes additive and nullable so old clients remain valid.
- Implement the desktop menu as one client component with explicit pointer, focus, Escape, and route-change state rather than relying on hover-only CSS or native `<details>` behaviour.
- Do not add an animation dependency. Use CSS transitions on opacity and transforms.
- Preserve the existing mobile accordion, enhanced with accessible expanded-state controls; do not load/display large preview images inside the mobile menu.

## Desktop UI behaviour

- The full header becomes sticky at the top with a restrained background and bottom hairline.
- Direct top-level links receive a thin rectangular outline on hover/focus/current-route state.
- A top-level item with children opens a full-width panel directly below the header.
- The panel contains oversized submenu labels on the left and a large 8:5 landscape preview on the right.
- Hovering or focusing a child:
  - draws a rectangular outline around that row,
  - restores that row to full ink while dimming siblings,
  - reveals a Phosphor `Plus` marker,
  - crossfades and subtly scales the child image.
- The first child with an image becomes the default preview when the panel opens.
- Children without images use the first available sibling preview; when none exist, the media area becomes a restrained neutral placeholder rather than a fabricated image.
- The panel closes on pointer exit after a short grace period, Escape, focus leaving the menu, or navigation.
- Body content is visually separated while the panel is open with a subtle non-interactive veil.

## Responsive behaviour

- Desktop mega menu applies above the existing mobile navigation breakpoint.
- Tablet/mobile keeps a compact menu button and stacked accessible submenus.
- Preview imagery is excluded from the mobile drawer to avoid unnecessary bandwidth and crowded interaction.
- The sticky header remains functional on mobile with reduced height.

## Loading, error, and empty behaviour

- A missing preview image does not prevent navigation from rendering.
- Failed image loads fall back to a neutral media surface.
- The existing fallback storefront remains valid because `preview_image` is nullable.

## SEO considerations

- Navigation remains server-sourced and uses real links.
- No route, metadata, or catalogue semantics change.
- Meaningful admin-provided alt text is exposed for submenu imagery.

## Performance considerations

- Eager-load media with navigation.
- Serve the generated WebP conversion rather than originals.
- Use fixed image dimensions and `sizes` with Next `<Image>` to prevent layout shift.
- Keep animation to `opacity` and `transform`.
- Avoid preview image rendering in mobile markup.

## Security considerations

- Validate uploads by MIME type and size.
- Keep random storage filenames; do not preserve client filenames.
- Reuse the configured media disk and long cache headers.
- Do not expose storage credentials or internal disk paths.
- Continue validating internal and external navigation URLs through the existing form rules.

## Files expected to change

### Laravel

- New reversible migration for `preview_image_alt`.
- `app/Models/NavigationItem.php`
- `app/Filament/Resources/NavigationItems/Schemas/NavigationItemForm.php`
- `app/Actions/Storefront/GetStorefrontConfiguration.php`
- `app/Http/Resources/StorefrontResource.php`
- Navigation API/media tests.

### Next.js

- `components/layout/SiteHeader.tsx`
- A focused client mega-menu component under `components/layout/` if needed.
- `types/storefront.ts`
- `lib/api/storefront.ts`
- `app/globals.css`
- `ui-registry.md`

## Acceptance criteria

- Staff can upload, replace, and remove one image for each header submenu item.
- Uploaded originals and conversions use the configured Spatie media disk.
- The storefront API exposes a nullable optimized preview payload and alt text.
- Desktop top-level navigation uses the outlined rectangular hover language.
- Desktop submenus open as a full-width image-led mega panel matching the reference interaction.
- Child hover/focus swaps the preview with a subtle crossfade and scale.
- Header remains sticky while scrolling without layout jumping.
- Keyboard users can open, traverse, close, and activate the menu.
- Reduced-motion users receive no non-essential transitions.
- Mobile navigation remains compact and usable.
- No prices, cart, checkout, or unrelated commerce UI is introduced.

## Checks to run

### Laravel

```bash
./vendor/bin/pint --dirty --format agent
./vendor/bin/phpstan analyse --no-progress --memory-limit=512M
php -d memory_limit=512M artisan test --compact
```

### Next.js

```bash
npm run lint
npm run build
```

## Manual testing

1. Upload different preview images to at least two child menu items in Filament.
2. Confirm originals and `menu-preview` conversions exist on the configured media disk.
3. Open the storefront at desktop width and hover/focus the parent and each child.
4. Confirm the outline, sibling dimming, plus marker, and image crossfade.
5. Scroll and confirm the header remains sticky with no content jump.
6. Use Tab, Shift+Tab, Enter/Space, and Escape without a mouse.
7. Check the mobile menu below the desktop breakpoint.
8. Verify a child with no image and a failed image URL degrade cleanly.
