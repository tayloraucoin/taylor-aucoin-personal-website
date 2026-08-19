import { Resend } from "resend";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { emailEvents, engagements, type EngagementRow } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import { BOOKING_URL } from "@/lib/config";
import {
  REMINDER_1_AFTER_HOURS,
  REMINDER_2_AFTER_IDLE_HOURS,
  REMINDER_3_AFTER_DAYS,
} from "@/lib/intake/constants";
import { stepByNumber } from "@/lib/intake/steps";
import {
  buildIntakeStepUrl,
  buildIntakeUrl,
  decryptToken,
  getEngagementStatus,
  type Engagement,
} from "./engagement";

/**
 * The sweep reads whole rows, but the email helpers take the narrowed domain
 * type. This maps one to the other without widening what an email can touch.
 */
function toEngagementForEmail(row: EngagementRow): Engagement {
  return {
    id: row.id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    answers: row.answers,
    businessName: row.businessName,
    completedAt: row.completedAt,
    contactEmail: row.contactEmail,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    currency: row.currency,
    currentStep: row.currentStep,
    depositAmountCents: row.depositAmountCents,
    depositRequired: row.depositRequired,
    lastActivityAt: row.lastActivityAt,
    paidAt: row.paidAt,
    projectSummary: row.projectSummary,
    sentAt: row.sentAt,
    startedAt: row.startedAt,
    tokenExpiresAt: row.tokenExpiresAt,
    status: getEngagementStatus(row),
  };
}

/**
 * Every system email goes through here.
 *
 * The send-once guarantee is a database constraint, not a variable: a row is
 * inserted *before* the send and deleted if the send fails. A crash between
 * the two under-sends, which is the direction to fail in — a client who paid
 * a deposit and then gets the same nudge twice is being nagged by software.
 *
 * There is no open tracking and no click tracking on this surface. We are
 * emailing someone about their own confidential intake; measuring whether they
 * opened it is not ours to know.
 */

export type EmailKind =
  | "resume_link"
  | "reminder_1"
  | "reminder_2"
  | "reminder_3"
  | "completion"
  | "output";

/** Kinds the database refuses to let happen twice (INT-1's partial index). */
const SEND_ONCE: ReadonlySet<EmailKind> = new Set([
  "reminder_1",
  "reminder_2",
  "reminder_3",
  "completion",
]);

let resend: Resend | null = null;

function getResend(): Resend {
  resend ??= new Resend(requireEnv("RESEND_API_KEY"));
  return resend;
}

function from(): string {
  // Resend requires a verified domain; the site's own is the honest sender.
  return `Taylor Aucoin <hello@${new URL(requireEnv("NEXT_PUBLIC_SITE_URL")).hostname.replace(/^www\./, "")}>`;
}

/**
 * Claims the right to send, sends, and releases the claim on failure.
 *
 * Returns false when the claim could not be taken — which for a send-once kind
 * means it has already gone out, and is a success from the caller's point of
 * view rather than an error.
 */
async function sendOnce(input: {
  engagementId: string;
  kind: EmailKind;
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  let eventId: string | null = null;

  try {
    const [row] = await getDb()
      .insert(emailEvents)
      .values({ engagementId: input.engagementId, kind: input.kind })
      .returning({ id: emailEvents.id });

    eventId = row?.id ?? null;
  } catch {
    // Unique violation on a send-once kind: it has already been sent.
    if (SEND_ONCE.has(input.kind)) return false;
    throw new Error(`Could not record the ${input.kind} email.`);
  }

  try {
    await getResend().emails.send({
      from: from(),
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return true;
  } catch (error) {
    if (eventId) {
      await getDb().delete(emailEvents).where(eq(emailEvents.id, eventId));
    }

    console.error(
      `[intake] ${input.kind} email failed`,
      error instanceof Error ? error.message : "unknown error",
    );
    return false;
  }
}

/** Whether a given kind has already gone out for this engagement. */
export async function hasSent(
  engagementId: string,
  kind: EmailKind,
): Promise<boolean> {
  const [row] = await getDb()
    .select({ id: emailEvents.id })
    .from(emailEvents)
    .where(
      and(
        eq(emailEvents.engagementId, engagementId),
        eq(emailEvents.kind, kind),
      ),
    )
    .limit(1);

  return Boolean(row);
}

/** The finished intake document, to Taylor. */
export async function sendIntakeDocument(
  engagement: Engagement,
  markdown: string,
): Promise<boolean> {
  return sendOnce({
    engagementId: engagement.id,
    kind: "output",
    to: requireEnv("INTAKE_NOTIFY_EMAIL"),
    subject: `Intake — ${engagement.businessName}`,
    text: markdown,
  });
}

/** Confirmation to the client, after they finish. */
export async function sendCompletionConfirmation(
  engagement: Engagement,
  resumeUrl: string,
): Promise<boolean> {
  const firstName =
    engagement.contactName.split(" ")[0] ?? engagement.contactName;

  return sendOnce({
    engagementId: engagement.id,
    kind: "completion",
    to: engagement.contactEmail,
    subject: `Thanks — everything's in for ${engagement.businessName}`,
    text: [
      `Hi ${firstName},`,
      "",
      "That's everything I need to get started. I read all of it before our call, so the call is short.",
      "",
      `If you want to add photos or anything else later, your link still works: ${resumeUrl}`,
      "",
      `Book the call here if you haven't yet: ${BOOKING_URL}`,
      "",
      "— Taylor",
    ].join("\n"),
  });
}

/** The resume link, on request or after the first save. */
export async function sendResumeLink(
  engagement: Engagement,
  resumeUrl: string,
): Promise<boolean> {
  const firstName =
    engagement.contactName.split(" ")[0] ?? engagement.contactName;

  return sendOnce({
    engagementId: engagement.id,
    kind: "resume_link",
    to: engagement.contactEmail,
    subject: "Your website questionnaire — pick up where you left off",
    text: [
      `Hi ${firstName},`,
      "",
      "Here's your link. Your answers save automatically, so you can stop and come back anytime, on any device.",
      "",
      resumeUrl,
      "",
      "— Taylor",
    ].join("\n"),
  });
}

/**
 * The three reminders, and only three.
 *
 * The register is a shrug. No urgency, no countdown, no "you're missing out" —
 * this is a paying client being reminded about their own paperwork, and
 * pressure here is borrowing against the relationship the deposit just bought.
 */
export async function sendReminder(
  engagement: Engagement,
  kind: "reminder_1" | "reminder_2" | "reminder_3",
  url: string,
): Promise<boolean> {
  const firstName =
    engagement.contactName.split(" ")[0] ?? engagement.contactName;

  const body: Record<typeof kind, string[]> = {
    reminder_1: [
      `Hi ${firstName},`,
      "",
      "Whenever you get a minute — the questionnaire for your site is here. About 20 minutes, and you can skip anything you're not sure about.",
      "",
      url,
    ],
    reminder_2: [
      `Hi ${firstName},`,
      "",
      "No rush — your answers are saved. Here's the link back to where you left off.",
      "",
      url,
    ],
    reminder_3: [
      `Hi ${firstName},`,
      "",
      "Last nudge from me on this one. The sooner it's back, the sooner you're live — and if it's easier to talk it through instead, just reply and we'll do it on a call.",
      "",
      url,
    ],
  };

  return sendOnce({
    engagementId: engagement.id,
    kind,
    to: engagement.contactEmail,
    subject: `Your website questionnaire — ${engagement.businessName}`,
    text: [...body[kind], "", "— Taylor"].join("\n"),
  });
}

/**
 * The daily sweep. At most one reminder per engagement per run, three ever.
 *
 * Everything that could send twice is prevented by the database rather than by
 * this function's care: `sendOnce` claims the row first, and the partial
 * unique index refuses a second claim. So a sweep that crashes halfway,
 * retries, or runs twice in a day is harmless.
 *
 * Completion kills all of it — the query never selects a finished engagement,
 * and the send guard re-checks before writing.
 */
export async function sweepReminders(now: Date = new Date()): Promise<{
  considered: number;
  sent: number;
  skippedNoLink: number;
}> {
  const hours = (h: number) => h * 60 * 60 * 1000;

  const candidates = await getDb()
    .select()
    .from(engagements)
    .where(isNull(engagements.completedAt));

  let sent = 0;
  let skippedNoLink = 0;

  for (const row of candidates) {
    const sentAt = row.sentAt;
    if (!sentAt) continue;

    const idleFrom = row.lastActivityAt ?? row.startedAt;
    const age = now.getTime() - sentAt.getTime();

    let kind: "reminder_1" | "reminder_2" | "reminder_3" | null = null;

    if (age >= hours(24 * REMINDER_3_AFTER_DAYS)) {
      kind = "reminder_3";
    } else if (
      idleFrom &&
      now.getTime() - idleFrom.getTime() >= hours(REMINDER_2_AFTER_IDLE_HOURS)
    ) {
      kind = "reminder_2";
    } else if (!row.startedAt && age >= hours(REMINDER_1_AFTER_HOURS)) {
      kind = "reminder_1";
    }

    if (!kind) continue;

    const token = decryptToken(row.resumeTokenCiphertext);
    if (!token) {
      // Created before the ciphertext column existed, or the key rotated.
      // Skipping is right: a reminder with no working link is worse than none.
      skippedNoLink += 1;
      continue;
    }

    const engagement = toEngagementForEmail(row);
    // Reminder 2 goes to someone mid-form, so it lands them where they were.
    const url =
      kind === "reminder_2" && row.currentStep > 0
        ? buildIntakeStepUrl(token, stepByNumber(row.currentStep).key)
        : buildIntakeUrl(token);

    if (await sendReminder(engagement, kind, url)) sent += 1;
  }

  return { considered: candidates.length, sent, skippedNoLink };
}

/**
 * An operational note to Taylor. Never to a client.
 *
 * Deliberately not routed through `sendOnce`: that guards per engagement, and
 * some of these concern an invoice with no engagement behind it. Replay safety
 * for these comes from the `stripe_events` claim instead, which is what makes
 * the webhook handlers safe to retry.
 *
 * Body text is written by the caller and must carry no client content beyond
 * what Taylor needs to act — a business name and an amount, not an address.
 */
export async function notifyOps(
  subject: string,
  lines: readonly string[],
): Promise<boolean> {
  try {
    await getResend().emails.send({
      from: from(),
      to: requireEnv("INTAKE_NOTIFY_EMAIL"),
      subject,
      text: lines.join("\n"),
    });
    return true;
  } catch (error) {
    console.error(
      "[intake] ops notification failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return false;
  }
}
