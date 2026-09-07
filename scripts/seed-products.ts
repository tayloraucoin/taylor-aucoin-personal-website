import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { products, type NewProductRow } from "@/db/schema";
import {
  credentialSet,
  resolveAppTier,
} from "@/lib/config/env/resolve-tier-env";

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
 *   receipt reading "Platform · Website build" for their $2,000 build would be describing
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

/*
 * ── Stripe tax codes ─────────────────────────────────────────────────────
 * Ratified by Taylor, 2026-09-01. The code sits on the Stripe **Product**, and
 * Stripe Tax resolves each line's treatment from it.
 *
 * Deliberately not mirrored onto `products` in the database: nothing in the app
 * reads it, and `server/services/agora-invoicing.ts` already states the rule —
 * "The saved Price carries the amount, the currency, the tax behaviour, and —
 * through its Product — the tax code. Nothing is restated here."
 */

/** Website Design — the build itself, pages, anything built into the site. */
export const TAX_WEBSITE = "txcd_10701200";
/** Technical Support Services — configuring or wiring up third-party tooling. */
export const TAX_TECH_SUPPORT = "txcd_20060017";
/** Advertising Services — work whose product is reach rather than software. */
export const TAX_ADVERTISING = "txcd_20060002";
/** Digital Finished Artwork, downloaded, non-subscription, permanent rights. */
export const TAX_ARTWORK = "txcd_10505001";
/** Secretarial/Editing Services — writing delivered as copy, not as a site. */
export const TAX_EDITING = "txcd_20060035";

/**
 * One entry per Stripe **Product**. Rows below name one of these keys, and
 * every row naming the same key becomes a Price under that one Product.
 *
 * The key and the `description` are client-facing: they print on Checkout, on
 * invoices, and on receipts.
 *
 * **No description states a price, and no nickname states an amount.** The
 * Price carries the number, and a copy of it in prose is a second fact that
 * goes stale the moment the first one moves — on a receipt a client keeps.
 * Payment structure is not restated either: "half to start" already lives on
 * the Price nicknames, which is where a client reads it at checkout.
 *
 * ## Naming
 *
 * Every product is prefixed with its track — `Platform ·` for the durable
 * track sold at `/websites/platform`, `Coded ·` for the real-code track sold at
 * `/websites/coded`. Two reasons it is worth the characters:
 *
 * - Stripe sorts products by name, so each line of business lands in one block
 *   in the dashboard instead of interleaved.
 * - A client only ever sees their own track, so the prefix reads as a product
 *   line rather than as jargon — and no coded client gets an invoice describing
 *   a platform build.
 *
 * The word "Portfolio" is gone on purpose. The coded track sells to consultants,
 * speakers, and studios as well as to people with a portfolio, and naming the
 * product after one of its buyers misdescribes it for the rest.
 *
 * `previousName` is what the Product was called before this rename. Products are
 * matched by name, so it is what lets `--apply` rename in place — keeping the
 * Product id and every payment already made under it — rather than orphaning the
 * original and minting a duplicate beside it. Leave these in place; they cost
 * nothing and they are the only record of what a Product used to be called.
 *
 * Declaration order is the order `yarn stripe:catalogue` walks and prints.
 *
 * **The prefix belongs to the Stripe Product name, never to a row's `name`.**
 * A row's `name` is what the pay screen prints beside its checkbox, and a
 * client only ever sees their own track — so "Coded · Booking setup" sitting
 * next to "Admin panel" and "Animations" reads as a category label somebody
 * forgot to remove, which is exactly what it was. Five coded rows carried one,
 * and `showcase_extra_page` carried the *wrong* track's ("Platform · Extra
 * page"); all five were plain-named on 2026-09-03, when extra pages became
 * something a client actually reads on the pay screen. The Stripe Products
 * above keep their prefixes, which is where the prefixes do their job.
 */
export const STRIPE_PRODUCTS = {
  "Platform · Website build": {
    previousName: "Website build",
    description: "Five-page website built from your questionnaire answers.",
    taxCode: TAX_WEBSITE,
  },
  "Platform · Website changes — standard round": {
    previousName: "Website changes — standard round",
    description:
      "New sections, layout changes, rewritten copy, or a new page. Batched into one round.",
    taxCode: TAX_WEBSITE,
  },
  "Platform · Website changes — small round": {
    previousName: "Website changes — small round",
    description:
      "A few text edits, swapping photos, updating hours. Batched into one round.",
    taxCode: TAX_WEBSITE,
  },
  "Platform · Extra page": {
    previousName: "Extra page",
    description:
      "An additional page beyond the standard five. Priced per page.",
    taxCode: TAX_WEBSITE,
  },
  "Platform · Online booking setup": {
    previousName: "Online booking setup",
    description: "Your services, hours, and calendar synced to online booking.",
    taxCode: TAX_TECH_SUPPORT,
  },
  "Platform · Stripe payments setup": {
    previousName: "Stripe payments setup",
    description: "Your Stripe account connected, products and checkout built.",
    taxCode: TAX_TECH_SUPPORT,
  },
  "Platform · Google Business Profile deep clean": {
    previousName: "Google Business Profile deep clean",
    description: "Photos, categories, and description brought up to scratch.",
    taxCode: TAX_ADVERTISING,
  },
  "Platform · Logo refresh": {
    previousName: "Logo refresh",
    description: "A refreshed logo for your business.",
    taxCode: TAX_ARTWORK,
  },
  "Platform · Care Plan": {
    previousName: "Care Plan",
    description:
      "Google review replies, listing posts, one small round of website changes a month, and priority on bigger work. Month to month.",
    taxCode: TAX_TECH_SUPPORT,
  },

  /* ── The coded track ─────────────────────────────────────────────────── */

  "Coded · Website build": {
    previousName: "Portfolio website build",
    description:
      "Five-page site built in real code, from your questionnaire answers.",
    taxCode: TAX_WEBSITE,
  },
  "Coded · Admin panel": {
    previousName: "Portfolio admin panel",
    description:
      "A private login for changing copy and swapping images yourself, no code involved.",
    taxCode: TAX_WEBSITE,
  },
  "Coded · Logo or wordmark refresh": {
    previousName: "Logo or wordmark refresh",
    description: "A refreshed mark for your name, for when you want one.",
    taxCode: TAX_ARTWORK,
  },
  "Coded · Extra page": {
    previousName: "Extra page (portfolio)",
    description:
      "An additional page beyond the included five. Priced per page.",
    taxCode: TAX_WEBSITE,
  },
  "Coded · Booking setup": {
    previousName: "Booking setup",
    description:
      "A booking page wired to your calendar, for coaching, teaching, or consults.",
    taxCode: TAX_TECH_SUPPORT,
  },
  "Coded · Animations": {
    previousName: "Animations",
    description:
      "Standard motion for your site, built with Framer Motion or similar.",
    taxCode: TAX_WEBSITE,
  },
  "Coded · Supabase setup": {
    previousName: "Supabase setup",
    description:
      "A database wired into your site, for logins, saved form entries, or anything else that needs to persist.",
    taxCode: TAX_TECH_SUPPORT,
  },
  "Coded · SEO blog": {
    previousName: "SEO blog",
    description:
      "A blog section built into your site, with its own admin for publishing posts without touching code.",
    taxCode: TAX_WEBSITE,
  },
  "Coded · Blog post, written for you": {
    previousName: "Blog post, written for you",
    description:
      "A blog post written from your own brain dump and tuned for the keywords you're chasing. Priced per post.",
    taxCode: TAX_EDITING,
  },
} as const;

export type StripeProductName = keyof typeof STRIPE_PRODUCTS;

/**
 * How one catalogue row appears in Stripe.
 *
 * `null` means the row is never minted: it exists in the database only. Today
 * that is `admin_test_payment` (its price is managed by hand and shared with
 * the build product) and `showcase_care_plan` (inactive by ruling, M-PORT-6).
 */
export type StripePlacement = {
  /** Which Stripe Product this row's Price hangs under. */
  product: StripeProductName;
  /** Price nickname. `--apply` matches an existing Price on this, so it is an identifier — changing it archives the old Price and mints a new one. */
  nickname: string;
  /** Env var suffix, printed by `yarn stripe:catalogue`. */
  env: string;
  recurring?: "month";
} | null;

export type CatalogueRow = NewProductRow & { stripe: StripePlacement };

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
  // 2026-09-02: the live Product this used to point at (prod_V6R7JCItyTRNEf)
  // fell out of `stripe.products.list({ active: true })` — most likely
  // archived by hand — so `--apply`'s name match missed it and minted a
  // fresh Product (prod_VBOcmkPsMEVYCg) instead of renaming in place. See the
  // note above `stripe_setup` and the naming-drift warning in PROGRESS.md:
  // the old Product is still sitting in Stripe, orphaned, under whatever it
  // was last named. Not touched here — `admin_test_payment` still points at
  // it on purpose (see below) until someone confirms it's safe to retire.
  deposit: {
    production: {
      productId: "prod_VBOcmkPsMEVYCg",
      priceId: "price_1UB1p8RzOAOTo9VYyiltJkcP",
    },
    sandbox: {
      productId: "prod_V6R7JCItyTRNEf",
      priceId: "price_1U6EesRvld9FSVemOl4zxS4H",
    },
  },
  balance: {
    production: {
      productId: "prod_VBOcmkPsMEVYCg",
      priceId: "price_1UB1p8RzOAOTo9VYf3zudYeI",
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
      priceId: "price_1UB1q8RzOAOTo9VYOYHFvVYr",
    },
    sandbox: {
      productId: "prod_V6RXi7jCBm4J2T",
      priceId: "price_1U6EeuRvld9FSVemHT3qNkHe",
    },
  },
  changes_small: {
    production: {
      productId: "prod_V6RYDP8KBMYQgE",
      priceId: "price_1UB1qARzOAOTo9VYQfG2fAAS",
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
      priceId: "price_1UB1qARzOAOTo9VY5oYWfT0b",
    },
    sandbox: {
      productId: "prod_V6RYDP8KBMYQgE",
      priceId: "price_1U6yZkRvld9FSVem7oVJG7BZ",
    },
  },
  // 2026-09-02: this Product is currently named "Platform • Extra page" in
  // Stripe (bullet, U+2022) instead of "Platform · Extra page" (middot,
  // U+00B7) — a legacy naming-bug leftover, not something changed here. Same
  // drift on `logo_refresh` below. The id still works for checkout; it's
  // `--apply`'s exact-name match that will fail next run and mint a
  // duplicate Product unless the name is fixed in the Stripe Dashboard
  // first (both modes) or `previousName` is taught the bullet spelling.
  extra_page: {
    production: {
      productId: "prod_V6RYwsWQE8ETyg",
      priceId: "price_1UB1qCRzOAOTo9VYl50U3yl0",
    },
    sandbox: {
      productId: "prod_V6RYwsWQE8ETyg",
      priceId: "price_1U6EevRvld9FSVemIBeTj5ix",
    },
  },
  booking_setup: {
    production: {
      productId: "prod_V6RY9mQsS8QrEg",
      priceId: "price_1UB1qERzOAOTo9VYFPr07aPg",
    },
    sandbox: {
      productId: "prod_V6RY9mQsS8QrEg",
      priceId: "price_1U6EewRvld9FSVemLlQStzEf",
    },
  },
  // Used to be the one exception where the Product id genuinely differed by
  // mode. As of 2026-09-02 production points at the same Product id as
  // sandbox (prod_V7D7M7cF18FFrt) — the old live-only Product
  // (prod_V7D8RvllCWIMmn) no longer turns up in the export, so the two have
  // converged like every other row below. There are also two Prices on this
  // Product with the same $250 amount: one with nickname "Setup" (used
  // here, matches `nickname: "Setup"` above) and one with a blank nickname
  // (leftover, unclaimed by `--apply`, will get retired on the next run).
  stripe_setup: {
    production: {
      productId: "prod_V7D7M7cF18FFrt",
      priceId: "price_1UB1qKRzOAOTo9VYR0pnQjDG",
    },
    sandbox: {
      productId: "prod_V7D7M7cF18FFrt",
      priceId: "price_1U6yhBRvld9FSVemUheh9bQU",
    },
  },
  gbp_clean: {
    production: {
      productId: "prod_V6RYSbrdKcvQ3a",
      priceId: "price_1UB1qGRzOAOTo9VYvAxt9Ifj",
    },
    sandbox: {
      productId: "prod_V6RYSbrdKcvQ3a",
      priceId: "price_1U6EexRvld9FSVem8N52tlLl",
    },
  },
  // Same bullet/middot naming drift as `extra_page` above — Stripe currently
  // has this Product named "Platform • Logo refresh".
  logo_refresh: {
    production: {
      productId: "prod_V6RY4TrZjUKBl7",
      priceId: "price_1UB1qHRzOAOTo9VYapHg5crL",
    },
    sandbox: {
      productId: "prod_V6RY4TrZjUKBl7",
      priceId: "price_1U6EeyRvld9FSVemn20fXJgo",
    },
  },
  care_plan: {
    production: {
      productId: "prod_V6RYGKzJwj41DY",
      priceId: "price_1UB1qJRzOAOTo9VYNmOpo3ps",
    },
    sandbox: {
      productId: "prod_V6RYGKzJwj41DY",
      priceId: "price_1U6EeyRvld9FSVemaupdv9py",
    },
  },

  /* ── The coded track (internal key: showcase) ────────────────────────────
     Bootstrapped 2026-09-02 from a `stripe:catalogue --apply` run's exports,
     the same way the platform track above is — these are not restated by
     hand from nothing, they were copied straight out of Stripe's own product
     and price CSV exports for both modes.

     Sandbox only has ids for the five rows below that were actually minted
     there so far (deposit/balance/full/negotiated-rate pair, admin panel,
     logo, booking, extra page); `showcase_animations`, `showcase_seo_blog`,
     `showcase_seo_post`, and `showcase_supabase_setup` seed with empty
     sandbox ids until `--apply` mints them there.

     `showcase_seo_blog`'s production Product exists twice in Stripe right
     now (prod_VBOdWxEXtPuVvV and prod_VBKdEcOdoXmeJs, both "Coded • SEO
     blog", same $750). This uses the more recently created one
     (prod_VBOdWxEXtPuVvV) — the other is an orphaned duplicate, not wired to
     anything, worth archiving in the Dashboard.

     `showcase_care_plan` is never minted at all (M-PORT-6): nothing recurring
     is sold on this track until the offer is settled. It seeds inactive.
     ──────────────────────────────────────────────────────────────────────── */
  showcase_deposit: {
    production: {
      productId: "prod_VBOX0d5lGhAwU1",
      priceId: "price_1UB1qVRzOAOTo9VYdhT7VrWA",
    },
    sandbox: {
      productId: "prod_VBOX0d5lGhAwU1",
      priceId: "price_1UB1k8Rvld9FSVemQRZAuwAr",
    },
  },
  // Stripe's nickname on this Price is "Balance — half to start" (matched
  // above), not "Balance — before launch" — kept as-is rather than
  // "corrected" against a live Price that already exists under that name.
  showcase_balance: {
    production: {
      productId: "prod_VBOX0d5lGhAwU1",
      priceId: "price_1UB1qVRzOAOTo9VYEcOueoG1",
    },
    sandbox: {
      productId: "prod_VBOX0d5lGhAwU1",
      priceId: "price_1UB1k8Rvld9FSVemAs9YbWJt",
    },
  },
  showcase_full: {
    production: {
      productId: "prod_VBOX0d5lGhAwU1",
      priceId: "price_1UB1qVRzOAOTo9VYhY8OO70H",
    },
    sandbox: {
      productId: "prod_VBOX0d5lGhAwU1",
      priceId: "price_1UB1k8Rvld9FSVemAmOmKJBH",
    },
  },
  showcase_deposit_1600: {
    production: {
      productId: "prod_VBOX0d5lGhAwU1",
      priceId: "price_1UB1qVRzOAOTo9VYoR0lxEpp",
    },
    sandbox: {
      productId: "prod_VBOX0d5lGhAwU1",
      priceId: "price_1UB1k8Rvld9FSVemaJYd6oUu",
    },
  },
  showcase_full_1600: {
    production: {
      productId: "prod_VBOX0d5lGhAwU1",
      priceId: "price_1UB1qVRzOAOTo9VYTee20kPu",
    },
    sandbox: {
      productId: "prod_VBOX0d5lGhAwU1",
      priceId: "price_1UB1k8Rvld9FSVemBfIDZkU0",
    },
  },
  showcase_admin_panel: {
    production: {
      productId: "prod_VBOXwrZLyhgovx",
      priceId: "price_1UB1qXRzOAOTo9VYlXpt1l63",
    },
    sandbox: {
      productId: "prod_VBOXwrZLyhgovx",
      priceId: "price_1UB1krRvld9FSVemk5SrNvxA",
    },
  },
  showcase_logo: {
    production: {
      productId: "prod_VBOYX0ElVxER6m",
      priceId: "price_1UB1qZRzOAOTo9VYyNH6LyLY",
    },
    sandbox: {
      productId: "prod_VBOYX0ElVxER6m",
      priceId: "price_1UB1loRvld9FSVemwQu6ifZ6",
    },
  },
  showcase_booking: {
    production: {
      productId: "prod_VBOa9Wg8Fly1dq",
      priceId: "price_1UB1qdRzOAOTo9VYAMBWdKHw",
    },
    sandbox: {
      productId: "prod_VBOa9Wg8Fly1dq",
      priceId: "price_1UB1nSRvld9FSVemMTyFX7xX",
    },
  },
  showcase_extra_page: {
    production: {
      productId: "prod_VBOZwXBtIMfkPH",
      priceId: "price_1UB1qaRzOAOTo9VY9CpE5JJD",
    },
    sandbox: {
      productId: "prod_VBOZwXBtIMfkPH",
      priceId: "price_1UB1meRvld9FSVem6EOiSq4W",
    },
  },
  // Not minted in sandbox yet. Its live Price also has no nickname, while
  // the catalogue row expects "Setup" — `--apply` will treat it as unclaimed
  // and mint a fresh, correctly-nicknamed Price next run, retiring this one.
  // The id still charges correctly today; it just won't survive an apply.
  showcase_animations: {
    production: {
      productId: "prod_VBKcpA4cRNRKg9",
      priceId: "price_1UB1qMRzOAOTo9VYWDuJbETi",
    },
    sandbox: {
      productId: "prod_VBKcpA4cRNRKg9",
      priceId: "price_1UAxxGRvld9FSVemrtTSxV3j",
    },
  },
  // Same blank-nickname situation as `showcase_animations` above.
  showcase_supabase_setup: {
    production: {
      productId: "prod_VBKcUI6zv0pkzI",
      priceId: "price_1UB1qORzOAOTo9VYIsHOY6IA",
    },
    sandbox: {
      productId: "prod_VBKcUI6zv0pkzI",
      priceId: "price_1UAxxZRvld9FSVemYPCzIsnZ",
    },
  },
  // See the duplicate-Product note above — this is the newer of the two.
  // Same blank-nickname situation as `showcase_animations` too.
  showcase_seo_blog: {
    production: {
      productId: "prod_VBOdWxEXtPuVvV",
      priceId: "price_1UB1qRRzOAOTo9VYYNCvIF8L",
    },
    sandbox: {
      productId: "prod_VBKdEcOdoXmeJs",
      priceId: "price_1UAxxyRvld9FSVemJrwEYsg1",
    },
  },
  showcase_seo_post: {
    production: {
      productId: "prod_VBKdgEuWyt5kqB",
      priceId: "price_1UB1qTRzOAOTo9VYNr2D6GuR",
    },
    sandbox: {
      productId: "prod_VBKdgEuWyt5kqB",
      priceId: "price_1UAxyLRvld9FSVemy1F1wn42",
    },
  },
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
export const CATALOGUE_ROWS: CatalogueRow[] = [
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
    stripe: {
      product: "Platform · Website build",
      nickname: "Deposit — half to start",
      env: "PRICE_DEPOSIT",
    },
    kind: "build",
    name: "Platform website build — deposit",
    description: "Half to start. The balance is due before the site goes live.",
    priceCents: 60000,
    offeredAtCheckout: false,
    sortOrder: 0,
  },
  {
    id: SEED_PRODUCT_IDS.balance,
    key: "balance",
    stripe: {
      product: "Platform · Website build",
      nickname: "Balance — before go-live",
      env: "PRICE_BALANCE",
    },
    kind: "build",
    name: "Platform website build — balance",
    description:
      "The second half, due before the site goes live on your domain.",
    priceCents: 60000,
    offeredAtCheckout: false,
    sortOrder: 1,
  },
  {
    id: SEED_PRODUCT_IDS.admin_test_payment,
    key: "admin_test_payment",
    stripe: null,
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
    stripe: {
      product: "Platform · Online booking setup",
      nickname: "Setup",
      env: "PRICE_BOOKING_SETUP",
    },
    kind: "addon",
    name: "Platform · Online booking setup",
    description:
      "Your services, hours, and one shared calendar synced so people book online.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 10,
  },
  {
    id: SEED_PRODUCT_IDS.stripe_setup,
    key: "stripe_setup",
    stripe: {
      product: "Platform · Stripe payments setup",
      nickname: "Setup",
      env: "PRICE_STRIPE_SETUP",
    },
    kind: "addon",
    name: "Platform · Stripe payments setup",
    description: "Your account connected, products and checkout built.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 11,
  },
  {
    id: SEED_PRODUCT_IDS.gbp_clean,
    key: "gbp_clean",
    stripe: {
      product: "Platform · Google Business Profile deep clean",
      nickname: "Deep clean",
      env: "PRICE_GBP_CLEAN",
    },
    kind: "addon",
    name: "Platform · Google Business Profile deep clean",
    description: "Photos, categories, and description brought up to scratch.",
    priceCents: 30000,
    offeredAtCheckout: true,
    sortOrder: 12,
  },
  {
    id: SEED_PRODUCT_IDS.logo_refresh,
    key: "logo_refresh",
    stripe: {
      product: "Platform · Logo refresh",
      nickname: "Refresh",
      env: "PRICE_LOGO",
    },
    kind: "addon",
    name: "Platform · Logo refresh",
    description: "A refreshed logo for your business.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 13,
  },
  {
    id: SEED_PRODUCT_IDS.extra_page,
    key: "extra_page",
    stripe: {
      product: "Platform · Extra page",
      nickname: "Per page",
      env: "PRICE_EXTRA_PAGE",
    },
    kind: "addon",
    name: "Platform · Extra page",
    // Quantity-shaped, so it is not offered at checkout: how many pages is
    // questionnaire material, not a pay-screen checkbox.
    description:
      "An additional page beyond the standard five. Priced per page.",
    priceCents: 15000,
    offeredAtCheckout: false,
    sortOrder: 20,
  },
  {
    id: SEED_PRODUCT_IDS.changes_standard,
    key: "changes_standard",
    stripe: {
      product: "Platform · Website changes — standard round",
      nickname: "Standard round",
      env: "PRICE_CHANGES_STANDARD",
    },
    kind: "round",
    name: "Platform · Website changes — standard round",
    description: "New sections, layout changes, rewritten copy, or a new page.",
    priceCents: 50000,
    offeredAtCheckout: false,
    sortOrder: 30,
  },
  {
    id: SEED_PRODUCT_IDS.changes_small,
    key: "changes_small",
    stripe: {
      product: "Platform · Website changes — small round",
      nickname: "Small round",
      env: "PRICE_CHANGES_SMALL",
    },
    kind: "round",
    name: "Platform · Website changes — small round",
    description: "A few text edits, swapping photos, updating hours.",
    priceCents: 25000,
    offeredAtCheckout: false,
    sortOrder: 31,
  },
  {
    id: SEED_PRODUCT_IDS.changes_small_promo,
    key: "changes_small_promo",
    stripe: {
      product: "Platform · Website changes — small round",
      nickname: "Included with build — promo",
      env: "PRICE_CHANGES_SMALL_PROMO",
    },
    kind: "round",
    name: "Small round of changes — included",
    // Granted by promo code only (TAYLOR_FREE_ITERATION_ROUND), never a
    // checkbox: a $0 row a client could tick themselves is a pricing bug,
    // not a deal-sweetener. See lib/intake/promo.ts.
    description:
      "One batch of small changes after launch, included with your build.",
    priceCents: 0,
    offeredAtCheckout: false,
    sortOrder: 32,
  },
  {
    id: SEED_PRODUCT_IDS.care_plan,
    key: "care_plan",
    stripe: {
      product: "Platform · Care Plan",
      nickname: "Monthly",
      env: "PRICE_CARE_PLAN",
      recurring: "month",
    },
    kind: "care_plan",
    name: "Platform · Care Plan",
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
    stripe: {
      product: "Coded · Website build",
      nickname: "Deposit — half to start",
      env: "PRICE_SHOWCASE_DEPOSIT",
    },
    kind: "build",
    track: "showcase",
    name: "Coded website build — deposit",
    description: "Half to start. The balance is due before launch.",
    priceCents: 100000,
    offeredAtCheckout: false,
    sortOrder: 100,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_balance,
    key: "showcase_balance",
    // Nickname reads "half to start" (not "before launch") to match the live
    // Stripe Price already minted under it — see the STRIPE_CATALOGUE_IDS
    // note on `showcase_balance`.
    stripe: {
      product: "Coded · Website build",
      nickname: "Balance — half to start",
      env: "PRICE_SHOWCASE_BALANCE",
    },
    kind: "build",
    track: "showcase",
    name: "Coded website build — balance",
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
    stripe: {
      product: "Coded · Website build",
      nickname: "Paid in full — 5% off",
      env: "PRICE_SHOWCASE_FULL",
    },
    kind: "build",
    track: "showcase",
    name: "Coded website build — paid in full",
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
    stripe: {
      product: "Coded · Website build",
      nickname: "Deposit — negotiated rate",
      env: "PRICE_SHOWCASE_DEPOSIT_1600",
    },
    kind: "build",
    track: "showcase",
    name: "Coded website build — deposit",
    description: "Half to start. The balance is due before launch.",
    priceCents: 80000,
    offeredAtCheckout: false,
    sortOrder: 103,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_full_1600,
    key: "showcase_full_1600",
    stripe: {
      product: "Coded · Website build",
      nickname: "Paid in full — negotiated rate",
      env: "PRICE_SHOWCASE_FULL_1600",
    },
    kind: "build",
    track: "showcase",
    name: "Coded website build — paid in full",
    description: "The whole build up front, 5% off.",
    // $1,500 flat — the negotiated Stripe Price, not the exact-5%-off math
    // ($1,520) the sibling rows follow. Matches the live Price's amount.
    priceCents: 150000,
    offeredAtCheckout: false,
    sortOrder: 104,
  },
  {
    // Ruled a live upsell by Taylor, 2026-08-26 (M-PORT-6).
    id: SEED_PRODUCT_IDS.showcase_admin_panel,
    key: "showcase_admin_panel",
    stripe: {
      product: "Coded · Admin panel",
      nickname: "Admin panel",
      env: "PRICE_SHOWCASE_ADMIN_PANEL",
    },
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
    stripe: {
      product: "Coded · Logo or wordmark refresh",
      nickname: "Refresh",
      env: "PRICE_SHOWCASE_LOGO",
    },
    kind: "addon",
    track: "showcase",
    name: "Logo / wordmark refresh",
    description:
      "Most sites like this don't need a logo; your name in good type usually does it better. This is for when you want the mark anyway.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 115,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_booking,
    key: "showcase_booking",
    stripe: {
      product: "Coded · Booking setup",
      nickname: "Setup",
      env: "PRICE_SHOWCASE_BOOKING",
    },
    kind: "addon",
    track: "showcase",
    name: "Booking setup",
    description:
      "A booking page wired to your calendar, for coaching, teaching, or consults. Honestly: you can set Cal.com up yourself in an afternoon — this is for skipping the afternoon.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 113,
  },
  {
    // Quantity-shaped, so it is never `offeredAtCheckout` — that flag means
    // "render a checkbox", and the question here is how many, not whether.
    // The pay screen resolves this row by key and renders a count instead
    // (Taylor, 2026-09-03, reversing PORT-9's Taylor-minted-only rule).
    id: SEED_PRODUCT_IDS.showcase_extra_page,
    key: "showcase_extra_page",
    stripe: {
      product: "Coded · Extra page",
      nickname: "Per page",
      env: "PRICE_SHOWCASE_EXTRA_PAGE",
    },
    kind: "addon",
    track: "showcase",
    name: "Extra page",
    description:
      "An additional page beyond the included five. Priced per page.",
    priceCents: 15000,
    offeredAtCheckout: false,
    sortOrder: 120,
  },
  {
    // Added 2026-09-01, per content/websites-coded.ts's addOns. Not yet
    // sellable — see the [NEEDS VALUE AT BUILD] note above.
    id: SEED_PRODUCT_IDS.showcase_animations,
    key: "showcase_animations",
    stripe: {
      product: "Coded · Animations",
      nickname: "Setup",
      env: "PRICE_SHOWCASE_ANIMATIONS",
    },
    kind: "addon",
    track: "showcase",
    name: "Animations",
    description:
      "Standard motion, built with Framer Motion or similar. Bigger asks can cost more, and you'll describe what you want in the intake form.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 114,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_supabase_setup,
    key: "showcase_supabase_setup",
    stripe: {
      product: "Coded · Supabase setup",
      nickname: "Setup",
      env: "PRICE_SHOWCASE_SUPABASE_SETUP",
    },
    kind: "addon",
    track: "showcase",
    name: "Supabase setup",
    description:
      "A database for your site when it needs one: logins, saved form entries, anything that has to persist beyond the pages themselves.",
    priceCents: 25000,
    offeredAtCheckout: true,
    sortOrder: 111,
  },
  {
    id: SEED_PRODUCT_IDS.showcase_seo_blog,
    key: "showcase_seo_blog",
    stripe: {
      product: "Coded · SEO blog",
      nickname: "Setup",
      env: "PRICE_SHOWCASE_SEO_BLOG",
    },
    kind: "addon",
    track: "showcase",
    name: "SEO blog",
    description:
      "A blog section built into your site, with its own admin so you can publish and manage posts without touching code.",
    priceCents: 75000,
    offeredAtCheckout: true,
    sortOrder: 112,
  },
  {
    // Quantity-shaped like extra_page above: how many posts is not a
    // pay-screen checkbox, so it is never `offeredAtCheckout` — the pay screen
    // resolves this row by key and renders a count.
    //
    // Unlike extra pages, the count is *gated*: the section does not exist
    // until `showcase_seo_blog` is ticked, because a post written for a site
    // with no blog is work the client cannot use. The rule lives in
    // `lib/intake/addon-bundles.ts` and is enforced in `createDepositCheckout`,
    // not only on the screen (Taylor, 2026-09-07, reversing the
    // Taylor-minted-only rule this row carried).
    id: SEED_PRODUCT_IDS.showcase_seo_post,
    key: "showcase_seo_post",
    stripe: {
      product: "Coded · Blog post, written for you",
      nickname: "Per post",
      env: "PRICE_SHOWCASE_SEO_POST",
    },
    kind: "addon",
    track: "showcase",
    name: "Blog post, written for you",
    description:
      "You brain-dump what you know, I turn it into a polished post tuned for the keywords you're chasing. Priced per post.",
    priceCents: 50000,
    offeredAtCheckout: false,
    sortOrder: 121,
  },
  {
    // Present but dark. Taylor's ruling: "don't charge for the maintenance
    // care plan until it's done" (M-PORT-6). Inactive and unoffered means it
    // renders nowhere and appears in no total; the v2 doc's row copy waits in
    // that document for the day this flips. No Stripe object exists for it.
    id: SEED_PRODUCT_IDS.showcase_care_plan,
    key: "showcase_care_plan",
    stripe: null,
    kind: "care_plan",
    track: "showcase",
    isActive: false,
    name: "Care plan",
    description:
      "Email me a change, it's live within 48 hours — plus I keep the underlying software current.",
    priceCents: 10000,
    offeredAtCheckout: false,
    sortOrder: 130,
  },
];

/**
 * Writes every row above into `products`.
 *
 * Exported rather than run on import: `setup-stripe-catalogue.ts` imports this
 * module for `CATALOGUE_ROWS` and `STRIPE_PRODUCTS`, and a top-level call here
 * would seed the database as a side effect of asking what the catalogue is.
 * `scripts/db-seed.ts` is the entry point.
 */
export async function seedProducts(): Promise<void> {
  const tier = resolveAppTier();
  const stripeMode = credentialSet(tier) === "LIVE" ? "production" : "sandbox";
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
