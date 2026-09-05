import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagements } from "@/db/schema";
import {
  EMPTY_PROPOSAL_SET,
  type PrimerProposal,
  type PrimerProposalSet,
} from "@/lib/intake/primer-proposal";

/**
 * Where a primer run's proposals live between producing them and the client
 * meeting them.
 *
 * **In the answers document, at the top-level key `primer` — not in a column,
 * and not inside any step** (M-PORT-26).
 *
 * No column, because that is a migration Taylor reviews and runs, and one from
 * PORT-1 is still pending against the hosted databases. The same reasoning that
 * put `siteKind` in the answers document (M-PORT-21).
 *
 * Not inside a step, because the intake markdown renders `answers[step.key]`
 * for each step in the registry — so a top-level key is invisible to the
 * document **by construction** rather than by an exclusion someone has to
 * remember. Proposals are not answers and must never print as though they were.
 *
 * The merge is safe: `saveStepAnswers` writes `answers || '{"<step>": …}'`,
 * a shallow top-level merge, so a step save never touches this key and this
 * never touches a step.
 */

function asSet(value: unknown): PrimerProposalSet {
  if (!value || typeof value !== "object") return EMPTY_PROPOSAL_SET;
  const raw = value as Partial<PrimerProposalSet>;
  return {
    readAt: typeof raw.readAt === "string" ? raw.readAt : "",
    proposals: Array.isArray(raw.proposals) ? raw.proposals : [],
    dismissedFieldKeys: Array.isArray(raw.dismissedFieldKeys)
      ? raw.dismissedFieldKeys.filter((k): k is string => typeof k === "string")
      : [],
  };
}

/** This engagement's stored proposals. Never throws; absence is the empty set. */
export function readProposalSet(answers: unknown): PrimerProposalSet {
  const document = (answers ?? {}) as Record<string, unknown>;
  return asSet(document.primer);
}

/** The proposals a client should actually be shown, for one step. */
export function proposalsForStep(
  answers: unknown,
  stepKey: string,
  stored: Record<string, unknown>,
): PrimerProposal[] {
  const set = readProposalSet(answers);
  const dismissed = new Set(set.dismissedFieldKeys);

  return set.proposals.filter((proposal) => {
    if (proposal.stepKey !== stepKey) return false;
    if (dismissed.has(proposal.fieldKey)) return false;

    // **A proposal never overwrites an answer.** If the client has since
    // written something in that field themselves, the suggestion is gone —
    // silently, because offering to replace their own words is the one thing
    // this feature must never do.
    const existing = stored[proposal.fieldKey];
    return typeof existing !== "string" || existing.trim() === "";
  });
}

/** Replaces the proposal set, keeping every dismissal the client has made. */
export async function writeProposalSet(
  engagementId: string,
  proposals: PrimerProposal[],
  previous: PrimerProposalSet,
): Promise<void> {
  const next: PrimerProposalSet = {
    readAt: new Date().toISOString(),
    proposals,
    // Dismissals outlive a run on purpose: re-reading a document must not
    // resurrect a suggestion the client already waved off.
    dismissedFieldKeys: previous.dismissedFieldKeys,
  };

  await merge(engagementId, next);
}

/** Records a dismissal. Idempotent. */
export async function dismissProposal(
  engagementId: string,
  answers: unknown,
  fieldKey: string,
): Promise<void> {
  const set = readProposalSet(answers);
  if (set.dismissedFieldKeys.includes(fieldKey)) return;

  await merge(engagementId, {
    ...set,
    dismissedFieldKeys: [...set.dismissedFieldKeys, fieldKey],
  });
}

async function merge(
  engagementId: string,
  set: PrimerProposalSet,
): Promise<void> {
  const now = new Date();
  await getDb()
    .update(engagements)
    .set({
      answers: sql`${engagements.answers} || ${JSON.stringify({ primer: set })}::jsonb`,
      lastActivityAt: now,
      updatedAt: now,
    })
    .where(eq(engagements.id, engagementId));
}
