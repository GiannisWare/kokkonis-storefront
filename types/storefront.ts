export interface NavigationItem {
  id: number;
  label: string;
  url: string;
  open_in_new_tab: boolean;
  preview_image: StorefrontImage | null;
  children: NavigationItem[];
}

export interface StorefrontImage {
  url: string;
  original: string;
  alt: string;
}

export interface HeroSlide {
  id: number;
  key: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  cta: { label: string | null; url: string | null };
  image: (StorefrontImage & { focal_position: string }) | null;
}

export interface StorefrontConfiguration {
  site: {
    name: string;
    logo: StorefrontImage | null;
    utility_bar: { left: string | null; center: string | null; right: string | null };
  };
  navigation: { header: NavigationItem[]; footer: NavigationItem[] };
  hero_slides: HeroSlide[];
  footer: { heading: string | null; description: string | null; copyright: string | null };
}

export const fallbackStorefront: StorefrontConfiguration = {
  site: {
    name: "Kokkonios",
    logo: null,
    utility_bar: {
      left: "Professional paints & tools",
      center: "Kokkonios — Fine paints & art supplies",
      right: "View-only catalogue",
    },
  },
  navigation: {
    header: [
      { id: -1, label: "Home", url: "/", open_in_new_tab: false, preview_image: null, children: [] },
      { id: -2, label: "All products", url: "/products", open_in_new_tab: false, preview_image: null, children: [] },
    ],
    footer: [
      { id: -3, label: "Home", url: "/", open_in_new_tab: false, preview_image: null, children: [] },
      { id: -4, label: "All products", url: "/products", open_in_new_tab: false, preview_image: null, children: [] },
    ],
  },
  hero_slides: [],
  footer: {
    heading: "Tools for work that lasts",
    description: "Professional paints and tools for careful, lasting work.",
    copyright: "Kokkonios. All rights reserved.",
  },
};
