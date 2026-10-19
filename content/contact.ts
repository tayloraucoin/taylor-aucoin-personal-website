import { SITE } from "@/lib/config";

/**
 * `/contact`'s strings, as `services-words.md` gives them. Taylor cleared the
 * draft marks on 2026-10-19 (D-SITE-185); nothing here is reworded.
 */
export const contact = {
  title: "Contact",
  h1: "Contact",
  intro:
    "Tell me what you're working on, or just ask. I reply within one business day.",
  fields: {
    message: {
      label: "Message",
      hint: "A sentence or two is plenty.",
    },
    name: { label: "Name" },
    email: { label: "Email", hint: "you@company.com" },
  },
  button: "Send a note",
  sending: "Sending…",
  orEmail: `Or email ${SITE.email}`,
  errors: {
    message: "Add a line or two about what you need.",
    email: "That doesn't look like an email address — check for a typo.",
  },
  sendError: {
    before: "That didn't send — your note is still here. Try again, or email",
    after: "directly.",
  },
  sent: (email: string) =>
    `Sent. I'll reply to ${email} within one business day.`,
  /** [ASSUMPTION] the words file names no sent title; the H1 is reused. */
  sentTitle: `Sent — Contact — ${SITE.name}`,
  preferCall: "Prefer a call?",
} as const;
