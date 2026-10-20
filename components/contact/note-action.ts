import { looksLikeBot } from "@/components/forms/bot-check";
import {
  NOTE_LIMITS,
  noteFieldErrors,
  noteSchema,
  type Note,
  type NoteFieldErrors,
} from "@/lib/validators/note";

/** What the note action answers; the form renders each as a view. */
export type NoteState =
  | { status: "idle" }
  | { status: "invalid"; fields: NoteFieldErrors }
  | { status: "sent"; email: string }
  | { status: "error" };

export type NoteSender = (note: Note) => Promise<{ ok: boolean }>;

function text(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

/** The form's fields as the schema reads them; screening rides unseen. */
export function readNoteForm(formData: FormData) {
  const budget = text(formData, "screening_budget");
  const start = text(formData, "screening_start");
  const role = text(formData, "screening_role");
  return {
    message: text(formData, "message") ?? "",
    name: text(formData, "name"),
    email: text(formData, "email") ?? "",
    from: text(formData, "from"),
    ...(budget || start || role ? { screening: { budget, start, role } } : {}),
  };
}

/**
 * The note action's whole rule, with the sender injected so a test can see
 * what it was handed: the bot rules first (a bot is told it was sent and
 * nothing goes), then the server's own validation, then one send.
 */
export async function handleNote(
  formData: FormData,
  send: NoteSender,
): Promise<NoteState> {
  if (looksLikeBot(formData)) {
    const email = (text(formData, "email") ?? "")
      .trim()
      .slice(0, NOTE_LIMITS.email);
    return { status: "sent", email };
  }

  const parsed = noteSchema.safeParse(readNoteForm(formData));
  if (!parsed.success) {
    return { status: "invalid", fields: noteFieldErrors(parsed.error) };
  }

  const result = await send(parsed.data);
  return result.ok
    ? { status: "sent", email: parsed.data.email }
    : { status: "error" };
}
