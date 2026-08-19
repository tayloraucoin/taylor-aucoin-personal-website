# INT-4 — Intake shell: Quiet Gilt primitives, routing gate, W0 welcome, resume screen

**Epic:** INT — client intake · **Phase 2** · Size: L
**Slice type:** Design-system extension + navigation spine. Risk class: pattern-setting — every form component INT-5/6 build is copied from what ships here.

**Status:** Code complete (2026-08-18) — criteria 1–6 (rendering, keyboard, iOS zoom, reduced motion) NOT verified; no browser available this session

> **Design conformance.** This slice instantiates UX spec §4 (Quiet Gilt) and §5 (StepShell). The Copy test applies with force: INT-5 and INT-6 will copy these components verbatim into fourteen more screens. Wrong here is wrong sixteen times.

---

## Outcome

The intake flow has its skeleton and its dialect. `/intake/[token]` state-routes per UX spec §2 (P0 → W0 → resume → done); W0 renders the welcome contract (deposit-received line, time estimate, skip promise, autosave promise, confidentiality line, send-my-link button placeholder-wired); steps 1–9 exist as StepShell-framed stubs with real titles, working progress, and Back/Continue navigation; the resume screen greets a returning client and lists the nine steps. The Quiet Gilt primitives — StepShell, StepProgress, Field, TextField, TextArea, ChoiceCard/ChoiceGroup, FooterNav, SaveIndicator (visual states only) — exist with their full state matrices. No real fields are wired (INT-5), no autosave persists (INT-5), no uploads (INT-6), no emails (the send-my-link button stores intent; INT-8 wires the send).

## Why / intent

- **UX spec §4 (D-INT-2)** — the variant law: no RootField, 560px column, 16px inputs, 48px targets, gold validation, the §4 table of extensions. **§5** — StepShell anatomy, sticky footer, never-disabled Continue (D-INT-4), progress grammar, focus-to-heading on step change. **§5.3** — resume screen. **§3 W0** — welcome contract copy, verbatim where given.
- **D-INT-5** — one step = one scrollable screen; linear + back; step-jumping only from resume.
- **Repo CLAUDE.md invariants** — v4 `-(--token)` syntax (the shipped `-[--` bug is the named trap); no gradient behind body copy; reduced-motion collapses transitions; focus-visible 2px gold.
- **CC component law** — client leaves in `_components/` with `'use client'` line 1; Server Components default (StepShell header/frame can be server; interactivity is leaves).
- **What this slice is NOT (binding):** no field content, no persistence, no GradientRing usage (that is Step 5's voice card, INT-6, and nowhere else — D-INT-3).

**Rulings this slice makes (labelled, logged):**

- **Step registry is data:** `lib/intake/steps.ts` exports the ordered nine-step manifest (slug, number, title, intro-copy key) consumed by routing, progress, resume list, and later the markdown generator — one home for step identity. Logged.
- **The `[step]` route segment validates against the registry** and 404s (via the not-found boundary) on junk, keeping URL space tight. Logged.

## Experience & states

Per UX spec §5.1 anatomy verbatim: header (mono eyebrow `STEP N OF 9`, hairline/gold progress, display h2, dim intro), scrollable body slot, sticky footer (`--color-card` bg, hairline top, ghost Back / gradient Continue, save indicator slot, next-step name line). Step transitions 300ms `--ease-out` fade + 8px rise; reduced-motion instant. On step change: scroll top, focus the h2.

**States (exhaustive, per component):** Field/TextField/TextArea/ChoiceCard each ship default · focus-visible · filled/selected · disabled (unused but defined) · error-note slot (gold) · touch pressed. FooterNav: default · Continue-with-next-label · first-step (no Back) · last-step (Continue → Done, wired fully in INT-7). SaveIndicator: the four §6.2 states as visual variants (wiring in INT-5). W0: paid vs waived first-line variants (D-INT-9). Resume: untouched vs visited step markers.

**Failure / edge states (named):** unknown token → not-found surface (plain, warm, one mailto line — final copy INT-8 may refine); unknown step slug → not-found; JS disabled → server-rendered shell still shows content and a plain form warning is _not_ required (progressive enhancement is not a v1 target — see Out of scope).

## Non-negotiables (this slice)

- **Continue is never disabled** (D-INT-4). The sole flow-wide exception (P0 pay) is INT-3's.
- **No `RootField` import under `app/intake/`** — atmosphere is ground + glows + grain only.
- **Zero new hexes; every color a named token; never `-[--` syntax.**
- **Inputs ≥16px font; targets ≥48px** — the iOS-zoom and thumb laws are structural, not styling preferences.
- **The nine-step count is a promise** — no sub-pagination, no step insertion.

## Data

**Schema changes: none.**

**Tables:** `engagements` (read via `requireEngagement` for state routing; write: `startedAt` stamped on first step visit via a thin action → `server/services/engagement.ts`).

**Placement:** `lib/intake/steps.ts` · `app/intake/[token]/page.tsx` (extend INT-3's entry routing) · `app/intake/[token]/[step]/page.tsx` · `app/intake/_components/{step-shell,step-progress,field,text-field,text-area,choice-card,choice-group,footer-nav,save-indicator,resume-list}.tsx` · `app/intake/[token]/_actions/navigation.ts` (start/step-touch, thin).

**Validators:** none new (INT-5 brings per-step schemas).

## Accessibility

The full §11 floor lands here because the primitives own it: label association (no placeholder-as-label), fieldset/legend in ChoiceGroup, focus order, focus-to-h2 on step change, `aria-live="polite"` on SaveIndicator, 200% text scaling without loss on StepShell, reduced-motion collapse. Verify by keyboard-tabbing the full stub flow and by iOS Safari focus-zoom check (16px holds).

## Acceptance criteria (observable — mobile viewport primary, 375px; desktop 1280px secondary)

1. A paid (or waived) engagement's link renders W0 with the correct first-line variant and the verbatim welcome contract copy; Start lands on step 1.
2. All nine step routes render StepShell with correct eyebrow, progress fill, title from the registry; Back/Continue traverse the full sequence; unknown slugs 404.
3. First step visit stamps `startedAt` exactly once; the entry route thereafter offers the resume screen with correct visited markers.
4. Keyboard: the entire stub flow is traversable; every interactive element shows the 2px gold focus ring; step change moves focus to the h2 (verified by screen-reader announcement or focus outline).
5. iOS (or simulator): focusing a TextField does not zoom the viewport.
6. `prefers-reduced-motion`: step transitions are instant; nothing animates.
7. Negative: `grep -r "RootField" app/intake` empty; `grep -r "\-\[--" app/intake` empty; no `#` hex literals in the new files.
8. The portfolio's static route list and output are byte-unchanged (`npm run build` route table diff).
9. `npm run build`, `npx tsc --noEmit`, `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The existing `GradientButton`/`GhostButton` in `components/ui/` are the CTA primitives — reuse, don't fork; if their padding fights 48px targets, extend via props at the component, not a local copy (Forge's pattern law).
- `app/intake/layout.tsx` is the right home for the no-canvas atmosphere and the 560px column; keep the segment self-contained so nothing leaks site-wide.
- Force dynamic rendering on the segment (`export const dynamic = "force-dynamic"`) rather than fighting cache heuristics with token-personalized content.

## Dev's call

Step slug spelling · transition implementation (CSS vs Motion — ambient = CSS per repo law) · resume-marker rendering detail · whether StepShell is one component or shell + header split.

## Out of scope

- **Real fields and autosave** — INT-5. **Uploads, voice card, ring** — INT-6. **Done screen** — INT-7. **Send-my-link email + expiry screen copy** — INT-8.
- **Progressive enhancement / no-JS forms** — not a v1 target; logged here so nobody builds it in passing.

## Depends on

- **INT-2** — seam, routes, domain type. Complete in `PROGRESS.md`. (INT-3 is **not** a gate — develop against `deposit_required=false` engagements.)

## Recommended execution

**Opus/Fable-class.** Pattern-setting UI against two binding design documents; a cheaper model produces plausible components with holes in the state matrix that INT-5/6 then copy fourteen times.

---

### Kickoff (paste into the session)

> Build **INT-4 — Intake shell** (attached spec). **Every primitive ships its full state matrix; Continue is never disabled; no RootField, no new hexes, never `-[--`.**
> Attach/read first, in order: this spec · `specs/README.md` · `../INTAKE-UX-SPEC.md` §2, §3 (W0), §4, §5, §11 · `../TECH-SCOPE.md` §3, §9 · repo `CLAUDE.md` + `docs/DESIGN-SYSTEM.md` · `INT-2` (seam — reuse, don't fork) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> One step = one screen; nine exactly; step identity from `lib/intake/steps.ts`. Close in three places. Run `npm run build` + `npx tsc --noEmit` + `npm run lint`.
