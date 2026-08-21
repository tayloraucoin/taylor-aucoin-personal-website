import type Stripe from "stripe";
import { settleDepositSession } from "./deposit-settlement";
import type { StripeEventHandler } from "./types";

/**
 * `checkout.session.completed` — the client finished Checkout.
 *
 * For a card this arrives already paid and settles the deposit immediately.
 * For a delayed-notification method it arrives `unpaid`, and settlement waits
 * for `async_payment_succeeded`.
 */
export const handleCheckoutSessionCompleted: StripeEventHandler = async (
  event,
) => {
  await settleDepositSession(event, event.data.object as Stripe.Checkout.Session);
};
