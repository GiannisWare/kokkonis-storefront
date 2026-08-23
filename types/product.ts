export interface NamedEntity {
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  alt: string;
  original: string;
  thumb: string;
  card: string;
  medium: string;
  large: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  availability: {
    value: string;
    label: string;
  };
  category: NamedEntity | null;
  brand: NamedEntity | null;
  images: ProductImage[];
  image: ProductImage | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedProducts {
  data: Product[];
  meta: PaginationMeta;
}
