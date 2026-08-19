"use server";

import { buildIntakeUrl, requireEngagement } from "@/server/services/engagement";
import {
  sendCompletionConfirmation,
  sendIntakeDocument,
} from "@/server/services/emails";
import { renderIntakeMarkdown } from "@/server/services/output";
import { linkUploads, markComplete } from "@/server/services/submission";

/** Long enough to outlive an inbox; short enough not to be a standing key. */
const LINK_TTL_SECONDS = 14 * 24 * 60 * 60;

/**
 * Finishes the engagement and sends the intake document.
 *
 * The order is the contract: completion is committed to the database *first*,
 * and the emails are attempted after. A client who has answered everything is
 * finished whether or not Resend is having a morning — their Done screen must
 * never be hostage to an outbound service.
 *
 * A failed send leaves no `email_events` row, so the document can be re-sent
 * later with `scripts/render-intake.ts --send`.
 */
export async function completeIntake(token: string): Promise<void> {
  const engagement = await requireEngagement(token);

  const firstCompletion = await markComplete(engagement.id);
  if (!firstCompletion) return;

  // Re-read so the document reports the completion it just recorded.
  const finished = await requireEngagement(token);

  try {
    const files = await linkUploads(engagement.id, LINK_TTL_SECONDS);
    const markdown = renderIntakeMarkdown({
      engagement: finished,
      files,
      generatedAt: new Date(),
    });

    await sendIntakeDocument(finished, markdown);
    await sendCompletionConfirmation(finished, buildIntakeUrl(token));
  } catch (error) {
    // Never surfaced to the client: they are done either way.
    console.error(
      `[intake] post-completion delivery failed for ${engagement.id}`,
      error instanceof Error ? error.message : "unknown error",
    );
  }
}
