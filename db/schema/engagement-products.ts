import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { engagements } from "./engagements";
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
 * paid rows are history and are never rewritten. The unique index makes
 * "bought the same add-on twice" a database impossibility rather than a
 * refund conversation.
 */
export const engagementProducts = pgTable(
  "engagement_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    amountCents: integer("amount_cents").notNull(),
    engagementId: uuid("engagement_id")
      .notNull()
      .references(() => engagements.id, { onDelete: "cascade" }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [
    uniqueIndex("engagement_products_once_idx").on(
      table.engagementId,
      table.productId,
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
    product: one(products, {
      fields: [engagementProducts.productId],
      references: [products.id],
    }),
  }),
);
