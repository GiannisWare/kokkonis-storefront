import "server-only";
import { apiGet, ApiError } from "@/lib/api/client";
import type { CatalogueFilters } from "@/types/catalogue";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string {
  if (typeof record[key] !== "string") throw new ApiError();
  return record[key];
}

function readNumber(record: Record<string, unknown>, key: string): number {
  if (typeof record[key] !== "number") throw new ApiError();
  return record[key];
}

function parseFilters(value: unknown): CatalogueFilters {
  if (!isRecord(value) || !isRecord(value.data)) throw new ApiError();
  const data = value.data;
  for (const key of ["categories", "brands", "attributes", "availability", "sorts"] as const) {
    if (!Array.isArray(data[key])) throw new ApiError();
  }
  return {
    categories: (data.categories as unknown[]).map((entry) => {
      if (!isRecord(entry) || !Array.isArray(entry.children)) throw new ApiError();
      return {
        name: readString(entry, "name"), slug: readString(entry, "slug"), products_count: readNumber(entry, "products_count"),
        children: entry.children.map((child) => {
          if (!isRecord(child)) throw new ApiError();
          return { name: readString(child, "name"), slug: readString(child, "slug"), products_count: readNumber(child, "products_count") };
        }),
      };
    }),
    brands: (data.brands as unknown[]).map((entry) => {
      if (!isRecord(entry)) throw new ApiError();
      return { name: readString(entry, "name"), slug: readString(entry, "slug"), products_count: readNumber(entry, "products_count") };
    }),
    attributes: (data.attributes as unknown[]).map((entry) => {
      if (!isRecord(entry) || !Array.isArray(entry.values)) throw new ApiError();
      return {
        name: readString(entry, "name"), slug: readString(entry, "slug"),
        values: entry.values.map((option) => {
          if (!isRecord(option)) throw new ApiError();
          const swatch = option.swatch_hex;
          if (swatch !== null && typeof swatch !== "string") throw new ApiError();
          return { value: readString(option, "value"), slug: readString(option, "slug"), swatch_hex: swatch, products_count: readNumber(option, "products_count") };
        }),
      };
    }),
    availability: (data.availability as unknown[]).map((entry) => {
      if (!isRecord(entry)) throw new ApiError();
      return { value: readString(entry, "value"), label: readString(entry, "label") };
    }),
    sorts: (data.sorts as unknown[]).map((entry) => {
      if (!isRecord(entry)) throw new ApiError();
      return { value: readString(entry, "value"), label: readString(entry, "label") };
    }),
  };
}

export function getCatalogueFilters(): Promise<CatalogueFilters> {
  return apiGet("/api/v1/catalogue/filters", parseFilters, ["catalogue-filters"]);
}
