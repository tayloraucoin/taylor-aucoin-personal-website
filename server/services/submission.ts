import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagements, intakeFiles } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import type { IntakeStepKey } from "@/lib/types/intake";
import { MAX_UPLOAD_BYTES, STEP_SCHEMAS } from "@/lib/validators/intake";
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
  stepKey: IntakeStepKey,
  answers: Record<string, unknown>,
): Promise<void> {
  const engagement = await requireEngagement(token);

  const parsed = guardShape(stepKey, answers);
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
  stepKey: IntakeStepKey,
  answers: Record<string, unknown>,
): unknown {
  const schema = STEP_SCHEMAS[stepKey];
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
export function readStepAnswers<K extends IntakeStepKey>(
  answers: unknown,
  stepKey: K,
): Record<string, unknown> {
  const document = (answers ?? {}) as Record<string, unknown>;
  const stored = document[stepKey];

  const result = STEP_SCHEMAS[stepKey].safeParse(stored ?? {});
  return result.success ? (result.data as Record<string, unknown>) : {};
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

const BUCKET = "intake";

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
  stepKey: IntakeStepKey;
  fieldKey: string;
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
    .storage.from(BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new Error(`Could not create an upload URL: ${error?.message ?? "unknown"}`);
  }

  const [row] = await getDb()
    .insert(intakeFiles)
    .values({
      engagementId: engagement.id,
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

/** Files already delivered for one field, oldest first. */
export async function listUploads(engagementId: string, fieldKey: string) {
  return getDb()
    .select({
      id: intakeFiles.id,
      originalName: intakeFiles.originalName,
      sizeBytes: intakeFiles.sizeBytes,
      uploadedAt: intakeFiles.uploadedAt,
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
    fieldKey: string;
    originalName: string | null;
    sizeBytes: number | null;
    uploadedAt: Date | null;
    url: string | null;
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
          .storage.from(BUCKET)
          .createSignedUrl(row.storagePath, expiresInSeconds);
        url = data?.signedUrl ?? null;
      } catch {
        url = null;
      }

      return {
        fieldKey: row.fieldKey,
        originalName: row.originalName,
        sizeBytes: row.sizeBytes,
        uploadedAt: row.uploadedAt,
        url,
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
    .where(and(eq(engagements.id, engagementId), isNull(engagements.completedAt)))
    .returning({ id: engagements.id });

  return Boolean(row);
}
