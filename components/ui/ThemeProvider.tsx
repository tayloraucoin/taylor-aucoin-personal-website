"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * The shadcn / next-themes configuration, with two deliberate differences.
 *
 * - `storageKey` is namespaced like the intake's `ta-intake:` keys, so an
 *   unrelated app on `localhost` cannot hand this one a theme. Each tree that
 *   mounts this names its own key: a client's choice on their questionnaire
 *   and Taylor's on the admin are two different people's settings.
 * - `enableColorScheme` is off. next-themes would write `color-scheme` to
 *   `<html>` as an inline style, and that survives a soft navigation out of
 *   the tree. `globals.css` sets it instead, inside the same `:has` gate as
 *   every other light-theme rule, so it cannot outlive the tree that mounted
 *   this — the gate is keyed on a marker the mounting layout renders beside
 *   this provider (`.admin-theme`, `.intake-theme`).
 *
 * `attribute="class"` writes `.light` / `.dark` to `<html>`. The CSS reads
 * `.light` only: dark is the site's ground state and needs no rule.
 *
 * Two trees mount it (D-ADM-13 and its intake amendment), which is why it
 * lives here rather than under either.
 */
export function ThemeProvider({
  storageKey,
  children,
}: Readonly<{
  storageKey: "ta-admin-theme" | "ta-intake-theme";
  children: React.ReactNode;
}>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
      storageKey={storageKey}
    >
      {children}
    </NextThemesProvider>
  );
}
