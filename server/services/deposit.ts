import { and, eq, isNotNull, isNull } from "drizzle-orm";
import Stripe from "stripe";
import { getDb } from "@/db/client";
import { engagementProducts, engagements, products } from "@/db/schema";
import {
  adminTestPaymentEnabled,
  requireEnv,
  stripeTaxEnabled,
} from "@/lib/env";
import { withoutBundled } from "@/lib/intake/addon-bundles";
import { resolvePromoCode } from "@/lib/intake/promo";
import { TERMS_VERSION } from "@/lib/legal/version";
import { intakeRoutes, showcaseIntakeRoutes } from "@/lib/routes";
import type { IntakeTrackKey } from "@/lib/types/intake";
import { EXTRA_PAGES_MAX, SEO_POSTS_MAX } from "@/lib/validators/intake";
import type { Engagement } from "./engagement";
import {
  findSellableProductByKey,
  getBuildProduct,
  listCheckoutAddons,
  type BuildPlan,
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
 * The catalogue key that sells one page beyond the included five.
 *
 * Two rows, one per track, at different prices — so it is resolved from the
 * engagement rather than named at each call site.
 */
function extraPageKeyFor(track: IntakeTrackKey): string {
  return track === "showcase" ? "showcase_extra_page" : "extra_page";
}

/**
 * The written-blog-post row, which exists on the coded track only.
 *
 * Null for the durable track rather than a key that resolves to nothing: the
 * platform track sells no blog, so there is no post to write, and returning a
 * key would make the absence look like a missing catalogue row.
 */
function seoPostKeyFor(track: IntakeTrackKey): string | null {
  return track === "showcase" ? "showcase_seo_post" : null;
}

/**
 * The counted rows a pay screen can propose, as counts and never as amounts.
 *
 * An object rather than trailing positional arguments: `createDepositCheckout`
 * already carries six, and the seventh and eighth being two bare numbers in a
 * row is how a caller eventually passes pages as posts. Each field is bounded
 * at the action's edge and again where its line item is built.
 */
export type CheckoutCounts = {
  /** Pages beyond the included five. */
  extraPages?: number;
  /** Blog posts written for the client. Coded track only, and gated on the blog. */
  seoPosts?: number;
};

/**
 * Lazy, for the same reason the database client is: a module-level client
 * would read the secret key at import time and break every build and script
 * that merely touches this file's types.
 */
let stripe: Stripe | null = null;

/**
 * Exported for `orders.ts` and the backfill, which fetch sessions and
 * invoices by id. One client, one API version pin, one place that reads the
 * secret — a second `new Stripe(...)` anywhere would be a second pin to drift.
 */
export function getStripe(): Stripe {
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

/** Where Stripe returns a client to — their own track's entry route. */
function entryFor(track: IntakeTrackKey, token: string): string {
  return track === "showcase"
    ? showcaseIntakeRoutes.entry(token)
    : intakeRoutes.entry(token);
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
export async function getCheckoutCatalogue(
  useAdminTestPrice = false,
  track: IntakeTrackKey = "durable",
  plan: BuildPlan = "half",
  overrideKey?: string,
): Promise<{
  deposit: SellableProduct;
  addons: SellableProduct[];
  /**
   * Extra pages, resolved separately from `addons` and deliberately so.
   *
   * It is not `offeredAtCheckout`, because it is not checkbox-shaped: the
   * question is *how many*, not *whether*, and a checkbox that meant "one" was
   * the wrong control for a row priced per unit. `listCheckoutAddons` stays a
   * list of things you tick; this is the thing you count. Null when no
   * sellable row exists, in which case the pay screen offers nothing rather
   * than offering a count it cannot charge.
   */
  extraPage: SellableProduct | null;
  /**
   * Blog posts, written per post. Counted like `extraPage` and null on the
   * durable track, which sells no blog for them to live on. Offering it is
   * further gated on the blog add-on actually being ticked — see
   * `ADDON_REQUIRES`; this field only says the row is sellable.
   */
  seoPost: SellableProduct | null;
}> {
  const useTestPrice = useAdminTestPrice && adminTestPaymentEnabled();

  if (useTestPrice) {
    const testProduct = await findSellableProductByKey("admin_test_payment");
    if (testProduct) {
      return {
        deposit: testProduct,
        addons: [],
        extraPage: null,
        seoPost: null,
      };
    }

    console.warn(
      "[deposit] admin test payment requested but admin_test_payment is not sellable — falling back to real deposit",
    );
  }

  const postKey = seoPostKeyFor(track);

  const [deposit, addons, extraPage, seoPost] = await Promise.all([
    getBuildProduct(track, plan, overrideKey),
    listCheckoutAddons(track),
    findSellableProductByKey(extraPageKeyFor(track)),
    postKey ? findSellableProductByKey(postKey) : Promise.resolve(null),
  ]);

  return { deposit, addons, extraPage, seoPost };
}

/**
 * What a promo code does to this order, resolved once, server-side.
 *
 * Both halves of a code live here so the screen and the charge cannot
 * disagree: a granted $0 item, a substituted build row, or neither. The
 * browser proposes a string and gets back facts.
 */
export async function resolvePromoEffect(
  track: IntakeTrackKey,
  code: string | undefined,
  plan: BuildPlan,
): Promise<{ granted: SellableProduct | null; overrideKey?: string }> {
  const grant = code ? resolvePromoCode(code) : null;
  if (!grant) return { granted: null };

  const overrideKey =
    plan === "full"
      ? grant.overridesBuildKey?.full
      : grant.overridesBuildKey?.half;

  const grantedRow = grant.grantsProductKey
    ? await findSellableProductByKey(grant.grantsProductKey)
    : null;

  // Same track check the display path runs, and for the same reason: a code
  // must never put another track's row on this order.
  const granted = grantedRow && grantedRow.track === track ? grantedRow : null;

  if (grant.grantsProductKey && !granted) {
    console.warn(`[deposit] promo grant is not sellable on this track`);
  }

  // A code whose override row is not sellable on this track falls back to the
  // list price rather than failing the attempt. The client pays more than the
  // code promised, which is visible on the screen before they tap — the
  // opposite mistake would charge them for a row nobody could audit.
  if (overrideKey) {
    const row = await findSellableProductByKey(overrideKey);
    if (!row) {
      console.warn(
        `[deposit] promo override row is not sellable; using list price`,
      );
      return { granted };
    }
    if (row.track !== track) {
      console.warn(
        `[deposit] promo override row belongs to another track; ignored`,
      );
      return { granted };
    }
  }

  return { granted, overrideKey };
}

/** What a pay screen renders for an activated code. Display only. */
export type PromoDescription =
  | { valid: false }
  | {
      valid: true;
      /** A $0 catalogue item added to the order. */
      granted?: { key: string; name: string; description: string };
      /** Negotiated build prices, in cents, for the plan cards to render. */
      build?: { halfCents: number; fullCents?: number };
    };

/**
 * Describes a code for the screen, without composing a charge.
 *
 * Activation here draws lines and prices and nothing else. The session is
 * composed independently by `createDepositCheckout` from the same code map, so
 * a stale or tampered screen can never change what is actually charged — it
 * can only be wrong about what it promised, which the total then contradicts
 * before the client taps.
 */
export async function describePromo(
  track: IntakeTrackKey,
  code: string | undefined,
): Promise<PromoDescription> {
  const grant = code ? resolvePromoCode(code) : null;
  if (!grant) return { valid: false };

  // Every row a code touches has to belong to this track. Without that check
  // a platform-track code would add a platform-track row to a coded order —
  // a real product, at a real price, on the wrong invoice.
  const onTrack = (p: SellableProduct | null) =>
    p && p.track === track ? p : null;

  const granted = onTrack(
    grant.grantsProductKey
      ? await findSellableProductByKey(grant.grantsProductKey)
      : null,
  );

  const usableHalf = onTrack(
    grant.overridesBuildKey?.half
      ? await findSellableProductByKey(grant.overridesBuildKey.half)
      : null,
  );
  const usableFull = onTrack(
    grant.overridesBuildKey?.full
      ? await findSellableProductByKey(grant.overridesBuildKey.full)
      : null,
  );

  // A code that resolves to nothing this track can sell is not valid *here*,
  // whatever it means elsewhere.
  if (!granted && !usableHalf) return { valid: false };

  return {
    valid: true,
    ...(granted
      ? {
          granted: {
            key: granted.key,
            name: granted.name,
            description: granted.description,
          },
        }
      : {}),
    ...(usableHalf
      ? {
          build: {
            halfCents: usableHalf.priceCents,
            ...(usableFull ? { fullCents: usableFull.priceCents } : {}),
          },
        }
      : {}),
  };
}

/**
 * Verifies that what we are about to charge is what the catalogue displays.
 *
 * Throwing here fails closed: the client sees the pay button's quiet retry
 * line and nothing is charged. The alternative — charging Stripe's number
 * while the screen showed ours — is the one failure this flow must never
 * have, so a drifted price is an outage, not a rounding difference.
 */
async function assertPricesMatchStripe(
  items: SellableProduct[],
): Promise<void> {
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
  plan: BuildPlan = "half",
  counts: CheckoutCounts = {},
): Promise<string> {
  if (!engagement.depositRequired || engagement.paidAt) {
    throw new Error("Engagement does not require a deposit.");
  }

  const track = engagement.track;
  const useTestPrice = adminTestPayment && adminTestPaymentEnabled();

  // Resolved before the catalogue, because a code can change which build row
  // the catalogue is asked for.
  const { granted, overrideKey } = useTestPrice
    ? { granted: null, overrideKey: undefined }
    : await resolvePromoEffect(track, promoCode, plan);

  const { deposit, addons, extraPage, seoPost } = await getCheckoutCatalogue(
    useTestPrice,
    track,
    plan,
    overrideKey,
  );

  let selected: SellableProduct[] = [];

  if (!useTestPrice) {
    const known = new Set(addons.map((a) => a.key));
    const unknown = addonKeys.filter((key) => !known.has(key));
    if (unknown.length > 0) {
      console.warn(
        `[deposit] dropping unknown add-on keys: ${unknown.join(", ")}`,
      );
    }

    /*
     * Bundled rows are dropped here, not just on the pay screen.
     *
     * The admin panel includes the Supabase setup it runs on. The screen greys
     * that row out, but the screen is a courtesy — this is the function that
     * builds a Stripe line, so it is the one that has to guarantee a client is
     * never charged for a dependency they already bought. Deliberately not
     * conditional on what the browser sent.
     */
    const chargeable = withoutBundled(addonKeys);

    selected = addons.filter((a) => chargeable.includes(a.key));
  }

  /**
   * Extra pages, as a count rather than a tick.
   *
   * Bounded here as well as at the action's edge: this is the function that
   * builds a Stripe line item, so it is the one that must not be able to
   * multiply a price by a number nobody chose. Zero, a non-integer, a count
   * past the ceiling, an absent catalogue row, or the admin test price all
   * land in the same place — no extra-page line at all.
   */
  const extraPages = counts.extraPages ?? 0;

  const pages =
    !useTestPrice &&
    extraPage &&
    Number.isInteger(extraPages) &&
    extraPages > 0 &&
    extraPages <= EXTRA_PAGES_MAX
      ? extraPages
      : 0;

  /**
   * Written blog posts, counted — and gated, which pages are not.
   *
   * A post is only sellable alongside the blog it publishes to, so the gate
   * reads the *chargeable* selection rather than what the browser proposed:
   * a call that asks for six posts without the blog buys zero, silently and
   * on the server. Bounded here as well as at the edge, same as pages, because
   * this is the function that turns a count into a Stripe line.
   */
  const seoPosts = counts.seoPosts ?? 0;
  const blogSelected = selected.some((a) => a.key === "showcase_seo_blog");

  const posts =
    !useTestPrice &&
    seoPost &&
    blogSelected &&
    Number.isInteger(seoPosts) &&
    seoPosts > 0 &&
    seoPosts <= SEO_POSTS_MAX
      ? seoPosts
      : 0;

  /**
   * Every line, with the quantity it is charged at.
   *
   * Quantity used to be the literal 1 on every line, which was true while
   * nothing sold by the unit was reachable from this screen. Extra pages are,
   * so the arithmetic moves to Stripe — the session multiplies the catalogue
   * price by the count, and the basket row records the count beside the unit
   * price it was struck at. Nothing in this file ever computes a total.
   */
  const lines: { product: SellableProduct; quantity: number }[] = [
    { product: deposit, quantity: 1 },
    ...selected.map((product) => ({ product, quantity: 1 })),
    ...(pages > 0 && extraPage
      ? [{ product: extraPage, quantity: pages }]
      : []),
    ...(posts > 0 && seoPost ? [{ product: seoPost, quantity: posts }] : []),
    ...(granted ? [{ product: granted, quantity: 1 }] : []),
  ];

  await assertPricesMatchStripe(lines.map((line) => line.product));

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
      ...(pages > 0 ? { extra_pages: String(pages) } : {}),
      ...(posts > 0 ? { seo_posts: String(posts) } : {}),
      track,
      build_key: deposit.key,
      ...(granted ? { promo_grant: granted.key } : {}),
      ...(overrideKey ? { promo_build_override: overrideKey } : {}),
      ...(useTestPrice ? { admin_test_payment: "1" } : {}),
    },
    line_items: lines.map((line) => ({
      price: line.product.stripePriceId,
      quantity: line.quantity,
    })),
    // GST via Stripe Tax, gated by env: enabling automatic_tax without an
    // active registration silently collects zero tax (docs/AGORA-STRIPE.md),
    // so the flag is flipped deliberately, never defaulted.
    ...(stripeTaxEnabled() ? { automatic_tax: { enabled: true } } : {}),
    payment_intent_data: {
      statement_descriptor_suffix: DEPOSIT_DESCRIPTOR_SUFFIX,
    },
    // Back to this engagement's own tree. A showcase client returned to the
    // durable entry route would be told their link was unavailable seconds
    // after paying, which is the worst possible moment for that screen.
    success_url: `${origin}${entryFor(track, token)}?paid=1`,
    cancel_url: `${origin}${entryFor(track, token)}?canceled=1`,
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
    lines.map((line) => ({
      // The unit price, never the line total. `quantity` carries the rest, and
      // an amount already multiplied would make the row disagree with itself
      // the first time anyone divided it back out.
      amountCents: line.product.priceCents,
      engagementId: engagement.id,
      productId: line.product.id,
      quantity: line.quantity,
    })),
  );

  await db
    .update(engagements)
    .set({ stripeCheckoutSessionId: session.id, updatedAt: new Date() })
    .where(eq(engagements.id, engagement.id));

  return session.url;
}

/**
 * Opens Checkout for extra pages on an existing engagement.
 *
 * **Taylor mints this; a client cannot.** There is no route, action, or
 * component anywhere that reaches this function — only `scripts/`, which needs
 * environment credentials to run.
 *
 * That used to be the whole story about extra pages. It is not any more: as of
 * 2026-09-03 a client can buy extra pages *at checkout*, as a count on the pay
 * screen, through `createDepositCheckout`. This function is now the second
 * route — the one for pages discovered mid-build, after the deposit is
 * settled — and it is still the only route Taylor can start. Step 8's promise
 * that nothing extra is charged without a conversation first now covers pages
 * beyond what the client already paid for, and the step's copy says so.
 *
 * Quantity rides Stripe's own `quantity` and the basket row's, so the
 * arithmetic stays in Stripe and the record holds the unit price it was struck
 * at. One row per product is not a choice here — `engagement_products` has a
 * unique index on (engagement, product) precisely so "bought the same thing
 * twice" is a database impossibility rather than a refund conversation.
 */
export async function createExtraPageCheckout(
  engagement: Engagement,
  token: string,
  pages: number,
): Promise<string> {
  if (!Number.isInteger(pages) || pages < 1 || pages > EXTRA_PAGES_MAX) {
    throw new Error(
      `Pages must be a whole number between 1 and ${EXTRA_PAGES_MAX}.`,
    );
  }

  const key =
    engagement.track === "showcase" ? "showcase_extra_page" : "extra_page";
  const product = await findSellableProductByKey(key);

  if (!product) {
    throw new Error(
      `No sellable "${key}". Run \`yarn stripe:catalogue --apply\` and \`yarn db:seed\`.`,
    );
  }

  await assertPricesMatchStripe([product]);

  const origin = intakeOrigin();

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: engagement.contactEmail,
    metadata: {
      engagement_id: engagement.id,
      // Read by the settlement handler, which must NOT mark the build paid.
      charge_kind: "extra_pages",
      product_key: product.key,
      pages: String(pages),
    },
    line_items: [{ price: product.stripePriceId, quantity: pages }],
    ...(stripeTaxEnabled() ? { automatic_tax: { enabled: true } } : {}),
    payment_intent_data: {
      statement_descriptor_suffix: DEPOSIT_DESCRIPTOR_SUFFIX,
    },
    success_url: `${origin}${entryFor(engagement.track, token)}?paid=1`,
    cancel_url: `${origin}${entryFor(engagement.track, token)}?canceled=1`,
  });

  if (!session.url) throw new Error("Stripe returned a session with no URL.");

  const db = getDb();

  // Replace this product's unpaid row, if there is one. Scoped to the product
  // deliberately: a wholesale delete would wipe an unpaid build basket sitting
  // alongside it.
  await db
    .delete(engagementProducts)
    .where(
      and(
        eq(engagementProducts.engagementId, engagement.id),
        eq(engagementProducts.productId, product.id),
        isNull(engagementProducts.paidAt),
      ),
    );

  await db.insert(engagementProducts).values({
    amountCents: product.priceCents,
    engagementId: engagement.id,
    productId: product.id,
    quantity: pages,
  });

  return session.url;
}

/**
 * The add-ons a client may buy for themselves, mid-questionnaire.
 *
 * **One key, and the list is the gate.** M-PORT-4 ruled that no client-reachable
 * path may create a charge; M-PORT-38 restates what that rule protects — no
 * charge the client did not *themselves* initiate on hosted Checkout at a
 * published price — and opens exactly this door. Post-intake extra pages, the
 * balance, and the care plan remain Taylor-initiated and are not here.
 *
 * Widening this is a decision, not a constant edit: adding a key sells
 * something new inside a form somebody is halfway through.
 */
export const MID_INTAKE_ADDONS = ["showcase_animations"] as const;

export type MidIntakeAddon = (typeof MID_INTAKE_ADDONS)[number];

/**
 * Opens Checkout for one add-on, at the client's own request, mid-intake.
 *
 * Refuses four ways before Stripe is touched: wrong track, unpaid build, a key
 * that is not on the list, and a row this engagement already owns. The last is
 * the one that matters most — `engagement_products` has a unique index on
 * (engagement, product), so a second purchase of the same thing is a database
 * impossibility rather than a refund conversation, and refusing early turns
 * that into a sentence instead of a constraint violation.
 *
 * Settles through `settleAncillaryPurchase` and **never** `fulfillDeposit`:
 * `paid_at` means the build was bought, and an add-on that set it would walk an
 * unpaid client straight into a questionnaire they had not paid for.
 */
export async function createAddonCheckout(
  engagement: Engagement,
  token: string,
  key: MidIntakeAddon,
): Promise<string> {
  if (engagement.track !== "showcase") {
    throw new Error("Add-ons are sold mid-intake on the coded track only.");
  }

  if (!MID_INTAKE_ADDONS.includes(key)) {
    throw new Error(`"${key}" is not sold mid-intake.`);
  }

  // The build comes first. Nothing is sold inside a questionnaire the client
  // has not bought their way into.
  if (!engagement.paidAt) {
    throw new Error("The build must be paid for before an add-on is sold.");
  }

  if (await hasPaidFor(engagement.id, key)) {
    throw new Error(`This engagement already owns "${key}".`);
  }

  const product = await findSellableProductByKey(key);

  if (!product) {
    throw new Error(
      `No sellable "${key}". Run \`yarn stripe:catalogue --apply\` and \`yarn db:seed\`.`,
    );
  }

  await assertPricesMatchStripe([product]);

  const origin = intakeOrigin();
  const step = showcaseIntakeRoutes.step(token, "taste");

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: engagement.contactEmail,
    metadata: {
      engagement_id: engagement.id,
      // Read by the settlement handler, which must NOT mark the build paid.
      charge_kind: "addon",
      product_key: product.key,
    },
    line_items: [{ price: product.stripePriceId, quantity: 1 }],
    ...(stripeTaxEnabled() ? { automatic_tax: { enabled: true } } : {}),
    payment_intent_data: {
      statement_descriptor_suffix: DEPOSIT_DESCRIPTOR_SUFFIX,
    },
    // Back to the step they were on, not to the entry router — a client who
    // just bought motion should land on the questions it opens.
    success_url: `${origin}${step}?added=${product.key}`,
    cancel_url: `${origin}${step}?canceled=1`,
  });

  if (!session.url) throw new Error("Stripe returned a session with no URL.");

  const db = getDb();

  // Replace this product's unpaid row, so a second press after abandoning
  // Checkout corrects the attempt rather than stacking one.
  await db
    .delete(engagementProducts)
    .where(
      and(
        eq(engagementProducts.engagementId, engagement.id),
        eq(engagementProducts.productId, product.id),
        isNull(engagementProducts.paidAt),
      ),
    );

  await db.insert(engagementProducts).values({
    amountCents: product.priceCents,
    engagementId: engagement.id,
    productId: product.id,
    quantity: 1,
  });

  return session.url;
}

/**
 * Whether this engagement has already paid for extra pages.
 *
 * The unique index means a second purchase of the same product cannot be
 * recorded, and a paid row is history that is never rewritten. So a client who
 * wants more pages after already buying some is a case the record cannot hold
 * — the script refuses and says so, rather than quietly editing what they were
 * charged last time.
 */
export async function hasPaidFor(
  engagementId: string,
  productKey: string,
): Promise<boolean> {
  const [row] = await getDb()
    .select({ id: engagementProducts.id })
    .from(engagementProducts)
    .innerJoin(products, eq(engagementProducts.productId, products.id))
    .where(
      and(
        eq(engagementProducts.engagementId, engagementId),
        eq(products.key, productKey),
        isNotNull(engagementProducts.paidAt),
      ),
    )
    .limit(1);

  return Boolean(row);
}

/**
 * Settles a purchase that is not the build itself.
 *
 * Stamps the session's own basket rows and **never touches `paid_at` on the
 * engagement**. That column means one thing — the build's deposit has been
 * paid — and an extra-page payment making an unpaid engagement read as paid
 * would send a client straight past the pay screen into a questionnaire they
 * had not bought.
 *
 * Idempotent the same way fulfillment is: the guard is the UPDATE's own
 * predicate, so a replayed delivery stamps nothing a second time.
 */
export async function settleAncillaryPurchase(
  engagementId: string,
  productKey: string,
): Promise<"settled" | "already_settled"> {
  const db = getDb();

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.key, productKey))
    .limit(1);

  if (!product) return "already_settled";

  const stamped = await db
    .update(engagementProducts)
    .set({ paidAt: new Date() })
    .where(
      and(
        eq(engagementProducts.engagementId, engagementId),
        eq(engagementProducts.productId, product.id),
        isNull(engagementProducts.paidAt),
      ),
    )
    .returning({ id: engagementProducts.id });

  return stamped.length > 0 ? "settled" : "already_settled";
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

  // The build line from this attempt's basket. With add-ons in the session,
  // `amount_total` is build + add-ons (+ tax when enabled), so it is no
  // longer the build price; the basket row holds the number the deal was
  // struck at. The session total remains the fallback for engagements whose
  // session predates the basket.
  //
  // Matched by `kind`, not by the literal key "deposit". There are now five
  // rows that can be a build line — two tracks, a pay-in-full option, and two
  // negotiated substitutions — and a growing list of literals is a list that
  // eventually misses one and silently records the wrong amount paid. One
  // build line per basket is already the invariant that makes this safe.
  const [buildLine] = await db
    .select({ amountCents: engagementProducts.amountCents })
    .from(engagementProducts)
    .innerJoin(products, eq(engagementProducts.productId, products.id))
    .where(
      and(
        eq(engagementProducts.engagementId, engagementId),
        eq(products.kind, "build"),
        isNull(engagementProducts.paidAt),
      ),
    )
    .limit(1);

  const depositCents = buildLine?.amountCents ?? amountPaidCents;

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
