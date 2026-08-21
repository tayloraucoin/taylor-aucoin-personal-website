/**
 * Collapses tier-specific environment variables into canonical names.
 *
 * Mirrors the Conscious Connections pattern — `buildSupabaseEnvForNextConfig`
 * in `packages/auth/src/env.ts` and `buildDatabaseEnvForNextConfig` in
 * `packages/db` — where the tier is resolved exactly once, in
 * `next.config.ts`, and everything downstream reads canonical names only.
 *
 * The application does not know that staging or production exist. It asks for
 * `STRIPE_SECRET_KEY` and gets whichever key this deployment was configured
 * with. That is the whole point: one decision, in one file, rather than a
 * decision repeated at every call site where it could be made differently.
 *
 * Reads `process.env` directly and takes no argument. The single source is the
 * process environment, and a parameter would only invite a caller to pass
 * something else — which is exactly how a test can pass while the real thing
 * is broken.
 */

export type AppTier = "local" | "staging" | "production";

/**
 * Set `APP_ENVIRONMENT` explicitly: `local`, `staging`, or `production`.
 *
 * Vercel carries `APP_ENVIRONMENT=production`. A machine with nothing set is
 * a laptop, so it defaults to `local` — and because local borrows the staging
 * credentials, forgetting to set it can never reach the production database.
 */
export function resolveAppTier(): AppTier {
  const value = process.env.APP_ENVIRONMENT?.trim().toLowerCase();

  if (value === "production" || value === "staging" || value === "local") {
    return value;
  }

  return "local";
}

/**
 * Local runs against the staging projects.
 *
 * Same rule as CC, whose auth env resolves local to the staging Supabase
 * project: a third set of credentials for one developer's laptop is
 * infrastructure nobody maintains, and it drifts. The one exception is the
 * Stripe webhook secret, which `stripe listen` mints per session and which
 * cannot be shared with a deployed environment.
 */
export function credentialSet(tier: AppTier): "LIVE" | "STAGING" {
  return tier === "production" ? "LIVE" : "STAGING";
}

/**
 * Where Stripe sends a client back to, and what goes in emailed links.
 *
 * Tiered for a reason that already bit once: with a single site URL set to the
 * production domain, a test payment made on localhost redirected to the live
 * site — which has a different database and had never heard of the engagement.
 *
 * Local resolves to localhost and deliberately ignores any configured
 * production value, so leaving a variable set cannot reproduce that.
 */
function resolveSiteUrl(tier: AppTier): string | undefined {
  if (tier === "local") {
    return (
      process.env.NEXT_PUBLIC_SITE_URL_LOCAL?.trim() ||
      `http://localhost:${process.env.PORT?.trim() || "3000"}`
    );
  }

  if (tier === "staging") {
    return (
      process.env.NEXT_PUBLIC_SITE_URL_STAGING?.trim() ||
      (process.env.VERCEL_URL?.trim()
        ? `https://${process.env.VERCEL_URL.trim()}`
        : undefined)
    );
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL_LIVE?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim()
  );
}

const PRICE_KEYS = [
  "DEPOSIT",
  "BALANCE",
  "CHANGES_STANDARD",
  "CHANGES_SMALL",
  "EXTRA_PAGE",
  "BOOKING_SETUP",
  "GBP_CLEAN",
  "LOGO",
  "CARE_PLAN",
] as const;

/**
 * The canonical environment for this process, ready to spread into
 * `next.config.ts`'s `env` block.
 *
 * Only non-empty values are emitted. A variable that is genuinely unset stays
 * unset rather than becoming an empty string, so `requireEnv` can still tell
 * the difference and fail with something useful.
 */
export function buildIntakeEnvForNextConfig(): Record<string, string> {
  const tier = resolveAppTier();
  const out: Record<string, string> = { APP_TIER: tier };

  /** The credential set this tier borrows: LIVE or STAGING. */
  const T = credentialSet(tier);

  const set = (name: string, from: string) => {
    const value = process.env[from]?.trim();
    if (value) out[name] = value;
  };

  set("DATABASE_URL", `DATABASE_${T}_URL`);
  set("DIRECT_DATABASE_URL", `DIRECT_${T}_DATABASE_URL`);

  set("SUPABASE_URL", `SUPABASE_${T}_URL`);
  set("SUPABASE_SERVICE_ROLE_KEY", `SUPABASE_${T}_SERVICE_ROLE_KEY`);

  set("STRIPE_PUBLISHABLE_KEY", `STRIPE_${T}_PUBLISHABLE_KEY`);
  set("STRIPE_SECRET_KEY", `STRIPE_${T}_SECRET_KEY`);

  // The one value local does not borrow from staging: `stripe listen` mints a
  // secret per session, and a deployed endpoint's secret will never match it.
  set(
    "STRIPE_WEBHOOK_SECRET",
    tier === "local" ? "STRIPE_LOCAL_WEBHOOK_SECRET" : `STRIPE_${T}_WEBHOOK_SECRET`,
  );

  for (const key of PRICE_KEYS) {
    set(`STRIPE_PRICE_${key}`, `STRIPE_${T}_PRICE_${key}`);
  }

  const siteUrl = resolveSiteUrl(tier);
  if (siteUrl) out.NEXT_PUBLIC_SITE_URL = siteUrl.replace(/\/+$/, "");

  return out;
}
