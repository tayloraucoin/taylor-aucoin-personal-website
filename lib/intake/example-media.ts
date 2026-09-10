import { requireEnv } from "@/lib/env";

/**
 * Where a taste-gallery capture lives, and what its URL is.
 *
 * Split out of `server/services/example-captures.ts` because that module is
 * `server-only` — correctly, since it holds the service-role key — and the seed
 * importer is a script that runs outside Next. Both need to agree about exactly
 * one thing: the key a capture is written to. Two copies of that string is how
 * an importer silently writes to a prefix nothing reads from.
 *
 * Pure strings and one environment read. No client, no key, no transport.
 */

/**
 * The bucket captures live in — **infrastructure, not a code fact**.
 *
 * This was the literal `"public"` and the warning above it said to check the
 * casing if uploads ever failed with "Bucket not found". They did, on the first
 * production seed (2026-09-07), and the warning turned out to understate the
 * problem: bucket ids are case-sensitive *and the two projects disagree*.
 * Staging holds one bucket named `public`; production holds `PUBLIC` and
 * `PRIVATE`. No literal is correct in both, so a note telling the next person
 * to edit the line was never going to hold — every edit breaks the other tier.
 *
 * Read per tier instead, the way `invoices.ts` already reads its archive
 * bucket. The default is staging's name, because that is the value this
 * constant had and an unset variable should not change what any environment
 * did yesterday.
 *
 * The **public** bucket rather than the private one: these are screenshots of
 * public websites shown to every client who reaches the taste step. Signed URLs
 * would expire under a gallery of twenty-four images, and `next/image` would
 * cache an optimised copy keyed on a URL that later stops working. A client's
 * own uploads keep going to the private intake bucket, and the two promises
 * stay separate (M-PORT-45).
 */
export function captureBucket(): string {
  return process.env.SUPABASE_PUBLIC_BUCKET?.trim() || "public";
}

/** Taylor's layout inside that bucket. */
export const CAPTURE_PREFIX = "sites/examples";

/**
 * The key one capture is written to.
 *
 * **Supabase storage has no directories.** A path is a single flat key, and the
 * folders the dashboard draws are the console splitting keys on slashes. So
 * nothing has to exist before a file is written under a new site's prefix, and
 * nothing is left behind when the last file under one is removed. There is no
 * sub-directory to create, ever — writing the key is what brings the "folder"
 * into being.
 */
export function capturePathFor(slug: string, filename: string): string {
  return `${CAPTURE_PREFIX}/${slug}/${filename}`;
}

/**
 * The URL a client's browser loads a capture from.
 *
 * Built rather than stored: the project host differs between staging and
 * production, and a URL baked into a row at upload time would point at the
 * wrong project the moment that row was copied between them.
 */
export function captureUrlFor(storagePath: string): string {
  return `${requireEnv("SUPABASE_URL")}/storage/v1/object/public/${captureBucket()}/${storagePath}`;
}
