import { siteRoutes } from "@/lib/routes";

export type NavItem = "work" | "about" | "work-with-me" | "contact";

export type CallSurface =
  "home" | "work-index" | "case-study" | "about" | "services" | "capabilities";

/**
 * Today's page for Work with me, until `/work-with-me` replaces it and its
 * 308 lands with that page (SITE-19). Nothing links here; it is only matched.
 */
const SERVICES_TODAY = "/services";

export const NAV_ITEMS: readonly {
  key: NavItem;
  label: string;
  href: string;
}[] = [
  { key: "work", label: "Work", href: siteRoutes.work },
  { key: "about", label: "About", href: siteRoutes.about },
  { key: "work-with-me", label: "Work with me", href: siteRoutes.workWithMe },
  { key: "contact", label: "Contact", href: siteRoutes.contact },
];

function within(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** The header item marked current, or null (home, /book, anything else). */
export function currentNavItem(pathname: string): NavItem | null {
  if (within(pathname, siteRoutes.work)) return "work";
  // /capabilities sits under Work (D-SITE-140).
  if (pathname === siteRoutes.capabilities) return "work";
  if (pathname === siteRoutes.about) return "about";
  if (pathname === siteRoutes.workWithMe || pathname === SERVICES_TODAY)
    return "work-with-me";
  if (pathname === siteRoutes.contact) return "contact";
  return null;
}

/**
 * Where a header call click came from, in the registry's closed surfaces
 * (D-SITE-226), or null for a page with none: no event is sent there.
 */
export function headerCallSurface(
  pathname: string,
): { surface: CallSurface; slug?: string } | null {
  if (pathname === siteRoutes.home) return { surface: "home" };
  if (pathname === siteRoutes.work) return { surface: "work-index" };
  if (pathname.startsWith(`${siteRoutes.work}/`)) {
    const slug = pathname.slice(siteRoutes.work.length + 1);
    return slug && !slug.includes("/") ? { surface: "case-study", slug } : null;
  }
  if (pathname === siteRoutes.about) return { surface: "about" };
  if (
    pathname === siteRoutes.workWithMe ||
    pathname === SERVICES_TODAY ||
    pathname === siteRoutes.contact
  )
    return { surface: "services" };
  if (pathname === siteRoutes.capabilities) return { surface: "capabilities" };
  return null;
}
