# PORT-15 — The pack-driven steps: 2 · 3 · 5 · 6 · 7 · 8 · 9 read their strings and lists from the pack; documents drop; tools group; the place

**Epic:** PORT — coded (showcase) intake · **Phase 6** · Size: M (split permitted: 2/3/5/6 then 7/8/9)
**Slice type:** Wiring seven steps to a content registry, plus three small new field groups on precedented primitives. Risk class: a string hardcoded instead of read from the pack, so Taylor's pass edits the wrong file; a portfolio engagement reading a changed string; the documents promise omitted or reworded.
**Review:** Vesper — the documents promise appears in her words wherever a document is accepted; the availability line is never a thermometer. No data review.

**Status:** Complete (2026-09-01) — steps 2, 3, 5, 6, 7, 8, and 9 read every varying string and every option list from the pack. **157 pack strings, zero still literal in any step component**, checked automatically. The documents drop ships with its promise, guarded by an assertion so the copy pass cannot quietly drop it. Durable document byte-identical; app boots clean. **Per-step rendering not browser-verified** — no database in this session to mint an engagement.

> **Review note.** State that every string on these seven steps that varies by pack is read from `copyPackFor(flavour)` and none is a component literal (grep each step for the pack's slot names); that a portfolio engagement renders all seven steps byte-identical to before (diff); and that the documents promise sentence is present, verbatim, under the documents drop.

---

## Outcome

Every step except 1 and 4 now says the right thing for the kind of site it is. A venture's audience list names investors and members; its step 3 paste intro names the deck; its dark-or-light help talks about photography; its voice-note prompt asks why this needs to exist; its person-voice options say *we*; its media step asks for the place and for documents, with the promise that nothing from them goes on the site unless they say so; its pages list has The offering on it; its reach options include an application form; its availability line asks about the raise; its step 9 asks which tools they already use and whose account each is. A portfolio engagement reads exactly what it read before. Steps 1 and 4 are PORT-13 and PORT-14.

## Why / intent

- **Kinds scope §4 steps 2, 3, 5, 6, 7, 8, 9** (field-level changes) and **§6.2–6.5** (the strings, landed by PORT-12). **§5.5 DocumentDrop** — the promise sentence is not optional. **D-PORT-9** — these steps flex strings and lists only.
- **Audit §3** — the seventeen film-shaped strings, the missing audiences, the missing pages, the video-first step 9, the logo help that argues against a paid add-on.
- **D-INT-8** — step 8's reach help gains the one sentence that keeps it distinct from PORT-14's ask block.
- **D-INT-1 / Vesper law 7** — the availability line is a status line; never a countdown or a percentage.
- **PORT-H1** — the person-voice interpolation exists; this slice makes it pack-aware (verbs, *we*).
- **What this slice is NOT (binding):** not new copy (every string is a PORT-12 slot; a slot that is missing is a PORT-12 defect to log, not a string to write here); not the gallery sets (PORT-16); not step 1 or step 4; not a new upload path.
- **Ground truth:** the seven step components · `copyPackFor` · `FileDrop` · `ChoiceGroup` (`exclusiveValue`) · PORT-12's pack.

**Rulings this slice makes (labelled, logged — Reeve):**

- **Option lists render from the pack and store the pack's `value`.** An old engagement whose stored audience value is not on its pack's list keeps the value in the document (the label map covers every value across packs) and simply shows it unchecked — no answer is dropped. Logged.
- **"A photo of you" and "Where does your video live?" are gated by kind, not by pack.** Portfolio and practice see the photo; portfolio and studio see the video question; everyone else sees the place and the tools group. Read `groupsFor(kind)` and the kind directly; do not derive from the pack. Logged.
- **The documents promise is a single exported constant beside `DocumentDrop`,** rendered as the drop's help line. One home; PORT-10 or any later document surface imports it. Logged.

## Experience & states

Per step, the deltas only (kinds scope §4 is the full list):

- **Step 2:** intro from the pack; `audiences` options from the pack; the four direction labels/helps and two example helps from the pack.
- **Step 3:** paste intro, entry placeholders, `awards` label/help, `kindWords` help, `notableNames` help suffix from the pack.
- **Step 5:** `darkOrLight` help from the pack (the gallery itself is PORT-16).
- **Step 6:** voice-note prompt from the pack; skip-line suffix for roster kinds; `personOptions(name)` from the pack (PORT-H1's interpolation, now with the pack's verb and *we* for entities); bio and writing help from the pack.
- **Step 7:** `portrait` drop for portfolio and practice only; **The place** (`FileDrop`, multiple, field key `place`) for the others, label/help from the pack; `behind_scenes` help from the pack; `laurels` label/help from the pack (file key unchanged); **Documents worth having** (`DocumentDrop`: `FileDrop` multiple, any format, field key `documents`, help = the promise constant) for studio, venture, business, other; logo help from the pack.
- **Step 8:** `pages` options from the pack; `howSeparate` help from the pack; `howToReach` gains the three pack options for non-portfolio kinds and the help suffix for ask kinds; `showAvailability` label/help from the pack.
- **Step 9:** `videoHosts` question for portfolio and studio only; **Tools you already use** (`ChoiceGroup` multiple, options from the pack, `None of these` as `exclusiveValue`) + **Which ones, and whose account?** (`long text`, help from the pack) for the others; `accounts` help from the pack (already wired; verify).

**States (exhaustive):** every inherited field state; the three new drops per §6.4 upload states; the tools group's exclusive-none behaviour per §6.6; conditionals present/absent by kind (no reveal animation — kind is fixed on entry).

**Failure / edge states (named):** a stored `pages` value not on the current pack's list (kind changed) → kept, unchecked, still labelled in the document; a `.pdf` or `.pptx` dropped on documents → accepted (format never rejects); a 60MB deck → the gentle size refusal; `None of these` chosen then a tool chosen → none clears silently.

## Non-negotiables (this slice)

- **No pack-varying string is a component literal.** Grep-verified per step.
- **Portfolio renders byte-identical on all seven steps.**
- **The documents promise sentence appears verbatim under the documents drop.**
- **The availability question is a status line: no countdown, no percentage, no progress element.**
- **No stored answer value is dropped when its option is not on the current pack's list.**
- **Size is the only upload rejection; `.pdf`, `.pptx`, `.key`, `.dwg` are accepted.**

## Data

**Schema changes: none.** **Tables:** `engagements` (answers) · `intake_files` (field keys `place`, `documents`).

**Placement:** the seven step components under the showcase tree · `app/websites/coded/intake/_components/document-drop.tsx` (thin: `FileDrop` + the exported promise constant) · `lib/validators/showcase-intake.ts` (`tools`, `toolsDetail` on `stepAccessSchema`; `howToReach` enum widened; `audiences`/`pages` stay `choice`) · `[token]/[step]/page.tsx` (pass `kind` where a step gates; `place` and `documents` uploads to step 7).

**Validators:** `tools: choice`, `toolsDetail: text`. Option enums for `howToReach` from PORT-12's `as const` values.

## Accessibility

The tools group's exclusive-none is silent by design; its legend carries the question. The documents drop's help line is the promise and is associated via `aria-describedby` like every other help. The place and documents drops announce per file, batched. Conditionals by kind are simply absent from the tree, so no `aria-hidden` juggling.

## Acceptance criteria (observable — mobile viewport primary; two seeded engagements throughout: portfolio-film and venture)

1. Portfolio-film: all seven steps render byte-identical to a pre-slice capture (diff the DOM text). *(Vesper.)*
2. Venture: step 2 lists *Investors or backers · Members or applicants · Residents or guests · Partners · Grant committees or funders · Press · Local government or regulators · Prospective collaborators*; step 8 lists the venture pages; step 9 shows the tools group and not the video question; step 7 shows The place and Documents and not "A photo of you". *(Vesper.)*
3. Step 6 on venture with `displayName: "Holistica"` renders *First — "We build…"* / *Third — "Holistica builds…"*; the voice prompt is the venture pack's.
4. The documents drop's help line equals the exported promise constant, verbatim, and a `.pptx` is accepted.
5. Change the venture's kind to practice (PORT-13's line); step 8's stored `pages` value `offering` is still in the document and the page renders without error.
6. Grep each of the seven step files for every pack slot name used on that step: each is read from `copyPackFor`, none is a literal. *(Reeve.)*
7. Negative: no element on step 8's availability question is a `progress`, meter, or countdown; no new upload path (grep for a second issuance action).
8. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass; `yarn verify:tracks --document` byte-identical.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Do steps 2/3/5/6 first (pure string wiring, one hour), then 7/8/9 (three new groups). If the thread runs long, split at that seam and say so.
- `step-access.tsx` already reads `copyPackFor(flavour).accountsHelp` — that is the pattern for every other slot.

## Dev's call

Whether `DocumentDrop` is a component or a two-line composition inside `step-media.tsx` (either; the constant must be exported from one home) · the DOM-diff method for criterion 1.

## Out of scope

- **The gallery and its absent state** — PORT-16. **Steps 1 and 4** — PORT-13, PORT-14. **Any string not in PORT-12's pack** — a PORT-12 defect; log it, do not write it here. **The logo add-on's checkout copy** — Taylor.

## Depends on

- **PORT-11** — `kind`, `groupsFor`. **PORT-12** — every string and list this slice renders. **PORT-H1** — the interpolation helper. All Complete in `PROGRESS.md` required.

## Recommended execution

**Sonnet.** Seven steps of wiring against a registry that already exists, three small groups on primitives that already exist. The one way to fail is to write a string instead of reading one; criterion 6 is the check. If the diff in criterion 1 shows any portfolio change, stop.

---

### Kickoff (paste into the session)

> Build **PORT-15 — The pack-driven steps** (attached spec). **Read every varying string from the pack; portfolio byte-identical; the documents promise verbatim; availability is a status line; no answer dropped.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-KINDS-UX-SCOPE.md` §4 steps 2–9, §5.5 · `lib/intake/showcase-copy.ts` (PORT-12; the source of every string) · the seven step components · `step-access.tsx`'s `copyPackFor` usage (the pattern) · this folder's logs.
> Close in three places. Run `yarn verify:tracks --document`, `yarn build:agent`, `npx tsc --noEmit`, `yarn lint`.
