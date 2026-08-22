import { and, eq, isNotNull, isNull, lt, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { callAttempts, engagements, leadEmails, leads } from "@/db/schema";
import {
  getCallWindow,
  profileLabel,
  vancouverDayBounds,
  vancouverWeekdayLabel,
} from "@/lib/crm/call-windows";
import { MIN_N_FOR_RATE } from "@/lib/crm/constants";

/**
 * The scoreboard: the funnel at honest n, and the check that can falsify the
 * call-window model.
 *
 * Two rules run through everything here. **Counts always, rates only above a
 * threshold** (D-CRM-12) — a percentage computed from four dials is a story,
 * and the whole point of a scoreboard is to stop planning around stories.
 * And **the timing model is a hypothesis** (D-CRM-21): the check below is
 * built to report that best-window calls do no better than the rest, if that
 * is what the dials say.
 */

export type Funnel = {
  dials: number;
  conversations: number;
  infoSent: number;
  intakeSent: number;
  deposits: number;
  complete: number;
};

/**
 * A rate, or the reason there isn't one.
 *
 * `null` is not "zero" and must never render as 0% — it means the sample is
 * too small to say anything, which is a different fact and a more useful one.
 */
export type Rate = {
  label: string;
  numerator: number;
  denominator: number;
  /** Null below `MIN_N_FOR_RATE`. */
  value: number | null;
};

function rate(label: string, numerator: number, denominator: number): Rate {
  return {
    label,
    numerator,
    denominator,
    value: denominator >= MIN_N_FOR_RATE ? numerator / denominator : null,
  };
}

export type TimingRow = {
  label: string;
  dials: number;
  conversations: number;
  /** Null below the threshold — the model is not judged on thin evidence. */
  reachRate: number | null;
};

export type Scoreboard = {
  lastSevenDays: Funnel;
  allTime: Funnel;
  rates: Rate[];
  health: {
    /** Worked leads with no next action. Should be zero by construction. */
    workedWithoutNextAction: number;
    overdueCallbacks: number;
  };
  timing: {
    byTier: TimingRow[];
    byProfile: TimingRow[];
    byWeekday: TimingRow[];
    totalAttempts: number;
  };
};

const WEEKDAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIER_ORDER = ["best", "fair", "avoid", "unknown"];

export async function loadScoreboard(now = new Date()): Promise<Scoreboard> {
  const db = getDb();
  const { startOfTomorrow, startOfToday } = vancouverDayBounds(now);

  // Seven days back from the end of today, so "last 7 days" always contains
  // seven whole local days plus today rather than a partial tail.
  const weekStart = new Date(startOfTomorrow.getTime() - 7 * 86400000);

  // Every attempt, with the niche it was made against — the timing check needs
  // to recompute the window as it was at the moment of the dial, which no
  // stored column could give (and which is why none was added).
  const attempts = await db
    .select({
      at: callAttempts.createdAt,
      disposition: callAttempts.disposition,
      niche: leads.niche,
    })
    .from(callAttempts)
    .innerJoin(leads, eq(callAttempts.leadId, leads.id));

  const emails = await db
    .select({ at: leadEmails.createdAt })
    .from(leadEmails)
    .where(eq(leadEmails.kind, "intro"));

  const engagementRows = await db
    .select({
      sentAt: engagements.sentAt,
      paidAt: engagements.paidAt,
      completedAt: engagements.completedAt,
    })
    .from(engagements);

  const since = (at: Date | null, from: Date) => at !== null && at >= from;

  const funnelFrom = (from: Date | null): Funnel => {
    const inRange = (at: Date | null) =>
      from === null ? at !== null : since(at, from);

    return {
      dials: attempts.filter((row) => inRange(row.at)).length,
      conversations: attempts.filter(
        (row) => row.disposition === "conversation" && inRange(row.at),
      ).length,
      infoSent: emails.filter((row) => inRange(row.at)).length,
      intakeSent: engagementRows.filter((row) => inRange(row.sentAt)).length,
      deposits: engagementRows.filter((row) => inRange(row.paidAt)).length,
      complete: engagementRows.filter((row) => inRange(row.completedAt)).length,
    };
  };

  const allTime = funnelFrom(null);

  // --- Health -----------------------------------------------------------
  const [worked] = await db
    .select({ count: sql<number>`count(distinct ${leads.id})::int` })
    .from(leads)
    .innerJoin(callAttempts, eq(callAttempts.leadId, leads.id))
    .where(and(isNull(leads.closedState), isNull(leads.nextActionAt)));

  const [overdue] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leads)
    .where(
      and(
        isNotNull(leads.nextActionAt),
        lt(leads.nextActionAt, startOfToday),
        // Terminally closed leads are not overdue; they are done.
        sql`(${leads.closedState} is null or ${leads.closedState} = 'not_now')`,
      ),
    );

  // --- The timing check -------------------------------------------------
  const group = (keyOf: (row: (typeof attempts)[number]) => string) => {
    const buckets = new Map<string, { dials: number; conversations: number }>();

    for (const row of attempts) {
      const key = keyOf(row);
      const bucket = buckets.get(key) ?? { dials: 0, conversations: 0 };
      bucket.dials++;
      if (row.disposition === "conversation") bucket.conversations++;
      buckets.set(key, bucket);
    }

    return [...buckets.entries()].map(([label, bucket]) => ({
      label,
      dials: bucket.dials,
      conversations: bucket.conversations,
      reachRate:
        bucket.dials >= MIN_N_FOR_RATE
          ? bucket.conversations / bucket.dials
          : null,
    }));
  };

  const byTier = group((row) => getCallWindow(row.niche, row.at).tier).sort(
    (a, b) => TIER_ORDER.indexOf(a.label) - TIER_ORDER.indexOf(b.label),
  );

  const byProfile = group((row) =>
    profileLabel(getCallWindow(row.niche, row.at).profile),
  ).sort((a, b) => b.dials - a.dials);

  const byWeekday = group((row) => vancouverWeekdayLabel(row.at)).sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a.label) - WEEKDAY_ORDER.indexOf(b.label),
  );

  return {
    lastSevenDays: funnelFrom(weekStart),
    allTime,
    rates: [
      rate("Dials that reached someone", allTime.conversations, allTime.dials),
      rate(
        "Conversations that took info",
        allTime.infoSent,
        allTime.conversations,
      ),
      rate(
        "Info sent that reached intake",
        allTime.intakeSent,
        allTime.infoSent,
      ),
      rate("Intakes that paid a deposit", allTime.deposits, allTime.intakeSent),
      rate(
        "Deposits that finished the form",
        allTime.complete,
        allTime.deposits,
      ),
    ],
    health: {
      workedWithoutNextAction: worked?.count ?? 0,
      overdueCallbacks: overdue?.count ?? 0,
    },
    timing: { byTier, byProfile, byWeekday, totalAttempts: attempts.length },
  };
}
