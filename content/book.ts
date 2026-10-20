import { SITE } from "@/lib/config";
import type { Budget, Role, Start } from "@/lib/validators/book";
import { replyLine } from "./services";

/**
 * `/book`'s strings, as `services-words.md` gives them. Taylor cleared the
 * draft marks on 2026-10-19 (D-SITE-185); the building, start and role error
 * lines were written in that pass, after the budget line's pattern.
 */
/** `, {first name}` when there is one, nothing when Name was blank. */
function greeting(firstName: string | undefined): string {
  return firstName ? `Thanks, ${firstName}.` : "Thanks.";
}

export const book = {
  title: "Before we book",
  h1: "Before we book",
  intro: "Four quick questions, so the 30 minutes are useful to both of us.",
  fields: {
    building: {
      label: "What are you building?",
      hint: "A sentence or two is plenty.",
    },
    budget: { label: "Budget" },
    start: { label: "When do you want to start?" },
    role: { label: "The role you need" },
    name: { label: "Name" },
    email: { label: "Email", hint: "you@company.com" },
  },
  budgets: {
    "under-15k": "Under $15K",
    "15k-75k": "$15K–$75K",
    "over-75k": "Over $75K",
    salary: "A full-time salary",
    none: "No budget yet",
  } satisfies Record<Budget, string>,
  starts: {
    "this-month": "This month",
    "1-3-months": "In 1–3 months",
    later: "Later",
    exploring: "Just exploring",
  } satisfies Record<Start, string>,
  roles: {
    "product-engineer": "Product engineer",
    "product-designer": "Product designer",
    "systems-consultant": "Systems consultant",
    "fractional-cto": "Fractional CTO",
    "zero-to-one": "0→1 build",
    "website-or-brand": "A website or brand",
    "not-sure": "Not sure yet",
  } satisfies Record<Role, string>,
  button: "Continue",
  sending: "Sending…",
  replyLine,
  errors: {
    building: "Add a sentence about what you're building.",
    budget: 'Pick the closest band, or "No budget yet".',
    start: 'Pick a rough start, or "Just exploring".',
    role: 'Pick the closest role, or "Not sure yet".',
    email: "That doesn't look like an email address — check for a typo.",
  },
  sendError: {
    before:
      "That didn't send — your answers are still here. Try again, or email",
    after: "directly.",
  },
  address: SITE.email,
  fit: {
    h1: "Let's book it",
    intro: (firstName?: string) =>
      `${greeting(firstName)} That sounds like a good fit. Pick a time on my calendar.`,
    call: "Book a 30-minute call",
    ratherWrite: "Rather write first?",
    sendNote: "Send a note",
  },
  notAFit: {
    h1: "Let's talk first",
    intro: (firstName?: string) =>
      `${greeting(firstName)} From what you've shared, a short exchange by email will tell us more than a call. Add anything you like and send it.`,
    messageLabel: "Your note",
    /** [ASSUMPTION] the words file names no sent title; the H1 stays. */
    sentTitle: `Sent — Let's talk first — ${SITE.name}`,
  },
  websiteLine: {
    lead: "Need a website or a brand?",
    link: "See how a coded site works",
  },
} as const;

/** The document title for a view: its H1 (services-words.md). */
export function bookTitle(h1: string): string {
  return `${h1} — ${SITE.name}`;
}
