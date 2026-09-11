import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { engagementProducts } from "./engagement-products";
import { engagements } from "./engagements";

/** Used by one table, so they live beside it (drizzle conventions §3). */
export const orderSourceEnum = pgEnum("order_source", ["checkout", "invoice"]);

export const orderStatusEnum = pgEnum("order_status", [
  "open",
  "paid",
  "failed",
  "refunded",
  "void",
]);

/**
 * How an order came to be attached to its engagement — or null while it is
 * not. `metadata` is the site's own Checkout carrying `engagement_id`;
 * `email` is a dashboard invoice matched on the customer's address; `manual`
 * is Taylor pressing Link in the admin (M-FIN-3).
 */
export const orderLinkReasonEnum = pgEnum("order_link_reason", [
  "metadata",
  "email",
  "manual",
]);

/**
 * The ledger: one row per Stripe payment, connected to the engagement it paid
 * for (M-FIN-1).
 *
 * Before this table an order was re-derived per page from three tables and a
 * Stripe call, and only for Checkout the site itself created — a dashboard
 * invoice left no link to anyone. The 2026-09-11 incident had no surface that
 * could show "a payment settled and its invoice did not send."
 *
 * **One writer.** `recordOrder` in `server/services/orders.ts` is the only
 * function that inserts or updates here: the webhook calls it while settling,
 * the backfill calls it over history, and the admin's import calls it with a
 * pasted id. It upserts on `stripe_object_id` and fills nulls rather than
 * overwriting, so a replay, a backfill, and an import can all run over the
 * same payment in any order and leave one correct row.
 *
 * `stripe_customer_email` is the one personal field. It is kept so an
 * unlinked invoice can be linked later without a Stripe round trip, shown on
 * that order's admin detail only, and never logged.
 */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull(),
    // Null until linked. `set null` rather than cascade: a deleted engagement
    // must not take a payment record with it.
    engagementId: uuid("engagement_id").references(() => engagements.id, {
      onDelete: "set null",
    }),
    importedAt: timestamp("imported_at", { withTimezone: true }),
    importedBy: text("imported_by"),
    linkReason: orderLinkReasonEnum("link_reason"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    source: orderSourceEnum("source").notNull(),
    status: orderStatusEnum("status").notNull(),
    stripeCustomerEmail: text("stripe_customer_email"),
    stripeObjectId: text("stripe_object_id").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    taxCents: integer("tax_cents"),
  },
  (table) => [
    uniqueIndex("orders_stripe_object_id_idx").on(table.stripeObjectId),
    index("orders_engagement_id_idx").on(table.engagementId),
    index("orders_paid_at_idx").on(table.paidAt.desc()),
  ],
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  engagement: one(engagements, {
    fields: [orders.engagementId],
    references: [engagements.id],
  }),
  lines: many(engagementProducts),
}));
