"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * The shadcn / next-themes configuration, with two deliberate differences.
 *
 * - `storageKey` is namespaced like the intake's `ta-intake:` keys, so an
 *   unrelated app on `localhost` cannot hand this one a theme.
 * - `enableColorScheme` is off. next-themes would write `color-scheme` to
 *   `<html>` as an inline style, and that survives a soft navigation out of
 *   `/admin`. `globals.css` sets it instead, inside the same `:has` gate as
 *   every other light-theme rule, so it cannot outlive the admin tree.
 *
 * `attribute="class"` writes `.light` / `.dark` to `<html>`. The CSS reads
 * `.light` only: dark is the site's ground state and needs no rule.
 */
export function AdminThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
      storageKey="ta-admin-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
