import { looksLikeBot } from "@/components/forms/bot-check";
import { NOTES_CONSENT_VERSION } from "@/content/home";
import {
  NOTE_SIGNUP_MAX,
  noteSignupSchema,
} from "@/lib/validators/note-signup";
import type { NoteSignupRow } from "@/server/services/note-signups";

/**
 * What the signup answers; the form renders each as a view. A listed
 * address answers `done` exactly as a new one (notes-already = notes-done).
 */
export type NoteSignupState =
  | { status: "idle" }
  | { status: "invalid" }
  | { status: "done"; email: string }
  | { status: "error" };

export type NoteSignupStore = (row: NoteSignupRow) => Promise<void>;

/**
 * The signup's whole rule, with the store injected: the bot rules first (a
 * bot is told it signed up and nothing is written), then the server's own
 * validation, then one store call. A failing store is `error`, and nothing
 * about the address is logged.
 */
export async function handleNoteSignup(
  formData: FormData,
  store: NoteSignupStore,
): Promise<NoteSignupState> {
  const raw = formData.get("email");
  const input = typeof raw === "string" ? raw : "";

  if (looksLikeBot(formData)) {
    return {
      status: "done",
      email: input.trim().toLowerCase().slice(0, NOTE_SIGNUP_MAX),
    };
  }

  const parsed = noteSignupSchema.safeParse({ email: input });
  if (!parsed.success) return { status: "invalid" };

  try {
    await store({
      email: parsed.data.email,
      consentVersion: NOTES_CONSENT_VERSION,
      source: "home",
    });
  } catch {
    console.error("note signup: the store failed");
    return { status: "error" };
  }
  return { status: "done", email: parsed.data.email };
}
