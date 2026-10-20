/**
 * The abuse controls every public form carries (D-SITE-224): a honeypot
 * field a person never sees, and how long the form was open before submit.
 * A filled honeypot or a submit under two seconds answers as sent and does
 * nothing, so a bot learns nothing from the answer. No CAPTCHA.
 *
 * Plain module, no `"use client"`: the fields import the names, the server
 * imports the check.
 */
export const HONEYPOT_NAME = "website";
export const ELAPSED_NAME = "_elapsed";
export const MIN_FILL_MS = 2000;

/**
 * True when the submit should be dropped as a bot's. A missing or garbled
 * elapsed time counts as too fast: the client always sets it.
 */
export function looksLikeBot(formData: FormData): boolean {
  const honeypot = formData.get(HONEYPOT_NAME);
  if (typeof honeypot === "string" && honeypot.trim() !== "") return true;

  const elapsed = Number(formData.get(ELAPSED_NAME));
  return !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS;
}
