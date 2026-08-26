import { desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  emailEvents,
  engagementProducts,
  engagements,
  leads,
  products,
  type EngagementRow,
} from "@/db/schema";
import { stepCountFor } from "@/lib/intake/tracks";
import { getEngagementStatus } from "./engagement";

/**
 * The admin's read model over engagements — what Taylor needs to open a
 * verification call knowing where a client actually is.
 *
 * Read-only apart from the reminder kill switch. The intake system owns every
 * other write to these rows; this module never sets a status, because status
 * is derived from timestamps and there is nothing here to set (M-INT-7).
 */

/** The three reminder kinds, in the order they fire. The ceiling is three. */
const REMINDER_KINDS = ["reminder_1", "reminder_2", "reminder_3"] as const;

export type EngagementSummary = {
  id: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  status: ReturnType<typeof getEngagementStatus>;
  paidAt: Date | null;
  depositRequired: boolean;
  currentStep: number;
  totalSteps: number;
  lastActivityAt: Date | null;
  completedAt: Date | null;
  remindersDisabled: boolean;
  /** The lead this came from, when one is linked. */
  leadId: string | null;
};

function toSummary(
  row: EngagementRow,
  leadId: string | null,
  now: Date,
): EngagementSummary {
  return {
    id: row.id,
    businessName: row.businessName,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    status: getEngagementStatus(row, now),
    paidAt: row.paidAt,
    depositRequired: row.depositRequired,
    currentStep: row.currentStep,
    totalSteps: stepCountFor(row.track),
    lastActivityAt: row.lastActivityAt,
    completedAt: row.completedAt,
    remindersDisabled: row.remindersDisabledAt !== null,
    leadId,
  };
}

export async function loadEngagementSummaries(
  now = new Date(),
): Promise<EngagementSummary[]> {
  const db = getDb();

  const rows = await db
    .select()
    .from(engagements)
    .orderBy(desc(engagements.createdAt));

  if (rows.length === 0) return [];

  const linked = await db
    .select({ leadId: leads.id, engagementId: leads.engagementId })
    .from(leads)
    .where(
      inArray(
        leads.engagementId,
        rows.map((row) => row.id),
      ),
    );

  const leadByEngagement = new Map(
    linked.map((row) => [row.engagementId!, row.leadId]),
  );

  return rows.map((row) =>
    toSummary(row, leadByEngagement.get(row.id) ?? null, now),
  );
}

export type MoneyLine = {
  name: string;
  quantity: number;
  /** What was actually charged, not today's catalogue price. */
  amountCents: number;
  paidAt: Date | null;
};

/**
 * What this engagement bought, at the prices actually charged.
 *
 * Reads `engagement_products.amount_cents` rather than the catalogue: prices
 * change, purchases do not, and the accounting question is always what was
 * charged on the day.
 */
async function loadEngagementMoney(engagementId: string): Promise<{
  lines: MoneyLine[];
  paidCents: number;
  pendingCents: number;
}> {
  const rows = await getDb()
    .select({
      name: products.name,
      quantity: engagementProducts.quantity,
      amountCents: engagementProducts.amountCents,
      paidAt: engagementProducts.paidAt,
    })
    .from(engagementProducts)
    .innerJoin(products, eq(engagementProducts.productId, products.id))
    .where(eq(engagementProducts.engagementId, engagementId))
    .orderBy(desc(engagementProducts.createdAt));

  let paidCents = 0;
  let pendingCents = 0;

  for (const row of rows) {
    const total = row.amountCents * row.quantity;
    if (row.paidAt) paidCents += total;
    else pendingCents += total;
  }

  return { lines: rows, paidCents, pendingCents };
}

/**
 * Paid and outstanding totals for many engagements in one query.
 *
 * The list page previously called `loadEngagementMoney` per row — fine at
 * today's handful, and exactly the shape that quietly becomes a hundred
 * queries a page later. One aggregate instead, keyed by engagement.
 */
export async function loadMoneyTotals(
  engagementIds: string[],
): Promise<Map<string, { paidCents: number; pendingCents: number }>> {
  const totals = new Map<string, { paidCents: number; pendingCents: number }>();
  if (engagementIds.length === 0) return totals;

  const rows = await getDb()
    .select({
      engagementId: engagementProducts.engagementId,
      paidCents: sql<number>`coalesce(sum(case when ${engagementProducts.paidAt} is not null
        then ${engagementProducts.amountCents} * ${engagementProducts.quantity} else 0 end), 0)::int`,
      pendingCents: sql<number>`coalesce(sum(case when ${engagementProducts.paidAt} is null
        then ${engagementProducts.amountCents} * ${engagementProducts.quantity} else 0 end), 0)::int`,
    })
    .from(engagementProducts)
    .where(inArray(engagementProducts.engagementId, engagementIds))
    .groupBy(engagementProducts.engagementId);

  for (const row of rows) {
    totals.set(row.engagementId, {
      paidCents: row.paidCents,
      pendingCents: row.pendingCents,
    });
  }

  return totals;
}

export type ReminderRecord = { kind: string; at: Date };

export type EngagementAdminDetail = {
  summary: EngagementSummary;
  money: Awaited<ReturnType<typeof loadEngagementMoney>>;
  reminders: ReminderRecord[];
  /** How many of the three have fired. The ceiling is a database constraint. */
  remindersSent: number;
  remindersRemaining: number;
  projectSummary: string | null;
  contactPhone: string | null;
  createdAt: Date;
  sentAt: Date | null;
  startedAt: Date | null;
};

export async function loadEngagementAdminDetail(
  engagementId: string,
  now = new Date(),
): Promise<EngagementAdminDetail | null> {
  const db = getDb();

  const row = await db.query.engagements.findFirst({
    where: eq(engagements.id, engagementId),
  });
  if (!row) return null;

  const [lead] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(eq(leads.engagementId, engagementId))
    .limit(1);

  const events = await db
    .select({ kind: emailEvents.kind, at: emailEvents.createdAt })
    .from(emailEvents)
    .where(eq(emailEvents.engagementId, engagementId))
    .orderBy(desc(emailEvents.createdAt));

  const reminders = events.filter((event) =>
    (REMINDER_KINDS as readonly string[]).includes(event.kind),
  );

  return {
    summary: toSummary(row, lead?.id ?? null, now),
    money: await loadEngagementMoney(engagementId),
    reminders,
    remindersSent: reminders.length,
    remindersRemaining: Math.max(0, REMINDER_KINDS.length - reminders.length),
    projectSummary: row.projectSummary,
    contactPhone: row.contactPhone,
    createdAt: row.createdAt,
    sentAt: row.sentAt,
    startedAt: row.startedAt,
  };
}

/**
 * The per-engagement reminder kill switch (D-CRM-13).
 *
 * It only ever stops sends. The three-reminder ceiling stays a property of
 * `email_events`' partial unique index, and nothing here can raise it — there
 * is deliberately no "send another nudge" anywhere in this module.
 */
export async function setRemindersDisabled(
  engagementId: string,
  disabled: boolean,
): Promise<void> {
  await getDb()
    .update(engagements)
    .set({
      remindersDisabledAt: disabled ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(engagements.id, engagementId));
}
