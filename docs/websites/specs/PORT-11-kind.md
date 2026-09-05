# PORT-11 — Kind: the one answer the cartridge reads — start-form picker, `kind` in answers, resolver rewire, pack registry widened

**Epic:** PORT — coded (showcase) intake · **Phase 6** · Size: M
**Slice type:** Seam work on the cartridge (M-PORT-1) plus one public-form change. Risk class: an existing engagement rendering differently tomorrow than it did today; a durable-track regression through a shared seam; a start-form string drifting from the approved doc.
**Review:** Mason — the resolver change and the `business_name` amendment (M-PORT-3) are his seams; counter-propose in `TECHNICAL-DECISIONS.md`. Vesper — the start form's kind picker states.

**Status:** Complete (2026-09-01) — one single-select kind drives the packs, the groups, and step 4's title; the durable document is byte-identical and every pre-PORT-11 engagement resolves to the pack it resolved to yesterday. 45 cartridge assertions pass. All six kinds exercised in a browser against the running form. **The answer key is `siteKind`, not `kind`** — see `DEVIATIONS.md` and M-PORT-25.

> **Mason — seam review.** State three things: (1) `yarn verify:tracks --document` produces a byte-identical durable document before and after; (2) every pre-existing showcase engagement in the scratch database resolves to the same flavour it resolved to before this slice (derivation from `siteKinds`); (3) every kind resolves to a pack and every pack resolves every slot with fall-through, asserted by the verify script rather than by inspection.

---

## Outcome

The public start form asks one question the system actually reads: **"What is this site for?"**, six tap-cards, one answer, stored as `about.kind`. Disciplines are asked only when the answer is portfolio or studio; a name-of-the-thing field is asked for every other kind and becomes the engagement's business name. `flavourFor` reads kind first and disciplines second, and the pack registry can hold six packs with fall-through to generic. Step 4's title and intro come from the pack. Every engagement that exists today resolves exactly as it did yesterday. No step body changes in this slice beyond step 4's title and intro string; the roster, the ask block, the pack strings, and the gallery sets are PORT-13, 14, 12, and 16.

## Why / intent

- **Audit B2** — `siteKinds` is collected and read by nothing; flavour reads only `disciplines`, requires exactly one, has one pack.
- **Kinds scope §2.1, §3 (binding for behaviour)** — the six kinds, their labels, the pack map, the conditional reveals, the derivation rule for existing rows. **D-PORT-8 `[PROPOSED]`** — one single-select kind is the flavour input; the site-kind group retires.
- **M-PORT-1** — one home per registry, one resolver across tracks. This slice widens the cartridge; it does not add a machine. **M-PORT-3 amended here** — `business_name` from the start form for non-portfolio kinds.
- **D-INT-5 / D-PORT-9 `[PROPOSED]`** — nine steps hold; `showcaseSteps(flavour)` already takes the argument that lets step 4's title flex.
- **What this slice is NOT (binding):** no new step bodies; no roster; no ask block; no pack strings beyond step 4's title and intro lead (the rest is PORT-12, and until it lands every new pack falls through to generic, which is correct and complete); no gallery change; no migration.
- **Ground truth:** `lib/intake/showcase-steps.ts` (`SHOWCASE_COPY`, `flavourFromDisciplines`, `showcaseSteps`) · `lib/intake/tracks.ts` (`flavourFor`, `copyPackFor`) · `showcase-start-form.tsx` + `_actions/start.ts` · `scripts/verify-track-cartridge.ts`.

**Rulings this slice makes (labelled, logged — Mason, M-PORT-21/22):**

- **`kind` lives in the answers document at `about.kind`, not in a column.** `flavourFor` already reads answers; a column is a migration Taylor runs for a filter the admin does not have yet. Revisit when the admin wants to filter engagements by kind. Logged as M-PORT-21.
- **Existing engagements derive a kind from `siteKinds` in the resolver, never by backfill.** portfolio → portfolio · consultant or speaker → practice · studio → studio · other → other · none → portfolio. A backfill is a write to rows Taylor has not asked to touch; a derivation is a pure function that can be deleted once no row lacks a kind. Logged (M-PORT-21).
- **Packs are layered.** `generic` is complete; every other pack is `Partial<ShowcaseCopyPack>` and `copyPackFor` merges it over generic. The type `ShowcaseFlavour` keeps its name and widens to the six packs, because every step component already takes `flavour` and renaming it is churn with no behaviour. `[ASSUMPTION: reversible, logged]`. Logged as M-PORT-22.
- **The pack registry moves to `lib/intake/showcase-copy.ts`.** `showcase-steps.ts` keeps the step registry and imports the packs for step 4's title and intro. The import law extends: nothing imports `showcase-copy.ts` except `showcase-steps.ts` and `tracks.ts`. Logged (M-PORT-22).
- **`siteKinds` and `siteKindsOther` stay in the schema and label map, deprecated and read-only,** exactly as `unions` did (v2 amendment 2026-09-01). Dropping them would delete an answer from the document on the next save. Logged.
- **Studio resolves to the `entity` pack; its disciplines answer selects the gallery only.** Per the kinds scope table. Logged.

## Experience & states

**Start form**, field order per kinds scope §3: name · email · phone · **What is this site for?** (`ChoiceGroup` radio, six cards, none disabled, help *"Pick the one that leads. If you're a mix, the questions inside have room for the rest."* `[COPY — pending Taylor]`) · **What's the work?** (existing disciplines group, verbatim, revealed for portfolio and studio, its help line moved from the "Something else?" text field up to the group — §6.5 reveal law, 300ms, in place, reduced-motion instant) · **What's it called?** (`text`, revealed for every kind except portfolio, placeholder *"Holistica, or Northshore Physio, or whatever's on the door."* `[COPY — pending Taylor]`) · **What you do, in one line** (label reads *"What it is, in one line"* for studio, venture, business, other — same key) · current website · honeypot.

The old "What kind of site is this?" checkbox group is removed from the form. Its `siteKinds` values are no longer written by anything.

**Start action:** `startShowcaseIntakeInput` gains `kind` (enum of six, optional) and `entityName` (text, optional). `businessName` = `entityName` when kind is not portfolio and `entityName` is non-empty, else `contactName`. Seeds `about.kind`, and `about.displayName = entityName` for non-portfolio kinds so step 1 opens with the name filled.

**Resolver:** `kindFor(answers)` in `lib/intake/showcase-kinds.ts` (kind table: key · label · pack · groups) returns the stored kind or the derivation. `flavourFor` becomes: kind portfolio → `flavourFromDisciplines` (film or generic, unchanged); studio → `entity`; practice → `practice`; venture → `venture`; business → `service`; other → `generic`. `groupsFor(kind)` returns the set `{roster, ask, claims, documents, stage}` per the kinds table, for PORT-13/14/15 to read.

**Step 4 title and intro:** `showcaseSteps(flavour)` reads `copyPackFor(flavour).workTitle` and `.workIntroLead` / `.workIntroTail`. In this slice only `generic` and `film` carry values (the v2 strings, unchanged); the four new packs are empty partials and fall through. PORT-12 fills them.

**States (exhaustive), start form:** kind unselected (no error, no gate) · kind selected · disciplines revealed / hidden · name-of-thing revealed / hidden · one-line label flexed · email blur validation unchanged · pending submit · honeypot filled.

**Failure / edge states (named):** an engagement created with no kind → resolver returns portfolio (the derivation's none case) and step 1 shows the kind line (PORT-13) so it can be set; a stored kind outside the enum → treated as absent, never thrown; an old engagement with `siteKinds: ["consultant","studio"]` → derivation picks the first match in the order practice > studio > other > portfolio, deterministic, logged in code.

## Non-negotiables (this slice)

- **Every existing showcase engagement resolves to the same flavour after this slice as before it.** Proven against the scratch database, stated in the closing report.
- **The durable track is byte-for-byte unchanged** — `yarn verify:tracks --document` before and after.
- **Every kind maps to a pack; every pack resolves every slot** — asserted by the verify script, not by reading the file.
- **No pre-existing answer key is removed from any schema.**
- **Start-form v2 strings that stay, stay verbatim.** The new strings ship marked `// [COPY — pending Taylor]`.
- **No new step bodies.** If a change here would need one, stop; it belongs to 13/14/15.

## Data

**Schema changes: none** (`about.kind` is a key in the existing JSONB answers document).

**Tables:** `engagements` (answers merge via the seam; `business_name` write on create).

**Placement (Mason):** `lib/intake/showcase-kinds.ts` (new: `SHOWCASE_KINDS`, `ShowcaseKind`, `kindFor`, `groupsFor`, the derivation) · `lib/intake/showcase-copy.ts` (new: `SHOWCASE_COPY` moved here, `ShowcaseCopyPack` widened with the slot list from kinds scope §6 typed but mostly unset, `resolvePack(flavour)` with fall-through) · `lib/intake/showcase-steps.ts` (imports the packs; `SHOWCASE_DISCIPLINES` stays) · `lib/intake/tracks.ts` (`flavourFor` rewired; `kindFor` and `groupsFor` re-exported through the seam; `copyPackFor` returns the merged pack) · `lib/validators/showcase-intake.ts` (`kind` on `stepAboutSchema` and on `startShowcaseIntakeInput`; `entityName` on the start input; `siteKinds` marked `@deprecated`) · `lib/intake/showcase-answer-labels.ts` (`kind: "Kind of site"`) · `showcase-start-form.tsx` · `_actions/start.ts` · `scripts/verify-track-cartridge.ts` (new assertions).

**Validators:** `showcaseKindSchema = z.enum([...])`; `about.kind: showcaseKindSchema.optional()`.

## Accessibility

The kind group is a `fieldset` with the question as legend (existing `ChoiceGroup`). The two conditionals reveal below their trigger; focus is not moved on reveal. The one-line field's label changes text by kind and the input's accessible name follows it. Removing the disabled-option treatment removes the only `aria-disabled` cards on the form.

## Acceptance criteria (observable — scratch Postgres with pre-existing showcase rows seeded)

1. The start form renders the six-card kind question; choosing portfolio or studio reveals disciplines in place; choosing any other kind reveals "What's it called?"; the one-line label flexes. No card is disabled. *(Vesper.)*
2. Submitting with kind = venture and name "Holistica" creates an engagement whose `business_name` is "Holistica", `answers.about.kind` is `venture`, and `answers.about.displayName` is "Holistica". Submitting with kind = portfolio leaves `business_name` = contact name.
3. Three seeded pre-existing engagements — `siteKinds: ["portfolio"]` + one film discipline; `siteKinds: ["consultant"]`; no `siteKinds` at all — resolve to film, practice, and portfolio-generic respectively via `flavourFor`, and the first renders exactly the step intros it rendered before (diff the rendered step 4 intro). *(Mason.)*
4. `yarn verify:tracks` asserts: every kind → a pack; every pack resolves every `ShowcaseCopyPack` slot (fall-through covers unset); durable `--document` output byte-identical to the pre-slice run. *(Mason.)*
5. Step 4's title reads "The work" for a portfolio engagement and, with the four new packs empty, also "The work" for a venture engagement (fall-through proven; PORT-12 changes it).
6. Negative: no step body other than the step 4 title/intro changed (diff the nine step components: only `page.tsx` and the seams); no schema key removed; `siteKinds` still labelled in the document for an old engagement.
7. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `flavourFromDisciplines` stays as-is and is called only on the portfolio branch; do not fold it into the kind switch.
- The verify script already has a `--document` oracle; add a `--packs` mode rather than a second script.
- The type name `ShowcaseFlavour` is kept on purpose (M-PORT-22); do not rename it across the components in this slice.

## Dev's call

Exact enum ordering of the derivation · whether `groupsFor` returns a `Set` or a record of booleans · where the `[COPY — pending Taylor]` marker sits on the two new strings.

## Out of scope

- **Pack strings beyond step 4's title/intro** — PORT-12. **Kind line with Change on step 1, the roster, stage, entity name label** — PORT-13. **Step 4 shapes, ask block, claims cluster** — PORT-14. **Pack-driven lists on the other steps** — PORT-15. **Gallery sets by pack** — PORT-16. **A `kind` column** — revisit trigger in M-PORT-21.

## Depends on

- **PORT-1** — the seam (`tracks.ts`) and the verify script. Complete. **PORT-2** — the start form and action. Complete.

## Recommended execution

**Opus.** The value of this slice is that nothing visible changes for anyone who exists today while the seam underneath changes shape; a cheaper model widens the type, wires the happy path, and quietly resolves an old consultant engagement to portfolio because the derivation felt like an edge case.

---

### Kickoff (paste into the session)

> Build **PORT-11 — Kind** (attached spec). **Existing engagements resolve exactly as before; durable byte-identical; every kind → pack → every slot, asserted by script.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-KINDS-UX-SCOPE.md` §2, §3, §11 · `../CODED-INTAKE-CATEGORY-AUDIT.md` B2 · `lib/intake/showcase-steps.ts` + `tracks.ts` + `scripts/verify-track-cartridge.ts` (reuse, don't fork) · `showcase-start-form.tsx` + `_actions/start.ts` · `TECHNICAL-DECISIONS.md` M-PORT-1, 3, 21, 22 · this folder's logs.
> Close in three places. Run `yarn verify:tracks`, `yarn build:agent`, `npx tsc --noEmit`, `yarn lint`.
