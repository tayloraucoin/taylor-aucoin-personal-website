import type Stripe from "stripe";
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

  await notifyOps("Deposit payment failed", [
    `A deposit payment did not clear. The engagement is still unpaid and the`,
    `client cannot start the questionnaire.`,
    ``,
    `Engagement: ${engagementId}`,
    ``,
    `Worth a call rather than an email — they may not know yet.`,
  ]);
};
