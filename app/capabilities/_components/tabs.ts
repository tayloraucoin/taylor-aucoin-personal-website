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

/** A chip with the tabs it shows under: plain props, no rating. */
export type TabbedChipItem = CapabilityChipItem & { tabs: CapabilityTab[] };

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

/** The search string with `tab` set, or removed for All; the rest kept. */
export function searchWithTab(search: string, tab: TabKey): string {
  const params = new URLSearchParams(search);
  if (tab === "all") params.delete("tab");
  else params.set("tab", tab);
  const next = params.toString();
  return next ? `?${next}` : "";
}
