import type { Metadata } from "next";
import Link from "next/link";
import { CatalogueFiltersPanel, type SelectedFilters } from "@/components/catalogue/CatalogueFilters";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { getCatalogueFilters } from "@/lib/api/catalogue";
import { getProducts } from "@/lib/api/products";

export const metadata: Metadata = {
  title: "All Products | Kokkonios",
  description: "Browse every published product in the Kokkonios catalogue.",
};

function readPage(value: string | string[] | undefined): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(rawValue ?? "1", 10);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function readString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function readArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function pageHref(params: Record<string, string | string[] | undefined>, page: number): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined || value === "") continue;
    for (const entry of Array.isArray(value) ? value : [value]) query.append(key, entry);
  }
  query.set("page", String(page));
  return `/products?${query.toString()}`;
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const params = await searchParams;
  const requestedPage = readPage(params.page);
  const selected: SelectedFilters = {
    q: readString(params.q),
    category: readString(params.category),
    brand: readString(params.brand),
    attributes: readArray(params.attributes),
    availability: readString(params.availability),
    sort: readString(params.sort) || "recommended",
  };
  const [catalogue, filters] = await Promise.all([
    getProducts({ page: requestedPage, perPage: 24, ...selected }).catch(() => null),
    getCatalogueFilters().catch(() => null),
  ]);

  return (
    <main id="top">
      <section className="catalogue catalogue--all" aria-labelledby="catalogue-title">
        <header className="catalogue-header">
          <h1 id="catalogue-title">All products</h1>
          <p>{catalogue?.meta.total ?? 0} products</p>
        </header>

        {catalogue === null || filters === null ? (
          <div className="catalogue-state">
            <p className="eyebrow">Temporarily unavailable</p>
            <h2>We could not load the catalogue.</h2>
            <p>Confirm Laravel is running locally, then try again.</p>
            <Link href="/products">Try again</Link>
          </div>
        ) : (
          <form action="/products" method="get" className="catalogue-form">
            <CatalogueFiltersPanel filters={filters} selected={selected} />
            <div className="catalogue-results">
              {catalogue.data.length > 0 ? <ProductGrid products={catalogue.data} /> : (
                <div className="catalogue-state catalogue-state--results">
                  <p className="eyebrow">No matches</p><h2>No products match these filters.</h2>
                  <p>Try removing a filter or using a broader search.</p><Link href="/products">Clear all filters</Link>
                </div>
              )}
            </div>
            {catalogue.data.length > 0 && (
            <nav className="pagination" aria-label="Product catalogue pages">
              <p>
                Showing {catalogue.meta.from}–{catalogue.meta.to} of {catalogue.meta.total}{" "}
                products
              </p>
              <div className="pagination__links">
                {catalogue.meta.current_page > 1 && (
                  <Link href={pageHref(params, catalogue.meta.current_page - 1)}>
                    Previous
                  </Link>
                )}
                {catalogue.meta.current_page < catalogue.meta.last_page && (
                  <Link href={pageHref(params, catalogue.meta.current_page + 1)}>
                    Next <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </nav>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
