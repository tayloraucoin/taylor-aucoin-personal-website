"use server";

import { redirect } from "next/navigation";
import { depositAddonSelectionInput, promoCodeInput } from "@/lib/validators/intake";
import { buildPlanInput } from "@/lib/validators/showcase-intake";
import { createDepositCheckout } from "@/server/services/deposit";
import { requireEngagement } from "@/server/services/engagement";

/**
 * Opens Checkout for a coded-track build plus any ticked add-ons.
 *
 * Thin: resolve through the seam, call the service, redirect. The browser
 * proposes a *plan* and a set of catalogue keys — never a product id and never
 * an amount. The service resolves the plan against the live catalogue and
 * verifies every price against Stripe before a session exists, which is the
 * whole reason this is a server action and not a fetch with a body.
 *
 * `redirect` throws by design in Next, so nothing follows it.
 */
export async function startShowcaseCheckout(
  token: string,
  plan: unknown,
  addonKeys: unknown = [],
  promoCode?: unknown,
): Promise<void> {
  const engagement = await requireEngagement(token);

  // A durable engagement cannot buy a coded build. Its own tree's action is
  // the only one that may charge it.
  if (engagement.track !== "showcase") {
    throw new Error("This engagement is not on the coded track.");
  }

  const url = await createDepositCheckout(
    engagement,
    token,
    depositAddonSelectionInput.parse(addonKeys),
    promoCodeInput.parse(promoCode),
    false,
    buildPlanInput.parse(plan),
  );

  redirect(url);
}
