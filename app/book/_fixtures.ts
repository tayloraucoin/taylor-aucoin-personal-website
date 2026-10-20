import type { BookInput } from "@/lib/validators/book";
import type { ScreeningSeed } from "./_components/ScreeningForm";

/**
 * `/book`'s States owned by SITE-21 (services.md), seeded for `?state=`
 * outside production only (`readPageState`). Synthetic: an `@example.test`
 * sender, never the canvas's names.
 */
export const BOOK_STATES = [
  "screening-form",
  "screening-submit",
  "screening-fit",
  "screening-not-a-fit",
  "screening-not-a-fit-website",
  "contact-sent-from-not-a-fit",
] as const;

export type BookState = (typeof BOOK_STATES)[number];

const NOT_A_FIT: BookInput = {
  building: "A booking app for my studio's members, nothing built yet.",
  budget: "none",
  start: "later",
  role: "not-sure",
  name: "Robin Example",
  email: "robin@example.test",
};

export const bookFixtures: Record<BookState, ScreeningSeed | undefined> = {
  "screening-form": undefined,
  // The submit crop's first panel: budget unanswered, email malformed.
  // Sending and the send error are reached by submitting (the e2e spec).
  "screening-submit": {
    state: { status: "invalid", fields: { budget: true, email: true } },
    values: {
      building: "A scheduling tool for a six-person clinic.",
      start: "1-3-months",
      role: "product-engineer",
      email: "robin@example",
    },
  },
  "screening-fit": {
    state: {
      status: "outcome",
      outcome: "fit",
      firstName: "Robin",
      answers: {
        building: "A scheduling tool for a six-person clinic.",
        budget: "15k-75k",
        start: "1-3-months",
        role: "product-engineer",
        name: "Robin Example",
        email: "robin@example.test",
      },
    },
  },
  "screening-not-a-fit": {
    state: {
      status: "outcome",
      outcome: "not_a_fit",
      firstName: "Robin",
      answers: NOT_A_FIT,
    },
  },
  "screening-not-a-fit-website": {
    state: {
      status: "outcome",
      outcome: "website",
      firstName: "Robin",
      answers: { ...NOT_A_FIT, role: "website-or-brand" },
    },
  },
  "contact-sent-from-not-a-fit": {
    state: {
      status: "outcome",
      outcome: "not_a_fit",
      firstName: "Robin",
      answers: NOT_A_FIT,
    },
    note: { state: { status: "sent", email: NOT_A_FIT.email } },
  },
};
