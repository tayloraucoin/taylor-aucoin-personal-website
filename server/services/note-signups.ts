import "server-only";
import { getDb } from "@/db/client";
import { noteSignups } from "@/db/schema";

export type NoteSignupRow = {
  email: string;
  consentVersion: string;
  source: "home";
};

/**
 * Stores one signup (D-SITE-223): a single insert that does nothing when the
 * address is listed, so a new and a listed address run the same query and
 * an unsubscribed row stays unsubscribed. Sends nothing. The database is
 * injectable for the local-tier test (C3).
 */
export async function addNoteSignup(
  row: NoteSignupRow,
  db: Pick<ReturnType<typeof getDb>, "insert"> = getDb(),
): Promise<void> {
  await db
    .insert(noteSignups)
    .values(row)
    .onConflictDoNothing({ target: noteSignups.email });
}
