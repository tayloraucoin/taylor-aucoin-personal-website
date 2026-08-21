import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Every Stripe event this application has already acted on.
 *
 * Stripe delivers at-least-once and replays on any non-2xx, so a handler with
 * a side effect — sending an email, recording a payment — needs a way to know
 * it has seen an event before. The deposit's own fulfillment is idempotent by
 * query shape, but "notify Taylor" is not: without this, one retry is two
 * emails about the same money.
 *
 * The Stripe event id is the primary key, so claiming an event is a single
 * insert that either succeeds or conflicts. There is no read-then-write gap
 * for a concurrent redelivery to slip through.
 */
export const stripeEvents = pgTable("stripe_events", {
  /** Stripe's own `evt_…` id. */
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  type: text("type").notNull(),
});
