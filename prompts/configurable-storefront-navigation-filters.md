# Configurable storefront navigation, carousel, filters, and footer

## Goal

Make Laravel the source of truth for the storefront header navigation, submenu items, brand logo and supporting copy, home carousel, footer content, category navigation, catalogue filters, and catalogue sorting. Reproduce the supplied Kokkonios catalogue reference closely while keeping the application a view-only catalogue with no pricing or purchasing controls.

## Current behaviour

- The Next.js header contains hardcoded `Home` and `All products` links.
- `Kokkonios` is hardcoded as text and there is no storefront-logo setting.
- The home hero is a static product collage rather than a carousel.
- The footer is duplicated between pages and is not configurable.
- Laravel exposes only `GET /api/v1/products`, with page and per-page parameters.
- The products page has no functional search, category, brand, attribute, availability, or sorting controls.
- Categories already support nesting and products already use the attribute/value EAV structure.

## Language and scope

- **Menu**: the public storefront navigation managed by staff, not Filament's own sidebar navigation.
- **Submenu**: one parent/child level in the public navigation. Deeper recursive nesting is intentionally excluded for everyday usability.
- **Configuration**: a new Filament navigation group containing Menu, Brand & footer, and Home carousel administration.
- **Carousel**: an ordered set of 1–6 active homepage campaign slides; the initial setup contains three slides for painting supplies, construction tools, and decorating tools.
- **Filters**: real Laravel-backed category, brand, availability, and filterable attribute-value constraints stored in shareable URL parameters.
- **Cached ready**: Laravel caches relatively stable storefront configuration/facet metadata, and Next.js applies controlled server-side revalidation. Product result pages remain parameter-specific and paginated.

## Relevant files inspected

### Laravel

- `app/Providers/Filament/AdminPanelProvider.php`
- `app/Http/Controllers/Api/ProductController.php`
- `app/Http/Requests/Api/IndexProductsRequest.php`
- `app/Http/Resources/ProductResource.php`
- `app/Models/Product.php`
- `app/Models/Category.php`
- category and attribute migrations
- existing Filament resources and schemas
- existing API and Filament tests

### Next.js

- `app/layout.tsx`
- `app/page.tsx`
- `app/products/page.tsx`
- `app/globals.css`
- `components/layout/SiteHeader.tsx`
- catalogue components
- `lib/api/client.ts`
- `lib/api/products.ts`
- `types/product.ts`
- installed Next.js 16 server/client, fetching, caching, revalidation, and image documentation
- `ui-registry.md`

## Official implementation references

- Filament 5 navigation groups: `https://filamentphp.com/docs/5.x/navigation/overview`
- Filament 5 resources: `https://filamentphp.com/docs/5.x/getting-started`
- Filament 5 relationship repeaters and ordering: `https://filamentphp.com/docs/5.x/forms/repeater`
- Filament 5 select validation: `https://filamentphp.com/docs/5.x/forms/select`
- Official Filament Spatie Media Library plugin: `https://filamentphp.com/plugins/filament-spatie-media-library`

## Architecture decisions

### Laravel persistence

Create three focused models rather than a generic key/value page builder:

1. `NavigationItem`
   - location: header or footer
   - optional parent item
   - label
   - destination type: home, catalogue, category, internal path, or external URL
   - optional category relation / URL
   - sort order
   - active state
   - open-in-new-tab state for external links only

2. `SiteSetting`
   - singleton record
   - site name with `Kokkonios` fallback
   - utility-bar copy
   - footer heading, description, and copyright copy
   - single `brand_logo` Spatie Media Library collection

3. `HeroSlide`
   - title, eyebrow, supporting copy, CTA label and destination
   - sort order and active state
   - single `image` Spatie Media Library collection
   - desktop-safe focal-position setting

Use reversible migrations, typed casts, factories, and a focused storefront seeder for initial configuration. The initial navigation includes Home, All products, Paints, and Construction tools; Construction tools is also created as an empty active category if it does not already exist. Seed exactly three active carousel slides.

### Filament administration

- Add the `Configuration` navigation group after Scanning.
- Add a `Menu` Filament Resource with clear destination-dependent fields, searchable category selection, parent selection constrained to top-level items in the same location, active toggles, ordering, and explanatory helper text.
- Enforce only one submenu level and prevent self-parenting/cycles.
- Add a singleton `Brand & footer` Filament custom page with the official Spatie upload field for the logo.
- Add a `Home carousel` Resource with image preview, ordering, visibility, concise campaign fields, and a six-active-slide ceiling.
- Use Phosphor icons throughout the new admin navigation/actions.
- Do not add another dependency; existing Filament, Livewire, and Media Library features are sufficient.

### Public API

Add additive, versioned, read-only endpoints:

- `GET /api/v1/storefront`
  - brand/settings
  - ordered header menu tree
  - ordered footer menu tree
  - ordered active carousel slides
- `GET /api/v1/catalogue/filters`
  - all active category trees with published-product counts
  - brands with published-product counts
  - filterable attributes and ordered values, including `swatch_hex`
  - supported availability and sort options
- Extend `GET /api/v1/products` with validated:
  - `q`
  - `category`
  - `brand`
  - `attributes[]`
  - `availability`
  - `sort`
  - existing `page` and `per_page`

Use API Resources for every response contract. Keep controllers thin. Place catalogue query construction and cached facet/configuration assembly in focused Actions or Services. Only published, non-archived products contribute to public results and counts.

### Caching

- Cache storefront configuration and filter metadata in Laravel for 60 seconds using explicit versioned keys.
- Cache corresponding Next.js server fetches for 60 seconds with separate `storefront`, `catalogue-filters`, and `products` tags.
- Product result requests remain server-rendered, URL-driven, and paginated; do not download the full catalogue into the browser.
- Administrative changes may take up to 60 seconds to appear initially. On-demand cross-application invalidation is a later deployment enhancement, not required for this phase.

### Next.js storefront

- Fetch storefront configuration in Server Components with safe Kokkonios/header/footer fallbacks.
- Replace the hardcoded header with the reference structure:
  - slim utility bar
  - uploaded logo or `Kokkonios` text fallback at top left
  - centered desktop navigation
  - accessible submenu dropdowns
  - search entry point
  - compact mobile disclosure menu
- Implement only the carousel as a small Client Component:
  - three seeded slides initially
  - previous/next controls and position indicators
  - optional six-second autoplay
  - pause on pointer hover and keyboard focus
  - stop autoplay for reduced-motion users
  - meaningful slide-image alt text
- Generate three original campaign images before UI implementation: painting supplies, construction tools, and decorating/finishing tools. No third-party logos or unsafe construction scenes.
- Create a shared configurable footer used on all storefront routes.
- Rebuild `/products` to match the supplied reference:
  - large title and result count
  - filter control row and sort select
  - persistent desktop facet rail
  - mobile filter disclosure/drawer
  - three-column desktop product grid
  - all active categories
  - category, brand, availability, and real EAV attribute filters
  - swatches for values with real `swatch_hex`
  - clear/reset controls
  - all filter and sort state encoded in the URL
  - pagination links preserve active query parameters
- Do not display pricing, discounts, bags, carts, ratings, or fake filters.

## Expected API shapes

`GET /api/v1/storefront`:

```json
{
  "data": {
    "brand": {
      "name": "Kokkonios",
      "logo": null,
      "utility_text": "Fine paints & art supplies"
    },
    "navigation": {
      "header": [],
      "footer": []
    },
    "hero_slides": [],
    "footer": {
      "heading": "Kokkonios",
      "description": "",
      "copyright": ""
    }
  }
}
```

`GET /api/v1/catalogue/filters`:

```json
{
  "data": {
    "categories": [],
    "brands": [],
    "attributes": [],
    "availability": [],
    "sorts": []
  }
}
```

## Responsive behaviour

- Desktop at 1024 px and above closely follows the supplied reference.
- Tablet uses two product columns and a compact filter control.
- Mobile uses one product column, a collapsed navigation menu, and a full-width filter disclosure.
- Menus, carousel controls, checkboxes, and sorting remain keyboard accessible.
- No horizontal overflow at 390 px.

## Loading, empty, and error behaviour

- Retain intentional route-level loading skeletons.
- Missing configuration falls back to the Kokkonios text brand and safe Home/All-products navigation.
- Missing logo renders text, never a broken image.
- Missing carousel data renders a restrained catalogue introduction rather than an empty viewport.
- Empty filter results explain that no products match and provide a clear-filters link.
- API errors remain friendly and never expose internal URLs, exceptions, or secrets.

## SEO

- Navigation and filtered catalogue results remain server-rendered.
- Category/filter URLs are shareable.
- Filter combinations retain the catalogue canonical URL unless dedicated category pages are added later.
- Do not add Product `Offer` data or commerce metadata.

## Performance

- Fetch storefront configuration, filter metadata, and products in parallel where the page needs them.
- Keep product payloads paginated at 24 items.
- Use eager loading and indexed relationship columns.
- Avoid per-filter N+1 count queries.
- Use Next Image for logo, slide, and product media with stable aspect ratios and restrictive remote patterns.
- Keep only carousel state in the client bundle.

## Security

- Validate all menu labels, URL types, relative internal URLs, permitted HTTP(S) external URLs, image MIME types, and upload sizes.
- Generate storage filenames and never trust original filenames.
- Reject `javascript:`, `data:`, protocol-relative, and malformed menu destinations.
- Ensure only admin users access Configuration resources/pages.
- Expose only active public configuration and never serialize raw models.
- Keep storage credentials and Laravel API URLs server-only.

## Files expected to change

### Laravel

- New migrations, models, factories, seeder, Resources, Form Request extensions, Actions/Services, API controllers, API Resources, and tests.
- New Filament Menu and Home carousel resources plus Brand & footer custom page.
- Existing panel provider, routes, Product controller/request, and related models where necessary.

### Next.js

- API types and parsers for storefront configuration and filters.
- Shared storefront shell/header/footer.
- Carousel Client Component.
- Catalogue filter form/sidebar and query-state helpers.
- Home and products pages, global styles, loading states, image configuration if needed, generated assets, and `ui-registry.md`.

## Acceptance criteria

- Staff can manage header/footer links and one submenu level without code changes.
- Staff can upload/replace the storefront logo; text fallback remains reliable.
- Staff can manage and order homepage slides, with three initial relevant images.
- Header, submenu, carousel, filter rail, sorting, product grid, and footer closely match the supplied reference.
- Construction tools appears in the initial navigation and active-category filter list.
- Every product/category/filter comes from Laravel.
- Filters and sorting alter the Laravel query, preserve pagination, and survive refresh/back/forward navigation.
- Filter metadata is cached and only includes real public catalogue data.
- Desktop, tablet, mobile, loading, empty, and error states work cleanly.
- No commerce functionality or data is introduced.

## Checks to run

### Laravel

- Focused Pest tests for models, Filament access/forms, API contracts, filter validation/querying, caching, menu URL safety, and publication boundaries.
- `vendor/bin/pint --dirty --format agent`
- PHPStan/Larastan if the installed analyzer can execute.
- Relevant suite, then full `php artisan test --compact`.

### Next.js

- ESLint.
- `tsc --noEmit --incremental false`.
- Production build.
- Live API/storefront verification.
- Desktop, tablet, and 390 px mobile visual checks.
- Keyboard navigation, carousel pause controls, URL filter persistence, pagination-query preservation, and console-error checks.

## Manual testing

1. Open Filament's Configuration group.
2. Upload a brand logo and confirm it replaces the text brand on the storefront.
3. Create, reorder, disable, and nest menu entries; confirm the header/footer update within 60 seconds.
4. Edit and reorder the three carousel slides; confirm controls, autoplay, pause, and mobile cropping.
5. Open `/products`, combine category, brand, availability, and attribute filters, then sort and paginate.
6. Reload and use browser back/forward; confirm URL state and results remain consistent.
7. Disable a product/category/menu item and confirm it is excluded from public responses.
8. Verify no price, cart, checkout, ratings, or fabricated values appear.
