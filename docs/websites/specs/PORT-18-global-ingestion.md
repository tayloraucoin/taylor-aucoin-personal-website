# PORT-18 — The global ingestion step, portfolio sub-types, and the fast-way copy

**Epic:** PORT — coded (showcase) intake · **Phase 7** · Size: XL, in five slices
**Slice type:** A new step before "About you" on every coded kind, and the first AI touchpoint on this track that **writes answers**. Risk class: a plausible sentence about a real person or business that nobody said, surviving onto a live website — now at every field at once; a client's unpublished material leaving the trust boundary with anything attached to it; a one-shot action that lies about being one-shot.
**Review:** **Loom — the pipeline topology, the context set, the validators, and the eval, before the prompt. Vesper — the confirmation, the in-progress state, the machine-filled mark. Mason — the transactional write and the step-registry renumber.**

**Status:** **Complete (2026-09-03)** — all five slices. The step is live end to end: paste, files, confirmation, run, machine-filled marks across every step, and a read-only record of what was sent. **Not exercised against a real engagement** — no database is reachable in this session, so the transaction, the one-shot guard under concurrency, and the marks on a real client's answers are verified by reading and by isolated render rather than by a round trip. The eval is live-clean. Slice 1: disciplines widened to eleven, keys unchanged, film-only packs asserted; the fast-way intro moved to the copy pack with a portfolio-correct floor. Slice 2: the coded track is ten steps, `ingest` leads and renders statically (paste and drop live and autosaving, no run button yet), every downstream count derives, the admin stack and the verifier cover it. Slice 3: the kind-scoped inventory, the fan-out service, the pure merge, the guarded transactional store, and the eval — **live run clean, 5 cases, 27 fields and 26 entries, 0 failures**, and the extractor's own 10 cases still pass after three prompt fixes the run caught. Slice 4: the machine-filled mark at every pre-filled field and entry, the intake document's unconfirmed list, and the action joining the service to the store. Slice 5: the button, the confirmation, the focus-trapped in-progress overlay, every failure line, the completed read-only state, and the retirement of `PrimerBlock`. **Taylor ratified all six questions 2026-09-03**: provenance as recommended · coded kinds only · files and links cut here and **mandatory as PORT-21 straight after** (scoped in `PORT-21-files-and-links.md`; PORT-19 and PORT-20 were taken by another thread the same day) · "Ten steps" · Vercel Pro, `maxDuration` at the plan's ceiling (300s; 800s if Fluid compute is on for the project) · the three cuts stand.

> **Loom — cognition review.** The existing primer defends one failure with four layers and this slice removes the first of them by request. Everything below is arranged so the other three carry more, not less.

---

## Outcome

Before "About you", a client meets one screen with one job: *give us everything you already have, once.* They paste whatever explains them — an About page, a deck's text, a bio, an old CV, the offers page — attach the files they would rather not retype, and press one button. A confirmation says plainly that this runs once and what happens if they run it half-ready. A calm in-progress state says how long it takes and that closing the tab is safe. Then the nine steps ahead of them open **mostly filled in**, every machine-written value visibly marked as such until they touch it, with the sentence it came from a tap away. The step itself becomes a read-only summary of what they sent and what it filled.

Step 1's "fast way" paste box disappears into this step. Step 3 and step 4 keep their own "Sort this for me" boxes, and the new step's copy says so: go wide here, not deep.

## Why / intent

- **Taylor, 2026-09-03** (verbatim in the ticket): a step before "About you", for all site types, that takes "a big data dump" — text, files, links, *not* media for display — and uses AI to predict "all values, including the experience/project"; explain that experience need not be detailed here because step 3 has its own dump; a loading overlay; an "are you sure you're ready" on submit because it cannot be re-run; the field inventory scoped to the kind and sub-type; and the rest of the intake "initialized with the db values saved from the AI prediction."
- **PORT-10 (Complete)** — the business primer: `readBusinessPrimer`, the derived inventory in `showcase-primer-fields.ts`, the server-side quote check, the criticality map, the golden set and graders. This slice **extends** every one of those and forks none.
- **PORT-6 / PORT-17 (Complete)** — `sortDocument(mode, text)`: six extraction modes with copy-do-not-compose prompts, live-eval clean. Reused as-is for the entry arrays.
- **D-PORT-3 (binding, inherited)** — nothing saves as fact until the client has seen it. **This slice departs from it by Taylor's explicit instruction**, and the departure is the decision recorded next.

## The decision: provenance in place of seen-first

Taylor's last line — initialise the rest of the intake with the AI's values — removes PORT-10's first defence (nothing the model produces writes an answer). Implemented as asked, with the other three defences kept and one new one added:

1. **Values are written as answers**, into their real step objects, so every step opens pre-filled and editable. What Taylor asked for.
2. **Provenance is kept.** A top-level `answers.ingestion` record (same placement reasoning as `answers.primer`, M-PORT-26: invisible to the intake document by construction) holds the run's status, timestamp, source size and digest, and every field or entry the run wrote — with its supporting quote.
3. **Every machine-filled value is visibly marked until the client touches it.** One component, one treatment, reused at every pre-filled field across nine steps (Vesper § below). The mark shows while the stored value still equals what the machine wrote; editing clears it by construction, with no extra write. The intake document lists the values still carrying the mark at submission, so Taylor knows which ones nobody confirmed.
4. **Critical fields stay quote-or-nothing, and the quote check stays server-side.** A critical field with no verifiable quote is left empty, not guessed. The non-critical allowlist stays three fields long.
5. **Refusal stays a first-class output**, and a run that finds nothing usable is still a run: the step locks, calmly.
6. **A run never overwrites a client's own words.** Fields already answered are skipped; arrays are appended to.

**The tradeoff, named:** we trade D-PORT-3's absolute guarantee — that a machine's sentence is never in the answers document until a human has read it — for a form that arrives mostly answered. The provenance mark and the quote validator are what buy the trade: a wrong value is *labelled* as unconfirmed everywhere it appears, and a value about money, dates, headcount, credentials, legal status, or results cannot exist without a sentence in the client's own material that says it. Recorded as M-PORT-33 (M-PORT-29–32 were taken by PORT-20 the same day) and a DEVIATIONS line when slice 4 lands. **`[PROPOSED — Taylor, see Q1]`.**

## Structure (Mason)

**A real numbered step, not a pre-step screen.** Key `ingest`, number 1, title `[COPY — pending Taylor]` "Everything you already have". The registry renumbers to ten; `stepCountFor("showcase")` becomes 10 and the durable track stays at 9. Everything downstream derives: `StepShell`, `StepProgress`, `ResumeList`, `RecordStepReached`, `collectUnanswered`, the document. Hand-written places that must move: `verify-track-cartridge.ts` (count, keys, titles, `stepByNumber(…, 9)`), `question-stack.tsx`'s dispatch (which renders `UnrenderedStep` loudly until it does), the two admin notes that say "nine steps", and **the welcome screen's "Nine steps." — approved v2 copy, changed by force of the ask (Q4)**.

Why numbered: the progress bar stays honest, the client can navigate back to see what they sent, and the one-shot rule is enforced by *state* — a completed run renders the read-only summary — rather than by hiding a route. A client who skips it can come back and run it later; a client who ran it cannot run it again.

**Schema.** `stepIngestSchema = { dump: text }`. The paste autosaves as an ordinary answer from the moment it is typed (the `fastWay` / `businessPrimer` contract), so a failed run never costs the paste. Files: `FileDrop` with `stepKey="ingest"`, `fieldKey="ingest_documents"`. No links field — see Q3. Labels for both in `showcase-answer-labels.ts`.

**The run record.** `answers.ingestion`:

```ts
type IngestionRecord = {
  status: "ran" | "partial" | "refused";
  ranAt: string;                 // ISO 8601
  sourceChars: number;           // size, never content
  sourceDigest: string;          // sha-256 of the trimmed dump
  fields: IngestedField[];       // what was written, with provenance
  failed: string[];              // which pipeline stages did not land ("fields" | "experience" | "projects" …)
};
type IngestedField = {
  stepKey: string;
  fieldKey: string;
  entryKey?: string;             // for a repeatable entry
  value: string;                 // what the machine wrote, so the mark can compare
  quote: string | null;
  assumed: boolean;
};
```

**The write is one transaction, server-side, guarded.** `saveStepAnswers` replaces a step object wholesale, so the service reads the whole document `FOR UPDATE`, refuses if `answers.ingestion` already exists (the one-shot rule lives in the database, not the UI), merges each touched step's object field by field (skip answered fields, append arrays), and writes every step key plus the record in one `UPDATE`. Never from a client hook.

**Preview.** The action refuses in preview; the step's button reads `useIsPreview()` and says so; document mode renders the prose form. The admin review surface gets the step in its dispatch.

**`PrimerBlock` is absorbed.** `businessPrimer` becomes `@deprecated`, read-only, kept in the schema and label map (the `unions` precedent) so documents already answered still print it. `answers.primer` and `StepProposals` stay readable so in-flight engagements keep their proposals; `runBusinessPrimer` is retired.

## The model's job (Loom)

**One sentence per stage.** Stage A: *read one body of text and report which free-text questions from a kind-scoped list it already answers, quoting the sentence for each.* Stage B (one per array the kind asks): *sort the same text into entries of one shape, copying and never composing.* "Fill in the whole questionnaire" is not one job, so it is not one call.

**Topology.** One run = Stage A in parallel with two or three Stage B calls: `experience` always; the kind's work shape (`projects` / `offerings` / `pieces` / `services`). Wall time is the slowest call, not the sum. One `claimRun` per run, not per call — the shared 25-run counter counts *presses*.

**Context set, positively.** The dump; the kind (so the instruction can name the shape of the thing); the kind-scoped field inventory with description and criticality. **Negatively:** no contact columns, no token, no engagement id, no prior answers, nothing from the durable track. Same allow-list posture as `predictComeAcross`.

**The inventory is derived, never typed.** `showcase-primer-fields.ts` gains `ingestionFieldsFor(kind)`: the existing text-field derivation, filtered by `groupsFor(kind)` / `kindAsks(kind, …)` / `workShapeFor(kind)` so a portfolio's inventory has no `stage`, no `signOff`, no `toolsDetail`, and a venture's has no `reel`. `staleInventoryKeys()` and `yarn eval:primer --inventory` cover the new exclusions. Stage B's output shapes come from the entry schemas exactly as `extract.ts` derives them today.

**Routing.** `claude-sonnet-5` for every stage — pinned by the handoff; changing it is a decision with an eval run attached. A cheaper model for Stage B is the obvious revisit trigger, gated on `yarn eval:extract` passing at the same n.

**Validation before persistence, per item never per run.** Stage A through `keepValidProposals` (unknown key · duplicate · empty · assumption on a critical field · missing quote · quote not in the document). Stage B through the entry schema plus the existing all-blank drop. Then the kind scope is asserted again at the write: a field key outside `ingestionFieldsFor(kind)` cannot be written even if a stage returned it.

**Latency, honestly.** Unmeasured until a key is in the environment. Basis for the estimate: Sonnet output at roughly 50–80 tokens/s; Stage A on a 3–5k-word dump returns 1–3k tokens (10–30s); Stage B on a forty-project catalogue can return 6–8k tokens (60–120s). **p50 perhaps 15–25s; the tail is minutes.** The surface is designed for the tail. `max_tokens` is capped per stage (A 8k, B 8k) so no call can run past the platform's function limit; **the route segment sets `maxDuration` and that number is Taylor's to confirm against the Vercel plan (Q5).**

**Degradation ladder.**

| Rung | What happens | What the client sees | Does the run count? |
|---|---|---|---|
| Empty dump | Refused before any call, no claim | "Nothing to read yet." | No |
| Over 100k chars | Refused, no claim, never truncated | The size, and to paste the parts that matter | No |
| Rate cap | Refused before any call | Calm line; carry on by hand, Taylor reads what you sent | No |
| One stage fails or returns malformed | Its items drop; the others write | Summary names what filled and what did not; step 3/4's own boxes still work | **Yes — `partial`** |
| Every stage fails / model outage / offline | Nothing written, no record | Gold line with Try again; the paste is safe | **No — runnable again** |
| Nothing usable in the dump | Record written with zero fields | Calm, non-blaming line; carry on | **Yes — `refused`** |
| Timeout at the platform | Client sees the failure rung; the server may still finish | Copy says it may finish on its own and the form will be filled when they return | Counts **only if the write lands**; a retry after a landed write is refused by the guard |
| Tab closes mid-run | Server keeps going; write lands or does not | Completed state on return, or the runnable state | Same rule: counts when it lands, never when it starts |

**The dump is never logged.** Not in an error, a warning, a returned payload, or an eval fixture that is not synthetic.

**Eval, before the prompt.** Extend `scripts/eval-primer.ts` and `scripts/evals/business-primer/`: Stage A keeps its eleven cases; new cases 11–16 — a two-line dump · a synthetic 60-page-deck text (~40k chars) · a CV pasted as the whole dump (Stage A near-silent, Stage B `experience` full) · a venture deck run against a portfolio inventory (a mechanical assertion that no venture-only key can appear, not a model grade) · a dump for the wrong business (quotes are what let a human catch it) · a dump where the correct output is almost nothing. Stage B is graded by `evals/extraction/grade.ts` unchanged. The grader self-test runs before any money is spent. Report every number with its n.

## The surface (Vesper)

**One job:** *give us everything you already have, once.* One focal input, generous space, one button. Nothing else on the screen competes with it.

**Copy, all `[COPY — pending Taylor]`, in the pack as `ingestion.*`:** the intro (what to paste, flexed per kind from `primerIntro`'s floor); the **ceiling** ("You don't need to go deep on your work history here — step 3 has a box of its own for that. Go wide."); the **media line**, stated as information and never as a warning ("Photos, video, and the files you want *on* the site come later, in the steps that place them. This step is for words."); the files line, honest about what the reader sees (Q3); the button ("Read it all"); the confirmation; the running state; the completed summary.

**The confirmation** is a destructive-action confirmation in the trust grammar, not a `confirm()`: a card that states this runs once, what a half-ready run costs (the fields it fills are whatever the paste held; you can still type the rest by hand), and a real way back. Two actions: the primary proceeds; the ghost returns. No countdown, no urgency, no red.

**The in-progress state.** Trap focus, block interaction, `role="dialog" aria-modal aria-live="polite"`. Motion settles: one gold hairline breathing at the `--dur-slow` cadence, static under `prefers-reduced-motion`. Copy states the honest range ("Usually under a minute. A big paste can take a few.") and that the tab may be closed. It never dead-ends: a slow request lands in the failure rung or the completed state, and both say what happened to the paste.

**State matrix (the spec):** default · focused · uploading · upload failed · too large · confirming · running · succeeded · partially succeeded · refused (nothing usable) · rate-limited · model outage · offline · completed read-only on a later visit. Empty states are hospitality: the completed summary of a refused run reads as "nothing in there we could turn into an answer — no harm done", never as a mistake.

**The machine-filled mark** — a new trust primitive, defined once:

- Component `MachineFilled` in `app/websites/intake/_components/`; context `IngestionMarksProvider` mounted by the step page with this step's `IngestedField`s; `Field` reads it through `useMachineFilled(fieldKey, currentValue, entryKey?)` and renders the mark when a record exists **and** `currentValue === record.value`. No provider (every durable route, every preview) means no mark and an unchanged DOM.
- Treatment: a mono line in the eyebrow register, `--color-proof-label` (the non-interactive gold twin, by design), reading "Filled in from what you sent"; beneath it the quote in the `StepProposals` idiom (`border-l border-(--color-faint)` · `text-(--color-dim)` · italic), or "A guess from what you sent, not something you said" when `assumed`. No badge, no icon, no colour outside the palette.
- Cleared by editing — by construction, since the comparison fails. Reappears if the client types the machine's words back, which is honest.
- Entries carry the mark on the card's index row, once per entry, not per field.

**Accessibility floor:** WCAG 2.2 AA, 44px targets, focus-visible ring, 200% text scaling, a label on every control, one `aria-live` announcement per state change.

## Scope cuts in this pass (each needs Taylor's nod — Q6)

- **Choice fields** (radios, checkbox groups) are not filled. Their option lists live in the packs and in components, not in the schemas, so an inventory of them would have to be typed — the rule this codebase does not break.
- **`people`** (the roster) is not filled. It sits behind the `justYou` choice, which is a headcount and therefore critical; writing the roster without answering the choice would put values behind a closed reveal (the PORT-14 failure).
- **`asks`** are never extracted (M-PORT-24).
- **File text and URL fetching** — Q3; scoped as PORT-21.

## Questions for Taylor (asked once, before slice 3)

1. **Provenance.** Proceeding on the recommendation above unless you say otherwise: values written, marked until touched, critical fields quote-or-nothing, one-shot enforced in the database.
2. **Scope of "all site types."** Assumed **coded kinds only**. The durable track has no kinds, no packs, no primer; extending it is a second feature.
3. **Files and links.** Recommendation: **cut for this pass, with honest copy** (ratified; scoped as PORT-21). Files still upload and are stored for you; the copy says the reader sees the box and nothing else. Building it means a PDF/DOCX text layer (a dependency, a server-side download of up to 50 MB, scanned PDFs degrading to "stored, Taylor reads it", Keynote impossible), and URL fetching is an outbound request on client-supplied input with an SSRF posture to own. Both are a slice of their own (now scoped as PORT-21) if you want them.
4. **"Ten steps."** The welcome screen's "Nine steps." is approved v2 copy and a locked-scope line. A numbered step 1 makes it ten. Confirm the word, or say how you would rather the welcome read.
5. **Function timeout.** The run's tail is minutes. Which Vercel plan is this on, so `maxDuration` is set to a number the platform honours?
6. **The cuts above.** Choice fields, the roster, asks.

## Slices

1. **Disciplines + fast-way copy** — Complete 2026-09-03. `SHOWCASE_DISCIPLINES` eleven rows, keys stable; `showcaseDisciplines()` on the seam; `primerIntro` in the pack with a portfolio floor and four overrides; verifier asserts film is the only discipline with a pack.
2. **Registry insertion and renumber** — Complete 2026-09-03. `ingest` first in `SHOWCASE_STEP_KEYS`; `stepIngestSchema = { dump }`; labels for `dump` and `ingest_documents`; the `ingestion` copy block in the pack (only `what` flexes); `StepIngest` rendering copy, paste, and drop; the route and the admin stack dispatch it; the welcome screen reads its number word from `stepCountFor`; the verifier asserts ten steps, the new key, title, and intro on every pack.
3. **Inventory and service with its eval** — Complete 2026-09-03. `ingestionFieldsFor(kind)` in `showcase-primer-fields.ts` with four new gating sets and its own drift guard; `lib/intake/ingestion-record.ts` (the record shape and the pure `mergeIngestion`); `server/services/ingestion.ts` (the fan-out, one claimed run per press, degrade per stage); `server/services/ingestion-store.ts` (one transaction under `FOR UPDATE`, the one-shot rule in the database, every step object back through its own shape guard); five new golden cases with kind-scope assertions, a merge self-test, and `yarn eval:ingest:live`. Recorded as M-PORT-33 and M-PORT-34.
4. **The mark and the wiring** — Complete 2026-09-03. `app/websites/intake/_components/machine-filled.tsx` (the provider, two hooks, and the one treatment reused everywhere); `Field` renders it under the control for `TextAnswer` and `LongAnswer`; `MachineFilledEntry` at the five repeatable blocks the run fills; the step page mounts the provider with this step's record; `collectUnconfirmed` and its section in the intake document; `_actions/ingest.ts`; `maxDuration = 300` on the step route. Verified on a throwaway route: marked, cleared-by-edit, assumed-without-quote, entry marked, entry cleared, and no-provider all render exactly as designed.
5. **The surface** — Complete 2026-09-03. `_components/ingest-run.tsx` (the button, the confirmation card, the focus-trapped overlay, seven failure lines from the pack); `StepIngest` renders a read-only record of what was sent once a run exists and drops the button entirely; the `ingest-breathe` keyframe in `globals.css`; `PrimerBlock`, `runBusinessPrimer`, `readBusinessPrimer`, and the `primerIntro` slot deleted, with `businessPrimer` and the stored proposals kept for engagements that already have them. Verified state by state against the served DOM.

## Depends on

- **PORT-10** — the inventory machinery, the quote validator, the eval harness. Complete.
- **PORT-17** — `sortDocument` and its six modes. Complete (live eval clean).
- **ADM-4** — preview mode and document mode. Complete.
