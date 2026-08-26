import type { Metadata } from "next";
import { Bebas_Neue, Geist } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getStorefrontConfiguration } from "@/lib/api/storefront";
import { fallbackStorefront } from "@/types/storefront";
import "./globals.css";

const geist = Geist({
  variable: "--font-ui",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Kokkonios | Paint & Tools Catalogue",
  description:
    "Browse the Kokkonios catalogue of paints, tools and decorating materials.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const configuration = await getStorefrontConfiguration().catch(() => fallbackStorefront);

  return (
    <html lang="en" className={`${geist.variable} ${bebasNeue.variable}`}>
      <body>
        <SiteHeader configuration={configuration} />
        {children}
        <SiteFooter configuration={configuration} />
      </body>
    </html>
  );
}
