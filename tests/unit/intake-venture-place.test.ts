import assert from "node:assert/strict";
import { test } from "node:test";
import { PLACE_FILLED_ANSWERS } from "@/components/intake/venture-fixtures";
import { EMPTY_EXAMPLE_SET } from "@/content/intake-examples";
import { PIECE_FUNDED_LABELS } from "@/lib/intake/showcase-answer-labels";
import { resolvePack } from "@/lib/intake/showcase-copy";
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
} from "@/lib/intake/showcase-primer-fields";
import { labelFor } from "@/lib/intake/tracks";
import type { Engagement } from "@/server/services/engagement";
import { extractionSchemaFor } from "@/server/services/extract";
import { renderIntakeMarkdown } from "@/server/services/output";

/** VEN-2: the place questions, who is asked them, and how they print. */

const PLACE_KEYS = [
  "propertyStatus",
  "propertyTitle",
  "locationPrecision",
  "locationWhy",
  "visitsNow",
  "placeSize",
  "permits",
  "applyWho",
  "applyAfter",
  "applyFee",
  "applyQuestions",
] as const;

const PLACE_RADIOS = ["propertyStatus", "locationPrecision"];

const SUBTYPES: (VentureType | null)[] = [
  null,
  ...VENTURE_TYPES.map((entry) => entry.key),
];

/** Every kind × (null + six sub-types). */
const PAIRS = SHOWCASE_KIND_KEYS.flatMap((kind) =>
  SUBTYPES.map((t) => [kind, t] as const),
);

const isPlace = (kind: string, t: VentureType | null) =>
  kind === "venture" && t === "place";

test("VEN-2 C3 each place key is asked of a place venture and nothing else", () => {
  for (const key of PLACE_KEYS) {
    for (const [kind, t] of PAIRS) {
      assert.equal(
        askedOf(key, kind, t),
        isPlace(kind, t),
        `${key} ${kind}/${t}`,
      );
    }
  }
});

test("VEN-2 C3 the two radios are choice-backed, and all 11 keys are critical", () => {
  for (const key of PLACE_RADIOS)
    assert.equal(choiceBackedKeys.has(key), true, key);
  for (const key of PLACE_KEYS) {
    assert.equal(primerField(key)?.critical, true, key);
  }
});

test("VEN-2 C5 no place key reaches a run off a place venture; a place run holds the nine text keys", () => {
  const textKeys = PLACE_KEYS.filter((key) => !PLACE_RADIOS.includes(key));
  for (const [kind, t] of PAIRS) {
    const keys = ingestionFieldsFor(kind, t).map((field) => field.key);
    const label = `${kind}/${t ?? "none"}`;
    const held = PLACE_KEYS.filter((key) => keys.includes(key));
    assert.deepEqual(held, isPlace(kind, t) ? textKeys : [], label);
  }
});

test("VEN-2 C6 the piece extraction schema asks for no funded key", () => {
  const entry = extractionSchemaFor("pieces").shape.entries.element;
  const keys = Object.keys(entry.shape);
  assert.equal(keys.includes("funded"), false);
  // The rest of the piece is still asked for.
  assert.equal(keys.includes("status"), true);
  assert.equal(keys.includes("when"), true);
});

test("VEN-2 C6 a reply that calls a phase fully funded yields a piece with no funded value", () => {
  // What the model would send back from a deck saying so, parsed by the
  // schema the run hands it, as the SDK does.
  const reply = {
    entries: [
      {
        title: "[Fixture: phase one]",
        kind: "[Fixture: a phase]",
        status: "",
        when: "[Fixture: next year]",
        story: "[Fixture: phase one is fully funded]",
        placement: "",
        funded: "funded",
      },
    ],
  };
  const parsed = extractionSchemaFor("pieces").parse(reply);
  assert.equal(parsed.entries.length, 1);
  assert.equal("funded" in parsed.entries[0]!, false);
});

test("VEN-2 C7 the place overlay keeps every plain value, adds its own in place, and relabels only", () => {
  const plain = resolvePack("venture");
  const place = resolvePack("venture", "place");
  const values = (options: readonly { value: string }[]) =>
    options.map((option) => option.value);
  const labelOf = (
    options: readonly { value: string; label: string }[],
    v: string,
  ) => options.find((option) => option.value === v)?.label;

  // Audiences: guests, coOwners, facilitators right after residents.
  const plainAud = values(plain.audiences);
  const at = plainAud.indexOf("residents") + 1;
  assert.deepEqual(values(place.audiences), [
    ...plainAud.slice(0, at),
    "guests",
    "coOwners",
    "facilitators",
    ...plainAud.slice(at),
  ]);

  // Asks: reserve, hire, register right before contact.
  const plainAsk = values(plain.ask.askField.options);
  const before = plainAsk.indexOf("contact");
  assert.deepEqual(values(place.ask.askField.options), [
    ...plainAsk.slice(0, before),
    "reserve",
    "hire",
    "register",
    ...plainAsk.slice(before),
  ]);

  // Pages: stays, events right after apply.
  const plainPages = values(plain.pages);
  const after = plainPages.indexOf("apply") + 1;
  assert.deepEqual(values(place.pages), [
    ...plainPages.slice(0, after),
    "stays",
    "events",
    ...plainPages.slice(after),
  ]);

  // Same values, new labels.
  assert.equal(labelOf(place.pages, "offering"), "The model");
  assert.equal(labelOf(place.audiences, "residents"), "Residents");
  assert.equal(
    labelOf(place.audiences, "members"),
    "Members of the community (not newsletter readers)",
  );

  // Plain venture reads as today.
  assert.equal(labelOf(plain.pages, "offering"), "The offering");
  assert.equal(labelOf(plain.audiences, "residents"), "Residents or guests");
  assert.equal(labelOf(plain.audiences, "members"), "Members or applicants");
  assert.equal(plain.placeVenture, undefined);
  assert.equal(resolvePack("venture", "company"), plain);
});

/** A synthetic place engagement holding the `place-filled` answers. */
function engagement(ventureType: string): Engagement {
  const epoch = new Date(0);
  return {
    id: "eng_synthetic_ven2",
    createdAt: epoch,
    updatedAt: epoch,
    answers: {
      about: { ...PLACE_FILLED_ANSWERS.about, ventureType },
      work: PLACE_FILLED_ANSWERS.work,
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

function render(ventureType: string): string {
  return renderIntakeMarkdown({
    engagement: engagement(ventureType),
    files: [],
    generatedAt: new Date(0),
    gallery: EMPTY_EXAMPLE_SET,
  });
}

for (const ventureType of ["place", "company"]) {
  test(`VEN-2 C8 the document prints every place answer under its label (sub-type ${ventureType})`, () => {
    const doc = render(ventureType);
    const answers: Record<string, unknown> = {
      ...PLACE_FILLED_ANSWERS.about,
      ...PLACE_FILLED_ANSWERS.work,
    };
    for (const key of PLACE_KEYS) {
      const label = labelFor("showcase", key);
      assert.notEqual(label, key, `${key} has a label`);
      assert.match(doc, new RegExp(escape(label)), key);
      assert.match(doc, new RegExp(escape(String(answers[key]))), key);
    }
    // The piece's funded status, beside the piece, as words.
    const piece = doc.slice(doc.indexOf("### [Fixture: the main house]"));
    assert.match(piece, new RegExp(`- Funded: ${PIECE_FUNDED_LABELS.partly}`));
  });
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
