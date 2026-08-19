import { defineConfig } from "drizzle-kit";
import { buildIntakeEnvForNextConfig } from "./lib/config/env/resolve-tier-env";
import { readEnv } from "./lib/env";

// drizzle-kit runs outside Next, so the tier collapse has to happen here too.
Object.assign(process.env, buildIntakeEnvForNextConfig(process.env));

/**
 * Drizzle Kit configuration.
 *
 * `readEnv` rather than `requireEnv` on purpose: `drizzle-kit generate` diffs
 * the schema against the committed snapshot and needs no database at all, so
 * an agent can author a migration with no credentials present. `migrate` does
 * need one, and fails loudly at connect time when the variable is empty.
 *
 * `schemaFilter` keeps generation to `public` — Supabase owns `auth`,
 * `storage`, `realtime`, and `vault`, and Drizzle must never emit DDL for
 * them.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  schemaFilter: ["public"],
  dbCredentials: { url: readEnv("DIRECT_DATABASE_URL") ?? "" },
  strict: true,
  verbose: true,
});
