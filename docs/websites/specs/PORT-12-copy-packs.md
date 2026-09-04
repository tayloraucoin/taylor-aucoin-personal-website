# PORT-12 — Copy packs: the practice · entity · venture · service strings, option lists, and document labels

**Epic:** PORT — coded (showcase) intake · **Phase 6** · Size: M
**Slice type:** Content-registry authoring against a precise table. Risk class: silent paraphrase of ~90 draft strings so that Taylor's pass edits something other than what Vesper wrote; a slot missed so a client reads generic where a pack string exists; a label missed so the document prints a raw key.
**Review:** Vesper — every string lands as written in the kinds scope §6; the register is hers until Taylor's pass. No code-path review needed.

**Status:** Complete (2026-09-01) — all six packs filled from kinds scope §6. **230 of 230 table fragments verified present by an automated cell-by-cell diff**; the only two flagged were the `(same caution)` sentinel, and all six packs carry that caution. Durable document byte-identical. 16 draft strings marked, 45 v2 strings carried verbatim.

> **Review note.** State that every cell in kinds scope §6.1–6.5 was diffed against the pack file cell by cell, and that `yarn verify:tracks --packs` reports zero unset slots after fall-through and zero unlabelled keys.

---

## Outcome

The four new packs are full. A venture engagement's step 4 is titled "What you're building"; its audience list names investors, members, and residents; its pages list has The offering and Apply or join on it; its voice-note prompt asks why this needs to exist. Every string in kinds scope §6 exists once, in the pack registry, marked as a draft for Taylor's human-hand pass, and every new answer key has a document label. Nothing renders differently yet except step 4's title and intro (which PORT-11 already reads from the pack): the steps that consume the lists and labels are PORT-13, 14, and 15.

## Why / intent

- **Kinds scope §6 (binding for the strings, draft for the words)** — six tables of slot × pack. **§2.2** — packs are layered; a blank cell inherits generic.
- **D-PORT-9 `[PROPOSED]`** — every step but step 4 flexes strings and option lists only; this slice is those strings.
- **README non-negotiable "V2 copy ships verbatim"** — the generic column is v2's approved string wherever one exists, and this slice must not touch those. The new strings are not yet approved; they ship marked so the pass has a grep target (PORT-6 precedent).
- **M-PORT-22** — pack registry in `lib/intake/showcase-copy.ts`, `Partial` packs merged over generic.
- **What this slice is NOT (binding):** no component change; no schema change beyond none; no rendering of any list (PORT-15 renders them); no invention of a string not in §6 — a slot Vesper left blank inherits generic, and a blank is not an invitation.
- **Ground truth:** `lib/intake/showcase-copy.ts` (PORT-11) · `lib/intake/showcase-answer-labels.ts` · `scripts/verify-track-cartridge.ts --packs`.

**Rulings this slice makes (labelled, logged — Reeve):**

- **Draft strings ship, marked, rather than gating on Taylor's pass.** Each new string carries `// [COPY — pending Taylor]` at its definition. The alternative — holding PORT-13/14/15 until ninety strings are ratified — parks the venture path behind a copy edit. Taylor's pass edits one file. Logged.
- **Option lists are pack slots, not component constants.** Audiences, organisation options, pages, reach additions, the tools list — each is a typed array on the pack (`{ value, label }[]`), so PORT-15 renders `pack.audiences` and cannot drift from the table. Stored values are stable keys (`investors`, `members`), never labels. Logged.
- **Interpolation slots are functions on the pack.** `personOptions(name)`, and the step-2 intro and voice-note prompt are plain strings. The pack type says which slots are strings, which are option arrays, which are functions, and the verify script type-checks all of them. Logged.

## Experience & states

**No surface in this slice.** Observable through PORT-11's step 4 title (now flexing for all six) and through the verify script.

**States:** every pack × every slot resolves to a string, an array, or a function; the verify script's `--packs` mode prints the resolved pack for each flavour so a reviewer can read the venture pack top to bottom as a client would meet it.

**Failure / edge states (named):** a slot present on the type but absent on every pack including generic → build-time type error, never a runtime blank; an option value colliding across packs (`press` in two lists) is fine and intended — the value is the stored key.

## Non-negotiables (this slice)

- **Every §6 cell lands as written.** Cell-by-cell diff, stated per table in the closing report.
- **No v2 string changes.** The generic column's existing strings are untouched; `git diff` on the v2-sourced values is empty.
- **Nothing invented for a blank cell.** Blank inherits generic.
- **Every new key in kinds scope §6.6 has a label.** `yarn verify:tracks --packs` fails on an unlabelled key.
- **Draft marker on every new string.**

## Data

**Schema changes: none.** **Tables:** none.

**Placement (inherits M-PORT-22):** `lib/intake/showcase-copy.ts` (the strings) · `lib/intake/showcase-answer-labels.ts` (§6.6 labels, including the file keys `headshot`, `place`, `documents`) · `scripts/verify-track-cartridge.ts` (`--packs` prints and asserts).

**Validators:** none. The option-list *values* this slice defines are the values PORT-13/14/15's schemas will accept; record them as `as const` arrays so those schemas can `z.enum` from them.

## Accessibility

None — no surface in this slice.

## Acceptance criteria (observable)

1. `yarn verify:tracks --packs` prints six resolved packs; zero slots unset after fall-through; zero keys from §6.6 missing a label. *(Reeve.)*
2. For each of §6.1–6.5, a cell-by-cell diff against the pack file is stated in the closing report, table by table, with any deliberate omission named (there should be none). *(Vesper.)*
3. Step 4's title on a seeded venture engagement reads "What you're building"; on practice "What you offer"; on studio "The work"; on portfolio "The work".
4. `grep -c "COPY — pending Taylor" lib/intake/showcase-copy.ts` is at least the number of new strings (state the count).
5. Negative: `git diff` shows no change to any string that existed in `SHOWCASE_COPY` before PORT-11; no component file changed.
6. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Type the pack so that a missing slot on `generic` is a compile error and a missing slot on any other pack is fine (`Required<Pack>` for generic, `Partial<Pack>` for the rest).
- Keep the film pack's four existing strings exactly where PORT-11 moved them.

## Dev's call

Slot naming inside the pack type (follow the §6 slot column) · whether option arrays are per-pack or per-kind where the table says "←" (inherit; do not duplicate).

## Out of scope

- **Rendering any list or label** — PORT-13 (step 1), PORT-14 (step 4), PORT-15 (steps 2, 3, 5, 6, 7, 8, 9). **Taylor's copy pass** — Taylor, editing this one file. **The logo add-on's checkout copy** — Taylor, `content/addon-details.ts` / `scripts/seed-products.ts`, not this track.

## Depends on

- **PORT-11** — the pack registry and the widened type. Complete in `PROGRESS.md` required.

## Recommended execution

**Sonnet.** Mechanical authoring against a precise table; the risky reasoning is already pinned. The failure mode of any model here is paraphrase, and criterion 2's cell-by-cell diff is the only defence — execute it literally.

---

### Kickoff (paste into the session)

> Build **PORT-12 — Copy packs** (attached spec). **Every §6 cell as written, marked draft; v2 strings untouched; blanks inherit, never invented.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-KINDS-UX-SCOPE.md` §2.2, §6 (the source) · `lib/intake/showcase-copy.ts` (PORT-11) · `lib/intake/showcase-answer-labels.ts` · `scripts/verify-track-cartridge.ts` · this folder's logs.
> Close in three places. Run `yarn verify:tracks --packs`, `yarn build:agent`, `npx tsc --noEmit`, `yarn lint`.
