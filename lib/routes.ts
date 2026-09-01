import type { AnyIntakeStepKey, IntakeTrackKey } from "@/lib/types/intake";

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
  return [INTAKE_PREFIX, SHOWCASE_INTAKE_PREFIX].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
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

  /**
   * One questionnaire step.
   *
   * The key type spans both tracks because a step slug is a slug; which keys
   * are real for a given engagement is decided by `lib/intake/tracks.ts`, which
   * resolves them per track and returns undefined for a foreign one. That is
   * the gate, and it is a better one than the type — a wrong slug 404s rather
   * than rendering an empty step. The showcase track gets its own builder with
   * PORT-2.
   */
  step: (token: string, step: AnyIntakeStepKey) =>
    `${INTAKE_PREFIX}/${token}/${step}`,

  done: (token: string) => `${INTAKE_PREFIX}/${token}/done`,
} as const;

/**
 * The website-service marketing pages.
 *
 * `/websites` is a chooser between two builds. The slugs name the DELIVERABLE
 * rather than the buyer: some professions could plausibly buy either track, so
 * "who it's for" cannot carry the distinction on its own, while "a platform you
 * run yourself" versus "code you own" always can. Naming by buyer was the
 * earlier plan and Taylor overruled it.
 *
 * Note `showcase` is the internal key for the coded track everywhere in the
 * data model (`M-PORT-1`), because "portfolio" already means tayloraucoin.com
 * itself in this codebase. Public slug and internal key differ on purpose.
 *
 * The coded track's intake nests under `coded`, immediately below.
 */
export const websiteRoutes = {
  chooser: "/websites",
  platform: "/websites/platform",
  coded: "/websites/coded",
} as const;

/**
 * The showcase track's intake, nested under the sales page that explains it.
 *
 * Composed from `websiteRoutes.coded` rather than restating the slug, which is
 * still `[PROPOSED — Taylor ratifies]` (marketing scope §3) and therefore has
 * to have exactly one place to rename. Nesting is the trim-back law: someone
 * who cuts this URL back lands on the page describing what they are filling
 * in, never a 404 (WEBSITES-PAGE-SPEC §7, M-PORT-7).
 *
 * The durable tree does not move and does not change (that scope's R-3).
 */
const SHOWCASE_INTAKE_PREFIX = `${websiteRoutes.coded}/intake`;

export const showcaseIntakeRoutes = {
  start: SHOWCASE_INTAKE_PREFIX,
  /** Its own cookie scope, so one track's token is never sent to the other. */
  cookiePath: SHOWCASE_INTAKE_PREFIX,
  entry: (token: string) => `${SHOWCASE_INTAKE_PREFIX}/${token}`,
  step: (token: string, step: AnyIntakeStepKey) =>
    `${SHOWCASE_INTAKE_PREFIX}/${token}/${step}`,
  done: (token: string) => `${SHOWCASE_INTAKE_PREFIX}/${token}/done`,
} as const;

/**
 * The route builder for one track.
 *
 * Shared components — the resume list, the step shell — render links for
 * whichever engagement they were handed. Without this each would need to know
 * which tree it is rendering in, which is exactly the branch that gets copied
 * wrong once and then everywhere.
 */
export function intakeRoutesFor(track: IntakeTrackKey) {
  return track === "showcase" ? showcaseIntakeRoutes : intakeRoutes;
}

/**
 * The legal pages for the websites service. Scoped under `/websites` on
 * purpose: these terms govern the website-build engagements, not the
 * portfolio site around them, and the URL should say so.
 */
export const legalRoutes = {
  terms: "/websites/terms",
  privacy: "/websites/privacy",
} as const;

/**
 * True on the legal pages. They get the intake surface's treatment from the
 * site's chrome and analytics: a client reads these mid-payment or from an
 * invoice, and a nav offering "Work with me" (or a tag watching them read a
 * contract) belongs on neither.
 */
export function isLegalPath(pathname: string): boolean {
  return pathname === legalRoutes.terms || pathname === legalRoutes.privacy;
}

/**
 * The admin CRM. Taylor-only, and the only authenticated surface on the site.
 *
 * Nav order here is the order the shell renders, so the one home for "what
 * sections exist" is also the one home for "what order they appear in".
 */
const ADMIN_PREFIX = "/admin";

export const adminRoutes = {
  home: ADMIN_PREFIX,
  login: `${ADMIN_PREFIX}/login`,
  queue: `${ADMIN_PREFIX}/queue`,
  leads: `${ADMIN_PREFIX}/leads`,
  lead: (id: string) => `${ADMIN_PREFIX}/leads/${id}`,
  engagements: `${ADMIN_PREFIX}/engagements`,
  engagement: (id: string) => `${ADMIN_PREFIX}/engagements/${id}`,
  sync: `${ADMIN_PREFIX}/sync`,
  scoreboard: `${ADMIN_PREFIX}/scoreboard`,
  transcripts: `${ADMIN_PREFIX}/transcripts`,

  /**
   * Named here before they are built, because the admin rail lists them as
   * dimmed labels (D-ADM-7) and a nav entry still needs a stable identity to
   * key on. `intakeQuestions` becomes a real route in ADM-2; `revenue` has no
   * ticket yet. Neither is linked until its surface exists — see
   * `app/admin/_components/admin-nav.ts`.
   */
  intakeQuestions: `${ADMIN_PREFIX}/intake/questions`,
  revenue: `${ADMIN_PREFIX}/finances/revenue`,
} as const;

/**
 * True on any admin surface.
 *
 * Read by the site chrome and the analytics component for the same reason
 * `isIntakePath` is: the admin carries a prospect's contact details and
 * Taylor's private call notes, so nothing third-party may observe it, and a
 * marketing nav bar has no business inside a working tool.
 */
export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}
