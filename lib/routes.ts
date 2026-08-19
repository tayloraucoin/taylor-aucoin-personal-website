import type { IntakeStepKey } from "@/lib/types/intake";

/**
 * Every intake path is built here. No route string is written inline anywhere
 * else — a path that exists in two places drifts in one of them.
 *
 * Paths only. The absolute-URL form lives in `server/services/engagement.ts`,
 * because composing it needs `NEXT_PUBLIC_SITE_URL` and this module has to stay
 * safe to import from a client component.
 */
const INTAKE_PREFIX = "/intake";

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
  /** The state-routed entry: pay, welcome, resume, or done. */
  entry: (token: string) => `/intake/${token}`,

  /** One questionnaire step. Step identity comes from `IntakeStepKey`. */
  step: (token: string, step: IntakeStepKey) => `/intake/${token}/${step}`,

  done: (token: string) => `/intake/${token}/done`,
} as const;
