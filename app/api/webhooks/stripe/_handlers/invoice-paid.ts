import type Stripe from "stripe";
import { formatMoney } from "@/lib/intake/money";
import { notifyOps } from "@/server/services/emails";
import { sendStripeInvoiceEmail } from "@/server/services/invoices";
import type { StripeEventHandler } from "./types";

/**
 * `invoice.paid` — a balance or iteration invoice has been paid.
 *
 * The client gets Agora's paid invoice — their permanent record — and Taylor
 * learns the money arrived without having to watch a dashboard. Stripe's own
 * receipt emails stay off in the Dashboard so this is the only email the
 * client sees for the payment.
 */
export const handleInvoicePaid: StripeEventHandler = async (event) => {
  const invoice = event.data.object as Stripe.Invoice;

  const amount = formatMoney(invoice.amount_paid, invoice.currency);
  const who = invoice.customer_name ?? invoice.customer_email ?? "client";

  console.info(
    `[stripe] ${event.id}: invoice ${invoice.id} paid — ${invoice.currency} ${invoice.amount_paid}`,
  );

  const sent = await sendStripeInvoiceEmail(invoice, "invoice_paid");

  await notifyOps(`Invoice paid — ${who}, ${amount}`, [
    `${invoice.number ?? invoice.id} has been paid in full.`,
    ``,
    `Client: ${who}`,
    `Amount: ${amount}`,
    ``,
    sent === "sent"
      ? `They have Agora's paid invoice email. Nothing else to do.`
      : sent === "already_sent"
        ? `Their paid invoice email already went out. Nothing else to do.`
        : `No client email on the invoice, so no paid invoice was emailed.`,
  ]);
};
