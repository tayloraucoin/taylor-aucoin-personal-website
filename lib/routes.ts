import type { IntakeStepKey } from "@/lib/types/intake";

/**
 * Every intake path is built here. No route string is written inline anywhere
 * else — a path that exists in two places drifts in one of them.
 *
 * Paths only. The absolute-URL form lives in `server/services/engagement.ts`,
 * because composing it needs `NEXT_PUBLIC_SITE_URL` and this module has to stay
 * safe to import from a client component.
 */
/**
 * The intake tree lives under the service page it belongs to, so a client who
 * trims the URL back to its parent lands on the page that explains what they
 * are filling in rather than a 404.
 */
const INTAKE_PREFIX = "/websites/intake";

/**
 * True on any client-intake surface.
 *
 * The site's chrome and its analytics are mounted in the root layout, so each
 * has to be told to stand down here. The intake pages carry a client's pricing,
 * revenue hints, and access details: nothing third-party may observe them
 * (M-INT-10), and a nav bar offering "Work with me" mid-form is an exit a
 * paying client does not need.
 */
export function isIntakePath(pathname: string): boolean {
  return pathname === INTAKE_PREFIX || pathname.startsWith(`${INTAKE_PREFIX}/`);
}

export const intakeRoutes = {
  /** The one public link. Stable, tokenless, and safe to write on a card. */
  start: INTAKE_PREFIX,

  /**
   * Cookie scope for the resume token. Narrower than `/` on purpose: the token
   * is only ever read by the start page, so no other route needs to carry it.
   */
  cookiePath: INTAKE_PREFIX,

  /** The state-routed entry: pay, welcome, resume, or done. */
  entry: (token: string) => `${INTAKE_PREFIX}/${token}`,

  /** One questionnaire step. Step identity comes from `IntakeStepKey`. */
  step: (token: string, step: IntakeStepKey) =>
    `${INTAKE_PREFIX}/${token}/${step}`,

  done: (token: string) => `${INTAKE_PREFIX}/${token}/done`,
} as const;
