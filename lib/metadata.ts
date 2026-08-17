import type { Metadata } from "next";
import { OG_IMAGE, SITE } from "./config";

/**
 * Open Graph + Twitter card blocks for a route.
 *
 * Every page builds its social card through here so the three descriptions a
 * crawler can read — `description`, `og:description`, `twitter:description` —
 * can never drift apart. Pass the title as it should read *in the card*, which
 * is not always the `<title>`: the title template appends "— Taylor Aucoin"
 * for the tab, but a social card has its own site-name line and doesn't need
 * the suffix repeated.
 *
 * `twitter:card` follows the image: `summary_large_image` only when there is an
 * image to be large about, otherwise `summary`. See `OG_IMAGE` in `config.ts`.
 */
export function socialCard({
  title,
  description,
  type = "website",
}: {
  title: string;
  description: string;
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter"> {
  const images = OG_IMAGE
    ? [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE.name} — ${SITE.role}` }]
    : undefined;

  return {
    openGraph: {
      type,
      title,
      description,
      siteName: SITE.name,
      locale: "en_US",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: OG_IMAGE ? "summary_large_image" : "summary",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}
