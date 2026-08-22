import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * One CSV import, and what it did.
 *
 * Written inside the same transaction as the upsert it describes, so the log
 * cannot claim an import that rolled back. Sync is all-or-nothing by decision
 * (D-CRM-11) — a half-applied import is the one outcome that would leave
 * Taylor unable to tell which rows are current.
 *
 * No foreign key: this is a record of an event, not of any particular lead.
 */
export const leadSyncs = pgTable("lead_syncs", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  fileName: text("file_name").notNull(),
  newCount: integer("new_count").notNull(),
  unchangedCount: integer("unchanged_count").notNull(),
  updatedCount: integer("updated_count").notNull(),
});
