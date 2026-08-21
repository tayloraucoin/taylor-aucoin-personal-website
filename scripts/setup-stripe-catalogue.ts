import { parseArgs } from "node:util";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { products } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import { applyTierEnv } from "./_env";

applyTierEnv();

/**
 * The Agora catalogue, as published in how_we_work.pdf and website_toolkit.pdf.
 *
 * Every number here is the client-facing price from those documents. If a
 * price changes there, change it here and re-run — the script archives the old
 * Price and creates the new one, because Stripe Prices are immutable by
 * design. That immutability is a feature: an invoice paid last year stays
 * attached to the amount that was actually charged.
 *
 *   yarn stripe:catalogue            # show what would change
 *   yarn stripe:catalogue --apply    # make it so
 *
 * Safe to re-run. Products are matched by name, prices by nickname, so a
 * second run against an already-correct catalogue changes nothing.
 */

/** Website Design — for the site itself and work on it. */
const TAX_WEBSITE = "txcd_10701200";
/** General - Services — Stripe's catch-all for labour. */
const TAX_SERVICES = "txcd_20030000";

type PriceSpec = {
  nickname: string;
  amountCents: number;
  env: string;
  /**
   * The `products.key` this price belongs to. `--apply` writes the Stripe
   * product/price ids and the amount onto that row, so the database and the
   * Stripe catalogue change in one motion and cannot drift apart. A price
   * without a dbKey (none today) would be env-only.
   */
  dbKey?: string;
  /** Present for the Care Plan, which is the only recurring thing sold. */
  recurring?: "month";
};

type ProductSpec = {
  name: string;
  description: string;
  taxCode: string;
  prices: PriceSpec[];
};

/**
 * One Product per thing a client can buy, rather than many prices under one
 * product. Invoices and Checkout display the *product* name on each line, so
 * sharing a product across unrelated items makes a client's invoice read as
 * the same thing repeated.
 *
 * The build is the deliberate exception: its two prices are two halves of one
 * purchase, so they belong to one product and the invoice line carries its own
 * description.
 */
const CATALOGUE: ProductSpec[] = [
  {
    name: "Website build",
    description:
      "Five-page website built from your questionnaire answers. $1,200 + GST, half to start and half before it goes live.",
    taxCode: TAX_WEBSITE,
    prices: [
      { nickname: "Deposit — half to start", amountCents: 60000, env: "PRICE_DEPOSIT", dbKey: "deposit" },
      { nickname: "Balance — before go-live", amountCents: 60000, env: "PRICE_BALANCE", dbKey: "balance" },
    ],
  },
  {
    name: "Website changes — standard round",
    description:
      "New sections, layout changes, rewritten copy, or a new page. Batched into one round.",
    taxCode: TAX_WEBSITE,
    prices: [
      { nickname: "Standard round", amountCents: 50000, env: "PRICE_CHANGES_STANDARD", dbKey: "changes_standard" },
    ],
  },
  {
    name: "Website changes — small round",
    description: "A few text edits, swapping photos, updating hours. Batched into one round.",
    taxCode: TAX_WEBSITE,
    prices: [
      { nickname: "Small round", amountCents: 25000, env: "PRICE_CHANGES_SMALL", dbKey: "changes_small" },
      // $0 price under the same product: the promo grant. Checkout accepts
      // zero-amount lines as long as the session total is positive, and the
      // client's invoice then carries the included round as a real line.
      { nickname: "Included with build — promo", amountCents: 0, env: "PRICE_CHANGES_SMALL_PROMO", dbKey: "changes_small_promo" },
    ],
  },
  {
    name: "Extra page",
    description: "An additional page beyond the standard five. Priced per page.",
    taxCode: TAX_WEBSITE,
    prices: [{ nickname: "Per page", amountCents: 15000, env: "PRICE_EXTRA_PAGE", dbKey: "extra_page" }],
  },
  {
    name: "Online booking setup",
    description: "Your services, hours, and calendar synced to online booking.",
    taxCode: TAX_SERVICES,
    prices: [{ nickname: "Setup", amountCents: 25000, env: "PRICE_BOOKING_SETUP", dbKey: "booking_setup" }],
  },
  {
    name: "Stripe payments setup",
    description: "Your Stripe account connected, products and checkout built.",
    taxCode: TAX_SERVICES,
    prices: [{ nickname: "Setup", amountCents: 25000, env: "PRICE_STRIPE_SETUP", dbKey: "stripe_setup" }],
  },
  {
    name: "Google Business Profile deep clean",
    description: "Photos, categories, and description brought up to scratch.",
    taxCode: TAX_SERVICES,
    prices: [{ nickname: "Deep clean", amountCents: 30000, env: "PRICE_GBP_CLEAN", dbKey: "gbp_clean" }],
  },
  {
    name: "Logo refresh",
    description: "A refreshed logo for your business.",
    taxCode: TAX_SERVICES,
    prices: [{ nickname: "Refresh", amountCents: 25000, env: "PRICE_LOGO", dbKey: "logo_refresh" }],
  },
  {
    name: "Care Plan",
    description:
      "Google review replies, listing posts, one small round of website changes a month, and priority on bigger work. Month to month.",
    taxCode: TAX_SERVICES,
    prices: [
      { nickname: "Monthly", amountCents: 25000, env: "PRICE_CARE_PLAN", dbKey: "care_plan", recurring: "month" },
    ],
  },
];

async function main(): Promise<void> {
  const { values } = parseArgs({ options: { apply: { type: "boolean" } } });
  const apply = values.apply === true;

  const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-07-29.dahlia",
  });

  // The key decides the mode, not APP_ENVIRONMENT — a live key run under a
  // staging tier would still create live objects, so report what Stripe will
  // actually see.
  const mode = requireEnv("STRIPE_SECRET_KEY").startsWith("sk_live_")
    ? "LIVE"
    : "TEST";

  console.log(
    `\n${apply ? "APPLYING" : "DRY RUN"} against Stripe ${mode} mode.` +
      (apply ? "" : "  Re-run with --apply to make changes.\n"),
  );

  const envLines: string[] = [];

  /**
   * Ids destined for the `products` table. Written after the Stripe pass so a
   * mid-run failure never leaves the database pointing at objects that were
   * not created. Seed the rows first (`yarn db:seed`); a missing row here is
   * a warning, not an insert — copy belongs to the seed.
   */
  const dbSyncs: Array<{
    key: string;
    stripeProductId: string;
    stripePriceId: string;
    amountCents: number;
  }> = [];

  // Listed once and matched in memory rather than queried per product.
  // `products.search` is eventually consistent — a product created seconds ago
  // is not findable yet, so a second run would create it again. `list` is
  // immediately consistent, which is what makes this script safe to re-run.
  const allProducts: Stripe.Product[] = [];
  for await (const product of stripe.products.list({ active: true, limit: 100 })) {
    allProducts.push(product);
  }

  for (const spec of CATALOGUE) {
    // Matched by name: product ids do not carry across test and live mode.
    let product = allProducts.find((p) => p.name === spec.name);

    if (!product) {
      console.log(`+ product  ${spec.name}`);
      if (apply) {
        product = await stripe.products.create({
          name: spec.name,
          description: spec.description,
          tax_code: spec.taxCode,
        });
        allProducts.push(product);
      }
    } else {
      console.log(`= product  ${spec.name}  (${product.id})`);
    }

    const current = product
      ? await stripe.prices.list({ product: product.id, active: true, limit: 100 })
      : { data: [] as Stripe.Price[] };

    const claimed = new Set<string>();

    for (const price of spec.prices) {
      const match = current.data.find((p) => p.nickname === price.nickname);
      if (match) claimed.add(match.id);

      if (match && match.unit_amount === price.amountCents) {
        console.log(`  = ${price.nickname}  $${(price.amountCents / 100).toFixed(2)}`);
        envLines.push(`STRIPE_${mode === "LIVE" ? "LIVE" : "STAGING"}_${price.env}=${match.id}`);
        if (price.dbKey && product) {
          dbSyncs.push({ key: price.dbKey, stripeProductId: product.id, stripePriceId: match.id, amountCents: price.amountCents });
        }
        continue;
      }

      if (match) {
        // Prices cannot be edited. The old one is archived so it stops being
        // offered, while staying attached to anything already paid on it.
        console.log(
          `  ~ ${price.nickname}  $${((match.unit_amount ?? 0) / 100).toFixed(2)} -> $${(price.amountCents / 100).toFixed(2)}  (archiving ${match.id})`,
        );
        if (apply) await stripe.prices.update(match.id, { active: false });
      } else {
        console.log(`  + ${price.nickname}  $${(price.amountCents / 100).toFixed(2)}`);
      }

      if (apply && product) {
        const created = await stripe.prices.create({
          product: product.id,
          currency: "cad",
          unit_amount: price.amountCents,
          nickname: price.nickname,
          // Every published price is quoted "+ GST", so tax is added on top
          // rather than being carved out of the number the client agreed to.
          tax_behavior: "exclusive",
          ...(price.recurring ? { recurring: { interval: price.recurring } } : {}),
        });
        envLines.push(`STRIPE_${mode === "LIVE" ? "LIVE" : "STAGING"}_${price.env}=${created.id}`);
        if (price.dbKey) {
          dbSyncs.push({ key: price.dbKey, stripeProductId: product.id, stripePriceId: created.id, amountCents: price.amountCents });
        }
      }
    }

    // Anything still active on this product that the catalogue does not
    // declare is a superseded price — an old amount, or one whose label
    // changed. Retiring it is the point of treating the catalogue as the
    // source of truth: otherwise a corrected price sits alongside the wrong
    // one it was meant to replace, and both are offerable.
    for (const stale of current.data) {
      if (claimed.has(stale.id)) continue;

      console.log(
        `  - retiring  ${stale.nickname ?? stale.id}  $${((stale.unit_amount ?? 0) / 100).toFixed(2)}  (${stale.id})`,
      );
      if (apply) await stripe.prices.update(stale.id, { active: false });
    }
  }

  if (apply && dbSyncs.length > 0) {
    const db = getDb();
    for (const sync of dbSyncs) {
      const [updated] = await db
        .update(products)
        .set({
          priceCents: sync.amountCents,
          stripePriceId: sync.stripePriceId,
          stripeProductId: sync.stripeProductId,
          updatedAt: new Date(),
        })
        .where(eq(products.key, sync.key))
        .returning({ id: products.id });

      if (updated) {
        console.log(`  db products.${sync.key} <- ${sync.stripePriceId}`);
      } else {
        console.warn(
          `  ! products.${sync.key} not found — run \`yarn db:seed\` first, then re-run`,
        );
      }
    }
  }

  if (envLines.length > 0) {
    console.log(`\n${apply ? "Set these in .env.local:" : "Existing ids:"}\n`);
    for (const line of envLines) console.log(`  ${line}`);
  }
  console.log();
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
