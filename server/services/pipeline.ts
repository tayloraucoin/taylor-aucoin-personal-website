import { and, asc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db/client";
import {
  engagementEmails,
  engagementStepCompletions,
  pipelineSteps,
  type PipelineStepRow,
} from "@/db/schema";
import {
  pipelineStepId,
  pipelineStepInput,
  reorderPipelineInput,
} from "@/lib/validators/pipeline";

/**
 * The delivery playbook (PIPE): the ordered steps every engagement runs
 * through, and the one home for every rule about them.
 *
 * Actions are thin and call these; nothing else writes `pipeline_steps`.
 * Prompt and template text never appears in a log line or an error message
 * from here — ids only, tagged `[pipeline]`.
 */

/** A refusal that is an ordinary state of the work, worded for Taylor. */
export class PipelineStepRejected extends Error {}

export type PipelineStep = Pick<
  PipelineStepRow,
  | "id"
  | "title"
  | "prompt"
  | "emailSubject"
  | "emailBody"
  | "position"
  | "archivedAt"
  | "updatedAt"
>;

const STEP_COLUMNS = {
  id: pipelineSteps.id,
  title: pipelineSteps.title,
  prompt: pipelineSteps.prompt,
  emailSubject: pipelineSteps.emailSubject,
  emailBody: pipelineSteps.emailBody,
  position: pipelineSteps.position,
  archivedAt: pipelineSteps.archivedAt,
  updatedAt: pipelineSteps.updatedAt,
};

/** The tiebreak makes a transient duplicate position harmless (M-PIPE-6). */
const IN_ORDER = [asc(pipelineSteps.position), asc(pipelineSteps.createdAt)];

const USED_ON_AN_ENGAGEMENT =
  "This step has been used on an engagement. Archive it instead.";

/** Postgres `foreign_key_violation`, however deep the driver wrapped it. */
function isForeignKeyViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth++) {
    if ((current as { code?: unknown }).code === "23503") return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

/** Active steps in order, then archived steps, most recently archived first. */
export async function listPipelineSteps(): Promise<{
  active: PipelineStep[];
  archived: PipelineStep[];
}> {
  const db = getDb();

  const [active, archived] = await Promise.all([
    db
      .select(STEP_COLUMNS)
      .from(pipelineSteps)
      .where(isNull(pipelineSteps.archivedAt))
      .orderBy(...IN_ORDER),
    db
      .select(STEP_COLUMNS)
      .from(pipelineSteps)
      .where(isNotNull(pipelineSteps.archivedAt))
      .orderBy(sql`${pipelineSteps.archivedAt} desc`),
  ]);

  return { active, archived };
}

/**
 * Whether a step has history: a completion on, or an email sent to, any
 * engagement. A used step cannot be deleted (M-PIPE-4).
 */
async function isStepUsed(id: string): Promise<boolean> {
  const db = getDb();
  const [completion] = await db
    .select({ id: engagementStepCompletions.id })
    .from(engagementStepCompletions)
    .where(eq(engagementStepCompletions.stepId, id))
    .limit(1);
  if (completion) return true;

  const [email] = await db
    .select({ id: engagementEmails.id })
    .from(engagementEmails)
    .where(eq(engagementEmails.stepId, id))
    .limit(1);
  return Boolean(email);
}

/** One step and whether it has history, or null for an unknown id. */
export async function getPipelineStep(
  rawId: string,
): Promise<(PipelineStep & { used: boolean }) | null> {
  const parsed = pipelineStepId.safeParse(rawId);
  if (!parsed.success) return null;

  const db = getDb();
  const [step] = await db
    .select(STEP_COLUMNS)
    .from(pipelineSteps)
    .where(eq(pipelineSteps.id, parsed.data));
  if (!step) return null;

  return { ...step, used: await isStepUsed(step.id) };
}

/** One past the last position of any step, active or not. */
async function nextPosition(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ max: sql<number | null>`max(${pipelineSteps.position})` })
    .from(pipelineSteps);
  return (row?.max ?? -1) + 1;
}

/** A new step goes last. Returns its id. */
export async function createPipelineStep(
  raw: z.input<typeof pipelineStepInput>,
): Promise<string> {
  const input = pipelineStepInput.parse(raw);
  const db = getDb();

  const [row] = await db
    .insert(pipelineSteps)
    .values({ ...input, position: await nextPosition() })
    .returning({ id: pipelineSteps.id });

  return row!.id;
}

export async function updatePipelineStep(
  rawId: string,
  raw: z.input<typeof pipelineStepInput>,
): Promise<void> {
  const id = pipelineStepId.parse(rawId);
  const input = pipelineStepInput.parse(raw);
  const db = getDb();

  const updated = await db
    .update(pipelineSteps)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(pipelineSteps.id, id))
    .returning({ id: pipelineSteps.id });

  if (updated.length === 0) {
    throw new PipelineStepRejected("That step no longer exists.");
  }
}

/**
 * Archive takes a step out of new work; unarchive puts it back at the end,
 * which is the one position that cannot silently reorder anything else.
 */
export async function setPipelineStepArchived(
  rawId: string,
  archived: boolean,
): Promise<void> {
  const id = pipelineStepId.parse(rawId);
  const db = getDb();
  const now = new Date();

  const updated = await db
    .update(pipelineSteps)
    .set(
      archived
        ? { archivedAt: now, updatedAt: now }
        : { archivedAt: null, position: await nextPosition(), updatedAt: now },
    )
    .where(eq(pipelineSteps.id, id))
    .returning({ id: pipelineSteps.id });

  if (updated.length === 0) {
    throw new PipelineStepRejected("That step no longer exists.");
  }
}

/**
 * Rewrites every active position to 0..n-1 in the order given (M-PIPE-6).
 *
 * The list must be exactly the current active set. A tab opened before a step
 * was added, archived, or deleted would otherwise drop or resurrect one by
 * reordering a list that no longer exists.
 */
export async function reorderPipelineSteps(raw: readonly string[]): Promise<void> {
  const ids = reorderPipelineInput.parse(raw);
  const db = getDb();

  await db.transaction(async (tx) => {
    const current = await tx
      .select({ id: pipelineSteps.id })
      .from(pipelineSteps)
      .where(isNull(pipelineSteps.archivedAt));

    const currentIds = new Set(current.map((row) => row.id));
    const sameSet =
      ids.length === currentIds.size &&
      new Set(ids).size === ids.length &&
      ids.every((id) => currentIds.has(id));

    if (!sameSet) {
      throw new PipelineStepRejected(
        "The steps changed somewhere else. The list has been reloaded — try that again.",
      );
    }

    for (const [position, id] of ids.entries()) {
      await tx
        .update(pipelineSteps)
        .set({ position })
        .where(and(eq(pipelineSteps.id, id), isNull(pipelineSteps.archivedAt)));
    }
  });
}

/**
 * Deletes a step made in error. A step with history is refused — by the check
 * here for the message, and by the `restrict` foreign keys for the guarantee
 * (M-PIPE-4).
 */
export async function deletePipelineStep(rawId: string): Promise<void> {
  const id = pipelineStepId.parse(rawId);

  if (await isStepUsed(id)) throw new PipelineStepRejected(USED_ON_AN_ENGAGEMENT);

  try {
    await getDb().delete(pipelineSteps).where(eq(pipelineSteps.id, id));
  } catch (error) {
    // A completion or a send landed between the check and the delete.
    if (isForeignKeyViolation(error)) {
      throw new PipelineStepRejected(USED_ON_AN_ENGAGEMENT);
    }
    throw error;
  }
}
