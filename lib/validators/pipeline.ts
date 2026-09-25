import { z } from "zod";

/**
 * Validation for every engagement-pipeline write (PIPE), defined once and
 * shared by the server actions and `server/services/pipeline.ts`.
 *
 * Blank optional text is stored as null, never as an empty string: "this step
 * has no prompt" must have one representation, or the page and the database
 * will disagree about which steps carry one.
 */

export const pipelineStepId = z.uuid();

/** Trimmed-empty becomes null; anything else is kept exactly as typed. */
const blankToNull = (max: number) =>
  z
    .string()
    .max(max)
    .nullable()
    .transform((value) => (value === null || value.trim() === "" ? null : value));

export const pipelineStepInput = z
  .object({
    title: z.string().trim().min(1, "Give the step a title.").max(200),
    prompt: blankToNull(100_000),
    // A subject is one line. Surrounding whitespace is never intended.
    emailSubject: blankToNull(300).transform((value) => value?.trim() ?? null),
    emailBody: blankToNull(20_000),
  })
  .superRefine((value, ctx) => {
    // Mirrors `pipeline_steps_email_pair_check`, so the refusal arrives as a
    // field message instead of a constraint violation.
    if ((value.emailSubject === null) !== (value.emailBody === null)) {
      ctx.addIssue({
        code: "custom",
        path: [value.emailSubject === null ? "emailSubject" : "emailBody"],
        message: "An email needs both a subject and a body, or neither.",
      });
    }
  });

export type PipelineStepInput = z.input<typeof pipelineStepInput>;

/** The full active order, first to last (M-PIPE-6). */
export const reorderPipelineInput = z.array(pipelineStepId).max(500);
