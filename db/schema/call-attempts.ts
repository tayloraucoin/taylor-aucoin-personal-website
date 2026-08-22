import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
// Relative, not the `@/` alias: drizzle-kit bundles this file outside Next's
// resolver and does not read tsconfig paths.
import type { InterestTags } from "../../lib/types/crm";
import { leads } from "./leads";

/** Used by one table, so it lives beside it (drizzle conventions §3). */
export const callDispositionEnum = pgEnum("call_disposition", [
  "no_answer",
  "voicemail",
  "busy_callback",
  "conversation",
  "wrong_number",
  "not_interested",
  "do_not_call",
]);

/**
 * One dial, and what came of it.
 *
 * Append-only in practice: an attempt is a historical fact, so a mistake gets
 * a corrected new row rather than an edit. That is what lets the scoreboard
 * count dials honestly and what makes the call-window model falsifiable —
 * `createdAt` is the timestamp the timing check reads (D-CRM-21), which is why
 * the feature needed no column of its own.
 *
 * Cascade on delete: attempts have no meaning apart from their lead.
 */
export const callAttempts = pgTable(
  "call_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    disposition: callDispositionEnum("disposition").notNull(),
    // JSON shape: InterestTags — lib/types/crm.ts. Only ever populated on a
    // `conversation` disposition; empty everywhere else.
    interestTags: jsonb("interest_tags")
      .$type<InterestTags>()
      .notNull()
      .default([]),
    /**
     * A texted link is an asset sent, same as an email — recorded on the
     * attempt because the send belongs to the touch, not the lead
     * (M-CRM-8). `getLeadStage` reads it alongside `lead_emails`.
     */
    linkTexted: boolean("link_texted").notNull().default(false),
    note: text("note"),
    /**
     * Pasted in after the call, often well after — Taylor records on speaker
     * phone and transcribes separately, then attaches it here once it's
     * ready. Never captured by `logAttempt`'s transaction: this can arrive
     * minutes to hours later, for a call that's already been logged and
     * moved past. One column, not a table of its own — a transcript has no
     * lifecycle beyond "this attempt has one or it doesn't."
     */
    transcript: text("transcript"),

    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
  },
  (table) => [index("call_attempts_lead_id_idx").on(table.leadId)],
);

export const callAttemptsRelations = relations(callAttempts, ({ one }) => ({
  lead: one(leads, {
    fields: [callAttempts.leadId],
    references: [leads.id],
  }),
}));
