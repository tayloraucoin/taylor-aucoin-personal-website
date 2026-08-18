/** Shared between the middleware (server) and the analytics gate (client). */

/**
 * Coarse regime label written by `middleware.ts` and read by `Analytics.tsx`.
 *
 * This cookie holds one of three enum values and nothing else — no IP, no
 * identifier, no country code. It exists solely to decide whether consent must
 * be asked for, which makes it strictly necessary under ePrivacy Art. 5(3) and
 * therefore exempt from the very consent requirement it is helping enforce.
 */
export const REGIME_COOKIE = "ta_consent_regime";

/** Where the visitor's own choice is remembered. Written only after a click. */
export const CONSENT_STORAGE_KEY = "ta:analytics-consent";

export type ConsentChoice = "granted" | "denied";
