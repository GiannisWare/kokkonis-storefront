"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NavigationItem } from "@/types/storefront";

function itemPath(item: NavigationItem): string {
  return item.url.split("?")[0];
}

function ItemLink({
  className,
  item,
  onInteract,
  onNavigate,
}: {
  className?: string;
  item: NavigationItem;
  onInteract?: () => void;
  onNavigate?: () => void;
}) {
  const external = item.open_in_new_tab;

  return (
    <Link
      className={className}
      href={item.url}
      onFocus={onInteract}
      onClick={onNavigate}
      onPointerEnter={onInteract}
      rel={external ? "noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      {item.label}
    </Link>
  );
}

export function DesktopMegaMenu({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname();
  const [activeParentId, setActiveParentId] = useState<number | null>(null);
  const [activeChildId, setActiveChildId] = useState<number | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(() => new Set());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationRef = useRef<HTMLElement>(null);

  const activeParent = useMemo(
    () => items.find((item) => item.id === activeParentId) ?? null,
    [activeParentId, items],
  );

  const previewChildren = activeParent?.children.filter(
    (child) => child.preview_image && !failedImageIds.has(child.id),
  ) ?? [];
  const selectedChild = activeParent?.children.find((child) => child.id === activeChildId) ?? null;
  const activePreview = selectedChild?.preview_image && !failedImageIds.has(selectedChild.id)
    ? selectedChild
    : previewChildren[0] ?? null;

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function closeMenu() {
    clearCloseTimer();
    setActiveParentId(null);
    setActiveChildId(null);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(closeMenu, 160);
  }

  function openMenu(item: NavigationItem) {
    clearCloseTimer();
    setActiveParentId(item.id);
    setActiveChildId(item.children[0]?.id ?? null);
  }

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className="site-nav"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose();
      }}
      onFocusCapture={clearCloseTimer}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          closeMenu();
          navigationRef.current?.querySelector<HTMLElement>("[aria-expanded='true']")?.focus();
        }
      }}
      onPointerEnter={clearCloseTimer}
      onPointerLeave={scheduleClose}
      ref={navigationRef}
    >
      {items.map((item) => {
        const isCurrent = pathname === itemPath(item);

        if (item.children.length === 0) {
          return (
            <ItemLink
              className={"site-nav__link" + (isCurrent ? " is-current" : "")}
              item={item}
              key={item.id}
              onInteract={closeMenu}
              onNavigate={closeMenu}
            />
          );
        }

        const isOpen = activeParentId === item.id;

        return (
          <button
            aria-controls={"mega-menu-" + item.id}
            aria-expanded={isOpen}
            aria-haspopup="true"
            className={"site-nav__link" + (isOpen || isCurrent ? " is-current" : "")}
            key={item.id}
            onClick={() => openMenu(item)}
            onFocus={(event) => {
              if (event.currentTarget.matches(":focus-visible")) openMenu(item);
            }}
            onPointerEnter={() => openMenu(item)}
            type="button"
          >
            {item.label}
          </button>
        );
      })}

      <div aria-hidden="true" className={"mega-menu__veil" + (activeParent ? " is-visible" : "")} />

      {activeParent && (
        <section
          aria-label={activeParent.label + " submenu"}
          className="mega-menu"
          id={"mega-menu-" + activeParent.id}
          onPointerEnter={clearCloseTimer}
        >
          <div className="mega-menu__inner">
            <div className="mega-menu__links">
              {activeParent.children.map((child) => {
                const isActive = activeChildId === child.id;

                return (
                  <div
                    className={"mega-menu__row" + (isActive ? " is-active" : "")}
                    key={child.id}
                    onFocus={() => setActiveChildId(child.id)}
                    onPointerEnter={() => setActiveChildId(child.id)}
                  >
                    <ItemLink className="mega-menu__item" item={child} onNavigate={closeMenu} />
                    <Plus aria-hidden="true" className="mega-menu__plus" size={34} weight="light" />
                  </div>
                );
              })}
            </div>

            <div className={"mega-menu__media" + (activePreview ? " has-image" : "")}>
              <span className="mega-menu__media-placeholder">Explore {activeParent.label}</span>
              {previewChildren.map((child) => (
                <Image
                  alt={child.preview_image?.alt ?? ""}
                  aria-hidden={child.id !== activePreview?.id}
                  className={child.id === activePreview?.id ? "is-active" : ""}
                  fill
                  key={child.id}
                  onError={() => setFailedImageIds((current) => new Set(current).add(child.id))}
                  sizes="(max-width: 1200px) 54vw, 820px"
                  src={child.preview_image?.url ?? ""}
                  unoptimized={process.env.NODE_ENV === "development"}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </nav>
  );
}
