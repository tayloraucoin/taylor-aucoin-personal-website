import { createHash } from "node:crypto";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { intakeFiles } from "@/db/schema";
import { ingestionFieldsFor } from "@/lib/intake/showcase-primer-fields";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import type {
  EntryBatch,
  IngestedSource,
  IngestionOutcome,
  IngestionSource,
  IngestionStage,
} from "@/lib/intake/ingestion-record";
import type { PrimerProposal } from "@/lib/intake/primer-proposal";
import { workShapeFor } from "@/lib/intake/tracks";
import {
  claimRun,
  ExtractionUnavailableError,
  MAX_BLOB_CHARS,
  sortDocument,
  type ExtractionMode,
} from "./extract";
import {
  LINK_FIELD_KEY,
  READABLE_FIELD_KEYS,
} from "./document-reading";
import { proposeFromDocument, PrimerUnavailableError } from "./primer";

/**
 * The ingestion run: everything a client already has, read once, and as much
 * of the questionnaire as it honestly supports filled from it (PORT-18).
 *
 * ## One job per stage
 *
 * "Fill in the whole questionnaire" is not one job, so it is not one call.
 * The run fans out into stages that each have exactly one and that already
 * exist, eval'd, elsewhere on this track:
 *
 * - **`fields`** — PORT-10's primer, handed this kind's inventory rather than
 *   the whole one. Quote-or-nothing on every critical field, the quote checked
 *   here against the source and never trusted from the model.
 * - **`experience`** — PORT-6's extractor in its experience mode.
 * - **The kind's work shape** — the same extractor in the mode this kind's
 *   step 5 fills: `projects`, `offerings`, `pieces`, or `services`.
 *
 * The stages run in parallel, so wall time is the slowest of them rather than
 * their sum. One run is claimed against the shared per-engagement counter for
 * the press, not one per stage: a leaked link spends one bounded budget.
 *
 * ## What the model sees, and what it never sees
 *
 * The source text, the kind's field inventory, and the stage's instruction.
 * No name, no email, no token, no engagement id, no prior answers, nothing
 * from the durable track. The same allow-list posture `come-across.ts` holds.
 *
 * ## Degrade per stage, never per run
 *
 * A stage that throws is named in `failed` and the others still land. A stage
 * that returns nothing is not a failure — an About page with no career
 * timeline in it produces zero experience entries, correctly. Only when every
 * stage throws does the run itself fail, and then nothing is written and the
 * step stays runnable (see `ingestion-store.ts` for the one-shot rule).
 *
 * ## The source is never logged
 *
 * Not in an error, not in a warning, not in a returned payload. It is a
 * client's unpublished material about themselves.
 */

/** The people stage is deliberately absent — see PORT-18 § cuts. */
type EntryStage = Exclude<IngestionStage, "fields">;

/** Refused before anything ran, for a stated reason. */
export class IngestionUnavailableError extends Error {
  readonly reason: "empty" | "too_large" | "rate_limited" | "failed";

  constructor(reason: IngestionUnavailableError["reason"]) {
    super(`Ingestion unavailable: ${reason}`);
    this.name = "IngestionUnavailableError";
    this.reason = reason;
  }
}

/** Which entry arrays one kind's run fills, and the step each lives on. */
function entryStagesFor(
  kind: ShowcaseKind,
): ReadonlyArray<{ stage: EntryStage; stepKey: EntryBatch["stepKey"] }> {
  return [
    { stage: "experience", stepKey: "experience" },
    { stage: workShapeFor(kind), stepKey: "work" },
  ];
}

function digest(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/**
 * The most text one run will read, across the paste and every file and page.
 *
 * Roughly 100k tokens — comfortably inside the window, and bounded so that a
 * client who attaches forty decks cannot turn one press into a minutes-long,
 * expensive call. `MAX_BLOB_CHARS` still bounds the paste on its own.
 * `[PROVISIONAL — the number, not the mechanism]`
 */
export const MAX_SOURCE_CHARS = 400_000;

/**
 * Fits the sources under the ceiling by dropping whole ones, largest first.
 *
 * **Never truncates.** Half a document read confidently is worse than no
 * document: the run would answer questions from the first half and say nothing
 * about the gap. Dropping a whole source is legible — the summary names it and
 * the client knows Taylor still has the file — and it is the same law the
 * paste's own size ceiling follows.
 *
 * The client's paste is never dropped. It is the one source they typed
 * themselves and the only one whose absence would make the run pointless.
 */
export function fitSources(sources: readonly IngestionSource[]): {
  kept: IngestionSource[];
  omitted: string[];
} {
  const paste = sources.filter((source) => source.name === null);
  const rest = [...sources.filter((source) => source.name !== null)].sort(
    (a, b) => a.text.length - b.text.length,
  );

  const kept = [...paste];
  const omitted: string[] = [];
  let total = paste.reduce((sum, source) => sum + source.text.length, 0);

  // Smallest first, so a run with one enormous deck and five short pages keeps
  // the five rather than spending the whole ceiling on the deck.
  for (const source of rest) {
    if (total + source.text.length <= MAX_SOURCE_CHARS) {
      kept.push(source);
      total += source.text.length;
    } else {
      omitted.push(source.name!);
    }
  }

  return { kept, omitted };
}

/**
 * The sources as one document, each under a header naming where it came from.
 *
 * The headers are for the model rather than for us: a run that reads a paste,
 * an old About page, and an interview needs to know they are three documents,
 * or it will read a sentence from one as context for another. Attribution is
 * done afterwards by searching each source's own text, not by parsing these.
 */
function combine(sources: readonly IngestionSource[]): string {
  return sources
    .map((source) =>
      source.name === null
        ? `[what they typed]\n${source.text}`
        : `[from ${source.name}]\n${source.text}`,
    )
    .join("\n\n");
}

/**
 * Which source a quote came from.
 *
 * By searching each source's own text rather than by parsing the combined
 * document, so a header the model happened to quote cannot misattribute a
 * value. A quote found in more than one source attributes to the first, which
 * is the paste when the paste contains it — the strongest provenance available
 * and the honest one to show.
 */
function attribute(
  quote: string | null,
  sources: readonly IngestionSource[],
): IngestedSource | undefined {
  if (!quote) return undefined;

  const needle = quote.trim().toLowerCase().replace(/\s+/g, " ");
  if (!needle) return undefined;

  for (const source of sources) {
    const haystack = source.text.toLowerCase().replace(/\s+/g, " ");
    if (!haystack.includes(needle)) continue;
    return source.name === null
      ? undefined
      : { name: source.name, transcribed: source.transcribed };
  }

  return undefined;
}

/**
 * One source in, an outcome out. No database, no run counter.
 *
 * Split from `runIngestion` for the reason the primer and the extractor are
 * split: the golden set grades the prompts, the validators, and the fan-out,
 * and it must not spend a client's runs to do it. Nothing client-reachable
 * imports this; the action calls `runIngestion` and only that.
 */
export async function ingestFromText(
  kind: ShowcaseKind,
  source: string | readonly IngestionSource[],
): Promise<IngestionOutcome> {
  // A bare string is the client's paste and nothing else, which is what the
  // eval and every caller before PORT-21 hand in.
  const given: readonly IngestionSource[] =
    typeof source === "string"
      ? [{ name: null, text: source, transcribed: false }]
      : source;

  const paste = given.find((entry) => entry.name === null)?.text.trim() ?? "";

  // The paste's own ceiling, unchanged: refused rather than truncated, and the
  // same one every AI touchpoint on this track shares.
  if (paste.length > MAX_BLOB_CHARS) {
    throw new IngestionUnavailableError("too_large");
  }

  const nonEmpty = given
    .map((entry) => ({ ...entry, text: entry.text.trim() }))
    .filter((entry) => entry.text !== "");

  if (nonEmpty.length === 0) throw new IngestionUnavailableError("empty");

  const { kept, omitted } = fitSources(nonEmpty);
  const text = combine(kept);

  const fields = ingestionFieldsFor(kind);
  const entryStages = entryStagesFor(kind);

  const [fieldsResult, ...entryResults] = await Promise.allSettled([
    proposeFromDocument(text, fields),
    ...entryStages.map(({ stage }) =>
      sortDocument(stage as ExtractionMode, text),
    ),
  ]);

  const failed: IngestionStage[] = [];
  let proposals: PrimerProposal[] = [];
  const batches: EntryBatch[] = [];

  if (fieldsResult.status === "fulfilled") {
    // The validator already dropped anything outside `fields`; this is the
    // belt to that brace, so a key from another kind's questionnaire cannot
    // reach the store even if the validator's default is ever widened.
    const allowed = new Set(fields.map((field) => field.key));
    proposals = fieldsResult.value.filter((p) => allowed.has(p.fieldKey));
  } else if (!isEmptyRefusal(fieldsResult.reason)) {
    failed.push("fields");
  }

  // Which source each surviving quote came from, so the mark can say whether a
  // value is the client's own words or a machine's reading of their file.
  const attribution: Record<string, IngestedSource> = {};
  for (const proposal of proposals) {
    const source = attribute(proposal.quote, kept);
    if (source) attribution[proposal.fieldKey] = source;
  }

  entryResults.forEach((result, index) => {
    const { stage, stepKey } = entryStages[index]!;
    if (result.status === "fulfilled") {
      batches.push({ stage, stepKey, entries: result.value });
    } else if (!isEmptyRefusal(result.reason)) {
      failed.push(stage);
    }
  });

  // Every stage threw: nothing landed, and nothing should be written.
  if (failed.length === 1 + entryStages.length) {
    throw new IngestionUnavailableError("failed");
  }

  return {
    fields: proposals,
    batches,
    failed,
    sourceChars: text.length,
    sourceDigest: digest(text),
    ...(omitted.length > 0 ? { omitted } : {}),
    ...(Object.keys(attribution).length > 0 ? { attribution } : {}),
  };
}

/**
 * "Nothing in there" is an answer, not a failure.
 *
 * The extractor throws `empty` when a blob yields no entries and the primer
 * throws it for a blank document; the run treats the first as a stage that
 * returned nothing and the second cannot happen past the check above.
 */
function isEmptyRefusal(reason: unknown): boolean {
  return (
    (reason instanceof ExtractionUnavailableError && reason.reason === "empty") ||
    (reason instanceof PrimerUnavailableError && reason.reason === "empty")
  );
}

/**
 * Reads one engagement's source against its run budget.
 *
 * Takes an id rather than an engagement, as every AI service here does: a
 * function that cannot see a client's name cannot accidentally send it. The
 * budget is claimed before the model is called, once for the whole press.
 */
export async function runIngestion(
  engagementId: string,
  kind: ShowcaseKind,
  paste: string,
): Promise<IngestionOutcome> {
  const text = paste.trim();
  if (text.length > MAX_BLOB_CHARS) {
    throw new IngestionUnavailableError("too_large");
  }

  // A client who attaches a deck and presses straight away should get a run
  // that used it. Waiting a little is the difference between that and a run
  // that silently skipped the one thing they most wanted read.
  const notReady = await waitForReadings(engagementId);

  const sources = await collectSources(engagementId, text);
  if (sources.length === 0) throw new IngestionUnavailableError("empty");

  if (!(await claimRun(engagementId))) {
    throw new IngestionUnavailableError("rate_limited");
  }

  const outcome = await ingestFromText(kind, sources);
  return notReady.length > 0 ? { ...outcome, notReady } : outcome;
}

/**
 * How long the run will wait for a file that is still being read.
 *
 * Long enough for a one-pager or a short deck to finish, short enough that a
 * sixty-page transcription does not hold the whole run hostage — that one is
 * named in the summary instead, and Taylor reads it. The wait is not a
 * guarantee and the copy never presents it as one.
 * `[PROVISIONAL — the number, not the mechanism]`
 */
const READING_WAIT_MS = 20_000;
const READING_POLL_MS = 1_500;

/**
 * Waits for any file still mid-read, and names the ones that did not finish.
 *
 * The alternative — take whatever is `done` at this instant — loses a file
 * silently, which is the one outcome this step cannot have: the client watched
 * themselves attach it. Anything still unfinished after the wait is returned
 * so the summary can say which, rather than leaving them to notice the
 * absence.
 */
async function waitForReadings(engagementId: string): Promise<string[]> {
  const deadline = Date.now() + READING_WAIT_MS;

  for (;;) {
    const pending = await getDb()
      .select({ originalName: intakeFiles.originalName })
      .from(intakeFiles)
      .where(
        and(
          eq(intakeFiles.engagementId, engagementId),
          eq(intakeFiles.fieldKey, READABLE_FIELD_KEYS[0]),
          eq(intakeFiles.transcriptStatus, "pending"),
        ),
      );

    if (pending.length === 0) return [];
    if (Date.now() >= deadline) {
      return pending.map((row) => row.originalName ?? "a file you sent");
    }

    await new Promise((resolve) => setTimeout(resolve, READING_POLL_MS));
  }
}

/**
 * Everything this engagement has given us, as sources (PORT-21).
 *
 * The paste, plus every file and page that was read successfully. A file that
 * could not be read contributes nothing here and is not an error: it is
 * stored, it is in the intake document, and Taylor opens it. That is why the
 * query asks for a transcript rather than for a file — an unreadable deck and
 * a deck nobody has read yet are the same thing to a run.
 *
 * A run with an empty paste and one readable file runs on the file. A run with
 * a paste and nothing else is exactly what PORT-18 shipped.
 */
async function collectSources(
  engagementId: string,
  paste: string,
): Promise<IngestionSource[]> {
  const rows = await getDb()
    .select({
      fieldKey: intakeFiles.fieldKey,
      originalName: intakeFiles.originalName,
      mimeType: intakeFiles.mimeType,
      transcript: intakeFiles.transcript,
      transcriptModel: intakeFiles.transcriptModel,
    })
    .from(intakeFiles)
    .where(
      and(
        eq(intakeFiles.engagementId, engagementId),
        eq(intakeFiles.transcriptStatus, "done"),
        inArray(intakeFiles.fieldKey, [...READABLE_FIELD_KEYS, LINK_FIELD_KEY]),
      ),
    )
    .orderBy(asc(intakeFiles.createdAt));

  const sources: IngestionSource[] = [];
  if (paste) sources.push({ name: null, text: paste, transcribed: false });

  for (const row of rows) {
    const text = row.transcript?.trim();
    if (!text) continue;

    sources.push({
      name: row.originalName ?? "a file you sent",
      text,
      // `transcript_model` records how the text was produced: `office` and
      // `text` were read here, exactly; anything else is a model's reading and
      // carries the weaker guarantee the mark has to show.
      transcribed:
        row.transcriptModel !== "office" && row.transcriptModel !== "text",
    });
  }

  return sources;
}
