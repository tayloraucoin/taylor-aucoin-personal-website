/**
 * Newest-first ordering for entries whose only date is a client's own prose.
 *
 * `year` (projects) and `when` (experience, pieces) are free text by design —
 * the extractor copies the client's own time expression verbatim ('2019-now',
 * 'March', 'by autumn', '2027') rather than composing one (`extract.ts`, the
 * "date or period field" rule). So a chronological sort has to read a year out
 * of prose, and be honest about the entries where it cannot.
 *
 * This is the only place in the codebase that reads a year out of one of
 * these fields. Everything that wants newest-first order — the fast way, the
 * step-1 ingest merge, the top-five candidate rows — calls through here
 * (PORT-33).
 */

const OPEN_ENDED = /\b(now|present|current|ongoing|today)\b/i;
const FOUR_DIGIT_YEAR = /\b(?:19|20)\d{2}\b/g;

/**
 * The most recent four-digit year (1900-2099) named in a date or period
 * string, or `null` when none can be read.
 *
 * A range reads as its later end ('Fall 2020 – Spring 2021' → 2021,
 * '2018/2019' → 2019) — the largest year mentioned, never an average or the
 * first one written. An **open-ended** range ('2019-now', '1999–present')
 * reads as the current year plus one half, so it sorts above a closed range
 * that happens to end this year: still going beats already finished.
 *
 * A bare word boundary keeps a five-digit run ('20180') from being misread as
 * a year with a stray trailing digit — it returns `null`, same as prose with
 * no date in it at all ('March').
 */
export function yearOf(text: string | undefined | null): number | null {
  if (!text) return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  if (OPEN_ENDED.test(trimmed)) {
    return new Date().getFullYear() + 0.5;
  }

  const matches = trimmed.match(FOUR_DIGIT_YEAR);
  if (!matches || matches.length === 0) return null;

  return Math.max(...matches.map(Number));
}

/**
 * Entries newest first, by whatever date string `dateOf` reads off each one.
 *
 * Entries with no readable year are never dropped and never guessed at —
 * they keep their relative order and move to the end, after every dated
 * entry. Ties (same year, or two undated entries) keep their original
 * relative order: this is a stable sort, made explicit with an index
 * tie-break rather than relied upon from `Array.prototype.sort`.
 *
 * Pure and synchronous. Called on **entries arriving** — a fast-way batch
 * before it is appended, an ingest-run batch before it is merged, a set of
 * rows before they render — never on an array already at rest in the answers
 * document. Re-sorting a list the client has already seen would be editing
 * their answer because something else changed, which D-PORT-3 forbids.
 */
export function sortNewestFirst<T>(
  entries: readonly T[],
  dateOf: (entry: T) => string | undefined,
): T[] {
  return entries
    .map((entry, index) => ({ entry, index, year: yearOf(dateOf(entry)) }))
    .sort((a, b) => {
      if (a.year === null && b.year === null) return a.index - b.index;
      if (a.year === null) return 1;
      if (b.year === null) return -1;
      if (a.year !== b.year) return b.year - a.year;
      return a.index - b.index;
    })
    .map((w) => w.entry);
}
