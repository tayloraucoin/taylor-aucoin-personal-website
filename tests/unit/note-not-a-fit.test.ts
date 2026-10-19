import assert from "node:assert/strict";
import { test } from "node:test";
import { handleNote } from "@/components/contact/note-action";
import { ELAPSED_NAME, HONEYPOT_NAME } from "@/components/forms/bot-check";
import { BUDGETS, ROLES, STARTS } from "@/lib/validators/book";
import { noteSchema, type Note } from "@/lib/validators/note";

const NOTE = {
  message: "A booking app for my studio's members.",
  email: "robin@example.test",
  from: "not_a_fit",
};
const SCREENING = { budget: "none", start: "later", role: "not-sure" };

// ---------------------------------------------------------------- C1

test("C1 accepts from not_a_fit with every book key in budget, start and role", () => {
  for (const budget of BUDGETS)
    for (const start of STARTS)
      for (const role of ROLES)
        assert.equal(
          noteSchema.safeParse({ ...NOTE, screening: { budget, start, role } })
            .success,
          true,
          `${budget} ${start} ${role}`,
        );
});

for (const [field, value] of [
  ["budget", "under-15K"],
  ["budget", "lots"],
  ["start", "tomorrow"],
  ["role", "ceo"],
  ["role", ""],
] as const) {
  test(`C1 rejects an unknown ${field} key "${value}"`, () => {
    assert.equal(
      noteSchema.safeParse({
        ...NOTE,
        screening: { ...SCREENING, [field]: value },
      }).success,
      false,
    );
  });
}

// ---------------------------------------------------------------- C2

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

function spy() {
  const calls: Note[] = [];
  return {
    calls,
    send: async (note: Note) => {
      calls.push(note);
      return { ok: true };
    },
  };
}

const FIELDS = {
  ...NOTE,
  name: "Robin Example",
  screening_budget: SCREENING.budget,
  screening_start: SCREENING.start,
  screening_role: SCREENING.role,
  [HONEYPOT_NAME]: "",
};

test("C2 a valid not_a_fit note calls the sender once with the three answers", async () => {
  const s = spy();
  const state = await handleNote(
    form({ ...FIELDS, [ELAPSED_NAME]: "9000" }),
    s.send,
  );
  assert.deepEqual(state, { status: "sent", email: NOTE.email });
  assert.equal(s.calls.length, 1);
  assert.equal(s.calls[0].from, "not_a_fit");
  assert.deepEqual(s.calls[0].screening, SCREENING);
});

test("C2 counted from the screening form's render, a send one second into the note still goes", async () => {
  // The screening took eight seconds; the note is sent one second after it
  // appears. NoteForm stamps the time since the screening form rendered.
  const screeningRendered = 0;
  const sentAt = 8_000 + 1_000;
  const s = spy();
  await handleNote(
    form({ ...FIELDS, [ELAPSED_NAME]: String(sentAt - screeningRendered) }),
    s.send,
  );
  assert.equal(s.calls.length, 1);
});

test("C2 a forged screening key is refused and nothing is sent", async () => {
  const s = spy();
  const state = await handleNote(
    form({
      ...FIELDS,
      screening_role: "https://evil.example",
      [ELAPSED_NAME]: "9000",
    }),
    s.send,
  );
  assert.equal(state.status, "invalid");
  assert.equal(s.calls.length, 0);
});
