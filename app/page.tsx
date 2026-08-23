import Link from "next/link";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { getProducts } from "@/lib/api/products";
import { getStorefrontConfiguration } from "@/lib/api/storefront";
import { fallbackStorefront } from "@/types/storefront";

export default async function Home() {
  const [catalogue, configuration] = await Promise.all([
    getProducts({ page: 1, perPage: 3 }).catch(() => null),
    getStorefrontConfiguration().catch(() => fallbackStorefront),
  ]);

  return (
    <main id="top">
      <HeroCarousel slides={configuration.hero_slides} />

      <section
        className="catalogue catalogue--preview"
        id="catalogue"
        aria-labelledby="catalogue-title"
      >
        <header className="section-heading">
          <h2 id="catalogue-title">Featured products</h2>
          <Link href="/products">View all</Link>
        </header>

        {catalogue === null ? (
          <div className="catalogue-state catalogue-state--compact">
            <p className="eyebrow">Temporarily unavailable</p>
            <h3>We could not load the catalogue.</h3>
            <p>Confirm Laravel is running locally, then refresh this page.</p>
          </div>
        ) : catalogue.data.length > 0 ? (
          <ProductGrid products={catalogue.data} />
        ) : (
          <div className="catalogue-state catalogue-state--compact">
            <p className="eyebrow">Catalogue update in progress</p>
            <h3>No published products yet.</h3>
            <p>Products will appear after they are published in the admin.</p>
          </div>
        )}
      </section>

    </main>
  );
}
