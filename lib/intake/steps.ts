import type { IntakeStep, IntakeStepKey } from "@/lib/types/intake";

/**
 * The durable track's nine steps, in order, with the copy that frames each one.
 *
 * One home for this track's step identity. Nothing imports this array directly
 * except `lib/intake/tracks.ts`, which is the single resolver every consumer
 * asks for a registry — routing, the progress indicator, the resume list, the
 * skipped-items inventory, and the markdown generator all come through it. A
 * tenth step added anywhere else would be a tenth step the progress bar lies
 * about.
 *
 * Nine is a promise made on the welcome screen. It does not grow, and no step
 * sub-paginates — see D-INT-5.
 *
 * Titles and intros are Vesper's, from the build spec §4 and UX spec §7.
 * `emphasis: "ink"` exists for exactly one step: How you work is the step that
 * stops us putting something untrue on a client's site, and its intro is the
 * only one that renders at full ink.
 */
export const INTAKE_STEPS: readonly IntakeStep<IntakeStepKey>[] = [
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
