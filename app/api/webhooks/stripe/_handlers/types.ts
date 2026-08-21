import type Stripe from "stripe";

/**
 * One Stripe event type, fully handled.
 *
 * Each handler owns a single event and is the only place that event's
 * behaviour lives. Returning normally means handled; throwing means Stripe
 * should retry, which releases the event's claim so the retry can actually run.
 */
export type StripeEventHandler = (event: Stripe.Event) => Promise<void>;
