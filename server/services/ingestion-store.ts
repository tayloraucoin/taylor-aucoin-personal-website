import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagements } from "@/db/schema";
import {
  mergeIngestion,
  readIngestionRecord,
  statusFor,
  type IngestionOutcome,
  type IngestionRecord,
} from "@/lib/intake/ingestion-record";
import { schemaFor } from "@/lib/intake/tracks";

/**
 * Where the ingestion run's values land, and the rule that makes it one-shot.
 *
 * **One transaction, under a row lock.** `saveStepAnswers` replaces a step's
 * object wholesale — two writers on one step erase each other — so this reads
 * the whole document `FOR UPDATE`, merges each touched step's object field by
 * field, and writes every step key plus the record in one `UPDATE`. Nothing
 * here happens from a client hook.
 *
 * **The one-shot rule lives here, in the database.** The step's UI hides the
 * button after a run; this is what makes that true rather than decorative. A
 * second commit for an engagement that already holds `answers.ingestion`
 * returns `already_ran` and writes nothing — so a client who pressed twice, or
 * whose first press timed out on the browser side after the server finished,
 * cannot have one run's values written over by another's.
 *
 * **The run counts when it lands, never when it starts.** A run that threw
 * before this point wrote nothing and left the step runnable; that is the
 * deliberate answer to "does a closed tab count".
 *
 * The record sits at the top-level `ingestion` key, beside `primer`, for
 * M-PORT-26's reason: invisible to the intake document's step loop by
 * construction, untouchable by a step save.
 */
export type CommitResult =
  | { status: "committed"; record: IngestionRecord }
  | { status: "already_ran"; record: IngestionRecord };

export async function commitIngestion(
  engagementId: string,
  track: "showcase",
  outcome: IngestionOutcome,
): Promise<CommitResult> {
  return getDb().transaction(async (tx) => {
    const [row] = await tx
      .select({ answers: engagements.answers })
      .from(engagements)
      .where(eq(engagements.id, engagementId))
      .for("update");

    if (!row) throw new Error("Engagement vanished under the lock.");

    const existing = readIngestionRecord(row.answers);
    if (existing) return { status: "already_ran", record: existing };

    // Each touched step's current object, narrowed by its own schema exactly
    // as `readStepAnswers` narrows it, so the merge sees what the form sees.
    const document = (row.answers ?? {}) as Record<string, unknown>;
    const touched = new Set([
      ...outcome.fields.map((f) => f.stepKey),
      ...outcome.batches.map((b) => b.stepKey),
    ]);
    const current: Record<string, Record<string, unknown>> = {};
    for (const stepKey of touched) {
      const schema = schemaFor(track, stepKey);
      const parsed = schema?.safeParse(document[stepKey] ?? {});
      current[stepKey] =
        parsed?.success ? (parsed.data as Record<string, unknown>) : {};
    }

    const { patch, fields } = mergeIngestion(current, outcome);

    // Each step object goes back through its shape guard, so the store can
    // never write a field the schema does not know — the same law autosave
    // follows, applied to the machine's writes.
    const guarded: Record<string, unknown> = {};
    for (const [stepKey, object] of Object.entries(patch)) {
      const schema = schemaFor(track, stepKey);
      const parsed = schema?.safeParse(object);
      if (parsed?.success) guarded[stepKey] = parsed.data;
    }

    const record: IngestionRecord = {
      status: statusFor(fields, outcome.failed),
      ranAt: new Date().toISOString(),
      sourceChars: outcome.sourceChars,
      sourceDigest: outcome.sourceDigest,
      fields,
      failed: outcome.failed,
      ...(outcome.omitted?.length ? { omitted: outcome.omitted } : {}),
      ...(outcome.notReady?.length ? { notReady: outcome.notReady } : {}),
    };

    const now = new Date();
    await tx
      .update(engagements)
      .set({
        answers: sql`${engagements.answers} || ${JSON.stringify({ ...guarded, ingestion: record })}::jsonb`,
        lastActivityAt: now,
        updatedAt: now,
      })
      .where(eq(engagements.id, engagementId));

    return { status: "committed", record };
  });
}
