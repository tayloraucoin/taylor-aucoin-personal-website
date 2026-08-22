import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { leads } from "./leads";

/**
 * What was actually sent to a prospect, as sent.
 *
 * The body is stored after Taylor's edits rather than as a template reference,
 * because the record's job is to answer "what did this person receive" — a
 * template id answers a different question and drifts the moment the template
 * changes.
 *
 * This is also the consent evidence trail. The CASL guard on the intro email
 * is soft by decision (M-CRM-3): the enforcement is that every send is
 * recorded with its timestamp, not that the button is disabled.
 *
 * Deliberately separate from `email_events`, which is the intake system's
 * send-once ledger: different lifecycle, different foreign key, and no
 * idempotency ceiling here — a second intro to the same lead is legitimate and
 * merely asks for a confirmation first (D-CRM-9).
 *
 * `resendId` is null when the send failed. The row is written before the send,
 * so a failure leaves evidence rather than vanishing.
 */
export const leadEmails = pgTable(
  "lead_emails",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    body: text("body").notNull(),
    kind: text("kind").notNull().default("intro"),
    promoIncluded: boolean("promo_included").notNull().default(false),
    resendId: text("resend_id"),
    subject: text("subject").notNull(),
    toEmail: text("to_email").notNull(),

    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
  },
  (table) => [index("lead_emails_lead_id_idx").on(table.leadId)],
);

export const leadEmailsRelations = relations(leadEmails, ({ one }) => ({
  lead: one(leads, {
    fields: [leadEmails.leadId],
    references: [leads.id],
  }),
}));
