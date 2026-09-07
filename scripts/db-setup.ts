import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { applyTierEnv } from "./_env";

applyTierEnv();

/**
 * Runs every file in `db/supabase/setup/` against `DATABASE_URL`, in order.
 *
 * These files carry the things Drizzle migrations cannot: row-level security,
 * role revokes, and the storage buckets. Until now they were a manual
 * copy-paste into the SQL editor, documented in a tech scope and therefore
 * skipped — which is exactly how a working tree ended up with no `intake`
 * bucket, discarding every page the ingestion step had fetched, and no
 * `PRIVATE` bucket, losing every invoice PDF archive (2026-09-05).
 *
 * **Every file must be idempotent**, because this is expected to be run again
 * after each migration rather than once. They already are: guarded `do $$`
 * blocks, `on conflict do update`, and `if not exists` throughout.
 *
 * This does not replace `yarn db:migrate` and does not run it. Schema is
 * Drizzle's; this is the part of the database Drizzle does not own.
 */
const SETUP_DIR = path.join(process.cwd(), "db", "supabase", "setup");

async function main(): Promise<void> {
  const files = (await readdir(SETUP_DIR))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("Nothing to run — no .sql files in db/supabase/setup.");
    return;
  }

  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is not set.");

  // `simple: true` — these files contain multiple statements and dollar-quoted
  // blocks, which the extended protocol will not accept in one round trip.
  const sql = postgres(url, { prepare: false, max: 1 });

  try {
    for (const file of files) {
      const text = await readFile(path.join(SETUP_DIR, file), "utf8");
      process.stdout.write(`· ${file} … `);
      await sql.unsafe(text);
      console.log("ok");
    }
  } finally {
    await sql.end({ timeout: 5 });
  }

  console.log(`\nRan ${files.length} setup file(s).`);
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
