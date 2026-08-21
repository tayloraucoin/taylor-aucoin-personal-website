import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { engagementProducts } from "./engagement-products";

/** Used by one table, so it lives beside it (drizzle conventions §3). */
export const productKindEnum = pgEnum("product_kind", [
  "build",
  "addon",
  "round",
  "care_plan",
]);

/**
 * The commercial catalogue, one row per thing a client can buy.
 *
 * Three sources have to agree about a price — this table (what surfaces
 * display), Stripe (what is charged), and the published page (what was
 * promised). `yarn db:seed` writes identity, copy, amounts, and the
 * tier-aware Stripe product/price ids (production vs sandbox, same rule as
 * `next.config.ts`). When a price changes, `yarn stripe:catalogue --apply`
 * mints the new Price in Stripe; paste the printed id into the seed's map and
 * re-seed that tier's database. Mirrors CC's `subscription_plans` shape:
 * `price_cents` for display, `stripe_price_id` for charging.
 *
 * `price_cents` is display and analytics; the charge always goes through
 * `stripe_price_id`, and what a client actually paid is recorded per purchase
 * on `engagement_products` — prices change, purchases don't.
 *
 * `offered_at_checkout` gates what P0 sells. Deliberately narrower than
 * `is_active`: extra pages are active products but quantity-shaped, and a
 * per-page count is questionnaire material, not a pay-screen checkbox.
 */
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    description: text("description").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    key: text("key").notNull(),
    kind: productKindEnum("kind").notNull(),
    name: text("name").notNull(),
    offeredAtCheckout: boolean("offered_at_checkout").notNull().default(false),
    priceCents: integer("price_cents").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    stripePriceId: text("stripe_price_id"),
    stripeProductId: text("stripe_product_id"),
  },
  (table) => [uniqueIndex("products_key_idx").on(table.key)],
);

export const productsRelations = relations(products, ({ many }) => ({
  engagementProducts: many(engagementProducts),
}));
