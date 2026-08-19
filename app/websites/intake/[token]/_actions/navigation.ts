"use server";

import {
  EngagementNotFoundError,
  markStepReached,
  requireEngagement,
} from "@/server/services/engagement";

/**
 * Records that a client reached a step.
 *
 * Thin by contract: resolve the token through the seam, call the service,
 * return. No branching lives here (M-INT-2) — the moment an action starts
 * making decisions, the decision has two homes.
 *
 * Called from the client on mount rather than during the page's render,
 * because Next prefetches `Link` targets: a write in render would mark steps
 * reached that the client never actually saw.
 *
 * Failure is silent on purpose. This is progress bookkeeping — if it does not
 * land, the client's answers are unaffected and the next step records it
 * anyway. Nothing about their form should break because a resume marker
 * missed.
 */
export async function recordStepReached(
  token: string,
  stepNumber: number,
): Promise<void> {
  try {
    const engagement = await requireEngagement(token);
    await markStepReached(engagement.id, stepNumber);
  } catch (error) {
    if (error instanceof EngagementNotFoundError) return;
    throw error;
  }
}
