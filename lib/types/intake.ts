/**
 * Domain types for the client intake system.
 *
 * See `docs/intake/TECH-SCOPE.md` §4 for the data model and
 * `docs/intake/specs/` for the tickets that fill each piece in.
 */

/**
 * The nine questionnaire steps, in order.
 *
 * This is the answer document's key space. INT-4 builds the step registry
 * (`lib/intake/steps.ts`) that carries each step's title and copy; the keys
 * themselves live here because the stored answers are typed by them and the
 * database outlives any one surface.
 */
export const INTAKE_STEP_KEYS = [
  "business",
  "pricing",
  "operations",
  "positioning",
  "voice",
  "photos",
  "reviews",
  "team",
  "access",
] as const;

export type IntakeStepKey = (typeof INTAKE_STEP_KEYS)[number];

/**
 * The website types this machine collects for.
 *
 * `durable` is the original track: Metro Vancouver service businesses, built on
 * Durable, sold at `/websites`. `showcase` is the bespoke portfolio-site track
 * for creatives.
 *
 * The internal name is deliberately not "portfolio": in this repo that word
 * already means tayloraucoin.com itself (see `legalRoutes` and
 * `content/legal.ts`). Public URLs say portfolio; identifiers say showcase.
 * See TECHNICAL-DECISIONS M-PORT-1.
 */
export const INTAKE_TRACK_KEYS = ["durable", "showcase"] as const;

export type IntakeTrackKey = (typeof INTAKE_TRACK_KEYS)[number];

/**
 * The showcase track's nine steps, in order.
 *
 * Its own key space, sitting in the same answers document as the durable
 * track's. `access` appears in both by coincidence of subject, not by sharing:
 * each track resolves its own schema and labels for that key through
 * `lib/intake/tracks.ts`, so the two never meet.
 */
export const SHOWCASE_STEP_KEYS = [
  "about",
  "audience",
  "experience",
  "work",
  "taste",
  "words",
  "media",
  "site",
  "access",
] as const;

export type ShowcaseStepKey = (typeof SHOWCASE_STEP_KEYS)[number];

/** Any step key from any track — what a registry entry or a route slug holds. */
export type AnyIntakeStepKey = IntakeStepKey | ShowcaseStepKey;

/**
 * One step in a track's registry.
 *
 * Generic over its key so each track's registry keeps its own narrow key type
 * while `lib/intake/tracks.ts` can hand back either as a common shape.
 *
 * `emphasis: "ink"` renders a step's intro at full ink instead of dim. Exactly
 * one step in the durable track has it, because that step is the one that stops
 * a false claim reaching a live site. It is not decoration and it is not
 * granted to a step because the step is long.
 */
export type IntakeStep<K extends AnyIntakeStepKey = AnyIntakeStepKey> = {
  key: K;
  number: number;
  title: string;
  intro?: string;
  emphasis?: "ink";
};

/**
 * One step's answers as stored.
 *
 * Deliberately open at this layer: the per-step field shapes are specified in
 * `docs/intake/intake-form-build-spec.md` §4 and land with the form tickets
 * (INT-5 for steps 1-4, INT-6 for 5-9), which narrow them with Zod at the
 * action boundary and export a per-step interface here. Declaring nine empty
 * interfaces now would be a type that lies about what INT-1 knows.
 */
export type IntakeStepAnswers = Record<string, unknown>;

/**
 * The `engagements.answers` JSONB document.
 *
 * Partial by construction — nothing in this form is required (D-INT-4), so
 * every step, and every field within it, may be absent. The markdown generator
 * (INT-7) reports absence explicitly rather than rendering a blank heading.
 *
 * Keyed by every track's steps rather than one track's: the column outlives any
 * one questionnaire, and an engagement only ever carries the keys of the track
 * it was created on.
 */
export type IntakeAnswers = Partial<
  Record<AnyIntakeStepKey, IntakeStepAnswers>
>;

/**
 * Where an engagement stands, derived from its timestamp columns rather than
 * stored (M-INT-7). `getEngagementStatus` in `server/services/engagement.ts`
 * is the one place this is computed.
 */
export type EngagementStatus =
  | "created"
  | "sent"
  | "paid"
  | "waived"
  | "started"
  | "in_progress"
  | "abandoned"
  | "complete";
