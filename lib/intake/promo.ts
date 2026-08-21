/**
 * Promo codes for the deposit checkout — the closer's pocket, not a coupon
 * system. A code grants a specific catalogue item at no charge; it never
 * discounts an amount, so the arithmetic on P0 stays additive and honest.
 *
 * One home for the codes. The server action and the deposit service both
 * resolve through this map, so a code cannot be valid on the screen and
 * unknown at the charge.
 *
 * Codes are offered out loud on sales calls (and can ride a link as
 * `?promo=`), so they are not secrets — the grant is priced into the deal
 * Taylor chose to offer. Anything a code grants must exist as a $0 Stripe
 * price via the seed + catalogue scripts.
 */

export type PromoGrant = {
  /** `products.key` of the $0 catalogue item this code adds to the order. */
  grantsProductKey: string;
};

const PROMO_CODES: Record<string, PromoGrant> = {
  TAYLOR_FREE_ITERATION_ROUND: { grantsProductKey: "changes_small_promo" },
};

/** Case- and whitespace-forgiving: a code read out on a phone call gets typed messy. */
export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
}

export function resolvePromoCode(raw: string): PromoGrant | null {
  return PROMO_CODES[normalizePromoCode(raw)] ?? null;
}
