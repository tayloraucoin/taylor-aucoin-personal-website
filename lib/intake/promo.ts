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
  grantsProductKey?: string;
  /**
   * `products.key` that replaces the build line for this order.
   *
   * The negotiated-price mechanism, and it keeps the law above intact: a code
   * still never computes a discount, it swaps which catalogue row is charged.
   * The substituted row is a real seeded product with its own immutable Stripe
   * Price, so what was charged stays auditable years later — which a runtime
   * percentage-off would not be.
   *
   * `half` and `full` are the two plans the pay screen offers. A code with no
   * `full` row renders only the half-payment card, because offering a
   * pay-in-full option that resolves to nothing is a screen that lies.
   */
  overridesBuildKey?: { half: string; full?: string };
};

const PROMO_CODES: Record<string, PromoGrant> = {
  TAYLOR_FREE_ITERATION_ROUND: { grantsProductKey: "changes_small_promo" },

  // Kryshan Randel's negotiated $1,600 (Taylor, 2026-08-26 — M-PORT-6). The
  // mechanism is ruled; the split is a labeled default: $800 half, or $1,520
  // paid in full at the same 5% the standard offer gives. Changing either
  // number is a seed edit plus one `yarn stripe:catalogue --apply`.
  KRYSHAN_1600: {
    overridesBuildKey: {
      half: "showcase_deposit_1600",
      full: "showcase_full_1600",
    },
  },
};

/** Case- and whitespace-forgiving: a code read out on a phone call gets typed messy. */
export function normalizePromoCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

export function resolvePromoCode(raw: string): PromoGrant | null {
  return PROMO_CODES[normalizePromoCode(raw)] ?? null;
}
