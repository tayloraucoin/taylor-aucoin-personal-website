import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagements, intakeFiles } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import { schemaFor } from "@/lib/intake/tracks";
import type { AnyIntakeStepKey, IntakeTrackKey } from "@/lib/types/intake";
import { MAX_UPLOAD_BYTES } from "@/lib/validators/intake";
import { requireEngagement } from "./engagement";

/**
 * Writes one step's answers into the engagement's answer document.
 *
 * The merge happens in Postgres, not in application memory. `answers || patch`
 * replaces exactly the one step key and leaves the other eight untouched, so a
 * client with the form open on a phone and a laptop cannot have one tab
 * clobber the other's step. Within a single step it is last-write-wins, which
 * is the level of conflict a solo filler can only create deliberately.
 *
 * A read-modify-write in TypeScript would reintroduce precisely the race this
 * avoids.
 *
 * Nothing here logs an answer. The whole document is a business's pricing,
 * margins, and access details; the most a log line may carry is which step
 * moved and how big it was.
 */
export async function saveStepAnswers(
  token: string,
  stepKey: AnyIntakeStepKey,
  answers: Record<string, unknown>,
): Promise<void> {
  const engagement = await requireEngagement(token);

  const parsed = guardShape(engagement.track, stepKey, answers);
  const patch = JSON.stringify({ [stepKey]: parsed });
  const now = new Date();

  await getDb()
    .update(engagements)
    .set({
      answers: sql`${engagements.answers} || ${patch}::jsonb`,
      lastActivityAt: now,
      updatedAt: now,
    })
    .where(eq(engagements.id, engagement.id));
}

/**
 * A shape guard, never a gate.
 *
 * Unknown keys are dropped, every field is optional, and an empty object is a
 * legitimate save (D-INT-4). If a single field arrives malformed, only that
 * field is discarded — the rest of the step still lands. Rejecting the whole
 * save would mean one bad value costing a client everything else they had just
 * typed, which is the exact failure this system promises cannot happen.
 *
 * The names of dropped fields are logged; their values never are.
 */
function guardShape(
  track: IntakeTrackKey,
  stepKey: AnyIntakeStepKey,
  answers: Record<string, unknown>,
): unknown {
  const schema = schemaFor(track, stepKey);

  // A step key belonging to the other track. Only a fabricated request can
  // produce one, and the honest response is to refuse rather than to write an
  // empty object under a key this track's document generator will never read.
  if (!schema) throw new UnknownStepError(track, stepKey);

  const first = schema.safeParse(answers);
  if (first.success) return first.data;

  const bad = new Set(
    first.error.issues
      .map((issue) => String(issue.path[0] ?? ""))
      .filter(Boolean),
  );

  const kept = Object.fromEntries(
    Object.entries(answers).filter(([key]) => !bad.has(key)),
  );

  console.warn(
    `[intake] dropped malformed field(s) on step ${stepKey}: ${[...bad].join(", ")}`,
  );

  const second = schema.safeParse(kept);
  return second.success ? second.data : {};
}

/**
 * Reads one step's stored answers, narrowed to that step's shape.
 *
 * The column is typed loosely on purpose (it is a JSONB document that outlives
 * any one version of the form), so narrowing happens here at the boundary
 * rather than being asserted by a caller.
 */
export function readStepAnswers(
  track: IntakeTrackKey,
  answers: unknown,
  stepKey: AnyIntakeStepKey,
): Record<string, unknown> {
  const document = (answers ?? {}) as Record<string, unknown>;
  const stored = document[stepKey];
  const schema = schemaFor(track, stepKey);

  if (!schema) return {};

  const result = schema.safeParse(stored ?? {});
  return result.success ? (result.data as Record<string, unknown>) : {};
}

/** Thrown when a step key does not belong to the engagement's track. */
export class UnknownStepError extends Error {
  constructor(track: IntakeTrackKey, stepKey: string) {
    super(`Step "${stepKey}" does not exist on the ${track} track.`);
    this.name = "UnknownStepError";
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   Uploads
   ────────────────────────────────────────────────────────────────────────────

   Bytes go from the browser straight to Supabase Storage and never through
   this application. That is not only a size decision — a five-minute voice
   memo through a serverless function is a timeout waiting to happen — it also
   means the file never sits in a log, a trace, or a request body we own.

   The browser still holds no Supabase key (M-INT-8). A signed upload URL is a
   complete, short-lived, single-path credential: the client PUTs to it with
   plain `fetch` and can reach nothing else in the bucket.

   Storage paths are `{engagementId}/{fieldKey}/{uuid}{ext}`. The client's
   filename is kept as metadata for Taylor's benefit and never used to build
   the path — a name that arrives from outside is not trusted input.
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * The bucket a client's own uploads land in — **infrastructure, not a code fact**.
 *
 * This was the literal `"intake"`, and no project has a bucket by that name:
 * staging holds `public`, production holds `PUBLIC` and `PRIVATE` (found
 * 2026-09-07 while seeding the taste gallery). Every call below therefore
 * fails with "Bucket not found", which means **no client file has ever been
 * stored** — logos, stills, inspiration images, voice notes, documents.
 *
 * The default stays `"intake"` deliberately. Pointing it somewhere on my own
 * would be choosing where confidential client uploads live, which is a
 * disclosure decision and not a typo fix: `PRIVATE` is the only existing bucket
 * that could hold them, and it is shared with invoice PDFs. Set
 * `SUPABASE_LIVE_INTAKE_BUCKET` / `SUPABASE_STAGING_INTAKE_BUCKET`, or create
 * an `intake` bucket in both projects, and this reads it.
 *
 * `[NEEDS DECISION — Taylor]` create the bucket, or point this at `PRIVATE`.
 */
function intakeBucket(): string {
  return process.env.SUPABASE_INTAKE_BUCKET?.trim() || "intake";
}

let storage: ReturnType<typeof createClient> | null = null;

function getStorage() {
  storage ??= createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );
  return storage;
}

/** Keeps a recognisable extension without trusting anything else in the name. */
function safeExtension(filename: string): string {
  const match = /\.([A-Za-z0-9]{1,8})$/.exec(filename);
  return match ? `.${match[1].toLowerCase()}` : "";
}

export type UploadTicket = {
  fileId: string;
  uploadUrl: string;
  storagePath: string;
};

/**
 * Reserves a place for a file and returns a one-shot URL to send it to.
 *
 * Refuses on size and nothing else. Format is never a reason to reject: a
 * client sending a `.heic` or an `.amr` is sending what their phone produced,
 * and turning that away teaches them the form is broken when the problem is
 * ours to solve later.
 */
export async function issueUploadTicket(input: {
  token: string;
  stepKey: AnyIntakeStepKey;
  fieldKey: string;
  /** Scopes the file to one repeatable entry — a project's stills (M-PORT-3). */
  entryKey?: string;
  filename: string;
  mimeType?: string;
  sizeBytes: number;
}): Promise<UploadTicket> {
  const engagement = await requireEngagement(input.token);

  if (input.sizeBytes > MAX_UPLOAD_BYTES) {
    throw new UploadTooLargeError();
  }

  const storagePath = `${engagement.id}/${input.fieldKey}/${randomUUID()}${safeExtension(input.filename)}`;

  const { data, error } = await getStorage()
    .storage.from(intakeBucket())
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new Error(
      `Could not create an upload URL: ${error?.message ?? "unknown"}`,
    );
  }

  const [row] = await getDb()
    .insert(intakeFiles)
    .values({
      engagementId: engagement.id,
      entryKey: input.entryKey ?? null,
      fieldKey: input.fieldKey,
      mimeType: input.mimeType ?? null,
      originalName: input.filename,
      sizeBytes: input.sizeBytes,
      step: null,
      storagePath,
    })
    .returning({ id: intakeFiles.id });

  if (!row) throw new Error("Could not record the upload.");

  return { fileId: row.id, uploadUrl: data.signedUrl, storagePath };
}

/** Thrown when a file exceeds the ceiling. Handled gently at the surface. */
export class UploadTooLargeError extends Error {
  constructor() {
    super("That file is too large.");
    this.name = "UploadTooLargeError";
  }
}

/**
 * Writes a text object we produced ourselves into the same private bucket, and
 * records it as a delivered file (PORT-21).
 *
 * A fetched page is a source like any other, so it gets the shape every other
 * source has: an object in the bucket and a row that points at it. One shape
 * means one query lists every source, one renderer prints them in the intake
 * document, and one card shows the client what happened to each.
 *
 * Unlike `issueUploadTicket` this writes the bytes itself, because they never
 * belonged to the browser — nothing here is a client upload path and no signed
 * URL is minted. The row is delivered on arrival for the same reason: there is
 * no second party whose PUT we are waiting on.
 */
export async function writeSourceObject(input: {
  engagementId: string;
  fieldKey: string;
  /** What the source was — a URL, for a fetched page. */
  name: string;
  text: string;
}): Promise<{ fileId: string; storagePath: string }> {
  const bytes = new TextEncoder().encode(input.text);
  const storagePath = `${input.engagementId}/${input.fieldKey}/${randomUUID()}.txt`;

  const { error } = await getStorage()
    .storage.from(intakeBucket())
    .upload(storagePath, bytes, { contentType: "text/plain; charset=utf-8" });

  if (error) {
    throw new Error(`Could not store the source: ${error.message}`);
  }

  const [row] = await getDb()
    .insert(intakeFiles)
    .values({
      engagementId: input.engagementId,
      entryKey: null,
      fieldKey: input.fieldKey,
      mimeType: "text/plain",
      originalName: input.name,
      sizeBytes: bytes.byteLength,
      step: null,
      storagePath,
      uploadedAt: new Date(),
    })
    .returning({ id: intakeFiles.id });

  if (!row) throw new Error("Could not record the source.");

  return { fileId: row.id, storagePath };
}

/**
 * Marks a reserved file as actually delivered.
 *
 * A row without `uploadedAt` is a started-and-abandoned upload. Keeping the
 * distinction means the intake document (INT-7) can list what really arrived
 * rather than what was merely attempted.
 */
export async function confirmUpload(
  token: string,
  fileId: string,
): Promise<void> {
  const engagement = await requireEngagement(token);

  await getDb()
    .update(intakeFiles)
    .set({ uploadedAt: new Date() })
    .where(
      and(
        eq(intakeFiles.id, fileId),
        // Scoped to the engagement the token resolves to, so one client's
        // token can never confirm another client's file.
        eq(intakeFiles.engagementId, engagement.id),
      ),
    );
}

/**
 * Pulls one uploaded object's bytes back out of the private bucket.
 *
 * The only reader is the transcription service, and it needs the bytes rather
 * than a link because the vendor is sent a file, not a URL — which is also the
 * safer arrangement: no signed URL to a client's voice note ever exists
 * outside this process.
 */
export async function downloadUpload(storagePath: string): Promise<Uint8Array> {
  const { data, error } = await getStorage()
    .storage.from(intakeBucket())
    .download(storagePath);

  if (error || !data) {
    throw new Error(`Could not read the upload: ${error?.message ?? "unknown"}`);
  }

  return new Uint8Array(await data.arrayBuffer());
}

/**
 * Files already delivered for one field, oldest first.
 *
 * The transcript columns ride along in the projection because the one surface
 * that needs them — step 7's voice-note card — already calls this per field,
 * and six more columns on a query that returns at most a handful of rows is
 * free. There is nothing to join to.
 */
export async function listUploads(engagementId: string, fieldKey: string) {
  return getDb()
    .select({
      id: intakeFiles.id,
      entryKey: intakeFiles.entryKey,
      mimeType: intakeFiles.mimeType,
      originalName: intakeFiles.originalName,
      sizeBytes: intakeFiles.sizeBytes,
      uploadedAt: intakeFiles.uploadedAt,
      transcript: intakeFiles.transcript,
      transcriptAttempts: intakeFiles.transcriptAttempts,
      transcriptEditedAt: intakeFiles.transcriptEditedAt,
      transcriptStatus: intakeFiles.transcriptStatus,
    })
    .from(intakeFiles)
    .where(
      and(
        eq(intakeFiles.engagementId, engagementId),
        eq(intakeFiles.fieldKey, fieldKey),
      ),
    )
    .orderBy(asc(intakeFiles.createdAt));
}

/**
 * Signs download URLs for a set of files so the intake document can link them.
 *
 * A per-file failure yields `url: null` rather than throwing. Taylor getting a
 * document with one dead link and a note saying so is strictly better than
 * getting no document because one object had moved.
 */
export async function linkUploads(
  engagementId: string,
  expiresInSeconds: number,
): Promise<
  Array<{
    /** The row id — what step 9's home shortlist stores when a file is ticked. */
    id: string;
    fieldKey: string;
    entryKey: string | null;
    originalName: string | null;
    sizeBytes: number | null;
    uploadedAt: Date | null;
    url: string | null;
    /** Null on every file that is not a transcribed voice note. */
    transcript: string | null;
    /** Null means no person has read what the machine wrote (D-PORT-3). */
    transcriptEditedAt: Date | null;
  }>
> {
  const rows = await getDb()
    .select()
    .from(intakeFiles)
    .where(eq(intakeFiles.engagementId, engagementId))
    .orderBy(asc(intakeFiles.createdAt));

  return Promise.all(
    rows.map(async (row) => {
      let url: string | null = null;

      try {
        const { data } = await getStorage()
          .storage.from(intakeBucket())
          .createSignedUrl(row.storagePath, expiresInSeconds);
        url = data?.signedUrl ?? null;
      } catch {
        url = null;
      }

      return {
        id: row.id,
        fieldKey: row.fieldKey,
        entryKey: row.entryKey,
        originalName: row.originalName,
        sizeBytes: row.sizeBytes,
        uploadedAt: row.uploadedAt,
        url,
        transcript: row.transcript,
        transcriptEditedAt: row.transcriptEditedAt,
      };
    }),
  );
}

/**
 * Marks an engagement finished. Monotonic: set once, never unset.
 *
 * Returns false when it was already complete, so a client revisiting the Done
 * screen does not re-trigger the document email.
 */
export async function markComplete(engagementId: string): Promise<boolean> {
  const now = new Date();

  const [row] = await getDb()
    .update(engagements)
    .set({ completedAt: now, lastActivityAt: now, updatedAt: now })
    .where(
      and(eq(engagements.id, engagementId), isNull(engagements.completedAt)),
    )
    .returning({ id: engagements.id });

  return Boolean(row);
}
