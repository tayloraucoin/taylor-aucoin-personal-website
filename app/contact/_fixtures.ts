import type { NoteSeed } from "@/components/contact/NoteForm";

/**
 * `/contact`'s States (services.md), seeded for `?state=` outside
 * production only (`readPageState`). Synthetic: the sender is an
 * `@example.test` address that can never be real.
 */
export const CONTACT_STATES = [
  "contact-default",
  "contact-submit",
  "contact-sent",
] as const;

export type ContactState = (typeof CONTACT_STATES)[number];

export const contactFixtures: Record<ContactState, NoteSeed | undefined> = {
  "contact-default": undefined,
  // The submit crop's first panel: message empty, email malformed. Sending
  // and the send error are reached by submitting (the e2e spec drives both).
  "contact-submit": {
    state: { status: "invalid", fields: { message: true, email: true } },
    values: { email: "sam@example" },
  },
  "contact-sent": {
    state: { status: "sent", email: "sam@example.test" },
  },
};
