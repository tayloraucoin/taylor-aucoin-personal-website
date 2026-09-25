"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { adminRoutes } from "@/lib/routes";
import type { PipelineStepInput } from "@/lib/validators/pipeline";
import { requireAdmin } from "@/server/services/admin-auth";
import {
  createPipelineStep,
  deletePipelineStep,
  PipelineStepRejected,
  reorderPipelineSteps,
  setPipelineStepArchived,
  updatePipelineStep,
} from "@/server/services/pipeline";

/**
 * Every write on the playbook surface (PIPE-2).
 *
 * Thin by construction: authorise, call the service (which validates),
 * revalidate, return. Refusals come back as words, because each is an
 * ordinary state of editing a list — a stale tab, a used step, an email with
 * no subject — and none should look like a crash.
 */

export type StepField = "title" | "prompt" | "emailSubject" | "emailBody";

export type StepResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; message: string; field?: StepField; stale?: boolean };

const FIELDS: readonly StepField[] = [
  "title",
  "prompt",
  "emailSubject",
  "emailBody",
];

function failed(error: unknown): {
  ok: false;
  message: string;
  field?: StepField;
} {
  if (error instanceof PipelineStepRejected) {
    return { ok: false, message: error.message };
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const field = FIELDS.find((name) => name === issue?.path[0]);
    return { ok: false, message: issue?.message ?? "Check the fields.", field };
  }
  console.error("[pipeline] step action failed");
  return { ok: false, message: "That didn't save. Try again." };
}

/**
 * The list, every step's page, and each engagement's checklist all read the
 * same rows; one layout-level revalidation cannot miss one of them.
 */
function revalidateAll(): void {
  revalidatePath(adminRoutes.pipeline, "layout");
  revalidatePath(adminRoutes.engagements, "layout");
}

export async function createStepAction(
  input: PipelineStepInput,
): Promise<StepResult<string>> {
  await requireAdmin();
  try {
    const id = await createPipelineStep(input);
    revalidateAll();
    return { ok: true, data: id };
  } catch (error) {
    return failed(error);
  }
}

export async function updateStepAction(
  id: string,
  input: PipelineStepInput,
): Promise<StepResult> {
  await requireAdmin();
  try {
    await updatePipelineStep(id, input);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

export async function setStepArchivedAction(
  id: string,
  archived: boolean,
): Promise<StepResult> {
  await requireAdmin();
  try {
    await setPipelineStepArchived(id, archived);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

export async function reorderStepsAction(ids: string[]): Promise<StepResult> {
  await requireAdmin();
  try {
    await reorderPipelineSteps(ids);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    // A stale set is the one refusal the list answers by reloading.
    const result = failed(error);
    return error instanceof PipelineStepRejected
      ? { ...result, stale: true }
      : result;
  }
}

export async function deleteStepAction(id: string): Promise<StepResult> {
  await requireAdmin();
  try {
    await deletePipelineStep(id);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}
