import { and, asc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagementProducts, products, type ProductRow } from "@/db/schema";

/**
 * Reads over the commercial catalogue (`products`).
 *
 * Rows are written by `yarn db:seed` (identity, copy, flags, and tier-aware
 * Stripe ids). When a price changes, `yarn stripe:catalogue --apply` mints the
 * new Price in Stripe — paste the printed id into the seed's map and re-seed.
 * Everything here is read-only by design. Purchases are recorded on
 * `engagement_products` by the deposit service, never here.
 */

/** What a purchase surface needs to render and charge one product. */
export type SellableProduct = Pick<
  ProductRow,
  "id" | "key" | "name" | "description" | "priceCents"
> & { stripePriceId: string };

function toSellable(row: ProductRow): SellableProduct | null {
  if (!row.stripePriceId) return null;

  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    stripePriceId: row.stripePriceId,
  };
}

/**
 * The optional add-ons P0 offers, in display order.
 *
 * A row without a Stripe price id is not sellable and is dropped with a
 * warning rather than rendered — a checkbox that cannot be charged is a
 * promise the checkout would break.
 */
export async function listCheckoutAddons(): Promise<SellableProduct[]> {
  const rows = await getDb()
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        eq(products.offeredAtCheckout, true),
        eq(products.kind, "addon"),
      ),
    )
    .orderBy(asc(products.sortOrder));

  const sellable: SellableProduct[] = [];
  for (const row of rows) {
    const item = toSellable(row);
    if (item) sellable.push(item);
    else console.warn(`[products] ${row.key} offered at checkout but has no Stripe price — hidden`);
  }

  return sellable;
}

/**
 * One sellable product by key, or null when it is missing, inactive, or has
 * no Stripe price. Used by the promo rail, which grants specific $0 items.
 */
export async function findSellableProductByKey(
  key: string,
): Promise<SellableProduct | null> {
  const [row] = await getDb()
    .select()
    .from(products)
    .where(and(eq(products.key, key), eq(products.isActive, true)))
    .limit(1);

  return row ? toSellable(row) : null;
}

/** The deposit itself. The one product P0 cannot render without. */
export async function getDepositProduct(): Promise<SellableProduct> {
  const [row] = await getDb()
    .select()
    .from(products)
    .where(eq(products.key, "deposit"))
    .limit(1);

  const item = row ? toSellable(row) : null;

  if (!item) {
    throw new Error(
      "No sellable deposit product. Run `yarn db:seed` against this tier's database.",
    );
  }

  return item;
}

/**
 * Catalogue key → the step-9 extras vocabulary. Two vocabularies exist
 * because the questionnaire predates the catalogue; this map is the one seam
 * where they meet, so neither side has to rename its stored values.
 */
const PRODUCT_KEY_TO_EXTRA: Record<string, string> = {
  booking_setup: "booking",
  stripe_setup: "stripe",
  gbp_clean: "gbp",
  logo_refresh: "logo",
};

/**
 * The step-9 extras this engagement already bought on the pay screen — so the
 * questionnaire never re-sells what checkout sold (D-INT-8).
 */
export async function listPurchasedExtras(
  engagementId: string,
): Promise<string[]> {
  const rows = await getDb()
    .select({ key: products.key })
    .from(engagementProducts)
    .innerJoin(products, eq(engagementProducts.productId, products.id))
    .where(
      and(
        eq(engagementProducts.engagementId, engagementId),
        isNotNull(engagementProducts.paidAt),
      ),
    );

  return rows
    .map((row) => PRODUCT_KEY_TO_EXTRA[row.key])
    .filter((value): value is string => Boolean(value));
}
