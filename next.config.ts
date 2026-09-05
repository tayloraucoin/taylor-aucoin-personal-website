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
 * The tier collapse, run once and pushed into `process.env` before anything
 * below reads a canonical name.
 *
 * `buildIntakeEnvForNextConfig` *produces* `SUPABASE_URL` from
 * `SUPABASE_STAGING_URL` or `SUPABASE_LIVE_URL`; the canonical name does not
 * exist in the environment until it runs. Assigning the result here — the same
 * two lines `drizzle.config.ts` uses, for the same reason — is what lets
 * `remotePatterns` below read `SUPABASE_URL` at all. Without it that read is
 * `undefined` and the image host silently goes unconfigured, which surfaces
 * much later as a runtime error on a page that renders a stored capture.
 */
const tierEnv = buildIntakeEnvForNextConfig();
Object.assign(process.env, tierEnv);

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
/**
 * The one remote image host: this tier's Supabase storage.
 *
 * Derived rather than hardcoded, so staging and production each allow their own
 * project with no branch — and scoped to the public object route, so the
 * optimizer is not a proxy for anything else in the bucket.
 *
 * **It says so when it cannot resolve, rather than returning nothing.** The
 * first version of this returned `[]` on a missing variable, reasoning that a
 * type-check needs no credentials. What that actually did was turn a
 * configuration mistake into a runtime crash on the admin page that renders
 * stored captures, with an error naming `next/image` rather than the missing
 * env var. A build with no credentials still works — the warning is a warning —
 * but it is now impossible for this to fail quietly.
 */
function supabaseImagePattern(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const raw = process.env.SUPABASE_URL;

  if (!raw) {
    console.warn(
      "next.config: SUPABASE_URL did not resolve, so no remote image host is configured. Stored captures will fail to render. Check the tier variables in .env.local.",
    );
    return [];
  }

  try {
    return [
      {
        protocol: "https",
        hostname: new URL(raw).hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    console.warn(`next.config: SUPABASE_URL is not a URL (${raw}).`);
    return [];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * The build directory is overridable so a second Next process can run
   * against this repo without destroying the first one's.
   *
   * `next build` clears and rewrites `.next` — including the manifests a
   * running `next dev` re-reads on every request. Running a build while a dev
   * server is up leaves that server alive but serving `ENOENT` on every route,
   * which reads like a crash and needs a restart. Agent-driven runs set
   * `NEXT_DIST_DIR` (see `dev:agent` / `build:agent`) so they get their own
   * directory and cannot touch the one iTerm is using.
   *
   * Unset everywhere else, so Vercel and a plain `yarn dev` still use `.next`.
   */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  experimental: { optimizePackageImports: ["motion"] },
  // Screenshots are where AVIF pays off hardest — large flat UI regions.
  // Next defaults to WebP only; AVIF is tried first and WebP is the fallback.
  //
  // `remotePatterns` covers exactly one host: this project's Supabase storage,
  // where the taste gallery's captures live. **Derived from `SUPABASE_URL`**
  // rather than hardcoded, so staging and production each allow their own
  // project with no branch — the tier collapse above has already run.
  //
  // The pathname is scoped to the public object route so the optimizer is not a
  // proxy for anything else in the bucket. This one host is the whole reason a
  // pasted image URL is *copied* into storage rather than referenced: an
  // optimizer pointed at arbitrary hosts is an open image proxy (M-PORT-45).
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseImagePattern(),
  },

  env: tierEnv,

  /**
   * The vendored PDF fonts are read from disk at runtime by
   * `server/services/invoice-pdf.tsx`. Nothing imports them, so Vercel's
   * file tracer cannot see them and would ship a function that throws on the
   * first invoice. Naming them here is what puts them in the bundle.
   */
  outputFileTracingIncludes: {
    "/api/webhooks/stripe": ["./server/assets/fonts/**"],
    // The call sheet is read from disk at request time by the queue page
    // (D-CRM-28). Same reasoning as the fonts above: nothing imports it, so
    // the tracer cannot infer it, and call mode would render an empty script
    // column in production while working perfectly in dev.
    "/admin/queue": ["./docs/crm/CALL-SHEET.md"],
  },
};

export default nextConfig;
