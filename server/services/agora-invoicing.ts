import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

/**
 * Invoicing for Agora's own contracting work.
 *
 * Deliberately separate from `server/services/deposit.ts`. That file collects
 * deposits through hosted Checkout; this one issues invoices — the balance on
 * a website build, iteration charges after it, and Agora's own contracting
 * work. Same Stripe account and the same webhook endpoint; different motion,
 * and merging them would put two unrelated failure modes in one file.
 *
 * Invoicing rather than Checkout Sessions because these are scoped B2B
 * engagements billed on terms, not a fixed-price product a stranger buys in
 * one click. A finalized invoice carries its own hosted payment page, so
 * "collect payment" and "send an invoice" are one step, not two.
 */

const STRIPE_API_VERSION = "2026-07-29.dahlia";

/**
 * Product tax code for labour-based engagements, used when a Product is
 * created for Agora's own contracting work.
 *
 * `txcd_20030000` (General - Services) is Stripe's catch-all for labour; the
 * specific software codes describe software sold as a product, which is not
 * what an embedded engineer sells. Website builds use the more specific
 * Website Design code instead, set by `yarn stripe:catalogue`.
 *
 * A candidate, not a legal determination — confirm with an accountant before
 * the first live invoice. See docs/AGORA-STRIPE.md.
 */
export const SERVICES_TAX_CODE = "txcd_20030000";

let stripe: Stripe | null = null;

/**
 * Lazy for the same reason every other client in this repo is: reading the key
 * at import time would break builds and any script that needs only the types.
 */
function getStripe(): Stripe {
  stripe ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: STRIPE_API_VERSION,
  });
  return stripe;
}

/**
 * One line on an invoice, priced from the catalogue.
 *
 * A Price id rather than an amount, for the same reason the deposit uses one:
 * what you charge is a fact about the business, so it belongs in one place
 * instead of being retyped per invoice where a wrong digit is a wrong bill.
 *
 * `yarn stripe:catalogue` creates the Prices and prints their ids.
 */
export type InvoiceLine = {
  /** A Stripe Price id — `STRIPE_PRICE_BALANCE`, `STRIPE_PRICE_ITERATION`. */
  price: string;
  /** Two rounds of iterations is quantity 2, not a doubled amount. */
  quantity?: number;
  /**
   * What the client reads on this line. Display only — it never affects the
   * amount, which comes from the Price.
   *
   * Worth setting whenever an invoice has more than one line: every Price
   * under one Product inherits that Product's name, so a balance and an
   * iteration charge would otherwise both read "Website build" and the client
   * cannot tell what they are paying for.
   */
  description?: string;
};

export type DraftInvoiceInput = {
  clientEmail: string;
  clientName: string;
  /** Required for Stripe Tax to resolve a jurisdiction. */
  address?: Stripe.AddressParam;
  /** Their GST/HST or VAT number, when they have one. */
  taxId?: { type: Stripe.TaxIdCreateParams.Type; value: string };
  lines: readonly InvoiceLine[];
  /** Net terms. Stripe defaults to 30 when omitted. */
  daysUntilDue?: number;
  memo?: string;
  /**
   * Off unless the caller has confirmed an active registration covering this
   * client's jurisdiction. Enabling it without one makes Stripe collect zero
   * tax silently, and past invoices cannot be corrected afterwards.
   */
  automaticTax?: boolean;
};

/**
 * Finds an existing customer by email or creates one.
 *
 * Reusing the customer matters beyond tidiness: Stripe Tax reads the location
 * off the Customer, so a client billed twice under two customer records can be
 * taxed two different ways.
 */
async function upsertCustomer(
  input: DraftInvoiceInput,
): Promise<Stripe.Customer> {
  const existing = await getStripe().customers.list({
    email: input.clientEmail,
    limit: 1,
  });

  if (existing.data[0]) {
    const customer = existing.data[0];

    if (input.address) {
      return getStripe().customers.update(customer.id, {
        address: input.address,
        name: input.clientName,
      });
    }

    return customer;
  }

  const customer = await getStripe().customers.create({
    email: input.clientEmail,
    name: input.clientName,
    address: input.address,
  });

  if (input.taxId) {
    await getStripe().customers.createTaxId(customer.id, {
      type: input.taxId.type,
      value: input.taxId.value,
    });
  }

  return customer;
}

/**
 * Creates a draft invoice with its line items attached.
 *
 * Draft, not finalized: nothing is sent and no payment page exists until
 * `finalizeAndSend` runs. That split is deliberate — an invoice for a
 * five-figure engagement should be read by a human before it reaches a client,
 * and a finalized invoice's line items can no longer be edited.
 */
export async function createDraftInvoice(
  input: DraftInvoiceInput,
): Promise<Stripe.Invoice> {
  const customer = await upsertCustomer(input);

  const invoice = await getStripe().invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: input.daysUntilDue ?? 30,
    description: input.memo,
    auto_advance: false,
    // Off by default. See DraftInvoiceInput.automaticTax.
    automatic_tax: { enabled: input.automaticTax ?? false },
  });

  for (const line of input.lines) {
    await getStripe().invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      quantity: line.quantity ?? 1,
      description: line.description,
      // The saved Price carries the amount, the currency, the tax behaviour,
      // and — through its Product — the tax code. Nothing is restated here.
      pricing: { price: line.price },
    });
  }

  return getStripe().invoices.retrieve(invoice.id);
}

/**
 * Finalizes a draft and emails it to the client.
 *
 * Finalizing is the irreversible step: it locks the line items and mints the
 * hosted invoice URL the client pays on.
 */
export async function finalizeAndSend(
  invoiceId: string,
): Promise<Stripe.Invoice> {
  await getStripe().invoices.finalizeInvoice(invoiceId);
  return getStripe().invoices.sendInvoice(invoiceId);
}

/** The hosted page a client pays on, once the invoice is finalized. */
export function hostedInvoiceUrl(invoice: Stripe.Invoice): string | null {
  return invoice.hosted_invoice_url ?? null;
}

/**
 * Reports whether Stripe Tax is actually able to calculate anything.
 *
 * The guard that exists because the failure is silent: `status` stays
 * `pending` until a head office address is set, and `automatic_tax` collects
 * zero tax the whole time without raising.
 */
export async function taxReadiness(): Promise<{
  ready: boolean;
  status: string;
  registrations: Array<{ country: string; province: string | null }>;
}> {
  const settings = await getStripe().tax.settings.retrieve();
  const registrations = await getStripe().tax.registrations.list({
    status: "active",
    limit: 100,
  });

  return {
    ready: settings.status === "active" && registrations.data.length > 0,
    status: settings.status,
    registrations: registrations.data.map((r) => ({
      country: r.country,
      province: r.country_options?.ca?.province_standard?.province ?? null,
    })),
  };
}
