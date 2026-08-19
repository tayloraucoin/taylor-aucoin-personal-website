import type { NextConfig } from "next";
import { buildIntakeEnvForNextConfig } from "./lib/config/env/resolve-tier-env";

/**
 * Staging and live credentials are collapsed here, once.
 *
 * Everything downstream reads canonical names — `STRIPE_SECRET_KEY`,
 * `DATABASE_URL` — and has no idea a tier exists. Following the Conscious
 * Connections pattern (`apps/marketing/next.config.ts` spreading
 * `buildSupabaseEnvForNextConfig` and `buildDatabaseEnvForNextConfig`): one
 * decision in one file, rather than the same decision repeated wherever a key
 * happens to be needed.
 *
 * These are baked into the build, so **rotating a secret means redeploying** —
 * the tradeoff for having no runtime branch that could pick the wrong one.
 * Nothing client-side imports `lib/env.ts`, which is what keeps the
 * service-role key and Stripe secret out of the browser bundle; if a client
 * component ever needs a value from here, it needs a public one instead.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ["motion"] },
  // Screenshots are where AVIF pays off hardest — large flat UI regions.
  // Next defaults to WebP only; AVIF is tried first and WebP is the fallback.
  images: { formats: ["image/avif", "image/webp"] },

  env: buildIntakeEnvForNextConfig(),
};

export default nextConfig;
