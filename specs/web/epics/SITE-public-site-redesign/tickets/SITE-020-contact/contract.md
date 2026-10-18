---
id: SITE-20
size: small
objective: "anyone at /contact writes Taylor a note and is told where the reply will go; the note reaches Taylor's inbox with the sender as reply-to, is never stored, and nothing is ever sent to the address typed"
slice_type: "a public POST that emails personal data through Resend; risks a note relayed to the typed address, a bot filling the inbox, personal data in GA or a URL, and a lost note"
non_negotiables:
  - "Notes go through Resend to INTAKE_NOTIFY_EMAIL only, reply-to the sender, never stored; the submitted address is never a to, cc or bcc (D-SITE-224)"
  - "A filled honeypot or a submit under two seconds after render answers as sent and sends nothing; message capped at 5000, name at 100, email at 254 (data-contract.md)"
  - "Client and server share lib/validators/note.ts; the server re-validates every submit; no address or message in a log line"
  - "contact_note_sent, surface services and from contact only, fires on the server's confirmation, never on click; no name, email or message in any event or any URL (D-SITE-176, 226)"
  - "Sending keeps every answer and the button at 176px or more, Sending…, aria-busy, never disabled; a second press sends nothing; a failed send keeps every answer and offers the address as its own mailto (D-SITE-169, 170)"
  - "Or email hello@tayloraucoin.com sits beside the button whenever the form shows; sent keeps the header call button and offers Prefer a call? through BookCallLink, placement contact_sent (D-SITE-202)"
devs_call: "NoteForm's props beyond from and the sent variant, the forms kit's new pieces' names, the action's state shape, the recorder's shape, and test file names"
waiver: "One surface, Work with me's /contact view, split for the token cap: services.md holds the states, services-build.md layout and access, services-words.md the strings, services-criteria.md the criteria; decisions-14.md holds the ruling on where notes go"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-words.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-criteria.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-165"
  - "D-SITE-169"
  - "D-SITE-170"
  - "D-SITE-176"
  - "D-SITE-201"
  - "D-SITE-202"
  - "D-SITE-224"
  - "D-SITE-226"
  - "D-SITE-227"
  - "C-SITE-services-15"
  - "C-SITE-services-16"
  - "C-SITE-services-17"
  - "C-SITE-services-19"
  - "C-SITE-services-20"
  - "C-SITE-services-21"
  - "C-SITE-services-22"
  - "C-SITE-services-23"
  - "C-SITE-services-25"
  - "C-SITE-services-26"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q3
reviewers: [ warden ]
focus:
  - "The send and the action: Taylor's ops address is the only recipient, reply-to the sender; no address or message in a URL, a log line or GA; the bot rules and caps hold before any send (warden, Q3)"
operator_review: false
planned_paths:
  - "app/contact/**"
  - "components/contact/**"
  - "components/forms/**"
  - "lib/validators/note.ts"
  - "server/services/notes.ts"
  - "content/contact.ts"
  - "tests/**"
depends_on: [ SITE-4, SITE-5 ]
out_of_scope:
  - "The note on /book's not-a-fit view, its prefill, hidden screening answers and sent-from-not-a-fit: SITE-23 book-not-a-fit, which reuses NoteForm with from not_a_fit"
  - "The header and footer: proven by SITE-4 and SITE-5; cite, never re-prove"
  - "The /privacy line that notes are emailed through Resend: Taylor's before launch (D-SITE-229)"
criteria:
  - id: C1
    statement: "The note validator accepts a message and email with name blank, trims, and rejects an empty message, a malformed email, a message over 5000, a name over 100, an email over 254, and a from outside contact and not_a_fit"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "sendNote with a recording transport sends one message whose to is the injected ops address, whose reply-to is the sender, and whose body holds the message, name and from (and screening when given); the submitted address appears in no to, cc or bcc; a transport that throws returns a failure"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The action, sender injected: a valid submit calls it once and returns sent with the email; a filled honeypot or a render time under two seconds returns sent and never calls it; invalid input returns field errors without calling it; a failed send returns error"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "/contact shows the h1 Contact, the intro, Message, Name and Email with visible labels (Name autocomplete name; Email type email, autocomplete email), Send a note, and Or email hello@tayloraucoin.com as a mailto beside it in every state with the form; the header shows its call button (C-SITE-services-26)"
    evidence: test
    command: "yarn test:e2e tests/e2e/contact.spec.ts"
  - id: C5
    statement: "Sending with the message empty and the email malformed shows each error line, aria-invalid and aria-describedby on both fields, focus on Message, and no request to the action leaves the page"
    evidence: test
    command: "yarn test:e2e tests/e2e/contact.spec.ts"
  - id: C6
    statement: "A valid note sent past two seconds holds the button at Sending… with aria-busy, no disabled attribute and a width of 176px or more, a polite region saying Sending…; a second press makes no second action request (C-SITE-services-15)"
    evidence: test
    command: "yarn test:e2e tests/e2e/contact.spec.ts"
  - id: C7
    statement: "With Name blank, the sent view replaces the intro and form with Sent. I'll reply to {email} within one business day., focused, the document title changed, Prefer a call? with a Book a 30-minute call link to /book, and the header call button still shown; the URL stays /contact (C-SITE-services-17, 19, 25)"
    evidence: test
    command: "yarn test:e2e tests/e2e/contact.spec.ts"
  - id: C8
    statement: "Sending offline shows the error line under the button as role alert, every answer kept, hello@tayloraucoin.com as its own mailto; back online, Send a note reaches sent (C-SITE-services-16)"
    evidence: test
    command: "yarn test:e2e tests/e2e/contact.spec.ts"
  - id: C9
    statement: "With consent granted, a sent note sends one contact_note_sent collect with surface services and from contact only; Prefer a call? sends one book_call_click, surface services, placement contact_sent; with sentinel name, email and message, no Google request and no URL on this origin holds a sentinel; with consent declined or GPC set no request reaches a Google host (C-SITE-services-22, 23)"
    evidence: test
    command: "yarn test:e2e tests/e2e/contact.spec.ts"
  - id: C10
    statement: "At 390 the button is at least 44px and the inline links at least 24px tall, with no horizontal scroll; axe reports no serious or critical violation in default, invalid, error and sent (C-SITE-services-21)"
    evidence: test
    command: "yarn test:e2e tests/e2e/contact.spec.ts"
  - id: C11
    statement: "contact-default, contact-submit and contact-sent, opened by ?state=, match captures/services/ at 390 and 1440, dark and light (C-SITE-services-20)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-020-contact/evidence/states/"
  - id: review:warden
    statement: "Warden reviews the action, the validator and the send"
    evidence: manual
    reason: "A fresh-context specialist review, recorded by yarn review:run warden"
---

# Contract — SITE-20 contact

## Build notes

Wave 3, after SITE-4 and SITE-5, not home (`pillar-open` gates home only). SITE-21 to 23 follow and reuse what this adds.

- **Approach:** `app/contact/page.tsx` (server) renders the H1 and a client `NoteForm` (`components/contact/`) on `useActionState`, posting to `send-note.ts` (`"use server"`): parse with the shared validator, apply the bot rules, then `sendNote(note)`. `NoteForm` owns the intro, hairline and form, so sent can replace the intro; it takes `from` and a sent variant (with or without the call offer) for /book's not-a-fit. The forms kit gains the textarea field, focus-first-invalid, and the honeypot and render-time fields, Whichever of SITE-13 and SITE-20 builds first creates `components/forms/`, the other reuses it; never both at once.
- **Decisions that apply:** D-SITE-224: notes emailed through Resend, reply-to the sender, not stored; honeypot, minimum fill time, field caps. D-SITE-202, 169 and 170: as the non-negotiables. D-SITE-201: Name optional. D-SITE-226: `contact_note_sent` {surface, from}. D-SITE-227: Q3 with Warden.
- **Interfaces:** `noteSchema` in `lib/validators/note.ts` (data-contract.md's Note); `sendNote(note, transport?)` in `server/services/notes.ts`, its own Resend call (as `notifyOps`, plus `replyTo`), returning success or failure; `NoteForm({ from, sentVariant, prefill?, screening? })`; `contact-default`, `contact-submit`, `contact-sent` in `/contact`'s States list, seeded from `app/contact/_fixtures.ts` with a synthetic `@example.test` sender.
- **Per path:** `content/contact.ts`: the strings. `tests/unit/note*.test.ts`, `tests/e2e/contact.spec.ts`.
- **Words:** services-words.md, `/contact`, as written; `[draft]` marks stay; tests match labels with or without them.
- **Gotchas:** the transport is picked once from `resolveAppTier()`: `local` takes an in-memory recorder that sends nothing, staging and production Resend; never decide by `NODE_ENV` (`start:agent` runs production mode). Env goes through `lib/env.ts`' `requireEnv`; `env.ts` itself is untouched. An action fails offline by throwing in the client: catch it and set error, keeping the answers (SITE-13). Count `Next-Action` POSTs. The event fires when state turns sent, never on click; read collect requests with the fake-ID build and SITE-1's opt-in, as SITE-4. Capture: `yarn capture --route /contact --keys contact-default,contact-submit,contact-sent --out <C11's path>`.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a recipient taken from the form.
