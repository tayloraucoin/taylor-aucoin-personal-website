import { and, asc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagementProducts, products, type ProductRow } from "@/db/schema";
import type { IntakeTrackKey } from "@/lib/types/intake";

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
  "id" | "key" | "name" | "description" | "priceCents" | "track"
> & { stripePriceId: string };

function toSellable(row: ProductRow): SellableProduct | null {
  if (!row.stripePriceId) return null;

  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    track: row.track,
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
export async function listCheckoutAddons(
  track: IntakeTrackKey = "durable",
): Promise<SellableProduct[]> {
  const rows = await getDb()
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        eq(products.offeredAtCheckout, true),
        eq(products.kind, "addon"),
        // One track's pay screen must never offer the other's rows: the
        // prices differ, the copy differs, and the deliverable differs.
        eq(products.track, track),
      ),
    )
    .orderBy(asc(products.sortOrder));

  const sellable: SellableProduct[] = [];
  for (const row of rows) {
    const item = toSellable(row);
    if (item) sellable.push(item);
    else
      console.warn(
        `[products] ${row.key} offered at checkout but has no Stripe price — hidden`,
      );
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

/**
 * Which plan a client picked on the pay screen.
 *
 * `half` is the deposit with a balance to follow; `full` is the whole build up
 * front. The durable track offers only `half` — it has no pay-in-full row —
 * so this is a showcase-shaped question with a durable-safe default.
 */
export type BuildPlan = "half" | "full";

/**
 * The build line a pay screen charges: one row, resolved server-side.
 *
 * The browser names a plan, never a product key and never an amount. This is
 * the function that turns the one into the other, so a fabricated request can
 * at worst pick the other legitimate plan on its own track.
 *
 * `overrideKey` is a promo code's negotiated substitution, already resolved
 * from the one server-side code map (`lib/intake/promo.ts`). It is looked up
 * exactly like any other row, so a code can only ever charge something the
 * catalogue actually sells.
 */
export async function getBuildProduct(
  track: IntakeTrackKey,
  plan: BuildPlan = "half",
  overrideKey?: string,
): Promise<SellableProduct> {
  const key =
    overrideKey ??
    (track === "showcase"
      ? plan === "full"
        ? "showcase_full"
        : "showcase_deposit"
      : "deposit");

  const item = await findSellableProductByKey(key);

  if (!item) {
    throw new Error(
      `No sellable build product "${key}". Run \`yarn stripe:catalogue --apply\` ` +
        "and `yarn db:seed` against this tier's database.",
    );
  }

  return item;
}

/**
 * The durable track's deposit. Kept as its own name because the durable pay
 * screen and the invoicing rail both read like this, and renaming their call
 * sites buys nothing.
 */
export async function getDepositProduct(): Promise<SellableProduct> {
  return getBuildProduct("durable");
}

/**
 * Catalogue key → the questionnaire's extras vocabulary. Two vocabularies
 * exist because the questionnaire predates the catalogue; this map is the one
 * seam where they meet, so neither side has to rename its stored values.
 *
 * The coded half was missing entirely until 2026-09-03, which meant every
 * coded add-on — up to $2,250 of work across six rows — was sold on the pay
 * screen and then never asked a single question about. `showcase_animations`
 * advertises "you'll describe what you want in the intake form" in its own
 * catalogue description, and the intake did not ask.
 *
 * Extra pages are deliberately absent: they are a *count*, and the
 * questionnaire reads that count through `paidExtraPages` rather than through
 * a present-or-absent flag that could not say how many.
 */
const PRODUCT_KEY_TO_EXTRA: Record<string, string> = {
  // The durable track.
  booking_setup: "booking",
  stripe_setup: "stripe",
  gbp_clean: "gbp",
  logo_refresh: "logo",

  // The coded track. `booking` and `logo` are the same words on purpose: the
  // question each opens differs by track because the components differ, but
  // the thing bought is the same thing, and two spellings of one concept is
  // how a reveal ends up keyed to a string nothing ever sets.
  showcase_booking: "booking",
  showcase_logo: "logo",
  showcase_admin_panel: "adminPanel",
  showcase_animations: "animations",
  showcase_supabase_setup: "supabase",
  showcase_seo_blog: "seoBlog",
};

/**
 * Every extras key the questionnaire can branch on, deduped.
 *
 * Derived from the map above rather than typed out a second time, so an add-on
 * cannot be added to the catalogue without the admin review surface being able
 * to show the questions it opens. That surface has no engagement and therefore
 * buys nothing, so it hands this list down instead — the one place a reveal's
 * `extra` condition is satisfied by something other than a settled basket.
 *
 * Both tracks in one list on purpose. The review surface wants every block
 * open, and `booking` and `logo` are deliberately the same word on both tracks
 * (see the map), so splitting by track would buy nothing and could drift.
 */
export const ALL_EXTRAS: readonly string[] = [
  ...new Set(Object.values(PRODUCT_KEY_TO_EXTRA)),
];

/**
 * How many extra pages this engagement has paid for.
 *
 * Zero for almost everyone, and zero is the honest answer for an unpaid row
 * too: a basket that was built and abandoned is not a purchase, and step 8's
 * page allowance is a thing the client bought, not a thing they nearly bought.
 *
 * Read as a count rather than a boolean because that is what the questionnaire
 * needs — five included plus what they bought is the number of pages the
 * checklist may reach before it starts saying "that's over".
 */
export async function paidExtraPages(
  engagementId: string,
  track: IntakeTrackKey,
): Promise<number> {
  const key = track === "showcase" ? "showcase_extra_page" : "extra_page";

  const rows = await getDb()
    .select({ quantity: engagementProducts.quantity })
    .from(engagementProducts)
    .innerJoin(products, eq(engagementProducts.productId, products.id))
    .where(
      and(
        eq(engagementProducts.engagementId, engagementId),
        eq(products.key, key),
        isNotNull(engagementProducts.paidAt),
      ),
    );

  return rows.reduce((total, row) => total + (row.quantity ?? 0), 0);
}

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
