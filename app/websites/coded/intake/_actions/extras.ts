"use server";

import { redirect } from "next/navigation";
import type { ExtrasItem } from "@/lib/extras/cart";
import { startExtrasCheckout } from "@/server/services/extras";

/**
 * The add-ons page's pay press (FIN-8).
 *
 * Thin: the service re-reads the engagement, re-checks the cart against its
 * own catalogue and basket, and opens Checkout. The browser sends catalogue
 * keys and counts — never a product id, never an amount.
 *
 * A refusal comes back as a sentence rather than a throw, so the page can
 * say what happened; a success redirects, which throws by design.
 */
export async function startExtrasCheckoutAction(
  engagementId: string,
  items: ExtrasItem[],
): Promise<{ ok: false; message: string }> {
  const result = await startExtrasCheckout({ engagementId, items });

  if (result.status === "redirect") redirect(result.url);

  if (result.status === "in_flight") {
    return {
      ok: false,
      // [COPY — draft]
      message:
        "A payment from this page is already going through. Give it a minute, then reload.",
    };
  }

  return { ok: false, message: result.message };
}
