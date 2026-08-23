# Laravel Products Storefront

## Goal

Turn the blank Next.js application into the first read-only Kokkonios storefront slice: an editorial catalogue landing page inspired by the supplied reference, populated only by published products from the Laravel application.

## Current behaviour

- Next.js 16.3.2 currently renders the default starter page.
- Laravel has no public API routes yet.
- Laravel already owns products, categories, brands, availability, and MediaLibrary product images.
- `Product::published()` already excludes drafts and archived products.

## Relevant files inspected

### Laravel

- `app/Models/Product.php`
- `app/Models/Category.php`
- `app/Models/Brand.php`
- `app/Enums/ProductAvailability.php`
- `bootstrap/app.php`
- `routes/`
- `database/factories/ProductFactory.php`

### Next.js

- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `next.config.ts`
- `package.json`
- installed Next.js documentation under `node_modules/next/dist/docs/`

## Laravel endpoint

`GET /api/v1/products`

The endpoint will be public and read-only. A public catalogue does not need a secret bearer token. Its protection comes from an explicit response contract, published-product scoping, bounded pagination, query validation, rate limiting, and no write routes.

## Expected API shape

Laravel's standard paginated Resource envelope:

- `data`: product cards containing only `id`, `name`, `slug`, optional descriptions, availability, category, brand, and image URLs.
- `links`: Laravel pagination links.
- `meta`: Laravel pagination metadata.

Do not expose internal foreign keys, barcode, deletion state, admin fields, prices, or stock quantities.

## Implementation decisions

- Fetch from a React Server Component through a central server-only API client.
- Keep `LARAVEL_API_URL` server-only; do not use a `NEXT_PUBLIC_` variable.
- Use a short request timeout, status checks, validated response structure, and a safe user-facing failure state.
- Revalidate catalogue data on a short interval so admin changes appear without a frontend deployment.
- Use strict Next Image remote patterns for Laravel media rather than a broad wildcard host.
- Render plain text only; do not inject product descriptions as HTML.
- Preserve the reference's airy editorial grid, thin rules, restrained pills, large imagery, and dark ink palette.
- Remove reference-only commerce affordances: prices, sale, account, bag, cart, and checkout.
- Keep this first slice to the home/catalogue view and its menu. Product-detail, category, and brand pages remain later slices.
- Add no new dependencies.

## Files expected to change

### Laravel

- `bootstrap/app.php`
- `routes/api.php`
- `app/Http/Controllers/Api/ProductController.php`
- `app/Http/Requests/Api/IndexProductsRequest.php`
- `app/Http/Resources/ProductResource.php`
- `tests/Feature/Api/ProductIndexTest.php`

### Next.js

- `.env.example`
- `next.config.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `app/loading.tsx`
- `app/error.tsx` only if the chosen server-rendering boundary benefits from it
- `components/catalogue/ProductCard.tsx`
- `components/catalogue/ProductGrid.tsx`
- `components/layout/SiteHeader.tsx`
- `lib/api/client.ts`
- `lib/api/products.ts`
- `types/api.ts`
- `types/product.ts`

## UI behaviour

- A responsive editorial header and catalogue menu.
- A concise paint-and-tools hero.
- A paginated first product grid using real Laravel products and media.
- Product cards show image, name, brand/category when present, and a compact availability label.
- Missing media uses a designed CSS fallback, not fabricated product imagery.
- Links that need future pages are not presented as working controls yet.

## Responsive behaviour

- Four columns on wide screens, two on tablets, one on small phones.
- Header navigation collapses without requiring a heavy client-side menu in this first slice.
