import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { engagements } from "./engagements";
import { orders } from "./orders";
import { products } from "./products";

/**
 * What one engagement bought, one row per product.
 *
 * Rows are written when a Checkout session is created — the deposit itself
 * and any add-ons the client ticked — with `amount_cents` copied from the
 * live Stripe Price at that moment, so the record holds the deal as struck
 * even after the catalogue moves on. `paid_at` is stamped by the webhook
 * settlement path, never by the browser's return.
 *
 * A client who backs out and re-selects gets their unpaid rows replaced;
 * paid rows are history and are never rewritten. The once-only index makes
 * "bought the same add-on twice" a database impossibility rather than a
 * refund conversation — for every row that is not `repeatable` (FIN-8,
 * M-FIN-6). A repeatable row (extra pages, a written post, a round of
 * changes) may be bought again, one purchase per row; the pending index
 * still allows only one unpaid row per product, so replacement stays the
 * rule for an abandoned attempt.
 *
 * `checkout_session_id` names the Checkout session that created the row, so
 * settlement stamps, the ledger links, and the invoice lists exactly that
 * session's rows. Null on rows written before FIN-8.
 */
export const engagementProducts = pgTable(
  "engagement_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    amountCents: integer("amount_cents").notNull(),
    checkoutSessionId: text("checkout_session_id"),
    engagementId: uuid("engagement_id")
      .notNull()
      .references(() => engagements.id, { onDelete: "cascade" }),
    // Which order bought this row (M-FIN-1). Null on rows created before the
    // ledger existed and on unpaid rows; `recordOrder` fills it by matching
    // the payment's line items to the catalogue's Stripe price ids.
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull().default(1),
    /** Copied from `products.repeatable` at insert; read by the indexes below. */
    repeatable: boolean("repeatable").notNull().default(false),
  },
  (table) => [
    uniqueIndex("engagement_products_once_idx")
      .on(table.engagementId, table.productId)
      .where(sql`not repeatable`),
    uniqueIndex("engagement_products_pending_idx")
      .on(table.engagementId, table.productId)
      .where(sql`paid_at is null`),
    index("engagement_products_order_id_idx").on(table.orderId),
    index("engagement_products_checkout_session_id_idx").on(
      table.checkoutSessionId,
    ),
  ],
);

export const engagementProductsRelations = relations(
  engagementProducts,
  ({ one }) => ({
    engagement: one(engagements, {
      fields: [engagementProducts.engagementId],
      references: [engagements.id],
    }),
    order: one(orders, {
      fields: [engagementProducts.orderId],
      references: [orders.id],
    }),
    product: one(products, {
      fields: [engagementProducts.productId],
      references: [products.id],
    }),
  }),
);
