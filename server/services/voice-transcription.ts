import { and, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";
import OpenAI, { toFile } from "openai";
import { getDb } from "@/db/client";
import { intakeFiles } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import { showcaseDisciplines } from "@/lib/intake/tracks";
import { downloadUpload, readStepAnswers } from "./submission";
import { requireEngagement } from "./engagement";

/**
 * Writing a client's voice note out, so nobody has to type it.
 *
 * This is the second place in this codebase where a client's own material
 * leaves our infrastructure, and it inherits the extractor's rules with one
 * deliberate widening:
 *
 * **The request carries the audio, the model, and a prompt built from exactly
 * three things** — the client's display name, their disciplines, and the
 * titles of the work they have already entered (M-PORT-31). No engagement id,
 * no token, no email, no address, no answers beyond those. The widening from
 * `extract.ts`'s anonymous blob is the point of the feature rather than a
 * concession to it: a twenty-minute memo about somebody's career is mostly
 * proper nouns, and a model that has never heard "Le Guess Who" will not spell
 * it. The allow-list is spelled out below and a field is not in it unless
 * somebody puts it there, the same construction `come-across.ts` uses.
 *
 * **Nothing here is logged.** Not the audio, not the transcript, not the
 * prompt, not the filename. Errors carry the vendor's status and nothing else.
 * A voice note is a person talking unguardedly about their working life for
 * twenty minutes, and it is the single most disclosive artifact this form
 * collects.
 *
 * **This never touches the audio row's own facts.** `storage_path` and
 * `uploaded_at` are written by the upload path and read here. A transcription
 * that fails every time leaves a complete, shippable voice note behind — which
 * is exactly what shipped before this feature existed, so its worst case is a
 * return to the status quo rather than a loss.
 *
 * The model is pinned by the ticket, not chosen here.
 */

/** Pinned by PORT-20. Changing it is a decision with a record, not a preference. */
export const TRANSCRIBE_MODEL = "gpt-4o-transcribe";

/**
 * The documented fallback, tried exactly once when the pinned model refuses a
 * file outright.
 *
 * `whisper-1` accepts things its successor rejects — odd containers, very
 * quiet audio, an old Android `.amr`. One automatic retry on the older model
 * is kinder than a button that says "try again" and then fails identically,
 * and `transcript_model` records which one actually produced the text so a
 * transcript's quality is never a mystery.
 */
export const TRANSCRIBE_FALLBACK_MODEL = "whisper-1";

/**
 * How many times one file may be sent.
 *
 * Per file rather than per engagement (M-PORT-30): retry is a per-file action,
 * and a client who has spent their twenty-five extraction runs must still be
 * able to have their voice note written out. Five covers a vendor having a bad
 * afternoon and bounds what a leaked link can spend on one upload.
 * `[PROVISIONAL — the number, not the mechanism]`
 */
export const MAX_TRANSCRIPT_ATTEMPTS = 5;

/**
 * The vendor's own per-request ceiling, which is well below ours (50 MB).
 *
 * A browser recording is capped at 30 minutes of 32 kbps Opus — roughly 7 MB —
 * so it cannot reach this. A phone memo recorded at 256 kbps can, and when it
 * does the file is refused *for transcription only*: it stays uploaded, it
 * stays in the intake document, and Taylor transcribes it the way he does
 * today. Size never rejects an upload; this is a different question.
 */
const VENDOR_MAX_BYTES = 25 * 1024 * 1024;

/** Which uploads this may ever be run against. */
export const TRANSCRIBABLE_FIELD_KEYS = ["voice_note"] as const;

/**
 * Which machine-written texts a client may correct.
 *
 * Wider than the list above, and deliberately: PORT-21 reads a client's
 * uploaded documents and the pages behind the links they gave, and both land
 * in the same `transcript` column with the same problem — a machine wrote it,
 * and only the person who has the original can say whether it is right.
 * Correcting a reading is the same act whatever produced it, so it is the same
 * path rather than a second one that could drift.
 *
 * Kept here rather than imported from `document-reading.ts` so that module and
 * this one stay independent; the two field keys are repeated once, in a
 * constant a reader can see, rather than coupling audio to documents.
 */
export const EDITABLE_TRANSCRIPT_FIELD_KEYS = [
  "voice_note",
  "ingest_documents",
  "ingest_links",
] as const;

export type TranscriptionFailure =
  | "not_found"
  | "not_uploaded"
  | "too_large"
  | "rate_limited"
  | "unavailable"
  | "empty"
  | "failed";

/** Thrown by the service, turned into a plain result by the action. */
export class TranscriptionUnavailableError extends Error {
  constructor(readonly reason: TranscriptionFailure) {
    super(`Transcription unavailable: ${reason}`);
    this.name = "TranscriptionUnavailableError";
  }
}

let client: OpenAI | null = null;

export function getClient(): OpenAI {
  client ??= new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
  return client;
}

/* ────────────────────────────────────────────────────────────────────────────
   The prompt — the whole allow-list, in one function
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Every fact about the client that reaches OpenAI, assembled in one place.
 *
 * Three sources, named in M-PORT-31 and nowhere widened: the display name from
 * step 2, the disciplines from the start form, and the titles of whatever the
 * client has entered on step 5. Titles are the reason this exists — a
 * filmography's worth of festival names, film titles, and collaborators is
 * most of what a voice note contains, and the model spells them right when it
 * has seen them and inventively when it has not.
 *
 * Deliberately absent: email, phone, domain, passwords, account handles, every
 * long-form answer, and the engagement's own id. Their absence is structural —
 * this function reads two step keys and takes nothing else.
 */
function buildPrompt(answers: unknown): string {
  const about = readStepAnswers("showcase", answers, "about");
  const work = readStepAnswers("showcase", answers, "work");

  const parts: string[] = [];

  const name = typeof about.displayName === "string" ? about.displayName.trim() : "";
  if (name) parts.push(name);

  const labels = new Map<string, string>(
    showcaseDisciplines().map((d) => [d.key, d.label]),
  );
  const disciplines = Array.isArray(about.disciplines)
    ? about.disciplines
        .filter((key): key is string => typeof key === "string")
        .map((key) => labels.get(key) ?? key)
    : [];
  if (disciplines.length > 0) parts.push(disciplines.join(", "));

  // Every entry array on step 5 carries a `title`. Reading them all rather
  // than branching on kind means a pack added later is covered without anyone
  // remembering to come back here.
  const titles: string[] = [];
  for (const key of ["projects", "pieces", "offerings", "services"]) {
    const entries = work[key];
    if (!Array.isArray(entries)) continue;

    for (const entry of entries) {
      const title =
        entry && typeof entry === "object"
          ? (entry as { title?: unknown }).title
          : undefined;
      if (typeof title === "string" && title.trim()) titles.push(title.trim());
    }
  }

  // Bounded: a forty-project catalogue would otherwise push the prompt past
  // what the vendor accepts, and the first twenty names carry the accents and
  // capitalisations the rest mostly repeat.
  if (titles.length > 0) parts.push(titles.slice(0, 20).join(", "));

  if (parts.length === 0) return "";

  // A comma-run of proper nouns, which is the shape this parameter is for —
  // it biases spelling, it is not an instruction the model follows.
  return parts.join(". ");
}

/* ────────────────────────────────────────────────────────────────────────────
   The run
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Claims one attempt against a file, atomically.
 *
 * The cap lives in the UPDATE's predicate rather than in a read-then-write, so
 * two tabs pressing retry at the same moment cannot both pass a check that was
 * true when they read it (the same shape as `claimRun` and M-INT-15).
 *
 * Marking the row `pending` in the same statement is what makes a page reload
 * mid-run show "being written up" rather than offering a second run.
 */
async function claimAttempt(fileId: string): Promise<boolean> {
  const [row] = await getDb()
    .update(intakeFiles)
    .set({
      transcriptAttempts: sql`${intakeFiles.transcriptAttempts} + 1`,
      transcriptStatus: "pending",
    })
    .where(
      and(
        eq(intakeFiles.id, fileId),
        lt(intakeFiles.transcriptAttempts, MAX_TRANSCRIPT_ATTEMPTS),
      ),
    )
    .returning({ id: intakeFiles.id });

  return Boolean(row);
}

/**
 * Transcribes one uploaded voice note, and writes the result to its row.
 *
 * The three stages are separate on purpose and this is the third of them: the
 * bytes are already safe in storage before a single line here runs, and every
 * failure below leaves them exactly as safe. There is no path in this function
 * that writes to `storage_path` or `uploaded_at`.
 */
export async function transcribeVoiceNote(
  token: string,
  fileId: string,
): Promise<{ transcript: string; model: string }> {
  const engagement = await requireEngagement(token);

  const [file] = await getDb()
    .select({
      id: intakeFiles.id,
      fieldKey: intakeFiles.fieldKey,
      mimeType: intakeFiles.mimeType,
      originalName: intakeFiles.originalName,
      sizeBytes: intakeFiles.sizeBytes,
      storagePath: intakeFiles.storagePath,
      uploadedAt: intakeFiles.uploadedAt,
      attempts: intakeFiles.transcriptAttempts,
    })
    .from(intakeFiles)
    .where(
      and(
        eq(intakeFiles.id, fileId),
        // Scoped to the engagement the token resolves to, so one client's
        // token can never transcribe another client's audio.
        eq(intakeFiles.engagementId, engagement.id),
      ),
    )
    .limit(1);

  if (!file) throw new TranscriptionUnavailableError("not_found");

  if (
    !TRANSCRIBABLE_FIELD_KEYS.includes(
      file.fieldKey as (typeof TRANSCRIBABLE_FIELD_KEYS)[number],
    )
  ) {
    throw new TranscriptionUnavailableError("not_found");
  }

  // A reserved-but-never-delivered row has no bytes to send. Not an error the
  // client caused, and not a spent attempt.
  if (!file.uploadedAt) throw new TranscriptionUnavailableError("not_uploaded");

  if (file.sizeBytes !== null && file.sizeBytes > VENDOR_MAX_BYTES) {
    await markFailed(fileId);
    throw new TranscriptionUnavailableError("too_large");
  }

  if (!(await claimAttempt(fileId))) {
    throw new TranscriptionUnavailableError("rate_limited");
  }

  let bytes: Uint8Array;
  try {
    bytes = await downloadUpload(file.storagePath);
  } catch {
    await markFailed(fileId);
    throw new TranscriptionUnavailableError("failed");
  }

  const prompt = buildPrompt(engagement.answers);

  let text: string;
  let model: string;
  try {
    const result = await send(bytes, file, prompt);
    text = result.text;
    model = result.model;
  } catch (error) {
    await markFailed(fileId);

    // The vendor's status and nothing else. No prompt, no filename, no bytes.
    console.error(
      "[transcribe] vendor call failed",
      error instanceof OpenAI.APIError ? error.status : "unknown",
    );
    throw new TranscriptionUnavailableError(
      error instanceof OpenAI.APIError && error.status === 429
        ? "unavailable"
        : "failed",
    );
  }

  const transcript = text.trim();

  // Silence transcribes to an empty string. Recording it as `done` would show
  // the client an empty box and call it a transcript; `failed` at least offers
  // them the retry that is the right move if their microphone was muted.
  if (!transcript) {
    await markFailed(fileId);
    throw new TranscriptionUnavailableError("empty");
  }

  await getDb()
    .update(intakeFiles)
    .set({
      transcribedAt: new Date(),
      transcript,
      transcriptModel: model,
      transcriptStatus: "done",
    })
    .where(eq(intakeFiles.id, fileId));

  return { transcript, model };
}

/**
 * The vendor call, with the documented single fallback.
 *
 * The filename handed to `toFile` is synthetic — an extension derived from the
 * recorded MIME type, never the client's own filename. The vendor asks for an
 * extension-bearing name to identify the format; it has no business receiving
 * "kryshan-showreel-notes-FINAL.m4a".
 */
async function send(
  bytes: Uint8Array,
  file: { mimeType: string | null; originalName: string | null },
  prompt: string,
): Promise<{ text: string; model: string }> {
  const type = file.mimeType ?? "audio/webm";
  const name = `audio.${extensionFor(type, file.originalName)}`;

  const upload = async (model: string) => {
    const response = await getClient().audio.transcriptions.create({
      file: await toFile(bytes, name, { type }),
      model,
      response_format: "json",
      ...(prompt ? { prompt } : {}),
    });
    return response.text;
  };

  try {
    return { text: await upload(TRANSCRIBE_MODEL), model: TRANSCRIBE_MODEL };
  } catch (error) {
    // Only a refusal of *this file* earns the fallback. A 429 or a 500 is the
    // vendor having a moment, and hammering a second model does not help.
    const status = error instanceof OpenAI.APIError ? error.status : undefined;
    if (status !== 400 && status !== 415 && status !== 422) throw error;

    return {
      text: await upload(TRANSCRIBE_FALLBACK_MODEL),
      model: TRANSCRIBE_FALLBACK_MODEL,
    };
  }
}

/**
 * The extension the vendor uses to identify the format.
 *
 * Chrome and Firefox record `audio/webm`, Safari records `audio/mp4`, and an
 * uploaded phone memo can be anything. The client's own filename is consulted
 * only as a last resort and only for its extension characters, never for the
 * rest of the name.
 */
function extensionFor(type: string, originalName: string | null): string {
  const base = type.split(";")[0]?.trim().toLowerCase() ?? "";

  const known: Record<string, string> = {
    "audio/webm": "webm",
    "video/webm": "webm",
    "audio/mp4": "mp4",
    "video/mp4": "mp4",
    "audio/x-m4a": "m4a",
    "audio/m4a": "m4a",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/flac": "flac",
  };

  if (known[base]) return known[base];

  const match = /\.([A-Za-z0-9]{1,8})$/.exec(originalName ?? "");
  return match ? match[1].toLowerCase() : "webm";
}

/** Records a failure without touching a single fact about the audio itself. */
async function markFailed(fileId: string): Promise<void> {
  await getDb()
    .update(intakeFiles)
    .set({ transcriptStatus: "failed" })
    .where(eq(intakeFiles.id, fileId));
}

/**
 * Which of an engagement's voice notes are still waiting to be written out.
 *
 * Read by the step on mount, which is what serves the client who recorded,
 * closed the tab before the transcription finished, and came back. A row is
 * eligible when it was delivered, has no transcript, is not mid-run, and has
 * attempts left.
 */
export async function pendingTranscriptions(
  engagementId: string,
): Promise<string[]> {
  const rows = await getDb()
    .select({ id: intakeFiles.id })
    .from(intakeFiles)
    .where(
      and(
        eq(intakeFiles.engagementId, engagementId),
        eq(intakeFiles.fieldKey, "voice_note"),
        sql`${intakeFiles.uploadedAt} is not null`,
        isNull(intakeFiles.transcript),
        lt(intakeFiles.transcriptAttempts, MAX_TRANSCRIPT_ATTEMPTS),
        or(
          isNull(intakeFiles.transcriptStatus),
          eq(intakeFiles.transcriptStatus, "failed"),
        ),
      ),
    );

  return rows.map((row) => row.id);
}

/**
 * The client's own correction, saved.
 *
 * This is the half of D-PORT-3 that makes the other half true: a machine wrote
 * the first draft, and it is not treated as fact until a person has been able
 * to fix it. `transcriptEditedAt` is what the intake document reads to decide
 * whether to warn Taylor that nobody has.
 *
 * An empty string is a legitimate save — unsaying something is an answer too.
 */
export async function saveTranscript(
  token: string,
  fileId: string,
  transcript: string,
): Promise<void> {
  const engagement = await requireEngagement(token);
  const trimmed = transcript.trim();

  await getDb()
    .update(intakeFiles)
    .set({
      transcript: trimmed || null,
      transcriptEditedAt: new Date(),
      // A client who types into an empty box after a failure has produced a
      // transcript, and the row should say so.
      transcriptStatus: trimmed ? "done" : "failed",
    })
    .where(
      and(
        eq(intakeFiles.id, fileId),
        eq(intakeFiles.engagementId, engagement.id),
        inArray(intakeFiles.fieldKey, [...EDITABLE_TRANSCRIPT_FIELD_KEYS]),
      ),
    );
}
