/**
 * A stable id for one entry in a repeatable block.
 *
 * Files uploaded inside an entry need to know which entry they belong to, and
 * an entry has no database identity — it is a member of a JSONB array. So the
 * key is minted here, client-side, when the entry is added, stored beside it in
 * the answers document, and copied onto each `intake_files` row (M-PORT-3).
 *
 * Array position cannot do this job: removing the first of three projects
 * would silently re-point the second project's stills at the third.
 *
 * Twelve characters of `crypto.getRandomValues` — collision-proof at the scale
 * of one questionnaire, short enough to read in a database row, and generated
 * without a dependency. Never regenerated for an entry that already has one:
 * a changed key orphans that entry's files.
 */
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function mintEntryKey(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);

  let key = "";
  for (const byte of bytes) key += ALPHABET[byte % ALPHABET.length];
  return key;
}

/** The key an entry already carries, or a fresh one. */
export function entryKeyOf(entry: { entryKey?: string }): string {
  return entry.entryKey ?? mintEntryKey();
}
