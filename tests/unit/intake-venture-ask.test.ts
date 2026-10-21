import assert from "node:assert/strict";
import { test } from "node:test";
import { showsInvestRows } from "@/app/websites/coded/intake/_components/ask-entry";
import { hasGroup } from "@/app/websites/coded/intake/_components/for-kinds";
import { INVEST_ASK_ANSWERS } from "@/components/intake/venture-fixtures";
import { EMPTY_EXAMPLE_SET } from "@/content/intake-examples";
import { RAISE_CHOICE_LABELS } from "@/lib/intake/showcase-answer-labels";
import { resolvePack, SHOWCASE_FLAVOURS } from "@/lib/intake/showcase-copy";
import {
  SHOWCASE_KIND_KEYS,
  VENTURE_TYPES,
  type VentureType,
} from "@/lib/intake/showcase-kinds";
import {
  askedOf,
  choiceBackedKeys,
  ingestionFieldsFor,
  primerField,
  revealGatedKeys,
} from "@/lib/intake/showcase-primer-fields";
import { labelFor } from "@/lib/intake/tracks";
import type { Engagement } from "@/server/services/engagement";
import {
  collectUnanswered,
  renderIntakeMarkdown,
} from "@/server/services/output";

/** VEN-3: the investor ask, who is asked it, what a run may touch, the document. */

const RAISE_KEYS = [
  "issuerEntity",
  "jurisdictions",
  "returnWording",
  "returnWordingQuote",
] as const;
const PLACE_KEYS = [
  "investorReceives",
  "coOwnerDiffers",
  "coOwnerLines",
  "perks",
  "raiseProgress",
] as const;
const ENTRY_KEYS = ["currency", "sameMinimum", "eligibility"];
/** Never written by a run: radios, reveals, counsel's words (C9). */
const NEVER_WRITTEN = [
  "coOwnerDiffers",
  "coOwnerLines",
  "returnWording",
  "returnWordingQuote",
  "raiseProgress",
  "investorReceives",
  "perks",
];

const SUBTYPES: (VentureType | null)[] = [
  null,
  ...VENTURE_TYPES.map((entry) => entry.key),
];

/** Every kind × (null + six sub-types). */
const PAIRS = SHOWCASE_KIND_KEYS.flatMap((kind) =>
  SUBTYPES.map((t) => [kind, t] as const),
);

const NOT_VENTURE = SHOWCASE_KIND_KEYS.filter((kind) => kind !== "venture");

/** Today's claims intro, which every pack but venture still reads. */
const TODAY_INTRO =
  'These are the questions that stop us putting something on your site that isn\'t true. Three of them, and "not sure" is a fine answer to all three.';

test("VEN-3 C3 raise and place are false for every other kind, with any sub-type", () => {
  for (const kind of NOT_VENTURE) {
    for (const t of SUBTYPES) {
      assert.equal(hasGroup("raise")(kind, t), false, `raise ${kind}/${t}`);
      assert.equal(hasGroup("place")(kind, t), false, `place ${kind}/${t}`);
      for (const key of [...RAISE_KEYS, ...PLACE_KEYS]) {
        assert.equal(askedOf(key, kind, t), false, `${key} ${kind}/${t}`);
      }
    }
  }
});

test("VEN-3 C3 no other pack holds a raise slot, and each keeps today's claims strings", () => {
  const generic = resolvePack("generic").claims;
  for (const flavour of SHOWCASE_FLAVOURS.filter((f) => f !== "venture")) {
    const pack = resolvePack(flavour);
    assert.equal(pack.raise, undefined, flavour);
    assert.equal(pack.placeVenture, undefined, flavour);
    assert.deepEqual(pack.claims, generic, flavour);
    assert.equal(pack.claims.intro, TODAY_INTRO, flavour);
  }
});

test("VEN-3 C3 every venture carries raise; the place overlay adds the place rows and its intro", () => {
  const plain = resolvePack("venture");
  const place = resolvePack("venture", "place");
  assert.ok(plain.raise);
  assert.equal(place.raise, plain.raise);
  assert.notEqual(plain.claims.intro, TODAY_INTRO);
  assert.notEqual(place.claims.intro, plain.claims.intro);
  // The place overlay rewords two help lines and keeps the rest of the floor.
  assert.equal(place.claims.cantSay, plain.claims.cantSay);
  assert.equal(place.claims.signOff.label, plain.claims.signOff.label);
  assert.equal(
    place.claims.requiredWording.label,
    plain.claims.requiredWording.label,
  );
  assert.ok(place.placeVenture?.raiseProgress);
});

test("VEN-3 C3 every critical radio ends Not sure yet, and nothing is preselected by the pack", () => {
  const plain = resolvePack("venture").raise!;
  const place = resolvePack("venture", "place").placeVenture!;
  for (const field of [
    plain.returnWording,
    plain.invest.sameMinimum,
    place.coOwnerDiffers,
    place.raiseProgress,
  ]) {
    assert.equal(field.options.at(-1)?.value, "unsure");
    assert.equal(field.options.at(-1)?.label, "Not sure yet");
  }
});

test("VEN-3 C6 the invest rows show on a venture's Invest card only", () => {
  const test = hasGroup("raise");
  for (const [kind, t] of PAIRS) {
    for (const ask of ["invest", "apply", "donate", "contact", "", undefined]) {
      assert.equal(
        showsInvestRows(test, kind, t, { ask }),
        kind === "venture" && ask === "invest",
        `${kind}/${t}/${ask}`,
      );
    }
  }
});

test("VEN-3 C7 no run, on any kind or sub-type, writes a reveal, radio, counsel or entry key", () => {
  for (const [kind, t] of PAIRS) {
    const keys = ingestionFieldsFor(kind, t).map((field) => field.key);
    const label = `${kind}/${t ?? "none"}`;
    for (const key of [...NEVER_WRITTEN, ...ENTRY_KEYS]) {
      assert.equal(keys.includes(key), false, `${key} ${label}`);
    }
    for (const key of ["issuerEntity", "jurisdictions"]) {
      assert.equal(keys.includes(key), kind === "venture", `${key} ${label}`);
    }
  }
});

test("VEN-3 C7 the radios and reveals are registered, and every key is critical", () => {
  for (const key of ["coOwnerDiffers", "returnWording", "raiseProgress"]) {
    assert.ok(choiceBackedKeys.has(key), key);
  }
  for (const key of ["coOwnerLines", "returnWordingQuote", "raiseProgress"]) {
    assert.ok(revealGatedKeys.has(key), key);
  }
  for (const key of [...RAISE_KEYS, ...PLACE_KEYS]) {
    const field = primerField(key);
    if (key === "investorReceives" || key === "perks") {
      // Counsel's words: never in the primer's inventory (C9).
      assert.equal(field, undefined, key);
      continue;
    }
    assert.equal(field?.critical, true, key);
  }
  for (const key of ENTRY_KEYS) assert.equal(primerField(key), undefined, key);
  assert.equal(primerField("showAvailability")?.critical, false);
});

/** A synthetic engagement with one Invest card and nothing else answered. */
function engagement(kind: string, ventureType: string | null): Engagement {
  const epoch = new Date(0);
  return {
    id: "eng_synthetic_ven3",
    createdAt: epoch,
    updatedAt: epoch,
    answers: {
      about: {
        displayName: "Fixture Commons",
        siteKind: kind,
        ...(ventureType ? { ventureType } : {}),
      },
      work: { asks: [INVEST_ASK_ANSWERS] },
    },
    businessName: "Fixture Commons",
    completedAt: null,
    contactEmail: "sam@fixture.invalid",
    contactName: "Sam Fixture",
    contactPhone: null,
    currency: "cad",
    currentStep: 0,
    depositAmountCents: 0,
    depositRequired: true,
    lastActivityAt: epoch,
    paidAt: epoch,
    projectSummary: null,
    sentAt: null,
    startedAt: epoch,
    termsAcceptedAt: epoch,
    termsVersion: null,
    tokenExpiresAt: epoch,
    track: "showcase",
    status: "created",
  } as Engagement;
}

function render(kind: string, ventureType: string | null): string {
  return renderIntakeMarkdown({
    engagement: engagement(kind, ventureType),
    files: [],
    generatedAt: new Date(0),
    gallery: EMPTY_EXAMPLE_SET,
  });
}

test("VEN-3 C6 the document prints an Invest card's three rows as words", () => {
  const doc = render("venture", null);
  const card = doc.slice(doc.indexOf("### Ask 1 — Invest"));
  assert.match(card, /- Currency: \[Fixture: a currency\]/);
  assert.match(
    card,
    new RegExp(
      `- Same minimum in every country: ${RAISE_CHOICE_LABELS.sameMinimum!.no}`,
    ),
  );
  assert.match(
    card,
    /- Who may see the numbers: \[Fixture: who may see the numbers, and who checks\]/,
  );
});

test("VEN-3 C6 an unanswered returnWording prints as not answered, on a venture only", () => {
  const label = labelFor("showcase", "returnWording");
  assert.notEqual(label, "returnWording");
  const listed = (kind: string, t: string | null) =>
    collectUnanswered(engagement(kind, t)).flatMap((group) => group.labels);
  assert.ok(listed("venture", null).includes(label));
  assert.ok(listed("venture", "place").includes(label));
  assert.equal(listed("practice", null).includes(label), false);
  const doc = render("venture", null);
  const notAnswered = doc.slice(doc.indexOf("## Not answered"));
  assert.ok(notAnswered.includes(label));
});

test("VEN-3 C6 every key and radio value has a document label", () => {
  for (const key of [...RAISE_KEYS, ...PLACE_KEYS, ...ENTRY_KEYS]) {
    assert.notEqual(labelFor("showcase", key), key, key);
  }
  const plain = resolvePack("venture").raise!;
  const place = resolvePack("venture", "place").placeVenture!;
  for (const [key, options] of [
    ["returnWording", plain.returnWording.options],
    ["sameMinimum", plain.invest.sameMinimum.options],
    ["coOwnerDiffers", place.coOwnerDiffers.options],
    ["raiseProgress", place.raiseProgress.options],
  ] as const) {
    for (const option of options) {
      assert.ok(
        RAISE_CHOICE_LABELS[key]?.[option.value],
        `${key}:${option.value}`,
      );
    }
  }
});
