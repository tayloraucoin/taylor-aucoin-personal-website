import type Stripe from "stripe";
import { formatMoney } from "@/lib/intake/money";
import { notifyOps } from "@/server/services/emails";
import type { StripeEventHandler } from "./types";

/**
 * `invoice.payment_failed` — an attempt against an invoice was declined.
 *
 * No automatic retry and no dunning email from us. These are four- and
 * five-figure invoices to businesses Taylor knows by name; the right response
 * is a phone call, not a sequence. Stripe's own retry schedule still applies
 * if it is configured, and this handler does not interfere with it.
 */
export const handleInvoicePaymentFailed: StripeEventHandler = async (event) => {
  const invoice = event.data.object as Stripe.Invoice;

  const amount = formatMoney(invoice.amount_due, invoice.currency);
  const who = invoice.customer_name ?? invoice.customer_email ?? "client";

  console.warn(
    `[stripe] ${event.id}: invoice ${invoice.id} payment failed — ${invoice.currency} ${invoice.amount_due}`,
  );

  await notifyOps(`Invoice payment failed — ${who}, ${amount}`, [
    `A payment against ${invoice.number ?? invoice.id} was declined.`,
    ``,
    `Client:   ${who}`,
    `Amount:   ${amount}`,
    `Attempts: ${invoice.attempt_count}`,
    ``,
    `The invoice is still open and still payable at:`,
    invoice.hosted_invoice_url ?? "(no hosted URL — check the Dashboard)",
    ``,
    `A call lands better than another email at this size.`,
  ]);
};
