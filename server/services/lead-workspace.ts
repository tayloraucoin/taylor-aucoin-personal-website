import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { getDb } from "@/db/client";
import { leads } from "@/db/schema";
import {
  CALL_WINDOW_PROFILES,
  NICHE_PROFILES,
  vancouverDayBounds,
} from "@/lib/crm/call-windows";
import { GONE_QUIET_DAYS, LEAD_PAGE } from "@/lib/crm/constants";
import type {
  CallDisposition,
  LeadClosedState,
  LeadStage,
} from "@/lib/types/crm";
import type { LeadFilters } from "@/lib/validators/crm";
import { getLeadStage, loadLeadContext } from "@/server/services/leads";

/**
 * The reads behind `/admin/leads` — the lookup and comprehension surface
 * (CRM-18), as distinct from the call list.
 *
 * **This file deliberately does not follow `loadQueue`'s shape.** That
 * function selects every live lead row into Node and bands them in JavaScript,
 * which is correct for its job and its volume, and copying it here would put a
 * full-table materialization behind a surface with ten facets on it. Here:
 * predicates and counts stay in SQL, columns are projected explicitly, and the
 * result is paged. If you are adding to this file, keep it that way.
 *
 * The one thing that cannot go into SQL is **stage**. `getLeadStage` is its
 * single home (D-CRM-2, M-CRM-4) and re-expressing that ladder as a `CASE`
 * would be a second home for the same truth — the exact defect the derived
 * stage exists to prevent. See `WORKED` for how the surface stays cheap
 * anyway.
 */

// ---------------------------------------------------------------------------
// The derived complement (M-CRM-10)
// ---------------------------------------------------------------------------

/**
 * Leads that are anything other than `to_call`.
 *
 * `getLeadStage` returns `to_call` only when every fact is absent, and both
 * `hadConversation` and `hadTextedLink` are themselves derived from attempt
 * rows — so they cannot be true where `attemptCount` is zero. The ladder
 * collapses to exactly these four terms, and this is their negation.
 *
 * That makes it a restatement of `getLeadStage`'s *base case*, not a second
 * implementation of the ladder: it decides only "worked or not", never which
 * stage. Everything past that is still derived in TypeScript, in one place.
 *
 * The consequence is the reason the board is affordable: the set of leads
 * needing per-row aggregates is the set Taylor has actually worked, which
 * grows with dials made rather than with leads imported. `to_call` is then
 * counted by subtraction and never queried on its own, so it cannot disagree
 * with the function that defines it.
 *
 * All four terms are indexed — `call_attempts_lead_id_idx`,
 * `lead_emails_lead_id_idx`, `leads_engagement_id_idx`, and `closed_state`
 * leading `leads_queue_idx`.
 */
const WORKED: SQL = or(
  isNotNull(leads.closedState),
  isNotNull(leads.engagementId),
  // Outer reference written literally, for the reason spelled out on
  // `lastTouchAt` below: bare `"id"` would bind to the subquery's own table.
  // Safe here today because this only ever appears in a WHERE clause — and
  // written this way so it stays safe if it ever does not.
  sql`exists (select 1 from call_attempts ca where ca.lead_id = "leads"."id")`,
  sql`exists (select 1 from lead_emails le where le.lead_id = "leads"."id")`,
)!;

/**
 * When this lead was last touched: the most recent dial or intro email,
 * whichever is later, null if neither exists.
 *
 * One expression, one home — the filter, the sort, and the displayed "11 days
 * ago" all read it, so they can never disagree about what a touch is.
 *
 * Postgres `greatest` ignores nulls and returns null only when every argument
 * is null, which is exactly the semantics wanted here. The subqueries use
 * their own aliases so nothing can bind to the outer `leads`.
 *
 * **The outer reference is written as literal `"leads"."id"` rather than
 * `${leads.id}`, and it has to be.** Drizzle renders a column reference
 * qualified (`"leads"."id"`) inside a WHERE clause but *bare* (`"id"`) in a
 * SELECT projection. Bare is not merely untidy here — `call_attempts` has its
 * own `id` column, so the correlated subquery would bind to `ca.id`, compare
 * it against `ca.lead_id`, and return null for every row. The filter would
 * have kept working (it is built in WHERE) while the displayed "touched 11
 * days ago" quietly read "never called" on every line. Caught by inspecting
 * the generated SQL; nothing in the type system can see it.
 */
const lastTouchAt = sql<string | null>`greatest(
  (select max(ca.created_at) from call_attempts ca where ca.lead_id = "leads"."id"),
  (select max(le.created_at) from lead_emails le where le.lead_id = "leads"."id")
)`;

/** Niches whose call-window profile is walk-in viable (§3.7). Read from the
 * config rather than restated, so the filter cannot drift from the table that
 * owns those values (D-CRM-17). */
function walkInNiches(): string[] {
  // Widened to an index signature rather than cast: `NICHE_PROFILES` can name
  // the `unknown` profile, which has no config row, and a lookup that can miss
  // should say so in its type.
  const table: Record<string, { walkInViable: boolean } | undefined> =
    CALL_WINDOW_PROFILES;

  return Object.entries(NICHE_PROFILES)
    .filter(([, profile]) => table[profile]?.walkInViable === true)
    .map(([niche]) => niche);
}

// ---------------------------------------------------------------------------
// The saved views (D-CRM-34)
// ---------------------------------------------------------------------------

/**
 * What each preset actually asks the database.
 *
 * Named functions rather than four inline `and(...)` blobs: these clauses are
 * Taylor's sales judgment expressed as predicates, they are the part of this
 * surface types cannot check, and a reader has to be able to find and argue
 * with them in one place. They are also the unit a test would target the day
 * this repo grows one.
 *
 * Every preset except `no_next_action` stays clear of terminally closed leads.
 * `no_next_action` does too, by matching the scoreboard's own clause exactly —
 * see below.
 */
const NOT_TERMINAL: SQL = or(
  isNull(leads.closedState),
  eq(leads.closedState, "not_now"),
)!;

/**
 * Worked, carrying no live date, and untouched for a while.
 *
 * The nurture list, and the reason CRM-18 exists. "No live date" covers both
 * a missing next action and one whose time has passed — a promise made three
 * weeks ago and never kept is the same silence as no promise at all.
 */
function goneQuiet(now: Date): SQL {
  const cutoff = new Date(now.getTime() - GONE_QUIET_DAYS * 86400000);
  return and(
    WORKED,
    NOT_TERMINAL,
    or(isNull(leads.nextActionAt), lt(leads.nextActionAt, now)),
    sql`(${lastTouchAt} is null or ${lastTouchAt} < ${cutoff})`,
  )!;
}

/**
 * Dialled at least once, not closed, and carrying no next action — a D-CRM-4
 * defect.
 *
 * **This clause is a deliberate mirror of `loadScoreboard`'s
 * `workedWithoutNextAction` query** (`server/services/scoreboard.ts`): the
 * scoreboard counts them and this preset lists them, so the number Taylor
 * clicks and the number he lands on must be the same number. It is
 * attempt-based rather than `WORKED`-based for exactly that reason — widening
 * it here to include email-only leads would be more principled and would make
 * the two disagree, which is worse.
 */
function noNextAction(): SQL {
  return and(
    sql`exists (select 1 from call_attempts ca where ca.lead_id = "leads"."id")`,
    isNull(leads.closedState),
    isNull(leads.nextActionAt),
  )!;
}

/**
 * They asked for the info on a call and it never went out.
 *
 * The most expensive leak in the funnel: "send me something" is the best
 * thing a first call produces and the easiest to drop. Counts a texted link
 * as sent, same as an email (M-CRM-8).
 */
function wantsInfoUnsent(): SQL {
  return and(
    sql`exists (
      select 1 from call_attempts ca
      where ca.lead_id = "leads"."id"
        and ca.interest_tags @> '["wants_info"]'::jsonb
    )`,
    sql`not exists (
      select 1 from lead_emails le
      where le.lead_id = "leads"."id" and le.kind = 'intro'
    )`,
    sql`not exists (
      select 1 from call_attempts ca
      where ca.lead_id = "leads"."id" and ca.link_texted
    )`,
    NOT_TERMINAL,
  )!;
}

/** Resting leads whose own resurface date lands inside the next 30 days —
 * what is about to come back, before it does. */
function resurfacing(now: Date): SQL {
  const horizon = new Date(now.getTime() + 30 * 86400000);
  return and(
    eq(leads.closedState, "not_now"),
    isNotNull(leads.nextActionAt),
    gte(leads.nextActionAt, now),
    lt(leads.nextActionAt, horizon),
  )!;
}

function presetClause(
  preset: NonNullable<LeadFilters["preset"]>,
  now: Date,
): SQL {
  switch (preset) {
    case "gone_quiet":
      return goneQuiet(now);
    case "no_next_action":
      return noNextAction();
    case "wants_info_unsent":
      return wantsInfoUnsent();
    case "resurfacing":
      return resurfacing(now);
  }
}

// ---------------------------------------------------------------------------
// The workspace query
// ---------------------------------------------------------------------------

export type LeadWorkspaceRow = {
  id: string;
  businessName: string;
  niche: string;
  city: string;
  /** Taylor's correction wins over Google's number for display. */
  phone: string;
  rating: number | null;
  reviews: number | null;
  leadScore: number;
  closedState: LeadClosedState | null;
  hasEmail: boolean;
  stage: LeadStage;
  attemptCount: number;
  lastDisposition: CallDisposition | null;
  lastTouchAt: Date | null;
  nextActionAt: Date | null;
};

export type LeadWorkspace = {
  rows: LeadWorkspaceRow[];
  /** Leads matching the filters, before the display cap. */
  total: number;
  /** Every lead in the table, for the "showing N of M" line. */
  allLeads: number;
  /** What `shown` has to grow to for the next page. */
  shown: number;
};

/**
 * Column-level predicates — everything expressible without knowing a lead's
 * stage.
 *
 * `lastTouch` is in here rather than derived alongside stage on purpose: it is
 * a scalar subquery, so keeping it in SQL is what lets the page be limited
 * correctly. Filtering it in TypeScript after a `LIMIT` would silently return
 * a short page.
 */
function baseClauses(filters: LeadFilters, now: Date): (SQL | undefined)[] {
  const { startOfTomorrow } = vancouverDayBounds(now);
  const clauses: (SQL | undefined)[] = [];

  if (filters.preset) clauses.push(presetClause(filters.preset, now));

  if (filters.q) {
    const term = `%${filters.q}%`;
    // Contact name, address, and notes join the original four (S4): when a
    // business rings back and Taylor has the person's name but not the shop's,
    // the surface that exists for that lookup has to find them. Notes are
    // searched, never projected — see the row type above.
    clauses.push(
      or(
        ilike(leads.businessName, term),
        ilike(leads.phone, term),
        ilike(leads.city, term),
        ilike(leads.niche, term),
        ilike(leads.contactName, term),
        ilike(leads.address, term),
        ilike(leads.notes, term),
      ),
    );
  }

  if (filters.thread) clauses.push(eq(leads.thread, filters.thread));
  if (filters.niche) clauses.push(eq(leads.niche, filters.niche));
  if (filters.city) clauses.push(eq(leads.city, filters.city));
  if (filters.websiteBucket) {
    clauses.push(eq(leads.websiteBucket, filters.websiteBucket));
  }
  if (filters.hasEmail) clauses.push(isNotNull(leads.contactEmail));
  if (filters.hasEngagement) clauses.push(isNotNull(leads.engagementId));
  if (filters.walkIn) clauses.push(inArray(leads.niche, walkInNiches()));

  // Buckets mirror the queue's own vocabulary exactly (D-CRM-6): overdue is
  // "the promised time has passed", not "before today".
  switch (filters.nextAction) {
    case "overdue":
      clauses.push(and(isNotNull(leads.nextActionAt), lt(leads.nextActionAt, now)));
      break;
    case "today":
      clauses.push(
        and(gte(leads.nextActionAt, now), lt(leads.nextActionAt, startOfTomorrow)),
      );
      break;
    case "week":
      clauses.push(
        and(
          gte(leads.nextActionAt, startOfTomorrow),
          lt(
            leads.nextActionAt,
            new Date(startOfTomorrow.getTime() + 7 * 86400000),
          ),
        ),
      );
      break;
    case "later":
      clauses.push(
        gte(
          leads.nextActionAt,
          new Date(startOfTomorrow.getTime() + 7 * 86400000),
        ),
      );
      break;
    case "none":
      clauses.push(isNull(leads.nextActionAt));
      break;
    case undefined:
      break;
  }

  const days = (n: number) => new Date(now.getTime() - n * 86400000);

  switch (filters.lastTouch) {
    case "never":
      clauses.push(sql`${lastTouchAt} is null`);
      break;
    case "under7":
      clauses.push(sql`${lastTouchAt} >= ${days(7)}`);
      break;
    case "7to30":
      clauses.push(sql`${lastTouchAt} < ${days(7)} and ${lastTouchAt} >= ${days(30)}`);
      break;
    case "over30":
      clauses.push(sql`${lastTouchAt} < ${days(30)}`);
      break;
    case undefined:
      break;
  }

  return clauses;
}

function orderClause(sort: LeadFilters["sort"]): SQL {
  switch (sort) {
    case "score":
      return sql`${desc(leads.leadScore)}`;
    case "name":
      return sql`${asc(leads.businessName)}`;
    case "nextAction":
      return sql`${leads.nextActionAt} asc nulls last`;
    // Oldest touch first: what is going quiet rises on its own, without
    // anything needing to shout about it (D-CRM-33). Never-touched leads sort
    // last — they are unworked, not neglected.
    case "lastTouch":
      return sql`${lastTouchAt} asc nulls last`;
  }
}

/**
 * The list behind `/admin/leads`.
 *
 * Stage cannot be filtered in SQL (see this file's header), so it is handled
 * in two shapes depending on whether the caller actually filters by it:
 *
 * - **No stage filter** — stage is display-only. Page in SQL, then derive
 *   stage for the rows on the page. Cost is one page of aggregates.
 * - **Stage filter** — resolve the qualifying ids first over the *worked* set
 *   (bounded by dials made, not leads imported — see `WORKED`), then run the
 *   real query against `id in (…)`. Unworked leads need no aggregates at all:
 *   their stage is `to_call` by definition, so they join back in as a plain
 *   `not (WORKED)` term when `to_call` is among the selected stages.
 *
 * Either way `getLeadStage` stays the only thing that decides a stage.
 */
export async function loadLeadWorkspace(
  filters: LeadFilters,
  now = new Date(),
): Promise<LeadWorkspace> {
  const db = getDb();
  const base = baseClauses(filters, now);
  const limit = Math.max(LEAD_PAGE, filters.shown ?? LEAD_PAGE);

  let scope: SQL | undefined = and(...base);

  if (filters.stages.length > 0) {
    const selected = new Set<LeadStage>(filters.stages);
    const wantsToCall = selected.has("to_call");
    const wantsWorked = [...selected].some((stage) => stage !== "to_call");

    let qualifying: string[] = [];

    if (wantsWorked) {
      const candidates = await db
        .select({ id: leads.id, closedState: leads.closedState })
        .from(leads)
        .where(and(...base, WORKED));

      const context = await loadLeadContext(
        db,
        candidates.map((row) => row.id),
      );

      qualifying = candidates
        .filter((row) => {
          const ctx = context.get(row.id);
          const stage = getLeadStage({
            closedState: row.closedState,
            attemptCount: ctx?.attemptCount ?? 0,
            hadConversation: ctx?.hadConversation ?? false,
            emailCount: ctx?.emailCount ?? 0,
            hadTextedLink: ctx?.hadTextedLink ?? false,
            engagement: ctx?.engagement ?? null,
          });
          return selected.has(stage);
        })
        .map((row) => row.id);
    }

    const stageScope = or(
      qualifying.length > 0 ? inArray(leads.id, qualifying) : undefined,
      wantsToCall ? sql`not (${WORKED})` : undefined,
    );

    // Every selected stage matched nothing: an explicit false, so the count
    // and the page agree on empty rather than the `and()` collapsing to
    // "no constraint" and returning the whole table.
    scope = and(...base, stageScope ?? sql`false`);
  }

  const [total, allLeads] = await Promise.all([
    db.$count(leads, scope),
    db.$count(leads),
  ]);

  const rows = await db
    .select({
      id: leads.id,
      businessName: leads.businessName,
      niche: leads.niche,
      city: leads.city,
      phone: leads.phone,
      phoneOverride: leads.phoneOverride,
      rating: leads.rating,
      reviews: leads.reviews,
      leadScore: leads.leadScore,
      closedState: leads.closedState,
      contactEmail: leads.contactEmail,
      nextActionAt: leads.nextActionAt,
      lastTouchAt: lastTouchAt.as("last_touch_at"),
    })
    .from(leads)
    .where(scope)
    .orderBy(orderClause(filters.sort), asc(leads.businessName))
    .limit(limit);

  const context = await loadLeadContext(
    db,
    rows.map((row) => row.id),
  );

  return {
    rows: rows.map((row) => {
      const ctx = context.get(row.id);
      return {
        id: row.id,
        businessName: row.businessName,
        niche: row.niche,
        city: row.city,
        phone: row.phoneOverride ?? row.phone,
        rating: row.rating,
        reviews: row.reviews,
        leadScore: row.leadScore,
        closedState: row.closedState,
        hasEmail: Boolean(row.contactEmail),
        stage: getLeadStage({
          closedState: row.closedState,
          attemptCount: ctx?.attemptCount ?? 0,
          hadConversation: ctx?.hadConversation ?? false,
          emailCount: ctx?.emailCount ?? 0,
          hadTextedLink: ctx?.hadTextedLink ?? false,
          engagement: ctx?.engagement ?? null,
        }),
        attemptCount: ctx?.attemptCount ?? 0,
        lastDisposition: ctx?.lastDisposition ?? null,
        lastTouchAt: row.lastTouchAt ? new Date(row.lastTouchAt) : null,
        nextActionAt: row.nextActionAt,
      };
    }),
    total,
    allLeads,
    shown: limit,
  };
}

/** Total leads, unfiltered. Kept for callers that only want the denominator. */
export async function countLeads(): Promise<number> {
  return getDb().$count(leads);
}

/**
 * The values the trade and city selects offer.
 *
 * Read from the leads actually in the table rather than from a config list:
 * a city with no leads in it is a filter that can only ever return nothing,
 * and offering it is a small lie about what is here.
 */
export async function loadLeadFacets(): Promise<{
  niches: string[];
  cities: string[];
}> {
  const db = getDb();

  const [niches, cities] = await Promise.all([
    db.selectDistinct({ value: leads.niche }).from(leads).orderBy(asc(leads.niche)),
    db.selectDistinct({ value: leads.city }).from(leads).orderBy(asc(leads.city)),
  ]);

  return {
    niches: niches.map((row) => row.value).filter(Boolean),
    cities: cities.map((row) => row.value).filter(Boolean),
  };
}
