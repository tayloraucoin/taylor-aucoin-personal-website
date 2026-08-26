"use server";

import { z } from "zod";
import { requireEngagement } from "@/server/services/engagement";
import {
  extractEntries,
  ExtractionUnavailableError,
  type ExtractedEntry,
} from "@/server/services/extract";

/**
 * What the surface gets back. A result, never a thrown error.
 *
 * The client has to distinguish "try again" from "wait a minute" from "there
 * was nothing in there" to say the right sentence, and an exception crossing
 * the server-action boundary arrives as an opaque digest with none of that
 * intact — the same reasoning as `saveStep`.
 */
export type ExtractResult =
  | { ok: true; entries: ExtractedEntry[] }
  | { ok: false; reason: "rate_limited" | "empty" | "failed" | "link" };

const input = z.object({
  token: z.string().min(1),
  mode: z.enum(["experience", "projects"]),
  blob: z.string(),
});

/**
 * Sorts a pasted blob into entries for the client to review.
 *
 * Thin: resolve through the seam, call the service, return. The entries go to
 * the browser and nowhere else — this action writes nothing, which is what
 * makes "nothing saves as fact until you've seen it" true rather than merely
 * promised (D-PORT-3).
 *
 * The blob never appears in a log line here or below. Not on failure, not in
 * a warning, not in a returned payload.
 */
export async function extractPastedEntries(
  token: unknown,
  mode: unknown,
  blob: unknown,
): Promise<ExtractResult> {
  const parsed = input.safeParse({ token, mode, blob });
  if (!parsed.success) return { ok: false, reason: "failed" };

  let engagement;
  try {
    engagement = await requireEngagement(parsed.data.token);
  } catch {
    return { ok: false, reason: "link" };
  }

  // Belongs to the coded track or it does not happen. The durable
  // questionnaire has no extractor and no blob to sort.
  if (engagement.track !== "showcase") return { ok: false, reason: "failed" };

  try {
    const entries = await extractEntries(
      engagement.id,
      parsed.data.mode,
      parsed.data.blob,
    );
    return { ok: true, entries };
  } catch (error) {
    if (error instanceof ExtractionUnavailableError) {
      return { ok: false, reason: error.reason };
    }

    console.error(
      "[extract] unexpected failure",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, reason: "failed" };
  }
}
