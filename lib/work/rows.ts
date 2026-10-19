import {
  work,
  workRows,
  type Beats,
  type CaseStudy,
  type MediaItem,
  type WorkRow,
  type WorkType,
} from "@/content/work";
import { isWorkPublished } from "@/lib/config";
import { siteRoutes } from "@/lib/routes";

/**
 * What `/work` and home's Selected work show, derived from the studies and the
 * website and branding rows. Pure functions over injected data (the real
 * content is the default), so every rule is testable without editing content.
 * Server components only: it imports `content/work`'s copy and images.
 */

export type Tab = "product" | "websites" | "branding";
export type TypeFilter = WorkType | "all";

export const DEFAULT_TAB: Tab = "product";

const TABS: readonly Tab[] = ["product", "websites", "branding"];

/** D-SITE-100's group order. */
const TYPE_ORDER: readonly WorkType[] = [
  "full-time",
  "contract",
  "business",
  "passion",
  "client",
  "own-brand",
];

/** One list item on either page: a study or a row, in one shape. */
export type WorkEntry = {
  id: string;
  tab: Tab;
  title: string;
  tagline: string;
  /** A study's `listRole`; a row's `role`. */
  role: string;
  period: string;
  type: WorkType;
  sortDate: string;
  caseStudySlug?: string;
  liveUrl?: string;
  gallery: MediaItem[];
  beats?: Beats;
};

export type WorkData = {
  studies: readonly CaseStudy[];
  rows: readonly WorkRow[];
  isPublished: (slug: string) => boolean;
};

const realData: WorkData = {
  studies: work,
  rows: workRows,
  isPublished: isWorkPublished,
};

const studyEntry = (study: CaseStudy): WorkEntry => ({
  id: study.slug,
  tab: "product",
  title: study.title,
  tagline: study.tagline,
  role: study.listRole,
  period: study.period,
  type: study.type,
  sortDate: study.sortDate,
  caseStudySlug: study.slug,
  gallery: [],
  beats: study.beats,
});

const rowEntry = (row: WorkRow): WorkEntry => ({
  id: row.id,
  tab: row.discipline,
  title: row.title,
  tagline: row.tagline,
  role: row.role,
  period: row.period,
  type: row.type,
  sortDate: row.sortDate,
  caseStudySlug: row.caseStudySlug,
  liveUrl: row.liveUrl,
  gallery: row.gallery,
  beats: row.beats,
});

const first = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

/** `?tab=`: an unknown, empty or repeated value falls back to product. */
export function parseTab(value: string | string[] | undefined): Tab {
  const tab = first(value);
  return TABS.find((t) => t === tab) ?? DEFAULT_TAB;
}

/** Published entries for a tab, in the order the data lists them. */
export function entriesForTab(
  tab: Tab,
  data: WorkData = realData,
): WorkEntry[] {
  if (tab === "product") {
    return data.studies
      .filter((study) => data.isPublished(study.slug))
      .map(studyEntry);
  }
  return data.rows
    .filter((row) => row.discipline === tab && row.published)
    .map(rowEntry);
}

/** Tabs that hold at least one published entry. */
export function visibleTabs(data: WorkData = realData): Tab[] {
  return TABS.filter((tab) => entriesForTab(tab, data).length > 0);
}

/**
 * `all` plus the types the entries carry, in D-SITE-100's order; empty when
 * they carry fewer than two (D-SITE-54).
 */
export function chipsForTab(entries: readonly WorkEntry[]): TypeFilter[] {
  const types = TYPE_ORDER.filter((type) =>
    entries.some((entry) => entry.type === type),
  );
  return types.length >= 2 ? ["all", ...types] : [];
}

/**
 * `?type=`: an unknown value, `featured`, or a type the tab's chips do not
 * offer falls back to all (D-SITE-101).
 */
export function parseType(
  value: string | string[] | undefined,
  tab: Tab,
  entries: readonly WorkEntry[] = entriesForTab(tab),
): TypeFilter {
  const type = first(value);
  const chips = chipsForTab(entries);
  return chips.find((chip) => chip !== "all" && chip === type) ?? "all";
}

export function filterByType(
  entries: readonly WorkEntry[],
  type: TypeFilter,
): WorkEntry[] {
  return type === "all"
    ? [...entries]
    : entries.filter((entry) => entry.type === type);
}

/** Entries grouped in D-SITE-100's order, each group newest first. */
export function groupByType(
  entries: readonly WorkEntry[],
): { type: WorkType; entries: WorkEntry[] }[] {
  return TYPE_ORDER.flatMap((type) => {
    const inGroup = entries
      .filter((entry) => entry.type === type)
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    return inGroup.length > 0 ? [{ type, entries: inGroup }] : [];
  });
}

/**
 * The `/work` link carrying a tab and a type. The default tab and `all` are
 * left out; home's Featured chip maps to all.
 */
export function workHref(tab: Tab, type: TypeFilter | "featured"): string {
  const params = new URLSearchParams();
  if (tab !== DEFAULT_TAB) params.set("tab", tab);
  if (type !== "all" && type !== "featured") params.set("type", type);
  const query = params.toString();
  return query ? `${siteRoutes.work}?${query}` : siteRoutes.work;
}

/** A dash between two years, or a year and `present`, becomes a spaced en dash. */
export function formatPeriod(period: string): string {
  return period.replace(/^(\d{4})\s*[—–-]\s*(\d{4}|present)$/i, "$1 – $2");
}
