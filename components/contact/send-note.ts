"use server";

import { sendNote } from "@/server/services/notes";
import { handleNote, type NoteState } from "./note-action";

/** The note form's server action: `handleNote` with the real sender. */
export async function sendNoteAction(
  _previous: NoteState,
  formData: FormData,
): Promise<NoteState> {
  return handleNote(formData, (note) => sendNote(note));
}
