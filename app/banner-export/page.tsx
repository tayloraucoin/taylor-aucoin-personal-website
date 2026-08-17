import type { Metadata } from "next";
import BannerExport from "./BannerExport";

/**
 * Temporary. A 1584×396 stage for capturing the root field as a LinkedIn cover
 * image. Not linked from anywhere, not in any sitemap, noindex. Delete the
 * whole `app/banner-export/` folder when the banner is done.
 */
export const metadata: Metadata = {
  title: "Banner export",
  robots: { index: false, follow: false, nocache: true },
};

export default function BannerExportPage() {
  return <BannerExport />;
}
