"use server";

import { saveStepInput } from "@/lib/validators/intake";
import { EngagementNotFoundError } from "@/server/services/engagement";
import { saveStepAnswers } from "@/server/services/submission";

export type SaveStepResult =
  | { ok: true }
  | { ok: false; reason: "link" | "server" };

/**
 * Persists one step's answers.
 *
 * Thin: validate, call the service, return. It reports a result instead of
 * throwing because the caller is an autosave loop that has to decide between
 * retrying and telling the client something — an exception crossing the
 * server-action boundary would arrive as an opaque digest with none of that
 * distinction intact.
 *
 * `link` means the token stopped resolving and retrying will not help.
 * `server` means try again; the client keeps its local copy either way, so no
 * answer is lost while this is failing.
 *
 * The catch never logs the payload. What went wrong is worth recording; what
 * the client typed is not.
 */
export async function saveStep(
  token: string,
  stepKey: string,
  answers: Record<string, unknown>,
): Promise<SaveStepResult> {
  const parsed = saveStepInput.safeParse({ token, stepKey, answers });
  if (!parsed.success) return { ok: false, reason: "server" };

  try {
    await saveStepAnswers(parsed.data.token, parsed.data.stepKey, parsed.data.answers);
    return { ok: true };
  } catch (error) {
    if (error instanceof EngagementNotFoundError) return { ok: false, reason: "link" };

    console.error(
      `[intake] save failed for step ${parsed.data.stepKey}`,
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, reason: "server" };
  }
}
