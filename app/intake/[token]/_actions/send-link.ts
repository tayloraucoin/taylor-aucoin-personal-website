"use server";

import { sendResumeLink } from "@/server/services/emails";
import {
  EngagementNotFoundError,
  buildIntakeUrl,
  requireEngagement,
} from "@/server/services/engagement";

/**
 * Emails the client their own link, so they can move to another device.
 *
 * `resume_link` is deliberately not a send-once kind: someone switching from a
 * van to a kitchen laptop may ask twice, and refusing the second request would
 * be the system being clever at their expense.
 */
export async function sendMyLink(token: string): Promise<boolean> {
  try {
    const engagement = await requireEngagement(token);
    return await sendResumeLink(engagement, buildIntakeUrl(token));
  } catch (error) {
    if (error instanceof EngagementNotFoundError) return false;
    throw error;
  }
}
