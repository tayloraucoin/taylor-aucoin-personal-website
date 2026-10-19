import { readFileSync } from "node:fs";

/**
 * SITE-24's golden file for `/websites/platform` (D-SITE-209, 230): its `main`
 * element's inner HTML as the server sends it, footer removed.
 */
export const PLATFORM_GOLDEN = "tests/golden/websites-platform.main.txt";

/** The golden body, without its provenance header comment. */
export function readGolden(path: string): string {
  return readFileSync(path, "utf8").replace(/^<!--[\s\S]*?-->\n/, "");
}

/** The inner HTML of the document's one `<main>`, any `<footer>` removed. */
export function mainInnerHtml(html: string): string {
  const match = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/);
  if (!match) throw new Error("no <main> in the document");
  return match[1].replace(/<footer\b[\s\S]*?<\/footer>/g, "");
}

/**
 * Build noise only: hashed asset names, build ids and React's generated ids.
 * Class names and text are never touched, so a restyle or a changed word
 * still fails the comparison.
 */
export function normaliseGolden(html: string): string {
  return (
    html
      // Hashed static assets: /_next/static/media/name.3f9a1c2b.png
      .replace(/(\/_next\/static\/[^"'\s?]*?)\.[0-9a-f]{6,}(\.\w+)/g, "$1$2")
      // Optimised-image URLs carry the hashed path URL-encoded.
      .replace(/(%2F_next%2Fstatic%2F[^"'\s&]*?)\.[0-9a-f]{6,}(\.\w+)/g, "$1$2")
      // Build ids in /_next/static/<buildId>/ paths.
      .replace(
        /\/_next\/static\/(?!media|chunks|css)[\w-]{10,}\//g,
        "/_next/static/BUILD/",
      )
      // React useId output: «r0», :R1a:, _R_1a_
      .replace(/«r[0-9a-z]+»/g, "«id»")
      .replace(/:R[0-9a-zA-Z]+:/g, ":id:")
      .replace(/_R_[0-9a-zA-Z]+_/g, "_id_")
      // Streaming placeholders: <!--$-->, <!--/$-->, S:0 and B:0 ids.
      .replace(/<!--\/?\$[!?]?-->/g, "")
      .replace(/\b(id|data-id)="[SBP]:\d+"/g, '$1="X"')
      .trim()
  );
}
