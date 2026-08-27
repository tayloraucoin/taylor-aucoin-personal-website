import { eq, sql } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db/client";
import { callAttempts, leads } from "@/db/schema";
import { addBusinessDays, vancouverAt } from "@/lib/crm/call-windows";
import { CADENCE } from "@/lib/crm/constants";
import type { CallDisposition } from "@/lib/types/crm";
import {
  adjustFollowUpInput,
  closeLeadInput,
  logAttemptInput,
  saveLeadNotesInput,
  saveTranscriptInput,
} from "@/lib/validators/crm";

/**
 * Logging what happened on a dial, and deciding when the next one is.
 *
 * The cadence exists so that no lead is ever left without a next action
 * (D-CRM-4). A prospect who says "not now" gets a date; four unanswered
 * attempts end in a rest rather than an indefinite loop. Persistence is a
 * system; pestering is its absence, and so is losing track.
 */

/**
 * When the next touch is due.
 *
 * `null` means no automatic follow-up, and that is only correct for a terminal
 * ruling — the lead is closed and nothing is owed. **Every non-terminal
 * outcome gets a date**, because a live lead without a next action is the
 * defect D-CRM-4 exists to prevent, and the scoreboard counts them.
 *
 * A conversation that set no date of its own is the important case here: it is
 * the most valuable outcome a first call has and the easiest to lose to
 * silence. An explicit time from the caller always wins over this.
 */
function cadenceNextAttempt(
  disposition: CallDisposition,
  priorAttempts: number,
  now: Date,
): { nextActionAt: Date | null; rest: boolean } {
  if (
    disposition === "no_answer" ||
    disposition === "voicemail" ||
    disposition === "hung_up"
  ) {
    const attemptsSoFar = priorAttempts + 1;

    // The finite end of the sequence. Four unanswered tries is enough; the
    // lead rests and comes back warm rather than being dialed forever.
    if (attemptsSoFar >= CADENCE.maxAttemptsBeforeRest) {
      const resurface = new Date(now.getTime());
      resurface.setUTCDate(resurface.getUTCDate() + CADENCE.restResurfaceDays);
      return { nextActionAt: resurface, rest: true };
    }

    return {
      nextActionAt: addBusinessDays(now, CADENCE.retryAfterBusinessDays),
      rest: false,
    };
  }

  if (disposition === "conversation") {
    return {
      nextActionAt: addBusinessDays(
        now,
        CADENCE.conversationFollowUpBusinessDays,
      ),
      rest: false,
    };
  }

  // Terminal rulings only: the caller closes the lead, so nothing is due.
  return { nextActionAt: null, rest: false };
}

export type LogAttemptResult = {
  /** True when the cadence rested the lead after its attempt ceiling. */
  rested: boolean;
  nextActionAt: Date | null;
  /**
   * The row just written. Returned so a post-call action can mark *this*
   * attempt as having carried a texted link (CRM-16) rather than looking up
   * "the most recent one", which is a race the moment two tabs are open.
   */
  attemptId: string;
};

/**
 * Record one dial and set what happens next.
 *
 * The attempt row, the lead's contact facts, and its schedule all move
 * together in one transaction: an attempt logged without its follow-up would
 * leave a lead sitting in the queue with no next action (D-CRM-4), and a
 * conversation that saved its disposition but lost the phone number the
 * prospect just gave would be the same failure with a different face
 * (CRM-14). A bare disposition is a complete, valid call either way — every
 * field below is optional, and omitting one leaves that fact untouched.
 *
 * A caller-supplied `nextActionAt` always wins over the cadence — when a
 * prospect names a time, that is not a suggestion.
 */
export async function logAttempt(
  raw: z.input<typeof logAttemptInput>,
): Promise<LogAttemptResult> {
  const input = logAttemptInput.parse(raw);
  const db = getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    const [{ count } = { count: 0 }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(callAttempts)
      .where(eq(callAttempts.leadId, input.leadId));

    const [attempt] = await tx
      .insert(callAttempts)
      .values({
        leadId: input.leadId,
        disposition: input.disposition,
        interestTags: input.interestTags,
        linkTexted: input.linkTexted ?? false,
        note: input.note ?? null,
        transcript: input.transcript ?? null,
      })
      .returning({ id: callAttempts.id });

    const cadence = cadenceNextAttempt(input.disposition, count, now);

    // Explicit beats computed: a time the prospect asked for is a commitment.
    const nextActionAt =
      input.nextActionAt !== undefined && input.nextActionAt !== null
        ? input.nextActionAt
        : cadence.nextActionAt;

    const terminal =
      input.disposition === "do_not_call"
        ? "do_not_call"
        : input.disposition === "wrong_number"
          ? "bad_lead"
          : input.disposition === "not_interested"
            ? "not_interested"
            : null;

    await tx
      .update(leads)
      .set({
        updatedAt: now,
        // Contact facts a conversation captured. Each is independent of the
        // disposition outcome — undefined means "the caller didn't touch
        // this", not "clear it"; an empty string is what clears it
        // (established contract, DEVIATIONS 2026-08-21 CRM-6).
        ...(input.contactName !== undefined
          ? { contactName: input.contactName || null }
          : {}),
        ...(input.contactEmail !== undefined
          ? { contactEmail: input.contactEmail || null }
          : {}),
        ...(input.phoneOverride !== undefined
          ? { phoneOverride: input.phoneOverride || null }
          : {}),
        ...(input.preferredChannel !== undefined
          ? { preferredChannel: input.preferredChannel }
          : {}),
        ...(terminal
          ? { closedState: terminal, closedAt: now, nextActionAt: null }
          : {
              nextActionAt,
              nextActionNote: input.nextActionNote ?? null,
              // A lead that rests is "not now", and comes back on its date.
              ...(cadence.rest
                ? { closedState: "not_now" as const, closedAt: now }
                : {}),
            }),
      })
      .where(eq(leads.id, input.leadId));

    return {
      rested: cadence.rest,
      nextActionAt: terminal ? null : nextActionAt,
      attemptId: attempt!.id,
    };
  });
}

/**
 * Record that this dial carried a texted link — or take it back.
 *
 * The send itself happens on Taylor's phone (D-CRM-14), so this records
 * intent, not delivery: he tapped the affordance and the words went to the
 * phone. The undo exists because that is a claim he can discover was wrong
 * ten seconds later, and a record that cannot be corrected stops being one.
 */
export async function setLinkTexted(
  attemptId: string,
  linkTexted: boolean,
): Promise<void> {
  await getDb()
    .update(callAttempts)
    .set({ linkTexted })
    .where(eq(callAttempts.id, attemptId));
}

/**
 * Attach a transcript to the dial it belongs to.
 *
 * Deliberately outside `logAttempt`'s transaction — a transcript is written
 * well after a call is logged, often after Taylor has already moved on to
 * the next lead, and requiring it at Save time would make an optional,
 * after-the-fact addition look like part of the disposition it isn't.
 */
export async function saveTranscript(
  raw: z.input<typeof saveTranscriptInput>,
): Promise<void> {
  const input = saveTranscriptInput.parse(raw);

  await getDb()
    .update(callAttempts)
    .set({ transcript: input.transcript || null })
    .where(eq(callAttempts.id, input.attemptId));
}

/**
 * Refine what an already-logged call left behind, without logging it again.
 *
 * Call mode commits a non-conversation disposition on the click (D-CRM-24),
 * so the chips that follow — "make it tomorrow AM instead", "they said they
 * have a guy" — land after the attempt row is already written. They adjust
 * the lead's schedule or its closing reason and **never insert a second
 * attempt**: one dial is one row, and the scoreboard's dial count is a
 * denominator that has to stay honest.
 *
 * Deliberately not `closeLead`: that one re-stamps `closedState`/`closedAt`,
 * which would move the closing time to whenever the chip was clicked.
 */
export async function adjustFollowUp(
  raw: z.input<typeof adjustFollowUpInput>,
): Promise<void> {
  const input = adjustFollowUpInput.parse(raw);

  await getDb()
    .update(leads)
    .set({
      ...(input.nextActionAt !== undefined
        ? { nextActionAt: input.nextActionAt }
        : {}),
      ...(input.nextActionNote !== undefined
        ? { nextActionNote: input.nextActionNote }
        : {}),
      ...(input.closedReason !== undefined
        ? { closedReason: input.closedReason }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(leads.id, input.leadId));
}

/**
 * A terminal ruling, or a rest with a return date.
 *
 * `not_now` requires a resurface date and is not terminal — it is the honest
 * version of "maybe later", and without a date it is just a lead quietly
 * falling out of the pipeline. When none is given it falls back to the
 * configured default rather than leaving the lead with no next action.
 */
export async function closeLead(
  raw: z.input<typeof closeLeadInput>,
): Promise<void> {
  const input = closeLeadInput.parse(raw);
  const now = new Date();

  const resurface =
    input.closedState !== "not_now"
      ? null
      : (input.resurfaceAt ??
        new Date(now.getTime() + CADENCE.defaultNotNowDays * 86400000));

  await getDb()
    .update(leads)
    .set({
      closedState: input.closedState,
      closedReason: input.closedReason ?? null,
      closedAt: now,
      nextActionAt: resurface,
      updatedAt: now,
    })
    .where(eq(leads.id, input.leadId));
}

/** Autosaved from the focus card while a call is happening. */
export async function saveLeadNotes(
  raw: z.input<typeof saveLeadNotesInput>,
): Promise<void> {
  const input = saveLeadNotesInput.parse(raw);

  await getDb()
    .update(leads)
    .set({ notes: input.notes, updatedAt: new Date() })
    .where(eq(leads.id, input.leadId));
}

/**
 * Callback chips, resolved to instants on the server.
 *
 * The vocabulary is closed so a client cannot post an arbitrary schedule, and
 * so the label on the chip and the time it produces cannot drift apart.
 */
export type ScheduleToken =
  | "in_30_min"
  | "this_afternoon"
  | "today_early_afternoon"
  | "today_late_afternoon"
  | "today_early_evening"
  | "tomorrow_am"
  | "tomorrow_pm"
  | "in_2_days"
  | "next_week"
  | "in_1_month"
  | "in_3_months";

export function resolveSchedule(token: ScheduleToken, now = new Date()): Date {
  switch (token) {
    case "in_30_min":
      return new Date(now.getTime() + 30 * 60 * 1000);
    case "this_afternoon":
      return vancouverAt(now, 0, 14);
    case "today_early_afternoon":
      return vancouverAt(now, 0, 13);
    case "today_late_afternoon":
      return vancouverAt(now, 0, 15.5);
    case "today_early_evening":
      return vancouverAt(now, 0, 17);
    case "tomorrow_am":
      return vancouverAt(now, 1, 9);
    case "tomorrow_pm":
      return vancouverAt(now, 1, 14);
    case "in_2_days":
      return addBusinessDays(now, 2);
    case "next_week":
      return addBusinessDays(now, 5);
    case "in_1_month":
      return vancouverAt(now, 30, 9);
    case "in_3_months":
      return vancouverAt(now, 90, 9);
  }
}
