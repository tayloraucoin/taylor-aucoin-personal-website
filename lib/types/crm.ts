/**
 * Shapes for the CRM's JSONB columns and the vocabularies the pipeline is
 * built from.
 *
 * The three axes never collapse into one field (D-CRM-1): a **stage** is where
 * a lead sits and is derived, a **disposition** is what happened on one dial
 * and is a row in `call_attempts`, and the **next action** is a timestamp that
 * drives the queue. A single status column would have to lie about at least
 * two of them.
 */

/**
 * What happened on one dial.
 *
 * Mirrored exactly by the `call_disposition` Postgres enum in
 * `db/schema/call-attempts.ts` — that enum is the source of truth for the
 * database, this type is the source of truth for TypeScript, and the two are
 * kept in step by hand because Drizzle cannot infer one from the other without
 * importing the schema into client code.
 */
export type CallDisposition =
  | "no_answer"
  | "voicemail"
  | "busy_callback"
  | "conversation"
  | "wrong_number"
  | "not_interested"
  | "do_not_call";

/**
 * What a conversation revealed. Only meaningful on a `conversation`
 * disposition, and deliberately not a stage of its own: "talk to the boss" is
 * a named friction on an open conversation, not a place in the funnel
 * (D-CRM-3).
 */
export type InterestTag =
  | "wants_info"
  | "decision_maker"
  | "price_talk"
  | "not_now"
  | "ready_for_intake";

/** JSON shape: `call_attempts.interest_tags`. */
export type InterestTags = InterestTag[];

/**
 * How they said they'd rather hear back, captured on a conversation
 * (D-CRM-25). Mirrors the `contact_channel` Postgres enum in
 * `db/schema/leads.ts`.
 */
export type ContactChannel = "text" | "email";

/** JSON shape: `leads.niches` — every niche query that surfaced this place. */
export type LeadNiches = string[];

/**
 * Why a lead is closed. Stored (unlike stage) because no fact in the row
 * implies it — it is a judgment Taylor makes on a call.
 *
 * `not_now` is not terminal: it carries a resurface date in `nextActionAt` and
 * returns to the queue on its own. The other three are terminal, and
 * `do_not_call` is additionally excluded from every queue forever.
 */
export type LeadClosedState =
  "not_now" | "not_interested" | "do_not_call" | "bad_lead";

/** Which harvest thread a lead came from. */
export type LeadThread = "no_website" | "audit";

/** How much of a front door the business already has, per leadgen's classifier. */
export type LeadWebsiteBucket = "none" | "social_only" | "real";

/**
 * Where a lead sits in the funnel (D-CRM-2).
 *
 * **Derived, never stored.** The back half comes from engagement timestamps,
 * which are the money's own record; an enum column could disagree with them,
 * and then there would be two answers to "has this person paid".
 * `getLeadStage` in `server/services/leads.ts` is the one place this is
 * computed.
 */
export type LeadStage =
  | "to_call"
  | "trying"
  | "in_conversation"
  | "info_sent"
  | "intake_sent"
  | "client"
  | "not_now"
  | "not_interested"
  | "do_not_call"
  | "bad_lead";
