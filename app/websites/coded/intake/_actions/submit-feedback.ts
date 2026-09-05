"use server";

import { z } from "zod";
import { getDb } from "@/db/client";
import { intakeFeedback } from "@/db/schema";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";

/**
 * What the surface gets back. A result, never a thrown error.
 *
 * Same reasoning as `saveStep` and `saveTranscriptEdit`: an exception crossing
 * the server-action boundary arrives as an opaque digest, and the form has to
 * tell "try again" apart from "this link has expired".
 */
export type SubmitFeedbackResult =
  | { ok: true }
  | { ok: false; reason: "failed" | "link" | "empty" };

const score = z.coerce.number().int().min(1).max(7).nullish();

const input = z.object({
  token: z.string().min(1),
  enjoyment: score,
  confidence: score,
  thoughts: z.string().trim().max(5000).nullish(),
});

/**
 * Files what a client thought of the intake.
 *
 * Offered on the done screen, after the questionnaire is finished and there is
 * nothing left they could be answering for us. That placement is the whole
 * ethics of the thing: asking someone to rate a form while they are still
 * filling it in is asking them to perform while they still want something.
 *
 * **Every field is optional, and an empty submission is refused rather than
 * stored.** A row of three nulls says nothing and would still count as
 * feedback in any later read of the table.
 *
 * The text is never logged. Someone writing candidly about working with us has
 * done us a favour, and the log is not where that lands.
 */
export async function submitIntakeFeedback(
  values: unknown,
): Promise<SubmitFeedbackResult> {
  const parsed = input.safeParse(values);
  if (!parsed.success) return { ok: false, reason: "failed" };

  const { token, enjoyment, confidence, thoughts } = parsed.data;
  const text = thoughts?.trim() ? thoughts.trim() : null;

  if (enjoyment == null && confidence == null && text === null) {
    return { ok: false, reason: "empty" };
  }

  let engagement;
  try {
    engagement = await requireEngagement(token);
  } catch (error) {
    if (error instanceof EngagementNotFoundError) {
      return { ok: false, reason: "link" };
    }
    throw error;
  }

  try {
    await getDb().insert(intakeFeedback).values({
      engagementId: engagement.id,
      enjoyment: enjoyment ?? null,
      confidence: confidence ?? null,
      thoughts: text,
    });
  } catch (error) {
    console.error(
      "[intake-feedback] insert failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, reason: "failed" };
  }

  return { ok: true };
}
