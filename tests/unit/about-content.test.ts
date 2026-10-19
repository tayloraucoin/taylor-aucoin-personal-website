import assert from "node:assert/strict";
import { test } from "node:test";
import { experience, howIThink } from "@/content/about";
import { work } from "@/content/work";

const GROUPS = [
  "Full-time",
  "Contract and fractional",
  "My own products",
  "Programmes",
];

test("C3 every experience entry has a group, name, role and years, with an en dash for a range", () => {
  assert.ok(experience.length > 0);
  for (const e of experience) {
    assert.ok(GROUPS.includes(e.group), `${e.name} group`);
    assert.ok(e.name && e.role && e.years, `${e.name} fields`);
    assert.ok(!/\d\s*-\s*\d/.test(e.years), `${e.name} hyphen range`);
    if (/\d{4}.+\d{4}|\d{4}.+present/.test(e.years)) {
      assert.ok(e.years.includes(" – "), `${e.name} en dash`);
    }
  }
});

test("C3 every slug names a study, and the only anchor is teaching", () => {
  const slugs = new Set(work.map((w) => w.slug));
  for (const e of experience) {
    if (e.slug) assert.ok(slugs.has(e.slug), `${e.name} slug ${e.slug}`);
    if (e.anchor) assert.equal(e.anchor, "teaching");
  }
  assert.equal(experience.filter((e) => e.slug).length, 6);
});

test("C1 How I think holds three rows and none is Mentorship", () => {
  assert.equal(howIThink.length, 3);
  assert.ok(!howIThink.some((r) => /mentorship/i.test(r.lead)));
});
