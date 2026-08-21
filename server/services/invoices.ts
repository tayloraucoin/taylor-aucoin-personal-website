import type Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { and, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  engagementProducts,
  invoiceEmails,
  products,
  type InvoiceEmailRow,
} from "@/db/schema";
import { agoraGstNumber, requireEnv } from "@/lib/env";
import { formatMoney } from "@/lib/intake/money";
import {
  formatInvoiceDate,
  invoiceFilename,
  invoiceSubtotalCents,
  type InvoiceDocument,
  type InvoiceLine,
} from "@/lib/invoices/document";
import { PAPER } from "@/lib/invoices/paper";
import type { Engagement } from "./engagement";
import { notifyOps, sendRawEmail } from "./emails";
import { renderInvoicePdf } from "./invoice-pdf";

/**
 * The invoice emails Agora sends its website-build clients, in response to
 * Stripe webhooks. These are the only client-facing billing emails — Stripe's
 * own receipt and invoice emails must stay off in the Dashboard, because two
 * differently-branded documents for one payment reads as a scam warning to
 * exactly the audience this business serves.
 *
 * Each send carries the PDF as an attachment and archives a copy in the
 * PRIVATE bucket. The email body is the readable version; the PDF is the
 * document a bookkeeper files. Both render from one `InvoiceDocument`, so
 * they cannot disagree about a number.
 *
 * Send-once is a property of `invoice_emails` (claim before send, release on
 * failure), keyed by the Stripe object id so it holds across webhook replays
 * and across re-sent events with fresh event ids. A send failure throws out
 * of the webhook handler on purpose: the released claim plus Stripe's retry
 * is the delivery mechanism, and every path in here is idempotent.
 */

type InvoiceEmailKind = InvoiceEmailRow["kind"];

/**
 * The archive bucket. Invoices are client-confidential and never go in the
 * PUBLIC bucket — a public URL to a client's billing is a disclosure with a
 * CDN in front of it. Overridable because the bucket name is infrastructure,
 * not a code fact.
 */
function archiveBucket(): string {
  return process.env.INVOICE_PDF_BUCKET?.trim() || "PRIVATE";
}

let storage: ReturnType<typeof createClient> | null = null;

function getStorage() {
  storage ??= createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );
  return storage;
}

/** Claims the right to send one kind for one Stripe object, exactly once. */
async function claimInvoiceEmail(
  stripeObjectId: string,
  kind: InvoiceEmailKind,
): Promise<string | null> {
  const claimed = await getDb()
    .insert(invoiceEmails)
    .values({ kind, stripeObjectId })
    .onConflictDoNothing()
    .returning({ id: invoiceEmails.id });

  return claimed[0]?.id ?? null;
}

async function releaseInvoiceEmail(id: string): Promise<void> {
  await getDb().delete(invoiceEmails).where(eq(invoiceEmails.id, id));
}

/**
 * Archives the PDF and records where it went.
 *
 * Deliberately non-fatal: the client's copy is the attachment they already
 * have, so a storage outage must not block the invoice or trigger a webhook
 * retry storm. A failure leaves `pdf_storage_path` null and tells Taylor.
 */
async function archiveInvoicePdf(input: {
  claimId: string;
  pdf: Buffer;
  storagePath: string;
}): Promise<void> {
  try {
    const { error } = await getStorage()
      .storage.from(archiveBucket())
      .upload(input.storagePath, input.pdf, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) throw new Error(error.message);

    await getDb()
      .update(invoiceEmails)
      .set({ pdfStoragePath: input.storagePath })
      .where(eq(invoiceEmails.id, input.claimId));
  } catch (error) {
    console.error(
      `[invoices] archive failed for ${input.storagePath}`,
      error instanceof Error ? error.message : "unknown error",
    );

    await notifyOps("Invoice PDF was not archived", [
      `The client's invoice email went out with its PDF attached, but the`,
      `archive copy failed to upload.`,
      ``,
      `Path:   ${input.storagePath}`,
      `Bucket: ${archiveBucket()}`,
      ``,
      `Nothing is broken for the client. The row in invoice_emails has a null`,
      `pdf_storage_path, which is how to find these later.`,
    ]);
  }
}

/* ── Rendering ────────────────────────────────────────────────────────── */

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Type stacks for email. Custom faces cannot be relied on in a mail client,
 * so the email asks for the brand families and falls back to the closest
 * system face; the attached PDF is where the real type lives.
 */
const DISPLAY_STACK = `'Space Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif`;
const BODY_STACK = `Manrope,'Helvetica Neue',Helvetica,Arial,sans-serif`;
const MONO_STACK = `'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;

/**
 * The HTML invoice email — the same document as the PDF, in the same paper
 * palette (D-DOC-1): white page, ink text, gold as rule and chip only.
 *
 * Tables and inline styles throughout, because every mail client strips
 * anything else.
 */
export function renderInvoiceEmailHtml(doc: InvoiceDocument): string {
  const subtotal = invoiceSubtotalCents(doc);
  const money = (cents: number) => formatMoney(cents, doc.currency);

  const lineRows = doc.lines
    .map(
      (line) => `
        <tr>
          <td style="padding:11px 0;border-bottom:1px solid ${PAPER.hairline};font-family:${BODY_STACK};font-size:15px;color:${PAPER.ink};">${esc(line.label)}</td>
          <td align="right" style="padding:11px 0;border-bottom:1px solid ${PAPER.hairline};font-family:${MONO_STACK};font-size:14px;color:${PAPER.ink};white-space:nowrap;">${money(line.amountCents)}</td>
        </tr>`,
    )
    .join("");

  const taxRow =
    doc.taxCents !== null
      ? `
        <tr>
          <td style="padding:6px 0 0;font-family:${BODY_STACK};font-size:14px;color:${PAPER.dim};">GST</td>
          <td align="right" style="padding:6px 0 0;font-family:${MONO_STACK};font-size:13px;color:${PAPER.body};white-space:nowrap;">${money(doc.taxCents)}</td>
        </tr>`
      : "";

  const metaRow = (label: string, value: string) => `
        <tr>
          <td style="padding:4px 0;font-family:${MONO_STACK};font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:${PAPER.dim};">${esc(label)}</td>
          <td align="right" style="padding:4px 0;font-family:${BODY_STACK};font-size:14px;color:${PAPER.ink};">${esc(value)}</td>
        </tr>`;

  const statusChip = doc.paid
    ? `<span style="display:inline-block;background:${PAPER.gold};color:${PAPER.ink};font-family:${MONO_STACK};font-size:10px;letter-spacing:.18em;padding:5px 9px;border-radius:3px;">PAID IN FULL</span>`
    : `<span style="display:inline-block;border:1px solid ${PAPER.hairline};color:${PAPER.dim};font-family:${MONO_STACK};font-size:10px;letter-spacing:.18em;padding:5px 9px;border-radius:3px;">DUE ON RECEIPT</span>`;

  const payBlock =
    !doc.paid && doc.payUrl
      ? `
        <tr><td colspan="2" style="padding:28px 0 0;">
          <a href="${esc(doc.payUrl)}" style="display:inline-block;background:${PAPER.gold};color:${PAPER.ink};text-decoration:none;font-family:${MONO_STACK};font-size:13px;letter-spacing:.06em;padding:13px 24px;border-radius:3px;">Pay this invoice</a>
          <p style="margin:11px 0 0;font-family:${BODY_STACK};font-size:13px;color:${PAPER.dim};">Secure payment by Stripe — card, Apple Pay, or Google Pay.</p>
        </td></tr>`
      : "";

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${PAPER.tint};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER.tint};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${PAPER.paper};border-radius:3px;padding:44px 46px;">

  <tr><td style="border-top:2px solid ${PAPER.ink};padding-top:12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:${MONO_STACK};font-size:10px;letter-spacing:.22em;color:${PAPER.ink};white-space:nowrap;">AGORA&nbsp;·&nbsp;NETWORK&nbsp;TECHNOLOGIES</td>
      <td style="padding-left:12px;"><div style="height:1px;background:${PAPER.gold};"></div></td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:32px 0 0;font-family:${DISPLAY_STACK};font-size:30px;font-weight:500;letter-spacing:-.02em;color:${PAPER.ink};">${esc(doc.title)}</td></tr>
  <tr><td style="padding:11px 0 0;">${statusChip}</td></tr>

  <tr><td style="padding:26px 0 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER.tint};border-radius:3px;padding:14px 16px;">
      ${metaRow("Billed to", doc.billToContact ? `${doc.billToName} · ${doc.billToContact}` : doc.billToName)}
      ${metaRow("Date", formatInvoiceDate(doc.issuedAt))}
      ${metaRow("Reference", doc.reference)}
      ${doc.gstNumber ? metaRow("GST / HST no.", doc.gstNumber) : ""}
    </table>
  </td></tr>

  <tr><td style="padding:30px 0 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:0 0 7px;border-bottom:1px solid ${PAPER.ink};font-family:${MONO_STACK};font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:${PAPER.dim};">Description</td>
        <td align="right" style="padding:0 0 7px;border-bottom:1px solid ${PAPER.ink};font-family:${MONO_STACK};font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:${PAPER.dim};">Amount</td>
      </tr>
      ${lineRows}
      <tr>
        <td style="padding:12px 0 0;font-family:${BODY_STACK};font-size:14px;color:${PAPER.dim};">Subtotal</td>
        <td align="right" style="padding:12px 0 0;font-family:${MONO_STACK};font-size:13px;color:${PAPER.body};white-space:nowrap;">${money(subtotal)}</td>
      </tr>
      ${taxRow}
      <tr>
        <td style="padding:13px 0 0;border-top:1px solid ${PAPER.ink};font-family:${DISPLAY_STACK};font-size:17px;font-weight:500;color:${PAPER.ink};">Total ${doc.paid ? "paid" : "due"}</td>
        <td align="right" style="padding:13px 0 0;border-top:1px solid ${PAPER.ink};font-family:${DISPLAY_STACK};font-size:19px;font-weight:500;color:${PAPER.ink};white-space:nowrap;">${money(doc.totalCents)}</td>
      </tr>
      ${payBlock}
    </table>
  </td></tr>

  ${doc.note ? `<tr><td style="padding:24px 0 0;font-family:${BODY_STACK};font-size:14px;line-height:1.65;color:${PAPER.body};">${esc(doc.note)}</td></tr>` : ""}

  <tr><td style="padding:20px 0 0;font-family:${BODY_STACK};font-size:13px;color:${PAPER.dim};">A PDF copy is attached for your records.</td></tr>

  <tr><td style="padding:30px 0 0;border-top:1px solid ${PAPER.hairline};">
    <p style="margin:14px 0 0;font-family:${MONO_STACK};font-size:10px;line-height:1.9;letter-spacing:.08em;color:${PAPER.dim};">
      AGORA NETWORK TECHNOLOGIES INC. · BRITISH COLUMBIA, CANADA<br>
      <a href="mailto:hello@tayloraucoin.com" style="color:${PAPER.dim};text-decoration:underline;">HELLO@TAYLORAUCOIN.COM</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function renderInvoiceEmailText(doc: InvoiceDocument): string {
  const money = (cents: number) => formatMoney(cents, doc.currency);

  const lines = [
    `${doc.title} — Agora Network Technologies Inc.`,
    ``,
    ...doc.lines.map((l) => `${l.label}: ${money(l.amountCents)}`),
    ...(doc.taxCents !== null ? [`GST: ${money(doc.taxCents)}`] : []),
    `Total ${doc.paid ? "paid" : "due"}: ${money(doc.totalCents)}`,
    ``,
    `Reference: ${doc.reference}`,
    `Date: ${formatInvoiceDate(doc.issuedAt)}`,
    ...(doc.gstNumber ? [`GST/HST no.: ${doc.gstNumber}`] : []),
  ];

  if (!doc.paid && doc.payUrl) lines.push(``, `Pay here: ${doc.payUrl}`);

  lines.push(
    ``,
    `A PDF copy is attached for your records.`,
    ``,
    `Agora Network Technologies Inc. · British Columbia, Canada`,
    `hello@tayloraucoin.com`,
  );

  return lines.join("\n");
}

/**
 * Renders, archives, and sends one invoice.
 *
 * The order is deliberate: PDF first (a failure here means no email at all,
 * and Stripe's retry gets another go), archive second and non-fatally, send
 * last. The claim is released by the caller's catch so a retry can repeat the
 * whole sequence.
 */
async function deliverInvoice(input: {
  claimId: string;
  to: string;
  subject: string;
  doc: InvoiceDocument;
  storagePath: string;
}): Promise<void> {
  const pdf = await renderInvoicePdf(input.doc);

  await archiveInvoicePdf({
    claimId: input.claimId,
    pdf,
    storagePath: input.storagePath,
  });

  await sendRawEmail({
    to: input.to,
    subject: input.subject,
    html: renderInvoiceEmailHtml(input.doc),
    text: renderInvoiceEmailText(input.doc),
    attachments: [{ filename: invoiceFilename(input.doc), content: pdf }],
  });
}

/** Warns once when a registered supplier's invoice would ship without its number. */
async function warnIfNoGstNumber(businessName: string): Promise<void> {
  if (agoraGstNumber()) return;

  await notifyOps("Invoice sent without a GST number", [
    `AGORA_GST_NUMBER is not set, so the invoice for ${businessName} went out`,
    `without a GST/HST registration number. A registered supplier's invoice`,
    `needs one for the client to claim their input tax credit — set the env`,
    `var and the next invoice carries it.`,
  ]);
}

/* ── The deposit rail ─────────────────────────────────────────────────── */

/**
 * The paid invoice for a settled deposit Checkout session — the client's
 * permanent record of the deal as struck: deposit, any add-ons, GST when
 * Stripe Tax collected it.
 *
 * Lines come from the engagement's paid basket rows rather than from
 * re-reading Stripe: those rows are what the pay screen displayed and what
 * the session charged.
 */
export async function sendDepositInvoiceEmail(
  engagement: Engagement,
  session: Stripe.Checkout.Session,
): Promise<"sent" | "already_sent" | "skipped"> {
  const claim = await claimInvoiceEmail(session.id, "deposit_paid");
  if (!claim) return "already_sent";

  try {
    const basket = await getDb()
      .select({
        amountCents: engagementProducts.amountCents,
        name: products.name,
      })
      .from(engagementProducts)
      .innerJoin(products, eq(engagementProducts.productId, products.id))
      .where(
        and(
          eq(engagementProducts.engagementId, engagement.id),
          isNotNull(engagementProducts.paidAt),
        ),
      )
      .orderBy(products.sortOrder);

    const lines: InvoiceLine[] =
      basket.length > 0
        ? basket.map((row) => ({ label: row.name, amountCents: row.amountCents }))
        : [
            {
              label: "Website build — deposit",
              amountCents: session.amount_total ?? 0,
            },
          ];

    const taxCents = session.total_details?.amount_tax || null;

    const doc: InvoiceDocument = {
      title: "Invoice",
      reference:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? session.id),
      issuedAt: new Date(),
      billToName: engagement.businessName,
      billToContact: engagement.contactName,
      lines,
      taxCents,
      totalCents:
        session.amount_total ??
        lines.reduce((sum, l) => sum + l.amountCents, 0) + (taxCents ?? 0),
      currency: session.currency ?? engagement.currency,
      paid: true,
      note: "Paid in full — this is your record of the deposit and anything added with it. The questionnaire link in your earlier email picks up right where you left off.",
      gstNumber: agoraGstNumber(),
    };

    await warnIfNoGstNumber(engagement.businessName);

    await deliverInvoice({
      claimId: claim,
      to: engagement.contactEmail,
      subject: `Invoice — ${engagement.businessName} — paid`,
      doc,
      storagePath: `PDFs/${engagement.id}/${invoiceFilename(doc)}`,
    });

    return "sent";
  } catch (error) {
    await releaseInvoiceEmail(claim);
    throw error;
  }
}

/* ── The Stripe Invoice rail ──────────────────────────────────────────── */

function stripeInvoiceLines(invoice: Stripe.Invoice): InvoiceLine[] {
  const lines = invoice.lines?.data ?? [];

  if (lines.length === 0) {
    return [
      {
        label: invoice.description ?? "Website services",
        amountCents: invoice.subtotal,
      },
    ];
  }

  return lines.map((line) => ({
    label: line.description ?? "Website services",
    amountCents: line.amount,
  }));
}

function stripeInvoiceTaxCents(invoice: Stripe.Invoice): number | null {
  // `subtotal` excludes tax; `total` includes it (no discounts in this
  // business). Derived rather than read from the tax arrays because those
  // shapes have moved across recent API versions and this arithmetic hasn't.
  const tax = invoice.total - invoice.subtotal;
  return tax > 0 ? tax : null;
}

/**
 * Our email for a Stripe Invoice — the payable version on `invoice.finalized`
 * (with the hosted payment link), the paid version on `invoice.paid`.
 *
 * These fire for invoices Taylor raises by hand (the balance, rounds of
 * changes). For this to be the ONLY email the client gets: create Stripe
 * invoices without emailing them from the Dashboard, and keep Stripe's
 * customer emails (receipts, finalized invoices) switched off in Settings →
 * Emails. Skips quietly when the invoice carries no customer email.
 */
export async function sendStripeInvoiceEmail(
  invoice: Stripe.Invoice,
  kind: "invoice_due" | "invoice_paid",
): Promise<"sent" | "already_sent" | "skipped"> {
  const to = invoice.customer_email;
  const invoiceId = invoice.id;

  if (!invoiceId) return "skipped";

  if (!to) {
    await notifyOps("Invoice has no customer email", [
      `Stripe invoice ${invoice.number ?? invoiceId} ${kind === "invoice_due" ? "finalized" : "paid"},`,
      `but the customer has no email address, so no client invoice email`,
      `was sent. Add an email to the customer in the Dashboard if one is owed.`,
    ]);
    return "skipped";
  }

  const claim = await claimInvoiceEmail(invoiceId, kind);
  if (!claim) return "already_sent";

  try {
    const paid = kind === "invoice_paid";
    const billToName = invoice.customer_name ?? to;

    const doc: InvoiceDocument = {
      title: "Invoice",
      reference: invoice.number ?? invoiceId,
      issuedAt: new Date(),
      billToName,
      lines: stripeInvoiceLines(invoice),
      taxCents: stripeInvoiceTaxCents(invoice),
      totalCents: paid ? invoice.amount_paid : invoice.amount_due,
      currency: invoice.currency,
      paid,
      payUrl: invoice.hosted_invoice_url,
      note: paid
        ? "Paid in full — thank you. This is your record; nothing else to do."
        : "When you're ready, the button above takes you to a secure Stripe page.",
      gstNumber: agoraGstNumber(),
    };

    await warnIfNoGstNumber(billToName);

    await deliverInvoice({
      claimId: claim,
      to,
      subject: paid
        ? `Invoice ${doc.reference} — paid`
        : `Invoice ${doc.reference} from Agora — ${formatMoney(invoice.amount_due, invoice.currency)}`,
      doc,
      storagePath: `PDFs/stripe/${invoiceId}/${invoiceFilename(doc)}`,
    });

    return "sent";
  } catch (error) {
    await releaseInvoiceEmail(claim);
    throw error;
  }
}
