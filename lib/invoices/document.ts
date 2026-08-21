/**
 * One invoice, as data — the single source both renderers consume.
 *
 * The HTML email and the PDF attachment are two presentations of this object
 * and must never disagree: a client who compares the email against the
 * attachment is checking whether we are careless with their money. Neither
 * renderer computes anything but layout; every number is decided here.
 */

export type InvoiceLine = { label: string; amountCents: number };

export type InvoiceDocument = {
  /** "Invoice" — the document's own name, not the email's subject line. */
  title: string;
  /** Payment intent or Stripe invoice number: what a bookkeeper quotes back. */
  reference: string;
  issuedAt: Date;
  billToName: string;
  billToContact?: string | null;
  lines: InvoiceLine[];
  /** Null when no tax was collected, so the row is omitted rather than zeroed. */
  taxCents: number | null;
  totalCents: number;
  currency: string;
  paid: boolean;
  /** Hosted Stripe payment page. Present only on a payable invoice. */
  payUrl?: string | null;
  note?: string | null;
  /** Agora's GST/HST registration. Absent in environments without one. */
  gstNumber?: string | null;
};

export function invoiceSubtotalCents(doc: InvoiceDocument): number {
  return doc.lines.reduce((sum, line) => sum + line.amountCents, 0);
}

/** `invoice-clean-coast-detailing-2026-08-21.pdf` — safe as a file and an attachment. */
export function invoiceFilename(doc: InvoiceDocument): string {
  const business = doc.billToName
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const date = doc.issuedAt.toISOString().slice(0, 10);

  return `invoice-${business || "client"}-${date}.pdf`;
}

export function formatInvoiceDate(date: Date): string {
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
