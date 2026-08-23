# Product media and storefront redesign

## Goal

Connect ordered product imagery managed by Laravel and Spatie Media Library to a photography-first Next.js catalogue, then redesign the home and all-products pages with Zara-like editorial hierarchy and the approved `DESIGN-nike.md` token/component system.

## Current behaviour

- Laravel returns a single optional primary image with `thumb_url` and `catalog_url`.
- Product media conversions are synchronous and use `thumb`, `catalog`, and `zoom` sizes.
- Filament has no product-image upload field.
- Next.js renders generated local placeholders when API media is absent.
- Home and catalogue use an earlier cream/navy editorial theme.

## Files inspected

- Laravel `app/Models/Product.php`
- Laravel `app/Http/Resources/ProductResource.php`
- Laravel `app/Filament/Resources/Products/Schemas/ProductForm.php`
- Laravel `app/Filament/Resources/Products/Tables/ProductsTable.php`
- Laravel `config/filesystems.php`
- Next `app/layout.tsx`, `app/page.tsx`, `app/products/page.tsx`
- Next `app/globals.css`, `next.config.ts`
- Next catalogue components and API types/helpers
- `/Users/giannisgiotis/Downloads/DESIGN-nike.md`

## Laravel endpoints involved

- `GET /api/v1/products`

## Expected additive image contract

Each product exposes ordered `images`, with the first item treated as primary. Every item contains `id`, `alt`, `original`, `thumb`, `card`, `medium`, and `large`. The existing singular `image` field remains as a primary-image compatibility alias.

## Implementation decisions

- Originals are preserved unchanged.
- Accepted uploads: JPEG, PNG, WebP, AVIF; maximum 10 MB each.
- Conversions are queued WebP files: 160, 480, 900, and 1600 px using `Fit::Max`, with no crop and no upscale.
- Collection name is `images`; uploads are multiple and reorderable.
- Alt text is stored in each Media model's `alt` custom property and can be edited from the product edit workflow.
- Development uses the public disk. Production selects an S3-compatible disk through environment configuration; Cloudflare R2 plus a custom media domain is recommended.
- The frontend uses the real API image set and only falls back to generated local imagery when no media exists.
- Zara informs page composition; `DESIGN-nike.md` supplies typography, spacing, color, shape, and component rules.
- No pricing, discounts, cart, bag, checkout, fabricated ratings, or purchasing controls.

## Files expected to change

- Laravel Product model, Product API Resource, Filament product form/table/edit page, media/filesystem configuration, environment example, and focused tests.
- Next root layout, global styles, header, product card/grid, home page, all-products page, product types, image configuration, assets, and UI registry.

## UI behaviour

- Sparse two-tier header with restrained catalogue navigation and Phosphor icons.
- Full-bleed photography-led home hero with one primary CTA.
- Flat product imagery on `#f5f5f5`, zero card radius/shadow, 8 px grid gutters, concise metadata.
- Catalogue header and result controls remain informational and URL-safe; no commerce chrome.

## Responsive behaviour

- Product grid: 3 columns desktop, 2 tablet, 1 mobile.
- Desktop navigation becomes a compact mobile header/drawer control without introducing client-side product fetching.
- Hero swaps from wide editorial composition to a readable portrait-oriented crop on narrow screens.

## Loading, error, and empty states

- Preserve route loading UI.
- API failures remain friendly and do not expose internal URLs or exceptions.
- Empty catalogue remains explicit.
- Missing media uses local generated fallback imagery with stable dimensions.

## SEO and performance

- Keep server-rendered catalogue data and existing metadata.
- Use Next Image with stable aspect ratios and `sizes` hints.
- Hero is prioritized; below-fold product images remain lazy.
- Laravel conversions are queued and CDN-cacheable.

## Security

- Validate MIME type and 10 MB size in Filament and Media Library.
- Use generated filenames rather than preserving unsafe client filenames.
- Keep storage credentials server-only.
- Public API continues to return published, non-archived products only.

## Acceptance criteria

- Admin can upload, reorder, remove, and assign custom alt text to multiple product images.
- First ordered image is the primary API image.
- Every uploaded image receives all four queued WebP conversions without cropping or upscaling.
- API exposes the complete additive image contract.
- Home and `/products` render real products and real backend media when present.
- The new visual system matches the approved hybrid direction across desktop and mobile.
- No price or purchasing UI appears.

## Checks

- Laravel Pint, PHPStan, focused Pest tests, then full relevant tests.
- Next ESLint, TypeScript, production build.
- Live API inspection and browser verification at desktop and mobile widths.

## Manual testing

1. Start the Laravel queue worker.
2. Edit a product in Filament and upload two differently-sized image formats.
3. Reorder them, save, edit their alt text, and confirm the first is primary.
4. Verify conversion files and API URLs.
5. Open `/` and `/products` and confirm real media replaces placeholders.
6. Check navigation, product grid, error state, keyboard focus, and mobile layout.
