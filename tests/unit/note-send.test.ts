import assert from "node:assert/strict";
import { test } from "node:test";
import type { Note } from "@/lib/validators/note";
import { createNoteRecorder, sendNote } from "@/server/services/notes";

const OPS = {
  from: "Taylor Aucoin <hello@tayloraucoin.com>",
  to: "ops@example.test",
};
const SENDER = "visitor@example.test";

const note: Note = {
  message: "We need a booking flow rebuilt.",
  name: "Sam",
  email: SENDER,
  from: "contact",
};

// ---------------------------------------------------------------- C2

test("C2 sends one message to the ops address, reply-to the sender", async () => {
  const recorder = createNoteRecorder();
  const result = await sendNote(note, recorder.transport, OPS);

  assert.deepEqual(result, { ok: true });
  assert.equal(recorder.sent.length, 1);
  const [sent] = recorder.sent;
  assert.equal(sent.to, OPS.to);
  assert.equal(sent.from, OPS.from);
  assert.equal(sent.replyTo, SENDER);
  assert.match(sent.text, /We need a booking flow rebuilt\./);
  assert.match(sent.text, /Sam/);
  assert.match(sent.text, /\/contact/);
});

test("C2 the submitted address is never a to, cc or bcc", async () => {
  const recorder = createNoteRecorder();
  await sendNote(note, recorder.transport, OPS);
  const sent = recorder.sent[0] as Record<string, unknown>;
  for (const key of ["to", "cc", "bcc"]) {
    const value = sent[key];
    const list = Array.isArray(value) ? value : [value];
    assert.ok(!list.some((v) => String(v).includes(SENDER)), key);
  }
  assert.deepEqual(Object.keys(sent).sort(), [
    "from",
    "replyTo",
    "subject",
    "text",
    "to",
  ]);
});

test("C2 the body carries from and screening when given", async () => {
  const recorder = createNoteRecorder();
  await sendNote(
    {
      ...note,
      name: undefined,
      from: "not_a_fit",
      screening: { budget: "under-15k", start: "later", role: "not-sure" },
    },
    recorder.transport,
    OPS,
  );
  const { text } = recorder.sent[0];
  assert.match(text, /not a fit/);
  assert.match(text, /under-15k/);
  assert.match(text, /later/);
  assert.match(text, /not-sure/);
});

test("C2 a transport that throws returns a failure and logs no address or message", async () => {
  const logged: unknown[][] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => logged.push(args);
  try {
    const result = await sendNote(
      note,
      async () => {
        throw new Error(`refused ${SENDER} ${note.message}`);
      },
      OPS,
    );
    assert.deepEqual(result, { ok: false });
  } finally {
    console.error = original;
  }
  const line = JSON.stringify(logged);
  assert.ok(!line.includes(SENDER));
  assert.ok(!line.includes(note.message));
});
