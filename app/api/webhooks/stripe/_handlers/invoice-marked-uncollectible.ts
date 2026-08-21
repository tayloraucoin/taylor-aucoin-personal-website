import type Stripe from "stripe";
import { formatMoney } from "@/lib/intake/money";
import { notifyOps } from "@/server/services/emails";
import type { StripeEventHandler } from "./types";

/**
 * `invoice.marked_uncollectible` — an invoice has been written off.
 *
 * Only ever a deliberate act in the Dashboard, never something Stripe decides.
 * The handler exists so the write-off is recorded and surfaced rather than
 * happening silently: an invoice that quietly stops chasing itself is how a
 * debt gets forgotten.
 */
export const handleInvoiceMarkedUncollectible: StripeEventHandler = async (
  event,
) => {
  const invoice = event.data.object as Stripe.Invoice;

  const amount = formatMoney(invoice.amount_due, invoice.currency);
  const who = invoice.customer_name ?? invoice.customer_email ?? "client";

  console.warn(
    `[stripe] ${event.id}: invoice ${invoice.id} marked uncollectible — ${invoice.currency} ${invoice.amount_due}`,
  );

  await notifyOps(`Invoice written off — ${who}, ${amount}`, [
    `${invoice.number ?? invoice.id} has been marked uncollectible.`,
    ``,
    `Client: ${who}`,
    `Amount: ${amount}`,
    ``,
    `Recorded for your tax reporting. No further collection will be attempted.`,
  ]);
};
