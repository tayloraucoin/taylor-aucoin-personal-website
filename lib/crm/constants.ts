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
