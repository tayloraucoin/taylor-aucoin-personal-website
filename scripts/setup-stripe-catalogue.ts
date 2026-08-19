import { parseArgs } from "node:util";
import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

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
      { nickname: "Deposit — half to start", amountCents: 60000, env: "STRIPE_PRICE_DEPOSIT" },
      { nickname: "Balance — before go-live", amountCents: 60000, env: "STRIPE_PRICE_BALANCE" },
    ],
  },
  {
    name: "Website changes — standard round",
    description:
      "New sections, layout changes, rewritten copy, or a new page. Batched into one round.",
    taxCode: TAX_WEBSITE,
    prices: [
      { nickname: "Standard round", amountCents: 50000, env: "STRIPE_PRICE_CHANGES_STANDARD" },
    ],
  },
  {
    name: "Website changes — small round",
    description: "A few text edits, swapping photos, updating hours. Batched into one round.",
    taxCode: TAX_WEBSITE,
    prices: [
      { nickname: "Small round", amountCents: 25000, env: "STRIPE_PRICE_CHANGES_SMALL" },
    ],
  },
  {
    name: "Extra page",
    description: "An additional page beyond the standard five. Priced per page.",
    taxCode: TAX_WEBSITE,
    prices: [{ nickname: "Per page", amountCents: 15000, env: "STRIPE_PRICE_EXTRA_PAGE" }],
  },
  {
    name: "Online booking setup",
    description: "Your services, hours, and calendar synced to online booking.",
    taxCode: TAX_SERVICES,
    prices: [{ nickname: "Setup", amountCents: 25000, env: "STRIPE_PRICE_BOOKING_SETUP" }],
  },
  {
    name: "Google Business Profile deep clean",
    description: "Photos, categories, and description brought up to scratch.",
    taxCode: TAX_SERVICES,
    prices: [{ nickname: "Deep clean", amountCents: 30000, env: "STRIPE_PRICE_GBP_CLEAN" }],
  },
  {
    name: "Logo refresh",
    description: "A refreshed logo for your business.",
    taxCode: TAX_SERVICES,
    prices: [{ nickname: "Refresh", amountCents: 25000, env: "STRIPE_PRICE_LOGO" }],
  },
  {
    name: "Care Plan",
    description:
      "Google review replies, listing posts, one small round of website changes a month, and priority on bigger work. Month to month.",
    taxCode: TAX_SERVICES,
    prices: [
      { nickname: "Monthly", amountCents: 25000, env: "STRIPE_PRICE_CARE_PLAN", recurring: "month" },
    ],
  },
];

async function main(): Promise<void> {
  const { values } = parseArgs({ options: { apply: { type: "boolean" } } });
  const apply = values.apply === true;

  const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-07-29.dahlia",
  });

  const live = requireEnv("STRIPE_SECRET_KEY").startsWith("sk_live_");
  console.log(
    `\n${apply ? "APPLYING" : "DRY RUN"} against ${live ? "LIVE" : "TEST"} mode.` +
      (apply ? "" : "  Re-run with --apply to make changes.\n"),
  );

  const envLines: string[] = [];

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
        envLines.push(`${price.env}=${match.id}`);
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
        envLines.push(`${price.env}=${created.id}`);
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
