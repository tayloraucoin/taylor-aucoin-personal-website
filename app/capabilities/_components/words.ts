import { problems } from "@/content/home";
import type { TabKey } from "./tabs";

/**
 * Every string on `/capabilities` (capabilities-words.md). The placeholders
 * were written in feedback round 1 (2026-10-19, D-SITE-185).
 */
export const capabilitiesPage = {
  title: "Capabilities",
  socialTitle: "Capabilities — Taylor Aucoin",
  description:
    "Problems I comfortably take on — payments, AI features, design, data pipelines, realtime voice, consolidation — with the approach and the work behind each.",
  h1: "Problems I take on",
  framing:
    "AI features and data architecture are where I'm strongest. I'll take on any part of a product, from the first sketch to the deploy, and I'm happiest owning all of it.",
  filterLabel: "Filter by problem or tool",
  filterPlaceholder: "Filter — payments, search, AI…",
  clear: "Clear the filter",
  noMatch: "Nothing by that name.",
  sendNote: "Send a note",
  /** The status region's count. */
  count: (n: number) => `${n} shown`,
  tabsName: "Areas of work",
  tabs: {
    all: "All",
    "product-design": "Product & design",
    engineering: "Engineering",
    "ai-data": "AI & data",
    "leading-delivery": "Leading delivery",
  } satisfies Record<TabKey, string>,
  /** Home's proof line, shared until Taylor writes one per engagement. */
  doneAt: problems.doneAt,
  /** Read after an external proof's name. */
  externalNote: "(opens another site)",
} as const;
