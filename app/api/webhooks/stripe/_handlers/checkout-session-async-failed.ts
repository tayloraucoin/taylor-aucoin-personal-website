import type Stripe from "stripe";
import { releaseFailedSession } from "@/server/services/deposit";
import { notifyOps } from "@/server/services/emails";
import type { StripeEventHandler } from "./types";

/**
 * `checkout.session.async_payment_failed` — a delayed payment bounced.
 *
 * The engagement stays unpaid, which is already correct: nothing was ever
 * marked paid, so there is no state to unwind. What is needed is a human,
 * because the client believes they have paid and their bank disagrees.
 *
 * The client is deliberately not emailed. They will hear from their own bank,
 * and a message from us arriving first — about money, unprompted — reads worse
 * than a call from Taylor.
 */
export const handleCheckoutSessionAsyncFailed: StripeEventHandler = async (
  event,
) => {
  const session = event.data.object as Stripe.Checkout.Session;
  const engagementId = session.metadata?.engagement_id ?? "unknown";

  console.warn(`[stripe] ${event.id}: ${engagementId} → async payment failed`);

  // Not every Checkout session is the deposit. The add-ons page's, an
  // add-on's, or extra pages' failing leaves the build exactly as it was, and
  // an alert that said otherwise would send Taylor chasing the wrong thing.
  const chargeKind = session.metadata?.charge_kind;

  if (chargeKind) {
    // Its rows would otherwise read as money in flight and refuse the
    // client's next attempt (FIN-8).
    if (session.metadata?.engagement_id) {
      await releaseFailedSession(session.metadata.engagement_id, session.id);
    }

    await notifyOps("Payment failed", [
      `A payment did not clear. Nothing was marked bought, and their build`,
      `is unaffected.`,
      ``,
      `Kind:       ${chargeKind === "extras" ? "add-ons page" : chargeKind}`,
      `Lines:      ${session.metadata?.product_keys ?? session.metadata?.product_key ?? "unknown"}`,
      `Engagement: ${engagementId}`,
      ``,
      `Worth a call rather than an email — they may not know yet.`,
    ]);
    return;
  }

  await notifyOps("Deposit payment failed", [
    `A deposit payment did not clear. The engagement is still unpaid and the`,
    `client cannot start the questionnaire.`,
    ``,
    `Engagement: ${engagementId}`,
    ``,
    `Worth a call rather than an email — they may not know yet.`,
  ]);
};
