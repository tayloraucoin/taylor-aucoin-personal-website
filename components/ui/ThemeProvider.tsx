"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * The shadcn / next-themes configuration, mounted once in the root layout
 * since the rebrand (2026-10-15): the whole site has Light / Dark / System.
 *
 * - `storageKey` is namespaced like the intake's `ta-intake:` keys, so an
 *   unrelated app on `localhost` cannot hand this one a theme.
 * - `defaultTheme` is dark: carbon is the brand's home ground, and light is
 *   the visitor's choice, not the first impression.
 * - `enableColorScheme` is off: `globals.css` sets `color-scheme` beside the
 *   tokens, so the two can never disagree.
 *
 * `attribute="class"` writes `.light` / `.dark` to `<html>`. The CSS reads
 * `.light` only: dark is the ground state and needs no rule.
 */
export function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
      storageKey="ta-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
