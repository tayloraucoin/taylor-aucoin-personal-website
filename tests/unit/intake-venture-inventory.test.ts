import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { RETIRED_TASTE_KEYS } from "@/lib/intake/showcase-answer-labels";
import {
  SHOWCASE_KIND_KEYS,
  VENTURE_TYPES,
  type ShowcaseKind,
  type VentureType,
} from "@/lib/intake/showcase-kinds";
import {
  askedOf,
  choiceBackedKeys,
  ingestionFieldsFor,
  primerField,
  revealGatedKeys,
} from "@/lib/intake/showcase-primer-fields";
import { PAGE_BOX_KEYS } from "@/lib/intake/site-page-notes";
import { fieldKeysFor, labelFor, stepsFor } from "@/lib/intake/tracks";
import type { Engagement } from "@/server/services/engagement";
import { answerTally, collectUnanswered } from "@/server/services/output";

/** VEN-1: who is asked what, for the run and for the document. */

const SUBTYPES: (VentureType | null)[] = [
  null,
  ...VENTURE_TYPES.map((entry) => entry.key),
];

/** Every kind × (null + six sub-types), the generated input C6 names. */
const PAIRS = SHOWCASE_KIND_KEYS.flatMap((kind) =>
  SUBTYPES.map((t) => [kind, t] as const),
);

test("VEN-1 C6 no run, on any kind or sub-type, holds the sub-type or a radio or reveal key", () => {
  for (const [kind, t] of PAIRS) {
    const keys = ingestionFieldsFor(kind, t).map((field) => field.key);
    const label = `${kind}/${t ?? "none"}`;
    assert.equal(keys.includes("ventureType"), false, label);
    assert.deepEqual(
      keys.filter((key) => choiceBackedKeys.has(key)),
      [],
      label,
    );
    assert.deepEqual(
      keys.filter((key) => revealGatedKeys.has(key)),
      [],
      label,
    );
  }
});

test("VEN-1 C6 leaving the sub-type out is the same as null, so it fails closed", () => {
  for (const kind of SHOWCASE_KIND_KEYS) {
    assert.deepEqual(
      ingestionFieldsFor(kind),
      ingestionFieldsFor(kind, null),
      kind,
    );
  }
});

test("VEN-1 C6 every key a run may write is one the kind and sub-type are asked", () => {
  for (const [kind, t] of PAIRS) {
    for (const field of ingestionFieldsFor(kind, t)) {
      assert.equal(
        askedOf(field.key, kind, t),
        true,
        `${kind}/${t}/${field.key}`,
      );
    }
  }
});

test("VEN-1 C6 askedOf asks every venture its sub-type, and no other kind", () => {
  for (const [kind, t] of PAIRS) {
    assert.equal(
      askedOf("ventureType", kind, t),
      kind === "venture",
      `${kind}/${t}`,
    );
  }
  // An ungated key is asked of everyone.
  for (const [kind, t] of PAIRS) {
    assert.equal(askedOf("basedIn", kind, t), true);
  }
});

test("VEN-1 C6 the sub-type is critical", () => {
  assert.equal(primerField("ventureType")?.critical, true);
});

/** A synthetic engagement with nothing answered but its kind. */
function engagement(about: Record<string, unknown>): Engagement {
  const epoch = new Date(0);
  return {
    id: "eng_synthetic_ven1",
    createdAt: epoch,
    updatedAt: epoch,
    answers: { about },
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

/** What each step should list: every unanswered key the kind was asked. */
function expectedLabels(kind: ShowcaseKind, answered: Set<string>): string[] {
  return stepsFor("showcase").flatMap((step) =>
    fieldKeysFor("showcase", step.key)
      .filter((key) => !answered.has(key))
      .filter((key) => !(step.key === "taste" && RETIRED_TASTE_KEYS.has(key)))
      // WEB-22: the page boxes past Home are not on the client's lists.
      .filter((key) => !(step.key === "site" && PAGE_BOX_KEYS.has(key)))
      .filter((key) => askedOf(key, kind, null))
      .map((key) => labelFor("showcase", key)),
  );
}

test("VEN-1 C7 a portfolio's Not-answered list holds no question it was never asked", () => {
  const portfolio = engagement({ siteKind: "portfolio" });
  const listed = collectUnanswered(portfolio).flatMap((group) => group.labels);

  for (const key of [
    "stage",
    "stageDetail",
    "signOff",
    "cantSay",
    "requiredWording",
    "toolsDetail",
    "toolsOther",
    "ventureType",
  ]) {
    assert.equal(listed.includes(labelFor("showcase", key)), false, key);
  }
  assert.deepEqual(listed, expectedLabels("portfolio", new Set(["siteKind"])));
});

test("VEN-1 C7 a portfolio's review tally counts only what it was asked", () => {
  const portfolio = engagement({ siteKind: "portfolio" });
  for (const row of answerTally(portfolio)) {
    const asked = fieldKeysFor("showcase", row.key)
      .filter((key) => !(row.key === "taste" && RETIRED_TASTE_KEYS.has(key)))
      .filter((key) => !(row.key === "site" && PAGE_BOX_KEYS.has(key)))
      .filter((key) => askedOf(key, "portfolio", null));
    assert.equal(row.total, asked.length, row.key);
  }
});

test("VEN-1 C7 a venture's lists name the sub-type it has not answered", () => {
  const venture = engagement({ siteKind: "venture" });
  const listed = collectUnanswered(venture).flatMap((group) => group.labels);
  assert.equal(listed.includes(labelFor("showcase", "ventureType")), true);
  assert.equal(listed.includes(labelFor("showcase", "stage")), true);
  assert.deepEqual(listed, expectedLabels("venture", new Set(["siteKind"])));
});

test("VEN-1 C9 yarn verify runs both drift guards", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };
  const verify = pkg.scripts.verify ?? "";
  assert.match(verify, /yarn verify:tracks(\s|&|$)/);
  assert.match(verify, /yarn eval:primer --inventory(\s|&|$)/);
});
