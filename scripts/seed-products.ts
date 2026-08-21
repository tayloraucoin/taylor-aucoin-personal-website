import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { products, type NewProductRow } from "@/db/schema";
import {
  credentialSet,
  resolveAppTier,
} from "@/lib/config/env/resolve-tier-env";
import { applyTierEnv } from "./_env";

applyTierEnv();

/**
 * Seeds the commercial catalogue — the deposit, the balance, the add-ons,
 * the rounds, and the care plan — mirroring CC's `seedBilling` shape: fixed
 * UUIDs, stable keys, idempotent upserts.
 *
 *   yarn db:seed
 *
 * Prices here are the client-facing numbers from how_we_work.pdf and
 * /websites. Stripe product/price ids are tier-aware: production gets the
 * live-mode ids, staging and local get the test-mode ids — the same
 * LIVE/STAGING rule `next.config.ts` uses for keys and database URLs.
 *
 * When a price changes, run `yarn stripe:catalogue --apply` to mint the new
 * Price in Stripe, paste the printed id into `STRIPE_CATALOGUE_IDS` below,
 * then re-seed the tier's database.
 */

const SEED_PRODUCT_IDS = {
  deposit: "00000000-0000-4000-9000-000000000001",
  balance: "00000000-0000-4000-9000-000000000002",
  booking_setup: "00000000-0000-4000-9000-000000000003",
  stripe_setup: "00000000-0000-4000-9000-000000000004",
  gbp_clean: "00000000-0000-4000-9000-000000000005",
  logo_refresh: "00000000-0000-4000-9000-000000000006",
  extra_page: "00000000-0000-4000-9000-000000000007",
  changes_standard: "00000000-0000-4000-9000-000000000008",
  changes_small: "00000000-0000-4000-9000-000000000009",
  care_plan: "00000000-0000-4000-9000-000000000010",
  changes_small_promo: "00000000-0000-4000-9000-000000000011",
  admin_test_payment: "00000000-0000-4000-9000-000000000012",
} as const;

export type SeedProductKey = keyof typeof SEED_PRODUCT_IDS;

const STRIPE_CATALOGUE_IDS: Record<
  SeedProductKey,
  {
    production: { productId: string; priceId: string };
    sandbox: { productId: string; priceId: string };
  }
> = {
  deposit: {
    production: {
      productId: "prod_V6R7JCItyTRNEf",
      priceId: "price_1U6EhTRzOAOTo9VYtl68u6H2",
    },
    sandbox: {
      productId: "prod_V6R7JCItyTRNEf",
      priceId: "price_1U6EesRvld9FSVemOl4zxS4H",
    },
  },
  balance: {
    production: {
      productId: "prod_V6R7JCItyTRNEf",
      priceId: "price_1U6EhTRzOAOTo9VYpR2Erz84",
    },
    sandbox: {
      productId: "prod_V6R7JCItyTRNEf",
      priceId: "price_1U6EetRvld9FSVemwVzTlCrU",
    },
  },
  admin_test_payment: {
    production: {
      productId: "prod_V6R7JCItyTRNEf",
      priceId: "price_1U6yn0RzOAOTo9VYnwZoltPL",
    },
    sandbox: {
      productId: "prod_V6R7JCItyTRNEf",
      priceId: "price_1U6ynZRvld9FSVemyIv0RV9b",
    },
  },
  changes_standard: {
    production: {
      productId: "prod_V6RXi7jCBm4J2T",
      priceId: "price_1U6EhYRzOAOTo9VYil1Qoony",
    },
    sandbox: {
      productId: "prod_V6RXi7jCBm4J2T",
      priceId: "price_1U6EeuRvld9FSVemHT3qNkHe",
    },
  },
  changes_small: {
    production: {
      productId: "prod_V6RYDP8KBMYQgE",
      priceId: "price_1U6EhaRzOAOTo9VYc3MkL7OL",
    },
    sandbox: {
      productId: "prod_V6RYDP8KBMYQgE",
      priceId: "price_1U6EevRvld9FSVemJpFznrqD",
    },
  },
  // The $0 promo grant — same Stripe product as changes_small, the "free" price.
  changes_small_promo: {
    production: {
      productId: "prod_V6RYDP8KBMYQgE",
      priceId: "price_1U6yX4RzOAOTo9VY8Oe4tG1O",
    },
    sandbox: {
      productId: "prod_V6RYDP8KBMYQgE",
      priceId: "price_1U6yZkRvld9FSVem7oVJG7BZ",
    },
  },
  extra_page: {
    production: {
      productId: "prod_V6RYwsWQE8ETyg",
      priceId: "price_1U6EhcRzOAOTo9VYjCRtrZYF",
    },
    sandbox: {
      productId: "prod_V6RYwsWQE8ETyg",
      priceId: "price_1U6EevRvld9FSVemIBeTj5ix",
    },
  },
  booking_setup: {
    production: {
      productId: "prod_V6RY9mQsS8QrEg",
      priceId: "price_1U6EhiRzOAOTo9VYY3QSruLE",
    },
    sandbox: {
      productId: "prod_V6RY9mQsS8QrEg",
      priceId: "price_1U6EewRvld9FSVemLlQStzEf",
    },
  },
  // Product id genuinely differs by mode here — not copied-to-live like the rest.
  stripe_setup: {
    production: {
      productId: "prod_V7D8RvllCWIMmn",
      priceId: "price_1U6yi3RzOAOTo9VYHtnUDEA6",
    },
    sandbox: {
      productId: "prod_V7D7M7cF18FFrt",
      priceId: "price_1U6yhBRvld9FSVemUheh9bQU",
    },
  },
  gbp_clean: {
    production: {
      productId: "prod_V6RYSbrdKcvQ3a",
      priceId: "price_1U6EhjRzOAOTo9VY1qDzTYVo",
    },
    sandbox: {
      productId: "prod_V6RYSbrdKcvQ3a",
      priceId: "price_1U6EexRvld9FSVem8N52tlLl",
    },
  },
  logo_refresh: {
    production: {
      productId: "prod_V6RY4TrZjUKBl7",
      priceId: "price_1U6EhlRzOAOTo9VYDEYpbbuN",
    },
    sandbox: {
      productId: "prod_V6RY4TrZjUKBl7",
      priceId: "price_1U6EeyRvld9FSVemn20fXJgo",
    },
  },
  care_plan: {
    production: {
      productId: "prod_V6RYGKzJwj41DY",
      priceId: "price_1U6EhqRzOAOTo9VYUi7ZJV6q",
    },
    sandbox: {
      productId: "prod_V6RYGKzJwj41DY",
      priceId: "price_1U6EeyRvld9FSVemaupdv9py",
    },
  },
};

/** LIVE for production, STAGING (sandbox/test mode) for staging and local. */
function stripeIdsFor(key: SeedProductKey) {
  const mode =
    credentialSet(resolveAppTier()) === "LIVE" ? "production" : "sandbox";
  return STRIPE_CATALOGUE_IDS[key][mode];
}

/**
 * `name`/`description` are client-facing: they render on the P0 add-on rows
 * and on invoice lines, so they carry the /websites register — plain,
 * sentence case, no jargon.
 */
const CATALOGUE_ROWS: NewProductRow[] = [
  {
    id: SEED_PRODUCT_IDS.deposit,
    key: "deposit",
    kind: "build",
    name: "Website build — deposit",
    description: "Half to start. The balance is due before the site goes live.",
    priceCents: 60000,
    offeredAtCheckout: false,
    sortOrder: 0,
  },
  {
    id: SEED_PRODUCT_IDS.balance,
    key: "balance",
    kind: "build",
    name: "Website build — balance",
    description: "The second half, due before the site goes live on your domain.",
    priceCents: 60000,
    offeredAtCheckout: false,
    sortOrder: 1,
  },
  {
    id: SEED_PRODUCT_IDS.admin_test_payment,
    key: "admin_test_payment",
    kind: "build",
    name: "Admin test payment",
    description:
      "Nominal charge Taylor uses to verify checkout end-to-end. Never shown to a client.",
    priceCents: 50,
    offeredAtCheckout: false,
    sortOrder: 2,
  },
  {
    id: SEED_PRODUCT_IDS.booking_setup,
    key: "booking_setup",
    kind: "addon",
    name: "Online booking setup",
    description:
      "Your services, hours, and one shared calendar synced so people book online.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 10,
  },
  {
    id: SEED_PRODUCT_IDS.stripe_setup,
    key: "stripe_setup",
    kind: "addon",
    name: "Stripe payments setup",
    description: "Your account connected, products and checkout built.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 11,
  },
  {
    id: SEED_PRODUCT_IDS.gbp_clean,
    key: "gbp_clean",
    kind: "addon",
    name: "Google Business Profile deep clean",
    description: "Photos, categories, and description brought up to scratch.",
    priceCents: 30000,
    offeredAtCheckout: true,
    sortOrder: 12,
  },
  {
    id: SEED_PRODUCT_IDS.logo_refresh,
    key: "logo_refresh",
    kind: "addon",
    name: "Logo refresh",
    description: "A refreshed logo for your business.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 13,
  },
  {
    id: SEED_PRODUCT_IDS.extra_page,
    key: "extra_page",
    kind: "addon",
    name: "Extra page",
    // Quantity-shaped, so it is not offered at checkout: how many pages is
    // questionnaire material, not a pay-screen checkbox.
    description: "An additional page beyond the standard five. Priced per page.",
    priceCents: 15000,
    offeredAtCheckout: false,
    sortOrder: 20,
  },
  {
    id: SEED_PRODUCT_IDS.changes_standard,
    key: "changes_standard",
    kind: "round",
    name: "Website changes — standard round",
    description: "New sections, layout changes, rewritten copy, or a new page.",
    priceCents: 50000,
    offeredAtCheckout: false,
    sortOrder: 30,
  },
  {
    id: SEED_PRODUCT_IDS.changes_small,
    key: "changes_small",
    kind: "round",
    name: "Website changes — small round",
    description: "A few text edits, swapping photos, updating hours.",
    priceCents: 25000,
    offeredAtCheckout: false,
    sortOrder: 31,
  },
  {
    id: SEED_PRODUCT_IDS.changes_small_promo,
    key: "changes_small_promo",
    kind: "round",
    name: "Small round of changes — included",
    // Granted by promo code only (TAYLOR_FREE_ITERATION_ROUND), never a
    // checkbox: a $0 row a client could tick themselves is a pricing bug,
    // not a deal-sweetener. See lib/intake/promo.ts.
    description: "One batch of small changes after launch, included with your build.",
    priceCents: 0,
    offeredAtCheckout: false,
    sortOrder: 32,
  },
  {
    id: SEED_PRODUCT_IDS.care_plan,
    key: "care_plan",
    kind: "care_plan",
    name: "Care Plan",
    description:
      "Google review replies, listing posts, one small round of changes a month.",
    priceCents: 25000,
    offeredAtCheckout: false,
    sortOrder: 40,
  },
];

async function main(): Promise<void> {
  const tier = resolveAppTier();
  const stripeMode =
    credentialSet(tier) === "LIVE" ? "production" : "sandbox";
  const db = getDb();

  for (const row of CATALOGUE_ROWS) {
    const stripe = stripeIdsFor(row.key as SeedProductKey);

    await db
      .insert(products)
      .values({
        ...row,
        stripeProductId: stripe.productId,
        stripePriceId: stripe.priceId,
      })
      .onConflictDoUpdate({
        target: products.key,
        set: {
          description: row.description,
          isActive: row.isActive ?? true,
          kind: row.kind,
          name: row.name,
          offeredAtCheckout: row.offeredAtCheckout ?? false,
          priceCents: row.priceCents,
          sortOrder: row.sortOrder ?? 0,
          stripeProductId: stripe.productId,
          stripePriceId: stripe.priceId,
          updatedAt: sql`now()`,
        },
      });
  }

  console.log(
    `Seeded ${CATALOGUE_ROWS.length} products with ${stripeMode} Stripe ids (APP_ENVIRONMENT=${tier}).`,
  );
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
