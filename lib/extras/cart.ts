/**
 * The add-ons page's cart, as it travels in a URL (FIN-8).
 *
 * `?engagement=<id>&add=showcase_admin_panel,showcase_extra_page:2` — keys,
 * each with an optional count. A **pre-selection only**: the page ticks what
 * is named and the client can change any of it. What may actually be bought,
 * and at what price, is decided on the server from the catalogue and the
 * engagement's basket; nothing here is trusted beyond "tick this first".
 *
 * Two consumers — the page (server) and the admin's link builder (client) —
 * so it lives here, platform-pure, once.
 */

export type ExtrasItem = { key: string; quantity: number };

/** The most lines one cart may carry. A typo guard. */
export const EXTRAS_MAX_LINES = 12;

const KEY = /^[a-z0-9_]{1,64}$/;

/** `a,b:2` → items. Malformed parts are dropped, never guessed at. */
export function parseExtrasQuery(
  value: string | string[] | undefined,
): ExtrasItem[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  const seen = new Set<string>();
  const items: ExtrasItem[] = [];

  for (const part of raw.split(",")) {
    const [key = "", count] = part.trim().split(":");
    const quantity = count === undefined ? 1 : Number(count);
    if (!KEY.test(key) || seen.has(key)) continue;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) continue;
    seen.add(key);
    items.push({ key, quantity });
    if (items.length === EXTRAS_MAX_LINES) break;
  }

  return items;
}

/** Items → `a,b:2`. A count of one is left implicit. */
export function serializeExtrasQuery(items: readonly ExtrasItem[]): string {
  return items
    .map((item) =>
      item.quantity === 1 ? item.key : `${item.key}:${item.quantity}`,
    )
    .join(",");
}
