import { mintEntryKey } from "./entry-key";
import { sortNewestFirst } from "./entry-order";

/**
 * How machine-produced entries land on a list the client already holds.
 *
 * One home for a rule that used to live in four near-copies — the three
 * steps' `onEntries` handlers and `mergeIngestion` — and that each of them got
 * slightly differently. The laws, all mechanical here:
 *
 * - **Existing entries are never touched.** Not reordered, not edited, not
 *   removed. A client's corrections are theirs (D-PORT-3, PORT-5).
 * - **Incoming entries arrive newest first** (PORT-33), read off `year` or
 *   `when`.
 * - **An incoming entry that is already on the list is dropped.** Running
 *   "Sort this for me" twice on the same paste used to double the list — 76
 *   projects where there were 34, every one of them twice and some three
 *   times (Taylor, 2026-09-14). A second run now adds only what is new.
 *   Identity is the name and the date, normalised; see `entryIdentity`.
 * - **Blank invitation cards are dropped first**, so a fresh batch never
 *   lands below an empty row.
 */

type Entry = Record<string, unknown>;

/**
 * True when an entry holds anything at all.
 *
 * The repeatable block keeps one empty card as an invitation, and appending
 * after it would leave a blank row wedged between real ones.
 */
export function entryHasContent(entry: Entry): boolean {
  return Object.entries(entry).some(
    ([key, value]) =>
      key !== "entryKey" && typeof value === "string" && value.trim() !== "",
  );
}

function text(entry: Entry, key: string): string {
  const value = entry[key];
  return typeof value === "string" ? value : "";
}

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** The date field an entry carries, whichever shape it is. */
export function entryDate(entry: Entry): string | undefined {
  return text(entry, "year") || text(entry, "when") || undefined;
}

/**
 * What makes two entries "the same thing", or `null` when nothing does.
 *
 * The name — `title` for a project or piece, `name` for a person, offering,
 * or service, `what` for an experience line — plus `where` and the date.
 * Case, surrounding space, and runs of space are ignored; nothing else is.
 * Two projects with the same title and a different year are two projects (a
 * remake, a sequel with the same name); the same title and no year at all on
 * either is one. An entry with no name cannot be a duplicate of anything.
 */
export function entryIdentity(entry: Entry): string | null {
  const name = normalise(
    text(entry, "title") || text(entry, "name") || text(entry, "what"),
  );
  if (!name) return null;

  // Joined on a byte no field can contain, so "a b" + "c" and "a" + "b c"
  // stay two different identities.
  return [
    name,
    normalise(text(entry, "where")),
    normalise(entryDate(entry) ?? ""),
  ].join("\u0000");
}

/**
 * How much a client (or the machine) has filled in — the dedupe tie-breaker,
 * and the base a caller adds its file count to.
 */
export function entryRichness(entry: Entry): number {
  return Object.entries(entry).filter(
    ([key, value]) =>
      key !== "entryKey" &&
      ((typeof value === "string" && value.trim() !== "") ||
        (Array.isArray(value) && value.length > 0) ||
        typeof value === "boolean"),
  ).length;
}

/**
 * The list with every duplicate removed, keeping the richest copy of each.
 *
 * Order is preserved: the survivor of a group sits where the group's first
 * member sat. Among copies, the one with the most filled fields wins, and a
 * tie goes to the earliest — which is the copy the client has had longest and
 * is most likely to have corrected. Entries with no identity are never
 * removed.
 *
 * Files are keyed to an entry (`intake_files.entry_key`), so callers that
 * hold uploads should pass `weight` to make the copy with images win; the
 * default weighs fields only.
 */
export function dedupeEntries<T extends Entry>(
  entries: readonly T[],
  weight: (entry: T) => number = entryRichness,
): T[] {
  const bestByIdentity = new Map<string, number>();

  entries.forEach((entry, index) => {
    const identity = entryIdentity(entry);
    if (identity === null) return;

    const current = bestByIdentity.get(identity);
    if (current === undefined || weight(entry) > weight(entries[current]!)) {
      bestByIdentity.set(identity, index);
    }
  });

  const survivors = new Set(bestByIdentity.values());

  // Survivors go where their group first appeared, so removing copies never
  // reads as a reorder.
  const firstIndexByIdentity = new Map<string, number>();
  entries.forEach((entry, index) => {
    const identity = entryIdentity(entry);
    if (identity !== null && !firstIndexByIdentity.has(identity)) {
      firstIndexByIdentity.set(identity, index);
    }
  });

  return entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry, index }) => {
      const identity = entryIdentity(entry);
      return identity === null || survivors.has(index);
    })
    .sort((a, b) => {
      const ai = entryIdentity(a.entry);
      const bi = entryIdentity(b.entry);
      const aPos = ai === null ? a.index : (firstIndexByIdentity.get(ai) ?? a.index);
      const bPos = bi === null ? b.index : (firstIndexByIdentity.get(bi) ?? b.index);
      return aPos - bPos || a.index - b.index;
    })
    .map(({ entry }) => entry);
}

/**
 * Lands a batch on a list. Returns the untouched `kept` entries and the
 * `added` ones — newest first, deduplicated against `kept` and against each
 * other, each carrying a fresh key — so a caller that records provenance
 * (`mergeIngestion`) knows exactly which rows are new.
 */
export function mergeIncomingEntries<T extends Entry>(
  existing: readonly T[],
  incoming: readonly T[],
): { kept: T[]; added: (T & { entryKey: string })[] } {
  const kept = existing.filter(entryHasContent);
  const present = new Set(
    kept.map(entryIdentity).filter((id): id is string => id !== null),
  );

  const fresh = dedupeEntries(
    sortNewestFirst(incoming.filter(entryHasContent), entryDate),
  ).filter((entry) => {
    const identity = entryIdentity(entry);
    return identity === null || !present.has(identity);
  });

  return {
    kept,
    added: fresh.map((entry) => ({ ...entry, entryKey: mintEntryKey() })),
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   List actions (PORT-34)
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * One thing a client can do to a whole list from its ⋮ menu.
 *
 * Pure: `apply` returns the next array and the block commits it, exactly as a
 * Move or a Remove does. `disabledReason` is a sentence rather than a boolean
 * because a menu item that is greyed out with no explanation reads as broken;
 * the block shows the reason as the item's label.
 */
export type ListAction<T> = {
  key: string;
  label: string;
  disabledReason: (items: readonly T[]) => string | null;
  apply: (items: readonly T[]) => T[];
  /** What the live region says once it has run. */
  announce: (before: readonly T[], after: readonly T[]) => string;
};

/**
 * The two actions every coded-track block carries.
 *
 * **Sort by date is the one place the app re-sorts answers a client already
 * holds** — and only because they pressed it. Every other sort in this module
 * touches arriving entries alone (D-PORT-3). Running "Sort this for me" a
 * second time is *not* a way to ask for this, and never was; that is what
 * doubled Taylor's list on 2026-09-14.
 *
 * **Remove duplicates keeps the copy with images.** `weight` is the caller's
 * because only the step knows which uploads belong to which entry; a project
 * with three stills must survive over the same project typed twice. Without a
 * weight the richest copy by field count wins.
 *
 * [COPY — draft, pending Taylor] on the four strings.
 */
export function standardListActions<T extends Entry>(options: {
  weight?: (item: T) => number;
} = {}): ListAction<T>[] {
  return [
    {
      key: "sort-by-date",
      label: "Sort by date, newest first",
      disabledReason: (items) =>
        items.filter((item) => entryDate(item)).length < 2
          ? "Nothing to sort by date yet"
          : null,
      apply: (items) => sortNewestFirst(items, entryDate),
      announce: () => "Sorted, newest first.",
    },
    {
      key: "remove-duplicates",
      label: "Remove duplicates",
      disabledReason: (items) =>
        dedupeEntries(items, options.weight).length === items.length
          ? "No duplicates"
          : null,
      apply: (items) => dedupeEntries(items, options.weight),
      announce: (before, after) => {
        const n = before.length - after.length;
        return `Removed ${n} duplicate${n === 1 ? "" : "s"}.`;
      },
    },
  ];
}
