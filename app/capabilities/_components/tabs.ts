import type { CapabilityChipItem } from "@/components/capabilities/CapabilityChips";
import type { CapabilityTab } from "@/content/capabilities";

/**
 * The tabs on /capabilities (D-SITE-146), in build order. Kept free of
 * content values so the client bundle never carries the capability file.
 */
export const TAB_KEYS = [
  "all",
  "product-design",
  "engineering",
  "ai-data",
  "leading-delivery",
] as const satisfies readonly ("all" | CapabilityTab)[];

export type TabKey = (typeof TAB_KEYS)[number];

/**
 * A chip with the tabs it shows under and the words the filter reads
 * (D-SITE-148): plain props, no rating.
 */
export type TabbedChipItem = CapabilityChipItem & {
  tabs: CapabilityTab[];
  offer: string;
  keywords: string[];
};

/** `?tab=`'s value, or All when it is missing, blank or unknown. */
export function parseTab(value: string | string[] | undefined): TabKey {
  const raw = Array.isArray(value) ? value[0] : value;
  return TAB_KEYS.find((t) => t === raw) ?? "all";
}

/** The chips a tab shows, in the order given. */
export function itemsForTab<T extends { tabs: readonly CapabilityTab[] }>(
  items: readonly T[],
  tab: TabKey,
): T[] {
  return tab === "all"
    ? [...items]
    : items.filter((i) => i.tabs.includes(tab as CapabilityTab));
}

/** The query as matched: trimmed, lowercased; blank means no filter. */
export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

/**
 * The chips whose title, tech, approach, offer or keywords hold the query,
 * case-insensitive, in the order given. A blank query keeps every chip.
 */
export function filterItems<
  T extends Pick<
    TabbedChipItem,
    "title" | "tech" | "approach" | "offer" | "keywords"
  >,
>(items: readonly T[], q: string): T[] {
  const needle = normalizeQuery(q);
  if (!needle) return [...items];
  return items.filter((i) =>
    [i.title, i.tech, i.approach, i.offer, ...i.keywords]
      .join("\n")
      .toLowerCase()
      .includes(needle),
  );
}

/**
 * The search string with `tab` and `q` written: All removes `tab`, a blank
 * query removes `q`; every other parameter is kept.
 */
export function searchWithState(
  search: string,
  { tab, q }: { tab: TabKey; q: string },
): string {
  const params = new URLSearchParams(search);
  if (tab === "all") params.delete("tab");
  else params.set("tab", tab);
  if (q.trim()) params.set("q", q);
  else params.delete("q");
  const next = params.toString();
  return next ? `?${next}` : "";
}
