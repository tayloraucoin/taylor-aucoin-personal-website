"use server";

import { sendResumeLink } from "@/server/services/emails";
import {
  buildEntryUrlFor,
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";

/**
 * Emails the client their own link, so they can move to another device.
 *
 * `resume_link` is deliberately not a send-once kind: someone switching from a
 * van to a kitchen laptop may ask twice, and refusing the second request would
 * be the system being clever at their expense.
 *
 * The link is built for the engagement's own track. This action lives in the
 * durable tree but the showcase welcome screen mounts the same button, and
 * hardcoding the durable URL sent every showcase client a link that 404s.
 */
export async function sendMyLink(token: string): Promise<boolean> {
  try {
    const engagement = await requireEngagement(token);
    return await sendResumeLink(
      engagement,
      buildEntryUrlFor(engagement.track, token),
    );
  } catch (error) {
    if (error instanceof EngagementNotFoundError) return false;
    throw error;
  }
}
