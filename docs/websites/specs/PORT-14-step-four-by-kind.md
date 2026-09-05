# PORT-14 — Step 4 by kind: offer · piece · service entries, the ask block, the ink claims cluster, and the document sections and flags for all of it

**Epic:** PORT — coded (showcase) intake · **Phase 6** · Size: L
**Slice type:** The one kind-shaped step, plus the output document's reading of it. Risk class: a working screen that quietly omits "not yet"; a claims cluster rendered dim; an ask that reads as a payment or a countdown; a document that prints a raw key or misses a flag on exactly the engagement it exists to protect.
**Review:** Vesper — the ink treatment and the alarm test on the claims cluster; the ask block's refusal to be a pricing table. Mason — the four-array shape on one schema and the output generalisation.

**Status:** Complete (2026-09-01) — step 4 is shaped by kind across four entry arrays; the ask block and the ink claims cluster ship; the intake document renders pieces, offerings, services, and asks as sections and carries four new flags. Verified against a rendered venture document: every section, every enum, the NOT YET marker, no raw keys, and each flag firing on its trigger and silent without it. Portfolio gates unchanged. No arithmetic anywhere near money; one ink treatment on the whole track. Durable document byte-identical.

> **Vesper — alarm and ink review.** State that the claims cluster's intro renders at `--color-ink` and no other intro or group on the track does (grep for the wrapper); that no word in the cluster is "legal", "compliance", "liability", or "risk"; that *Not yet* and *not sure* are full-size cards. **Mason — output review.** State that a venture engagement's markdown prints People, What you're building, What they're asking people to do, and What we can say as sections, each label from the label map, and that the three new flags fire on a seeded trigger and stay silent without one.

---

## Outcome

Step 4 is titled and shaped by kind. A practice lists what it offers; a venture lists what it's building, then what it's asking people to do, then who signs off on the words; a service business lists services with rough prices. A portfolio's step 4 is byte-for-byte what it was. The ask block captures the thing the audit found captured nowhere — invest, apply, book, donate — as plain fields with "not yet" as a full answer and no mechanism that takes money. The claims cluster is the track's one ink treatment. The intake document prints every new array as its own section and carries three new flags. Extraction into the new shapes is PORT-17; this slice's paste box exists but its button is inert for the new modes, exactly as PORT-5 shipped it before PORT-6.

## Why / intent

- **Audit B4, B5** — no ask; no claims guard. **Audit §3 step 4** — the entry shape is a delivered past artefact.
- **Kinds scope §4 step 4 (field order, entry shapes table, hidden fields, collapsed rows), §5.3 (AskBlock, every field and string), §5.4 (the ink cluster, every string, downstream).** **D-PORT-9** — step 4 is the one kind-shaped step. **D-PORT-10 `[PROPOSED]`** — the claims cluster is the track's single ink treatment, on step 4, for every non-portfolio kind.
- **`lib/intake/steps.ts` / `lib/types/intake.ts`** — `emphasis: "ink"` is granted to the step that stops a false claim reaching a live site and "is not granted to a step because the step is long". This slice grants it to a *cluster*, not the step, because step 4 has one job with two halves (kinds scope §4).
- **M-PORT-15** — collapse is presentation state, never persisted. **M-PORT-18** — the document renders projects as sections and flags are deliberately few.
- **D-INT-1 / Vesper law 7** — no urgency near money: the ask block is never a countdown, never a thermometer.
- **What this slice is NOT (binding):** not a payment integration, not a pricing table with arithmetic, not a public "raise progress" widget; not extraction into the new shapes (PORT-17); not the primer (PORT-10); no change to the portfolio path's step 4.
- **Ground truth:** `step-work.tsx`, `project-entry.tsx`, `extraction-block.tsx` (props `mode`, `intro`, `afterLine`), `server/services/output.ts` (`renderProjects`, `showcaseFlags`), `lib/intake/showcase-primer-fields.ts` (`DESCRIPTIONS`, `NON_CRITICAL`), `app/websites/intake/_components/steps/step-pricing.tsx` (the service entry's placeholders).

**Rulings this slice makes (labelled, logged):**

- **Four separate array keys on `work`, not one polymorphic array.** (Mason, M-PORT-23.) `projects` · `offerings` · `pieces` · `services`, each with its own entry schema. A shared `entries[]` with a `shape` discriminator would let a kind change re-read a project as a service; separate keys mean a shape that stops rendering a key leaves its value alone (D-PORT-11). Logged.
- **`asks[]` and the three claims fields live on `work`.** Same step, same schema, same autosave. Logged.
- **Asks are hand-entered; no extraction mode targets them.** (Mason.) Mechanism, destination, and visibility are decisions, not facts a deck states; an extractor proposing "a form on the site" is inventing. The primer likewise skips `asks` (arrays are excluded by construction). Logged.
- **`number` is free text.** (Vesper.) "from €50k" and "tiers, not public" are real answers a numeric validator would refuse. Logged.
- **The ink cluster is a presentation wrapper, `InkCluster`, with a mono label and an ink intro.** It renders once, on step 4, for non-portfolio kinds, and nowhere else; PORT-11's step registry does not gain `emphasis` on step 4 because the step's own intro stays dim. Logged.
- **`renderProjects` generalises to `renderEntries(key, files?)`** and is called for `projects`, `pieces`, `offerings`, `services`, `people` (about), and `asks`. One renderer, six calls; each prints `### {title}` (or name, or the ask label) and its fields by label. (Mason.) Logged.
- **Three flags, each silent without its trigger:** `signOff` non-empty and not equal (case-insensitive, trimmed) to `contactName` → *"Sign-off is {signOff}, not the contact — route the first look to them too."* · `cantSay` non-empty → *"There are things they can't say — read the claims section before writing a word."* · `requiredWording` non-empty → *"Required wording supplied — it must appear exactly as pasted."* `[COPY — pending Taylor]`. Logged.
- **Primer criticality:** `stage`, `number`, `destination`, `signOff`, `cantSay`, `requiredWording`, `price` are critical by the existing rule (money, legal status, claims) — `NON_CRITICAL` is unchanged; `DESCRIPTIONS` gains lines for the new text keys. Logged.

## Experience & states

**Order, non-portfolio kinds:** the fast way (paste box; button inert for the new modes with PORT-5's placeholder line `[COPY — placeholder, removed by PORT-17]`) → the entries block (shape by kind) → the ask block → the claims cluster → organisation (pack options) → say more. **Portfolio:** unchanged. **Studio:** projects (unchanged shape) then ask, claims, organisation, say more.

**Entry shapes** (each a `RepeatableBlock` with entry keys; collapse per M-PORT-15; summary row `index · title · {year | format | status | price}`):

| Kind | Block label | Key | Fields |
|---|---|---|---|
| practice | What you offer | `offerings` | `title` · `format` · `forWhom` · `scope` · `pricePosture` (*On the site · On request · Don't show*) · `price` (revealed when posture = on the site) · `link` · `story` · `placement` (v2's three) |
| venture | What you're building | `pieces` | `title` · `kind` · `status` (*Planned · Underway · Done*) · `when` · `story` · images (`FileDrop`, entry-keyed, field key `piece_images`) · `placement` |
| business · other | Your services | `services` | `title` · `price` (placeholder *"$149, or from $80/hr"*, durable's) · `included` · `duration` · `takesLonger` · `placement` |

`reel` and `topFive` render for portfolio and studio only.

**Ask block** (kinds scope §5.3, every string as written there, `[COPY — pending Taylor]`): block label *What you're asking people to do*, help, add label *Add another ask*; per entry `ask` (eight options) · `forWhom` (placeholder by pack) · `getWhat` · `number` · `mechanism` (five options) · `destination` (revealed for form, request, email) · `visibility` (*Yes, front and centre · Yes, behind a request · Not yet*). Collapsed row `index · ask · mechanism`.

**Claims cluster** (kinds scope §5.4, every string as written): `InkCluster` with mono label `WHAT WE CAN SAY`, intro at `--color-ink`, then `signOff` (`text`) · `cantSay` (`long text`) · `requiredWording` (`long text`), each with its help line.

**States (exhaustive):** per entry expanded/collapsed (never persisted); `price` revealed/hidden by posture; `destination` revealed/hidden by mechanism; piece images per §6.4 upload states; every choice unselected/selected; the paste button inert-with-line; the cluster has no states of its own.

**Failure / edge states (named):** an ask with mechanism = form and no destination → no error, and the document prints "Where it lands: —" so Taylor sees the gap; posture changed from "on the site" to "don't show" after a price was typed → the price stays stored and hidden (D-PORT-11's law at field scale); a kind change from venture to practice → `pieces` stays in the document, `offerings` renders empty-with-one-block; an oversize piece image → the gentle refusal, size only.

## Non-negotiables (this slice)

- **The portfolio path's step 4 is byte-for-byte unchanged** — diff the rendered step for a portfolio engagement.
- **Nothing in the ask block takes, implies, or totals money.** No currency arithmetic, no thermometer, no countdown, no "raised so far".
- **"Not yet" and "not sure" are full-size options; no field is required.**
- **The claims cluster is the only ink treatment under the showcase tree** — grep for the wrapper.
- **No extraction mode is added here** (PORT-17) and no server writes an entry.
- **Every new key has a label before the document is run** — the label sweep (PORT-8 precedent) is a criterion.
- **Size is the only upload rejection.**

## Data

**Schema changes: none.** **Tables:** `engagements` (answers) · `intake_files` (entry-keyed rows under `piece_images`).

**Placement (Mason):** `step-work.tsx` (branches on `kind`; portfolio branch untouched) · `app/websites/coded/intake/_components/offer-entry.tsx`, `piece-entry.tsx`, `service-entry.tsx`, `ask-entry.tsx` (render functions + collapse, beside `project-entry.tsx`) · `app/websites/intake/_components/ink-cluster.tsx` (presentation wrapper; no durable consumer yet, but it is the durable step's own idiom and belongs in the shared folder) · `lib/validators/showcase-intake.ts` (`offeringEntrySchema`, `pieceEntrySchema`, `serviceEntrySchema`, `askEntrySchema`; `stepWorkSchema` gains the four arrays and three text fields; enums from PORT-12's `as const` option values) · `lib/intake/showcase-answer-labels.ts` (already labelled by PORT-12; verify) · `server/services/output.ts` (`renderEntries`, six call sites incl. `people` from PORT-13; three flags) · `lib/intake/showcase-primer-fields.ts` (`DESCRIPTIONS` additions) · `[token]/[step]/page.tsx` (pass `kind`; `pieceFiles` from `listUploads(id, "piece_images")`).

**Validators:** all-optional per the file's law; `entryKey` the sole non-optional on each entry.

## Accessibility

Each block's add button and per-entry remove/undo inherit `RepeatableBlock`. The collapsed summary row is a `button` with `aria-expanded`. `InkCluster` is a `section` with `aria-labelledby` on its mono label; the ink intro is body text, not a heading. `destination`'s reveal does not move focus. Ask and visibility options are full tap-cards (48px). Piece image announcements batch.

## Acceptance criteria (observable — mobile viewport primary; scratch Postgres; document rendered via the existing output path)

1. Venture step 4 renders: paste box (inert) · "What you're building" block · ask block · claims cluster at ink · organisation with the venture options · say more; no reel, no top five. Practice renders offerings with `price` revealing on "On the site". Business renders services with the durable placeholder. Portfolio renders exactly as before (diff). *(Vesper.)*
2. Three asks on a venture — invest/request-a-document/behind-a-request, apply/form/front-and-centre, get-in-touch/email — round-trip through autosave and appear in the document under "What they're asking people to do", each field labelled, "Where it lands" printed for the form and email asks and absent for none.
3. The claims cluster's intro measures `--color-ink` in the computed style; every other step intro and group label on the track measures `--color-dim`; the wrapper occurs once under `app/websites/coded` (grep). *(Vesper.)*
4. Flags: seeding `signOff: "Amy and counsel"` on an engagement whose contact is "Amy" fires the sign-off flag; seeding `signOff: "amy"` does not; `cantSay` and `requiredWording` each fire their flag when non-empty and are silent when empty. *(Mason.)*
5. The document prints People (from PORT-13), the kind's entries block, the asks, and the claims as sections with labelled fields; `collectUnanswered` lists the new keys when blank; the label sweep finds no raw key. *(Mason.)*
6. Kind change venture → practice → venture leaves `work.pieces` byte-identical in the answers document.
7. Negative: no arithmetic on `number` or `price` anywhere (grep for parse/Number on those keys); no extraction call for the new modes (the button renders the placeholder line); `yarn eval:primer --inventory` passes with the new keys described and none in `NON_CRITICAL`.
8. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass; `yarn verify:tracks --document` byte-identical.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `project-entry.tsx` is the pattern for all four new entry files: fields, one optional `FileDrop`, collapse with a summary row. Four small files beat one file with a `shape` switch.
- `renderProjects` already handles images grouped by entry key; `renderEntries` is that with the field list derived from the entry's keys and the label map.
- The step-pricing durable placeholders are strings to copy, not a component to import.

## Dev's call

Collapse threshold per shape (title present) · the summary row's second column per shape (year · format · status · price, per the scope) · `InkCluster` prop shape · exact flag wording within the drafts above.

## Out of scope

- **Extraction into offerings/pieces/services/people** — PORT-17. **The primer's proposals into the new text fields** — PORT-10 (this slice only describes them). **Organisation option lists and the pack strings themselves** — PORT-12 (consumed here). **Any payment mechanism for an ask** — never in this track; Taylor-initiated charges are PORT-9's runbook. **Taylor's pass on the eleven new strings** — Taylor.

## Depends on

- **PORT-11** — `kind`, `groupsFor`, step 4 title/intro. **PORT-12** — option values and strings for the ask block, claims cluster, organisation lists. **PORT-13** — `people[]` for the document's People section. All Complete in `PROGRESS.md` required. PORT-5, PORT-8 Complete.

## Recommended execution

**Opus, and do not choose down.** This is the slice the audit exists for. Its failure mode reads perfectly well: an ask block that works, with "Not yet" quietly dropped as an option because it "had no behaviour"; a claims cluster rendered dim because ink "wasn't in the tokens for a group"; a flag that fires on every engagement because the sign-off comparison forgot to trim.

---

### Kickoff (paste into the session)

> Build **PORT-14 — Step 4 by kind** (attached spec). **Portfolio step 4 unchanged; four separate arrays; nothing takes or totals money; "Not yet" full-size; one ink treatment; three flags silent without triggers; every key labelled.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-KINDS-UX-SCOPE.md` §4 step 4, §5.3, §5.4, §7 alarm test, D-PORT-9/10 · `step-work.tsx` + `project-entry.tsx` + `extraction-block.tsx` (reuse, don't fork) · `server/services/output.ts` (`renderProjects`, `showcaseFlags`) · `lib/intake/showcase-primer-fields.ts` · `app/websites/intake/_components/steps/step-pricing.tsx` (placeholders only) · `TECHNICAL-DECISIONS.md` M-PORT-15, 18, 23 · this folder's logs.
> Close in three places. Run `yarn eval:primer --inventory`, `yarn verify:tracks --document`, `yarn build:agent`, `npx tsc --noEmit`, `yarn lint`.
