/** True when `NODE_ENV` is `development` (local `next dev`). */
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Every server-side variable the intake system reads. The union is the point:
 * a typo becomes a type error instead of a runtime `undefined` that only shows
 * up on a client's phone.
 *
 * `NEXT_PUBLIC_SITE_URL` is here because the server composes absolute links
 * with it (emails, Stripe return URLs, the CLI's printed link). Client code
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
  | "STRIPE_PRICE_DEPOSIT"
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_URL";

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

  const value = process.env[name];
  return value === undefined || value === "" ? null : value;
}

/** Reads a server variable, or throws naming the one that is missing. */
export function requireEnv(name: ServerEnvVar): string {
  const value = readEnv(name);

  if (value === null) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example.`,
    );
  }

  return value;
}
