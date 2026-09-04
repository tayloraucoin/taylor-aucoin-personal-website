"use server";

import { z } from "zod";
import { requireEngagement } from "@/server/services/engagement";
import {
  dismissProposal,
  readProposalSet,
} from "@/server/services/primer-store";
import { readStepAnswers, saveStepAnswers } from "@/server/services/submission";

/**
 * What is left of the business primer (PORT-10), and why.
 *
 * **Nothing runs it any more.** PORT-18's ingestion step asks for everything a
 * client has, on step 1, and writes into every step from it — so the narrower
 * "tell us about the business" box on step 2 was the same question asked
 * twice, and it and its action are gone (2026-09-03).
 *
 * **What a client already met still works.** An engagement that ran the primer
 * before that day holds proposals at `answers.primer`, and `StepProposals`
 * still renders them beside the questions they belong to. Taking and waving
 * off a suggestion are the two actions those clients still need, so they are
 * the two that remain. The day no engagement holds a proposal set, this file
 * goes with them.
 */

/**
 * Takes one suggestion and writes it into the step that asked the question.
 *
 * **The value comes from the stored proposal, not from the request.** The
 * browser names a field key; the server looks up what was proposed for it. A
 * fabricated request can therefore only accept something the primer actually
 * proposed — the same shape as the pay screen naming a plan rather than an
 * amount (M-PORT-12).
 *
 * This is a server-side write of an answer, and it is the one the seen-first
 * law permits: the client read the suggestion and its supporting sentence, and
 * pressed the button. It refuses if they have since answered the field
 * themselves, so it can never overwrite their own words.
 */
export async function acceptPrimerProposal(
  token: unknown,
  fieldKey: unknown,
): Promise<{ ok: boolean }> {
  const parsed = dismissInput.safeParse({ token, fieldKey });
  if (!parsed.success) return { ok: false };

  try {
    const engagement = await requireEngagement(parsed.data.token);
    if (engagement.track !== "showcase") return { ok: false };

    const proposal = readProposalSet(engagement.answers).proposals.find(
      (candidate) => candidate.fieldKey === parsed.data.fieldKey,
    );
    if (!proposal) return { ok: false };

    const stored = readStepAnswers(
      engagement.track,
      engagement.answers,
      proposal.stepKey as never,
    );
    const existing = stored[proposal.fieldKey];
    if (typeof existing === "string" && existing.trim() !== "") {
      return { ok: false };
    }

    await saveStepAnswers(parsed.data.token, proposal.stepKey as never, {
      ...stored,
      [proposal.fieldKey]: proposal.value,
    });

    // Taken is settled: it never needs offering again.
    await dismissProposal(engagement.id, engagement.answers, proposal.fieldKey);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

const dismissInput = z.object({
  token: z.string().min(1),
  fieldKey: z.string().min(1),
});

/** Waves off one suggestion, for good. Idempotent, and never an error. */
export async function dismissPrimerProposal(
  token: unknown,
  fieldKey: unknown,
): Promise<{ ok: boolean }> {
  const parsed = dismissInput.safeParse({ token, fieldKey });
  if (!parsed.success) return { ok: false };

  try {
    const engagement = await requireEngagement(parsed.data.token);
    if (engagement.track !== "showcase") return { ok: false };

    await dismissProposal(
      engagement.id,
      engagement.answers,
      parsed.data.fieldKey,
    );
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
