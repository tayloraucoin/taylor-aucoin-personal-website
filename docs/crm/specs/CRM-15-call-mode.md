# CRM-15 — Call mode: the two-column state machine, the script column, the Save

**Epic:** CRM — call-mode redesign (v1.2) · **Phase 5** · Size: L
**Slice type:** The heart's interaction model, rebuilt as one piece. Failure class: a lost or double-logged call outcome mid-block — the two failures the whole surface exists to prevent.
**Vigil:** Review by *inducing*: kill the network mid-Save on both branches (retry resends verbatim, lead stays in queue); hold Cmd and press digits (nothing logs); double-press Enter on Next lead (advances once); refresh mid-conversation before Save (no attempt row exists; blurred notes survived); toggle `prefers-reduced-motion`. QA states which of these it exercised.

**Status:** Complete (2026-08-22)

---

## Outcome

Working a call block is one loop with no seams. The queue shows the list left and a pre-call panel right; **Call now** flips the left column to the call sheet and the right column to logging; a non-conversation disposition logs on the click and **Next lead** moves on; **Conversation** opens the capture fields and one **Save** commits everything; Esc before any log exits clean. The block never navigates away, never loses a keystroke to the wrong target, and never pauses on a spinner between calls. Post-call actions and the review screen are CRM-16 — on Save with something owed, this slice keeps the existing next-step panel as a named interim so no yes ever dead-ends.

## Why / intent

- **CRM-UX-SPEC §3.8** — the numbered states 0 → 5 are the contract for this slice's states 0 → 2b + Save. Build them as written; this spec restates only what it adds.
- **D-CRM-23/24** — call mode supersedes §3.2's *surface*, never its vocabulary; log-on-click, advance-only Next lead, Enter as Next lead.
- **D-CRM-25** — the conversation field set. **CRM-14** supplies the one-transaction Save; this slice never invents a second write path.
- **D-CRM-28** — the script is `docs/crm/CALL-SHEET.md`, rendered as markdown; content, not code. **M-CRM-9** rules the read mechanism.
- **D-CRM-29 / D-CRM-7** — mobile: one column, dispositions first, script behind a toggle.
- **Standing law that binds every line here:** a logged call is never lost (§4); accelerators inert wherever a keystroke could double-log; DNC confirm; no urgency styling; ≤2 clicks from hang-up for every common case (D-CRM-8); windows and seasons stay advisory (D-CRM-19/20).
- **Ground truth:** `call-queue.tsx` holds the `handled` set, the pinned `working` lead, and the keyboard guards; `focus-card.tsx` holds the disposition row, chips, failure-retry, and notes autosave. This is a restructure of those two, not a rewrite beside them. **Measured surface: 985 lines across those two files** — the restructure is the bulk of this ticket's context budget, which is why the renderer (CRM-17) and the Sheet (CRM-13) were carved out ahead of it.
- **CRM-17** — `app/admin/_components/markup.tsx` renders both operator documents. Consume it.
- **What this slice is NOT (binding):** no email composing, no text composing, no intake minting, no review screen — CRM-16. No change to `logAttempt` semantics — CRM-14.

**Rulings this slice makes (labelled, logged):**

- **The renderer is consumed, not written here.** CRM-17 owns `app/admin/_components/markup.tsx` and its grammar. If the call sheet needs a block type the renderer lacks, that is a CRM-17 amendment, not a parser written inside a state machine. Logged.
- **The interim next-step is named, not polished.** On Save with `wants_info`/`ready_for_intake`, the existing `NextStepPanel` + `IntroEmailDialog` path runs unchanged until CRM-16 replaces it. A DEVIATIONS line marks it interim at closure. Logged.
- **Refresh mid-conversation loses unsaved fields, and that is correct.** Nothing was logged yet; blurred notes are already persisted by the autosave. The never-lost law protects *logged* outcomes, not half-typed forms. Logged.

## Experience & states

Build §3.8 states 0–2b as written. Additions and precision:

**State 0 — pre-call panel** replaces the always-armed focus card: opener facts, phone large + **Copy** + **Call now**, window/seasonal/walk-in lines, attempt summary, **Full record** (Sheet). The disposition row does not render here — logging lives in call mode, and *Call now* is also how a call made outside the app gets logged after the fact (one click, nothing else changes).
**State 1 — dialing:** left column swaps to the rendered call sheet (scrollable, seasonal note surfaced at top per D-CRM-20); right column: disposition row live, conversation fields visible but `disabled` + dimmed. *Back*/Esc → state 0, nothing logged.
**State 2a:** picked disposition stays lit; contextual chips exactly as today (callback times, not-interested reasons, DNC one-confirm); **Next lead** below (Enter). Notes editable.
**State 2b:** fields enable: contact name · email · better phone · channel preference (text/email, two chips, optional) · interest tags · notes · next-touch (chip row per tag default + pick). **Save** commits via CRM-14's payload.

**States (exhaustive, per element):** every control default/hover/active/focus-visible/disabled/loading; queue loading skeletons unchanged; queue empty states unchanged; save in-flight (row disabled, no spinner storm); save failure (message + verbatim **Retry**, lead stays); notes save failure ("still here, try again"); offline (quiet banner, dispositions disabled with reason — spec §4); call sheet missing/unreadable at runtime → the column says so plainly and call mode still logs (the script never blocks logging).

**Failure states (named, per the risk contract):** network death mid-Save both branches · double keystroke during in-flight save · Enter held on Next lead · revalidation landing mid-follow-up (the `working` pin holds — existing law, must survive the restructure).

## Non-negotiables (this slice)

- **A logged outcome is never lost.** Optimistic save, exact-payload retry, lead never silently leaves unlogged.
- **Nothing beyond the disposition is ever required.** Save with only a disposition is legal on the conversation path too.
- **Accelerators inert:** while typing, while in-flight, while logged-awaiting-advance, while the Sheet is open, under modifier chords.
- **Esc in state 1 costs nothing.** No log, no schedule change, no attempt row.
- **The script column is advisory rendering.** It never gates, times, or pressures — no countdowns, nothing colored for urgency.
- **DNC keeps its one confirm** and stays absolute.

## Data & AI

**Schema changes: none** (CRM-14 owns them).
**Tables:** `leads` · `call_attempts` (via existing services/actions only).
**Placement:** `app/admin/_components/call-queue.tsx` (state machine host) · `focus-card.tsx` (becomes the right column's state renderer; rename allowed if the diff stays legible) · new `call-sheet-column.tsx` (server-rendered markdown, renders via CRM-17's `markup.tsx`) · `app/admin/(protected)/queue/page.tsx` (reads the sheet file server-side). Mason placement inherited from TECH-SCOPE §6.
**tRPC / validators:** existing `logAttemptAction` + CRM-14's extended input; `saveNotesAction` unchanged.
**AI notes:** **None.**
**Instrumentation:** none — no analytics on `/admin`.

## Accessibility

Disposition and chip targets ≥44px (they get hit fast, one-handed). The column swap announces politely (`aria-live="polite"`, one announcement — "Call mode" / "Queue") — no announcement storm. Dimmed conversation fields are real `disabled`, not opacity theater, so screen readers agree with sighted users about what is operable. Number-key labels stay visible on the disposition row. The call sheet's table renders as a real `<table>` with headers. Contrast AA at rendered sizes in the dimmed state — dimming must not push body text below AA.

## Acceptance criteria (observable)

1. From state 0, **Call now** enters call mode: left column is the rendered call sheet (all block types render — CRM-17's grammar, verified against the real file); right column shows the live disposition row and dimmed fields. Esc returns to state 0 with no `call_attempts` row written.
2. Clicking **No answer** writes the attempt immediately (verify the row exists before Next lead is pressed); chips adjust the schedule after the fact; **Next lead** and Enter advance selection without further writes. *(Vigil: double-press Enter — one advance.)*
3. Clicking **Conversation** enables the field set; **Save** with name, email, channel, a tag, and a next-touch chip commits all of it in one action (verify lead columns + attempt row + `nextActionAt` together).
4. Save with only the Conversation disposition and nothing else succeeds.
5. Killing the network mid-Save on either branch shows the failure inline with **Retry**; retry resends the identical payload; the lead never leaves the queue unlogged. *(Vigil.)*
6. While a save is in flight, while fields have focus, while the Sheet is open, and under Cmd/Ctrl/Alt chords, digits and j/k do nothing. *(Vigil.)*
7. Save carrying `wants_info` or `ready_for_intake` lands on the existing interim next-step panel; the yes does not dead-end. A DEVIATIONS line marks the interim.
8. On a ≤768px viewport, call mode is one column, dispositions first, the script behind a labeled toggle; every criterion above still holds.
9. The seasonal note and window line render in call mode; nothing in the script column counts down, colors urgency, or reorders anything.
10. With `docs/crm/CALL-SHEET.md` unreadable (simulate), call mode still enters and logs; the script column states the absence plainly.
11. The rendered production build serves the call sheet content (deployment tracing verified, not assumed — M-CRM-9). `[NEEDS VALUE AT BUILD: confirm the fs read survives `next build` output tracing on Vercel; add `outputFileTracingIncludes` if not.]`
12. `npm run build` · `npx tsc --noEmit` · `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The state machine is four states and a pin; a `useReducer` in `call-queue.tsx` will read better than six booleans. The existing `working`/`handled`/`follow` logic maps onto it — port the guards, don't re-derive them.
- **Suggested order inside the run:** (1) read and restate the state table, (2) the column shell + call-sheet read, (3) port the guards, (4) states 0–1, (5) 2a, (6) 2b + Save, (7) mobile, (8) the induced-failure list. Verification is cheap here — typecheck is ~2s and the production build ~17s — so verify at every step rather than at the end.
- Read the call sheet in the page server component (`fs.readFile`, `path.join(process.cwd(), "docs/crm/CALL-SHEET.md")`) and pass the string down; the markdown parse stays in CRM-17's `Markup`.
- The dimmed-fields state is `fieldset disabled` — one attribute, correct semantics, no per-field wiring.
- Keep `DISPOSITION_ORDER` as the single source for buttons and number keys — it already is; don't let the restructure fork it.

## Dev's call

Reducer vs. discriminated-union state · file layout of the column components · the toggle affordance on mobile · whether the pre-call panel and state-1 header share a component.

## Out of scope

- **Post-call actions, review screen, text/email composing, intake mint inline** — CRM-16.
- **Any change to queue bands, ordering, windows, or filters** — settled, D-CRM-6/17/18/19.
- **Editing the call sheet's content** — it is Taylor's document; rendering only.

## Depends on

- **CRM-13** — the Sheet and the open-sheet keyboard guard. Complete in `PROGRESS.md`.
- **CRM-14** — the extended Save payload and transaction. Complete in `PROGRESS.md`.
- **CRM-17** — the markdown renderer the script column uses. Complete in `PROGRESS.md`.

## Recommended execution

**Fable 5.** The top tier is warranted exactly once in this phase and this is it: 985 lines of live interaction code restructured into a state machine whose guards are the launch-blocking property (never-lost logging, accelerator inertness), with a pinned-lead race that has already produced two production defects (DEVIATIONS 2026-08-22, CRM-5). Failure mode of choosing down to Opus 5 or Sonnet 5: the happy path ships and a guard is dropped in the restructure — a keystroke that logs a phantom dial, which corrupts the scoreboard's denominator silently and is the precise defect class this redesign was commissioned to end. Run it alone in its own thread; do not pair it.

---

### Kickoff (paste into the session)

> Build **CRM-15 — Call mode** (attached spec). Model: **Fable 5**. Run alone.
> **A logged outcome is never lost; nothing beyond the disposition is required; accelerators are inert wherever a keystroke could double-log; Esc before a log costs nothing.**
> Attach/read first, in order: this spec · `docs/crm/CRM-UX-SPEC.md` §3.8 + §4 + §5 + D-CRM-23…29 · `docs/crm/CALL-SHEET.md` · `app/admin/_components/call-queue.tsx` + `focus-card.tsx` (restructure; port the guards, don't re-derive them) · CRM-13 + CRM-14 + CRM-17 (consume their work) · `docs/crm/specs/DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` last — reality overrides stale strings.
> Keep the interim next-step panel wired on Save-with-owed; log it as interim in DEVIATIONS. Close in three places. Run `npm run build` · `npx tsc --noEmit` · `npm run lint`, plus the induced-failure list in the Vigil callout. Do not start the next ticket.
