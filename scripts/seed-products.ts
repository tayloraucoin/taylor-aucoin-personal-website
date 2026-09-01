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
 * Prices here are the client-facing numbers published on `/websites/platform`
 * (`content/websites.ts`) and `/websites/coded` (`content/websites-coded.ts`).
 * Those two pages are the source; this file must not disagree with them.
 *
 * ## Run order — this is the part that bites
 *
 *   1. `yarn db:seed`                    creates every row (ids may be null)
 *   2. `yarn stripe:catalogue --apply`   mints Stripe objects AND writes their
 *                                        ids onto the rows from step 1
 *
 * **Seed first, then apply.** `setup-stripe-catalogue.ts` updates
 * `products` by `key`, so a row that does not exist yet is skipped with a
 * warning and its id is never written — which looks exactly like a working run
 * and leaves the pay screen with nothing sellable. If you have ever seen
 * "No sellable build product", this order is the first thing to check.
 *
 * Re-running either step in either order afterwards is safe: the seed's
 * `onConflictDoUpdate` refuses to overwrite an id it does not have.
 *
 * ## Two ways an id gets onto a row, and when to use which
 *
 * - **`stripe:catalogue --apply` writes it** — the normal path, and the only
 *   one needed for a working environment. Nothing to paste, nothing to commit.
 * - **`STRIPE_CATALOGUE_IDS` below** — a committed bootstrap so a fresh
 *   database can be seeded to a known state without calling Stripe. Optional.
 *   A key absent from that map is not a defect; it means nobody has pasted its
 *   id in, and step 2 supplies it at runtime.
 *
 * Tier-aware either way: production gets live-mode ids, staging and local get
 * test-mode — the same LIVE/STAGING rule `next.config.ts` uses.
 *
 * ## One product, or one product with two prices?
 *
 * The rule this catalogue follows, and the reason:
 *
 * - **Different products** when the thing being bought differs, *or* when the
 *   same words would name a different thing to a different buyer. Checkout and
 *   invoices print the **product** name on each line, so a coded client's
 *   receipt reading "Website build" for their $2,000 build would be describing
 *   the platform product. That is why `deposit` and `showcase_deposit` are
 *   separate products rather than two prices under one — they are the same
 *   *shape* of transaction, not the same thing.
 * - **Same product, extra price** when the deliverable is identical and only
 *   the amount moves: a promo grant, a negotiated rate, a discount. Hence
 *   `changes_small_promo` sharing a product with `changes_small` at $0, and
 *   `showcase_deposit_1600` sharing one with `showcase_deposit`.
 *
 * Applied consistently, this keeps Stripe's own product reporting split by
 * line of business without anyone parsing price nicknames to get there.
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

  // The coded track (internal key: showcase).
  showcase_deposit: "00000000-0000-4000-9000-000000000013",
  showcase_balance: "00000000-0000-4000-9000-000000000014",
  showcase_full: "00000000-0000-4000-9000-000000000015",
  showcase_admin_panel: "00000000-0000-4000-9000-000000000016",
  showcase_logo: "00000000-0000-4000-9000-000000000017",
  showcase_booking: "00000000-0000-4000-9000-000000000018",
  showcase_care_plan: "00000000-0000-4000-9000-000000000019",
  showcase_deposit_1600: "00000000-0000-4000-9000-000000000020",
  showcase_full_1600: "00000000-0000-4000-9000-000000000021",
  showcase_extra_page: "00000000-0000-4000-9000-000000000022",
  showcase_animations: "00000000-0000-4000-9000-000000000023",
  showcase_supabase_setup: "00000000-0000-4000-9000-000000000024",
  showcase_seo_blog: "00000000-0000-4000-9000-000000000025",
  showcase_seo_post: "00000000-0000-4000-9000-000000000026",
} as const;

export type SeedProductKey = keyof typeof SEED_PRODUCT_IDS;

const STRIPE_CATALOGUE_IDS: Partial<
  Record<
    SeedProductKey,
    {
      production: { productId: string; priceId: string };
      sandbox: { productId: string; priceId: string };
    }
  >
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

  /* ── The coded track (internal key: showcase) ────────────────────────────
     No entries here, deliberately. Every coded key has a full CATALOGUE spec
     in `setup-stripe-catalogue.ts`, so `--apply` mints the objects and writes
     their ids straight onto the seeded rows. Pasting them back here would be a
     second, manual copy of a fact Stripe already told the database.

     An earlier version of this file carried [NEEDS VALUE AT BUILD] markers and
     four rows of empty-string ids, instructing a reader to run `--apply` first
     and paste. That was backwards — `--apply` cannot write to a row that does
     not exist yet — and it is the reason the coded pay screen rendered nothing
     after an apply-then-seed run. Seed first. See the run order at the top.

     `showcase_care_plan` is never minted at all (M-PORT-6): nothing recurring
     is sold on this track until the offer is settled. It seeds inactive.
     ──────────────────────────────────────────────────────────────────────── */
};

/**
 * LIVE for production, STAGING (sandbox/test mode) for staging and local.
 *
 * A key with no entry seeds with null ids, which is not a failure state: it
 * means the committed bootstrap does not carry that id and step 2 of the run
 * order will supply it. A row without a price id is simply not sellable —
 * `server/services/products.ts` drops it with a warning rather than rendering
 * a checkbox the checkout could not charge. The catalogue and the database
 * stay honest about what can actually take money.
 */
function stripeIdsFor(key: SeedProductKey) {
  const mode =
    credentialSet(resolveAppTier()) === "LIVE" ? "production" : "sandbox";
  return STRIPE_CATALOGUE_IDS[key]?.[mode] ?? { productId: "", priceId: "" };
}

/**
 * `name`/`description` are client-facing: they render on the P0 add-on rows
 * and on invoice lines, so they carry the /websites register — plain,
 * sentence case, no jargon.
 */
const CATALOGUE_ROWS: NewProductRow[] = [
  /* ── The platform track (internal key: durable) ──────────────────────────
     Published on `/websites/platform`. `track` is omitted on these rows and
     the column defaults to "durable", which is what keeps every pre-coded row
     where it already was.

     Covers, against `content/websites.ts`: the $1,200 build as deposit +
     balance; the five add-ons (booking, Stripe, GBP, logo, extra page); both
     change rounds and the $0 promo grant; the care plan. Plus
     `admin_test_payment`, which is Taylor-only and never shown to a client.
     ──────────────────────────────────────────────────────────────────────── */
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

  /* ── The coded track (internal key: showcase) ────────────────────────────
     Published on `/websites/coded`. Every row carries `track: "showcase"`, and
     a pay screen never offers the other track's rows.

     Covers, against `content/websites-coded.ts`: the $2,000 build as deposit +
     balance, the $1,900 paid-in-full row, and the negotiated $1,600 pair
     (promo-only, M-PORT-6); the eight add-ons (admin panel, logo, booking,
     animations, Supabase, SEO blog, extra page, blog post). The care plan is
     present but inactive and is never minted.
     ──────────────────────────────────────────────────────────────────────── */

  {
    id: SEED_PRODUCT_IDS.showcase_deposit,
    key: "showcase_deposit",
    kind: "build",
    track: "showcase",
    name: "Portfolio build — deposit",
    description: "Half to start. The balance is due before launch.",
    priceCents: 100000,
    offeredAtCheckout: false,
    sortOrder: 100,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_balance,
    key: "showcase_balance",
    kind: "build",
    track: "showcase",
    name: "Portfolio build — balance",
    description: "The second half, due before your site goes live.",
    priceCents: 100000,
    offeredAtCheckout: false,
    sortOrder: 101,
  },
  {
    // Its own row rather than a runtime 5% off the deposit: what was charged
    // is then a catalogue fact with an immutable Stripe Price behind it,
    // rather than arithmetic nobody can re-derive later. Ratified in the
    // scoping thread (handoff decision 4).
    id: SEED_PRODUCT_IDS.showcase_full,
    key: "showcase_full",
    kind: "build",
    track: "showcase",
    name: "Portfolio build — paid in full",
    description: "The whole build up front, 5% off.",
    priceCents: 190000,
    offeredAtCheckout: false,
    sortOrder: 102,
  },
  {
    // Kryshan's negotiated $1,600, granted by promo code only (M-PORT-6).
    // Never `offeredAtCheckout`: a discounted row a client could tick
    // themselves is a pricing bug, not a deal-sweetener.
    id: SEED_PRODUCT_IDS.showcase_deposit_1600,
    key: "showcase_deposit_1600",
    kind: "build",
    track: "showcase",
    name: "Portfolio build — deposit",
    description: "Half to start. The balance is due before launch.",
    priceCents: 80000,
    offeredAtCheckout: false,
    sortOrder: 103,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_full_1600,
    key: "showcase_full_1600",
    kind: "build",
    track: "showcase",
    name: "Portfolio build — paid in full",
    description: "The whole build up front, 5% off.",
    priceCents: 152000,
    offeredAtCheckout: false,
    sortOrder: 104,
  },
  {
    // Ruled a live upsell by Taylor, 2026-08-26 (M-PORT-6).
    id: SEED_PRODUCT_IDS.showcase_admin_panel,
    key: "showcase_admin_panel",
    kind: "addon",
    track: "showcase",
    name: "Admin panel",
    description:
      "A private login where you change copy and swap images yourself, no code involved. Most people do fine without it — the site comes with a guide for editing it yourself either way.",
    priceCents: 50000,
    offeredAtCheckout: true,
    sortOrder: 110,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_logo,
    key: "showcase_logo",
    kind: "addon",
    track: "showcase",
    name: "Logo / wordmark refresh",
    description:
      "Most portfolio sites don't need a logo; your name in good type usually does it better. This is for when you want the mark anyway.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 111,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_booking,
    key: "showcase_booking",
    kind: "addon",
    track: "showcase",
    name: "Booking setup",
    description:
      "A booking page wired to your calendar, for coaching, teaching, or consults. Honestly: you can set Cal.com up yourself in an afternoon — this is for skipping the afternoon.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 112,
  },
  {
    // Quantity-shaped, so it is never `offeredAtCheckout`: how many pages is
    // questionnaire material, and the charge is Taylor-minted only (PORT-9).
    id: SEED_PRODUCT_IDS.showcase_extra_page,
    key: "showcase_extra_page",
    kind: "addon",
    track: "showcase",
    name: "Extra page",
    description: "An additional page beyond the included five. Priced per page.",
    priceCents: 15000,
    offeredAtCheckout: false,
    sortOrder: 115,
  },
  {
    // Added 2026-09-01, per content/websites-coded.ts's addOns. Not yet
    // sellable — see the [NEEDS VALUE AT BUILD] note above.
    id: SEED_PRODUCT_IDS.showcase_animations,
    key: "showcase_animations",
    kind: "addon",
    track: "showcase",
    name: "Animations",
    description:
      "Standard motion, built with Framer Motion or similar. Bigger asks can cost more, and you'll describe what you want in the intake form.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 113,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_supabase_setup,
    key: "showcase_supabase_setup",
    kind: "addon",
    track: "showcase",
    name: "Supabase setup",
    description:
      "A database for your site when it needs one: logins, saved form entries, anything that has to persist beyond the pages themselves.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 114,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_seo_blog,
    key: "showcase_seo_blog",
    kind: "addon",
    track: "showcase",
    name: "SEO blog",
    description:
      "A blog section built into your site, with its own admin so you can publish and manage posts without touching code.",
    priceCents: 75000,
    offeredAtCheckout: true,
    sortOrder: 116,
  },
  {
    // Quantity-shaped like extra_page above: how many posts is not a
    // pay-screen checkbox, so this is Taylor-minted only, same reasoning.
    id: SEED_PRODUCT_IDS.showcase_seo_post,
    key: "showcase_seo_post",
    kind: "addon",
    track: "showcase",
    name: "Blog post, written for you",
    description:
      "You brain-dump what you know, I turn it into a polished post tuned for the keywords you're chasing. Priced per post.",
    priceCents: 50000,
    offeredAtCheckout: false,
    sortOrder: 117,
  },
  {
    // Present but dark. Taylor's ruling: "don't charge for the maintenance
    // care plan until it's done" (M-PORT-6). Inactive and unoffered means it
    // renders nowhere and appears in no total; the v2 doc's row copy waits in
    // that document for the day this flips. No Stripe object exists for it.
    id: SEED_PRODUCT_IDS.showcase_care_plan,
    key: "showcase_care_plan",
    kind: "care_plan",
    track: "showcase",
    isActive: false,
    name: "Care plan",
    description:
      "Email me a change, it's live within 48 hours — plus I keep the underlying software current.",
    priceCents: 10000,
    offeredAtCheckout: false,
    sortOrder: 120,
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
        // Empty means not yet minted in Stripe; null is what "unsellable"
        // looks like to the products service.
        stripeProductId: stripe.productId || null,
        stripePriceId: stripe.priceId || null,
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
          track: row.track ?? "durable",
          // Stripe is the source of truth for ids; this map is only a
          // bootstrap. `coalesce` keeps whatever is already on the row and
          // fills in only when it is null, so re-seeding after
          // `yarn stripe:catalogue --apply` cannot undo it.
          //
          // The previous guard checked whether the *map* had a value rather
          // than whether the row did, which meant a committed id silently beat
          // the live one. That is not theoretical: `--apply` matches prices by
          // nickname, and a drifted nickname archives the old price and mints a
          // replacement — after which a re-seed would have written the archived
          // id back over the working one and broken that product's checkout.
          stripeProductId: stripe.productId
            ? sql`coalesce(${products.stripeProductId}, ${stripe.productId})`
            : sql`${products.stripeProductId}`,
          stripePriceId: stripe.priceId
            ? sql`coalesce(${products.stripePriceId}, ${stripe.priceId})`
            : sql`${products.stripePriceId}`,
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
