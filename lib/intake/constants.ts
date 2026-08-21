/**
 * Timings the reminder sweep and the status derivation both read.
 *
 * Second consumer, so they are promoted out of the service that owned them
 * first (the codebase's own promotion rule). Changing a number here changes it
 * for both, which is the point — "abandoned" on a dashboard and "abandoned"
 * for the purposes of nudging someone must never mean two different things.
 */

/** No activity for this long and a started form counts as abandoned. */
export const ABANDON_AFTER_HOURS = 48;

/** Sent to a client who has not opened their link. */
export const REMINDER_1_AFTER_HOURS = 48;

/** Sent to a client who started and then stopped. */
export const REMINDER_2_AFTER_IDLE_HOURS = 48;

/** The last one. There is no fourth, by law (build spec §7). */
export const REMINDER_3_AFTER_DAYS = 7;
