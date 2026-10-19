import assert from "node:assert/strict";
import { test } from "node:test";
import { bookSchema, firstNameOf } from "@/lib/validators/book";

const valid = {
  building: "A scheduling tool",
  budget: "15k-75k",
  start: "this-month",
  role: "product-engineer",
  email: "robin@example.test",
};

// ---------------------------------------------------------------- C2

test("C2 accepts a full answer set with name blank", () => {
  const parsed = bookSchema.parse({ ...valid, name: "  " });
  assert.equal(parsed.name, undefined);
  assert.equal(parsed.budget, "15k-75k");
});

test("C2 accepts the caps exactly", () => {
  assert.equal(
    bookSchema.safeParse({
      ...valid,
      building: "a".repeat(2000),
      name: "a".repeat(100),
    }).success,
    true,
  );
});

function without(key: keyof typeof valid) {
  const copy: Partial<typeof valid> = { ...valid };
  delete copy[key];
  return copy;
}
const noBudget = without("budget");
const noStart = without("start");
const noRole = without("role");

for (const [why, input] of [
  ["a missing budget", noBudget],
  ["an unknown budget", { ...valid, budget: "lots" }],
  ["a missing start", noStart],
  ["an unknown start", { ...valid, start: "tomorrow" }],
  ["a missing role", noRole],
  ["an unknown role", { ...valid, role: "designer" }],
  ["an empty building answer", { ...valid, building: "   " }],
  [
    "a 2001-character building answer",
    { ...valid, building: "a".repeat(2001) },
  ],
  ["a name over 100", { ...valid, name: "a".repeat(101) }],
  ["a malformed email", { ...valid, email: "robin@example" }],
  ["an email over 254", { ...valid, email: `${"a".repeat(250)}@x.test` }],
] as const) {
  test(`C2 rejects ${why}`, () => {
    assert.equal(bookSchema.safeParse(input).success, false);
  });
}

test("C2 the greeting takes the first word of Name, or nothing", () => {
  assert.equal(firstNameOf("  Robin Example "), "Robin");
  assert.equal(firstNameOf(""), undefined);
  assert.equal(firstNameOf(undefined), undefined);
});
