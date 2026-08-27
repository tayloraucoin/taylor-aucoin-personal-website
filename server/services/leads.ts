import { parse } from "csv-parse/sync";
import {
  and,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db/client";
import {
  callAttempts,
  engagements,
  leadEmails,
  leads,
  leadSyncs,
  type LeadRow,
  type NewLeadRow,
} from "@/db/schema";
import {
  CALL_WINDOW_PROFILES,
  getCallWindow,
  isUnmappedNiche,
  vancouverDayBounds,
  type CallWindow,
} from "@/lib/crm/call-windows";
import type {
  CallDisposition,
  ContactChannel,
  InterestTag,
  LeadClosedState,
  LeadStage,
} from "@/lib/types/crm";
import {
  crmLeadCsvRow,
  REQUIRED_CSV_COLUMNS,
  updateLeadContactInput,
  type CrmLeadCsvRow,
} from "@/lib/validators/crm";

/**
 * Turning `crm_leads.csv` into rows, without ever overwriting what Taylor
 * learned on the phone.
 *
 * The whole risk of this file is one mistake: a sync that clobbers pipeline
 * state. It is prevented structurally rather than carefully — see
 * `SYNC_OWNED`.
 */

/**
 * The only columns an import may write (D-CRM-11).
 *
 * This list is the law, and it is a list rather than a spread of the parsed
 * row on purpose: the upsert builds its `SET` clause from exactly these keys,
 * so a column added to `leads` later is *not* syncable until someone comes
 * here and adds it. The failure mode of forgetting is a field that does not
 * update — visible, harmless, fixable. The failure mode of the alternative is
 * a wiped call history, which is none of those things.
 *
 * `notes`, `contactEmail`, `contactName`, `phoneOverride`, `preferredChannel`,
 * `nextActionAt`, `nextActionNote`, `closedState`, `closedReason`,
 * `closedAt`, and `engagementId` are all admin-owned and deliberately absent.
 *
 * Exported so the law can be asserted rather than trusted, and so surfaces can
 * tell a client which fields came from Google rather than from Taylor.
 */
export const SYNC_OWNED = [
  "address",
  "businessName",
  "city",
  "leadScore",
  "mapsUrl",
  "niche",
  "niches",
  "phone",
  "rating",
  "reviews",
  "thread",
  "website",
  "websiteBucket",
] as const satisfies readonly (keyof LeadRow)[];

type SyncOwnedKey = (typeof SYNC_OWNED)[number];

export type ParsedCsv =
  | { ok: true; rows: CrmLeadCsvRow[] }
  | { ok: false; message: string; rowErrors: string[] };

/**
 * Parse and validate an uploaded CSV.
 *
 * A real parser, not a split on commas: 49 of the 1588 real business names
 * contain a comma ("Flawless Plumbing, Heating & Gas LTD"), and naive
 * splitting shifts every later column on those rows — silently, and in a way
 * that looks like bad data rather than a bad parser.
 *
 * **Any invalid row rejects the whole file.** This CSV is produced by our own
 * `yarn leadgen export --crm`, so a row that fails validation means something
 * upstream is broken or the file was hand-edited. Importing the other 1587 and
 * saying nothing would leave one business permanently missing from the call
 * list with no trace of why.
 */
export function parseCrmCsv(text: string): ParsedCsv {
  let records: Record<string, string>[];

  try {
    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as Record<string, string>[];
  } catch (error) {
    return {
      ok: false,
      message: `That file could not be read as CSV: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
      rowErrors: [],
    };
  }

  if (!records.length) {
    return { ok: false, message: "That file has no rows.", rowErrors: [] };
  }

  const header = Object.keys(records[0]!);
  const missing = REQUIRED_CSV_COLUMNS.filter((c) => !header.includes(c));

  if (missing.length) {
    return {
      ok: false,
      // Names the likely mistake rather than only the symptom: the two frozen
      // exports are the files most likely to be dragged in here, and neither
      // carries place_id.
      message: `Missing ${missing.join(", ")}. This looks like one of the older exports — run \`yarn leadgen export --crm\` and upload crm_leads.csv.`,
      rowErrors: [],
    };
  }

  const rows: CrmLeadCsvRow[] = [];
  const rowErrors: string[] = [];

  for (const [index, record] of records.entries()) {
    const result = crmLeadCsvRow.safeParse(record);
    if (result.success) {
      rows.push(result.data);
    } else {
      const issue = result.error.issues[0];
      // +2: one for the header line, one because humans count from 1.
      rowErrors.push(
        `Row ${index + 2}: ${issue?.path.join(".") ?? "?"} — ${issue?.message ?? "invalid"}`,
      );
    }
  }

  if (rowErrors.length) {
    return {
      ok: false,
      message: `${rowErrors.length} of ${records.length} rows are invalid. Nothing was imported.`,
      rowErrors: rowErrors.slice(0, 5),
    };
  }

  return { ok: true, rows };
}

/** A CSV row in the shape the table stores. */
function toSyncValues(row: CrmLeadCsvRow): Pick<NewLeadRow, SyncOwnedKey> {
  return {
    address: row.address,
    businessName: row.name,
    city: row.city,
    leadScore: row.lead_score,
    mapsUrl: row.maps_url,
    niche: row.niche,
    // Semicolon-joined in the CSV, matching the red_flags idiom leadgen
    // already uses. Empty string must not become [""].
    niches: row.niches ? row.niches.split(";").filter(Boolean) : [],
    phone: row.phone,
    rating: row.rating,
    reviews: row.reviews,
    thread: row.thread,
    website: row.website,
    websiteBucket: row.website_bucket,
  };
}

export type SyncPreview = {
  fileName: string;
  newCount: number;
  updatedCount: number;
  unchangedCount: number;
  /** Up to five examples of what an import would change, for the preview. */
  samples: { businessName: string; changes: string[] }[];
  /** Niches with no call-window profile — the config needs updating. */
  unmappedNiches: string[];
};

/** Fields differing between an incoming row and the stored one. */
function changedFields(
  existing: LeadRow,
  incoming: Pick<NewLeadRow, SyncOwnedKey>,
): string[] {
  return SYNC_OWNED.filter((key) => {
    const before = existing[key];
    const after = incoming[key];
    // `niches` is an array; compare by value, not reference.
    if (Array.isArray(before) || Array.isArray(after)) {
      return JSON.stringify(before ?? []) !== JSON.stringify(after ?? []);
    }
    return before !== after;
  });
}

/**
 * What an import would do, without doing it.
 *
 * Deliberately reads the same rows the commit will write, so the numbers on
 * screen are the numbers that land — not an estimate.
 */
export async function previewSync(
  rows: CrmLeadCsvRow[],
  fileName: string,
): Promise<SyncPreview> {
  const db = getDb();
  const incoming = new Map(
    rows.map((row) => [row.place_id, toSyncValues(row)]),
  );

  const existing = await loadExistingByPlaceId(db, [...incoming.keys()]);

  let newCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;
  const samples: SyncPreview["samples"] = [];

  for (const [placeId, values] of incoming) {
    const current = existing.get(placeId);

    if (!current) {
      newCount++;
      continue;
    }

    const changes = changedFields(current, values);
    if (changes.length === 0) {
      unchangedCount++;
      continue;
    }

    updatedCount++;
    if (samples.length < 5) {
      samples.push({ businessName: values.businessName, changes });
    }
  }

  const unmappedNiches = [
    ...new Set(rows.map((row) => row.niche).filter(isUnmappedNiche)),
  ];

  return {
    fileName,
    newCount,
    updatedCount,
    unchangedCount,
    samples,
    unmappedNiches,
  };
}

/**
 * Reads existing rows for the incoming place ids.
 *
 * Chunked because `IN (...)` is one bind parameter per id, and Postgres caps a
 * statement at 65535 of them. Today's file is 1588 rows; the cap is not a
 * concern until it is, and discovering it in production would look like a
 * corrupt import rather than a limit.
 */
async function loadExistingByPlaceId(
  db: ReturnType<typeof getDb>,
  placeIds: string[],
): Promise<Map<string, LeadRow>> {
  const found = new Map<string, LeadRow>();

  for (let i = 0; i < placeIds.length; i += 1000) {
    const chunk = placeIds.slice(i, i + 1000);
    const rows = await db
      .select()
      .from(leads)
      .where(inArray(leads.placeId, chunk));

    for (const row of rows) found.set(row.placeId, row);
  }

  return found;
}

/**
 * Apply the import.
 *
 * One transaction for every chunk plus the log row (D-CRM-11): a half-applied
 * import is the one outcome that would leave Taylor unable to tell which rows
 * are current. The `lead_syncs` row is written inside it, so the log can never
 * claim an import that rolled back.
 *
 * The counts are recomputed here rather than passed in from the preview, so
 * what gets logged is what actually happened.
 */
export async function commitSync(
  rows: CrmLeadCsvRow[],
  fileName: string,
): Promise<SyncPreview> {
  const db = getDb();
  const preview = await previewSync(rows, fileName);
  const now = new Date();

  const values: NewLeadRow[] = rows.map((row) => ({
    ...toSyncValues(row),
    placeId: row.place_id,
    lastSyncAt: now,
  }));

  await db.transaction(async (tx) => {
    for (let i = 0; i < values.length; i += 500) {
      const chunk = values.slice(i, i + 500);

      await tx
        .insert(leads)
        .values(chunk)
        .onConflictDoUpdate({
          target: leads.placeId,
          // Built from SYNC_OWNED, never from the parsed row — this is the
          // line that makes the never-touch law structural.
          set: {
            ...Object.fromEntries(
              SYNC_OWNED.map((key) => [
                key,
                sql.raw(`excluded.${columnOf(key)}`),
              ]),
            ),
            lastSyncAt: now,
            updatedAt: now,
          },
        });
    }

    await tx.insert(leadSyncs).values({
      fileName,
      newCount: preview.newCount,
      updatedCount: preview.updatedCount,
      unchangedCount: preview.unchangedCount,
    });
  });

  return preview;
}

/** Drizzle property name to its database column name, for `excluded.<col>`. */
export function columnOf(key: SyncOwnedKey): string {
  return leads[key].name;
}

/** The import history, newest first. */
export async function loadRecentSyncs(limit = 10) {
  return getDb()
    .select()
    .from(leadSyncs)
    .orderBy(sql`${leadSyncs.createdAt} desc`)
    .limit(limit);
}

// ---------------------------------------------------------------------------
// The call queue
// ---------------------------------------------------------------------------

/**
 * Where a lead sits in the funnel (D-CRM-2).
 *
 * **Derived from facts, never stored.** The back half reads engagement
 * timestamps, which are the money's own record — a stage column could disagree
 * with them, and then there would be two answers to "has this person paid".
 *
 * Order matters and runs most-authoritative first: a terminal ruling is a
 * decision Taylor made, a payment is a fact Stripe recorded, and both outrank
 * anything inferred from call history.
 */
export function getLeadStage(input: {
  closedState: LeadRow["closedState"];
  attemptCount: number;
  hadConversation: boolean;
  emailCount: number;
  /** An attempt logged with `linkTexted` — a texted link is an asset sent,
   * same weight as an email (M-CRM-8). `[PROVISIONAL — Taylor.]` */
  hadTextedLink: boolean;
  engagement: { sentAt: Date | null; paidAt: Date | null } | null;
}): LeadStage {
  const {
    closedState,
    attemptCount,
    hadConversation,
    emailCount,
    hadTextedLink,
    engagement,
  } = input;

  if (closedState === "do_not_call") return "do_not_call";
  if (closedState === "not_interested") return "not_interested";
  if (closedState === "bad_lead") return "bad_lead";

  if (engagement?.paidAt) return "client";
  if (engagement) return "intake_sent";

  if (closedState === "not_now") return "not_now";

  if (emailCount > 0 || hadTextedLink) return "info_sent";
  if (hadConversation) return "in_conversation";
  if (attemptCount > 0) return "trying";

  return "to_call";
}

export type QueueLead = {
  id: string;
  businessName: string;
  niche: string;
  city: string;
  /** Taylor's correction wins over Google's number for display. */
  phone: string;
  rating: number | null;
  reviews: number | null;
  mapsUrl: string;
  address: string;
  notes: string;
  /** Drives the intro-email dialog's empty state, opened from the focus card. */
  contactEmail: string | null;
  /** Prefills call mode's conversation form — what a prior call already
   * learned about the person is never asked for twice (D-CRM-25). */
  contactName: string | null;
  preferredChannel: ContactChannel | null;
  /** Prefills the intake mint in call mode's post-call panel. Computed by
   * `defaultProjectSummary` so the client never reimplements the wording. */
  projectSummary: string;
  leadScore: number;
  stage: LeadStage;
  window: CallWindow;
  attemptCount: number;
  lastAttemptAt: Date | null;
  lastDisposition: CallDisposition | null;
  nextActionAt: Date | null;
  nextActionNote: string | null;
};

export type QueueBands = {
  overdue: QueueLead[];
  dueToday: QueueLead[];
  fresh: QueueLead[];
  /** Fresh leads matching the filters, before the display cap. */
  freshTotal: number;
  /** Live leads scheduled beyond today — not shown, but not lost either. */
  scheduledLater: number;
  /** When the next scheduled lead comes due, for the empty state. */
  nextDueAt: Date | null;
  /**
   * What is waiting behind a closed window, per profile — the empty state's
   * "auto shops open up at 10, 129 waiting" (D-CRM-19: never a dead end).
   */
  waiting: { label: string; opensAt: string | null; count: number }[];
};

/** How many fresh leads render at once. Surfaced, never silent. */
export const FRESH_PAGE = 50;

export type QueueFilters = {
  thread?: "no_website" | "audit";
  niche?: string;
  /** "Ready to call now" — filters the fresh band only (D-CRM-18). */
  readyNow?: boolean;
  /**
   * How many fresh leads to render. Grows in `FRESH_PAGE` steps from the
   * queue's "show more" — the cap exists to keep the first paint quick, not to
   * hide work, so there has to be a way past it.
   */
  freshLimit?: number;
};

/**
 * The call queue, in bands (D-CRM-6).
 *
 * Overdue callbacks lead (promised time passed), then the rest of today's,
 * then never-dialed leads. **The two
 * callback bands are never filtered or reordered by the call-window model** — a
 * time Taylor promised a prospect outranks a model's opinion about the hour
 * (D-CRM-18).
 *
 * Terminally closed leads never appear, and `do_not_call` never appears by any
 * route: the exclusion is in the SQL, so no filter, sort, or "show everyone"
 * escape can reach past it.
 */
export async function loadQueue(
  filters: QueueFilters = {},
  now = new Date(),
): Promise<QueueBands> {
  const db = getDb();
  const { startOfTomorrow } = vancouverDayBounds(now);

  const live = await db
    .select()
    .from(leads)
    .where(
      and(
        // The DNC law, in the one place that cannot be bypassed downstream.
        or(isNull(leads.closedState), eq(leads.closedState, "not_now")),
        filters.thread ? eq(leads.thread, filters.thread) : undefined,
        filters.niche ? eq(leads.niche, filters.niche) : undefined,
      ),
    );

  const overdueRows: LeadRow[] = [];
  const dueTodayRows: LeadRow[] = [];
  const freshRows: LeadRow[] = [];
  let scheduledLater = 0;
  let nextDueAt: Date | null = null;

  for (const row of live) {
    if (row.nextActionAt === null) {
      freshRows.push(row);
    } else if (row.nextActionAt < now) {
      // Overdue is "the promised time has passed", not "before today". A 10am
      // callback still sitting there at 4pm is the lead most likely to be
      // forgotten, and burying it under this afternoon's upcoming ones is how
      // that happens.
      overdueRows.push(row);
    } else if (row.nextActionAt < startOfTomorrow) {
      dueTodayRows.push(row);
    } else {
      scheduledLater++;
      if (nextDueAt === null || row.nextActionAt < nextDueAt) {
        nextDueAt = row.nextActionAt;
      }
    }
  }

  /**
   * One window per niche, not per lead.
   *
   * `now` is fixed for the whole request and the niche vocabulary is eight
   * values, so the result is identical for every lead of a trade. This used to
   * be called from inside the sort comparator — O(n log n) recomputations —
   * which measured 1141 ms for the 1406-lead audit thread against 2 ms with
   * this memo.
   */
  const windowCache = new Map<string, CallWindow>();
  const windowOf = (row: LeadRow) => {
    let cached = windowCache.get(row.niche);
    if (!cached) {
      cached = getCallWindow(row.niche, now);
      windowCache.set(row.niche, cached);
    }
    return cached;
  };

  // Fresh sorts in-window first, then by score inside each tier (D-CRM-18).
  const TIER_RANK: Record<string, number> = {
    best: 0,
    fair: 1,
    unknown: 2,
    avoid: 3,
  };
  const readyFiltered = filters.readyNow
    ? freshRows.filter((row) => windowOf(row).isOpenNow)
    : freshRows;

  readyFiltered.sort((a, b) => {
    const rank = TIER_RANK[windowOf(a).tier]! - TIER_RANK[windowOf(b).tier]!;
    return rank !== 0 ? rank : b.leadScore - a.leadScore;
  });

  overdueRows.sort(
    (a, b) =>
      (a.nextActionAt?.getTime() ?? 0) - (b.nextActionAt?.getTime() ?? 0),
  );
  dueTodayRows.sort(
    (a, b) =>
      (a.nextActionAt?.getTime() ?? 0) - (b.nextActionAt?.getTime() ?? 0),
  );

  const freshLimit = Math.max(FRESH_PAGE, filters.freshLimit ?? FRESH_PAGE);
  const shown = [
    ...overdueRows,
    ...dueTodayRows,
    ...readyFiltered.slice(0, freshLimit),
  ];

  const context = await loadLeadContext(
    db,
    shown.map((row) => row.id),
  );

  const toQueueLead = (row: LeadRow): QueueLead => {
    const ctx = context.get(row.id);
    return {
      id: row.id,
      businessName: row.businessName,
      niche: row.niche,
      city: row.city,
      phone: row.phoneOverride ?? row.phone,
      rating: row.rating,
      reviews: row.reviews,
      mapsUrl: row.mapsUrl,
      address: row.address,
      notes: row.notes,
      contactEmail: row.contactEmail,
      contactName: row.contactName,
      preferredChannel: row.preferredChannel,
      projectSummary: defaultProjectSummary(row),
      leadScore: row.leadScore,
      stage: getLeadStage({
        closedState: row.closedState,
        attemptCount: ctx?.attemptCount ?? 0,
        hadConversation: ctx?.hadConversation ?? false,
        emailCount: ctx?.emailCount ?? 0,
        hadTextedLink: ctx?.hadTextedLink ?? false,
        engagement: ctx?.engagement ?? null,
      }),
      window: windowOf(row),
      attemptCount: ctx?.attemptCount ?? 0,
      lastAttemptAt: ctx?.lastAttemptAt ?? null,
      lastDisposition: ctx?.lastDisposition ?? null,
      nextActionAt: row.nextActionAt,
      nextActionNote: row.nextActionNote,
    };
  };

  // What is waiting behind a closed window, so the empty state can say so.
  const waitingByProfile = new Map<
    string,
    { opensAt: string | null; count: number }
  >();
  for (const row of freshRows) {
    const w = windowOf(row);
    if (w.isOpenNow) continue;
    const key = w.profile;
    const entry = waitingByProfile.get(key) ?? {
      opensAt: w.nextOpensAt,
      count: 0,
    };
    entry.count++;
    waitingByProfile.set(key, entry);
  }

  const waiting = [...waitingByProfile.entries()]
    .map(([profile, entry]) => ({
      label:
        profile === "unknown"
          ? "Other"
          : CALL_WINDOW_PROFILES[profile as keyof typeof CALL_WINDOW_PROFILES]
              .label,
      opensAt: entry.opensAt,
      count: entry.count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    overdue: overdueRows.map(toQueueLead),
    dueToday: dueTodayRows.map(toQueueLead),
    fresh: readyFiltered.slice(0, freshLimit).map(toQueueLead),
    freshTotal: readyFiltered.length,
    scheduledLater,
    nextDueAt,
    waiting,
  };
}

// ---------------------------------------------------------------------------
// Aggregate facts about a set of leads
// ---------------------------------------------------------------------------

export type LeadContext = {
  attemptCount: number;
  hadConversation: boolean;
  hadTextedLink: boolean;
  lastAttemptAt: Date | null;
  lastDisposition: CallDisposition | null;
  emailCount: number;
  engagement: { sentAt: Date | null; paidAt: Date | null } | null;
};

/**
 * Attempt history, email history, and engagement state for a set of leads.
 *
 * Aggregated in the database rather than by pulling every attempt row: the
 * caller needs a few numbers per lead, and fetching the full history to count
 * it would grow with how hard Taylor has worked the list.
 */
export async function loadLeadContext(
  db: ReturnType<typeof getDb>,
  leadIds: string[],
): Promise<Map<string, LeadContext>> {
  const result = new Map<string, LeadContext>();
  if (leadIds.length === 0) return result;

  const ensure = (id: string): LeadContext => {
    let entry = result.get(id);
    if (!entry) {
      entry = {
        attemptCount: 0,
        hadConversation: false,
        hadTextedLink: false,
        lastAttemptAt: null,
        lastDisposition: null,
        emailCount: 0,
        engagement: null,
      };
      result.set(id, entry);
    }
    return entry;
  };

  for (let i = 0; i < leadIds.length; i += 1000) {
    const chunk = leadIds.slice(i, i + 1000);

    const attempts = await db
      .select({
        leadId: callAttempts.leadId,
        attemptCount: sql<number>`count(*)::int`,
        hadConversation: sql<boolean>`bool_or(${callAttempts.disposition} = 'conversation')`,
        hadTextedLink: sql<boolean>`bool_or(${callAttempts.linkTexted})`,
        lastAttemptAt: sql<Date>`max(${callAttempts.createdAt})`,
      })
      .from(callAttempts)
      .where(inArray(callAttempts.leadId, chunk))
      .groupBy(callAttempts.leadId);

    for (const row of attempts) {
      const entry = ensure(row.leadId);
      entry.attemptCount = row.attemptCount;
      entry.hadConversation = row.hadConversation;
      entry.hadTextedLink = row.hadTextedLink;
      entry.lastAttemptAt = row.lastAttemptAt
        ? new Date(row.lastAttemptAt)
        : null;
    }

    const latest = await db
      .selectDistinctOn([callAttempts.leadId], {
        leadId: callAttempts.leadId,
        disposition: callAttempts.disposition,
      })
      .from(callAttempts)
      .where(inArray(callAttempts.leadId, chunk))
      .orderBy(callAttempts.leadId, desc(callAttempts.createdAt));

    for (const row of latest)
      ensure(row.leadId).lastDisposition = row.disposition;

    const emails = await db
      .select({
        leadId: leadEmails.leadId,
        emailCount: sql<number>`count(*)::int`,
      })
      .from(leadEmails)
      .where(inArray(leadEmails.leadId, chunk))
      .groupBy(leadEmails.leadId);

    for (const row of emails) ensure(row.leadId).emailCount = row.emailCount;

    const linked = await db
      .select({
        leadId: leads.id,
        sentAt: engagements.sentAt,
        paidAt: engagements.paidAt,
      })
      .from(leads)
      .innerJoin(engagements, eq(leads.engagementId, engagements.id))
      .where(inArray(leads.id, chunk));

    for (const row of linked) {
      ensure(row.leadId).engagement = {
        sentAt: row.sentAt,
        paidAt: row.paidAt,
      };
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Lead detail
// ---------------------------------------------------------------------------

/**
 * One entry in a lead's history.
 *
 * Attempts and emails are real rows; the closure is a timestamp on the lead.
 * There is deliberately no stage-change event, because stage is derived and
 * has no change history of its own — the attempts and emails *are* the record
 * of how it moved, which is why they carry enough detail to read as one.
 */
export type TimelineEntry =
  | {
      kind: "attempt";
      /** The row's own id — the transcript editor's write target. */
      id: string;
      at: Date;
      disposition: CallDisposition;
      interestTags: InterestTag[];
      linkTexted: boolean;
      note: string | null;
      transcript: string | null;
    }
  | {
      kind: "email";
      at: Date;
      subject: string;
      toEmail: string;
      promoIncluded: boolean;
      /** Null when the send failed — the row is written before the send. */
      delivered: boolean;
    }
  | { kind: "closed"; at: Date; state: LeadClosedState; reason: string | null };

export type LeadDetail = {
  lead: LeadRow;
  stage: LeadStage;
  window: CallWindow;
  timeline: TimelineEntry[];
  /** Display number: Taylor's correction if he made one, else Google's. */
  displayPhone: string;
  engagement: { id: string; sentAt: Date | null; paidAt: Date | null } | null;
};

export async function loadLeadDetail(
  leadId: string,
  now = new Date(),
): Promise<LeadDetail | null> {
  const db = getDb();

  const lead = await db.query.leads.findFirst({ where: eq(leads.id, leadId) });
  if (!lead) return null;

  const attempts = await db
    .select()
    .from(callAttempts)
    .where(eq(callAttempts.leadId, leadId));

  const emails = await db
    .select()
    .from(leadEmails)
    .where(eq(leadEmails.leadId, leadId));

  const engagement = lead.engagementId
    ? ((await db.query.engagements.findFirst({
        where: eq(engagements.id, lead.engagementId),
        columns: { id: true, sentAt: true, paidAt: true },
      })) ?? null)
    : null;

  const timeline: TimelineEntry[] = [
    ...attempts.map((row) => ({
      kind: "attempt" as const,
      id: row.id,
      at: row.createdAt,
      disposition: row.disposition,
      interestTags: row.interestTags,
      linkTexted: row.linkTexted,
      note: row.note,
      transcript: row.transcript,
    })),
    ...emails.map((row) => ({
      kind: "email" as const,
      at: row.createdAt,
      subject: row.subject,
      toEmail: row.toEmail,
      promoIncluded: row.promoIncluded,
      delivered: row.resendId !== null,
    })),
    ...(lead.closedState && lead.closedAt
      ? [
          {
            kind: "closed" as const,
            at: lead.closedAt,
            state: lead.closedState,
            reason: lead.closedReason,
          },
        ]
      : []),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return {
    lead,
    stage: getLeadStage({
      closedState: lead.closedState,
      attemptCount: attempts.length,
      hadConversation: attempts.some((a) => a.disposition === "conversation"),
      emailCount: emails.length,
      hadTextedLink: attempts.some((a) => a.linkTexted),
      engagement,
    }),
    window: getCallWindow(lead.niche, now),
    timeline,
    displayPhone: lead.phoneOverride ?? lead.phone,
    engagement,
  };
}

/**
 * Adds or corrects what Taylor learned: an email address, a working number.
 *
 * `phoneOverride` is written rather than `phone` so Google's value survives —
 * the next sync would restore it anyway, and two numbers that disagree should
 * both stay visible.
 */
export async function updateLeadContact(
  raw: z.input<typeof updateLeadContactInput>,
): Promise<void> {
  const input = updateLeadContactInput.parse(raw);

  await getDb()
    .update(leads)
    .set({
      ...(input.contactEmail !== undefined
        ? { contactEmail: input.contactEmail || null }
        : {}),
      ...(input.phoneOverride !== undefined
        ? { phoneOverride: input.phoneOverride || null }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(leads.id, input.leadId));
}

// ---------------------------------------------------------------------------
// The bridge to the money
// ---------------------------------------------------------------------------

/**
 * Attach an engagement to a lead.
 *
 * `leads.engagement_id` is unique, so a second lead claiming the same
 * engagement fails at the database rather than producing two pipeline rows
 * that both think they own one deposit. That error is surfaced, not swallowed.
 */
export async function linkEngagement(
  leadId: string,
  engagementId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getDb();

  const [claimedBy] = await db
    .select({ id: leads.id, businessName: leads.businessName })
    .from(leads)
    .where(eq(leads.engagementId, engagementId))
    .limit(1);

  if (claimedBy && claimedBy.id !== leadId) {
    return {
      ok: false,
      message: `That engagement is already linked to ${claimedBy.businessName}.`,
    };
  }

  await db
    .update(leads)
    .set({ engagementId, updatedAt: new Date() })
    .where(eq(leads.id, leadId));

  return { ok: true };
}

/**
 * Detach without deleting anything.
 *
 * The engagement keeps existing — it holds a deposit and a questionnaire, and
 * nothing about a mis-link should put those at risk.
 */
export async function unlinkEngagement(leadId: string): Promise<void> {
  await getDb()
    .update(leads)
    .set({ engagementId: null, updatedAt: new Date() })
    .where(eq(leads.id, leadId));
}

export type EngagementSuggestion = {
  id: string;
  businessName: string;
  contactEmail: string;
  createdAt: Date;
  /** Why this one is being suggested. */
  matchedOn: "email" | "phone" | "name";
};

/**
 * Engagements that plausibly belong to this lead.
 *
 * Matched on the facts that survive a client typing their own details into the
 * public start form: their email, their phone, their business name. Unclaimed
 * engagements only — one already attached to another lead is not a suggestion,
 * it is someone else's client.
 */
export async function suggestEngagements(
  leadId: string,
): Promise<EngagementSuggestion[]> {
  const db = getDb();

  const lead = await db.query.leads.findFirst({ where: eq(leads.id, leadId) });
  if (!lead) return [];

  const claimed = await db
    .select({ engagementId: leads.engagementId })
    .from(leads)
    .where(isNotNull(leads.engagementId));

  const taken = new Set(claimed.map((row) => row.engagementId));

  const phone = (lead.phoneOverride ?? lead.phone).replace(/[^\d]/g, "");

  const rows = await db
    .select({
      id: engagements.id,
      businessName: engagements.businessName,
      contactEmail: engagements.contactEmail,
      contactPhone: engagements.contactPhone,
      createdAt: engagements.createdAt,
    })
    .from(engagements)
    .orderBy(desc(engagements.createdAt))
    .limit(200);

  const suggestions: EngagementSuggestion[] = [];

  for (const row of rows) {
    if (taken.has(row.id)) continue;

    const matchedOn: EngagementSuggestion["matchedOn"] | null =
      lead.contactEmail &&
      row.contactEmail.toLowerCase() === lead.contactEmail.toLowerCase()
        ? "email"
        : phone && (row.contactPhone ?? "").replace(/[^\d]/g, "") === phone
          ? "phone"
          : row.businessName.trim().toLowerCase() ===
              lead.businessName.trim().toLowerCase()
            ? "name"
            : null;

    if (matchedOn) {
      suggestions.push({
        id: row.id,
        businessName: row.businessName,
        contactEmail: row.contactEmail,
        createdAt: row.createdAt,
        matchedOn,
      });
    }
  }

  return suggestions;
}

/**
 * The project summary that prefills the create form.
 *
 * It renders verbatim on the client's pay screen, so it is written for their
 * eyes rather than as an internal label — and Taylor edits it before sending.
 */
export function defaultProjectSummary(lead: {
  businessName: string;
  niche: string;
  city: string;
}): string {
  return `A five-page website for ${lead.businessName}, ${lead.niche} in ${lead.city}. Built from your answers below, live about a week after we have them.`;
}
