import { buildIntakeEnvForNextConfig, resolveAppTier } from "@/lib/config/env/resolve-tier-env";

/**
 * Applies the same staging/live collapse that `next.config.ts` does.
 *
 * Scripts run outside Next, so they never see its `env` block — without this
 * they would read canonical names that nothing had populated and fail with
 * everything unset. Importing this first gives a script the identical view of
 * the world the app has.
 *
 * Import it before anything that reads configuration:
 *
 *   import { applyTierEnv } from "./_env";
 *   applyTierEnv();
 */
export function applyTierEnv(): void {
  Object.assign(process.env, buildIntakeEnvForNextConfig(process.env));
}

/** The tier in force, for scripts that announce what they are about to touch. */
export function currentTier(): string {
  return resolveAppTier(process.env);
}
