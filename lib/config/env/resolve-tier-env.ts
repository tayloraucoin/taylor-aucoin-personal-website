/**
 * Collapses tier-specific environment variables into canonical names.
 *
 * Mirrors the Conscious Connections pattern — `buildSupabaseEnvForNextConfig`
 * in `packages/auth/src/env.ts` and `buildDatabaseEnvForNextConfig` in
 * `packages/db` — where the tier is resolved exactly once, in
 * `next.config.ts`, and everything downstream reads canonical names only.
 *
 * The application does not know that staging or live exist. It asks for
 * `STRIPE_SECRET_KEY` and gets whichever key this deployment was configured
 * with. That is the whole point: one decision, in one file, rather than a
 * decision repeated at every call site where it could be made differently.
 *
 * Scripts run outside Next and therefore outside its `env` block, so they
 * apply the same collapse themselves — see `scripts/_env.ts`.
 */

export type AppTier = "local" | "staging" | "live";

/**
 * Which set of credentials this build runs against.
 *
 * `APP_ENVIRONMENT` wins when set. Otherwise Vercel decides: a production
 * deployment is live, anything else on Vercel is staging, and a machine with
 * no `VERCEL_ENV` at all is local.
 *
 * Nothing unrecognised resolves to live. A typo in `APP_ENVIRONMENT` lands on
 * staging, where the failure is loud and nobody is charged.
 */
export function resolveAppTier(env: NodeJS.ProcessEnv = process.env): AppTier {
  const explicit = env.APP_ENVIRONMENT?.trim().toLowerCase();
  if (explicit === "live" || explicit === "staging" || explicit === "local") {
    return explicit;
  }

  if (env.VERCEL_ENV === "production") return "live";
  if (env.VERCEL_ENV) return "staging";

  return env.NODE_ENV === "development" ? "local" : "staging";
}

/**
 * Local runs against the staging projects.
 *
 * Same rule as CC, whose auth env resolves local to the staging Supabase
 * project: a second set of test credentials for one developer's laptop is
 * infrastructure nobody maintains, and it drifts. The one exception is the
 * Stripe webhook secret, which `stripe listen` mints per session and which
 * cannot be shared with a deployed environment.
 */
function credentialTier(tier: AppTier): "staging" | "live" {
  return tier === "live" ? "live" : "staging";
}

/**
 * Where Stripe sends a client back to, and what goes in emailed links.
 *
 * Tiered like everything else, and for a reason that already bit once: with a
 * single `NEXT_PUBLIC_SITE_URL` set to the production domain, a test payment
 * made on localhost redirected to the live site — which has a different
 * database and therefore no idea the engagement exists.
 *
 * Local never falls back to a configured production value. It resolves to
 * localhost or nothing, so that mistake cannot be made again by leaving a
 * variable set. Staging borrows Vercel's own deployment URL when it has one,
 * so preview deploys work with no configuration at all.
 */
function resolveSiteUrl(
  env: NodeJS.ProcessEnv,
  tier: AppTier,
): string | undefined {
  if (tier === "local") {
    return (
      env.NEXT_PUBLIC_SITE_URL_LOCAL?.trim() ||
      `http://localhost:${env.PORT?.trim() || "3000"}`
    );
  }

  if (tier === "staging") {
    return (
      env.NEXT_PUBLIC_SITE_URL_STAGING?.trim() ||
      (env.VERCEL_URL?.trim() ? `https://${env.VERCEL_URL.trim()}` : undefined)
    );
  }

  return (
    env.NEXT_PUBLIC_SITE_URL_LIVE?.trim() || env.NEXT_PUBLIC_SITE_URL?.trim()
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
 * The canonical environment for a given tier, ready to spread into
 * `next.config.ts`'s `env` block.
 *
 * Only non-empty values are emitted. A variable that is genuinely unset stays
 * unset rather than becoming an empty string, so `requireEnv` can still tell
 * the difference and fail with something useful.
 */
export function buildIntakeEnvForNextConfig(
  env: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const tier = resolveAppTier(env);
  const out: Record<string, string> = { APP_TIER: tier };

  /** `T` is the credential set this tier borrows: LIVE or STAGING. */
  const T = credentialTier(tier).toUpperCase();

  const set = (name: string, from: string) => {
    const value = env[from]?.trim();
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

  const siteUrl = resolveSiteUrl(env, tier);
  if (siteUrl) out.NEXT_PUBLIC_SITE_URL = siteUrl.replace(/\/+$/, "");

  return out;
}
