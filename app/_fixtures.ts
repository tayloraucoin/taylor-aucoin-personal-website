import type { NotesSeed } from "@/app/_components/NotesForm";

/**
 * Home's notes States (home.md), seeded for `?state=` outside production
 * only (`readPageState`). Synthetic: the address is `@example.test`, which
 * can never be real.
 */
export const NOTES_STATES = [
  "notes-sending",
  "notes-done",
  "notes-error",
  "notes-invalid",
  "notes-already",
] as const;

export type NotesState = (typeof NOTES_STATES)[number];

const ADDRESS = "sam@example.test";

export const notesFixtures: Record<NotesState, NotesSeed> = {
  "notes-sending": { state: { status: "idle" }, email: ADDRESS, busy: true },
  "notes-done": { state: { status: "done", email: ADDRESS } },
  "notes-error": { state: { status: "error" }, email: ADDRESS },
  "notes-invalid": { state: { status: "invalid" }, email: "sam@example" },
  // A listed address answers as a new one (D-SITE-223).
  "notes-already": { state: { status: "done", email: ADDRESS } },
};
