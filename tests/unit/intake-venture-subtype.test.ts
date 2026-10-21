import assert from "node:assert/strict";
import { test } from "node:test";
import { startAboutSeed } from "@/app/websites/coded/intake/_actions/start-seed";
import {
  fills,
  hasGroup,
  kindsMeeting,
} from "@/app/websites/coded/intake/_components/for-kinds";
import { resolvePack, SHOWCASE_FLAVOURS } from "@/lib/intake/showcase-copy";
import {
  groupsFor,
  SHOWCASE_KIND_KEYS,
  VENTURE_TYPES,
  ventureTypeFor,
} from "@/lib/intake/showcase-kinds";

/** VEN-1: the venture sub-type, its storage, its groups and its overlay. */

const SUBTYPES = VENTURE_TYPES.map((entry) => entry.key);
const NOT_VENTURE = SHOWCASE_KIND_KEYS.filter((kind) => kind !== "venture");

const sorted = (set: ReadonlySet<string>) => [...set].sort();

const startInput = (siteKind: string | undefined, ventureType?: string) => ({
  contactName: "Sam Fixture",
  contactEmail: "sam@fixture.invalid",
  siteKind,
  ventureType,
});

test("VEN-1 C2 the start form seeds place on a venture that chose it", () => {
  assert.equal(
    startAboutSeed(startInput("venture", "place")).ventureType,
    "place",
  );
});

test("VEN-1 C2 a venture that chose nothing stores no sub-type key", () => {
  assert.equal("ventureType" in startAboutSeed(startInput("venture")), false);
});

test("VEN-1 C2 no other kind stores the sub-type it was sent", () => {
  for (const kind of NOT_VENTURE) {
    const seed = startAboutSeed(startInput(kind, "place"));
    assert.equal("ventureType" in seed, false, kind);
    assert.equal(seed.siteKind, kind);
  }
});

test("VEN-1 C3 ventureTypeFor is null when absent, unknown, or under another kind", () => {
  assert.equal(ventureTypeFor({ about: { siteKind: "venture" } }), null);
  assert.equal(
    ventureTypeFor({ about: { siteKind: "venture", ventureType: "castle" } }),
    null,
  );
  for (const kind of NOT_VENTURE) {
    assert.equal(
      ventureTypeFor({ about: { siteKind: kind, ventureType: "place" } }),
      null,
      kind,
    );
  }
});

test("VEN-1 C3 ventureTypeFor returns each listed value on a venture", () => {
  for (const t of SUBTYPES) {
    assert.equal(
      ventureTypeFor({ about: { siteKind: "venture", ventureType: t } }),
      t,
    );
  }
});

test("VEN-1 C3 a stale sub-type changes no other kind's groups", () => {
  for (const kind of NOT_VENTURE) {
    for (const t of SUBTYPES) {
      assert.deepEqual(
        sorted(groupsFor(kind, t)),
        sorted(groupsFor(kind)),
        `${kind}/${t}`,
      );
    }
  }
});

test("VEN-1 C3 venture gains raise, and place adds place only on venture", () => {
  assert.equal(groupsFor("venture").has("raise"), true);
  assert.equal(groupsFor("venture").has("place"), false);
  assert.equal(groupsFor("venture", "place").has("place"), true);
  for (const t of SUBTYPES.filter((t) => t !== "place")) {
    assert.deepEqual(
      sorted(groupsFor("venture", t)),
      sorted(groupsFor("venture")),
    );
  }
  for (const kind of NOT_VENTURE) {
    assert.equal(groupsFor(kind, "place").has("place"), false, kind);
    assert.equal(groupsFor(kind).has("raise"), false, kind);
  }
});

test("VEN-1 C4 plain venture and the five non-place sub-types are the venture pack itself", () => {
  const venture = resolvePack("venture");
  assert.equal(resolvePack("venture", null), venture);
  for (const t of SUBTYPES.filter((t) => t !== "place")) {
    assert.equal(resolvePack("venture", t), venture, t);
  }
  assert.notEqual(resolvePack("venture", "place"), venture);
});

test("VEN-1 C4 every other flavour returns its own pack for any overlay key", () => {
  for (const flavour of SHOWCASE_FLAVOURS.filter((f) => f !== "venture")) {
    for (const t of [...SUBTYPES, "anything"]) {
      assert.equal(
        resolvePack(flavour, t),
        resolvePack(flavour),
        `${flavour}/${t}`,
      );
    }
  }
});

test("VEN-1 C11 the overview tags a place block venture (place) and a raise block venture", () => {
  assert.deepEqual(kindsMeeting(hasGroup("place")), ["venture (place)"]);
  assert.deepEqual(kindsMeeting(hasGroup("raise")), ["venture"]);
});

test("VEN-1 C11 a kind-only test gives today's tags", () => {
  assert.deepEqual(kindsMeeting(hasGroup("claims")), [
    "practice",
    "studio",
    "venture",
    "business",
    "other",
  ]);
  assert.deepEqual(kindsMeeting(fills("pieces")), ["venture"]);
});
