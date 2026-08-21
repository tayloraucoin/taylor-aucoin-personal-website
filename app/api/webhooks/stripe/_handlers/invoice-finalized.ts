import type Stripe from "stripe";
import { formatMoney } from "@/lib/intake/money";
import { notifyOps } from "@/server/services/emails";
import { sendStripeInvoiceEmail } from "@/server/services/invoices";
import type { StripeEventHandler } from "./types";

/**
 * `invoice.finalized` — an invoice is now payable and has a hosted page.
 *
 * This is the event that does real work for the way Taylor bills: on
 * finalization, the client gets Agora's own invoice email with the hosted
 * payment link (send-once via `invoice_emails`), and Taylor gets the link to
 * follow up by text. Stripe's own customer emails stay off in the Dashboard —
 * ours is the only invoice the client sees.
 */
export const handleInvoiceFinalized: StripeEventHandler = async (event) => {
  const invoice = event.data.object as Stripe.Invoice;

  const amount = formatMoney(invoice.amount_due, invoice.currency);
  const who = invoice.customer_name ?? invoice.customer_email ?? "client";

  console.info(
    `[stripe] ${event.id}: invoice ${invoice.id} finalized — ${invoice.currency} ${invoice.amount_due}`,
  );

  const sent = await sendStripeInvoiceEmail(invoice, "invoice_due");

  await notifyOps(`Invoice finalized — ${who}, ${amount}`, [
    `${invoice.number ?? invoice.id} is finalized and payable.`,
    ``,
    `Client: ${who}`,
    `Amount: ${amount}`,
    `Due:    ${invoice.due_date ? new Date(invoice.due_date * 1000).toISOString().slice(0, 10) : "on receipt"}`,
    ``,
    sent === "sent"
      ? `The client has been emailed Agora's invoice with the payment link.`
      : sent === "already_sent"
        ? `The client already has Agora's invoice email for this one.`
        : `No client email on the invoice — nothing was sent to them.`,
    ``,
    `Hosted link, for a text follow-up:`,
    invoice.hosted_invoice_url ?? "(no hosted URL — check the Dashboard)",
  ]);
};
