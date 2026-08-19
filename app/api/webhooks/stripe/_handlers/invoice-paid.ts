import type Stripe from "stripe";
import { formatMoney } from "@/lib/intake/money";
import { notifyOps } from "@/server/services/emails";
import type { StripeEventHandler } from "./types";

/**
 * `invoice.paid` — a balance or iteration invoice has been paid.
 *
 * Stripe has already emailed the client their receipt, so nothing is owed to
 * them here. What matters is that Taylor learns the money arrived without
 * having to watch a dashboard, since this happens whenever the client gets
 * round to it and there is no page anyone is sitting on.
 */
export const handleInvoicePaid: StripeEventHandler = async (event) => {
  const invoice = event.data.object as Stripe.Invoice;

  const amount = formatMoney(invoice.amount_paid, invoice.currency);
  const who = invoice.customer_name ?? invoice.customer_email ?? "client";

  console.info(
    `[stripe] ${event.id}: invoice ${invoice.id} paid — ${invoice.currency} ${invoice.amount_paid}`,
  );

  await notifyOps(`Invoice paid — ${who}, ${amount}`, [
    `${invoice.number ?? invoice.id} has been paid in full.`,
    ``,
    `Client: ${who}`,
    `Amount: ${amount}`,
    ``,
    `Stripe has sent them a receipt. Nothing else to do.`,
  ]);
};
