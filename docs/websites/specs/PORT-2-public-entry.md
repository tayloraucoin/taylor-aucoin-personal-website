# PORT-2 — Public entry: routes, the start form, the state router, welcome / resume / done shells

**Epic:** PORT — portfolio intake · **Phase 1** · Size: L
**Slice type:** Routing + the track's public front door. Risk class: shared-component extraction touching the Durable tree, and copy drift on the first screens a paying client meets.

**Status:** Complete (2026-08-26) — all five routes build; start form, state routing, welcome, resume, and done verified in a browser and against a scratch Postgres 15. Durable tree confirmed unchanged (start form byte-for-byte in copy, chrome/analytics posture unchanged on all five `/websites*` paths).

> **Review note.** Two things get checked hardest: the Durable tree renders identically after the shared-component extraction (state which routes were eyeballed and which flows exercised), and every client-facing string diffs clean against the v2 doc — including placeholders and the blur-validation string.

---

> **Route amended before execution (M-PORT-7).** This ticket was authored against `/websites/portfolio/intake` with a redirect stub. A parallel thread has since built the coded-track sales page at `/websites/coded` and retired "portfolio" as a public slug. Build at **`/websites/coded/intake`**, and build **no redirect** — the sales page is the explainer a trimmed URL lands on. Internal identifiers stay `showcase` (M-PORT-1). Read `docs/websites/PORTFOLIO-MARKETING-EXECUTION-SCOPE.md` §3 before touching `lib/routes.ts`.

## Outcome

A creative sent the link can start: `/websites/coded/intake` renders the v2 start form, mints a `showcase` engagement and token, and routes into the `[token]` state machine — pay placeholder (PORT-3 owns the real screen), welcome, resume, done shell — under the same chrome-suppressed, noindex, analytics-free posture as the Durable surface. Step pages render the StepShell with the showcase registry's titles, intros, and progress ("STEP N OF 9") with empty bodies awaiting the step slices. The Durable tree at `/websites/intake` is behaviorally unchanged. No payment moves; no step has fields yet.

## Why / intent

- **M-PORT-2 as amended by M-PORT-7** — the route shape, the thin-wrapper law, `showcaseIntakeRoutes` composed from the existing `websiteRoutes.coded` (the literal lives only in `lib/routes.ts`, and `coded` is already there — do not restate it), `isIntakePath` covering both intake prefixes so chrome and analytics stand down. No redirect stub.
- **V2 doc "Start form" + "Welcome screen" + "Done screen" (binding, verbatim)** — the field set and every string. Anchors the builder must ship exactly: email blur validation "That doesn't look like an email address — check for a typo." · phone help "So Taylor can reach you about the build." · one-line placeholder "Director and camera operator in Vancouver" · the two checkbox groups with their help lines ("More categories open soon. If you're a mix, check everything that's true." / "This decides which example sites you'll review later, and how we talk about your work inside. Check everything that's true.") · welcome headline "Nine steps. Every one of them optional." with its two paragraphs · done headline "That's everything."
- **D-INT-8 (inherited)** — start-form answers prefill step 1; the client is never re-asked.
- **UX scope §5 start form** — coming-soon rows as true-disabled ChoiceCards: reduced opacity, no hover, `aria-disabled`, "coming soon" inside the label, in tab order as inert announced items. Keep-or-drop is Taylor's open item — build them; removal is one array edit.
- **What this slice is NOT (binding):** no pay screen (PORT-3 — this slice routes an unpaid engagement to a placeholder that renders nothing chargeable); no step fields (PORT-4/5/7); no `/websites` chooser or marketing page (handoff decision 3).
- **Ground truth:** the Durable tree's `[token]` state router, layout, StepShell, resume list, and start action exist — extract and parameterize, never rebuild (M-PORT-2's wrapper law).

**Rulings this slice makes (labelled, logged):**

- **Start-form answers land in the answers document under `about`** (`whatYouDo`, `siteKinds`, `disciplines`, `disciplinesOther`, `currentWebsite`) at engagement creation, so prefill and `resolveFlavour` read one home. Contact identity goes to the engagement columns as the Durable start action does (`businessName` carries the client's name — M-PORT-3). Logged.
- **The honeypot carries over** from `startIntakeInput` — same field, same silent drop. Logged.

## Experience & states

Per the Durable flow's grammar (UX spec §5, inherited): single 560px column, Quiet Gilt, no RootField. Start form: name · email · phone · one-line · "What kind of site is this?" (Portfolio enabled; three coming-soon rows disabled) · "What's the work?" (five options) · "Something else?" text · current website. Submit mints token → `[token]` entry. State routing per the existing table: unpaid → pay (placeholder this slice) · paid untouched → welcome · started → resume ("Welcome back, {first name}", step list from the showcase registry) · complete → done shell.

**States (exhaustive):** start form default · field blur validation (email string above, gold, never blocking) · submitting (button label swap, no spinner) · minted/redirect; welcome default; resume with 0–9 visited steps; done shell (static copy; skipped list arrives in PORT-8); expired token → the existing quiet dead-end, unchanged.

**Failure / edge states (named):** start action failure → inline gold line, answers stay in the fields, retry (never a lost form); double-submit → one engagement (the existing action's guard pattern); direct visit to a step URL on an unpaid engagement → the same payment-gate redirect the Durable tree enforces.

## Non-negotiables (this slice)

- **V2 strings verbatim** — the checkbox option labels, help lines, placeholders, and validation strings are the spec.
- **The Durable tree is behaviorally unchanged** by the extraction.
- **Chrome, analytics, and indexing stand down** on every new path (`isIntakePath` covers the prefix; noindex like the existing surface).
- **Never ask what the start form already answered** (D-INT-8) — the prefill wiring is this slice's to lay.
- **Route literals live only in `lib/routes.ts`.**

## Data

**Schema changes: none.**

**Tables:** `engagements` (insert via the start action with `track: 'showcase'`; reads via the seam).

**Placement:** `app/websites/coded/intake/{page.tsx, layout.tsx}` · `.../intake/[token]/{page.tsx, [step]/page.tsx, done/page.tsx}` as thin wrappers · shared components extracted into `app/websites/intake/_components/` (they already live there; parameterize in place) · `lib/routes.ts` (extend; `websiteRoutes.coded` already exists) · start action beside the page per the existing pattern. `app/websites/coded/page.tsx` belongs to the marketing thread — do not touch it.

**Validators:** `startShowcaseIntakeInput` in `lib/validators/showcase-intake.ts` (name/email required to mint, everything else optional — mirroring `startIntakeInput`'s posture; honeypot included).

## Accessibility

Coming-soon rows: `aria-disabled`, announced with their "coming soon" text, focusable-inert per UX scope §5. Checkbox groups: fieldset/legend semantics (inherited law). Blur validation: associated via `aria-describedby`, announced politely, never `role="alert"`. Step-change focus behavior inherited from StepShell.

## Acceptance criteria (observable — mobile viewport primary)

1. `/websites/coded/intake` renders the start form with every v2 field, option, placeholder, and help line — diffed against the doc. Trimming the URL to `/websites/coded` lands on the sales page, not a 404.
2. Submitting mints a `showcase` engagement (row check: `track`, contact columns, `answers.about` carrying the one-line, kinds, disciplines); redirect lands on the `[token]` route.
3. State routing: unpaid → pay placeholder; `deposit_required=false` → welcome with the v2 headline verbatim; after visiting a step → resume with the showcase step list; done shell renders "That's everything." copy.
4. The email blur string appears on blur with a malformed address, in gold, and never blocks submit.
5. Coming-soon rows: not selectable by pointer or keyboard; announced as disabled with the label text; Portfolio row selects normally.
6. Chrome/analytics: no site header and no analytics tag on any `/websites/coded/intake` path (DOM check); page carries noindex.
7. Durable regression: `/websites/intake` start form, one full durable state-routing pass (pay screen render, welcome, resume), visually and behaviorally unchanged.
8. Negative: no payment code invoked anywhere in this slice; honeypot-filled submissions mint nothing.
9. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The existing `[token]` page is the state router — parameterizing it likely means lifting its body into a shared component taking `{track}` and re-exporting from both trees. Resist copying the file.
- The resume cookie's path scoping (`intakeRoutes.cookiePath`) needs a showcase twin — same narrow-scope reasoning.
- M-INT-13's `SiteChrome` gate reads `isIntakePath` — extending the predicate is the whole change; verify analytics genuinely does not load (component returns null before the tag).

## Dev's call

Redirect mechanics (`redirect()` in a page vs `next.config` entry) · wrapper file granularity · where the pay placeholder's minimal render lives until PORT-3 replaces it.

## Out of scope

- **The real pay screen** — PORT-3. **Step fields** — PORT-4/5/7. **Skipped-items list on done** — PORT-8. **The `/websites` chooser** — later scope, not this epic.

## Depends on

- **PORT-1** — track key, seam, showcase registry, start-input validator home. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** The extraction touches the Durable tree's most load-bearing file (the state router); choosing down produces a second tree that drifts from the first — the exact fork the handoff forbids.

---

### Kickoff (paste into the session)

> Build **PORT-2 — Public entry** (attached spec). **V2 strings verbatim; the Durable tree unchanged; route literals only in lib/routes.ts.**
> Attach/read first, in order: this spec · `specs/README.md` · `../portfolio-intake-questions-v2.md` (start form + welcome + done — the copy source) · `../PORTFOLIO-INTAKE-TECH-SCOPE.md` §4 · `../PORTFOLIO-INTAKE-UX-SCOPE.md` §2, §5 · `PORT-1` (the seam — reuse, don't fork) · `docs/intake/INTAKE-UX-SPEC.md` §5 · this folder's logs, then `docs/intake/specs/` logs.
> Close in three places. Run `yarn build` + `npx tsc --noEmit` + `yarn lint`.
