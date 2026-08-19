"use server";

import { redirect } from "next/navigation";
import { createDepositCheckout } from "@/server/services/deposit";
import { requireEngagement } from "@/server/services/engagement";

/**
 * Opens Checkout for this engagement's deposit.
 *
 * Thin: resolve through the seam, call the service, redirect. The amount comes
 * from the row — the client's browser never proposes what it is about to be
 * charged, which is the whole reason this is a server action and not a fetch
 * with a body.
 *
 * `redirect` throws by design in Next, so nothing follows it.
 */
export async function startDepositCheckout(token: string): Promise<void> {
  const engagement = await requireEngagement(token);
  const url = await createDepositCheckout(engagement, token);
  redirect(url);
}
