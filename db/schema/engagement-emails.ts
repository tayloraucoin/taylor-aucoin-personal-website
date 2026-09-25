import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
// Relative, not the `@/` alias: drizzle-kit bundles this file outside Next's
// resolver and does not read tsconfig paths.
import { engagements } from "./engagements";
import { pipelineSteps } from "./pipeline-steps";

/**
 * What a client was sent from a pipeline step, as sent (M-PIPE-3).
 *
 * The subject and body are stored after Taylor's edits and with every
 * variable filled, not as a template reference: the record answers "what did
 * this client receive", and a template id stops answering that the moment the
 * template is edited. The same reasoning as `lead_emails` (M-CRM-3).
 *
 * The row is written before the send. `resendId` is null when the send failed,
 * so a failure leaves evidence rather than vanishing.
 *
 * Deliberately separate from `email_events`, the intake's send-once ledger,
 * which records that a kind went out but not what it said. There is no
 * send-once constraint here: a second send of a step is legitimate and the
 * surface confirms it first.
 */
export const engagementEmails = pgTable(
  "engagement_emails",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    body: text("body").notNull(),
    resendId: text("resend_id"),
    subject: text("subject").notNull(),
    toEmail: text("to_email").notNull(),

    engagementId: uuid("engagement_id")
      .notNull()
      .references(() => engagements.id, { onDelete: "cascade" }),
    stepId: uuid("step_id")
      .notNull()
      .references(() => pipelineSteps.id, { onDelete: "restrict" }),
  },
  (table) => [
    index("engagement_emails_engagement_id_idx").on(table.engagementId),
  ],
);

export const engagementEmailsRelations = relations(
  engagementEmails,
  ({ one }) => ({
    engagement: one(engagements, {
      fields: [engagementEmails.engagementId],
      references: [engagements.id],
    }),
    step: one(pipelineSteps, {
      fields: [engagementEmails.stepId],
      references: [pipelineSteps.id],
    }),
  }),
);
