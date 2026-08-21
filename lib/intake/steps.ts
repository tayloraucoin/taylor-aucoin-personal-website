import type { IntakeStepKey } from "@/lib/types/intake";

/**
 * The nine steps, in order, with the copy that frames each one.
 *
 * One home for step identity: routing, the progress indicator, the resume
 * list, the skipped-items inventory (INT-7), and the markdown generator all
 * read from here. A tenth step added anywhere else would be a tenth step the
 * progress bar lies about.
 *
 * Nine is a promise made on the welcome screen. It does not grow, and no step
 * sub-paginates — see D-INT-5.
 *
 * Titles and intros are Vesper's, from the build spec §4 and UX spec §7.
 * `emphasis: "ink"` exists for exactly one step: How you work is the step that
 * stops us putting something untrue on a client's site, and its intro is the
 * only one that renders at full ink.
 */
export type IntakeStep = {
  key: IntakeStepKey;
  number: number;
  title: string;
  intro?: string;
  emphasis?: "ink";
};

export const INTAKE_STEPS: readonly IntakeStep[] = [
  { key: "business", number: 1, title: "About your business" },
  { key: "pricing", number: 2, title: "What you offer and what you charge" },
  {
    key: "operations",
    number: 3,
    title: "How you work",
    intro:
      "These are the questions that stop us putting something on your site that isn't true.",
    emphasis: "ink",
  },
  {
    key: "positioning",
    number: 4,
    title: "Your customers and competition",
  },
  {
    key: "voice",
    number: 5,
    title: "How you talk",
    intro:
      "Most small business websites read like they were written by a robot. This is how we avoid that.",
  },
  { key: "photos", number: 6, title: "Photos and logo" },
  {
    key: "reviews",
    number: 7,
    title: "Reviews and proof",
    intro:
      "We only put real reviews on your site. If you don't have any yet, that's completely fine — we'll leave that section off and add it later.",
  },
  { key: "team", number: 8, title: "Your team" },
  { key: "access", number: 9, title: "Accounts and access" },
] as const;

export const INTAKE_STEP_COUNT = INTAKE_STEPS.length;

export function findStep(slug: string): IntakeStep | undefined {
  return INTAKE_STEPS.find((step) => step.key === slug);
}

/** The step a resume link should land on: furthest reached, or the first. */
export function stepByNumber(number: number): IntakeStep {
  return INTAKE_STEPS[Math.min(Math.max(number, 1), INTAKE_STEP_COUNT) - 1]!;
}

export function nextStep(step: IntakeStep): IntakeStep | null {
  return step.number < INTAKE_STEP_COUNT ? stepByNumber(step.number + 1) : null;
}

export function previousStep(step: IntakeStep): IntakeStep | null {
  return step.number > 1 ? stepByNumber(step.number - 1) : null;
}
