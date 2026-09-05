"use server";

import { z } from "zod";
import { requireEngagement } from "@/server/services/engagement";
import { ExtractionUnavailableError } from "@/server/services/extract";
import {
  MAX_BRIEF_CHARS,
  searchForStyle,
  type StyleSearchResult,
} from "@/server/services/style-search";

/**
 * What the surface gets back. A result, never a thrown error.
 *
 * Same reasoning as `suggestComeAcross` and `extractPastedEntries`: the client
 * has to be told the difference between "wait a minute" and "say a little
 * first" to read the right sentence, and an exception crossing the action
 * boundary arrives as an opaque digest.
 */
export type StyleSearchOutcome =
  | { ok: true; results: StyleSearchResult[] }
  | { ok: false; reason: "rate_limited" | "empty" | "failed" | "link" };

const input = z.object({
  token: z.string().min(1),
  /**
   * The one thing posted from the browser, so a client need not wait for
   * autosave before pressing a button about the sentence they just typed.
   * Everything else the search reads is loaded server-side from their stored
   * answers, where a fabricated request cannot reach it.
   */
  brief: z.string().max(MAX_BRIEF_CHARS),
});

/**
 * Looks for real sites that feel like what this client described.
 *
 * Thin: resolve the token through the seam, refuse anything that is not this
 * track, call the service, hand back a result. Nothing here writes — a link
 * becomes an answer only when the client presses it into their own list and
 * their own autosave carries it.
 */
export async function searchStyle(
  token: unknown,
  brief: unknown,
): Promise<StyleSearchOutcome> {
  const parsed = input.safeParse({ token, brief });
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
    return {
      ok: true,
      results: await searchForStyle(
        engagement.id,
        engagement.answers,
        parsed.data.brief,
      ),
    };
  } catch (error) {
    if (error instanceof ExtractionUnavailableError) {
      return { ok: false, reason: error.reason };
    }

    console.error(
      "[style-search] unexpected failure",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, reason: "failed" };
  }
}
