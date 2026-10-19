import { problems } from "@/content/home";
import type { TabKey } from "./tabs";

/**
 * Every string on `/capabilities` (capabilities-words.md). Bracketed values
 * are Taylor's to write and ship bracketed (D-SITE-185); nothing here is
 * improved.
 */
export const capabilitiesPage = {
  title: "Capabilities",
  socialTitle: "Capabilities — Taylor Aucoin",
  description:
    "Problems I comfortably take on — payments, AI features, design, data pipelines, realtime voice, consolidation — with the approach and the work behind each.",
  h1: "Problems I take on",
  framing:
    "[Taylor writes: your specialities, and that you take on any part of a product, end to end]",
  filterLabel: "Filter by problem or tool [draft]",
  filterPlaceholder: "Filter — payments, search, AI…",
  clear: "Clear the filter [draft]",
  noMatch: "Nothing by that name.",
  sendNote: "Send a note",
  /** The status region's count, Taylor's words to come beside the number. */
  count: (n: number) => `[Taylor writes: result count] ${n}`,
  tabsName: "[Taylor writes: tabs name]",
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
  externalNote: "[Taylor writes: opens another site]",
} as const;
