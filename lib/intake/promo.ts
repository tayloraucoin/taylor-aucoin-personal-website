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
 *
 * The one exception is the free code, which waives the deposit outright. It
 * is not in this file: it comes from `SHOWCASE_FREE_CODE` in the environment,
 * because a code that opens a build for nothing is a credential rather than
 * an offer. It resolves through the same function as the rest, so the screen
 * and the server still agree on what every code means.
 */

import { showcaseFreeCode } from "@/lib/env";

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
  /**
   * The deposit is waived: no Checkout, no charge, no Stripe object at all.
   *
   * Deliberately not a $0 build row. Stripe can run a no-cost Checkout, but
   * routing a comp through a payment processor to make a webhook fire would
   * leave `paid_at` and a ledger row for money that never moved. In this
   * schema's own vocabulary a free build is a *waived* deposit — the state
   * the `--no-deposit` script has always produced — so that is what the code
   * produces. Coded track only; see `waiveDepositByCode`.
   */
  waivesDeposit?: true;
};

const PROMO_CODES: Record<string, PromoGrant> = {
  TAYLOR_FREE_ITERATION_ROUND: { grantsProductKey: "changes_small_promo" },

  // Kryshan Randel's negotiated $1,600 (Taylor, 2026-08-26 — M-PORT-6). The
  // mechanism is ruled; the split is a labeled default: $800 half, or $1,520
  // paid in full at the same 5% the standard offer gives. Changing either
  // number is a seed edit plus one `yarn stripe:catalogue --apply`.
  APPROVED_FRIENDS_SAVE: {
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
  const code = normalizePromoCode(raw);
  if (!code) return null;

  const listed = PROMO_CODES[code];
  if (listed) return listed;

  // The free code is compared normalized on both sides, so it can be set in
  // the environment with hyphens and typed with spaces and still match.
  const free = showcaseFreeCode();
  if (free && normalizePromoCode(free) === code) return { waivesDeposit: true };

  return null;
}
