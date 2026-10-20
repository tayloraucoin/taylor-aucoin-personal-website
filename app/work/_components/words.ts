import type { WorkType } from "@/content/work";
import type { Tab, TypeFilter } from "@/lib/work/rows";

/**
 * Every string on `/work` (work-index-words.md). The placeholders were
 * written in feedback round 1 (2026-10-19, D-SITE-185).
 */
export const workIndex = {
  h1: "Work",
  intro:
    "Everything I've shipped that I can show, sorted by the kind of work and how I was hired.",
  title: "Work",
  description:
    "Products, websites and brands I've built, each with the decision that shaped it. Clinical calculators, a five-app platform, realtime voice AI and more.",
  tabsNav: "Kind of work",
  chipsNav: "How I was hired",
  tabs: {
    product: "Product engineering",
    websites: "Websites",
    branding: "Branding & UI",
  } satisfies Record<Tab, string>,
  chips: {
    all: "All",
    "full-time": "Full-time",
    contract: "Contract",
    business: "Business",
    passion: "Passion projects",
    client: "Client",
    "own-brand": "Own brand",
  } satisfies Record<TypeFilter, string>,
  groups: {
    "full-time": "Full-time",
    contract: "Contract",
    business: "Business",
    passion: "Passion projects",
    client: "Client",
    "own-brand": "Own brand",
  } satisfies Record<WorkType, string>,
  readStory: "Read the decision story",
  galleryAll: { images: "All {n} images", boards: "All {n} boards" },
  capabilities: "Search every capability",
  /** The quiet closing line under the capabilities link. */
  linkedin: "More on LinkedIn",
} as const;

/**
 * D-SITE-189: the canvas's casing wins on `/work` only. The repo `title`
 * stays for the case study; this list holds the few that differ.
 */
export const LIST_TITLES: Record<string, string> = {
  "future-of-cities": "Future of Cities",
};
