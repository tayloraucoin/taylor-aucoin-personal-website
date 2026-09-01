import { labelFor, stepsFor, textFieldKeysFor } from "./tracks";

/**
 * The field inventory the business primer shows the model (PORT-10).
 *
 * **The key list is derived, never typed.** It comes from `textFieldKeysFor` —
 * the same seam the intake document's "Not answered" inventory uses (M-PORT-8)
 * — so a field added to a step schema is a field the primer can propose for,
 * and a field removed cannot linger here pointing at nothing. Only free-text
 * fields are eligible: a checkbox group has an enumerated option set that a
 * proposed sentence would miss, and the shape guard would drop it on save. The
 * hand-written parts are the exclusion sets and the criticality map below, and
 * `yarn eval:primer --inventory` asserts every one of their keys against the
 * live schemas.
 *
 * **Descriptions reuse `SHOWCASE_ANSWER_LABELS` by default.** The client-facing
 * question text lives in exactly one place in this repo — the component that
 * asks it (D-ADM-6) — and copying forty-three strings out of those components
 * would create the second home that rule exists to prevent. The labels are
 * written in Taylor's voice about a client ("Work they want more of"), which is
 * a correct description of the field for a model that is placing facts rather
 * than reading a form. `DESCRIPTIONS` overrides only the keys whose label is
 * too terse to place a fact unambiguously.
 *
 * **Criticality is decided here, never by the model.** Anything touching money,
 * dates, headcount, credentials, legal status, or claims about results is
 * critical by definition and is quote-or-nothing. The non-critical allowlist is
 * the one licensed inference (Taylor, 2026-09-01) and it is deliberately three
 * fields long: each expresses a *preference about the site* rather than a
 * *claim about the business*, so a wrong one is a question at the call instead
 * of a false sentence on a live page.
 */

/**
 * Steps the primer never proposes into.
 *
 * Taste is reactions to example sites the client has not seen yet. No business
 * document contains an answer to it, and a model asked to try will reach.
 */
const EXCLUDED_STEPS = new Set(["taste"]);

/**
 * Fields the primer never proposes into, and why each one.
 *
 * Not a taste call — every entry here would either be dropped by the validator
 * or produce a value the form cannot render.
 */
const EXCLUDED_FIELDS = new Map<string, string>([
  ["fastWay", "The step 3 and 4 paste boxes. Input, not an answer."],
  ["businessPrimer", "This slice's own paste box. It is the source."],
  ["unions", "Deprecated and read-only; no input writes it (v2 amendment)."],
  ["leadRole", "A choice derived from the roles the client typed, not free text."],
  [
    "anythingElse",
    "A catch-all at the end of step 9. A proposal here is noise by construction.",
  ],
  // The conditional reveals. Each renders only when its own checkbox is
  // ticked, so a proposal would land in a box nobody can see.
  ["audiencesOther", "Conditional on the audiences checkbox group."],
  ["disciplinesOther", "Conditional on the disciplines checkbox group."],
  ["organizationOther", "Conditional on the organisation checkbox group."],
  ["pagesOther", "Conditional on the pages checkbox group."],
  ["videoHostsOther", "Conditional on the video-hosts checkbox group."],
]);

/**
 * The licensed inference, enumerated. `[RATIFIED — Taylor, 2026-09-01]`
 *
 * A field on this list may carry a value the document supports without stating
 * — and it is labelled in the UI as a guess when it does. Every other field in
 * the inventory is quote-or-nothing, enforced by the validator rather than by
 * the prompt's good intentions.
 *
 * All three are preferences about how the site should behave. None of them can
 * put a false claim about the business on a page.
 */
const NON_CRITICAL = new Set([
  "whatShouldTheyDo",
  "howToReach",
  "showAvailability",
]);

/** Only where the answer label is too terse for a model placing a fact. */
const DESCRIPTIONS: Record<string, string> = {
  whatYouDo:
    "One line describing what they do — the line that sits under their name on the site.",
  howLong: "How long they have been doing this work, as a date or a duration.",
  basedIn: "Where they are based, and how far the work travels.",
  credentials:
    "Memberships, guilds, professional colleges, degrees, certifications, training.",
  affiliations:
    "Studios, agencies, or companies they work under or are formally tied to; official partnerships.",
  representation: "An agent, manager, or rep, and whether enquiries go through them.",
  whoMattersMost: "Which of their audiences matters most.",
  whatShouldTheyDo:
    "What a visitor should do next — get in touch, book a call, watch something.",
  wantMoreOf: "The kind of work they want more of.",
  stopAttracting: "The kind of work they want to stop attracting.",
  whyPickYou: "Why clients choose them rather than someone else.",
  whatYouAreNot: "What they are explicitly not — work or positioning they reject.",
  afterOneVisit: "The impression a visitor should be left with.",
  awards: "Awards, grants, selections, or formal recognition.",
  press: "Press coverage, interviews, features.",
  kindWords: "Testimonials or quotes from clients, in the client's words.",
  notableNames: "Clients, employers, or collaborators worth naming.",
  reel: "The single piece of work a stranger should see first.",
  topFive: "The handful of pieces they would show if they could only show a few.",
  sayMore: "Anything else about how the work should read on the site.",
  currentBio: "An existing bio or About text written in their own voice.",
  personVoice: "Whether the site speaks as I or as they.",
  writtenNotes: "Notes on how they want the writing to sound.",
  neverSay: "Words, claims, or phrasings they do not want used.",
  logoStatus: "Whether they have a logo and what state it is in.",
  coloursYouLike: "Colours they want used.",
  dislikes: "Colours, styles, or treatments they want avoided.",
  howSeparate: "How separate the different parts of their work should feel.",
  howToReach: "How people should get in touch.",
  showAvailability: "Whether the site should say whether they are taking work.",
  oldSiteSurvives: "What from an existing site should carry over.",
  linksOutThere: "Existing links to their site that must keep working.",
  ownsDomain: "Whether they already own a domain.",
  domainName: "The domain name itself.",
  registrar: "Who the domain is registered with.",
  domainAccess: "Whether they can get into the domain account.",
  emailAtDomain: "Email addresses on their own domain.",
  currentPlatform: "What their current site is built on.",
  handsOn: "How much they want to edit the site themselves afterwards.",
  bestContactMethod: "The best way to reach them during the build.",
  currentWebsite: "Their current website address.",
  displayName: "Their name or the business name as it should appear on the site.",
};

/** One field the model may propose a value for. */
export type PrimerField = {
  key: string;
  /** Which showcase step it lives on, so proposals can be counted per step. */
  stepKey: string;
  /** What the model is told this field holds. */
  description: string;
  /**
   * False only for the three ratified preference fields. True means the value
   * must be supported by a quote or it does not exist.
   */
  critical: boolean;
};

/**
 * The inventory, built once at module load.
 *
 * Order is step order, then schema order, which is the order the client meets
 * the questions in. Stable across runs, so it caches cleanly and so an eval
 * diff is readable.
 */
export const PRIMER_FIELDS: readonly PrimerField[] = stepsFor("showcase")
  .filter((step) => !EXCLUDED_STEPS.has(step.key))
  .flatMap((step) =>
    textFieldKeysFor("showcase", step.key)
      .filter((key) => !EXCLUDED_FIELDS.has(key))
      .map((key) => ({
        key,
        stepKey: step.key,
        description: DESCRIPTIONS[key] ?? labelFor("showcase", key),
        critical: !NON_CRITICAL.has(key),
      })),
  );

const BY_KEY = new Map(PRIMER_FIELDS.map((field) => [field.key, field]));

/** Undefined for any key the primer does not own. Never a guess. */
export function primerField(key: string): PrimerField | undefined {
  return BY_KEY.get(key);
}

/**
 * Every hand-written key that no longer exists in a showcase schema.
 *
 * The drift guard. An exclusion or a description pointing at a removed field is
 * silent rot: the inventory keeps working, and the reason someone wrote the
 * line is gone. `yarn eval:primer --inventory` fails on a non-empty result.
 */
export function staleInventoryKeys(): string[] {
  const live = new Set(
    stepsFor("showcase").flatMap((step) =>
      textFieldKeysFor("showcase", step.key),
    ),
  );

  return [
    ...EXCLUDED_FIELDS.keys(),
    ...NON_CRITICAL,
    ...Object.keys(DESCRIPTIONS),
  ]
    .filter((key) => key !== "businessPrimer" && !live.has(key))
    .filter((key, index, all) => all.indexOf(key) === index)
    .sort();
}
