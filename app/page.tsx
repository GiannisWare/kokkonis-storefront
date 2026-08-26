import { PaintStory } from "@/components/home/PaintStory";
import { getProducts } from "@/lib/api/products";
import { getStorefrontConfiguration } from "@/lib/api/storefront";
import { fallbackStorefront } from "@/types/storefront";

export default async function Home() {
  const [paintCatalogue, configuration] = await Promise.all([
    getProducts({ page: 1, perPage: 8, category: "paints" }).catch(() => null),
    getStorefrontConfiguration().catch(() => fallbackStorefront),
  ]);

  return (
    <main id="top">
      <PaintStory configuration={configuration} products={paintCatalogue?.data ?? []} slides={configuration.hero_slides} />
    </main>
  );
}
