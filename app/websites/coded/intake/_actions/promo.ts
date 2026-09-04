"use server";

import { promoCodeInput } from "@/lib/validators/intake";
import {
  describePromo,
  type PromoDescription,
} from "@/server/services/deposit";
import { requireEngagement } from "@/server/services/engagement";

/**
 * Validates a promo code for the coded track's pay screen.
 *
 * Display-side only: activation draws the "applied" line and re-prices the
 * plan cards, and nothing else. The charge is composed independently in
 * `createDepositCheckout` from the same code map, so a stale or tampered
 * screen can never change what a session contains — only what it claimed
 * before the total contradicted it.
 *
 * Requires a live engagement token. Codes are offered in conversation; there
 * is no reason to let the internet probe the code space anonymously.
 */
export async function checkShowcasePromoCode(
  token: string,
  code: unknown,
): Promise<PromoDescription> {
  const engagement = await requireEngagement(token);
  return describePromo(engagement.track, promoCodeInput.parse(code));
}
