import assert from "node:assert/strict";
import { test } from "node:test";
import type { CaseStudy } from "@/content/work";
import { resolveStudy } from "@/lib/work/resolve";

const studies = [
  { slug: "fixture-one", title: "Fixture One" },
  { slug: "fixture-two", title: "Fixture Two" },
] as unknown as CaseStudy[];

test("C4 resolveStudy returns null for a slug not in the studies", () => {
  assert.equal(
    resolveStudy("no-such-slug", studies, () => true),
    null,
  );
});

test("C4 resolveStudy returns null for a study isPublished rejects", () => {
  assert.equal(
    resolveStudy("fixture-two", studies, (slug) => slug !== "fixture-two"),
    null,
  );
});

test("C4 resolveStudy returns the study otherwise", () => {
  assert.equal(
    resolveStudy("fixture-one", studies, () => true),
    studies[0],
  );
});
