import "server-only";
import { apiGet, ApiError, resolveMediaUrl } from "@/lib/api/client";
import type { HeroSlide, NavigationItem, StorefrontConfiguration, StorefrontImage } from "@/types/storefront";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function nullableString(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new ApiError();
  return value;
}

function safeHref(value: unknown): string {
  if (typeof value !== "string") throw new ApiError();
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return value;
  } catch {
    throw new ApiError();
  }
  throw new ApiError();
}

function parseImage(value: unknown): StorefrontImage | null {
  if (value === null) return null;
  if (!isRecord(value) || typeof value.url !== "string" || typeof value.original !== "string" || typeof value.alt !== "string") {
    throw new ApiError();
  }
  return {
    url: resolveMediaUrl(value.url),
    original: resolveMediaUrl(value.original),
    alt: value.alt,
  };
}

function parseNavigationItem(value: unknown): NavigationItem {
  if (!isRecord(value) || typeof value.id !== "number" || typeof value.label !== "string" || typeof value.url !== "string" || typeof value.open_in_new_tab !== "boolean" || !Array.isArray(value.children)) {
    throw new ApiError();
  }
  return {
    id: value.id,
    label: value.label,
    url: safeHref(value.url),
    open_in_new_tab: value.open_in_new_tab,
    preview_image: parseImage(value.preview_image ?? null),
    children: value.children.map(parseNavigationItem),
  };
}

function parseHeroSlide(value: unknown): HeroSlide {
  if (!isRecord(value) || typeof value.id !== "number" || typeof value.key !== "string" || typeof value.title !== "string" || !isRecord(value.cta)) {
    throw new ApiError();
  }
  const baseImage = parseImage(value.image);
  const focalPosition = isRecord(value.image) && typeof value.image.focal_position === "string" ? value.image.focal_position : "center";
  return {
    id: value.id,
    key: value.key,
    eyebrow: nullableString(value.eyebrow),
    title: value.title,
    description: nullableString(value.description),
    cta: { label: nullableString(value.cta.label), url: value.cta.url === null ? null : safeHref(value.cta.url) },
    image: baseImage === null ? null : { ...baseImage, focal_position: focalPosition },
  };
}

function parseStorefront(value: unknown): StorefrontConfiguration {
  if (!isRecord(value) || !isRecord(value.data)) {
    throw new ApiError();
  }
  const data = value.data;
  const site = data.site;
  const navigation = data.navigation;
  const footer = data.footer;
  const slides = data.hero_slides;
  if (!isRecord(site) || !isRecord(navigation) || !isRecord(footer) || !Array.isArray(slides)) {
    throw new ApiError();
  }
  const utility = site.utility_bar;
  if (typeof site.name !== "string" || !isRecord(utility) || !Array.isArray(navigation.header) || !Array.isArray(navigation.footer)) {
    throw new ApiError();
  }
  return {
    site: {
      name: site.name,
      logo: parseImage(site.logo),
      utility_bar: { left: nullableString(utility.left), center: nullableString(utility.center), right: nullableString(utility.right) },
    },
    navigation: {
      header: navigation.header.map(parseNavigationItem),
      footer: navigation.footer.map(parseNavigationItem),
    },
    hero_slides: slides.map(parseHeroSlide),
    footer: {
      heading: nullableString(footer.heading),
      description: nullableString(footer.description),
      copyright: nullableString(footer.copyright),
    },
  };
}

export function getStorefrontConfiguration(): Promise<StorefrontConfiguration> {
  return apiGet("/api/v1/storefront", parseStorefront, ["storefront"]);
}
