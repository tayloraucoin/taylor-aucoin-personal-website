import type Stripe from "stripe";
import { settleDepositSession } from "./deposit-settlement";
import type { StripeEventHandler } from "./types";

/**
 * `checkout.session.async_payment_succeeded` — a delayed payment cleared.
 *
 * This is the event that actually settles a pre-authorised debit, hours or
 * days after the client left the page. Without it those deposits would never
 * be fulfilled at all.
 */
export const handleCheckoutSessionAsyncSucceeded: StripeEventHandler = async (
  event,
) => {
  await settleDepositSession(event, event.data.object as Stripe.Checkout.Session);
};
