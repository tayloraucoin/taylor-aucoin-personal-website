import { z } from "zod";

/**
 * Validation for every CRM write, defined once and shared by the server
 * actions and the sync service.
 *
 * The CSV row schema is the important one: it is the boundary between a file
 * Taylor drags in and the database, and it is the only place that decides what
 * a valid lead looks like.
 */

export const callDispositionSchema = z.enum([
  "no_answer",
  "voicemail",
  "hung_up",
  "busy_callback",
  "conversation",
  "wrong_number",
  "not_interested",
  "do_not_call",
]);

export const interestTagSchema = z.enum([
  "wants_info",
  "decision_maker",
  "price_talk",
  "not_now",
  "ready_for_intake",
]);

export const leadClosedStateSchema = z.enum([
  "not_now",
  "not_interested",
  "do_not_call",
  "bad_lead",
]);

export const leadThreadSchema = z.enum(["no_website", "audit"]);

export const leadWebsiteBucketSchema = z.enum(["none", "social_only", "real"]);

export const contactChannelSchema = z.enum(["text", "email"]);

/**
 * An empty string is how a surface says "clear this", and it has to be a
 * valid input rather than a validation error — otherwise clearing a wrong
 * value fails, and the only thing the caller can honestly report is "try
 * again", which would never work. Shared by every write path that touches
 * these two facts, so the contract can't drift between them.
 */
const clearableEmail = z
  .union([z.email(), z.literal("")])
  .nullable()
  .optional();
const clearablePhone = z.string().trim().max(40).nullable().optional();

/**
 * One row of `crm_leads.csv`, as produced by `yarn leadgen export --crm`.
 *
 * `place_id` is required and unique-keyed downstream: it is the whole reason a
 * re-import upserts instead of duplicating (M-CRM-4). A file without that
 * column is the wrong export, and the sync screen says so by name rather than
 * failing obscurely halfway through.
 *
 * Numeric fields arrive as strings from CSV and are coerced; a blank cell
 * becomes null rather than 0, because "no rating" and "rated zero" are
 * different facts about a business.
 */
export const crmLeadCsvRow = z.object({
  place_id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  niche: z.string().trim().min(1),
  city: z.string().trim().min(1),
  thread: leadThreadSchema,
  phone: z.string().trim().default(""),
  address: z.string().trim().default(""),
  rating: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .pipe(z.number().min(0).max(5).nullable()),
  reviews: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .pipe(z.number().int().min(0).nullable()),
  website: z.string().trim().default(""),
  website_bucket: leadWebsiteBucketSchema,
  maps_url: z.string().trim().default(""),
  lead_score: z
    .string()
    .trim()
    .transform((v) => (v === "" ? 0 : Number(v)))
    .pipe(z.number().int()),
  niches: z.string().trim().default(""),
});

export type CrmLeadCsvRow = z.infer<typeof crmLeadCsvRow>;

/** The columns a `--crm` export must carry for the sync to accept the file. */
export const REQUIRED_CSV_COLUMNS = [
  "place_id",
  "name",
  "niche",
  "city",
  "thread",
  "website_bucket",
] as const;

/** Logging one dial. `note` is optional everywhere — nothing beyond the
 * disposition is ever required of a hurried caller (D-CRM-8). The contact
 * fields, channel, and `linkTexted` are what a conversation captures
 * (D-CRM-25); a bare disposition never needs any of them. */
export const logAttemptInput = z.object({
  leadId: z.uuid(),
  disposition: callDispositionSchema,
  interestTags: z.array(interestTagSchema).default([]),
  note: z.string().trim().max(4000).optional(),
  /**
   * Captured the same way `note` is — typed before Save and sent with the
   * disposition — for whenever a transcript is already in hand by the time
   * the call is being logged. Not every transcript arrives this fast; one
   * that shows up later goes through `saveTranscriptInput` instead, targeted
   * at the specific attempt it belongs to.
   */
  transcript: z.string().trim().max(50000).optional(),
  /** Explicit override of the cadence-computed next attempt — a token
   * resolved server-side, or a datetime the caller picked directly. Either
   * way this always wins over the cadence default (D-CRM-4). */
  nextActionAt: z.date().nullable().optional(),
  nextActionNote: z.string().trim().max(500).optional(),
  contactName: z.string().trim().max(200).nullable().optional(),
  contactEmail: clearableEmail,
  phoneOverride: clearablePhone,
  preferredChannel: contactChannelSchema.nullable().optional(),
  /** A texted link is an asset sent — recorded on the attempt, not composed
   * here (composing/sending is CRM-16). */
  linkTexted: z.boolean().optional(),
});

/**
 * Adjusting what a already-logged call left behind (D-CRM-24).
 *
 * Call mode logs a non-conversation disposition the instant it is clicked, so
 * the chips that refine it — a different callback time, the reason they said
 * no — arrive *after* the attempt row exists. They must never write a second
 * attempt: one dial is one row, and a scoreboard whose denominator counts
 * chip-clicks is worse than no scoreboard. This touches the lead only.
 */
export const adjustFollowUpInput = z.object({
  leadId: z.uuid(),
  nextActionAt: z.date().nullable().optional(),
  nextActionNote: z.string().trim().max(500).optional(),
  closedReason: z.string().trim().max(500).optional(),
});

export const closeLeadInput = z.object({
  leadId: z.uuid(),
  closedState: leadClosedStateSchema,
  closedReason: z.string().trim().max(500).optional(),
  /** Required by the surface when closing as `not_now` — a rest with no
   * return date is how a warm lead gets lost. */
  resurfaceAt: z.date().nullable().optional(),
});

export const updateLeadContactInput = z.object({
  leadId: z.uuid(),
  contactEmail: clearableEmail,
  phoneOverride: clearablePhone,
});

export const saveLeadNotesInput = z.object({
  leadId: z.uuid(),
  notes: z.string().max(20000),
});

/**
 * A transcript, attached to the one dial it belongs to — never to the lead
 * (notes' pattern), because the whole point is that these accumulate across
 * calls rather than overwriting each other. `attemptId`, not `leadId`: the
 * same reasoning as `linkTexted` (CRM-16) — targeting the specific row a
 * second tab or a later session couldn't confuse for a different dial.
 * 50,000 characters is a generous ceiling for a real phone call, not an
 * invitation — it exists so a mistaken paste of something enormous fails
 * loudly instead of silently.
 */
export const saveTranscriptInput = z.object({
  attemptId: z.uuid(),
  transcript: z.string().trim().max(50000),
});

// ---------------------------------------------------------------------------
// The leads workspace filter contract (CRM-18)
// ---------------------------------------------------------------------------

/**
 * Where a lead sits. Mirrors `LeadStage` in `lib/types/crm.ts`, which mirrors
 * `getLeadStage`'s return — the vocabulary has one home and this is its
 * boundary form.
 */
export const leadStageSchema = z.enum([
  "to_call",
  "trying",
  "in_conversation",
  "info_sent",
  "intake_sent",
  "client",
  "not_now",
  "not_interested",
  "do_not_call",
  "bad_lead",
]);

export const nextActionBucketSchema = z.enum([
  "overdue",
  "today",
  "week",
  "later",
  "none",
]);

export const lastTouchBucketSchema = z.enum([
  "never",
  "under7",
  "7to30",
  "over30",
]);

export const leadSortSchema = z.enum([
  "score",
  "lastTouch",
  "nextAction",
  "name",
]);

export const leadViewSchema = z.enum(["list", "board"]);

export const leadPresetSchema = z.enum([
  "gone_quiet",
  "no_next_action",
  "wants_info_unsent",
  "resurfacing",
]);

/**
 * The parsed shape of `/admin/leads`' query string.
 *
 * **This is a public contract, not an implementation detail** (D-CRM-34): the
 * presets are plain links, the scoreboard links into it, and Taylor will
 * bookmark it. Renaming a key here silently breaks a saved link, and the
 * failure is invisible — the page still loads, it just answers a different
 * question. Treat these names as fixed.
 *
 * Every field is optional or defaulted and `parseLeadFilters` drops anything
 * it does not recognise, so a stale bookmark degrades to a wider result set
 * and never to an error page.
 */
export const leadFilters = z.object({
  q: z.string().trim().max(200).default(""),
  view: leadViewSchema.default("list"),
  preset: leadPresetSchema.optional(),
  stages: z.array(leadStageSchema).default([]),
  thread: leadThreadSchema.optional(),
  niche: z.string().trim().max(100).default(""),
  city: z.string().trim().max(100).default(""),
  nextAction: nextActionBucketSchema.optional(),
  lastTouch: lastTouchBucketSchema.optional(),
  websiteBucket: leadWebsiteBucketSchema.optional(),
  hasEmail: z.boolean().default(false),
  hasEngagement: z.boolean().default(false),
  walkIn: z.boolean().default(false),
  sort: leadSortSchema.default("score"),
  shown: z.number().int().positive().max(5000).optional(),
});

export type LeadFilters = z.infer<typeof leadFilters>;

/** Next.js hands every search param as `string | string[] | undefined`. One
 * home for taking the first value, rather than the third hand-rolled copy of
 * `Array.isArray(v) ? v[0] : v` (this replaced copies in the queue and leads
 * pages). */
function firstValue(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed === "" ? undefined : trimmed;
}

/** A value that survives its own schema, or undefined. Unknown tokens are
 * dropped rather than thrown on — see `leadFilters`. */
function known<T extends string>(
  schema: z.ZodType<T>,
  value: string | string[] | undefined,
): T | undefined {
  const raw = firstValue(value);
  if (raw === undefined) return undefined;
  const result = schema.safeParse(raw);
  return result.success ? result.data : undefined;
}

/**
 * The one place a URL becomes a typed filter.
 *
 * Multi-select facets are comma-separated (`?stages=trying,info_sent`) rather
 * than repeated keys: the surface builds these hrefs constantly, and one
 * string is far cheaper to toggle than an array of repeated params.
 */
export function parseLeadFilters(
  params: Record<string, string | string[] | undefined>,
): LeadFilters {
  const stagesRaw = firstValue(params.stages) ?? "";
  const stages = stagesRaw
    .split(",")
    .map((token) => token.trim())
    .filter((token) => leadStageSchema.safeParse(token).success)
    .map((token) => token as z.infer<typeof leadStageSchema>);

  const shown = Number(firstValue(params.shown) ?? "");

  return leadFilters.parse({
    q: firstValue(params.q) ?? "",
    view: known(leadViewSchema, params.view) ?? "list",
    preset: known(leadPresetSchema, params.preset),
    stages: [...new Set(stages)],
    thread: known(leadThreadSchema, params.thread),
    niche: firstValue(params.niche) ?? "",
    city: firstValue(params.city) ?? "",
    nextAction: known(nextActionBucketSchema, params.nextAction),
    lastTouch: known(lastTouchBucketSchema, params.lastTouch),
    websiteBucket: known(leadWebsiteBucketSchema, params.websiteBucket),
    hasEmail: firstValue(params.hasEmail) === "1",
    hasEngagement: firstValue(params.hasEngagement) === "1",
    walkIn: firstValue(params.walkIn) === "1",
    sort: known(leadSortSchema, params.sort) ?? "score",
    shown: Number.isFinite(shown) && shown > 0 ? shown : undefined,
  });
}

/**
 * The inverse of `parseLeadFilters` — a filter state back into a URL.
 *
 * It lives here, beside the parser, rather than in a UI module for one
 * reason: these two functions are the same contract read in opposite
 * directions, and the day one learns a key the other does not is the day a
 * preset link quietly stops selecting what it names. They move together or
 * they do not move.
 *
 * Defaults are omitted rather than written out, so the plain `/admin/leads`
 * URL stays clean and a filter's presence in the query string always means
 * someone chose it.
 */
export function leadsHref(
  base: string,
  filters: LeadFilters,
  next: Partial<LeadFilters> = {},
): string {
  const merged = { ...filters, ...next };
  const params = new URLSearchParams();

  if (merged.q) params.set("q", merged.q);
  if (merged.view !== "list") params.set("view", merged.view);
  if (merged.preset) params.set("preset", merged.preset);
  if (merged.stages.length) params.set("stages", merged.stages.join(","));
  if (merged.thread) params.set("thread", merged.thread);
  if (merged.niche) params.set("niche", merged.niche);
  if (merged.city) params.set("city", merged.city);
  if (merged.nextAction) params.set("nextAction", merged.nextAction);
  if (merged.lastTouch) params.set("lastTouch", merged.lastTouch);
  if (merged.websiteBucket) params.set("websiteBucket", merged.websiteBucket);
  if (merged.hasEmail) params.set("hasEmail", "1");
  if (merged.hasEngagement) params.set("hasEngagement", "1");
  if (merged.walkIn) params.set("walkIn", "1");
  if (merged.sort !== "score") params.set("sort", merged.sort);
  // `shown` is dropped whenever anything else changes — a page-2 cap carried
  // into a new filter shows a number nobody asked for. Only an explicit
  // "show more" sets it, and it does that by passing it in `next`.
  if (next.shown !== undefined) params.set("shown", String(next.shown));

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/** True when anything at all is narrowing the list. Drives whether a "Clear
 * filters" control appears — an always-visible clear on an unfiltered list is
 * noise. `sort`, `view`, and `shown` are deliberately not filters: they change
 * how the same set is presented, not which set it is. */
export function hasLeadFilters(filters: LeadFilters): boolean {
  return Boolean(
    filters.q ||
    filters.preset ||
    filters.stages.length ||
    filters.thread ||
    filters.niche ||
    filters.city ||
    filters.nextAction ||
    filters.lastTouch ||
    filters.websiteBucket ||
    filters.hasEmail ||
    filters.hasEngagement ||
    filters.walkIn,
  );
}

/** The unfiltered surface, keeping only how the reader likes it sorted.
 * Lives here rather than in the rail component because the page renders it
 * too, on the empty state — and a pure function exported from a `"use client"`
 * module cannot be called during a server render. */
export function clearedLeadsHref(base: string, filters: LeadFilters): string {
  return leadsHref(base, filters, {
    q: "",
    preset: undefined,
    stages: [],
    thread: undefined,
    niche: "",
    city: "",
    nextAction: undefined,
    lastTouch: undefined,
    websiteBucket: undefined,
    hasEmail: false,
    hasEngagement: false,
    walkIn: false,
  });
}

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Date-range filters for the transcripts review surface. */
export const transcriptFilters = z.object({
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  shown: z.number().int().positive().max(5000).optional(),
});

export type TranscriptFilters = z.infer<typeof transcriptFilters>;

export function parseTranscriptFilters(
  params: Record<string, string | string[] | undefined>,
): TranscriptFilters {
  const shown = Number(firstValue(params.shown) ?? "");
  const from = firstValue(params.from);
  const to = firstValue(params.to);

  return transcriptFilters.parse({
    from: from && isoDateSchema.safeParse(from).success ? from : undefined,
    to: to && isoDateSchema.safeParse(to).success ? to : undefined,
    shown: Number.isFinite(shown) && shown > 0 ? shown : undefined,
  });
}

export function transcriptsHref(
  base: string,
  filters: TranscriptFilters,
  next: Partial<TranscriptFilters> = {},
): string {
  const merged = { ...filters, ...next };
  const params = new URLSearchParams();

  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (next.shown !== undefined) params.set("shown", String(next.shown));

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function transcriptsExportHref(
  exportBase: string,
  filters: TranscriptFilters,
  format: "csv" | "json",
): string {
  const params = new URLSearchParams();
  params.set("format", format);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  return `${exportBase}?${params.toString()}`;
}
