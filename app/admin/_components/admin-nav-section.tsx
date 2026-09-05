"use client";

import Link from "next/link";
import { useState } from "react";
import type { AdminNavSection as NavSection } from "./admin-nav";
import { isPathActive } from "./admin-nav";

/**
 * One collapsible group in the rail, in both of the rail's widths.
 *
 * Expanded, it is an accordion: a mono eyebrow trigger over an indented list.
 * Collapsed, the rail is 3.5rem wide and a nested list has nowhere to go, so
 * the items become a flyout to the right — opened by hover *or* focus-within,
 * which is what keeps it reachable from the keyboard without a dropdown
 * library. CC gets the same behavior from a Radix DropdownMenu; two CSS
 * variants are cheaper than a second overlay dependency here.
 */
export function AdminNavSection({
  section,
  pathname,
  collapsed,
  onExpandRail,
}: Readonly<{
  section: NavSection;
  pathname: string;
  collapsed: boolean;
  /** Collapsed triggers widen the rail rather than toggling an invisible list. */
  onExpandRail: () => void;
}>) {
  const sectionActive = section.items.some((item) =>
    isPathActive(pathname, item.href),
  );
  const [open, setOpen] = useState(true);
  const SectionIcon = section.icon;

  const label = (
    <span className="font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em]">
      {section.label}
    </span>
  );

  if (collapsed) {
    return (
      <li className="group relative">
        <button
          type="button"
          onClick={onExpandRail}
          aria-label={`${section.label} — expand navigation`}
          className={`flex h-11 w-full items-center justify-center rounded-md transition-colors hover:bg-(--color-card-hover) ${
            sectionActive ? "text-(--color-c2)" : "text-(--color-dim)"
          }`}
        >
          <SectionIcon aria-hidden className="size-4" />
        </button>

        <div className="absolute left-full top-0 z-20 hidden pl-2 group-hover:block group-focus-within:block">
          <div className="min-w-48 rounded-md border border-(--color-faint) bg-(--color-ground-a) p-1.5 shadow-lg">
            <p className="px-2 py-1 text-(--color-dim)">{label}</p>
            <ul>
              {section.items.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </ul>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-(--color-card-hover) ${
          sectionActive ? "text-(--color-c2)" : "text-(--color-dim)"
        }`}
      >
        <SectionIcon aria-hidden className="size-4 shrink-0" />
        {label}
      </button>

      {open ? (
        <ul className="ml-4 border-l border-(--color-faint) pl-1.5">
          {section.items.map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * One item. The active treatment is gold text plus a gold left rule — and
 * `aria-current`, because color is never the only signal.
 *
 * An item that is not `ready` has no surface behind it, so it is not a link. It
 * renders as dimmed text with a title attribute and stays out of the tab order:
 * a focusable element that does nothing when activated is worse than no
 * element.
 */
function NavItem({
  item,
  pathname,
}: Readonly<{ item: AdminNavItemProps; pathname: string }>) {
  const Icon = item.icon;
  const active = item.ready && isPathActive(pathname, item.href);

  const inner = (
    <>
      <Icon aria-hidden className="size-3.5 shrink-0" />
      <span className="truncate">{item.title}</span>
    </>
  );

  const base =
    "flex min-h-11 items-center gap-2.5 border-l-2 py-2 pl-2.5 pr-2 text-sm transition-colors";

  if (!item.ready) {
    return (
      <li>
        <span
          title="Not built yet"
          className={`${base} border-transparent text-(--color-dim)/60`}
        >
          {inner}
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`${base} ${
          active
            ? "border-(--color-c2) text-(--color-c2)"
            : "border-transparent text-(--color-body) hover:bg-(--color-card-hover) hover:text-(--color-ink)"
        }`}
      >
        {inner}
      </Link>
    </li>
  );
}

type AdminNavItemProps = NavSection["items"][number];
