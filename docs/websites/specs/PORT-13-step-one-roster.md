# PORT-13 — Step 1 by kind: the kind line with Change, the entity name, stage, and the team roster with headshots

**Epic:** PORT — coded (showcase) intake · **Phase 6** · Size: M
**Slice type:** One step's field groups gated by kind, on precedented primitives (durable's team preamble, showcase's entry-keyed uploads). Risk class: a kind change deleting an answer; a headshot pointing at the wrong person after a removal; a prefilled name re-asked.
**Review:** Mason — `leadPerson` stores an entry key (his ruling below); the kind-change path must be provably non-destructive. Vesper — roster and kind-line states.

**Status:** Complete (2026-09-01) — step 1 is shaped by kind: the kind line with Change, entity name and one-liner labels from the pack, stage for ventures, and the roster with entry-keyed headshots and a lead chosen by key. **The non-destructive kind change is proven at the shape guard**, both directions, plus the lead-is-a-key invariant. All eight durable roster strings byte-identical on both tracks. Durable document byte-identical. **Not browser-verified** — no database in this session to mint an engagement.

> **Review note.** State the non-destruction proof: change an engagement's kind from venture to portfolio with a filled roster, then back, and show the roster and its headshots are byte-identical in the answers document and `intake_files`. State that removing the first of three people leaves the second person's headshot attached to the second person.

---

## Outcome

Step 1 knows what kind of site this is and says so at the top, with a Change link that swaps the questions without touching a single answer. For a venture, the name field asks what it's called, a stage question replaces "how long", and a roster collects the people — name, role, one line, a photo each — and asks who leads. For a portfolio, step 1 is exactly what it was. Representation becomes "Who speaks for it" for entities. The primer's paste box (PORT-10) is not here yet; when it lands it sits above the kind line.

## Why / intent

- **Audit B3** — the subject is always one person; no roster anywhere; `business_name` set to the contact.
- **Kinds scope §4 step 1, §5.1 (KindPicker/KindLine), §5.2 (TeamRoster)** — field order, keys, controls, copy. **D-PORT-11 `[PROPOSED]`** — changing kind changes questions, never answers. **D-PORT-13 `[PROPOSED]`** — the roster reuses durable's two-question preamble verbatim and showcase's entry-keyed uploads; one photo per person; no per-person show flag.
- **D-INT-8** — the name prefilled from the start form (PORT-11 seeds `displayName`) is shown, not re-asked.
- **M-PORT-14** — repeatable entries carry a client-minted key; files point at the key. **PORT-5** — per-entry uploads exist; reuse the path, do not fork.
- **What this slice is NOT (binding):** not the primer (PORT-10); not any other step; not a per-person "show on site" flag (D-PORT-13); not a bio paragraph per person — one line, by design.
- **Ground truth:** `step-about.tsx` (roles block, `KnownFact`, lead-role select) · `app/websites/intake/_components/steps/step-team.tsx` (the durable preamble — pattern and the two verbatim questions) · `project-entry.tsx` (per-entry `FileDrop`, collapse) · `lib/intake/entry-key.ts`.

**Rulings this slice makes (labelled, logged):**

- **`leadPerson` stores the person's `entryKey`, not their name.** (Mason.) `leadRole` stored the typed role text because roles have no key; people do. A renamed person stays the lead. Logged.
- **`KnownFact` is promoted to `app/websites/intake/_components/known-fact.tsx`.** (Mason.) It now has three consumers (contact lines, the kind line, and PORT-14's collapsed rows); the placement rule says extract at two. Durable is untouched by the move (it does not import it). Logged.
- **The kind change re-renders the step client-side and autosaves `about.kind` like any radio.** No route change, no full reload; groups mount or unmount by kind. Because every group's answers live under their own keys, nothing is written on change except `kind`. Logged.
- **The roster's "one line" is a `text` field, not a `long text`.** (Vesper.) The About page needs a sentence; the call or the primer fills the rest. Logged.

## Experience & states

Field order for every kind, per kinds scope §4 step 1: kind line → name → one line → *(portfolio, practice)* roles + lead role → *(venture)* stage → how long *(hidden for venture)* → where based → *(roster kinds)* the roster → contact `KnownFact`s → credentials → affiliations → representation.

**Kind line:** `KnownFact` grammar, mono label `THIS SITE IS FOR`, the kind's label, a dim **Change** text link. Tap → the line swaps for the six-card radio in place (300ms ease, reduced-motion instant), with the dim line beneath: *"Changing this changes the questions, not your answers. Anything you've written stays."* `[COPY — pending Taylor]`. Choosing autosaves; the group collapses back to the line once the save indicator confirms.

**Stage (venture only):** `pick one`, four cards, label/help from the pack (PORT-12).

**Roster (studio, venture, business, other):** *Is it just you?* (`Just me` / `There's a few of us`, durable verbatim) → on *few*: *Do you want them on the site?* (`Yes, put them on the site` / `No, keep it to me`, durable verbatim) → the roster `RepeatableBlock` (add label *"Add another person"*), per entry: name · role or title · one line (placeholder from the pack) · **Their photo** (`FileDrop`, single, entry-keyed under field key `headshot`, revealed once the name has content) → **Who leads?** single select from the names entered, help from the pack; with no names the field explains itself instead of showing an empty group (the `leadRole` grammar). Entries collapse to `index · name · role` with a dim *photo* mark when one exists (M-PORT-15 presentation state).

The roster asks names even when `showTeam` is *No* — the durable step's reasoning; the document labels it accordingly.

**States (exhaustive):** kind line collapsed · open · saving · re-collapsed; stage unselected/selected; roster hidden/shown; per-entry expanded/collapsed; photo empty/uploading/uploaded/failed-retry; lead select empty-state/populated/selected; every inherited field state.

**Failure / edge states (named):** kind changed while a roster entry's upload is in flight → the upload completes against its entry key regardless (the key does not change); a lead whose entry was removed → the select shows no selection and the stored key is left in place (a removed person is restorable within the undo window and the lead survives it); a name cleared after a photo was uploaded → the photo stays attached to the entry (the reveal is for the empty entry, not a delete trigger).

## Non-negotiables (this slice)

- **Changing kind writes `about.kind` and nothing else.** Proven by diffing the answers document before and after a round trip.
- **Headshots are entry-keyed; array position is never the join.**
- **Durable's two preamble questions are verbatim** and the durable step itself is untouched.
- **The prefilled name is shown, never re-asked.**
- **No per-person visibility flag.**
- **Size is the only upload rejection.**

## Data

**Schema changes: none.** **Tables:** `engagements` (answers via the seam) · `intake_files` (entry-keyed rows under field key `headshot`).

**Placement (Mason):** `step-about.tsx` (gains the kind line, stage, roster; reads `kind` and `groupsFor(kind)`) · `app/websites/intake/_components/known-fact.tsx` (promoted) · `app/websites/coded/intake/_components/person-entry.tsx` (the roster's render function + collapse, beside `project-entry.tsx`) · `lib/validators/showcase-intake.ts` (`stage`, `justYou`, `showTeam`, `people[]` with `personEntrySchema { entryKey, name, role, line }`, `leadPerson`) · `[token]/[step]/page.tsx` (pass `kind`, `flavour`, and `headshots` from `listUploads(id, "headshot")`).

**Validators:** `personEntrySchema` beside `experienceEntrySchema`; `stage: z.enum` from the pack's option values; `leadPerson: text`.

## Accessibility

The kind line's Change is a real `button`; on open, focus moves to the first radio; on re-collapse, focus returns to Change. The roster's per-entry inputs carry `aria-label`s (name · role · one line) as the durable team block does. The lead select's empty state is text, not a disabled control. The photo drop announces per file, batched.

## Acceptance criteria (observable — mobile viewport primary; scratch Postgres with a real `intake` bucket or the issuance path exercised to the 400/500 boundary as PORT-5 did)

1. A venture engagement's step 1 renders, in order: kind line · "What it's called…" prefilled with the start-form name · one line · stage · where based · roster · contact facts · credentials · affiliations · "Who speaks for it". A portfolio engagement's step 1 renders exactly what it rendered before this slice (diff). *(Vesper.)*
2. Change kind venture → portfolio → venture on an engagement with a three-person roster and two headshots: `answers.about` differs only in `kind` at each step; `intake_files` rows are unchanged. *(Mason.)*
3. Remove the first of three people; the second person's headshot is still attached to the second person (entry key), and undo within six seconds restores the first with their photo.
4. `leadPerson` holds the chosen person's `entryKey`; renaming that person keeps them lead; with zero people the field shows its explanatory sentence.
5. Durable's *Is it just you?* / *Do you want them on the site?* strings are byte-identical on both tracks (grep both files).
6. Negative: no per-person show flag; no `long text` in the roster; `step-team.tsx` untouched; the durable step 8 renders unchanged.
7. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass; `yarn verify:tracks --document` byte-identical.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `project-entry.tsx` already solves per-entry upload plus collapse; `person-entry.tsx` is that with four fields. Copy the shape.
- The roster's `FileDrop` uses `stepKey: "about"`, `fieldKey: "headshot"`, `entryKey` — the same triple PORT-5 uses for `project_images`.

## Dev's call

Whether the kind radio inside the line reuses `ChoiceGroup` directly (recommended) · collapse threshold for a person entry (name present) · where the reassurance line's marker sits.

## Out of scope

- **The primer paste box** — PORT-10. **Every other step** — PORT-14 (step 4), PORT-15 (the rest). **A person's bio paragraph** — deliberately absent (kinds scope §5.2). **Rendering people in the document** — PORT-14 owns the output sections for all new arrays, in one place.

## Depends on

- **PORT-11** — `kind`, `groupsFor`, the seeded `displayName`. **PORT-12** — stage, roster, and label strings. Both Complete in `PROGRESS.md` required. PORT-5 (entry-keyed uploads) is Complete.

## Recommended execution

**Opus.** The non-destructive kind change and the entry-keyed headshots are two correctness contracts on one screen; a cheaper model builds a roster that works and a Change link that re-renders by clearing state.

---

### Kickoff (paste into the session)

> Build **PORT-13 — Step 1 by kind** (attached spec). **Changing kind writes `kind` and nothing else; headshots are entry-keyed; durable's preamble verbatim; prefill shown, never re-asked.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-KINDS-UX-SCOPE.md` §4 step 1, §5.1, §5.2, D-PORT-11/13 · `step-about.tsx` · `app/websites/intake/_components/steps/step-team.tsx` (pattern + two verbatim strings) · `project-entry.tsx` + `lib/intake/entry-key.ts` (reuse, don't fork) · `PORT-5` · this folder's logs.
> Close in three places. Run `yarn verify:tracks --document`, `yarn build:agent`, `npx tsc --noEmit`, `yarn lint`.
