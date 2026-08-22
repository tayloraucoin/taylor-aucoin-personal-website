import type { Metadata } from "next";

/**
 * The admin tree's root.
 *
 * `noindex` is not decoration: this surface lists prospects' contact details
 * and Taylor's private notes about them, and a login wall is no reason for a
 * crawler to have the URLs. The site chrome and the analytics component stand
 * down here too — see `isAdminPath` in `lib/routes.ts`.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
