import Stripe from "stripe";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagementProducts, engagements, products } from "@/db/schema";
import { adminTestPaymentEnabled, requireEnv, stripeTaxEnabled } from "@/lib/env";
import { TERMS_VERSION } from "@/lib/legal/version";
import { intakeRoutes } from "@/lib/routes";
import { resolvePromoCode } from "@/lib/intake/promo";
import type { Engagement } from "./engagement";
import {
  findSellableProductByKey,
  getDepositProduct,
  listCheckoutAddons,
  type SellableProduct,
} from "./products";

/**
 * Pinned to the API version this SDK was generated against. Left unset, an SDK
 * bump would silently change request and webhook shapes underneath a money
 * path — the one place in this codebase where "probably still works" is not a
 * standard worth holding.
 */
const STRIPE_API_VERSION = "2026-07-29.dahlia";

/**
 * Appended to the account's shortened descriptor on the client's statement.
 *
 * The line a client sees has to match the site they paid on, or it reads as a
 * charge they do not recognise — which is a chargeback rather than a question.
 */
const DEPOSIT_DESCRIPTOR_SUFFIX = "DEPOSIT";

/**
 * Lazy, for the same reason the database client is: a module-level client
 * would read the secret key at import time and break every build and script
 * that merely touches this file's types.
 */
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  stripe ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: STRIPE_API_VERSION,
  });
  return stripe;
}

export function getWebhookSecret(): string {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

export function constructWebhookEvent(
  rawBody: string,
  signature: string,
): Stripe.Event {
  return getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    getWebhookSecret(),
  );
}

function intakeOrigin(): string {
  return requireEnv("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
}

/**
 * What P0 renders: the deposit plus the optional add-ons, from the catalogue.
 *
 * Amounts come from the `products` rows, which `yarn stripe:catalogue --apply`
 * writes in the same motion as the Stripe objects. The screen-vs-charge
 * guarantee has moved to the money moment: `createDepositCheckout` verifies
 * every selected Price against Stripe before creating the session and fails
 * closed on any drift, so a manually edited Dashboard price can never charge
 * a number this screen did not display.
 */
export async function getCheckoutCatalogue(useAdminTestPrice = false): Promise<{
  deposit: SellableProduct;
  addons: SellableProduct[];
}> {
  const useTestPrice = useAdminTestPrice && adminTestPaymentEnabled();

  if (useTestPrice) {
    const testProduct = await findSellableProductByKey("admin_test_payment");
    if (testProduct) {
      return { deposit: testProduct, addons: [] };
    }

    console.warn(
      "[deposit] admin test payment requested but admin_test_payment is not sellable — falling back to real deposit",
    );
  }

  const [deposit, addons] = await Promise.all([
    getDepositProduct(),
    listCheckoutAddons(),
  ]);

  return { deposit, addons };
}

/**
 * Verifies that what we are about to charge is what the catalogue displays.
 *
 * Throwing here fails closed: the client sees the pay button's quiet retry
 * line and nothing is charged. The alternative — charging Stripe's number
 * while the screen showed ours — is the one failure this flow must never
 * have, so a drifted price is an outage, not a rounding difference.
 */
async function assertPricesMatchStripe(items: SellableProduct[]): Promise<void> {
  await Promise.all(
    items.map(async (item) => {
      const price = await getStripe().prices.retrieve(item.stripePriceId);

      if (!price.active || price.unit_amount !== item.priceCents) {
        throw new Error(
          `Catalogue drift on ${item.key}: db has ${item.priceCents}, Stripe has ` +
            `${price.unit_amount} (active=${price.active}). Re-run \`yarn stripe:catalogue --apply\`.`,
        );
      }
    }),
  );
}

/**
 * Opens a hosted Stripe Checkout session for the deposit plus any selected
 * add-ons.
 *
 * Hosted, not embedded: this app designs no card UI, holds no card data, and
 * gets Apple Pay and Google Pay for free — which matter enormously to someone
 * paying from a phone in a van.
 *
 * A fresh session per attempt. A client who backs out and returns later gets a
 * new one rather than a resumed session that may have expired; Stripe cleans
 * up the strays, and reusing them buys nothing but a class of stale-state bugs.
 *
 * Selections are recorded on `engagement_products` at creation — unpaid rows
 * replaced wholesale, so the table always holds the latest attempt's basket —
 * and stamped paid by the webhook settlement path. Unknown or retired keys
 * are dropped with a warning rather than failing the attempt: the charge can
 * only ever be a subset of what was displayed, never a superset.
 *
 * The returned URL is a redirect target and nothing else — no part of the
 * payment decision happens here. Fulfillment is `fulfillDeposit`, reached only
 * by a signature-verified webhook.
 */
export async function createDepositCheckout(
  engagement: Engagement,
  token: string,
  addonKeys: readonly string[] = [],
  promoCode?: string,
  adminTestPayment = false,
): Promise<string> {
  if (!engagement.depositRequired || engagement.paidAt) {
    throw new Error("Engagement does not require a deposit.");
  }

  const useTestPrice = adminTestPayment && adminTestPaymentEnabled();
  const { deposit, addons } = await getCheckoutCatalogue(useTestPrice);

  let selected: SellableProduct[] = [];
  let granted: SellableProduct | null = null;

  if (!useTestPrice) {
    const known = new Set(addons.map((a) => a.key));
    const unknown = addonKeys.filter((key) => !known.has(key));
    if (unknown.length > 0) {
      console.warn(`[deposit] dropping unknown add-on keys: ${unknown.join(", ")}`);
    }

    selected = addons.filter((a) => addonKeys.includes(a.key));

    // The promo grant, resolved server-side from the one code map — the
    // browser proposes a string, never an item or an amount. An invalid or
    // no-longer-sellable grant is dropped silently: the charge can only ever
    // be a subset of what was displayed, and a $0 line is the one line whose
    // absence costs the client nothing.
    const grant = promoCode ? resolvePromoCode(promoCode) : null;
    granted = grant ? await findSellableProductByKey(grant.grantsProductKey) : null;
    if (promoCode && !granted) {
      console.warn(`[deposit] promo code resolved to nothing sellable`);
    }
  }

  const items = [deposit, ...selected, ...(granted ? [granted] : [])];

  await assertPricesMatchStripe(items);

  const origin = intakeOrigin();

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: engagement.contactEmail,
    // The engagement id is the only link back from Stripe to us. The token is
    // deliberately absent: it is the client's credential and has no business
    // living in a third party's dashboard.
    //
    // terms_version names the version of /websites/terms the pay screen
    // carried when this session was created — paying is agreeing (terms §2).
    // addon_keys is a human-readable audit echo; the settlement path reads
    // the engagement_products rows, not this string.
    metadata: {
      engagement_id: engagement.id,
      terms_version: TERMS_VERSION,
      addon_keys: selected.map((a) => a.key).join(","),
      ...(granted ? { promo_grant: granted.key } : {}),
      ...(useTestPrice ? { admin_test_payment: "1" } : {}),
    },
    line_items: items.map((item) => ({ price: item.stripePriceId, quantity: 1 })),
    // GST via Stripe Tax, gated by env: enabling automatic_tax without an
    // active registration silently collects zero tax (docs/AGORA-STRIPE.md),
    // so the flag is flipped deliberately, never defaulted.
    ...(stripeTaxEnabled() ? { automatic_tax: { enabled: true } } : {}),
    payment_intent_data: {
      statement_descriptor_suffix: DEPOSIT_DESCRIPTOR_SUFFIX,
    },
    success_url: `${origin}${intakeRoutes.entry(token)}?paid=1`,
    cancel_url: `${origin}${intakeRoutes.entry(token)}?canceled=1`,
  });

  if (!session.url) throw new Error("Stripe returned a session with no URL.");

  const db = getDb();

  // The basket, recorded at the deal's own prices. Wholesale replacement of
  // unpaid rows keeps re-attempts boring; paid rows are history and are never
  // touched here.
  await db
    .delete(engagementProducts)
    .where(
      and(
        eq(engagementProducts.engagementId, engagement.id),
        isNull(engagementProducts.paidAt),
      ),
    );
  await db.insert(engagementProducts).values(
    items.map((item) => ({
      amountCents: item.priceCents,
      engagementId: engagement.id,
      productId: item.id,
    })),
  );

  await db
    .update(engagements)
    .set({ stripeCheckoutSessionId: session.id, updatedAt: new Date() })
    .where(eq(engagements.id, engagement.id));

  return session.url;
}

/**
 * Marks a deposit paid. The only function that may do so.
 *
 * Idempotent by query shape, not by a prior read: the `paid_at is null`
 * predicate lives in the UPDATE itself, so two concurrent deliveries of the
 * same event cannot both win. Stripe retries on any non-2xx and replays are
 * routine — this has to be boring under repetition.
 *
 * This is the one sanctioned reader of `engagements` that does not go through
 * `requireEngagement`, because a webhook has no token; it carries an
 * engagement id in metadata and a verified signature instead. Nothing else may
 * copy this exception.
 */
export async function fulfillDeposit(
  engagementId: string,
  paymentIntentId: string | null,
  amountPaidCents?: number | null,
  termsVersion?: string | null,
): Promise<"fulfilled" | "already_paid" | "unknown"> {
  const now = new Date();
  const db = getDb();

  // The deposit line from this attempt's basket. With add-ons in the session,
  // `amount_total` is deposit + add-ons (+ tax when enabled), so it is no
  // longer the deposit; the basket row holds the number the deal was struck
  // at. The session total remains the fallback for engagements whose session
  // predates the basket.
  const [depositLine] = await db
    .select({ amountCents: engagementProducts.amountCents })
    .from(engagementProducts)
    .innerJoin(products, eq(engagementProducts.productId, products.id))
    .where(
      and(
        eq(engagementProducts.engagementId, engagementId),
        eq(products.key, "deposit"),
        isNull(engagementProducts.paidAt),
      ),
    )
    .limit(1);

  const depositCents = depositLine?.amountCents ?? amountPaidCents;

  const [updated] = await db
    .update(engagements)
    .set({
      paidAt: now,
      stripePaymentIntentId: paymentIntentId,
      // What this client actually paid, captured from the settled basket.
      // Prices change; the intake document should show the deal as struck
      // rather than today's list price.
      ...(typeof depositCents === "number"
        ? { depositAmountCents: depositCents }
        : {}),
      // Paying the deposit is accepting the terms (terms §2). The version
      // comes from the session's metadata — what the pay screen displayed —
      // with the current constant as fallback for sessions created before
      // the metadata existed. Same guarded UPDATE as paidAt, so the record
      // is written exactly once and never rewritten by a replay.
      termsAcceptedAt: now,
      termsVersion: termsVersion ?? TERMS_VERSION,
      updatedAt: now,
    })
    .where(and(eq(engagements.id, engagementId), isNull(engagements.paidAt)))
    .returning({ id: engagements.id });

  if (updated) {
    // The basket becomes history. Only the winner of the guarded UPDATE
    // stamps it, so a replay cannot touch the rows a second time.
    await db
      .update(engagementProducts)
      .set({ paidAt: now })
      .where(
        and(
          eq(engagementProducts.engagementId, engagementId),
          isNull(engagementProducts.paidAt),
        ),
      );

    return "fulfilled";
  }

  const [existing] = await db
    .select({ id: engagements.id })
    .from(engagements)
    .where(eq(engagements.id, engagementId))
    .limit(1);

  return existing ? "already_paid" : "unknown";
}
