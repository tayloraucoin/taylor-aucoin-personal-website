import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { requireEnv } from "@/lib/env";
import * as schema from "./schema";

/**
 * The runtime database client. Created once, here, and nowhere else.
 *
 * `prepare: false` is mandatory: `DATABASE_URL` points at Supabase's
 * transaction pooler (port 6543), which multiplexes connections and cannot
 * carry prepared statements across them.
 *
 * Nothing outside `db/` and `server/services/` may import this. Reads of
 * engagement data go through `requireEngagement` in
 * `server/services/engagement.ts` — one door, so there is one place where
 * access is checked (M-INT-8).
 *
 * The connection is lazy so that importing this module during a build, or in a
 * script that only needs types, does not require a live database.
 */
let client: ReturnType<typeof createClient> | null = null;

function createClient() {
  const sql = postgres(requireEnv("DATABASE_URL"), { prepare: false });
  return drizzle(sql, { schema });
}

export function getDb() {
  client ??= createClient();
  return client;
}
