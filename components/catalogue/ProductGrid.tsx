import { ProductCard } from "@/components/catalogue/ProductCard";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard product={product} index={index} key={product.id} />
      ))}
    </div>
  );
}
