import { FIXTURE_SENTINEL } from "@/lib/page-state";
import type { WorkEntry } from "@/lib/work/rows";
import roomvy1 from "@/public/work/roomvy/roomvy-1.webp";
import roomvy2 from "@/public/work/roomvy/roomvy-2.webp";

/**
 * `/work`'s States (work-index.md), seeded for `?state=` outside production
 * only (`readPageState`). No row on real content has a gallery this cycle,
 * so `gallery` adds one synthetic row to prove the opener.
 */
export const WORK_STATES = ["gallery"] as const;

export const galleryFixture: WorkEntry = {
  id: "fixture-gallery",
  tab: "product",
  title: "Synthetic gallery row",
  tagline: `A fixture row with two images, for the opener (${FIXTURE_SENTINEL}).`,
  role: "Fixture role",
  period: "2026",
  type: "business",
  sortDate: "2026-12",
  liveUrl: `https://${FIXTURE_SENTINEL}`,
  gallery: [
    { src: roomvy1, alt: "Fixture image one" },
    { src: roomvy2, alt: "Fixture image two" },
  ],
};
