import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { requireEnv } from "@/lib/env";

/**
 * The migration client. Tooling only — never import this at runtime.
 *
 * Migrations need a direct session connection (port 5432), not the transaction
 * pooler: DDL and advisory locks do not survive pooled multiplexing. `max: 1`
 * keeps the migration serial, which is what the migrator expects.
 *
 * Taylor runs migrations. An agent authors the SQL and the journal entry and
 * stops there — see `docs/intake/specs/README.md`.
 */
export function createMigrateClient() {
  const sql = postgres(requireEnv("DIRECT_DATABASE_URL"), {
    max: 1,
    prepare: false,
  });

  return { db: drizzle(sql), sql };
}
