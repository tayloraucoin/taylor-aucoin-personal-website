import type { WorkType } from "@/content/work";
import type { Tab, TypeFilter } from "@/lib/work/rows";

/**
 * Every string on `/work` (work-index-words.md). Bracketed values are
 * Taylor's to write and ship bracketed (D-SITE-185); nothing here is improved.
 */
export const workIndex = {
  h1: "Work",
  intro: "[Taylor writes: one line on what this page holds]",
  title: "[Taylor writes: page title]",
  description: "[Taylor writes: page meta description]",
  tabsNav: "[Taylor writes: tabs name]",
  chipsNav: "[Taylor writes: chips name]",
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
  capabilities: "Search every capability [draft]",
} as const;

/**
 * D-SITE-189: the canvas's casing wins on `/work` only. The repo `title`
 * stays for the case study; this list holds the few that differ.
 */
export const LIST_TITLES: Record<string, string> = {
  "family-office-platform": "Multi-entity family office platform",
};
