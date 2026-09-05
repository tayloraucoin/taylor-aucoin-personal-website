"use server";

import { z } from "zod";
import {
  predictComeAcross,
  type ComeAcrossSuggestion,
} from "@/server/services/come-across";
import { requireEngagement } from "@/server/services/engagement";
import { ExtractionUnavailableError } from "@/server/services/extract";

/**
 * What the surface gets back. A result, never a thrown error — the same
 * reasoning as `extractPastedEntries`: the client has to distinguish "wait a
 * minute" from "answer a few more questions first" to say the right sentence,
 * and an exception crossing the action boundary arrives as an opaque digest.
 */
export type ComeAcrossResult =
  | { ok: true; suggestion: ComeAcrossSuggestion }
  | { ok: false; reason: "rate_limited" | "empty" | "failed" | "link" };

const input = z.object({ token: z.string().min(1) });

/**
 * Proposes how this client wants to come across, from what they have written.
 *
 * Thin, and it takes nothing but the token: **the material is read
 * server-side from the engagement's own answers**, never sent up from the
 * browser. A client's answers are already ours; accepting them back from a
 * request would mean a fabricated call could put words in the model's mouth
 * and get them handed back looking like the client's own — the same reasoning
 * that makes the pay screen name a plan rather than an amount.
 *
 * Nothing here writes. The suggestion goes to the browser, the client presses
 * one of them, and it lands through their own next autosave.
 */
export async function suggestComeAcross(
  token: unknown,
): Promise<ComeAcrossResult> {
  const parsed = input.safeParse({ token });
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
      suggestion: await predictComeAcross(engagement.id, engagement.answers),
    };
  } catch (error) {
    if (error instanceof ExtractionUnavailableError) {
      return { ok: false, reason: error.reason };
    }

    console.error(
      "[come-across] unexpected failure",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, reason: "failed" };
  }
}
