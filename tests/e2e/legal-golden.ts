import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

/**
 * SITE-31's golden file: for each legal page, `main`'s text with whitespace
 * collapsed, the document title and the meta description, taken from the
 * branch before SITE-31's first commit. A restyle changes none of them.
 */
export const LEGAL_GOLDEN = "tests/golden/legal-text.json";
export const LEGAL_PATHS = [
  "/privacy",
  "/websites/privacy",
  "/websites/terms",
] as const;

export type LegalText = { text: string; title: string; description: string };

export function readLegalGolden(
  path = LEGAL_GOLDEN,
): Record<string, LegalText> {
  return JSON.parse(readFileSync(path, "utf8")).pages;
}

export async function readLegalText(page: Page): Promise<LegalText> {
  return page.evaluate(() => ({
    text: (document.querySelector("main")?.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim(),
    title: document.title,
    description:
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") ?? "",
  }));
}

/** The first difference between two readings, or null when they agree. */
export function diffLegal(golden: LegalText, now: LegalText): string | null {
  for (const key of ["title", "description", "text"] as const) {
    if (golden[key] === now[key]) continue;
    const a = golden[key];
    const b = now[key];
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    return `${key} differs at ${i}: "${a.slice(i, i + 40)}" vs "${b.slice(i, i + 40)}"`;
  }
  return null;
}
