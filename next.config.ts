import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { buildIntakeEnvForNextConfig } from "./lib/config/env/resolve-tier-env";

/**
 * `.env.local` has to be loaded before the env block is built.
 *
 * Next reads this file *before* it loads any `.env*`, so `process.env` is
 * still bare at this point and every tier variable would resolve to
 * `undefined`. `loadEnvConfig` populates them first. Same call, for the same
 * reason, as Conscious Connections' `apps/marketing/next.config.ts`.
 */
loadEnvConfig(path.dirname(fileURLToPath(import.meta.url)));

/**
 * Staging and production credentials are collapsed here, once.
 *
 * Everything downstream reads canonical names — `STRIPE_SECRET_KEY`,
 * `DATABASE_URL` — and has no idea a tier exists. One decision in one file,
 * rather than the same decision repeated wherever a key happens to be needed.
 *
 * These are baked into the build, so **rotating a secret means redeploying** —
 * the tradeoff for having no runtime branch that could pick the wrong one.
 * Nothing client-side imports `lib/env.ts`, which is what keeps the
 * service-role key and Stripe secret out of the browser bundle.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ["motion"] },
  // Screenshots are where AVIF pays off hardest — large flat UI regions.
  // Next defaults to WebP only; AVIF is tried first and WebP is the fallback.
  images: { formats: ["image/avif", "image/webp"] },

  env: buildIntakeEnvForNextConfig(),

  /**
   * The vendored PDF fonts are read from disk at runtime by
   * `server/services/invoice-pdf.tsx`. Nothing imports them, so Vercel's
   * file tracer cannot see them and would ship a function that throws on the
   * first invoice. Naming them here is what puts them in the bundle.
   */
  outputFileTracingIncludes: {
    "/api/webhooks/stripe": ["./server/assets/fonts/**"],
  },
};

export default nextConfig;
