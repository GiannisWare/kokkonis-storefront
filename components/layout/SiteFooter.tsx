import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { StorefrontConfiguration } from "@/types/storefront";

export function SiteFooter({ configuration }: { configuration: StorefrontConfiguration }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <strong>{configuration.site.name}</strong>
        {configuration.footer.heading && <h2>{configuration.footer.heading}</h2>}
        {configuration.footer.description && <p>{configuration.footer.description}</p>}
      </div>
      <nav aria-label="Footer navigation">
        {configuration.navigation.footer.map((item) => (
          <Link href={item.url} key={item.id} target={item.open_in_new_tab ? "_blank" : undefined} rel={item.open_in_new_tab ? "noreferrer" : undefined}>
            {item.label}{item.open_in_new_tab && <ArrowUpRight aria-hidden="true" size={13} />}
          </Link>
        ))}
      </nav>
      <div className="site-footer__end">
        <Link href="#top">Back to top</Link>
        {configuration.footer.copyright && <small>{configuration.footer.copyright}</small>}
      </div>
    </footer>
  );
}
