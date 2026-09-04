import type { ShowcaseKind } from "./showcase-kinds";
import {
  groupsFor,
  kindAsks,
  labelFor,
  stepsFor,
  textFieldKeysFor,
} from "./tracks";

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
  ["dump", "The ingestion step's own paste box (PORT-18). It is the source."],
  ["links", "The ingestion step's links box (PORT-21). Input, not an answer."],
  ["fastWay", "The step 3 and 4 paste boxes. Input, not an answer."],
  ["businessPrimer", "This slice's own paste box. It is the source."],
  ["unions", "Deprecated and read-only; no input writes it (v2 amendment)."],
  [
    "leadRole",
    "A choice derived from the roles the client typed, not free text.",
  ],
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
  // Retired at PORT-19 and still in their schemas so stored answers survive.
  // A proposal into one would land in a field no screen renders.
  ["reel", "Retired at PORT-19; nothing renders it."],
  ["topFive", "Retired at PORT-19; the five are ticked from the rows now."],
  // `videoHosts` itself is a checkbox group and never in the text inventory,
  // so it is not listed here: the drift guard sweeps text fields, and a key
  // that was never one reads as stale (found 2026-09-03, after PORT-19).
  ["videoHostsOther", "Retired at PORT-19 with the question above it."],
  [
    "availabilityDetail",
    "Conditional on the availability question, and a claim about when they are free — theirs to write.",
  ],
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
  representation:
    "An agent, manager, or rep, and whether enquiries go through them.",
  whoMattersMost: "Which of their audiences matters most.",
  whatShouldTheyDo:
    "What a visitor should do next — get in touch, book a call, watch something.",
  wantMoreOf: "The kind of work they want more of.",
  stopAttracting: "The kind of work they want to stop attracting.",
  whyPickYou: "Why clients choose them rather than someone else.",
  whatYouAreNot:
    "What they are explicitly not — work or positioning they reject.",
  afterOneVisit: "The impression a visitor should be left with.",
  awards: "Awards, grants, selections, or formal recognition.",
  press: "Press coverage, interviews, features.",
  kindWords: "Testimonials or quotes from clients, in the client's words.",
  notableNames: "Clients, employers, or collaborators worth naming.",
  sayMore: "Anything else about how the work should read on the site.",
  homeBrainDump:
    "What they want on the home page — what someone should hit first, and what must not be there.",
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
  displayName:
    "Their name or the business name as it should appear on the site.",

  // PORT-14's keys. Every one of these is critical by the existing rule —
  // money, dates, legal status, or a claim about results — so none joins the
  // non-critical allowlist and all are quote-or-nothing.
  stage:
    "Where the venture honestly stands: an idea, raising, underway, or operating.",
  signOff: "Who reads and approves the site's words before they go live.",
  cantSay:
    "Claims, numbers, outcomes, or names they are not permitted to publish.",
  requiredWording:
    "Wording that must appear verbatim — a disclaimer, a registration number, a required line.",
  toolsDetail:
    "Which tools they already run, and whose account each one lives in.",
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

/* ────────────────────────────────────────────────────────────────────────────
   The ingestion inventory (PORT-18)
   ────────────────────────────────────────────────────────────────────────────

   The same derived list, narrowed twice more. Narrowed to the *kind* — a
   portfolio's run never lists a venture's `stage`, so the model cannot propose
   into a question the client never sees — and narrowed to the fields whose
   *format* a free-text value can honestly fill. The primer tolerated a sentence
   proposed into a radio-backed field because a client met the proposal and
   could wave it off; the ingestion run writes, so a sentence in a radio field
   would render as nothing selected and print in the document as an answer
   nobody could have chosen (Taylor's "the mechanics of format are important").

   Every hand-written key below is asserted against the live schemas by
   `staleInventoryKeys()`, the same drift guard the exclusions above have.
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Fields whose stored string is one of a radio group's option values.
 *
 * The schema types them as text because that is what a radio stores, so
 * `textFieldKeysFor` cannot tell them from a sentence. Taylor ratified their
 * exclusion 2026-09-03: their option lists live in the packs and the
 * components, not in the schemas, and typing them here would be the second
 * home this file exists to prevent.
 */
const CHOICE_BACKED = new Set([
  "siteKind",
  "justYou",
  "showTeam",
  "leadPerson",
  "stage",
  "personVoice",
  "logoStatus",
  "embedForm",
  "howToReach",
  "showAvailability",
  "ownsDomain",
  "domainAccess",
  "emailAtDomain",
  "handsOn",
  "bestContactMethod",
  "bookingPayment",
  "supabaseSensitivity",
  "blogWhoWrites",
]);

/**
 * Fields that render only after a specific answer above them.
 *
 * A value written behind a closed reveal is the PORT-14 failure: stored,
 * printed in the document, invisible on the screen the client is looking at.
 */
const REVEAL_GATED = new Set([
  "availabilityDetail",
  "registrar",
  "domainAccess",
  "embedFormLink",
  "embedFormNotes",
  "stageDetail",
]);

/**
 * Fields that render only for a client who bought the add-on that asks them.
 *
 * Same failure as a reveal, with a worse reading: the run would answer
 * questions about a booking system the client never purchased.
 */
const EXTRA_GATED = new Set([
  "extraPagesPlan",
  "logoFeeling",
  "logoExactWording",
  "logoDirections",
  "supabaseWhatPersists",
  "supabaseWhoLogsIn",
  "supabaseExistingData",
  "supabaseSensitivity",
  "blogWhoWrites",
  "blogHowOften",
  "blogTopics",
  "blogExisting",
  "adminEditors",
  "adminEditWhat",
  "bookingWhat",
  "bookingCalendar",
  "bookingLeadTime",
  "bookingPayment",
  "bookingPolicy",
]);

/**
 * Paste boxes the primer's exclusion list did not know about.
 *
 * `peoplePaste` is the roster's own "Sort this for me" box (PORT-17). Input,
 * not an answer, exactly as `fastWay` is.
 */
const INPUT_FIELDS = new Set(["peoplePaste"]);

/**
 * Fields only some kinds are asked, and the test that says which.
 *
 * Read through the same registry accessors the step components use, so the
 * inventory and the screen cannot disagree about who is asked what. A key
 * absent from this map is asked of every kind.
 */
const KIND_GATED: Readonly<Record<string, (kind: ShowcaseKind) => boolean>> = {
  stage: (kind) => groupsFor(kind).has("stage"),
  stageDetail: (kind) => groupsFor(kind).has("stage"),
  // Asked instead of `stage`, so it is the venture kind's one absence.
  howLong: (kind) => !groupsFor(kind).has("stage"),
  signOff: (kind) => groupsFor(kind).has("claims"),
  cantSay: (kind) => groupsFor(kind).has("claims"),
  requiredWording: (kind) => groupsFor(kind).has("claims"),
  toolsDetail: (kind) => !kindAsks(kind, "video"),
  toolsOther: (kind) => !kindAsks(kind, "video"),
};

/**
 * Every hand-written key in this file's second half, for the drift guard.
 * Appended to `staleInventoryKeys()`'s sweep below.
 */
const INGESTION_HAND_WRITTEN: readonly string[] = [
  ...CHOICE_BACKED,
  ...REVEAL_GATED,
  ...EXTRA_GATED,
  ...INPUT_FIELDS,
  ...Object.keys(KIND_GATED),
];

/**
 * The fields the ingestion run may write for one kind.
 *
 * Derived from `PRIMER_FIELDS`, so a field added to a step schema is a field
 * the run can fill, and one removed cannot linger. Order is step order, then
 * schema order — the order the client meets the questions in.
 */
export function ingestionFieldsFor(kind: ShowcaseKind): readonly PrimerField[] {
  return PRIMER_FIELDS.filter(
    (field) =>
      !CHOICE_BACKED.has(field.key) &&
      !REVEAL_GATED.has(field.key) &&
      !EXTRA_GATED.has(field.key) &&
      !INPUT_FIELDS.has(field.key) &&
      (KIND_GATED[field.key]?.(kind) ?? true),
  );
}

/**
 * Hand-written ingestion keys no longer in any showcase schema.
 *
 * Reported by `yarn eval:primer --inventory` beside the primer's own sweep.
 * Kept separate from `staleInventoryKeys` so the primer's check reads exactly
 * as it did before PORT-18.
 */
export function staleIngestionKeys(): string[] {
  const live = new Set(
    stepsFor("showcase").flatMap((step) =>
      textFieldKeysFor("showcase", step.key),
    ),
  );
  return INGESTION_HAND_WRITTEN.filter((key) => !live.has(key))
    .filter((key, index, all) => all.indexOf(key) === index)
    .sort();
}
