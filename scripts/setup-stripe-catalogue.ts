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
import {
  CATALOGUE_ROWS,
  STRIPE_PRODUCTS,
  type StripeProductName,
} from "./seed-products";

type PriceSpec = {
  nickname: string;
  amountCents: number;
  env: string;
  /** The `products.key` this price belongs to. `--apply` writes the Stripe ids and the amount onto that row. */
  dbKey: string;
  recurring?: "month";
};

type ProductSpec = {
  name: string;
  /**
   * What this Product was called before the Platform/Coded rename. Products are
   * matched by name, so without this a rename would leave the original orphaned
   * and mint a duplicate alongside it — carrying none of the payment history.
   */
  previousName?: string;
  description: string;
  taxCode: string;
  prices: PriceSpec[];
};

/**
 * The Stripe shape of the catalogue, derived from `seed-products.ts`.
 *
 * That file is the single source of truth: it declares every row, its price,
 * its client-facing name and description, its tax code, and which Stripe
 * Product its Price hangs under. This function only regroups those rows —
 * flat, keyed by `products.key` — into Stripe's Product-with-Prices shape.
 *
 * Nothing here restates an amount, a name, or a description. An earlier version
 * of this script kept its own parallel catalogue, which meant every price
 * existed twice and the two copies could disagree silently.
 *
 * Products are walked in `STRIPE_PRODUCTS` declaration order; prices within a
 * product follow `CATALOGUE_ROWS` order.
 */
function buildCatalogue(): ProductSpec[] {
  const byProduct = new Map<StripeProductName, PriceSpec[]>();

  for (const row of CATALOGUE_ROWS) {
    // `stripe: null` is a row that exists in the database only — never minted.
    if (!row.stripe) continue;

    const prices = byProduct.get(row.stripe.product) ?? [];
    prices.push({
      nickname: row.stripe.nickname,
      amountCents: row.priceCents,
      env: row.stripe.env,
      dbKey: row.key,
      ...(row.stripe.recurring ? { recurring: row.stripe.recurring } : {}),
    });
    byProduct.set(row.stripe.product, prices);
  }

  const specs: ProductSpec[] = [];

  for (const [name, product] of Object.entries(STRIPE_PRODUCTS)) {
    const prices = byProduct.get(name as StripeProductName);

    // A product nobody sells is a declaration with no consequence. Surfacing it
    // beats minting an empty Stripe Product that no row can ever charge.
    if (!prices || prices.length === 0) {
      console.warn(`  ! ${name} has no catalogue row — skipping`);
      continue;
    }

    specs.push({
      name,
      previousName: product.previousName,
      description: product.description,
      taxCode: product.taxCode,
      prices,
    });
  }

  return specs;
}

const CATALOGUE: ProductSpec[] = buildCatalogue();

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

    // Not found under its current name? Try what it used to be called, and
    // rename it in place. Renaming keeps the Product id, so every Price under
    // it — and every payment already made on those Prices — stays attached.
    if (!product && spec.previousName) {
      const renamed = allProducts.find((p) => p.name === spec.previousName);
      if (renamed) {
        console.log(`~ product  ${spec.previousName}  ->  ${spec.name}`);
        product = apply
          ? await stripe.products.update(renamed.id, { name: spec.name })
          : renamed;
      }
    }

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

      // `tax_code` was only ever sent on create, so a product that already
      // existed kept whatever code it was born with — and every reassignment in
      // the table above would have been a silent no-op against a live account.
      // Products, unlike Prices, are mutable, so this is a plain update.
      const currentTaxCode =
        typeof product.tax_code === "string"
          ? product.tax_code
          : (product.tax_code?.id ?? null);

      if (currentTaxCode !== spec.taxCode) {
        console.log(
          `  ~ tax code  ${currentTaxCode ?? "unset"} -> ${spec.taxCode}`,
        );
        if (apply) {
          product = await stripe.products.update(product.id, {
            tax_code: spec.taxCode,
          });
        }
      }
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
