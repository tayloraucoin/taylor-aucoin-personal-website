import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { getTableColumns, getTableName } from "drizzle-orm";
import { handleNoteSignup } from "@/app/_components/note-signup-action";
import { ELAPSED_NAME, HONEYPOT_NAME } from "@/components/forms/bot-check";
import { NOTES_CONSENT_VERSION } from "@/content/home";
import { noteSignups } from "@/db/schema/note-signups";
import { noteSignupSchema } from "@/lib/validators/note-signup";
import type { NoteSignupRow } from "@/server/services/note-signups";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const VALID = {
  email: " Reader@Example.TEST ",
  [HONEYPOT_NAME]: "",
  [ELAPSED_NAME]: "4200",
};

function spy(fail = false) {
  const calls: NoteSignupRow[] = [];
  return {
    calls,
    store: async (row: NoteSignupRow) => {
      calls.push(row);
      if (fail) throw new Error("db down");
    },
  };
}

// ---------------------------------------------------------------- C1

test("C1 the validator accepts, trims and lower-cases; rejects empty, no ending, too long", () => {
  assert.equal(
    noteSignupSchema.parse({ email: "reader@example.ca" }).email,
    "reader@example.ca",
  );
  assert.equal(
    noteSignupSchema.parse({ email: " Reader@Example.CA " }).email,
    "reader@example.ca",
  );
  assert.equal(noteSignupSchema.safeParse({ email: "" }).success, false);
  assert.equal(
    noteSignupSchema.safeParse({ email: "name@company" }).success,
    false,
  );
  const long = `${"a".repeat(64)}@${"b".repeat(190)}.com`;
  assert.ok(long.length > 254);
  assert.equal(noteSignupSchema.safeParse({ email: long }).success, false);
});

// ---------------------------------------------------------------- C2

test("C2 a valid submit stores once, lower-cased, source home, the consent version", async () => {
  const s = spy();
  const state = await handleNoteSignup(form(VALID), s.store);
  assert.deepEqual(state, { status: "done", email: "reader@example.test" });
  assert.deepEqual(s.calls, [
    {
      email: "reader@example.test",
      source: "home",
      consentVersion: NOTES_CONSENT_VERSION,
    },
  ]);
});

test("C2 a filled honeypot or a fast submit answers done and stores nothing", async () => {
  for (const extra of [{ [HONEYPOT_NAME]: "x" }, { [ELAPSED_NAME]: "900" }]) {
    const s = spy();
    const state = await handleNoteSignup(form({ ...VALID, ...extra }), s.store);
    assert.deepEqual(state, { status: "done", email: "reader@example.test" });
    assert.equal(s.calls.length, 0);
  }
});

test("C2 an invalid address answers invalid without the store", async () => {
  const s = spy();
  const state = await handleNoteSignup(
    form({ ...VALID, email: "name@company" }),
    s.store,
  );
  assert.deepEqual(state, { status: "invalid" });
  assert.equal(s.calls.length, 0);
});

test("C2 a store that throws answers error", async () => {
  const s = spy(true);
  const state = await handleNoteSignup(form(VALID), s.store);
  assert.deepEqual(state, { status: "error" });
});

// ---------------------------------------------------------------- C4

test("C4 the migration creates note_signups with a unique index on email and nothing else", () => {
  const dir = "db/migrations";
  const file = readdirSync(dir).find(
    (name) =>
      name.endsWith(".sql") &&
      readFileSync(join(dir, name), "utf8").includes('"note_signups"'),
  );
  assert.ok(file, "a migration names note_signups");
  const sql = readFileSync(join(dir, file), "utf8");
  assert.match(sql, /CREATE TABLE "note_signups"/);
  assert.match(
    sql,
    /CREATE UNIQUE INDEX "[^"]+" ON "note_signups" USING btree \("email"\)/,
  );
  assert.doesNotMatch(sql, /\bALTER\b|\bDROP\b/i);
  const tables = [...sql.matchAll(/(?:TABLE|ON) "([a-z_]+)"/g)].map(
    (m) => m[1],
  );
  assert.deepEqual([...new Set(tables)], ["note_signups"]);

  assert.equal(getTableName(noteSignups), "note_signups");
  assert.deepEqual(
    Object.values(getTableColumns(noteSignups))
      .map((c) => c.name)
      .sort(),
    [
      "consent_version",
      "created_at",
      "email",
      "id",
      "source",
      "unsubscribed_at",
    ],
  );
});
