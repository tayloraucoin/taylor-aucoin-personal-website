import type Stripe from "stripe";
import { handleCheckoutSessionAsyncFailed } from "./checkout-session-async-failed";
import { handleCheckoutSessionAsyncSucceeded } from "./checkout-session-async-succeeded";
import { handleCheckoutSessionCompleted } from "./checkout-session-completed";
import { handleInvoiceFinalized } from "./invoice-finalized";
import { handleInvoiceMarkedUncollectible } from "./invoice-marked-uncollectible";
import { handleInvoicePaid } from "./invoice-paid";
import { handleInvoicePaymentFailed } from "./invoice-payment-failed";
import type { StripeEventHandler } from "./types";

/**
 * Every Stripe event this application acts on, and the one file that owns it.
 *
 * A registry rather than a switch: adding an event means adding a file and a
 * line here, and an event with no entry is ignored explicitly rather than
 * falling through a default nobody reads. Endpoints should also be scoped to
 * these types in the Dashboard, so anything arriving that is not listed here
 * is a configuration drift worth noticing.
 *
 * `payment_intent.*` is deliberately absent. Those fire for the same money as
 * the Checkout events, and two handlers fulfilling one payment is how
 * double-handling gets invented.
 */
export const HANDLERS: Partial<Record<Stripe.Event["type"], StripeEventHandler>> = {
  // Deposits — website builds, paid through hosted Checkout.
  "checkout.session.completed": handleCheckoutSessionCompleted,
  "checkout.session.async_payment_succeeded": handleCheckoutSessionAsyncSucceeded,
  "checkout.session.async_payment_failed": handleCheckoutSessionAsyncFailed,

  // Balances and iterations — billed by invoice, paid on a hosted page.
  "invoice.finalized": handleInvoiceFinalized,
  "invoice.paid": handleInvoicePaid,
  "invoice.payment_failed": handleInvoicePaymentFailed,
  "invoice.marked_uncollectible": handleInvoiceMarkedUncollectible,
};
