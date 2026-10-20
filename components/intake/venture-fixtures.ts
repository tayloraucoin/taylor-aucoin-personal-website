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
};

/** The one synthetic address every VEN fixture carries. */
const FIXTURE_SITE = `https://${FIXTURE_SENTINEL}`;

const ABOUT_BASE = {
  displayName: "Fixture Commons",
  whatYouDo: "[Fixture: a one-line description]",
  currentWebsite: FIXTURE_SITE,
} as const;

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
};

/** One fixture by key. */
export function venFixture(key: VenStateKey): VentureFixture {
  return VEN_FIXTURES[key];
}
