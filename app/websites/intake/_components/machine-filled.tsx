"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  canonicalEntry,
  type IngestedField,
} from "@/lib/intake/ingestion-record";

/**
 * The mark that says a value came from the machine, not from the client.
 *
 * **This is what makes pre-filling honest rather than a forgery of someone's
 * own words** (PORT-18, M-PORT-33). The ingestion run writes answers into
 * their real steps by Taylor's instruction, which removes the seen-first law
 * PORT-10 held at field granularity. What replaces it is this: every value the
 * run wrote is visibly attributed, with the sentence it rests on, until the
 * client touches it.
 *
 * **Clearing is a comparison, not a write.** The mark renders while the field's
 * current value still equals what the machine wrote. The moment a client edits
 * it the two differ and the mark is gone — no event, no flag, no second save
 * that could fail and leave a stale mark behind. Typing the machine's words
 * back brings it back, which is honest: the value really is the machine's.
 *
 * **Absence is the safe default.** A tree with no provider — every durable
 * route, every preview, every engagement that has never run the step — has no
 * marks and renders exactly as it did before this file existed. Preview is the
 * one worth naming: the admin review surface has no engagement and therefore no
 * record, so it shows the questions rather than one client's filled-in answers.
 *
 * Lives beside `Field`, its main consumer, rather than in `components/intake/`:
 * `preview-mode.tsx` is there because two app trees mount it, and this one is
 * mounted only by the coded track's step page.
 */

type Marks = {
  /** Keyed by field key, for a step's own text answers. */
  byField: ReadonlyMap<string, IngestedField>;
  /** Keyed by entry key, for one entry inside a repeatable block. */
  byEntry: ReadonlyMap<string, IngestedField>;
};

const NONE: Marks = { byField: new Map(), byEntry: new Map() };

const MachineFilledContext = createContext<Marks>(NONE);

/**
 * Mounts one step's marks. Given nothing, mounts nothing.
 *
 * The step page reads the run's record and passes the fields belonging to the
 * step being rendered, so a step the run never touched costs an empty map.
 */
export function IngestionMarksProvider({
  fields,
  children,
}: Readonly<{ fields: readonly IngestedField[]; children: ReactNode }>) {
  const value = useMemo<Marks>(() => {
    if (fields.length === 0) return NONE;

    const byField = new Map<string, IngestedField>();
    const byEntry = new Map<string, IngestedField>();
    for (const field of fields) {
      if (field.entryKey) byEntry.set(field.entryKey, field);
      else byField.set(field.fieldKey, field);
    }
    return { byField, byEntry };
  }, [fields]);

  return (
    <MachineFilledContext.Provider value={value}>
      {children}
    </MachineFilledContext.Provider>
  );
}

/**
 * Compared trimmed on both sides.
 *
 * The schema trims what it stores and a textarea does not trim what it holds,
 * so an exact comparison would drop the mark the moment a client's cursor left
 * a trailing space behind. A space is not an edit.
 */
function matches(written: string, current: unknown): boolean {
  return typeof current === "string" && current.trim() === written.trim();
}

/**
 * The record for one field, or null once the client has made it theirs.
 *
 * Null is the overwhelmingly common answer — most fields on most steps were
 * never machine-filled — so the check is a map lookup before it is a string
 * comparison.
 */
export function useMachineFilled(
  fieldKey: string | undefined,
  current: unknown,
): IngestedField | null {
  const { byField } = useContext(MachineFilledContext);
  if (!fieldKey) return null;

  const field = byField.get(fieldKey);
  if (!field) return null;
  return matches(field.value, current) ? field : null;
}

/** The same, for one entry in a repeatable block. */
export function useMachineFilledEntry(
  entryKey: string | undefined,
  entry: Record<string, unknown>,
): IngestedField | null {
  const { byEntry } = useContext(MachineFilledContext);
  if (!entryKey) return null;

  const field = byEntry.get(entryKey);
  if (!field) return null;
  return field.value === canonicalEntry(entry) ? field : null;
}

/**
 * The treatment, defined once and reused at every pre-filled field.
 *
 * A mono line in the eyebrow register, in `--color-proof-label` — the
 * deliberately non-interactive twin of the gold accent (DESIGN-SYSTEM §1), so
 * the mark reads as attribution rather than as something to press. Under it,
 * the sentence it came from, in the same idiom `StepProposals` uses for a
 * quote: a hairline rule, dim, italic.
 *
 * No badge, no icon, no colour outside the palette, and nothing styled as a
 * warning. A machine-filled value is not the client's mistake and not ours; it
 * is a draft of their own words waiting to be corrected.
 */
function sourceLine(source: IngestedField["source"]): string {
  if (!source) return "Filled in from what you sent";
  return source.transcribed
    ? `Filled in from ${source.name}, as we read it`
    : `Filled in from ${source.name}`;
}

export function MachineFilled({
  field,
}: Readonly<{ field: IngestedField | null }>) {
  if (!field) return null;

  return (
    <div className="mt-2">
      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-proof-label)">
        {/* [COPY — pending Taylor] — three readings, and the difference
            between them is real. The client's own paste is the strongest
            provenance there is. A file we unzipped and read gives its exact
            words. A file a model read for us does not, and saying "as we read
            it" is the only honest way to put a value the client should check
            against the original. */}
        {sourceLine(field.source)}
      </p>

      {field.quote ? (
        <p className="mt-1.5 border-l border-(--color-faint) pl-3 font-body text-[13.5px] font-light italic leading-[1.5] text-(--color-dim)">
          {field.quote}
        </p>
      ) : (
        <p className="mt-1.5 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
          {/* [COPY — pending Taylor] */}
          A guess from what you sent, not something you said.
        </p>
      )}
    </div>
  );
}

/**
 * The mark for one repeatable entry, rendered once at the top of its card.
 *
 * Per entry rather than per field inside it: the run writes a whole entry at
 * once, an entry is what the client reads as a unit, and a mark on each of a
 * project's eleven fields would be eleven copies of one fact.
 */
export function MachineFilledEntry({
  entryKey,
  entry,
}: Readonly<{ entryKey: string | undefined; entry: Record<string, unknown> }>) {
  const field = useMachineFilledEntry(entryKey, entry);
  if (!field) return null;

  return (
    <p className="mb-3 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-proof-label)">
      {/* [COPY — pending Taylor] */}
      {sourceLine(field.source)} — check it over
    </p>
  );
}
