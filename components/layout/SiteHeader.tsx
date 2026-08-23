import Image from "next/image";
import Link from "next/link";
import { CaretDown, List, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { DesktopMegaMenu } from "@/components/layout/DesktopMegaMenu";
import type { NavigationItem, StorefrontConfiguration } from "@/types/storefront";

function MenuLink({ item }: { item: NavigationItem }) {
  const external = item.open_in_new_tab;
  return <Link href={item.url} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{item.label}</Link>;
}

export function SiteHeader({ configuration }: { configuration: StorefrontConfiguration }) {
  const { site, navigation } = configuration;
  const hasUtilityBar = Object.values(site.utility_bar).some(Boolean);

  return (
    <>
      {hasUtilityBar && (
        <header className="utility-bar">
          <span>{site.utility_bar.left}</span><span>{site.utility_bar.center}</span><span>{site.utility_bar.right}</span>
        </header>
      )}
      <nav aria-label="Site header" className="site-menu-bar">
        <div className="site-menu-bar__inner">
          <Link className={`brand${site.logo ? " brand--image" : ""}`} href="/" aria-label={`${site.name} home`}>
            {site.logo ? <Image src={site.logo.url} alt={site.logo.alt} width={240} height={80} priority unoptimized={process.env.NODE_ENV === "development"} /> : site.name}
          </Link>
          <DesktopMegaMenu items={navigation.header} />
          <div className="site-header__actions">
            <Link className="search-link" href="/products#catalogue-search"><span>Search</span><MagnifyingGlass aria-hidden="true" size={19} /></Link>
            <details className="mobile-menu">
              <summary className="icon-button" aria-label="Open navigation"><List aria-hidden="true" size={23} /></summary>
              <nav aria-label="Mobile navigation">
                {navigation.header.map((item) => item.children.length > 0 ? (
                  <details className="mobile-submenu" key={item.id}>
                    <summary>{item.label}<CaretDown aria-hidden="true" size={14} /></summary>
                    <MenuLink item={item} />
                    {item.children.map((child) => <MenuLink item={child} key={child.id} />)}
                  </details>
                ) : <MenuLink item={item} key={item.id} />)}
              </nav>
            </details>
          </div>
        </div>
      </nav>
    </>
  );
}
