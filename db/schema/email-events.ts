import { relations, sql } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { engagements } from "./engagements";

/** Used by one table, so it lives beside it (drizzle conventions §3). */
export const emailEventKindEnum = pgEnum("email_event_kind", [
  "resume_link",
  "reminder_1",
  "reminder_2",
  "reminder_3",
  "completion",
  "output",
]);

/**
 * The ledger that makes "three reminders, maximum, ever" a property of the
 * database rather than a promise in application code.
 *
 * A row is inserted *before* the send and deleted if the send fails, so a
 * crash mid-sweep under-sends rather than double-sends (INT-8).
 *
 * The unique index is partial on purpose. `reminder_*` and `completion` must
 * happen at most once per engagement; `resume_link` and `output` legitimately
 * repeat — a client switching phones asks for their link again, and Taylor
 * re-sends the intake document whenever its signed links expire.
 */
export const emailEvents = pgTable(
  "email_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    kind: emailEventKindEnum("kind").notNull(),

    engagementId: uuid("engagement_id")
      .notNull()
      .references(() => engagements.id, { onDelete: "cascade" }),
  },
  (table) => [
    // Unqualified `kind` on purpose: an index predicate is evaluated against
    // the indexed table, and the bare name is the form Postgres documents.
    uniqueIndex("email_events_send_once_idx")
      .on(table.engagementId, table.kind)
      .where(
        sql`kind in ('reminder_1', 'reminder_2', 'reminder_3', 'completion')`,
      ),
  ],
);

export const emailEventsRelations = relations(emailEvents, ({ one }) => ({
  engagement: one(engagements, {
    fields: [emailEvents.engagementId],
    references: [engagements.id],
  }),
}));
