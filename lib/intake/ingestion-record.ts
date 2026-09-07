import { mintEntryKey } from "./entry-key";
import type { PrimerProposal } from "./primer-proposal";

/**
 * What the ingestion run wrote, and the proof it wrote it (PORT-18).
 *
 * Lives in `lib/` for the reason `primer-proposal.ts` does: the service that
 * produces it, the store that persists it, the step page that reads it, and
 * the mark that renders it all share the shape and none may own it. No
 * framework, DOM, or transport binding here.
 *
 * **This is the provenance that makes writing answers honest.** PORT-10 never
 * wrote an answer; every value it produced stayed a proposal until the client
 * took it. PORT-18 writes values into their real steps by Taylor's instruction,
 * and this record is what remains of the seen-first law: for every value the
 * machine wrote, which field, what it wrote, and the sentence it rests on. The
 * machine-filled mark compares a field's current value to `value` here and
 * shows while they still match — editing clears it by construction, with no
 * extra write. The intake document lists what is still unedited at submission.
 *
 * The record sits at the answers document's top-level `ingestion` key, beside
 * `primer`, for the reason M-PORT-26 gives: a top-level key is invisible to the
 * intake document's step loop by construction, and `saveStepAnswers` cannot
 * touch it.
 */

/**
 * Which of the run's sources a value came from (PORT-21).
 *
 * Absent means the client's own paste, which is the strongest provenance the
 * run has: they typed it. Present means a file or a page, and `transcribed`
 * separates the two kinds of reading — a DOCX unzipped here is the document's
 * exact words, while a PDF or an image is a *model's* reading of it, which the
 * quote validator cannot distinguish from the real thing because it is the
 * text the validator checks against.
 *
 * That is why this rides on every value rather than being logged once per run:
 * the mark says "as we read it" only where a machine did the reading, and the
 * client is the one who can tell whether the reading was right.
 */
export type IngestedSource = {
  /** The filename or the URL. What the client will recognise. */
  name: string;
  /** True only when a model produced the text this value rests on. */
  transcribed: boolean;
};

/** One value the run wrote, and where it came from. */
export type IngestedField = {
  stepKey: string;
  /** The step field, or the array key for a repeatable entry. */
  fieldKey: string;
  /** Set for a repeatable entry; the whole entry is the unit of provenance. */
  entryKey?: string;
  /**
   * What the machine wrote. For a text field, the string. For an entry, the
   * entry's fields as canonical JSON (keys sorted, `entryKey` omitted), so the
   * mark can compare the current entry to it in one string comparison.
   */
  value: string;
  /** The sentence in the source that supports it. Null on an assumed value or an entry. */
  quote: string | null;
  /** True only on the three licensed non-critical fields (PORT-10's allowlist). */
  assumed: boolean;
  /** Absent when the value came from the client's own paste. */
  source?: IngestedSource;
};

/**
 * How the run ended.
 *
 * `ran`: every stage returned. `partial`: at least one stage failed and the
 * rest wrote. `refused`: every stage returned and none of them had anything
 * usable to write. All three lock the step — a refusal is still a run, or the
 * one-shot rule would be a lie.
 */
export type IngestionStatus = "ran" | "partial" | "refused";

/** The pipeline stages, by the array or inventory each one fills. */
export type IngestionStage =
  | "fields"
  | "experience"
  | "projects"
  | "offerings"
  | "pieces"
  | "services";

export type IngestionRecord = {
  status: IngestionStatus;
  /** ISO 8601. */
  ranAt: string;
  /** How much text the run read. Size, never content. */
  sourceChars: number;
  /** sha-256 of the trimmed source, so a later reader can tell which paste this was. */
  sourceDigest: string;
  fields: IngestedField[];
  /** Stages that threw. Named so the summary can say what did not land. */
  failed: IngestionStage[];
  /**
   * Sources the run left out because the total would have been too large
   * (PORT-21). Named rather than counted, so the summary can tell the client
   * which of their files Taylor will be reading instead of the run.
   */
  omitted?: string[];
  /**
   * Sources that were still being read when the run went ahead (PORT-21).
   *
   * Different from `omitted` and it deserves its own sentence: an omitted file
   * was too much to read alongside everything else, while one of these was
   * simply not finished. Both end the same way — Taylor reads it — but only
   * one of them was the client pressing too soon, and the copy says so without
   * blaming them for it.
   */
  notReady?: string[];
};

/**
 * A set of entries bound for one repeatable block, before keys are minted.
 *
 * `stage` is the answer key the entries land under, and for every model stage
 * it is also the extraction mode's name — which is what
 * `EXTRACTION_MODES` is for. `"accounts"` is the one member that no model
 * produces: the links a client typed on step 1 are turned into step 10's
 * accounts by `accountsFromLinks`, arithmetic rather than a stage, and it rides
 * this same shape because the merge it needs is identical.
 */
export type EntryBatch = {
  stage: Exclude<IngestionStage, "fields"> | "accounts";
  stepKey: "experience" | "work" | "access";
  entries: Record<string, string>[];
};

/**
 * One body of text the run reads, and where it came from.
 *
 * The paste is a source like any other so that everything downstream — the
 * ceiling, the attribution, the summary — has one shape to handle rather than
 * a special case for the one the client typed.
 */
export type IngestionSource = {
  /** The filename or URL, or null for the client's own paste. */
  name: string | null;
  text: string;
  /** True when a model produced this text rather than a person typing it. */
  transcribed: boolean;
};

/** What the service returns and the store persists. */
export type IngestionOutcome = {
  fields: PrimerProposal[];
  batches: EntryBatch[];
  failed: IngestionStage[];
  sourceChars: number;
  sourceDigest: string;
  /**
   * Sources left out because the run's total would have been too large, named
   * so the summary can say which and the client can see nothing vanished
   * quietly. Whole sources, never a truncated one.
   */
  omitted?: string[];
  /** Sources still being read when the run went ahead. */
  notReady?: string[];
  /** Per-proposal provenance, keyed by field key. Absent for the paste. */
  attribution?: Record<string, IngestedSource>;
};

/** The stored record, or null for an engagement that has never run it. */
export function readIngestionRecord(answers: unknown): IngestionRecord | null {
  const document = (answers ?? {}) as Record<string, unknown>;
  const raw = document.ingestion;
  if (!raw || typeof raw !== "object") return null;

  const r = raw as Partial<IngestionRecord>;
  if (r.status !== "ran" && r.status !== "partial" && r.status !== "refused") {
    return null;
  }

  return {
    status: r.status,
    ranAt: typeof r.ranAt === "string" ? r.ranAt : "",
    sourceChars: typeof r.sourceChars === "number" ? r.sourceChars : 0,
    sourceDigest: typeof r.sourceDigest === "string" ? r.sourceDigest : "",
    fields: Array.isArray(r.fields) ? (r.fields as IngestedField[]) : [],
    failed: Array.isArray(r.failed) ? (r.failed as IngestionStage[]) : [],
    ...(Array.isArray(r.omitted) ? { omitted: r.omitted as string[] } : {}),
    ...(Array.isArray(r.notReady) ? { notReady: r.notReady as string[] } : {}),
  };
}

/** The record's fields for one step, for the mark. */
export function ingestedFor(
  record: IngestionRecord | null,
  stepKey: string,
): IngestedField[] {
  return record ? record.fields.filter((f) => f.stepKey === stepKey) : [];
}

/**
 * An entry as the mark compares it: keys sorted, blanks and `entryKey` out.
 *
 * Sorted so the JSON the store wrote and the JSON a re-render produces agree
 * regardless of the order a form happened to assign fields in. Blanks out so a
 * client focusing and leaving a field they did not change does not clear the
 * mark on the whole entry.
 */
export function canonicalEntry(entry: Record<string, unknown>): string {
  const kept = Object.entries(entry)
    .filter(
      ([key, value]) =>
        key !== "entryKey" && typeof value === "string" && value.trim() !== "",
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => [key, (value as string).trim()]);
  return JSON.stringify(Object.fromEntries(kept));
}

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * True when an entry holds anything at all. The repeatable block keeps one
 * empty card as an invitation, and appending after it would leave a blank row
 * wedged between real ones — the same filter the step components apply.
 */
function entryHasContent(entry: Record<string, unknown>): boolean {
  return Object.entries(entry).some(
    ([key, value]) =>
      key !== "entryKey" && typeof value === "string" && value.trim() !== "",
  );
}

/**
 * The merge, pure: what each touched step's object becomes, and the provenance
 * of every value written.
 *
 * Two laws, both mechanical here rather than promised in a prompt:
 *
 * - **A client's own words are never overwritten.** A text field is written
 *   only when it is blank. A value proposed for an answered field is dropped
 *   and does not appear in the record either — nothing claims to have written
 *   what it did not.
 * - **Arrays are appended to, never replaced.** Existing entries keep their
 *   keys and their order; extracted ones follow, each with a fresh key. Blank
 *   invitation cards are dropped first, as the steps do on their own re-runs.
 *
 * Takes the steps' *current* objects rather than reading the answers document
 * itself, so the store can hand it what it read under a row lock and the eval
 * can hand it fixtures.
 */
export function mergeIngestion(
  current: Record<string, Record<string, unknown>>,
  outcome: IngestionOutcome,
): {
  patch: Record<string, Record<string, unknown>>;
  fields: IngestedField[];
} {
  const patch: Record<string, Record<string, unknown>> = {};
  const fields: IngestedField[] = [];
  const stepObject = (stepKey: string) =>
    (patch[stepKey] ??= { ...(current[stepKey] ?? {}) });

  for (const proposal of outcome.fields) {
    const object = stepObject(proposal.stepKey);
    if (!isBlank(object[proposal.fieldKey])) continue;
    object[proposal.fieldKey] = proposal.value;

    const source = outcome.attribution?.[proposal.fieldKey];
    fields.push({
      stepKey: proposal.stepKey,
      fieldKey: proposal.fieldKey,
      value: proposal.value,
      quote: proposal.quote,
      assumed: proposal.assumed,
      ...(source ? { source } : {}),
    });
  }

  for (const batch of outcome.batches) {
    const object = stepObject(batch.stepKey);
    const existing = (
      Array.isArray(object[batch.stage]) ? object[batch.stage] : []
    ) as Record<string, unknown>[];
    const kept = existing.filter(entryHasContent);
    const added = batch.entries
      .filter(entryHasContent)
      .map((entry) => ({ ...entry, entryKey: mintEntryKey() }));
    if (added.length === 0) continue;

    object[batch.stage] = [...kept, ...added];
    for (const entry of added) {
      fields.push({
        stepKey: batch.stepKey,
        fieldKey: batch.stage,
        entryKey: entry.entryKey,
        value: canonicalEntry(entry),
        quote: null,
        assumed: false,
      });
    }
  }

  // A step that received nothing is not touched at all — writing an identical
  // object back under a lock is harmless, but writing one that a concurrent
  // autosave has since changed is not, and not touching it is the safer of
  // the two by construction.
  for (const stepKey of Object.keys(patch)) {
    if (!fields.some((f) => f.stepKey === stepKey)) delete patch[stepKey];
  }

  return { patch, fields };
}

/**
 * Whether a value the run wrote is still the machine's.
 *
 * The same comparison the on-screen mark makes, server-side, so the intake
 * document can tell Taylor which values nobody has confirmed. One rule for
 * both surfaces: a value is the machine's while it equals what was written,
 * and the client's the moment it does not.
 *
 * `current` is the step's stored object, since an entry has to be found by its
 * key inside an array before it can be compared.
 */
export function stillMachineFilled(
  field: IngestedField,
  current: Record<string, unknown>,
): boolean {
  if (!field.entryKey) {
    const value = current[field.fieldKey];
    return typeof value === "string" && value.trim() === field.value.trim();
  }

  const array = current[field.fieldKey];
  if (!Array.isArray(array)) return false;

  const entry = (array as Record<string, unknown>[]).find(
    (candidate) => candidate?.entryKey === field.entryKey,
  );
  // A removed entry is neither the machine's nor the client's — it is gone,
  // and the document has nothing to warn about.
  return entry ? canonicalEntry(entry) === field.value : false;
}

/** The status the record should carry, from what landed and what did not. */
export function statusFor(
  fields: readonly IngestedField[],
  failed: readonly IngestionStage[],
): IngestionStatus {
  if (failed.length > 0) return "partial";
  return fields.length === 0 ? "refused" : "ran";
}
