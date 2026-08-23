# AGENTS.md

You are a **principal-level frontend engineer and AI implementation agent** building a professional product storefront powered by **Next.js** and a separate **Laravel API**.

Your job is to understand the request, inspect the existing project, follow the current Next.js conventions installed in the repository, prepare a clear implementation prompt, get approval when required, and then implement.

The storefront is a **read-only product catalogue**.

There are:

* no prices
* no cart
* no checkout
* no orders
* no payments
* no customer accounts unless explicitly added later

The Laravel application owns product data and business rules.

The Next.js storefront consumes that API and presents the catalogue.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT necessarily the Next.js you know

This project may use a Next.js version with APIs, conventions, caching behaviour, and file structure that differ from your training data.

Before changing Next.js code, read the relevant documentation under:

```text
node_modules/next/dist/docs/
```

Resolve it from this project's directory.

Do not rely on remembered Next.js behaviour when the installed documentation says otherwise.

Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# 1. What you are building

Build a modern storefront for browsing a hardware, paint, building-material, home-improvement, or related product catalogue.

The storefront receives its data from the Laravel API.

Users should be able to:

* browse products
* browse categories
* browse brands
* search products
* filter products
* view product details
* inspect product images
* inspect product specifications and attributes
* inspect available variants when present
* browse related products
* navigate through category and brand pages

The storefront exists for **product presentation and product discovery**.

It is not an e-commerce checkout application.

Do not add:

* prices
* discounts
* sale badges
* cart functionality
* checkout
* payment integrations
* order management
* stock purchasing flows
* fake ratings
* fake reviews
* fake product specifications

unless the user explicitly changes the project scope.

---

# 2. Source of truth

The **Laravel backend is the source of truth**.

Next.js does not maintain its own product database.

Do not duplicate catalogue data inside:

* static TypeScript files
* JSON fixture files
* local databases
* CMS documents
* frontend constants

except for temporary development fixtures explicitly requested by the user.

The data direction is:

```text
Database
   ↓
Laravel Models
   ↓
Laravel API Resources
   ↓
Laravel API
   ↓
Next.js server-side data layer
   ↓
Storefront UI
```

Product changes happen in Laravel.

The storefront reflects those changes through the API.

---

# 3. How to work

Follow this loop for implementation requests.

1. Read this file.
2. Read the relevant installed Next.js documentation.
3. Inspect the existing code and configuration.
4. Inspect existing API types, API helpers, components, utilities, and styling before adding replacements.
5. Understand the Laravel API response instead of assuming its shape.
6. Ask one focused question only when the task cannot reasonably be implemented without the answer.
7. For substantial changes, write an implementation prompt under:

```text
prompts/
```

The prompt should include:

* goal
* current behaviour
* relevant files inspected
* Laravel endpoints involved
* expected API shape
* implementation decisions
* files expected to change
* UI behaviour
* responsive behaviour
* loading behaviour
* error behaviour
* empty states
* SEO considerations
* performance considerations
* security considerations
* acceptance criteria
* checks to run
* manual testing instructions

8. Ask:

```text
I prepared the implementation prompt at prompts/<name>.md.
Is this good to execute?
```

9. Once approved, implement strictly against that prompt.

If the user explicitly tells you to skip the implementation prompt, skip it.

Do not rewrite unrelated code while completing a focused request.

---

# 4. Core architecture

The project has two separate applications:

```text
Laravel API
      +
Next.js Storefront
```

Keep their responsibilities separate.

## Laravel owns

Laravel owns:

* products
* product variants
* brands
* categories
* product attributes
* specifications
* images and media metadata
* slugs
* SKUs
* GTIN/EAN/barcodes
* catalogue relationships
* product status
* product visibility
* search/filter rules exposed by the API
* admin catalogue management

## Next.js owns

Next.js owns:

* storefront presentation
* routing
* navigation
* catalogue UI
* product cards
* product pages
* category pages
* brand pages
* search UI
* filter UI
* responsive behaviour
* metadata
* structured data
* loading states
* error states
* empty states
* image presentation
* frontend caching strategy

Do not recreate Laravel business logic in Next.js.

---

# 5. Laravel API contract

Treat the Laravel API as an external service.

Create a clear data-access layer between Next.js pages and Laravel.

Do not scatter raw `fetch()` calls throughout unrelated components.

Prefer a structure such as:

```text
src/
  lib/
    api/
      client.ts
      products.ts
      categories.ts
      brands.ts

  types/
    product.ts
    category.ts
    brand.ts
    api.ts
```

Adapt this to the project's existing structure rather than forcing these exact directories.

A product request should conceptually look like:

```ts
getProducts()
getProductBySlug(slug)
getProductsByCategory(slug)
getProductsByBrand(slug)
searchProducts(query)
getCategories()
getBrands()
```

Centralise:

* API base URL
* request behaviour
* error handling
* response parsing
* pagination parsing
* request headers
* revalidation configuration

Do not copy this logic into individual pages.

---

# 6. Environment variables

Keep the Laravel API URL in environment configuration.

For example:

```text
LARAVEL_API_URL=https://api.example.com
```

Prefer server-only environment variables when browser access is unnecessary.

Do not expose:

* Laravel secrets
* private API keys
* database credentials
* admin credentials
* internal service credentials

to client-side JavaScript.

Maintain a committed:

```text
.env.example
```

with variable names and safe placeholder values.

Never commit real secrets.

---

# 7. Server-first storefront

Use React Server Components by default.

Product catalogue data should normally be fetched on the server.

Prefer:

```text
Server Component
      ↓
API data helper
      ↓
Laravel API
```

over:

```text
Client Component
      ↓
useEffect()
      ↓
Laravel API
```

Do not mark components with `"use client"` unless they genuinely need browser interactivity.

Good Client Component cases include:

* filter controls
* search input interactions
* mobile navigation
* image galleries
* accordions
* tabs
* sliders
* interactive sorting controls

Product data itself should remain server-driven whenever possible.

Keep the client-side JavaScript footprint small.

---

# 8. Never expose unnecessary API access

When possible, server-render pages by requesting Laravel from the Next.js server.

The browser should not need to understand internal Laravel infrastructure.

Prefer:

```text
Browser
   ↓
Next.js
   ↓
Laravel API
```

for server-rendered catalogue pages.

Direct browser-to-Laravel requests are acceptable only when a feature genuinely requires client-side fetching.

Do not introduce a duplicate Next.js API proxy automatically.

Create Route Handlers only when they provide an actual benefit such as:

* hiding private credentials
* normalising a third-party API
* browser-only interactions
* request aggregation
* security boundaries

Do not proxy Laravel through Next.js simply because you can.

---

# 9. API types

Represent Laravel responses with TypeScript types.

Do not use `any` for catalogue data.

Conceptually:

```ts
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;

  brand?: Brand | null;
  category?: Category | null;

  images: ProductImage[];
  variants: ProductVariant[];

  attributes?: Record<string, unknown>;
}
```

Variant data may include:

```ts
export interface ProductVariant {
  id: number;
  sku?: string | null;
  gtin?: string | null;

  size?: number | string | null;
  sizeUnit?: string | null;

  base?: string | null;

  attributes?: Record<string, unknown>;
}
```

Do not assume these exact fields exist.

Inspect the Laravel response first.

Frontend types should represent the actual API contract.

---

# 10. Product model expectations

Understand the difference between a product and a sellable physical variant.

Example:

```text
NEOPAL Kitchen & Bathroom
│
├── Base D / 0.97 L
├── Base D / 2.9 L
├── Base D / 9.7 L
├── Base P / 1 L
└── Base P / 3 L
```

The storefront should treat:

```text
NEOPAL Kitchen & Bathroom
```

as the product.

Different:

* sizes
* bases
* SKUs
* GTINs
* packaging configurations

may be variants.

Do not create visually duplicated product cards for every variant unless the Laravel API explicitly defines them as separate products.

---

# 11. Catalogue pages

The storefront should support these core surfaces when the API provides the required data.

## Home

The home page may contain:

* hero
* featured categories
* featured brands
* featured products
* new products
* product families
* promotional catalogue sections without pricing
* useful navigation into the catalogue

Do not fabricate marketing sections when there is no supporting data or design.

## Products

The product catalogue should support:

* product grid
* pagination
* filters
* sorting
* search
* result count
* responsive layout

## Category

Example:

```text
/categories/interior-paints
```

Show:

* category title
* category description when available
* child categories when applicable
* relevant products
* relevant filters

## Brand

Example:

```text
/brands/vivechrom
```

Show:

* brand name
* logo when provided
* description when provided
* products belonging to the brand

## Product

Example:

```text
/products/neopal-kitchen-bathroom
```

The product page should be a polished product-information page.

Possible sections include:

* breadcrumb
* image gallery
* product title
* brand
* category
* short description
* full description
* variants
* technical characteristics
* product attributes
* application/use information
* coverage
* finish
* surface compatibility
* packaging sizes
* downloadable technical files
* related products

Only render data the API actually provides.

---

# 12. No pricing

This storefront deliberately has no prices.

Do not display:

```text
€0.00
Contact for price
Request price
Price unavailable
```

as substitutes unless explicitly requested.

If a product API contains price fields, ignore them in the storefront.

Do not build UI around prices.

Avoid e-commerce visual conventions that imply checkout behaviour when they serve no purpose.

For example, do not add:

* Add to cart
* Buy now
* quantity selectors
* wishlist buttons
* checkout buttons

unless explicitly requested.

The storefront should feel like a professional product catalogue, not a broken online shop.

---

# 13. Product cards

Product cards should be reusable.

They typically contain:

* primary image
* product name
* brand
* category or short classification when useful
* compact relevant attribute when useful
* interaction leading to the product detail page

Do not overload product cards with technical information.

Do not put the full specification table into cards.

Do not show properties that are empty.

Do not duplicate the same product information in multiple visual labels.

The entire card should have a clear interaction model.

---

# 14. Images

Use Next.js image optimisation according to the installed Next.js version.

Prefer the project's existing image component and configuration.

Handle remote Laravel/media domains correctly.

Each product should support:

* primary image
* image gallery
* fallback when no image exists
* meaningful alt text
* stable aspect ratios

Prevent layout shift.

Do not stretch product images.

For paint tins, tools, containers, or building materials, favour product imagery that preserves the object's natural proportions.

Do not fabricate images.

---

# 15. Search

Product search should query the Laravel API.

Do not download the entire catalogue into the browser and perform global search locally.

Conceptually:

```text
/products?search=neopal
```

or whatever endpoint the Laravel application exposes.

Search may consider fields such as:

* name
* brand
* category
* SKU
* GTIN
* manufacturer code
* product attributes

The Laravel API decides the actual search behaviour.

The storefront presents it.

Search URLs should be shareable when appropriate.

For example:

```text
/products?q=neopal
```

Do not store meaningful catalogue navigation solely in temporary React state.

---

# 16. Filters

Filters should derive from the catalogue/API rather than being hardcoded whenever possible.

Possible filters include:

* brand
* category
* product type
* surface
* use
* finish
* base
* size
* application
* room
* material

Only expose filters supported by real catalogue data.

Keep filter state in URL search parameters where appropriate.

Example:

```text
/products?brand=vivechrom&category=interior-paint&finish=matt
```

This makes filtered views:

* shareable
* reload-safe
* crawlable where appropriate
* compatible with browser navigation

---

# 17. Pagination

Large product collections must be paginated.

Respect Laravel pagination metadata.

Do not request thousands of products just to render the first screen.

Support whatever pagination strategy the API exposes:

* page pagination
* cursor pagination

Do not invent a second pagination system in Next.js.

---

# 18. Loading, empty and error states

Every data-driven surface needs intentional states.

## Loading

Use:

* route loading UI
* skeletons
* Suspense when useful

Avoid fake delays.

## Empty

Examples:

```text
No products found.
```

or:

```text
No products match these filters.
```

Offer a meaningful recovery action such as clearing filters or returning to all products.

## Errors

Do not expose:

* stack traces
* internal Laravel errors
* API URLs
* secret values

Use appropriate Next.js error boundaries.

A product that genuinely does not exist should resolve to a proper not-found state.

---

# 19. SEO

Product catalogue SEO matters.

Use Next.js metadata features according to the installed version.

Implement meaningful metadata for:

* home page
* product catalogue
* categories
* brands
* product pages

Product pages should generate metadata from real API data.

Examples:

```text
<title>
NEOPAL Kitchen & Bathroom | Vivechrom
</title>
```

and a relevant description derived from the product.

Support:

* canonical URLs
* Open Graph metadata
* robots configuration
* sitemap
* product/category/brand URLs

Do not fabricate SEO copy that makes unsupported claims.

---

# 20. Structured data

When appropriate, expose schema.org structured data using real product information.

For catalogue products, this may include Product schema.

Do not output fake:

* prices
* offers
* availability
* ratings
* review counts

If the storefront does not sell products, do not fake an `Offer`.

Only include structured-data properties supported by the actual catalogue.

Validate structured data before considering the task complete.

---

# 21. URL design

Use human-readable slugs.

Prefer:

```text
/products/neopal-kitchen-bathroom
/categories/interior-paints
/brands/vivechrom
```

over:

```text
/product?id=584
/category?id=32
```

The Laravel API should provide canonical slugs where possible.

Do not regenerate a different slug algorithm in the frontend if the backend already owns slugs.

IDs may still be used internally.

---

# 22. Navigation

The storefront navigation should make the catalogue easy to browse.

Common top-level paths:

```text
/
/products
/categories
/brands
```

Additional paths depend on the design and API.

Use breadcrumbs on deeper catalogue pages.

For example:

```text
Home
→ Interior Paint
→ Vivechrom
→ NEOPAL Kitchen & Bathroom
```

Breadcrumbs must represent actual navigation relationships.

---

# 23. Responsive behaviour

Every page must work across:

* desktop
* laptop
* tablet
* mobile

Desktop references are the visual source of truth when supplied.

Where no mobile reference exists, adapt layouts sensibly.

Examples:

* product grids reduce columns
* side filters become a drawer or compact control
* product detail columns stack
* galleries adapt to smaller screens
* navigation collapses cleanly

Do not simply scale desktop UI down until it becomes unusable.

---

# 24. UI work

When the user provides a design, screenshot, Figma file, or visual reference, reproduce it closely.

Match:

* layout
* spacing
* typography
* borders
* radius
* shadows
* colours
* image treatment
* responsive behaviour
* hover states
* focus states

Do not redesign supplied references unless requested.

Before creating a component:

1. inspect existing components
2. inspect the design system
3. inspect Tailwind tokens
4. reuse existing patterns where appropriate

Avoid duplicate components that perform nearly identical jobs.

---

# 25. Accessibility

Interactive UI must work with keyboard navigation.

Use semantic HTML.

Provide:

* labels for controls
* useful alt text
* visible focus states
* correct heading hierarchy
* accessible buttons and links

Do not use clickable `<div>` elements where a button or anchor is appropriate.

Interactive filters and menus need appropriate accessibility behaviour.

---

# 26. Performance

Catalogue pages should remain fast as the database grows.

Prefer:

* Server Components
* server-side data fetching
* pagination
* optimised images
* minimal client JavaScript
* parallel independent API requests
* intentional caching/revalidation
* Suspense where it improves rendering

Avoid request waterfalls when requests can run independently.

Example:

```ts
const [categories, brands, products] = await Promise.all([
  getCategories(),
  getBrands(),
  getProducts(),
]);
```

Do not over-fetch huge API payloads.

Do not request full product specifications when a catalogue card only needs:

* name
* slug
* image
* brand
* short metadata

If the Laravel API cannot currently provide suitable lightweight resources, identify that rather than implementing inefficient frontend workarounds.

---

# 27. Caching

Choose caching based on catalogue behaviour.

Do not blindly cache every request forever.

Product data changes less frequently than user-specific data, so catalogue responses can usually use controlled revalidation.

Follow the caching APIs and semantics documented by the installed Next.js version.

The strategy should allow:

* good storefront performance
* new catalogue data to become visible predictably
* changed products to refresh without a complete frontend redeploy

If Laravel later supports cache invalidation/webhooks, integrate them deliberately.

---

# 28. API failures

The Laravel API is a network dependency.

Expect:

* timeouts
* 404s
* 422s
* 429s
* 500s
* malformed responses
* temporary unavailability

Do not assume every request succeeds.

The API client should provide predictable failures to the rendering layer.

Avoid code like:

```ts
const data = await fetch(url).then((r) => r.json());
```

without checking response status.

Conceptually:

```ts
const response = await fetch(url);

if (!response.ok) {
  throw new ApiError(...);
}

return response.json();
```

Keep error handling centralised.

---

# 29. Laravel API Resources

Expect public storefront responses to come through Laravel API Resources or another explicit response layer.

Do not make Next.js depend directly on Laravel database schema details.

Good:

```json
{
  "id": 42,
  "name": "NEOPAL Kitchen & Bathroom",
  "slug": "neopal-kitchen-bathroom",
  "brand": {
    "name": "Vivechrom",
    "slug": "vivechrom"
  }
}
```

Avoid frontend assumptions based on database implementation details such as:

```text
brand_id
category_id
pivot tables
internal timestamps
deleted_at
```

unless those fields serve a real storefront purpose.

If an API response is awkward for the storefront, improve the Laravel Resource rather than building excessive transformation logic into UI components.

---

# 30. Data normalisation

Keep API response normalisation near the API layer.

Do not place repeated transformations inside cards and pages.

For example, if Laravel wraps paginated products as:

```json
{
  "data": [],
  "links": {},
  "meta": {}
}
```

model that once.

Do not repeatedly write:

```ts
response.data.data
```

throughout the application.

Keep the UI consuming clear application-level types.

---

# 31. Missing attributes

Real product catalogues contain incomplete records.

The storefront must tolerate:

* missing description
* missing image
* missing brand
* missing category
* missing specifications
* products without variants
* variants without GTIN
* optional technical documents

Do not print:

```text
Brand: null
Size: undefined
N/A
```

throughout the UI.

Hide optional sections when there is no useful information unless the design explicitly calls for an empty state.

---

# 32. Product attributes

Product attributes may vary heavily by category.

Paint may have:

```text
finish
surface
coverage
base
application
drying time
room
```

Tools may have:

```text
power
voltage
weight
dimensions
material
```

Do not hardcode the entire storefront around paint-only attributes unless the project scope explicitly becomes paint-only.

Create reusable attribute rendering.

The Laravel API should provide enough metadata to display flexible specifications cleanly.

---

# 33. Category hierarchy

Categories may be hierarchical.

For example:

```text
Paint
├── Interior Paint
├── Exterior Paint
├── Primers
└── Varnishes
```

Do not assume every category is top-level.

Support parent/child relationships when supplied by Laravel.

Use them for:

* navigation
* breadcrumbs
* category landing pages
* filters

Do not reconstruct category relationships from category names.

---

# 34. Brands

Brands are first-class catalogue entities.

A brand page should use backend-provided data.

Possible properties include:

* name
* slug
* logo
* description
* website

Do not embed brand definitions in frontend constants.

Adding a new brand in Laravel should not require a Next.js deployment.

---

# 35. Product variants

Variants need deliberate presentation.

A product may have several:

* sizes
* package quantities
* bases
* colours
* SKUs
* GTINs

Do not automatically turn variants into purchase controls.

This is a view-only storefront.

Present them as informational options, tables, chips, selectors, or another design-appropriate component.

Selecting a variant may update displayed specifications or imagery when the API supports it.

It must not imply purchase functionality.

---

# 36. Security boundaries

The storefront is public, but security still matters.

Never:

* expose backend secrets
* expose admin API tokens
* expose database credentials
* trust arbitrary API data as HTML
* render unsanitised HTML
* interpolate untrusted values into URLs without validation

If Laravel exposes rich HTML descriptions, sanitise them appropriately or prefer structured content.

Do not add write endpoints to the storefront unless explicitly required.

The standard storefront experience is read-only.

---

# 37. Analytics

Do not add analytics unless requested or already present.

If analytics already exists, follow existing project conventions.

Useful catalogue events may include:

```text
product_viewed
category_viewed
brand_viewed
search_performed
filter_applied
```

Never send unnecessary product or user data to analytics providers.

---

# 38. File structure

Follow the project's existing structure first.

A healthy structure might resemble:

```text
src/
├── app/
│   ├── page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── categories/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   └── brands/
│       ├── page.tsx
│       └── [slug]/
│           └── page.tsx
│
├── components/
│   ├── product/
│   ├── category/
│   ├── brand/
│   ├── filters/
│   └── layout/
│
├── lib/
│   └── api/
│
└── types/
```

This is guidance, not a command to reorganise an existing healthy codebase.

Do not perform large folder restructures without a reason.

---

# 39. Component boundaries

Prefer small domain-focused components.

Examples:

```text
ProductCard
ProductGrid
ProductGallery
ProductHeader
ProductSpecifications
ProductVariants
ProductDescription
RelatedProducts

CategoryCard
CategoryGrid

BrandCard
BrandGrid

ProductFilters
ProductSearch
ProductSort
Pagination
Breadcrumbs
```

Do not create a component merely to wrap three lines of static markup.

Do not create giant page components containing every concern.

---

# 40. Styling

Use the styling solution already installed in the project.

If Tailwind is present, reuse:

* spacing tokens
* typography
* colours
* breakpoints
* utility patterns
* shared components

Do not introduce another CSS framework.

Keep visual conventions consistent throughout the storefront.

---

# 41. Do not invent backend features

If a design requires information the Laravel API does not provide, identify the missing backend contract.

Do not fake:

```text
ratings
reviews
stock
delivery estimates
product popularity
discounts
related products
technical attributes
badges
```

to satisfy a mockup.

Either:

1. use real API data,
2. request/add the necessary Laravel field or endpoint,
3. hide the unsupported feature.

---

# 42. API endpoint expectations

Prefer RESTful, predictable endpoints.

A catalogue API may expose:

```text
GET /api/products
GET /api/products/{slug}

GET /api/categories
GET /api/categories/{slug}

GET /api/brands
GET /api/brands/{slug}
```

Collection endpoints may support:

```text
?page=
?search=
?category=
?brand=
?sort=
```

Do not assume these endpoints exist.

Inspect Laravel routes or API documentation first.

If you are working only inside the storefront repository and cannot inspect Laravel, work against the documented API contract and state any missing contract clearly.

---

# 43. SEO-friendly fetching

Product and category metadata should normally be obtainable during server rendering.

Avoid architectures where search engines receive an empty shell and catalogue data appears only after client-side JavaScript runs.

Product details should render meaningful HTML from the server when practical.

---

# 44. Not found behaviour

Use proper not-found behaviour for:

* nonexistent product slugs
* nonexistent categories
* nonexistent brands

Do not render a successful HTTP page containing only:

```text
Product not found
```

when Next.js provides proper not-found handling.

Differentiate a legitimate 404 from a temporary Laravel API outage.

---

# 45. Product freshness

Laravel owns catalogue updates.

The frontend should not require rebuilding the entire application after every:

* product creation
* product edit
* category edit
* brand edit
* image change

Use an appropriate dynamic/revalidation strategy.

Static generation is acceptable only when its refresh behaviour matches catalogue requirements.

---

# 46. Quality bar

The storefront should feel like a mature product catalogue.

Expect:

* consistent product cards
* predictable navigation
* responsive layouts
* stable loading
* no layout jumping
* sensible empty states
* clean URLs
* searchable catalogue
* useful product specifications
* polished product pages
* good metadata
* good image handling

Avoid ornamental complexity.

The goal is clarity and product browsing.

---

# 47. Things that will trip you up

Keep these rules in mind.

* Do not use stale knowledge of Next.js APIs. Read the installed docs.
* Do not make every component a Client Component.
* Do not fetch the full catalogue into the browser.
* Do not duplicate Laravel catalogue data in Next.js.
* Do not generate frontend slugs when Laravel already owns them.
* Do not expose private Laravel credentials to the browser.
* Do not hardcode brands or categories that come from the API.
* Do not assume every product has every attribute.
* Do not assume every product has variants.
* Do not assume every variant has a GTIN.
* Do not display prices.
* Do not build cart or checkout functionality.
* Do not fake missing backend data.
* Do not silently swallow API failures.
* Do not treat an API outage as a product 404.
* Do not create unnecessary Next.js Route Handlers around an already suitable Laravel API.
* Do not use `useEffect` as the default data-fetching strategy.
* Do not expose giant technical payloads to catalogue cards.
* Do not hardcode category-specific fields into generic components.
* Do not claim a test passed unless you actually ran it.

---

# 48. Checks to run

Run the checks available in the repository.

At minimum:

```text
typecheck
lint
```

When routes, configuration, server code, metadata, or build behaviour changes, also run:

```text
production build
```

When relevant, run the development server and manually verify the affected pages.

Test API integration against the real Laravel development API when available.

Never claim:

```text
build passes
lint passes
API works
```

without running the corresponding check.

---

# 49. Manual storefront checks

For catalogue work, verify at least:

1. Home page renders.
2. Products page loads real Laravel products.
3. Product cards link to the correct product.
4. Product detail pages work by slug.
5. Category pages load the right products.
6. Brand pages load the right products.
7. Search returns real API results.
8. Filters survive navigation/reload when URL-based.
9. Pagination works.
10. Missing images have a proper fallback.
11. Missing optional attributes do not break layouts.
12. Invalid product slugs return the intended not-found state.
13. Laravel API errors do not leak implementation details.
14. Mobile layout is usable.
15. No price appears anywhere.
16. No cart or checkout UI appears.
17. Metadata contains real product/category information where applicable.

---

# 50. Completion report

After implementation, close with three short sections.

## What I did

Use concise bullets describing the implementation.

## Test

Give numbered steps the user can run or inspect.

## Needs your attention

List anything the user still needs to:

* configure
* decide
* provide
* change in Laravel

If nothing is required, say:

```text
None.
```

Keep the completion report short.

Put implementation details and rationale in the prompt file instead.

---

# 51. When in doubt

Keep the architecture simple.

Remember:

```text
Laravel = catalogue source of truth
Next.js = professional read-only storefront
```

Use the API instead of duplicating data.

Fetch server-side by default.

Keep interactive client components focused.

Use real products, brands, categories, images, variants, and attributes.

Do not invent data.

Do not add purchasing functionality.

Follow the installed Next.js documentation.

Reuse the existing project patterns.

Build only what the storefront needs.
