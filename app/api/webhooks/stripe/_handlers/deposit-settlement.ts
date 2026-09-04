import type Stripe from "stripe";
import { formatMoney } from "@/lib/intake/money";
import {
  fulfillDeposit,
  settleAncillaryPurchase,
} from "@/server/services/deposit";
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

  // Not every Checkout session on an engagement is the build. An extra-page
  // charge settles its own basket rows and must never mark the deposit paid —
  // `paid_at` means the build was bought, and a client whose extra pages set
  // it would walk straight past the pay screen into a questionnaire they had
  // not paid for (M-PORT-4).
  if (session.metadata?.charge_kind === "extra_pages") {
    await settleExtraPages(event, session, engagementId);
    return;
  }

  // An add-on the client bought for themselves mid-questionnaire (PORT-26).
  // Same rule, same reason: it stamps its own basket row and leaves `paid_at`
  // alone.
  if (session.metadata?.charge_kind === "addon") {
    await settleAddon(event, session, engagementId);
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

/**
 * Settles an add-on the client bought mid-questionnaire.
 *
 * Quieter than a deposit and quieter than extra pages: no invoice, no
 * questionnaire handover, and no client email beyond Stripe's own receipt —
 * they are sitting on the step this returns them to and the block above the
 * questions will have changed by the time they look up. What it does do is
 * stamp the basket, so the engagement's record shows what was actually bought,
 * and tell Taylor, because the work is now owed.
 */
async function settleAddon(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  engagementId: string,
): Promise<void> {
  const productKey = session.metadata?.product_key;

  if (!productKey) {
    console.warn(`[stripe] ${event.id}: add-on session without product_key`);
    return;
  }

  const outcome = await settleAncillaryPurchase(engagementId, productKey);
  console.info(`[stripe] ${event.id}: ${engagementId} add-on → ${outcome}`);

  // A replay has already been announced once.
  if (outcome !== "settled") return;

  const amount =
    session.amount_total === null
      ? "unknown amount"
      : formatMoney(session.amount_total, session.currency ?? "cad");

  await notifyOps(`Add-on paid — ${amount}`, [
    `A client bought an add-on from inside the questionnaire.`,
    ``,
    `Add-on:     ${productKey}`,
    `Amount:     ${amount}`,
    `Engagement: ${engagementId}`,
    ``,
    `Their deposit state is untouched by this.`,
  ]);
}

/**
 * Settles an extra-page purchase.
 *
 * Deliberately quieter than a deposit: no invoice email and no questionnaire
 * to hand over — the client already has both. What it does do is stamp the
 * basket so the engagement's record shows what was actually bought, and tell
 * Taylor, because he is the one who agreed to it on a call and will be asked
 * about it later.
 */
async function settleExtraPages(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  engagementId: string,
): Promise<void> {
  const productKey = session.metadata?.product_key;

  if (!productKey) {
    console.warn(`[stripe] ${event.id}: extra-page session without product_key`);
    return;
  }

  const outcome = await settleAncillaryPurchase(engagementId, productKey);
  console.info(`[stripe] ${event.id}: ${engagementId} extra pages → ${outcome}`);

  // A replay has already been announced once.
  if (outcome !== "settled") return;

  const amount =
    session.amount_total === null
      ? "unknown amount"
      : formatMoney(session.amount_total, session.currency ?? "cad");

  await notifyOps(`Extra pages paid — ${amount}`, [
    `An extra-page charge has settled.`,
    ``,
    `Amount:     ${amount}`,
    `Pages:      ${session.metadata?.pages ?? "unknown"}`,
    `Engagement: ${engagementId}`,
    ``,
    `Their deposit state is untouched by this.`,
  ]);
}
