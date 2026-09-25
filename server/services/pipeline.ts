import { and, asc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db/client";
import {
  engagementEmails,
  engagements,
  engagementStepCompletions,
  pipelineSteps,
  type PipelineStepRow,
} from "@/db/schema";
import {
  renderPipelineTemplate,
  resolveTemplateValues,
  valuesToRemember,
} from "@/lib/pipeline/template";
import type { PipelineValues, PromptTarget } from "@/lib/types/pipeline";
import {
  pipelineEngagementId,
  pipelineStepId,
  pipelineStepInput,
  reorderPipelineInput,
  setStepDoneInput,
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
  | "promptTarget"
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
  promptTarget: pipelineSteps.promptTarget,
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
  for (
    let depth = 0;
    depth < 4 && current && typeof current === "object";
    depth++
  ) {
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
export async function reorderPipelineSteps(
  raw: readonly string[],
): Promise<void> {
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

  if (await isStepUsed(id))
    throw new PipelineStepRejected(USED_ON_AN_ENGAGEMENT);

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

/** One step as it stands on one engagement (PIPE-3). */
export type EngagementPipelineStep = {
  id: string;
  title: string;
  archived: boolean;
  completedAt: Date | null;
  /** The prompt with this engagement's values filled; null on an email-only step. */
  prompt: string | null;
  /** Names the prompt uses that have no value yet. */
  promptUnresolved: string[];
  /** Where the prompt runs (PIPE-6); null exactly when `prompt` is. */
  promptTarget: PromptTarget | null;
  /** The email template, unrendered — the send dialog renders it live. */
  email: { subject: string; body: string } | null;
  /** Every send of this step to this client, oldest first (PIPE-4). */
  sends: { at: Date; delivered: boolean }[];
};

export type EngagementPipeline = {
  steps: EngagementPipelineStep[];
  /** Record values with Taylor's saved values over them (M-PIPE-2). */
  values: Record<string, string | undefined>;
};

/**
 * The checklist for one engagement: every active step in order, then any
 * archived step this engagement already completed — marked archived, so the
 * record of what was done stays true after the playbook moves on.
 *
 * Values are resolved here, from the engagement id, and nowhere a browser can
 * choose them.
 */
export async function loadEngagementPipeline(
  engagementId: string,
): Promise<EngagementPipeline | null> {
  const id = pipelineEngagementId.safeParse(engagementId);
  if (!id.success) return null;

  const db = getDb();
  const [engagement] = await db
    .select({
      contactName: engagements.contactName,
      businessName: engagements.businessName,
      contactEmail: engagements.contactEmail,
      answers: engagements.answers,
      pipelineValues: engagements.pipelineValues,
    })
    .from(engagements)
    .where(eq(engagements.id, id.data));
  if (!engagement) return null;

  const [steps, completions, emails] = await Promise.all([
    db
      .select(STEP_COLUMNS)
      .from(pipelineSteps)
      .orderBy(...IN_ORDER),
    db
      .select({
        stepId: engagementStepCompletions.stepId,
        completedAt: engagementStepCompletions.completedAt,
      })
      .from(engagementStepCompletions)
      .where(eq(engagementStepCompletions.engagementId, id.data)),
    db
      .select({
        stepId: engagementEmails.stepId,
        createdAt: engagementEmails.createdAt,
        resendId: engagementEmails.resendId,
      })
      .from(engagementEmails)
      .where(eq(engagementEmails.engagementId, id.data))
      .orderBy(asc(engagementEmails.createdAt)),
  ]);

  const doneAt = new Map(
    completions.map((row) => [row.stepId, row.completedAt]),
  );
  const sendsByStep = new Map<string, { at: Date; delivered: boolean }[]>();
  for (const row of emails) {
    const list = sendsByStep.get(row.stepId) ?? [];
    list.push({ at: row.createdAt, delivered: row.resendId !== null });
    sendsByStep.set(row.stepId, list);
  }
  const values = resolveTemplateValues(engagement, engagement.pipelineValues);

  const shown = [
    ...steps.filter((step) => step.archivedAt === null),
    ...steps.filter(
      (step) =>
        step.archivedAt !== null &&
        (doneAt.has(step.id) || sendsByStep.has(step.id)),
    ),
  ];

  return {
    values,
    steps: shown.map((step) => {
      const rendered = step.prompt
        ? renderPipelineTemplate(step.prompt, values)
        : null;
      return {
        id: step.id,
        title: step.title,
        archived: step.archivedAt !== null,
        completedAt: doneAt.get(step.id) ?? null,
        prompt: rendered?.text ?? null,
        promptUnresolved: rendered?.unresolved ?? [],
        promptTarget: step.promptTarget,
        email:
          step.emailSubject !== null && step.emailBody !== null
            ? { subject: step.emailSubject, body: step.emailBody }
            : null,
        sends: sendsByStep.get(step.id) ?? [],
      };
    }),
  };
}

/**
 * Marks a step done or not done on one engagement (M-PIPE-5). Both directions
 * are idempotent: a double press inserts one row, an undo of an undone step
 * deletes nothing.
 */
export async function setStepDone(
  raw: z.input<typeof setStepDoneInput>,
): Promise<void> {
  const input = setStepDoneInput.parse(raw);
  const db = getDb();

  if (input.done) {
    await db
      .insert(engagementStepCompletions)
      .values({ engagementId: input.engagementId, stepId: input.stepId })
      .onConflictDoNothing({
        target: [
          engagementStepCompletions.engagementId,
          engagementStepCompletions.stepId,
        ],
      });
    return;
  }

  await db
    .delete(engagementStepCompletions)
    .where(
      and(
        eq(engagementStepCompletions.engagementId, input.engagementId),
        eq(engagementStepCompletions.stepId, input.stepId),
      ),
    );
}

/**
 * Remembers what Taylor typed at send time, so the next step that uses a name
 * opens with it filled (M-PIPE-2). Called only after a send succeeded.
 *
 * A record name is kept only when Taylor changed it — a corrected domain must
 * carry forward; an untouched first name must not freeze the record's value.
 * A record name set back to the record's own value clears any earlier
 * override, or the old correction would keep winning. One statement — remove
 * then merge with jsonb `-` and `||` — so there is no read-modify-write.
 */
export async function rememberPipelineValues(
  engagementId: string,
  typed: PipelineValues,
  fromRecord: Record<string, string | undefined>,
): Promise<void> {
  const { kept, cleared } = valuesToRemember(typed, fromRecord);
  if (Object.keys(kept).length === 0 && cleared.length === 0) return;

  await getDb()
    .update(engagements)
    .set({
      pipelineValues: sql`(${engagements.pipelineValues} - array(select jsonb_array_elements_text(${JSON.stringify(cleared)}::jsonb))) || ${JSON.stringify(kept)}::jsonb`,
    })
    .where(eq(engagements.id, engagementId));
}
