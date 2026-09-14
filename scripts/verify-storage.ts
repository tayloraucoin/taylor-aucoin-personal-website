import { createClient } from "@supabase/supabase-js";
import { archiveBucket } from "@/server/services/invoices";
import { intakeBucket } from "@/server/services/submission";
import { captureBucket } from "@/lib/intake/example-media";
import { applyTierEnv, currentTier } from "./_env";

/**
 * Confirms the three storage buckets this app reads actually exist, for
 * whichever tier `APP_ENVIRONMENT` resolves to (unset → local, which borrows
 * staging's credentials — see `resolveAppTier`).
 *
 * Every bucket-name reader is imported rather than repeated as a literal, so
 * this cannot drift from what the app actually calls `storage.from()` with —
 * the same reasoning `db-setup.ts` follows for the SQL it runs.
 *
 * Read-only. This never creates, deletes, or flips a bucket — that decision
 * is Taylor's, made in the dashboard or `yarn db:setup` (`intake` only, and
 * never against production). What silently created its own storage on first
 * request would also silently hide the next misconfiguration.
 *
 * Nothing here prints a storage path, a filename, a token, or an engagement
 * id — bucket ids are infrastructure vocabulary, not client content.
 *
 * PORT-H5: this bucket set was missing entirely on staging from the moment
 * `intake` was created on production (2026-09-12) until Taylor created it
 * there too (2026-09-14) — two days where every upload and the voice note
 * failed on localhost. Run this before trusting either tier again.
 */

type Expected = { id: string; public: boolean; usedBy: string };

function expectedBuckets(): Expected[] {
  return [
    { id: intakeBucket(), public: false, usedBy: "client uploads, voice notes, fetched link sources" },
    { id: archiveBucket(), public: false, usedBy: "archived invoice PDFs" },
    { id: captureBucket(), public: true, usedBy: "taste-gallery example-site captures" },
  ];
}

async function main(): Promise<void> {
  applyTierEnv();

  const tier = currentTier();
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  console.log(`Tier: ${tier}`);

  if (!url || !key) {
    console.error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY did not resolve for this tier. " +
        "Check the tier variables in .env.local — see .env.example.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Project: ${new URL(url).hostname}`);
  console.log("");

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await sb.storage.listBuckets();

  if (error) {
    console.error(`Could not list buckets: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const byId = new Map(data.map((b) => [b.id, b] as const));
  let failed = false;

  for (const expected of expectedBuckets()) {
    const found = byId.get(expected.id);

    if (!found) {
      console.error(`  MISSING      ${expected.id}  (${expected.usedBy})`);
      failed = true;
      continue;
    }

    if (found.public !== expected.public) {
      console.error(
        `  WRONG FLAG   ${expected.id}  expected public=${expected.public}, ` +
          `is public=${found.public}  (${expected.usedBy})`,
      );
      failed = true;
      continue;
    }

    console.log(`  ok           ${expected.id}  public=${found.public}  (${expected.usedBy})`);
  }

  console.log("");

  if (failed) {
    console.error(
      "One or more expected buckets are missing or misconfigured. " +
        "Bucket creation and flags are Taylor's call — see intakeBucket()'s " +
        "docblock in server/services/submission.ts and docs/websites/specs/PORT-H5-storage-buckets-by-tier.md.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("All expected buckets present with the expected flags.");
}

main();
