import { z } from "zod";
import { BARE_NAME } from "@/lib/pipeline/template";

/**
 * Validation for every engagement-pipeline write (PIPE), defined once and
 * shared by the server actions and `server/services/pipeline.ts`.
 *
 * Blank optional text is stored as null, never as an empty string: "this step
 * has no prompt" must have one representation, or the page and the database
 * will disagree about which steps carry one.
 */

export const pipelineStepId = z.uuid();

/** An engagement, as the pipeline surfaces address it. */
export const pipelineEngagementId = z.uuid();

/** Trimmed-empty becomes null; anything else is kept exactly as typed. */
const blankToNull = (max: number) =>
  z
    .string()
    .max(max)
    .nullable()
    .transform((value) =>
      value === null || value.trim() === "" ? null : value,
    );

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

/** Done or not done, for one step on one engagement (PIPE-3). */
export const setStepDoneInput = z.object({
  engagementId: pipelineEngagementId,
  stepId: pipelineStepId,
  done: z.boolean(),
});

/**
 * One step's email, as Taylor finished it (PIPE-4). The recipient is not
 * here on purpose: the service reads it from the engagement row, so no form
 * can address a client's letter to someone else.
 */
export const sendStepEmailInput = z.object({
  engagementId: pipelineEngagementId,
  stepId: pipelineStepId,
  subject: z
    .string()
    .trim()
    .min(1, "Give the email a subject.")
    .max(300)
    .regex(/^[^\r\n]*$/, "A subject is one line."),
  body: z
    .string()
    .max(20_000)
    .refine((value) => value.trim() !== "", "Write the email before sending."),
  /** What Taylor typed into the variable fields, remembered on success. */
  values: z.record(z.string().max(64).regex(BARE_NAME), z.string().max(2000)),
});

export type SendStepEmailInput = z.input<typeof sendStepEmailInput>;
