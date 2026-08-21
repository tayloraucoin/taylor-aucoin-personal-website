/**
 * The legal documents' version identity.
 *
 * One constant, stamped in three places that must agree: the terms page's
 * "effective" line, the Checkout session's metadata, and the engagement row
 * at fulfillment. Bump it whenever the terms' substance changes — the value
 * is the date the new text took effect, so a stamped row reads as "agreed to
 * the terms as they stood on this date" without a version registry.
 *
 * Client-safe on purpose: the pay screen renders it.
 */
export const TERMS_VERSION = "2026-08-21";

/** Human form of the same date, for the documents' effective lines. */
export const TERMS_EFFECTIVE = "August 21, 2026";
