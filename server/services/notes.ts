import "server-only";
import { Resend } from "resend";
import { resolveAppTier } from "@/lib/config/env/resolve-tier-env";
import { readEnv, requireEnv } from "@/lib/env";
import type { Note } from "@/lib/validators/note";

/**
 * Notes are emailed to Taylor and never stored (D-SITE-224, ruling C3).
 *
 * The one recipient is the ops address (`INTAKE_NOTIFY_EMAIL`, as
 * `notifyOps`). The sender's address goes in `replyTo` and nowhere else:
 * nothing is ever sent to an address someone typed, or the form relays mail
 * to strangers. No line logged here holds an address or a message.
 */

export type OutgoingNote = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

/** Hands one message on; throws when it did not go. */
export type NoteTransport = (message: OutgoingNote) => Promise<void>;

export type NoteAddresses = { from: string; to: string };

export type SendNoteResult = { ok: true } | { ok: false };

/** A transport that keeps what it was handed and sends nothing. */
export function createNoteRecorder(): {
  transport: NoteTransport;
  sent: OutgoingNote[];
} {
  const sent: OutgoingNote[] = [];
  return {
    sent,
    transport: async (message) => {
      sent.push(message);
    },
  };
}

function resendTransport(): NoteTransport {
  const resend = new Resend(requireEnv("RESEND_API_KEY"));
  return async (message) => {
    // The SDK answers a refused send with `error` rather than throwing.
    const { error } = await resend.emails.send(message);
    if (error) throw new Error(error.name);
  };
}

function siteSender(): string {
  // Resend requires a verified domain; the site's own is the honest sender.
  return `Taylor Aucoin <hello@${new URL(requireEnv("NEXT_PUBLIC_SITE_URL")).hostname.replace(/^www\./, "")}>`;
}

let picked: {
  transport: NoteTransport;
  addresses: () => NoteAddresses;
} | null = null;

/**
 * Picked once from the tier, never from `NODE_ENV` (`start:agent` runs in
 * production mode): a laptop gets the recorder and sends nothing; staging
 * and production send through Resend.
 */
function defaultSetup() {
  picked ??=
    resolveAppTier() === "local"
      ? {
          transport: createNoteRecorder().transport,
          addresses: () => ({
            from: "Taylor Aucoin <hello@tayloraucoin.com>",
            to: readEnv("INTAKE_NOTIFY_EMAIL") ?? "ops@local.invalid",
          }),
        }
      : {
          transport: resendTransport(),
          addresses: () => ({
            from: siteSender(),
            to: requireEnv("INTAKE_NOTIFY_EMAIL"),
          }),
        };
  return picked;
}

const FROM_LABEL: Record<Note["from"], string> = {
  contact: "/contact",
  not_a_fit: "/book (not a fit)",
};

/** The message Taylor reads: the note first, then who and where from. */
export function composeNote(
  note: Note,
  addresses: NoteAddresses,
): OutgoingNote {
  const lines = [
    note.message,
    "",
    "—",
    `Name: ${note.name ?? "(not given)"}`,
    `Reply to: ${note.email}`,
    `From: ${FROM_LABEL[note.from]}`,
  ];
  if (note.screening) {
    lines.push(
      `Budget: ${note.screening.budget}`,
      `Start: ${note.screening.start}`,
      `Role: ${note.screening.role}`,
    );
  }
  return {
    from: addresses.from,
    to: addresses.to,
    replyTo: note.email,
    subject: `A note from ${FROM_LABEL[note.from]}`,
    text: lines.join("\n"),
  };
}

/**
 * Sends one validated note to Taylor. A failed send is a result, not a
 * throw, so the form can keep the answers and offer the address instead.
 */
export async function sendNote(
  note: Note,
  transport?: NoteTransport,
  addresses?: NoteAddresses,
): Promise<SendNoteResult> {
  try {
    const setup = transport && addresses ? null : defaultSetup();
    const message = composeNote(note, addresses ?? setup!.addresses());
    await (transport ?? setup!.transport)(message);
    return { ok: true };
  } catch (error) {
    console.error(
      "[notes] send failed",
      error instanceof Error ? error.name : "unknown error",
    );
    return { ok: false };
  }
}
