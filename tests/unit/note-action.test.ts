import assert from "node:assert/strict";
import { test } from "node:test";
import { handleNote } from "@/components/contact/note-action";
import { ELAPSED_NAME, HONEYPOT_NAME } from "@/components/forms/bot-check";
import type { Note } from "@/lib/validators/note";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const VALID = {
  message: "Could you look at our booking flow?",
  name: "",
  email: "visitor@example.test",
  from: "contact",
  [HONEYPOT_NAME]: "",
  [ELAPSED_NAME]: "4200",
};

function spy(ok = true) {
  const calls: Note[] = [];
  return {
    calls,
    send: async (note: Note) => {
      calls.push(note);
      return { ok };
    },
  };
}

// ---------------------------------------------------------------- C3

test("C3 a valid submit calls the sender once and returns sent with the email", async () => {
  const s = spy();
  const state = await handleNote(form(VALID), s.send);
  assert.deepEqual(state, { status: "sent", email: "visitor@example.test" });
  assert.equal(s.calls.length, 1);
  assert.equal(s.calls[0].name, undefined);
  assert.equal(s.calls[0].from, "contact");
});

test("C3 a filled honeypot returns sent and never calls the sender", async () => {
  const s = spy();
  const state = await handleNote(
    form({ ...VALID, [HONEYPOT_NAME]: "https://spam.example" }),
    s.send,
  );
  assert.equal(state.status, "sent");
  assert.equal(s.calls.length, 0);
});

for (const elapsed of ["1999", "0", "", "abc"]) {
  test(`C3 a fill time of "${elapsed}" returns sent and never calls the sender`, async () => {
    const s = spy();
    const state = await handleNote(
      form({ ...VALID, [ELAPSED_NAME]: elapsed }),
      s.send,
    );
    assert.equal(state.status, "sent");
    assert.equal(s.calls.length, 0);
  });
}

test("C3 a missing fill time is treated as a bot", async () => {
  const s = spy();
  const data = form(VALID);
  data.delete(ELAPSED_NAME);
  const state = await handleNote(data, s.send);
  assert.equal(state.status, "sent");
  assert.equal(s.calls.length, 0);
});

test("C3 invalid input returns field errors without calling the sender", async () => {
  const s = spy();
  const state = await handleNote(
    form({ ...VALID, message: " ", email: "sam@example" }),
    s.send,
  );
  assert.deepEqual(state, {
    status: "invalid",
    fields: { message: true, email: true },
  });
  assert.equal(s.calls.length, 0);
});

test("C3 a from outside the set is refused without a send", async () => {
  const s = spy();
  const state = await handleNote(form({ ...VALID, from: "home" }), s.send);
  assert.equal(state.status, "invalid");
  assert.equal(s.calls.length, 0);
});

test("C3 a failed send returns error", async () => {
  const s = spy(false);
  const state = await handleNote(form(VALID), s.send);
  assert.deepEqual(state, { status: "error" });
  assert.equal(s.calls.length, 1);
});
