import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Addresses left on home's notes signup (D-SITE-223). Nothing is sent on
 * signup; the first send to the list is a later ticket and starts with a
 * confirmation. `email` is stored lower-cased and unique, so a repeat submit
 * is one `ON CONFLICT DO NOTHING` insert and an unsubscribed row stays so.
 */
export const noteSignups = pgTable(
  "note_signups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    /** The consent wording the address was given under (`content/home.ts`). */
    consentVersion: text("consent_version").notNull(),
    /** Where it was left: `home` for now. */
    source: text("source").notNull(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("note_signups_email_idx").on(table.email)],
);
