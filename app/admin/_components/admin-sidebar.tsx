"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { adminRoutes } from "@/lib/routes";
import { NAV_SECTIONS } from "./admin-nav";
import { AdminNavSection } from "./admin-nav-section";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * The rail. Rendered twice: as the persistent desktop column, and inside the
 * off-canvas sheet on small screens, where it is never collapsed.
 *
 * `signOut` arrives as a bound server action from the protected layout. The
 * rail is a client leaf and cannot own one.
 */
export function AdminSidebar({
  email,
  signOut,
  pathname,
  collapsed,
  onToggleCollapsed,
}: Readonly<{
  email: string;
  signOut: () => Promise<void>;
  pathname: string;
  collapsed: boolean;
  /** Absent inside the mobile sheet: there is nothing there to collapse into. */
  onToggleCollapsed?: () => void;
}>) {
  return (
    <div className="flex h-full flex-col bg-(--color-card)">
      <div
        className={`flex items-center border-b border-(--color-faint) py-3 ${
          collapsed ? "justify-center px-2" : "px-4"
        }`}
      >
        <Link
          href={adminRoutes.home}
          className="flex items-center gap-2.5 text-(--color-ink)"
        >
          <Image
            src="/icon.png"
            alt=""
            width={24}
            height={24}
            className="size-6 shrink-0 rounded-sm"
          />
          {collapsed ? (
            <span className="sr-only">Admin</span>
          ) : (
            <span className="font-(family-name:--font-display) text-sm">
              Admin
            </span>
          )}
        </Link>
      </div>

      {/*
        Collapsed, the rail is a handful of icons with nothing to scroll — and a
        scroller would clip the section flyouts, which is the one thing the
        collapsed rail exists to show. Expanded, the list can outgrow the
        viewport and the scroller is the point.
      */}
      <nav
        aria-label="Admin"
        className={`flex-1 px-2 py-3 ${
          collapsed ? "overflow-visible" : "overflow-y-auto"
        }`}
      >
        <ul className={collapsed ? "space-y-1" : "space-y-2"}>
          {NAV_SECTIONS.map((section) => (
            <AdminNavSection
              key={section.label}
              section={section}
              pathname={pathname}
              collapsed={collapsed}
              onExpandRail={() => onToggleCollapsed?.()}
            />
          ))}
        </ul>
      </nav>

      <div className="border-t border-(--color-faint) p-2">
        {onToggleCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            className={`mb-1 flex min-h-11 w-full items-center gap-2.5 rounded-md px-2 text-sm text-(--color-body) transition-colors hover:bg-(--color-card-hover) hover:text-(--color-ink) ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden className="size-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose aria-hidden className="size-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        ) : null}

        <div className="mt-2 mb-2 px-2">
          <ThemeToggle collapsed={collapsed} />
        </div>

        <form action={signOut}>
          {collapsed ? null : (
            <p
              title={email}
              className="truncate px-2 pb-1 text-xs text-(--color-dim)"
            >
              {email}
            </p>
          )}
          <button
            type="submit"
            className={`flex min-h-11 w-full items-center gap-2.5 rounded-md px-2 text-sm text-(--color-body) transition-colors hover:bg-(--color-card-hover) hover:text-(--color-ink) ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut aria-hidden className="size-4 shrink-0" />
            <span className={collapsed ? "sr-only" : undefined}>Sign out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
