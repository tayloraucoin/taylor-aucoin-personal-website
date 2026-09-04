"use server";

import { z } from "zod";
import { requireEngagement } from "@/server/services/engagement";
import {
  DocumentReadingError,
  readUploadedFile,
  type ReadingFailure,
} from "@/server/services/document-reading";

/**
 * What the surface gets back. A result, never a thrown error — the reasoning
 * every action on this track follows.
 *
 * The text itself does not come back. It is on the file's own row, rendered
 * beside the file it came from; returning it here would invite a caller to
 * show a wall of transcription where a client expected a list of their files.
 */
export type ReadSourceResult =
  | { ok: true }
  | { ok: false; reason: ReadingFailure | "link" };

const input = z.object({
  token: z.string().min(1),
  fileId: z.string().uuid(),
});

/**
 * Reads one file a client just attached (PORT-21).
 *
 * Called by the step as soon as an upload confirms rather than when the client
 * presses the button, so a sixty-page deck's minute of transcription is spent
 * while they are still pasting — and so they can read and correct what we made
 * of it before it is used for anything.
 *
 * **Failing is ordinary here.** A Keynote, a scan we cannot make out, a file
 * that is simply too big: every one of them leaves a stored, linked, complete
 * file behind, which is exactly what this step delivered before it could read
 * anything at all. So the caller shows a line and moves on.
 */
export async function readSourceFile(
  token: unknown,
  fileId: unknown,
): Promise<ReadSourceResult> {
  const parsed = input.safeParse({ token, fileId });
  if (!parsed.success) return { ok: false, reason: "failed" };

  let engagement;
  try {
    engagement = await requireEngagement(parsed.data.token);
  } catch {
    return { ok: false, reason: "link" };
  }

  // Belongs to the coded track or it does not happen.
  if (engagement.track !== "showcase") return { ok: false, reason: "failed" };

  try {
    await readUploadedFile(parsed.data.token, parsed.data.fileId);
    return { ok: true };
  } catch (error) {
    if (error instanceof DocumentReadingError) {
      return { ok: false, reason: error.reason };
    }

    // The message, never the file, its name, or its contents.
    console.error(
      "[read-source] unexpected failure",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, reason: "failed" };
  }
}
