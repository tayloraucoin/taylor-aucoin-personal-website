"use server";

import { revalidatePath } from "next/cache";
import { adminRoutes } from "@/lib/routes";
import type { CallDisposition, ContactChannel, InterestTag } from "@/lib/types/crm";
import { requireAdmin } from "@/server/services/admin-auth";
import { buildIntroText } from "@/lib/crm/intro-text";
import { requireEnv } from "@/lib/env";
import {
  adjustFollowUp,
  closeLead,
  logAttempt,
  resolveSchedule,
  saveLeadNotes,
  saveTranscript,
  setLinkTexted,
  type ScheduleToken,
} from "@/server/services/calls";
import { loadLeadDetail } from "@/server/services/leads";

/**
 * The queue's write path.
 *
 * Every action calls `requireAdmin` itself. The protected layout guards
 * rendering; it does nothing for a POST aimed straight at one of these, which
 * is the request that would actually be sent by someone who should not be here
 * (M-CRM-1).
 *
 * Each returns `{ ok }` rather than throwing, because the surface's contract is
 * that a logged call outcome is never silently lost — the client keeps the
 * disposition on screen with a retry when a save fails, and it cannot do that
 * if the failure arrives as an unhandled exception.
 */
export type ActionResult = { ok: true } | { ok: false; message: string };

/**
 * A logged call, and the two facts the post-call surfaces need back from it:
 * which row was written (so a texted link marks *that* dial) and when the
 * lead actually comes back (so the review screen reports the committed date
 * rather than restating what the caller asked for).
 */
export type LogAttemptActionResult =
  | { ok: true; attemptId: string; nextActionAt: Date | null }
  | { ok: false; message: string };

/** Narrowed to the failure branch so it satisfies every action's result type. */
const FAILED = (message: string) => ({ ok: false as const, message });

export async function logAttemptAction(input: {
  leadId: string;
  disposition: CallDisposition;
  interestTags?: InterestTag[];
  note?: string;
  transcript?: string;
  schedule?: ScheduleToken;
  /** A time the caller picked directly — wins over `schedule` (CRM-14). */
  nextActionAt?: Date;
  nextActionNote?: string;
  contactName?: string;
  contactEmail?: string;
  phoneOverride?: string;
  preferredChannel?: ContactChannel;
  linkTexted?: boolean;
}): Promise<LogAttemptActionResult> {
  await requireAdmin();

  try {
    const logged = await logAttempt({
      leadId: input.leadId,
      disposition: input.disposition,
      interestTags: input.interestTags ?? [],
      note: input.note,
      transcript: input.transcript,
      // An explicit pick always wins; a token resolves to one; neither given
      // defers to the cadence default inside `logAttempt`.
      nextActionAt:
        input.nextActionAt ??
        (input.schedule ? resolveSchedule(input.schedule) : null),
      nextActionNote: input.nextActionNote,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      phoneOverride: input.phoneOverride,
      preferredChannel: input.preferredChannel,
      linkTexted: input.linkTexted,
    });

    revalidatePath(adminRoutes.queue);
    return {
      ok: true,
      attemptId: logged.attemptId,
      nextActionAt: logged.nextActionAt,
    };
  } catch {
    // The message is deliberately about what to do next, not about the stack.
    return FAILED("Couldn't save that call. Try again.");
  }
}

/**
 * The text draft, composed on the server.
 *
 * Same reason as the email (M-CRM-9): the link carries the deployed origin,
 * never whatever host this browser happens to be on.
 */
export async function draftIntroTextAction(input: {
  leadId: string;
  includePromo: boolean;
}): Promise<
  { ok: true; body: string; phone: string } | { ok: false; message: string }
> {
  await requireAdmin();

  const detail = await loadLeadDetail(input.leadId);
  if (!detail) return { ok: false, message: "That lead is gone." };

  return {
    ok: true,
    body: buildIntroText({
      firstName: detail.lead.contactName ?? undefined,
      siteOrigin: requireEnv("NEXT_PUBLIC_SITE_URL"),
      includePromo: input.includePromo,
    }),
    phone: detail.displayPhone,
  };
}

/**
 * Record that the link went to Taylor's phone — or undo that claim.
 *
 * The CRM never sends the text (D-CRM-14), so this is a record of intent.
 * The timeline renders it as "link texted", never as delivered.
 */
export async function setLinkTextedAction(input: {
  attemptId: string;
  leadId: string;
  linkTexted: boolean;
}): Promise<ActionResult> {
  await requireAdmin();

  try {
    await setLinkTexted(input.attemptId, input.linkTexted);
    revalidatePath(adminRoutes.queue);
    return { ok: true };
  } catch {
    return FAILED("Couldn't record that. Try again.");
  }
}

/**
 * A transcript, pasted in after the call — sometimes right after, sometimes
 * once Taylor's already dialed the next lead and come back later.
 *
 * Revalidates the lead's own record, not the queue: nothing in the queue's
 * list depends on transcript content, and re-rendering it on every autosave
 * would risk the same list-moves-under-the-cursor problem notes avoids by
 * not revalidating at all. The lead record is where a transcript is actually
 * read back, so that's the cache worth invalidating.
 */
export async function saveTranscriptAction(input: {
  attemptId: string;
  leadId: string;
  transcript: string;
}): Promise<ActionResult> {
  await requireAdmin();

  try {
    await saveTranscript({
      attemptId: input.attemptId,
      transcript: input.transcript,
    });
    revalidatePath(adminRoutes.lead(input.leadId));
    return { ok: true };
  } catch {
    return FAILED("Transcript not saved.");
  }
}

/**
 * The chips that refine an already-logged call (D-CRM-24).
 *
 * Separate from `logAttemptAction` on purpose: these fire after the attempt
 * row exists, and routing them back through the log would count one dial
 * twice.
 */
export async function adjustFollowUpAction(input: {
  leadId: string;
  schedule?: ScheduleToken;
  nextActionAt?: Date;
  nextActionNote?: string;
  closedReason?: string;
}): Promise<ActionResult> {
  await requireAdmin();

  try {
    await adjustFollowUp({
      leadId: input.leadId,
      nextActionAt:
        input.nextActionAt ??
        (input.schedule ? resolveSchedule(input.schedule) : undefined),
      nextActionNote: input.nextActionNote,
      closedReason: input.closedReason,
    });

    revalidatePath(adminRoutes.queue);
    return { ok: true };
  } catch {
    return FAILED("Couldn't update that. Try again.");
  }
}

export async function closeLeadAction(input: {
  leadId: string;
  closedState: "not_now" | "not_interested" | "do_not_call" | "bad_lead";
  closedReason?: string;
  schedule?: ScheduleToken;
}): Promise<ActionResult> {
  await requireAdmin();

  try {
    await closeLead({
      leadId: input.leadId,
      closedState: input.closedState,
      closedReason: input.closedReason,
      resurfaceAt: input.schedule ? resolveSchedule(input.schedule) : null,
    });

    revalidatePath(adminRoutes.queue);
    return { ok: true };
  } catch {
    return FAILED("Couldn't save that. Try again.");
  }
}

export async function saveNotesAction(input: {
  leadId: string;
  notes: string;
}): Promise<ActionResult> {
  await requireAdmin();

  try {
    await saveLeadNotes(input);
    // Deliberately no revalidate: notes autosave on blur, and re-rendering the
    // queue mid-call would move the list under Taylor's cursor.
    return { ok: true };
  } catch {
    return FAILED("Notes not saved.");
  }
}
