import "server-only";
import { apiGet, ApiError, resolveMediaUrl } from "@/lib/api/client";
import type { ProductQuery } from "@/types/catalogue";
import type { PaginatedProducts, Product, ProductImage } from "@/types/product";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function parseNamedEntity(value: unknown): Product["brand"] {
  if (value === null) {
    return null;
  }

  if (!isRecord(value) || typeof value.name !== "string" || typeof value.slug !== "string") {
    throw new ApiError();
  }

  return { name: value.name, slug: value.slug };
}

function parseImage(value: unknown): ProductImage | null {
  if (value === null) {
    return null;
  }

  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.alt !== "string" ||
    typeof value.original !== "string" ||
    typeof value.thumb !== "string" ||
    typeof value.card !== "string" ||
    typeof value.medium !== "string" ||
    typeof value.large !== "string"
  ) {
    throw new ApiError();
  }

  return {
    id: value.id,
    alt: value.alt,
    original: resolveMediaUrl(value.original),
    thumb: resolveMediaUrl(value.thumb),
    card: resolveMediaUrl(value.card),
    medium: resolveMediaUrl(value.medium),
    large: resolveMediaUrl(value.large),
  };
}

function parseImages(value: unknown): ProductImage[] {
  if (!Array.isArray(value)) {
    throw new ApiError();
  }

  return value.map((image) => {
    const parsedImage = parseImage(image);

    if (parsedImage === null) {
      throw new ApiError();
    }

    return parsedImage;
  });
}

function parseProduct(value: unknown): Product {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.name !== "string" ||
    typeof value.slug !== "string" ||
    !isNullableString(value.short_description) ||
    !isNullableString(value.description) ||
    !isRecord(value.availability) ||
    typeof value.availability.value !== "string" ||
    typeof value.availability.label !== "string"
  ) {
    throw new ApiError();
  }

  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    short_description: value.short_description,
    description: value.description,
    availability: {
      value: value.availability.value,
      label: value.availability.label,
    },
    category: parseNamedEntity(value.category),
    brand: parseNamedEntity(value.brand),
    images: parseImages(value.images),
    image: parseImage(value.image),
  };
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];

  if (typeof value !== "number") {
    throw new ApiError();
  }

  return value;
}

function parsePaginatedProducts(value: unknown): PaginatedProducts {
  if (!isRecord(value) || !Array.isArray(value.data) || !isRecord(value.meta)) {
    throw new ApiError();
  }

  return {
    data: value.data.map(parseProduct),
    meta: {
      current_page: readNumber(value.meta, "current_page"),
      from: value.meta.from === null ? null : readNumber(value.meta, "from"),
      last_page: readNumber(value.meta, "last_page"),
      per_page: readNumber(value.meta, "per_page"),
      to: value.meta.to === null ? null : readNumber(value.meta, "to"),
      total: readNumber(value.meta, "total"),
    },
  };
}

export function getProducts(query: ProductQuery = {}): Promise<PaginatedProducts> {
  const safePage = Number.isSafeInteger(query.page) && (query.page ?? 0) > 0 ? query.page! : 1;
  const safePerPage = Number.isSafeInteger(query.perPage) && (query.perPage ?? 0) > 0 && (query.perPage ?? 0) <= 24
    ? query.perPage!
    : 12;
  const params = new URLSearchParams({
    page: String(safePage),
    per_page: String(safePerPage),
  });

  for (const key of ["q", "category", "brand", "availability", "sort"] as const) {
    const value = query[key];
    if (typeof value === "string" && value.trim() !== "") {
      params.set(key, value.trim());
    }
  }

  for (const attribute of query.attributes ?? []) {
    if (attribute.trim() !== "") {
      params.append("attributes[]", attribute.trim());
    }
  }

  return apiGet(
    `/api/v1/products?${params.toString()}`,
    parsePaginatedProducts,
    ["products"],
  );
}
