import type Stripe from "stripe";
import { formatMoney } from "@/lib/intake/money";
import { notifyOps } from "@/server/services/emails";
import type { StripeEventHandler } from "./types";

/**
 * `invoice.finalized` — an invoice is now payable and has a hosted page.
 *
 * This is the event that does real work for the way Taylor bills: the balance
 * and iteration invoices go out as a link by email or text, and the link does
 * not exist until finalization mints it. So the handler's job is to put that
 * URL somewhere he can copy it from a phone.
 */
export const handleInvoiceFinalized: StripeEventHandler = async (event) => {
  const invoice = event.data.object as Stripe.Invoice;

  const amount = formatMoney(invoice.amount_due, invoice.currency);
  const who = invoice.customer_name ?? invoice.customer_email ?? "client";

  console.info(
    `[stripe] ${event.id}: invoice ${invoice.id} finalized — ${invoice.currency} ${invoice.amount_due}`,
  );

  await notifyOps(`Invoice ready to send — ${who}, ${amount}`, [
    `${invoice.number ?? invoice.id} is finalized and payable.`,
    ``,
    `Client: ${who}`,
    `Amount: ${amount}`,
    `Due:    ${invoice.due_date ? new Date(invoice.due_date * 1000).toISOString().slice(0, 10) : "on receipt"}`,
    ``,
    `Send this link by email or text:`,
    invoice.hosted_invoice_url ?? "(no hosted URL — check the Dashboard)",
    ``,
    `PDF: ${invoice.invoice_pdf ?? "(none)"}`,
  ]);
};
