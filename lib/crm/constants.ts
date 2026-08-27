import type {
  CallDisposition,
  InterestTag,
  LeadClosedState,
} from "@/lib/types/crm";

/**
 * The CRM's tunable numbers and display vocabulary, in one home.
 *
 * These are Taylor's sales judgment, not physics. They live in a config module
 * rather than a table on purpose: a table implies an editing UI nobody needs,
 * and would become a second home for something git already versions and
 * reviews.
 */

/**
 * Follow-up cadence (D-CRM-5, `[PROVISIONAL]` — Taylor tunes after real call
 * data).
 *
 * The shape of the rule matters more than the numbers: a no-answer schedules
 * itself, and a finite number of attempts ends in a warm resurface rather than
 * a lead rotting silently in the list. Persistence is a system; pestering is
 * its absence.
 */
export const CADENCE = {
  /** Business days added after a no-answer or voicemail. */
  retryAfterBusinessDays: 2,
  /** Attempts without a single conversation before the lead rests. */
  maxAttemptsBeforeRest: 4,
  /** Days until a rested lead returns to the queue. */
  restResurfaceDays: 60,
  /** Days until a "not now" with no stated date comes back. */
  defaultNotNowDays: 90,
  /**
   * Business days before chasing a conversation that set no date of its own.
   *
   * "Send me the info" is the best thing a first call produces and the easiest
   * to lose: without a date it becomes silence, which is what kills most deals.
   * Taylor can always override on the call.
   */
  conversationFollowUpBusinessDays: 3,
} as const;

/**
 * Below this many observations, a rate is not reported — the count is shown
 * instead (D-CRM-12). A percentage computed from four dials is a story, not a
 * measurement, and the scoreboard exists to stop Taylor planning around one.
 */
export const MIN_N_FOR_RATE = 20;

export const DISPOSITION_LABELS: Record<CallDisposition, string> = {
  no_answer: "No answer",
  voicemail: "Voicemail",
  hung_up: "Hung up",
  busy_callback: "Busy — callback",
  conversation: "Conversation",
  wrong_number: "Wrong number",
  not_interested: "Not interested",
  do_not_call: "Do not call",
};

/**
 * The order the disposition row renders in, and the order the numeric keyboard
 * accelerators map to. One home, so the label under a key never drifts from
 * the action it fires.
 */
export const DISPOSITION_ORDER: CallDisposition[] = [
  "no_answer",
  "voicemail",
  "hung_up",
  "busy_callback",
  "conversation",
  "wrong_number",
  "not_interested",
  "do_not_call",
];

export const INTEREST_TAG_LABELS: Record<InterestTag, string> = {
  wants_info: "Wants info",
  decision_maker: "Talk to the boss",
  price_talk: "Price talk",
  not_now: "Not now",
  ready_for_intake: "Ready for intake",
};

export const CLOSED_STATE_LABELS: Record<LeadClosedState, string> = {
  not_now: "Not now",
  not_interested: "Not interested",
  do_not_call: "Do not call",
  bad_lead: "Bad lead",
};

/**
 * Closed states that keep a lead out of every queue permanently.
 *
 * `not_now` is deliberately absent: it carries a resurface date and comes
 * back on its own. `do_not_call` is the internal DNC list and is the one
 * exclusion that must never be overridden by a filter, a sort, or a "show
 * everyone anyway" escape.
 */
export const TERMINAL_CLOSED_STATES: LeadClosedState[] = [
  "not_interested",
  "do_not_call",
  "bad_lead",
];

/** Busy-callback chips — shared by call mode and the lead record scheduler. */
export const CALLBACK_CHIPS = [
  { token: "this_afternoon", label: "This afternoon" },
  { token: "tomorrow_am", label: "Tomorrow AM" },
  { token: "tomorrow_pm", label: "Tomorrow PM" },
  { token: "next_week", label: "Next week" },
] as const;

/**
 * How long a worked lead can go untouched before it counts as gone quiet
 * (D-CRM-33).
 *
 * `[PROVISIONAL — Taylor tunes after real call data]`, same standing as
 * `CADENCE`: this is a judgment about how long a warm conversation stays warm,
 * not a measured number. It lives here rather than inside a query so the
 * "Gone quiet" preset and anything that later counts the same thing read one
 * value.
 *
 * A touch is the most recent dial *or* intro email — an intro sent three days
 * ago is not silence, even if the last dial was a month back.
 */
export const GONE_QUIET_DAYS = 14;

/** How many leads the workspace list renders at once. Surfaced, never silent
 * — the same law as the queue's `FRESH_PAGE`: a cap always has a way past it
 * (D-CRM-19's reasoning). */
export const LEAD_PAGE = 50;

/** How many transcripts the review list renders at once. */
export const TRANSCRIPT_PAGE = 50;

/**
 * The saved views, as a registry rather than four hand-built links
 * (D-CRM-34).
 *
 * A preset is a URL and nothing more — there is no stored object, no
 * per-preset table, and no way for one to drift from the query it names. The
 * predicates themselves live in `server/services/lead-workspace.ts`; this is
 * only what they are called and in what order they appear.
 */
export const LEAD_PRESETS = [
  {
    token: "gone_quiet",
    label: "Gone quiet",
    blurb: "Worked, no date or overdue, untouched for a while",
  },
  {
    token: "no_next_action",
    label: "No next action",
    blurb: "Dialled at least once and carrying no date — the scoreboard's defect list",
  },
  {
    token: "wants_info_unsent",
    label: "Wants info, never sent",
    blurb: "Asked for the info on a call and never got it",
  },
  {
    token: "resurfacing",
    label: "Resurfacing soon",
    blurb: "Resting leads coming back within 30 days",
  },
] as const;

export type LeadPresetToken = (typeof LEAD_PRESETS)[number]["token"];
