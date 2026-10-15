# PORT-4 — Precedented steps: About you · Who this site is for · Your words · Media · Accounts and access

**Epic:** PORT — portfolio intake · **Phase 2** · Size: M
**Slice type:** Form content on existing primitives. Risk class: copy drift across ~50 verbatim strings, and the flow's single signature moment (the ring) built twice or wrong.

**Status:** Complete (2026-08-26) — all five steps render every v2 field verbatim, verified in a browser against a scratch Postgres; autosave round-trips to the database; the gradient ring appears on `words` and on no other step in the flow; the durable track confirmed unchanged. Found and fixed a silent autosave failure on this track (M-PORT-13).

> **Review note.** State which steps were walked field-by-field against the v2 doc's tables, and confirm by grep that the GradientRing appears exactly once under the showcase tree (the step-6 voice card) and that no field anywhere invites a credential.

---

## Outcome

Five of the nine steps are real, built entirely on existing primitives: **about** (step 1, prefilled from the start form), **audience** (step 2, all long-text, clustered), **words** (step 6, the voice-note card with the flow's only GradientRing), **media** (step 7, uploads with instant thumbnails), and **access** (step 9, opening with the extended NO PASSWORDS callout). Autosave, skipping, and resume behave exactly as the Durable flow's. The heavy steps (experience, work, taste) and the site step remain empty shells. No output document reads these yet.

## Why / intent

- **V2 doc steps 1, 2, 6, 7, 9 (binding, verbatim)** — every field, type, placeholder, help line, and conditional. Anchors that must ship exactly: step 6's voice prompt ("Record a 2–3 minute voice memo on your phone answering two things: how did you get into this, and what's a piece of work you're proud of — and why? Don't script it. This is the single most useful thing you can give us.") · step 9's callout extension "**Any invite — domain, Vimeo, anything — goes to hello@tayloraucoin.com.**" · the domain label variants by answer (Yes → "Which one?" · Not sure → "What do you think it is?" · No → "Any address you'd want?") with their help strings · step 2's intro "A portfolio isn't for you — it's for the person deciding whether to work with you…".
- **D-INT-3 / D-PORT-7** — the ring appears exactly once: the words step's voice card, with the skip line beneath ("Skip line beneath, same as existing").
- **D-INT-8** — start-form answers arrive prefilled in step 1, shown as editable, quietly confirmed.
- **UX scope §5 deltas** — audience clusters under mono group labels; "Keep my wording" as a full-width tap-card under the bio field; media per the §6.4 upload grammar; access domain questions first, ink-weighted; accounts as a repeatable block with the discipline-flexed help line.
- **What this slice is NOT (binding):** no experience/work/taste content (PORT-5/7); no extraction blocks (PORT-6); no per-entry uploads — the accounts repeatable block is text-only, the existing primitive as-is.
- **Ground truth:** `answer-inputs.tsx`, `choice-group.tsx`, `repeatable-block.tsx`, `file-drop.tsx`, `VoiceNoteCard`, the autosave engine — consumed verbatim, never forked.

**Rulings this slice makes (labelled, logged):**

- **The consent checkboxes default unchecked** (call-recording consent, "Can we publish those?" lives in PORT-5's experience step — not here) and persist through the normal answers path, matching the Durable pattern. Logged.
- **Step-6 file uploads** (voice note, "Anything you've written") and step-7 uploads (photo of you, behind the scenes, laurels, logo, anything-with-your-name) use the existing `FileDrop` with showcase step keys and field keys named in the schema — no `entryKey` (that is PORT-5's machinery). Logged.

## Experience & states

Each step: StepShell + registry intro (verbatim, flavour-resolved) + fields per the v2 tables. Step 1's prefilled fields render as normal editable inputs. Step 9's callout is the `--color-card` mono-eyebrow block (`NO PASSWORDS · EVER`) extended with the invite line. Logo conditional ("Your logo file" shows only on Yes / "hate it") reveals in place per §6.5.

**States (exhaustive):** per-field default/focus/filled (inherited); autosave indicator per §6.2; per-file upload states per §6.4 (queued · uploading · uploaded · failed-retry · removed); voice card empty · attached · replaced, ring static under reduced motion; conditionals hidden/revealed; checkboxes unchecked/checked.

**Failure / edge states (named):** save failure → local persistence + the honest indicator (engine behavior — verify, don't rebuild); oversize upload → the gentle issuance refusal; odd formats (.heic, .amr) → accepted, always.

## Non-negotiables (this slice)

- **V2 strings verbatim, including every placeholder and label variant.**
- **The ring appears on the words step's voice card and nowhere else.**
- **No credential or password field exists on step 9** — and the share-password law belongs to PORT-5, not here; nothing in this slice's copy invites an account password.
- **Prefilled is shown, never re-asked.**
- **Never reject an upload for format; size only, gently.**

## Data

**Schema changes: none.**

**Tables:** `engagements` (answers merge via the seam) · `intake_files` (via the existing upload path).

**Placement:** step components under the showcase tree's `_components/steps/` (`step-about.tsx`, `step-audience.tsx`, `step-words.tsx`, `step-media.tsx`, `step-access.tsx`) · `lib/validators/showcase-intake.ts` (fill these five schemas) · `lib/intake/showcase-answer-labels.ts` (their labels — a field missing from labels renders as its raw key in PORT-8's document; add them now).

**Validators:** all-optional shape guards per the established pattern (`text` / `choice` helpers); booleans for the consent/keep-wording checkboxes; repeatable schemas for roles and accounts.

## Accessibility

Inherited floor (labels never placeholders, fieldset/legend, 48px targets, focus order). Specific traps: the ring layer is `aria-hidden`; the domain label variants swap the *label*, so the input's accessible name updates with the answer; upload announcements batch on multi-file drops; the invite-routing line is body text, not only in the eyebrow.

## Acceptance criteria (observable — mobile viewport primary)

1. All five steps render every v2 field with exact types, placeholders, and help lines — field-by-field diff against the doc's tables, stated per step.
2. Step 1 arrives prefilled from a start-form-minted engagement; edits save through autosave; nothing prefilled is re-asked elsewhere.
3. The voice card is the only GradientRing under the showcase tree (grep); ring static under `prefers-reduced-motion`; skip line present beneath.
4. Step 9: callout renders with the invite line verbatim; domain conditionals swap labels per answer; accounts block adds/removes/undoes per the existing RepeatableBlock behavior.
5. Uploads on steps 6/7: instant local thumbnail, progress hairline, retry on induced failure; `.heic` accepted; oversize refused gently; rows land in `intake_files` with showcase step keys.
6. Autosave: a filled field survives tab-kill and resume (the engine's local-first behavior, exercised once on this track).
7. Negative: no ring anywhere else; no credential-inviting label; no new input primitives (grep for new component files beyond the five steps).
8. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The Durable steps are the pattern library — `step-voice.tsx` for the ring card, `step-access.tsx` for the callout + conditionals. Copy the shape, not the strings.
- "Which role leads?" and the roles repeatable sit adjacent; the roles block is the existing text-only RepeatableBlock.
- The step-2 clusters: hairline + mono group label per UX spec §5.1's rule for 7+ field steps.

## Dev's call

Cluster groupings on step 2 · field-key naming within the v2 labels (recorded in the schema as the one home) · upload field keys.

## Out of scope

- **Experience + work steps and per-entry uploads** — PORT-5. **Extraction** — PORT-6. **Taste** — PORT-7. **Site step** — PORT-8 carries it (one screen, one note — see that spec). **Output labels' rendering** — PORT-8.

## Depends on

- **PORT-2** — StepShell wiring, routes, autosave against showcase engagements. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet-class acceptable; Opus preferred.** The mechanisms are all precedented; the risk is fifty verbatim strings and one ring. Choosing down is viable only if the copy diff (criteria 1) is executed literally, string by string — a paraphrasing model fails this slice invisibly.

---

### Kickoff (paste into the session)

> Build **PORT-4 — Precedented steps** (attached spec). **V2 strings verbatim; one ring, on the voice card; prefill shown, never re-asked; size-only upload refusal.**
> Attach/read first, in order: this spec · `specs/README.md` · `../portfolio-intake-questions-v2.md` steps 1, 2, 6, 7, 9 (the copy source) · `../PORTFOLIO-INTAKE-UX-SCOPE.md` §5 · the Durable step components (pattern, not strings) · `docs/intake/INTAKE-UX-SPEC.md` §6 · this folder's logs.
> Close in three places. Run `yarn build` + `npx tsc --noEmit` + `yarn lint`.
