"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { CaretDown, Funnel, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { CatalogueFilters } from "@/types/catalogue";

interface SelectedFilters {
  q: string;
  category: string;
  brand: string;
  attributes: string[];
  availability: string;
  sort: string;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="filter-group">
      <legend>{title}<CaretDown aria-hidden="true" size={13} /></legend>
      <div className="filter-group__options">{children}</div>
    </fieldset>
  );
}

export function CatalogueFiltersPanel({ filters, selected }: { filters: CatalogueFilters; selected: SelectedFilters }) {
  const filtersDisclosure = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const disclosure = filtersDisclosure.current;
    const compactViewport = window.matchMedia("(max-width: 980px)");

    if (!disclosure) return;

    const syncDisclosure = (event: MediaQueryList | MediaQueryListEvent) => {
      disclosure.open = !event.matches;
    };

    syncDisclosure(compactViewport);
    compactViewport.addEventListener("change", syncDisclosure);

    return () => compactViewport.removeEventListener("change", syncDisclosure);
  }, []);

  return (
    <>
      <div className="catalogue-controls">
        <label className="catalogue-search" id="catalogue-search">
          <MagnifyingGlass aria-hidden="true" size={18} />
          <span className="sr-only">Search products</span>
          <input name="q" defaultValue={selected.q} placeholder="Search products" />
        </label>
        <label className="catalogue-sort">
          <span>Sort by</span>
          <select name="sort" defaultValue={selected.sort}>
            {filters.sorts.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      <details className="catalogue-filters" open ref={filtersDisclosure}>
        <summary><Funnel aria-hidden="true" size={18} /> Filters</summary>
        <div className="catalogue-filters__body">
          <FilterGroup title="Category">
            {filters.categories.map((category) => (
              <div className="category-filter" key={category.slug}>
                <label><input type="radio" name="category" value={category.slug} defaultChecked={selected.category === category.slug} /><span>{category.name}</span><small>{category.products_count}</small></label>
                {category.children.map((child) => <label className="filter-child" key={child.slug}><input type="radio" name="category" value={child.slug} defaultChecked={selected.category === child.slug} /><span>{child.name}</span><small>{child.products_count}</small></label>)}
              </div>
            ))}
          </FilterGroup>

          {filters.brands.length > 0 && <FilterGroup title="Brand">
            {filters.brands.map((brand) => <label key={brand.slug}><input type="radio" name="brand" value={brand.slug} defaultChecked={selected.brand === brand.slug} /><span>{brand.name}</span><small>{brand.products_count}</small></label>)}
          </FilterGroup>}

          {filters.attributes.map((attribute) => <FilterGroup title={attribute.name} key={attribute.slug}>
            {attribute.values.map((option) => {
              const token = `${attribute.slug}:${option.slug}`;
              return <label key={token}><input type="checkbox" name="attributes" value={token} defaultChecked={selected.attributes.includes(token)} />{option.swatch_hex && <i className="filter-swatch" style={{ backgroundColor: option.swatch_hex }} />}<span>{option.value}</span><small>{option.products_count}</small></label>;
            })}
          </FilterGroup>)}

          <FilterGroup title="Availability">
            {filters.availability.map((option) => <label key={option.value}><input type="radio" name="availability" value={option.value} defaultChecked={selected.availability === option.value} /><span>{option.label}</span></label>)}
          </FilterGroup>

          <div className="filter-actions">
            <button type="submit">Apply filters</button>
            <Link href="/products">Reset all</Link>
          </div>
        </div>
      </details>
    </>
  );
}

export type { SelectedFilters };
