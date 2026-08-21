import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/** Used by one table, so it lives beside it (drizzle conventions §3). */
export const invoiceEmailKindEnum = pgEnum("invoice_email_kind", [
  "deposit_paid",
  "invoice_due",
  "invoice_paid",
]);

/**
 * The ledger that makes "one invoice email per payment event" a property of
 * the database, in the same claim-before-send shape as `email_events`.
 *
 * Keyed by the Stripe object id rather than the engagement, because the
 * invoice rail exists for Stripe Invoices Taylor raises by hand — a balance,
 * a round of changes — which may carry no engagement metadata at all. One
 * session settles once; one invoice finalizes once and is paid once; the
 * unique index holds that even under webhook replays that slip past the
 * event-id claim (a re-sent event has a new event id, but the same object).
 */
export const invoiceEmails = pgTable(
  "invoice_emails",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    kind: invoiceEmailKindEnum("kind").notNull(),
    // Where the PDF was archived in the PRIVATE bucket. Null when the upload
    // failed — the email still went (the client's copy is the attachment),
    // and a null here is the signal that our archive copy is missing.
    pdfStoragePath: text("pdf_storage_path"),
    stripeObjectId: text("stripe_object_id").notNull(),
  },
  (table) => [
    uniqueIndex("invoice_emails_once_idx").on(table.stripeObjectId, table.kind),
  ],
);
