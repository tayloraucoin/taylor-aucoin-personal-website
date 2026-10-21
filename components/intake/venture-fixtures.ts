import type { StartFormSeed } from "@/app/websites/coded/intake/_components/showcase-start-form";
import type { ExistingFile } from "@/app/websites/intake/_components/file-drop";
import type { ExampleSet } from "@/content/intake-examples";
import type { ShowcaseKind, VentureType } from "@/lib/intake/showcase-kinds";
import { FIXTURE_SENTINEL } from "@/lib/page-state";
import type { ShowcaseStepKey } from "@/lib/types/intake";

/**
 * The VEN epic's drawn states, as data (C4; D-VEN-2, D-SITE-218).
 *
 * Two readers, in two app trees: the admin questions page, which reads a key
 * through `readPageState` (so `default` in production) and seeds its stack,
 * and the harness at `/test-harness/intake?state=<key>` (a 404 in
 * production), which renders the key's one step through
 * `venture-state-view.tsx`. Captures and e2e run on the harness, because a
 * capture cannot sign in to the admin.
 *
 * Every value is invented (D-PORT-14) and every fixture carries
 * `FIXTURE_SENTINEL`. VEN-1 lands the module and the kind picker's four
 * states; each later VEN piece appends its own.
 */

export const VEN_STATE_KEYS = [
  // VEN-1: the kind picker and the venture sub-type (`kind-picker.md`).
  "kind-other",
  "venture-chosen",
  "place-chosen",
  "subtype-changed",
  // VEN-2: the place questions on About and Work (`venture-place.md`).
  "plain-venture",
  "place-empty",
  "place-filled",
  "place-searching",
  // VEN-3: the investor ask in the claims cluster, the Invest card and
  // Site's raise progress (`investor-ask.md`).
  "ask-plain",
  "ask-place-empty",
  "ask-coowner",
  "ask-returns",
  "ask-invest-card",
  "ask-raise-progress",
] as const;

export type VenStateKey = (typeof VEN_STATE_KEYS)[number];

export function isVenStateKey(value: unknown): value is VenStateKey {
  return VEN_STATE_KEYS.includes(value as VenStateKey);
}

/** One drawn scene: who the client is, what they answered, where it shows. */
export type VentureFixture = {
  /** Wins over the admin URL's `kind`, so a state is a whole scene. */
  kind: ShowcaseKind;
  /** Wins over the admin URL's `subtype`. The stored value, or none. */
  ventureType: VentureType | null;
  /** The surface the harness draws: the start form, or one step. */
  surface: "start" | ShowcaseStepKey;
  /**
   * Further steps the harness draws under `surface`, in order, so one state
   * key shows a question set that spans steps (VEN-2: About and Work).
   */
  alsoSteps?: readonly ShowcaseStepKey[];
  /** Answers per step, as the engagement would hold them. */
  answers: Partial<Record<ShowcaseStepKey, Record<string, unknown>>>;
  /** Files per field key. */
  files?: Readonly<Record<string, readonly ExistingFile[]>>;
  /** A synthetic gallery, for the taste states. */
  gallery?: ExampleSet;
  /** The start form's choices, drawn already made. */
  startSeed?: StartFormSeed;
  /** About's kind picker drawn open. */
  picking?: boolean;
  /** Work's ask cards drawn open, chosen or not (VEN-3). */
  openEntries?: boolean;
};

/** The one synthetic address every VEN fixture carries. */
const FIXTURE_SITE = `https://${FIXTURE_SENTINEL}`;

const ABOUT_BASE = {
  displayName: "Fixture Commons",
  whatYouDo: "[Fixture: a one-line description]",
  currentWebsite: FIXTURE_SITE,
} as const;

/* ── VEN-2: the place questions ─────────────────────────────────────────── */

const VENTURE_ABOUT = {
  ...ABOUT_BASE,
  siteKind: "venture",
  stage: "underway",
  stageDetail: "[Fixture: what is built, what is signed, what is next]",
  basedIn: "[Fixture: a region]",
} as const;

const PLACE_ABOUT = { ...VENTURE_ABOUT, ventureType: "place" } as const;

/** One synthetic ask, so the asks block sits above Applying as it will. */
const FIXTURE_ASK = {
  entryKey: "fixture-ask-1",
  ask: "apply",
  forWhom: "[Fixture: who it is for]",
} as const;

const PLACE_ANSWERS_FILLED = {
  about: {
    ...PLACE_ABOUT,
    propertyStatus: "underContract",
    propertyTitle: "[Fixture: Example Land Co-op, since 2024]",
    locationPrecision: "region",
    locationWhy: "[Fixture: the sale has not closed]",
    visitsNow: "[Fixture: by arrangement with the site lead]",
  },
  work: {
    pieces: [
      {
        entryKey: "fixture-piece-1",
        title: "[Fixture: the main house]",
        kind: "[Fixture: a building]",
        status: "underway",
        when: "[Fixture: next spring]",
        funded: "partly",
        story: "[Fixture: a sentence about the house]",
        placement: "front",
      },
    ],
    placeSize: "[Fixture: hectares, rooms and beds, now and per phase]",
    permits: "[Fixture: which permits, granted or pending, with dates]",
    asks: [FIXTURE_ASK],
    applyWho: "[Fixture: who can apply, and for what]",
    applyAfter: "[Fixture: the steps after applying]",
    applyFee: "[Fixture: a deposit, and when it is refunded]",
    applyQuestions: "[Fixture: the current application questions]",
  },
} as const;

const VEN_2_FIXTURES = {
  // A venture with no sub-type: none of the place rows, today's labels.
  "plain-venture": {
    kind: "venture",
    ventureType: null,
    surface: "about",
    alsoSteps: ["audience", "work", "site"],
    answers: {
      about: VENTURE_ABOUT,
      work: {
        pieces: [{ entryKey: "fixture-piece-1" }],
        asks: [FIXTURE_ASK],
      },
    },
  },
  // Every place row in place and unanswered; one blank piece shows the
  // funded row, nothing checked.
  "place-empty": {
    kind: "venture",
    ventureType: "place",
    surface: "about",
    alsoSteps: ["work"],
    answers: {
      about: PLACE_ABOUT,
      work: {
        pieces: [{ entryKey: "fixture-piece-1" }],
        asks: [FIXTURE_ASK],
      },
    },
  },
  "place-filled": {
    kind: "venture",
    ventureType: "place",
    surface: "about",
    alsoSteps: ["work"],
    answers: PLACE_ANSWERS_FILLED,
  },
  // Still searching: the title question keeps its label (the answer may be
  // "nobody yet").
  "place-searching": {
    kind: "venture",
    ventureType: "place",
    surface: "about",
    answers: {
      about: {
        ...PLACE_ABOUT,
        propertyStatus: "searching",
        propertyTitle: "[Fixture: nobody yet]",
      },
    },
  },
} satisfies Record<string, VentureFixture>;

/* ── VEN-3: the investor ask ────────────────────────────────────────────── */

/** An Invest card with its three rows answered, and an Apply card beside it. */
const INVEST_ASK = {
  entryKey: "fixture-ask-invest",
  ask: "invest",
  forWhom: "[Fixture: who may invest]",
  number: "[Fixture: a minimum]",
  currency: "[Fixture: a currency]",
  sameMinimum: "no",
  visibility: "request",
  eligibility: "[Fixture: who may see the numbers, and who checks]",
} as const;

const VEN_3_FIXTURES = {
  // Every venture's rows, with the all-venture intro; no place row.
  "ask-plain": {
    kind: "venture",
    ventureType: null,
    surface: "work",
    answers: { about: VENTURE_ABOUT, work: {} },
  },
  // Every row, nothing answered, no reveal open.
  "ask-place-empty": {
    kind: "venture",
    ventureType: "place",
    surface: "work",
    answers: { about: PLACE_ABOUT, work: {} },
  },
  "ask-coowner": {
    kind: "venture",
    ventureType: "place",
    surface: "work",
    answers: {
      about: PLACE_ABOUT,
      work: {
        coOwnerDiffers: "different",
        coOwnerLines: "[Fixture: one line for a co-owner, one for an investor]",
      },
    },
  },
  "ask-returns": {
    kind: "venture",
    ventureType: null,
    surface: "work",
    answers: {
      about: VENTURE_ABOUT,
      work: {
        returnWording: "approved",
        returnWordingQuote: "[Fixture: the approved line, and who approved it]",
      },
    },
  },
  "ask-invest-card": {
    kind: "venture",
    ventureType: null,
    surface: "work",
    openEntries: true,
    answers: {
      about: VENTURE_ABOUT,
      work: {
        asks: [INVEST_ASK, { ...FIXTURE_ASK, entryKey: "fixture-ask-2" }],
      },
    },
  },
  "ask-raise-progress": {
    kind: "venture",
    ventureType: "place",
    surface: "site",
    answers: {
      about: PLACE_ABOUT,
      site: {
        showAvailability: "yes",
        availabilityDetail: "[Fixture: the line, and when it stops being true]",
      },
    },
  },
} satisfies Record<string, VentureFixture>;

/** The invest card's answers, for the document test (VEN-3 C6). */
export const INVEST_ASK_ANSWERS = INVEST_ASK;

/** The filled place answers, for the document test (VEN-2 C8). */
export const PLACE_FILLED_ANSWERS = PLACE_ANSWERS_FILLED;

export const VEN_FIXTURES: Readonly<Record<VenStateKey, VentureFixture>> = {
  "kind-other": {
    kind: "other",
    ventureType: null,
    surface: "start",
    answers: { about: { ...ABOUT_BASE, siteKind: "other" } },
    startSeed: { siteKind: "other", currentWebsite: FIXTURE_SITE },
  },
  "venture-chosen": {
    kind: "venture",
    ventureType: null,
    surface: "start",
    answers: { about: { ...ABOUT_BASE, siteKind: "venture" } },
    startSeed: { siteKind: "venture", currentWebsite: FIXTURE_SITE },
  },
  "place-chosen": {
    kind: "venture",
    ventureType: "place",
    surface: "start",
    answers: {
      about: { ...ABOUT_BASE, siteKind: "venture", ventureType: "place" },
    },
    startSeed: {
      siteKind: "venture",
      ventureType: "place",
      currentWebsite: FIXTURE_SITE,
    },
  },
  // `place` was picked first and changed to `company` on About: the picker
  // stays open with its reassurance line, and any place answers are kept.
  "subtype-changed": {
    kind: "venture",
    ventureType: "company",
    surface: "about",
    answers: {
      about: { ...ABOUT_BASE, siteKind: "venture", ventureType: "company" },
    },
    picking: true,
  },
  ...VEN_2_FIXTURES,
  ...VEN_3_FIXTURES,
};

/** One fixture by key. */
export function venFixture(key: VenStateKey): VentureFixture {
  return VEN_FIXTURES[key];
}
