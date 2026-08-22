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
