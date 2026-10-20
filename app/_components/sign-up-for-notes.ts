"use server";

import { addNoteSignup } from "@/server/services/note-signups";
import { handleNoteSignup, type NoteSignupState } from "./note-signup-action";

/** The notes signup's server action: `handleNoteSignup` with the real store. */
export async function signUpForNotes(
  _previous: NoteSignupState,
  formData: FormData,
): Promise<NoteSignupState> {
  return handleNoteSignup(formData, (row) => addNoteSignup(row));
}
