import assert from "node:assert/strict";
import { test } from "node:test";
import { fit } from "@/app/book/_lib/fit";

/**
 * C1, written from D-SITE-166's sentence, never from fit.ts: "a fit is a
 * budget of $15K–$75K, over $75K or a full-time salary, with a start this
 * month or in 1–3 months … The role 'A website or brand' always goes to the
 * note, which then carries one line to /websites."
 */
const budgets = {
  "under-15k": false,
  "15k-75k": true,
  "over-75k": true,
  salary: true,
  none: false,
} as const;
const starts = {
  "this-month": true,
  "1-3-months": true,
  later: false,
  exploring: false,
} as const;
const roles = [
  "product-engineer",
  "product-designer",
  "systems-consultant",
  "fractional-cto",
  "zero-to-one",
  "website-or-brand",
  "not-sure",
] as const;

function expected(
  budget: keyof typeof budgets,
  start: keyof typeof starts,
  role: (typeof roles)[number],
) {
  if (role === "website-or-brand") return "website";
  return budgets[budget] && starts[start] ? "fit" : "not_a_fit";
}

test("C1 fit() matches D-SITE-166 for all 140 combinations", () => {
  let n = 0;
  for (const budget of Object.keys(budgets) as (keyof typeof budgets)[])
    for (const start of Object.keys(starts) as (keyof typeof starts)[])
      for (const role of roles) {
        assert.equal(
          fit({ budget, start, role }),
          expected(budget, start, role),
          `${budget} × ${start} × ${role}`,
        );
        n++;
      }
  assert.equal(n, 140);
});

test("C1 a website or brand is website even with a fitting budget and start", () => {
  assert.equal(
    fit({ budget: "over-75k", start: "this-month", role: "website-or-brand" }),
    "website",
  );
});

test("C1 Not sure yet can be a fit", () => {
  assert.equal(
    fit({ budget: "salary", start: "1-3-months", role: "not-sure" }),
    "fit",
  );
  assert.equal(
    fit({ budget: "none", start: "1-3-months", role: "not-sure" }),
    "not_a_fit",
  );
});
