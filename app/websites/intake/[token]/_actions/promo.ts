"use server";

import { promoCodeInput } from "@/lib/validators/intake";
import { resolvePromoCode } from "@/lib/intake/promo";
import { requireEngagement } from "@/server/services/engagement";
import { findSellableProductByKey } from "@/server/services/products";

/** What the pay screen renders for an activated code. Display only. */
export type PromoCheckResult =
  | { valid: true; grant: { key: string; name: string; description: string } }
  | { valid: false };

/**
 * Validates a promo code for the pay screen.
 *
 * Display-side only: activation here draws the "included" line and nothing
 * else. The charge is composed independently in `createDepositCheckout` from
 * the same code map, so a stale or tampered screen can never change what a
 * session contains.
 *
 * Requires a live engagement token — codes are offered on calls, and there
 * is no reason to let the internet probe the code space anonymously.
 */
export async function checkPromoCode(
  token: string,
  code: unknown,
): Promise<PromoCheckResult> {
  await requireEngagement(token);

  const parsed = promoCodeInput.parse(code);
  const grant = parsed ? resolvePromoCode(parsed) : null;
  if (!grant) return { valid: false };

  const product = await findSellableProductByKey(grant.grantsProductKey);
  if (!product) return { valid: false };

  return {
    valid: true,
    grant: {
      key: product.key,
      name: product.name,
      description: product.description,
    },
  };
}
