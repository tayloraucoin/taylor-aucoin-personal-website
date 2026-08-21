"use server";

import { redirect } from "next/navigation";
import {
  adminTestPaymentInput,
  depositAddonSelectionInput,
  promoCodeInput,
} from "@/lib/validators/intake";
import { createDepositCheckout } from "@/server/services/deposit";
import { requireEngagement } from "@/server/services/engagement";

/**
 * Opens Checkout for this engagement's deposit plus any ticked add-ons.
 *
 * Thin: resolve through the seam, call the service, redirect. The browser
 * only ever proposes *which* catalogue keys it ticked — never an amount; the
 * service resolves keys against the live catalogue and verifies every price
 * against Stripe before a session exists. That is the whole reason this is a
 * server action and not a fetch with a body.
 *
 * `redirect` throws by design in Next, so nothing follows it.
 */
export async function startDepositCheckout(
  token: string,
  addonKeys: unknown = [],
  promoCode?: unknown,
  adminTestPayment?: unknown,
): Promise<void> {
  const engagement = await requireEngagement(token);
  const keys = depositAddonSelectionInput.parse(addonKeys);
  const promo = promoCodeInput.parse(promoCode);
  const useAdminTest = adminTestPaymentInput.parse(adminTestPayment);
  const url = await createDepositCheckout(
    engagement,
    token,
    keys,
    promo,
    useAdminTest,
  );
  redirect(url);
}
