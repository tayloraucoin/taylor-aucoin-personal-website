"use server";

import { promoCodeInput } from "@/lib/validators/intake";
import { describePromo } from "@/server/services/deposit";
import { requireEngagement } from "@/server/services/engagement";

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
  const engagement = await requireEngagement(token);

  const described = await describePromo(
    engagement.track,
    promoCodeInput.parse(code),
  );

  // The durable screen only knows how to draw a granted item; it has no plan
  // cards for a build override to change. A code that does nothing but
  // substitute a build row is therefore not a code this screen can show.
  if (!described.valid || !described.granted) return { valid: false };

  return { valid: true, grant: described.granted };
}
