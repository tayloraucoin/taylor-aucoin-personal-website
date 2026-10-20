---
id: SITE-23
size: small
objective: "a hirer whose screening is not a fit, or who wants a website or brand, writes Taylor a note right there on /book, already holding what they're building, and is told where the reply will go; no call is offered anywhere on the way"
slice_type: "a public POST that emails personal data plus hidden screening answers through Resend; risks a call offered after it was declined, answers in a URL or GA, and a note that loses its screening or its text"
non_negotiables:
  - "The view reuses SITE-20's NoteForm with from not_a_fit and its sent variant without the call offer; the note goes through send-note.ts and sendNote unchanged in recipient, reply-to and bot rules (D-SITE-224); its render-time field carries the screening form's render time, so a hirer sending at once is never dropped as a bot"
  - "The textarea is prefilled with the What are you building? answer only; Name and Email are kept; budget, start and role ride in hidden fields, unseen, and reach only the note's body (D-SITE-201)"
  - "Not-a-fit, not-a-fit-website and sent-from-not-a-fit offer no call anywhere: no Book a 30-minute call, no header call button, no link to Cal.com or /book/handoff (D-SITE-167, 202)"
  - "A note sent from not-a-fit stays on /book under Let's talk first: the sent line replaces the intro and form, with no Prefer a call? (D-SITE-169, 202)"
  - "contact_note_sent carries surface services and from not_a_fit only, on the server's confirmation; no name, email, typed text, budget, start or role in any event or URL (D-SITE-176, 226)"
  - "Role website-or-brand adds Need a website or a brand? with See how a coded site works to /websites between the intro and the hairline, whatever the budget and start"
devs_call: "How the not-a-fit view hands NoteForm the intro and the website line (a slot or a prop), the hidden fields' names, and test file names"
waiver: "One surface, Work with me's /book not-a-fit view, split for the token cap: services.md holds the states, services-build.md layout and behaviour, services-words.md the strings, services-criteria.md the criteria; data-contract.md holds the note contract and decisions-14.md the QA ruling"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-words.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-criteria.md"
  - "specs/web/epics/SITE-public-site-redesign/technical/data-contract.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-167"
  - "D-SITE-169"
  - "D-SITE-176"
  - "D-SITE-201"
  - "D-SITE-202"
  - "D-SITE-224"
  - "D-SITE-226"
  - "D-SITE-227"
  - "C-SITE-services-13"
  - "C-SITE-services-14"
  - "C-SITE-services-15"
  - "C-SITE-services-16"
  - "C-SITE-services-18"
  - "C-SITE-services-19"
  - "C-SITE-services-20"
  - "C-SITE-services-21"
  - "C-SITE-services-22"
  - "C-SITE-services-23"
  - "C-SITE-services-25"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q3
reviewers: [ warden ]
focus:
  - "The not-a-fit note: the screening answers reach only Taylor's ops address in the body, never a URL, a log line or GA, and a forged screening changes nothing but the body (warden, Q3)"
operator_review: false
planned_paths:
  - "app/book/_components/**"
  - "app/book/_fixtures.ts"
  - "components/contact/**"
  - "lib/validators/note.ts"
  - "content/book.ts"
  - "tests/**"
depends_on: [ SITE-20, SITE-21 ]
out_of_scope:
  - "The fit rule, the screening form and the fit view: SITE-21; the Cal.com hand-off: SITE-22"
  - "NoteForm's /contact behaviour, sendNote's recipient and the bot rules: proven by SITE-20; cite, never re-prove"
  - "/websites itself: wave 4; until it lands the line resolves to today's chooser (verdict.md)"
criteria:
  - id: C1
    statement: "The note validator accepts from not_a_fit with screening whose budget, start and role are the book validator's keys, and rejects an unknown key in any of the three"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The note action, sender injected, given a valid not_a_fit note with screening, calls it once with from not_a_fit and the three answers, and returns sent with the email; with the screening form's render time, a send one second after the not-a-fit view appears still calls it"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "A not-a-fit answer set shows Let's talk first, focused, the title changed; Your note holds exactly the building answer; Name and Email hold the answers given; budget, start and role are hidden inputs with no visible text; no Book a 30-minute call, header call button or link to Cal.com or /book/handoff is on the page; with Name blank the greeting drops , {first name} (C-SITE-services-13, 19, 25)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-not-a-fit.spec.ts"
  - id: C4
    statement: "Role A website or brand with a fit budget and start shows the same view plus Need a website or a brand? and See how a coded site works to /websites, between the intro and the note; a non-website not-a-fit set shows no such line (C-SITE-services-14)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-not-a-fit.spec.ts"
  - id: C5
    statement: "Emptying the note or malforming the email and sending shows that field's error line, focus on it and no action request; sending the note holds Send a note at Sending… with aria-busy, not disabled, at 176px or more; sent offline, the error line shows under the button as role alert with the note, Name and Email kept and the address as a mailto, and back online it reaches sent (C-SITE-services-15, 16)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-not-a-fit.spec.ts"
  - id: C6
    statement: "Sent from not-a-fit, the URL stays /book, Let's talk first stays, the sent line naming the email given replaces the intro and form, focused, the title changed, with no Prefer a call?, no call button anywhere and no header call button (C-SITE-services-18, 19)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-not-a-fit.spec.ts"
  - id: C7
    statement: "With consent granted, a sent note sends one contact_note_sent collect with surface services and from not_a_fit only; with sentinel name, email, building and note text, no Google request and no URL on this origin holds a sentinel or a budget, start or role key; with consent declined or GPC set no request reaches a Google host (C-SITE-services-22, 23)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-not-a-fit.spec.ts"
  - id: C8
    statement: "At 390 the button is at least 44px and inline links 24px tall, with no horizontal scroll; axe reports no serious or critical violation in not-a-fit, not-a-fit-website, error and sent-from-not-a-fit (C-SITE-services-21)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-not-a-fit.spec.ts"
  - id: C9
    statement: "screening-not-a-fit, screening-not-a-fit-website and contact-sent-from-not-a-fit, opened on /book by ?state=, match captures/services/ at 390 and 1440, dark and light (C-SITE-services-20)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-023-book-not-a-fit/evidence/states/"
  - id: review:warden
    statement: "Warden reviews the not-a-fit view's fields, the validator change and the action's path"
    evidence: manual
    reason: "A fresh-context specialist review, recorded by yarn review:run warden"
---

# Contract — SITE-23 book-not-a-fit

## Build notes

Wave 3, after SITE-20 (`NoteForm({ from, sentVariant, prefill?, screening? })`, `send-note.ts`, `sendNote`, the forms kit) and SITE-21 (the not-a-fit and website views' H1 and intro, the action's returned answers). Independent of SITE-22.

- **Approach:** under SITE-21's not-a-fit and website views, render `NoteForm` with `from="not_a_fit"`, the call-free sent variant, `prefill={{ message: building, name, email }}` and `screening={{ budget, start, role }}` as hidden inputs. Move the view's intro into NoteForm's intro so sent replaces it, as on `/contact`; the H1 stays. The website line sits between the intro and the hairline.
- **Decisions that apply:** D-SITE-201: prefill with the building answer only, chip answers unseen, Name and Email kept; greeting drops ", {first name}" when blank. D-SITE-202, 167, 169: as the non-negotiables. D-SITE-224: emailed, not stored. D-SITE-226: `contact_note_sent` {surface, from}. D-SITE-227: Q3 with Warden.
- **Interfaces:** `screening-not-a-fit`, `screening-not-a-fit-website`, `contact-sent-from-not-a-fit` added to `/book`'s States list from `app/book/_fixtures.ts`, synthetic (`@example.test`, never the canvas's Sam). The link uses `siteRoutes.websites`.
- **Per path:** `content/book.ts`: the not-a-fit, Your note and website-line strings. `lib/validators/note.ts`: screening keys from `book.ts`' enums, if SITE-20 left them loose. `tests/unit/note-not-a-fit*.test.ts`, `tests/e2e/book-not-a-fit.spec.ts`.
- **Words:** services-words.md, `/book`'s Not a fit and Website line, and `/contact`'s Sent line, as written; `[draft]` marks stay; tests match with or without them. The note's error line for an emptied textarea is `/contact`'s.
- **Gotchas:** the note is ready on arrival: NoteForm takes the screening form's render time for its render-time field (a prop SITE-20's `/contact` leaves unset), or the two-second rule drops a quick hirer's note as sent. The screening reaches the client only from the action's returned state, never from a URL. Count `Next-Action` POSTs. A server action fails offline by throwing in the client (SITE-13). The event fires in the leaf when state turns sent, never on click; read real collect requests with the fake-ID build and SITE-1's opt-in, as SITE-4. Capture: `yarn capture --route /book --keys screening-not-a-fit,screening-not-a-fit-website,contact-sent-from-not-a-fit --out <C9's path>`.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a call link left on the declined view or screening answers shown or put in a URL.
