import assert from "node:assert/strict";
import { test } from "node:test";
import { noteSchema } from "@/lib/validators/note";

const valid = {
  message: "Hello there",
  email: "sam@example.test",
  from: "contact",
};

// ---------------------------------------------------------------- C1

test("C1 accepts a message and email with name blank, and trims", () => {
  const parsed = noteSchema.parse({
    ...valid,
    message: "  Hello there \n",
    email: " sam@example.test ",
    name: "   ",
  });
  assert.equal(parsed.message, "Hello there");
  assert.equal(parsed.email, "sam@example.test");
  assert.equal(parsed.name, undefined);
});

test("C1 keeps a given name, trimmed", () => {
  assert.equal(noteSchema.parse({ ...valid, name: " Sam " }).name, "Sam");
});

for (const [why, input] of [
  ["an empty message", { ...valid, message: "  " }],
  ["a malformed email", { ...valid, email: "sam@example" }],
  ["a missing email", { ...valid, email: "" }],
  ["a message over 5000", { ...valid, message: "a".repeat(5001) }],
  ["a name over 100", { ...valid, name: "a".repeat(101) }],
  ["an email over 254", { ...valid, email: `${"a".repeat(250)}@x.test` }],
  ["a from outside contact and not_a_fit", { ...valid, from: "home" }],
  ["no from", { message: "Hi", email: "sam@example.test" }],
] as const) {
  test(`C1 rejects ${why}`, () => {
    assert.equal(noteSchema.safeParse(input).success, false);
  });
}

test("C1 accepts the caps exactly, and from not_a_fit with screening", () => {
  const atCap = {
    message: "a".repeat(5000),
    name: "a".repeat(100),
    email: `${"a".repeat(64)}@${"b".repeat(180)}.test`,
    from: "not_a_fit",
    screening: { budget: "under-15k", start: "later", role: "not-sure" },
  };
  assert.ok(atCap.email.length <= 254);
  assert.equal(noteSchema.safeParse(atCap).success, true);
});
