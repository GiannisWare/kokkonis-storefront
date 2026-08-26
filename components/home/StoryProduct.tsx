import Image from "next/image";
import type { Product } from "@/types/product";

const PLACEHOLDERS = [
  "/images/placeholders/paint-tin.png",
  "/images/placeholders/paint-brush.png",
  "/images/placeholders/paint-roller.png",
] as const;

export function StoryProduct({ product, index }: { product: Product; index: number }) {
  const metadata = [product.brand?.name, product.category?.name]
    .filter((value): value is string => Boolean(value))
    .join(" · ");

  return (
    <article className="story-product">
      <div className="story-product__media">
        <Image
          alt={product.image?.alt ?? ""}
          fill
          sizes="(max-width: 899px) 76vw, 22vw"
          src={product.image?.medium ?? PLACEHOLDERS[index % PLACEHOLDERS.length]}
          unoptimized={process.env.NODE_ENV === "development"}
        />
      </div>
      <div className="story-product__copy">
        <p>{metadata || "Catalogue product"}</p>
        <h3>{product.name}</h3>
      </div>
    </article>
  );
}
