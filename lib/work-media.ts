/**
 * Case-study media lives only in the live project's public `PUBLIC` bucket and
 * is the same asset on every tier, so the URL is pinned rather than tier-derived
 * (unlike captureUrlFor). Public bucket -> unauthenticated URL, no secret.
 */
const WORK_MEDIA_BASE =
  "https://hfejudilalqxbewyfeoj.supabase.co/storage/v1/object/public/PUBLIC";

export function workMediaUrl(storagePath: string): string {
  return `${WORK_MEDIA_BASE}/${storagePath.replace(/^\/+/, "")}`;
}
