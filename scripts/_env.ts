import { loadEnvConfig } from "@next/env";
import {
  buildIntakeEnvForNextConfig,
  resolveAppTier,
} from "@/lib/config/env/resolve-tier-env";

/**
 * Gives a script the same view of the world the app has.
 *
 * Scripts run outside Next, so they get neither its `.env` loading nor its
 * `env` block. Without this they would read canonical names that nothing had
 * populated and fail with everything unset.
 *
 * Import and call it before anything that reads configuration:
 *
 *   import { applyTierEnv } from "./_env";
 *   applyTierEnv();
 */
export function applyTierEnv(): void {
  loadEnvConfig(process.cwd());
  Object.assign(process.env, buildIntakeEnvForNextConfig());
}

/** The tier in force, for scripts that announce what they are about to touch. */
export function currentTier(): string {
  return resolveAppTier();
}
