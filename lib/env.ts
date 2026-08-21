/** True when `NODE_ENV` is `development` (local `next dev`). */
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Every server-side variable this app reads.
 *
 * These are canonical names with no tier in them, and that is deliberate: the
 * staging/live decision is made once in `next.config.ts` (see
 * `lib/config/env/resolve-tier-env.ts`) and this module only ever sees the
 * value that decision produced. Nothing here can pick the wrong environment,
 * because nothing here knows there is a choice.
 *
 * `NEXT_PUBLIC_SITE_URL` is here because the server composes absolute links
 * with it (emails, Stripe return URLs, the printed intake link). Client code
 * that ever needs it must still write the literal `process.env.NEXT_PUBLIC_*`
 * reference — Next only inlines literals into the browser bundle, which is why
 * `lib/config.ts` reads `NEXT_PUBLIC_GA_ID` directly rather than through here.
 */
export type ServerEnvVar =
  | "CRON_SECRET"
  | "DATABASE_URL"
  | "DIRECT_DATABASE_URL"
  | "INTAKE_LINK_KEY"
  | "INTAKE_NOTIFY_EMAIL"
  | "NEXT_PUBLIC_SITE_URL"
  | "RESEND_API_KEY"
  | "STRIPE_PUBLISHABLE_KEY"
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_URL";

/**
 * Read as static literals, one per case, rather than `process.env[name]`.
 *
 * Next's `env` block works by replacing literal `process.env.FOO` references
 * at build time. A dynamic lookup is invisible to that replacement and would
 * quietly resolve to `undefined` in a built app — so the switch is load-bearing,
 * not stylistic. Reading inside the function rather than into a module-level
 * map also keeps scripts working, since they populate `process.env` after
 * import (see `scripts/_env.ts`).
 */
function rawValue(name: ServerEnvVar): string | undefined {
  switch (name) {
    case "CRON_SECRET":
      return process.env.CRON_SECRET;
    case "DATABASE_URL":
      return process.env.DATABASE_URL;
    case "DIRECT_DATABASE_URL":
      return process.env.DIRECT_DATABASE_URL;
    case "INTAKE_LINK_KEY":
      return process.env.INTAKE_LINK_KEY;
    case "INTAKE_NOTIFY_EMAIL":
      return process.env.INTAKE_NOTIFY_EMAIL;
    case "NEXT_PUBLIC_SITE_URL":
      return process.env.NEXT_PUBLIC_SITE_URL;
    case "RESEND_API_KEY":
      return process.env.RESEND_API_KEY;
    case "STRIPE_PUBLISHABLE_KEY":
      return process.env.STRIPE_PUBLISHABLE_KEY;
    case "STRIPE_SECRET_KEY":
      return process.env.STRIPE_SECRET_KEY;
    case "STRIPE_WEBHOOK_SECRET":
      return process.env.STRIPE_WEBHOOK_SECRET;
    case "SUPABASE_SERVICE_ROLE_KEY":
      return process.env.SUPABASE_SERVICE_ROLE_KEY;
    case "SUPABASE_URL":
      return process.env.SUPABASE_URL;
  }
}

/**
 * Reads a server variable, or `null` when it is unset.
 *
 * Throws outright in the browser. None of these values may reach a client
 * bundle, and a loud error in development is how a mistaken import gets caught
 * before it becomes a leaked service-role key.
 */
export function readEnv(name: ServerEnvVar): string | null {
  if (typeof window !== "undefined") {
    throw new Error(
      `${name} is server-only. Something imported lib/env.ts into client code.`,
    );
  }

  const value = rawValue(name)?.trim();
  return value === undefined || value === "" ? null : value;
}

/** Reads a server variable, or throws naming the one that is missing. */
export function requireEnv(name: ServerEnvVar): string {
  const value = readEnv(name);

  if (value === null) {
    throw new Error(
      `Missing ${name} for APP_TIER=${process.env.APP_TIER ?? "unset"}. ` +
        `Set the tier-specific variable it collapses from — see .env.example.`,
    );
  }

  return value;
}

/**
 * A Stripe Price id.
 *
 * Also collapsed in `next.config.ts`: a `price_…` minted in test mode does not
 * exist in live, so the tier chooses which set of ids this build carries.
 */
export type StripePriceKey =
  | "DEPOSIT"
  | "BALANCE"
  | "CHANGES_STANDARD"
  | "CHANGES_SMALL"
  | "EXTRA_PAGE"
  | "BOOKING_SETUP"
  | "GBP_CLEAN"
  | "LOGO"
  | "CARE_PLAN";

function rawPrice(key: StripePriceKey): string | undefined {
  switch (key) {
    case "DEPOSIT":
      return process.env.STRIPE_PRICE_DEPOSIT;
    case "BALANCE":
      return process.env.STRIPE_PRICE_BALANCE;
    case "CHANGES_STANDARD":
      return process.env.STRIPE_PRICE_CHANGES_STANDARD;
    case "CHANGES_SMALL":
      return process.env.STRIPE_PRICE_CHANGES_SMALL;
    case "EXTRA_PAGE":
      return process.env.STRIPE_PRICE_EXTRA_PAGE;
    case "BOOKING_SETUP":
      return process.env.STRIPE_PRICE_BOOKING_SETUP;
    case "GBP_CLEAN":
      return process.env.STRIPE_PRICE_GBP_CLEAN;
    case "LOGO":
      return process.env.STRIPE_PRICE_LOGO;
    case "CARE_PLAN":
      return process.env.STRIPE_PRICE_CARE_PLAN;
  }
}

export function requirePriceId(key: StripePriceKey): string {
  const value = rawPrice(key)?.trim();

  if (!value) {
    throw new Error(
      `Missing STRIPE_PRICE_${key} for APP_TIER=${process.env.APP_TIER ?? "unset"}. ` +
        `Run \`yarn stripe:catalogue --apply\` against that tier and set the printed ids.`,
    );
  }

  return value;
}

/**
 * Whether Checkout sessions ask Stripe Tax to add GST.
 *
 * Deliberately opt-in via `STRIPE_TAX_CHECKOUT=true`: with no head-office
 * address or active registration, `automatic_tax` silently collects zero
 * while looking normal, and past charges cannot be corrected retroactively
 * (docs/AGORA-STRIPE.md). Flip it only after `taxReadiness()` reports ready
 * and a test charge shows GST actually collected.
 */
export function stripeTaxEnabled(): boolean {
  return process.env.STRIPE_TAX_CHECKOUT?.trim().toLowerCase() === "true";
}

/**
 * Whether the admin test-payment price may replace the deposit at checkout.
 *
 * Deliberately opt-in via `ADMIN_TEST_PAYMENT=true`, and still requires
 * `?admin_test_payment=1` on the intake link — the env var alone is not enough.
 * Set per Vercel environment; flip off on production after smoke-testing.
 */
export function adminTestPaymentEnabled(): boolean {
  return process.env.ADMIN_TEST_PAYMENT?.trim().toLowerCase() === "true";
}

/**
 * Agora's GST/HST registration number, for invoice emails.
 *
 * CRA requires it on invoices over $100 when the supplier is registered —
 * without it a client cannot claim their input tax credit. Optional here so
 * staging can run without one, but a live invoice email without it is flagged
 * to ops by the invoice service.
 */
export function agoraGstNumber(): string | null {
  return process.env.AGORA_GST_NUMBER?.trim() || null;
}
