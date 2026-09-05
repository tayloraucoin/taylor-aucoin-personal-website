import type { Metadata } from "next";
import { AdminThemeProvider } from "@/app/admin/_components/theme-provider";

/**
 * The admin tree's root.
 *
 * `noindex` is not decoration: this surface lists prospects' contact details
 * and Taylor's private notes about them, and a login wall is no reason for a
 * crawler to have the URLs. The site chrome and the analytics component stand
 * down here too — see `isAdminPath` in `lib/routes.ts`.
 *
 * The theme provider mounts here and nowhere else, so its pre-hydration script
 * only ever runs under `/admin`. The `admin-theme` marker is the other half of
 * that scoping: `globals.css` gates every light-theme rule on
 * `html.light:has(.admin-theme)`, so the class next-themes leaves on `<html>`
 * is inert the moment this tree unmounts (D-ADM-13, M-ADM-8). `contents` keeps
 * the marker out of layout — the shell and the login page size themselves.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminThemeProvider>
      <div className="admin-theme contents">{children}</div>
    </AdminThemeProvider>
  );
}
