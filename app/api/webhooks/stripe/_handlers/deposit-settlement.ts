import type Stripe from "stripe";
import { formatMoney } from "@/lib/intake/money";
import { fulfillDeposit } from "@/server/services/deposit";
import { notifyOps } from "@/server/services/emails";
import { findEngagementById } from "@/server/services/engagement";
import { sendDepositInvoiceEmail } from "@/server/services/invoices";

/**
 * The shared settlement path for a deposit Checkout session.
 *
 * `checkout.session.completed` and `checkout.session.async_payment_succeeded`
 * both arrive here because they mean the same thing when the money is actually
 * there. They stay separate files because they are separate events with
 * separate failure modes; what they share is this function, not a copy of it.
 *
 * The decision is `payment_status`, never which event arrived. A card pays
 * instantly and `completed` carries `paid`; a pre-authorised debit completes
 * as `unpaid` and settles days later. Fulfilling on the event alone would mark
 * a deposit paid before the money moved.
 */
export async function settleDepositSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const engagementId = session.metadata?.engagement_id;

  if (!engagementId) {
    // Nothing to act on and no retry will add metadata that was never
    // attached, so this is handled — not an error.
    console.warn(`[stripe] ${event.id}: session without engagement_id`);
    return;
  }

  if (session.payment_status === "unpaid") {
    console.info(`[stripe] ${event.id}: ${engagementId} → awaiting settlement`);
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const outcome = await fulfillDeposit(
    engagementId,
    paymentIntentId,
    session.amount_total,
    // The terms version the pay screen carried when this session was created
    // (see createDepositCheckout) — the acceptance record on the row.
    session.metadata?.terms_version ?? null,
  );

  console.info(`[stripe] ${event.id}: ${engagementId} → ${outcome}`);

  if (outcome === "unknown") return;

  // The client's paid invoice. Attempted on `already_paid` as well as on the
  // transition, because a retry after a failed send arrives as a replay —
  // the `invoice_emails` claim is what makes this exactly-once, and a send
  // failure throws so Stripe redelivers until it lands.
  const engagement = await findEngagementById(engagementId);
  const invoiceOutcome = await sendDepositInvoiceEmail(engagement, session);
  console.info(`[stripe] ${event.id}: deposit invoice email → ${invoiceOutcome}`);

  // Only the transition is worth an ops email. `already_paid` is a replay of
  // work that was announced the first time round.
  if (outcome !== "fulfilled") return;

  const amount =
    session.amount_total === null
      ? "unknown amount"
      : formatMoney(session.amount_total, session.currency ?? "cad");

  await notifyOps(`Deposit paid — ${amount}`, [
    `A website build deposit has settled.`,
    ``,
    `Amount:     ${amount}`,
    `Engagement: ${engagementId}`,
    ``,
    `They now have the questionnaire and their paid invoice email. You will`,
    `get the intake document when they finish it.`,
  ]);
}
