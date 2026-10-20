import assert from "node:assert/strict";
import { test } from "node:test";
import { screen } from "@/app/book/_lib/screen";
import { ELAPSED_NAME, HONEYPOT_NAME } from "@/components/forms/bot-check";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const VALID = {
  building: "A scheduling tool for a clinic",
  budget: "over-75k",
  start: "1-3-months",
  role: "fractional-cto",
  name: "Robin Example",
  email: "robin@example.test",
  [HONEYPOT_NAME]: "",
  [ELAPSED_NAME]: "5000",
};

// ---------------------------------------------------------------- C3

test("C3 a valid fit answer set returns fit with the name's first word", () => {
  const state = screen(form(VALID));
  assert.equal(state.status, "outcome");
  if (state.status !== "outcome") return;
  assert.equal(state.outcome, "fit");
  assert.equal(state.firstName, "Robin");
  assert.equal(state.answers?.email, "robin@example.test");
});

test("C3 the outcome follows the rule: not_a_fit and website", () => {
  const notAFit = screen(form({ ...VALID, budget: "under-15k" }));
  assert.equal(notAFit.status === "outcome" && notAFit.outcome, "not_a_fit");
  const website = screen(form({ ...VALID, role: "website-or-brand" }));
  assert.equal(website.status === "outcome" && website.outcome, "website");
});

test("C3 with Name blank there is no first name", () => {
  const state = screen(form({ ...VALID, name: "" }));
  assert.equal(state.status === "outcome" && state.firstName, undefined);
});

test("C3 invalid input returns field errors and no outcome", () => {
  const data = form({ ...VALID, email: "robin@example" });
  data.delete("budget");
  assert.deepEqual(screen(data), {
    status: "invalid",
    fields: { budget: true, email: true },
  });
});

test("C3 a filled honeypot answers not_a_fit and carries nothing", () => {
  assert.deepEqual(screen(form({ ...VALID, [HONEYPOT_NAME]: "x" })), {
    status: "outcome",
    outcome: "not_a_fit",
  });
});

for (const elapsed of ["1999", "", "nope"]) {
  test(`C3 a render time of "${elapsed}" answers not_a_fit and carries nothing`, () => {
    assert.deepEqual(screen(form({ ...VALID, [ELAPSED_NAME]: elapsed })), {
      status: "outcome",
      outcome: "not_a_fit",
    });
  });
}
