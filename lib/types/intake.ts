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
 */
export type IntakeAnswers = Partial<Record<IntakeStepKey, IntakeStepAnswers>>;

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
