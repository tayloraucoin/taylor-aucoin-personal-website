# PORT-17 — Extraction modes for the new shapes: people · offerings · pieces · services, and the pack-aware experience prompt

**Epic:** PORT — coded (showcase) intake · **Phase 6** · Size: M
**Slice type:** Widening a third-party AI data path to four new output shapes. Risk class: the same as PORT-6, at four times the surface — a plausible invention (a co-founder who does not exist, a price the deck never stated) surviving into a field a client skims; the blob leaving with anything attached to it; an extracted ask (which this slice must never produce).
**Review:** Forge — the data path, as PORT-6. State which failure paths were induced per mode.

**Status:** Complete (2026-09-01) — six modes, one per array key, every output schema derived from the form's own entry schema. The roster gets its own paste block; step 4's mode follows the kind. Eval written before the prompts: 10 cases across the four new modes, graders self-tested. **Live run: 10 of 10 pass**, and it needs no engagement — the eval calls `sortDocument`, which does not touch the per-engagement counter. The run caught a real prompt defect first: the model was deriving words rather than copying them ("founder" from "founded", a composed parenthetical title, "property" where the text said "sanctuary… estate"), and the shared rules now forbid inflection, composition, and parentheticals. Durable document byte-identical.

> **Forge — data-path review.** Verify per mode: the outbound body carries the blob and nothing else; a decoy blob (a deck for a different company) yields entries a reviewing human can catch by reading, never a silent merge; malformed entries drop individually; the run cap is shared across modes (one counter per engagement, not one per mode). State the induced paths: API error · timeout · refusal/empty · over-cap · a blob that is a CV pasted into the people box.

---

## Outcome

"Sort this for me" works on step 1's roster and on step 4's three new shapes. Paste the deck's team slide into the roster's box and three people appear, name and role filled, one-line left blank where the slide did not say. Paste a rate card into a practice's step 4 and offerings appear. Paste the deck's phases into a venture's step 4 and pieces appear with their status left blank unless the text said "underway". Everything PORT-6 promised holds: client-side only, seen-first commit, blob never lost or logged, one pinned model. Asks are never extracted. The experience mode's prompt names the right sources per pack.

## Why / intent

- **PORT-6 (Complete) and M-PORT-5 / M-PORT-16** — one service, structured output from the entry schemas, client-side prefill, per-engagement counter. **D-PORT-3** — nothing extracted reaches the document until seen.
- **Kinds scope §9** — modes `people` and `offer` (split here into the three array keys, per Mason's ruling below); the experience prompt's source list widens per pack.
- **PORT-14's ruling** — asks are hand-entered; no extraction targets them.
- **What this slice is NOT (binding):** no streaming; no extraction on any other step or track; no server-side write; no mode for `asks`; no change to the model string; no second rate limiter.
- **Ground truth:** `server/services/extract.ts` (`ExtractionMode`, `instructionFor`, the entry Zod shapes, `MAX_RUNS`, the counter UPDATE) · `_actions/extract.ts` · `ExtractionBlock` (`mode` prop) · PORT-6's eval approach.

**Rulings this slice makes (labelled, logged):**

- **Mode names are the array keys.** (Mason, M-PORT-24.) `ExtractionMode = "experience" | "projects" | "people" | "offerings" | "pieces" | "services"`. Each mode's output schema is derived from its entry schema in `showcase-intake.ts` minus `entryKey` (PORT-6's rule), so a field added to an entry is a field the extractor can fill and a field removed cannot linger in a prompt. Logged.
- **Enum-valued fields are extracted as their enum or blank, never as free text.** `status` on pieces, `pricePosture` on offerings: the output schema is the enum with an empty-string escape, the prompt says to leave it blank unless the text states it plainly. A "Planned" the deck never said is the invention this feature exists to avoid. Logged.
- **`price` and `number`-class fields are quote-or-nothing in the prompt.** The prompt for offerings and services says: copy a price exactly as written or leave it blank; never round, never convert, never infer "from". Logged.
- **The experience prompt's source hint is a pack slot.** `instructionFor(mode, flavour)` reads one sentence from the pack (PORT-12's paste intro is the client-facing half; the model-facing half lives beside the prompt, per mode, and says the same thing in the model's register). Logged.
- **One counter.** `extraction_runs` is per engagement across all modes; the cap stays 25 `[PROVISIONAL — the number]`. Logged.

## Behavior & states

`ExtractionBlock` on step 1 (roster kinds, above the roster) with `mode="people"`, intro from the pack `[COPY — pending Taylor]`: *"Paste the team page, the deck's team slide, or a few LinkedIn headers. We'll sort out names and roles; you fix what we got wrong."* and after-line *"People appear below. Fix anything we got wrong — nothing saves as fact until you've seen it."* On step 4, the existing block with `mode` = the kind's array key and PORT-12's paste intro; PORT-14's inert placeholder line is removed.

**States:** PORT-6's matrix, unchanged, per block: default · nothing pasted · running · done · re-run (append, never overwrite an edited entry) · failed · rate-limited · link.

**Failure / edge states (named):** a CV pasted into the people box → the prompt's "extract PEOPLE, not positions" rule yields at most the author as one person (acceptable) or nothing (correct); a blob naming a price in two currencies → both copied verbatim into `price` or left blank, never converted; over-cap on step 1 → the same calm line as step 4; parallel double-press across two blocks on one engagement → the atomic counter admits one.

## Non-negotiables (this slice)

- **No mode for `asks`. Ever.**
- **The outbound request carries the blob and nothing else about the engagement**, per mode. Model string `claude-sonnet-5` exactly.
- **Nothing extracted is written server-side.**
- **Enum and money fields are quote-or-nothing; blank is a correct answer.**
- **One counter, shared across modes.**
- **The blob is never logged, in any mode.**

## Data

**Schema changes: none.** **Tables:** `engagements` (`extraction_runs` counter; answers untouched by server code).

**Placement (Mason):** `server/services/extract.ts` (widen the mode enum; derive the four new result schemas; `instructionFor(mode, flavour)`) · `_actions/extract.ts` (input enum widened; step key check widened to `about | experience | work`) · `step-about.tsx` (the people block for roster kinds; `onEntries` appends to `people` with minted entry keys) · `step-work.tsx` (mode by kind; placeholder line removed) · `lib/intake/showcase-copy.ts` (the people-block strings and the per-pack model-facing source hints — or beside the prompt if Mason prefers; one home either way, stated in the closing report).

**Validators:** output schemas derived, never hand-typed.

**AI notes:** structured output via `zodOutputFormat`, one non-streaming call per press, `max_tokens` bounded as PORT-6. Eval, written before the prompt (PORT-10's discipline): per mode, one rich blob, one thin blob, one decoy (another company), one wrong-shape paste (a CV into people; a team page into services), one with numbers, empty. Graded: no entry contains a value absent from the blob (hard fail); enum fields blank unless stated; case "wrong shape" yields fewer than two entries.

## Accessibility

Inherits PORT-6: `aria-live="polite"` per block, one announcement per transition; two blocks on step 4 never announce at once because only one exists per kind; step 1's block is above the roster and its after-line is text in flow.

## Acceptance criteria (observable — real API key locally; induced failures via a bad key and a forced cap; server logs grepped)

1. Step 1 (venture): pasting a three-person team slide yields three `people` entries with name and role, `line` blank where unstated, each with a minted `entryKey`; nothing reaches the answers document until the next autosave (DB check). *(Forge.)*
2. Step 4: practice → offerings from a rate card with `price` copied verbatim and `pricePosture` blank; venture → pieces with `status` blank unless the text said so; business → services with `price` verbatim.
3. Decoy: a deck for a different company pasted into pieces yields entries whose titles a human reading them recognises as foreign — stated in the report with the titles.
4. Wrong-shape: a CV pasted into the people box yields fewer than two people.
5. The 25th run across any mix of modes succeeds and the 26th is rate-limited; the counter is one column, incremented once per press.
6. Privacy: outbound body per mode contains the blob and no name, email, phone, token, or id (state how verified); server logs across all runs contain no blob text.
7. Negative: no `asks` mode exists (grep the enum); no server write of entries (code inspection); the experience mode's behaviour on a portfolio engagement is unchanged (same prompt text when flavour is film or generic).
8. The eval set exists in the repo beside PORT-6's, with results reported per case and their n.
9. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Derive the result schemas with a small helper (`resultFor(entrySchema)`) that omits `entryKey` and maps enums to `enum | ""`; four hand-typed copies will drift.
- Keep the shared prompt block from PORT-6 verbatim; add per-mode paragraphs in its register.

## Dev's call

Where the model-facing source hint lives (pack vs prompt module — one home) · `max_tokens` per mode · the eval fixture format (reuse PORT-6's if one exists).

## Out of scope

- **Asks** — never extracted; PORT-14. **The primer** — PORT-10 (it proposes into text fields across steps; this sorts blobs into arrays on two steps). **File or URL ingestion** — not in this epic. **Taylor's pass on the two new client-facing strings** — Taylor.

## Depends on

- **PORT-6** — the service, counter, failure ladder. Complete. **PORT-13** — the roster (`people`). **PORT-14** — the three step-4 arrays. Both Complete in `PROGRESS.md` required.

## Recommended execution

**Opus.** Four new shapes on a third-party data path whose worst failure reads perfectly well; a cheaper model writes prompts that produce lovely output on the three cases anyone tries by hand and infers "Planned" for every phase in a deck.

---

### Kickoff (paste into the session)

> Build **PORT-17 — Extraction modes** (attached spec). **Client-side only; blob and nothing else; enum and money fields quote-or-nothing; one counter; no asks mode; model pinned.**
> Attach/read first, in order: this spec · `specs/README.md` · `PORT-6` (the contract — reuse, don't fork) · `server/services/extract.ts` + `_actions/extract.ts` · `../CODED-INTAKE-KINDS-UX-SCOPE.md` §9 · `PORT-14` (the entry schemas) · `PORT-10` § Eval (the discipline) · `TECHNICAL-DECISIONS.md` M-PORT-5, 16, 24 · this folder's logs.
> Close in three places. Run the eval and report per case; `yarn build:agent`, `npx tsc --noEmit`, `yarn lint`.
