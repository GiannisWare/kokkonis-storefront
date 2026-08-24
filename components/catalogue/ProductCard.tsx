import Image from "next/image";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  index: number;
}

const placeholderImages = [
  "/images/placeholders/paint-tin.png",
  "/images/placeholders/paint-brush.png",
  "/images/placeholders/paint-roller.png",
  "/images/placeholders/masking-tape.png",
];

export function ProductCard({ product, index }: ProductCardProps) {
  const metadata = [product.brand?.name, product.category?.name]
    .filter((value): value is string => Boolean(value))
    .join(" · ");

  return (
    <article className="product-card">
      <div className="product-card__media">
        <Image
          src={product.image?.card ?? placeholderImages[index % placeholderImages.length]}
          alt={product.image?.alt ?? ""}
          fill
          loading={index < 3 ? "eager" : "lazy"}
          sizes="(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 33vw"
          unoptimized={process.env.NODE_ENV === "development"}
        />
      </div>
      <div className="product-card__details">
        <h3>{product.name}</h3>
        <p className="product-card__meta">{metadata || "Catalogue product"}</p>
        <p className="product-card__availability">{product.availability.label}</p>
      </div>
    </article>
  );
}
