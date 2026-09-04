"use server";

import { transcriptSaveInput } from "@/lib/validators/intake";
import { requireEngagement } from "@/server/services/engagement";
import { saveTranscript } from "@/server/services/voice-transcription";

/**
 * What the surface gets back. A result, never a thrown error.
 *
 * Same reasoning as `saveStep` and `extractPastedEntries`: an exception
 * crossing the server-action boundary arrives as an opaque digest, and the
 * card has to tell "try again" apart from "this link has expired" to say the
 * right sentence.
 */
export type SaveTranscriptResult =
  | { ok: true }
  | { ok: false; reason: "failed" | "link" };

/**
 * Saves the client's corrections to a machine-written text.
 *
 * Thin: validate, resolve through the seam, call the service, return. The text
 * belongs to a file row rather than to the answers document (M-PORT-29), so
 * this does not go anywhere near `saveStepAnswers` — which is also what stops
 * a step save from clobbering it.
 *
 * **Two callers, one act.** Step 7's voice card corrects a transcription of
 * audio; step 1's source list corrects a reading of a document or a fetched
 * page. Named for the act rather than for the first thing that needed it —
 * it was `saveTranscriptEdit` until PORT-21 gave it its second caller, and a
 * function called "voice" saving a PDF's reading would be a name that lies.
 *
 * The text itself is never logged. It is the most disclosive material this
 * form holds.
 */
export async function saveTranscriptEdit(
  token: unknown,
  fileId: unknown,
  transcript: unknown,
): Promise<SaveTranscriptResult> {
  const parsed = transcriptSaveInput.safeParse({ token, fileId, transcript });
  if (!parsed.success) return { ok: false, reason: "failed" };

  let engagement;
  try {
    engagement = await requireEngagement(parsed.data.token);
  } catch {
    return { ok: false, reason: "link" };
  }

  // Belongs to the coded track or it does not happen. The durable
  // questionnaire has no recorder and no transcript to save.
  if (engagement.track !== "showcase") return { ok: false, reason: "failed" };

  try {
    await saveTranscript(
      parsed.data.token,
      parsed.data.fileId,
      parsed.data.transcript,
    );
    return { ok: true };
  } catch (error) {
    console.error(
      "[transcribe] transcript save failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, reason: "failed" };
  }
}
