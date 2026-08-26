import Image from "next/image";
import { StoryFlowLink } from "@/components/home/StoryFlowLink";
import { StoryProduct } from "@/components/home/StoryProduct";
import type { Product } from "@/types/product";

export function PaintStoryProducts({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="paint-story-products-title" className="paint-story__panel paint-story__panel--products">
      <h2 id="paint-story-products-title">Built to last</h2>

      <div aria-hidden="true" className="paint-story__mobile-brush paint-story__mobile-brush--products">
        <Image alt="" fill sizes="90vw" src="/images/paint-brush-cutout.png" />
      </div>

      {products.length > 0 && (
        <div className="paint-story__product-slices paint-story__product-slices--finale">
          {products.map((product, index) => <StoryProduct index={index} key={product.id} product={product} />)}
        </div>
      )}

      <div className="paint-story__finale-action">
        <StoryFlowLink href="/products" label="View all products" />
      </div>
    </section>
  );
}
