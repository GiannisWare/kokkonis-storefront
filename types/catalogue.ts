export interface CatalogueCategory {
  name: string;
  slug: string;
  products_count: number;
  children: Array<Omit<CatalogueCategory, "children">>;
}

export interface CatalogueBrand {
  name: string;
  slug: string;
  products_count: number;
}

export interface CatalogueAttributeValue {
  value: string;
  slug: string;
  swatch_hex: string | null;
  products_count: number;
}

export interface CatalogueAttribute {
  name: string;
  slug: string;
  values: CatalogueAttributeValue[];
}

export interface CatalogueOption {
  value: string;
  label: string;
}

export interface CatalogueFilters {
  categories: CatalogueCategory[];
  brands: CatalogueBrand[];
  attributes: CatalogueAttribute[];
  availability: CatalogueOption[];
  sorts: CatalogueOption[];
}

export interface ProductQuery {
  page?: number;
  perPage?: number;
  q?: string;
  category?: string;
  brand?: string;
  attributes?: string[];
  availability?: string;
  sort?: string;
}
