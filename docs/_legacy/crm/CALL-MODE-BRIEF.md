Role: Vesper (lead) — inject /Users/taylor/Documents/universal-roles-files/engineering/Vesper—ux-ui-designer-role-prompt.md
Support: Drummer — /Users/taylor/Downloads/Drummer—sales-funnel-lead-role-prompt.md

Task: Redesign the admin CRM's calling loop ("call mode") at tayloraucoin.com/admin — UX settled first, with my sign-off, before any tech scoping or code. Engineering (Mason/Reeve) joins only after I approve.

Attached / read first, in this order:
1. `docs/crm/CRM-UX-SPEC.md` — current UX law. §6 decision log (D-CRM-1…22) is binding except where this brief supersedes it; supersessions get logged as amendments, not silently.
2. `docs/crm/specs/DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` — on-disk reality overrides any stale spec string.
3. The current surfaces, in the running app (`yarn dev`, sign in, `/admin/queue`) and in code: `app/admin/_components/call-queue.tsx`, `focus-card.tsx`, `lead-drawer.tsx`, `lead-record.tsx`, `engagement-panel.tsx`, `intro-email-dialog.tsx`, and `lib/crm/sop.ts` (SOP copy, written but not yet surfaced).
4. Component precedent: check the CC repo (`/Users/taylor/lighthouse/conscious-connections/conscious-connections`, apps/toolkit admin) for an existing shadcn Sheet/side-drawer to adopt; if none, plan on the shadcn Sheet. Note the tension to confirm with me: taylor-aucoin `CLAUDE.md` bans component libraries for the site; D-CRM-16 exempts `/admin` from the site's visual law but adopting shadcn in this repo is a stack ruling that needs recording.

Why this thread exists: the calling loop was built feature-by-feature and the seams show — a dialog stacked on top of a drawer, conversion moments that dead-ended or required a second form, a drawer that appeared instead of sliding. The services underneath are solid and verified; the interaction model on top was never designed as one piece. Design it as one piece now.

What I asked for, from testing (my words, cleaned up):

* Two columns: left = call list, right = action menu.
* A "call now" button beside the copy-number button. Clicking it enters call mode: left column becomes the sales script, right column becomes note-taking.
* Call mode starts with the disposition selects as they exist today. Everything else is dimmed/disabled until "Conversation" is selected — the fields really open up when in conversation. If a non-conversation disposition is selected, show a "next lead" button below it to move on.
* The in-conversation input menu includes: contact name, email, better phone number, general notes, their openness (interest level), etc.
* A Save button for when the call is complete. Save leads into the post-call actions: drafting + sending the intro email, and anything else owed (intake link, callback scheduling).
* After the email send and other actions, show a review screen: everything currently saved and every action completed. "Next lead" button to continue.
* The intro email must not be a form-then-dialog-then-dialog chain. Gather the basic data in the note-taking column, and let the email flow from what is already there. Look at the mechanics of what the moment is: I just talked to someone, I have their email, I want to send the thing — one motion.
* Lead records open as a sliding drawer (shadcn Sheet or CC equivalent), never a page navigation from the queue; the drawer keeps an "open full page" escape.

Standing law that survives unless I explicitly amend it: dispositions and their cadence (a logged call always produces a next action or a closure); a logged call is never lost; DNC exclusion is absolute; no urgency/alarm styling; keyboard accelerators stay but must be inert wherever a keystroke could double-log; the call-window model and seasonal notes stay advisory; the SOP content in `lib/crm/sop.ts` should get a home in the new design (link/dialog from the queue).

Deliverable, phase 1 (this thread, before anything else):
* A TLDR-style workflow map of call mode as a numbered state sequence — queue → call now → dialing → disposition → (conversation path with open fields | non-conversation path with next-lead) → save → post-call actions → review → next lead — with one line per state saying what each column shows and what every button does.
* Then batched questions to me (AskUserQuestion, few and sharp) confirming the intended workflow anywhere my description above is ambiguous or incomplete — including "what did you forget?": candidates you should probe are where callback scheduling lands in the new flow, what happens on voicemail/no-answer mid-call-mode, what the review screen shows when no post-call action was owed, what "openness" should capture and whether it feeds the scoreboard, where the sales script content comes from (Drummer's beats + per-trade window/seasonal notes exist in code), and mobile behaviour.
* Keep it tidy to read. No implementation, no file changes to app code in phase 1.

Phase 2, only after my explicit sign-off: record the rulings as amendments in `docs/crm/CRM-UX-SPEC.md` §6 (new D-CRM rows, superseded rows marked), then hand to Mason + Reeve to scope the build against the existing services (the data layer should barely change — this is a presentation-layer redesign) with ticket(s) and a batch plan per `docs/crm/specs/README.md`.

---

## Phase 1 outcome — 2026-08-22 (Vesper + Drummer, ruled by Taylor)

UX is settled and recorded. Rulings live as **D-CRM-23…30** in `CRM-UX-SPEC.md` §6, with the state map at §3.8 (v1.2 amendment). The sales script is content at `docs/crm/CALL-SHEET.md` (D-CRM-28), Taylor's v1 with three edits ruled in this thread: platform fee corrected to ~$36 to match the website; the "I already built you one" preview-first ask removed as outdated (nothing is built before the questionnaire — see `docs/intake/`); the ask now captures channel preference (text or email).

**Open flags raised here, not resolved here:**
- The "How We Work" PDF still quotes ~$22–25/mo — standing reconciliation flag, now also relevant because the call sheet was corrected against it.
- The call sheet's walkthrough section references the toolkit and a "Care Plan" — offer elements the published contract does not ratify. Fine as a private crib note; must not leak into client-facing collateral until ruled.
- CASL/telemarketing posture: unchanged standing flag; the "that's verbal consent" line in the objection table is Taylor's own practice note, not a counsel-verified claim.

**Data-layer flags for Mason (small, but not presentation-only):**
- `leads` has no contact-name column (engagements do); the conversation form captures one (D-CRM-25).
- Channel preference (text/email) needs a home — column or structured note, Mason's call.
- Next-touch visible field maps onto the existing schedule tokens; no new scheduling machinery expected.
- Sheet adoption (D-CRM-30): `@radix-ui/react-dialog` + animate plugin as deps, CC's `packages/ui/src/primitives/layout/sheet/sheet.tsx` as the source to vendor; CC's `lead-sheet.tsx` (affiliates CRM) is the URL-driven usage precedent.

**Handoff:** ready for Mason + Reeve to scope against existing services per `docs/crm/specs/README.md` — the data layer should barely change beyond the flags above; this is a presentation-layer redesign.
