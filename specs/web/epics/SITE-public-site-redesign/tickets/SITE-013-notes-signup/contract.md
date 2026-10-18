---
id: SITE-13
size: small
objective: "a reader who wants Taylor's notes leaves an address on home and is told plainly it is kept; the address is stored once, lower-cased, with the consent wording it was given under, and nothing is sent to it"
slice_type: "a public POST writing personal data to a new table; risks a stored duplicate, an answer that tells an observer an address is listed, a bot filling the table, and an address reaching a URL or GA"
non_negotiables:
  - "note_signups as D-SITE-223 rules: id, email (unique, lower-cased), created_at, consent_version, source (home), unsubscribed_at; the migration creates that table and alters nothing else"
  - "Nothing is sent on signup: no email, no resend import, no analytics event; the address never enters a URL or a request to Google"
  - "A listed address answers exactly as a new one, on the page and in the action's response (notes-already = notes-done)"
  - "A filled honeypot or a submit under two seconds after render answers as success and writes nothing; the address is capped at 254 characters (data-contract.md)"
  - "Client and server share lib/validators/note-signup.ts; the server re-validates every submit"
  - "Sending keeps the address and the button's width, with aria-busy, never disabled; the message row is a polite live region (D-SITE-169)"
  - "Copy from home-words.md as written; its [draft] lines stay bracketed"
devs_call: "The forms kit's names and props, the action's state shape, and test file names"
waiver: "One surface, home, split for the token cap (home.md states, home-build.md access and criteria, home-words.md strings); data-contract.md holds the signup's contract and decisions-14.md the table's ruling"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-words.md"
  - "specs/web/epics/SITE-public-site-redesign/technical/data-contract.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-9"
  - "D-SITE-169"
  - "D-SITE-223"
  - "D-SITE-227"
  - "C-SITE-home-15"
  - "C-SITE-home-16"
  - "C-SITE-home-17"
  - "C-SITE-home-18"
  - "C-SITE-home-19"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q3
reviewers: [ warden, mason ]
focus:
  - "The action and the store: no path tells a new address from a listed one, by answer, response body or timing; no address in a URL, a log line or GA (warden, Q3)"
  - "The migration: one new table, the unique index on email, nothing else altered (mason, Q3)"
operator_review: false
planned_paths:
  - "db/schema/note-signups.ts"
  - "db/schema/index.ts"
  - "db/migrations/**"
  - "server/services/note-signups.ts"
  - "lib/validators/note-signup.ts"
  - "components/forms/**"
  - "app/_components/NotesSignup.tsx"
  - "app/_components/sign-up-for-notes.ts"
  - "app/_fixtures.ts"
  - "app/page.tsx"
  - "content/home.ts"
  - "tests/**"
depends_on: [ SITE-9 ]
out_of_scope:
  - "Any send to the list, its confirmation email and unsubscribe link: a later ticket (D-SITE-223)"
  - "A /notes page (house-design.md)"
  - "The /privacy lines: Taylor's, before launch"
  - "Home's final order and the whole-page keyboard walk: SITE-12"
  - "Applying the migration to production: Taylor's, at launch"
criteria:
  - id: C1
    statement: "The validator accepts reader@example.ca, trims and lower-cases ' Reader@Example.CA ' to reader@example.ca, and rejects an empty address, name@company (no ending) and one over 254 characters"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The action, with its store injected: a valid submit calls the store once with the lower-cased address, source home and content/home.ts's consent version, and returns done; a filled honeypot or a render time under two seconds returns done and never calls the store; an invalid address returns invalid without calling it; a store that throws returns error"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Against the local tier's database: a new address writes one row with created_at, the consent version, source home and unsubscribed_at null; the same address again, and differently cased, writes nothing and leaves the first row unchanged; a row with unsubscribed_at set stays unsubscribed after a repeat submit; with no local-tier database the file fails, never skips; it deletes its own rows"
    evidence: test
    command: "yarn test:e2e tests/e2e/note-signups-db.spec.ts"
  - id: C4
    statement: "The new migration file creates note_signups with a unique index on email and holds no ALTER, DROP or statement naming another table; the schema file's columns match D-SITE-223's list"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Submitting a valid address more than two seconds after render keeps it in the field, sets the button to Sending with aria-busy and no disabled attribute and no change in the block's height, then replaces the form with Signed up. Notes will go to {address}. and moves focus to that line, announced by the polite row (C-SITE-home-16)"
    evidence: test
    command: "yarn test:e2e tests/e2e/notes-signup.spec.ts"
  - id: C6
    statement: "Submitting while offline shows notes-error: the address kept, the button reads Try again, the error line tied to the field by aria-describedby and announced; back online, Try again reaches done (C-SITE-home-17, D-SITE-9)"
    evidence: test
    command: "yarn test:e2e tests/e2e/notes-signup.spec.ts"
  - id: C7
    statement: "Submitting name@company shows notes-invalid: aria-invalid on the field, the line tied by aria-describedby, and no request leaves the page (C-SITE-home-18)"
    evidence: test
    command: "yarn test:e2e tests/e2e/notes-signup.spec.ts"
  - id: C8
    statement: "With the address's row first stored and asserted present, submitting it again in another case, past two seconds, gives the same text, focus and live-region announcement as a new one, and the action's response body equals the new address's with the address swapped (C-SITE-home-19)"
    evidence: test
    command: "yarn test:e2e tests/e2e/notes-signup.spec.ts"
  - id: C9
    statement: "Across C5 to C8 no request goes to a Google host carrying the address and no URL on this origin holds it; at 390 the field and button are at least 44px tall; axe reports no serious or critical violation in idle, error, invalid and done"
    evidence: test
    command: "yarn test:e2e tests/e2e/notes-signup.spec.ts"
  - id: C10
    statement: "notes-sending, notes-done, notes-error, notes-invalid and notes-already, opened by ?state=, match captures/home/ at 390 and 1440, dark and light; notes-already is identical to notes-done (C-SITE-home-15, notes rows)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-013-notes-signup/evidence/states/"
  - id: review:warden
    statement: "Warden reviews the action, validator and store"
    evidence: manual
    reason: "A fresh-context specialist review, recorded by yarn review:run warden"
  - id: review:mason
    statement: "Mason reviews the schema and migration"
    evidence: manual
    reason: "A fresh-context specialist review, recorded by yarn review:run mason"
---

# Contract — SITE-13 notes-signup

## Build notes

Wave 3, after SITE-9 (home's frame and States list); SITE-12 follows. Start gate as every home ticket: `home.md`'s `pillar-open` line (D-SITE-184).

- **Approach:** a server `NotesSignup` section placed last in `app/page.tsx`'s `main`, replacing nothing; a client form leaf on `useActionState` posting to `sign-up-for-notes.ts` (`"use server"`), which parses with the shared validator, applies the bot rules, then calls `addNoteSignup(email)`: one `INSERT … ON CONFLICT (email) DO NOTHING`, the same query whether the address is new or listed. The forms kit's first pieces (field, hint, error line, busy submit) go in `components/forms/` for `/book` and `/contact` to reuse.
- **Decisions that apply:** D-SITE-223: "a new `note_signups` table: email (unique, lower-cased), created time, consent wording version, source, unsubscribed time. Nothing is sent on signup … A listed address answers as a new one." D-SITE-9: "offline shows as error and keeps the address." D-SITE-169 (home-build.md): sending holds the button with `aria-busy`, not disabled. D-SITE-227: Q3 with Warden.
- **Words (home-words.md, Notes signup):** heading Notes and its `[Draft]` line; label Email, placeholder you@company.com, the hint; Get the notes · Sending · Try again; the done, error and invalid lines as written.
- **Interfaces:** `noteSignupSchema` in `lib/validators/note-signup.ts`; `addNoteSignup(email: string): Promise<void>` in `server/services/note-signups.ts` (its db injectable for C3); `noteSignups` in `db/schema/note-signups.ts`, exported from `index.ts`; `NOTES_CONSENT_VERSION` beside the hint in `content/home.ts` (bump it when the hint changes); five `notes-*` keys in home's States list, seeded from `app/_fixtures.ts` with a synthetic `@example.test` address.
- **Per path:** the migration is `yarn db:generate`'s (`0023_…` and `meta/`); tests in `tests/unit/note-signup*.test.ts` and `tests/e2e/notes-signup.spec.ts`, `tests/e2e/note-signups-db.spec.ts`.
- **Gotchas:** a server action fails offline by throwing in the client, not by returning: catch it in the leaf and set `error`, keeping the address. An unsubscribed row stays unsubscribed on a repeat submit (judgment: re-opting in is the first send's confirmation). C3 runs under Playwright, outside `yarn verify`, so it needs no CI database: it resolves the local tier's `DATABASE_URL` (`lib/config/env/resolve-tier-env.ts`, `.env.local`), refuses any tier but local, and fails without one. The local tier borrows staging's database: ask Taylor before `yarn db:migrate` there. E2E addresses use `example.test`, and each spec deletes its own rows in `afterAll`. Capture: `yarn capture --route / --keys notes-sending,notes-done,notes-error,notes-invalid,notes-already --out <evidence dir>`.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks listed addresses answered differently.
