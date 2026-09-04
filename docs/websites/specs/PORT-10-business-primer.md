# PORT-10 — The business primer: one document dump, predictions across the intake

**Epic:** PORT — coded (showcase) intake · **Phase 4** · Size: L
**Slice type:** A second AI touchpoint, earlier and broader than PORT-6's. Risks: fabricated facts reaching a client's live site; a client's document dump leaking into a log; a prediction that reads as a decision.
**Review:** **Loom — prompt contract and eval set, before the prompt is written. Mason — the write path and the `answers` merge.**

**Status:** Complete (2026-09-01) — the paste box on step 1, the grounded service, per-step proposals met beside the questions they answer, and accept/dismiss. **The quote is verified against the document server-side, not trusted from the model**; all six drop rules exercised directly. Proposals live at `answers.primer` and are invisible to the intake document by construction. **Live eval run and clean**: 11 cases, 9 graded, 65 proposals, 0 hard findings, 0 soft. Full recall on case 1 (14 of 14, none missed); the CV pasted in error produced 0 proposals; both empty cases refused before reaching the model.

> **Loom — cognition review.** This slice's failure mode is not a bad UX. It is a plausible sentence about a real business that nobody said, surviving into a live website. Everything below is arranged around that one risk.

---

## Outcome

Early in the coded intake — in Step 1, before the client has answered anything of substance — there is a large box and an invitation to empty their drawer into it. An old About page, a capability deck, a company one-pager, an email they wrote explaining what they do. They paste, they press a button, and the questionnaire ahead of them arrives partly filled: not answered, **proposed**, with each proposal traceable to the sentence it came from and every one of them dismissable.

What they are told not to paste is their professional background. That is asked properly two steps later, by PORT-6's extractor, which is already good at it.

The client's own words are never overwritten. A proposal that lands on a field they have already answered is not applied.

This slice does not read uploaded files, does not fetch a URL, and does not write anything to the site. It turns one blob of text into a set of reviewable suggestions.

## Why / intent

- **Taylor, 2026-09-01** — "Similar to what we have in the experience section where this is a textarea that takes a big blob of text and figures out the answers to it, can we please make one early on in the form, maybe in the about you part, for tell me about the business… The AI should be clear not to make up anything — instead it should look for factual claims, or at the most, reasonable assumptions for non-critical things. Mention not to include your professional background, as that will come later."
- **D-PORT-3 (binding, inherited)** — nothing saves as fact until the client has seen it. PORT-6 established this and it is the reason its extractor writes nothing. This slice is held to the same rule, at a wider blast radius: PORT-6 proposes list entries the client visibly edits; this proposes answers spread across nine steps a client may never scroll back to.
- **`docs/intake/ADMIN-HANDOFF.md` § Cautions** — fabricated or placeholder client material is a legal posture on this project, not a style note. A confidently wrong "12 years in business" is exactly the failure the whole questionnaire exists to prevent.
- **Ground truth to reuse, never rebuild:** `server/services/extract.ts` (Anthropic client, `claude-sonnet-5` pinned, `zodOutputFormat` structured output, rate limiting, `ExtractionUnavailableError` ladder), `app/websites/coded/intake/_actions/extract.ts` (thin action returning a result rather than throwing), `ExtractionBlock` (the paste-and-press UI), and `lib/intake/tracks.ts` `fieldKeysFor` for the field inventory.

**Rulings this slice makes (labelled — ratify or overrule in the executing thread):**

- **Proposals are reviewed per step, where the question lives — not in one wall of suggestions.** A single accept-all screen is faster and is the wrong shape: the client would be approving claims about their own business in bulk, which is how a wrong one gets through. `[PROVISIONAL — Taylor]`
- **A proposal never overwrites an existing answer.** If the field has content, the proposal is dropped silently.
- **Confidence is not shown as a number.** The model returns one, and it is used to decide whether a proposal is offered at all. A percentage on screen invites a client to trust the high ones without reading. `[PROVISIONAL — Taylor]`

## The model's job, in one sentence

Read one document and report which intake fields it contains an answer for, quoting the sentence that supports each.

That sentence is deliberately extractive. It is not "fill in the questionnaire."

## Context design (before any instruction)

**What the model sees:** the client's blob, and a field inventory — key, the question as the client would read it, and the field's type — built from `fieldKeysFor` and the step registry so the list cannot drift from the form.

**What the model never sees:** any other engagement, any prior answers from this one beyond the field list, and anything from the durable track. The blob is the only source of fact.

**Grounding rule (the contract's first clause):** every proposed value must be supported by text in the blob. The model returns the supporting quote alongside each proposal; a proposal without one is invalid and dropped by the validator, not by the prompt's good intentions.

**The one licensed inference,** per Taylor: a *non-critical* field may carry a reasonable assumption, flagged as such. "Non-critical" is enumerated in the spec as a field allowlist — never decided by the model. Anything touching money, dates, headcount, credentials, legal status, or claims about results is critical by definition and is quote-or-nothing.

**Refusal is a first-class output.** "This document does not answer that" must be as easy for the model to return as a proposal, and the eval must contain cases where the correct output is almost nothing.

## Experience & states

Placed in Step 1, above the individual questions.

**Happy path.** Paste → "Read this for me" → a short in-progress state → a line saying how many suggestions were found and where they will appear → the client continues, meeting each suggestion in place, pre-filled but visibly proposed, with the supporting quote available and a one-tap dismiss.

**States:** idle · nothing pasted · running · done with n proposals · done with none found · rate limited · failed · unavailable.

**Failure states (named):** every rung inherits PORT-6's ladder. The blob is saved as an ordinary answer the moment it is typed, before any extraction runs, so a failed read can never cost a client their paste (D-PORT-3). A blob too large for one request is refused with a plain sentence rather than silently truncated — a truncated document produces confident answers about the half the model saw.

**Copy note.** The invitation must say what not to include. Draft, for Taylor's read-aloud pass: *"Anything that explains the business — an old About page, a deck, a one-pager, an email where you explained it well. Skip your own career history; there's a step for that later."*

## Non-negotiables (this slice)

- **Nothing is saved as an answer without the client seeing it.** D-PORT-3, at wider blast radius.
- **No proposal without a supporting quote,** except on the enumerated non-critical allowlist, where the assumption is labelled in the UI.
- **The blob never reaches a log, an error message, an analytics event, or a returned payload it does not belong in.** `extract.ts` already holds this line; hold it here.
- **Proposals never overwrite client-authored answers.**
- **Structured output, schema-validated before anything renders.** Reuse `zodOutputFormat`; an unparseable response is a failure rung, not a best-effort parse.
- **The model identifier is pinned in one place** and changing it is a decision with an eval run attached, per `extract.ts`'s existing note.
- **Preview mode must gate this touchpoint.** It is a fourth server action under a step body; `components/intake/preview-mode.tsx` and the admin preview's audit list both need it (see ADM-2).

## Eval — written before the prompt

The smallest honest golden set that could exist, and it is a deliverable of this slice, not a follow-up:

1. A rich, well-written About page. Expect many grounded proposals.
2. A thin one-paragraph blurb. Expect two or three, and no reaching.
3. A document about a *different* business than the engagement. Expect proposals; this is the case that proves quoting works, since a human reviewing quotes will catch it.
4. A CV pasted in error — the thing the copy tells them not to paste. Expect near-silence, not career answers smeared across the form.
5. A document with numbers in it (revenue, headcount, years). Expect quote-or-nothing on every critical field.
6. Marketing copy full of unfalsifiable claims. Expect the claims not to become facts.
7. Two sentences. Expect one or zero proposals.
8. Empty and whitespace-only.

**Graded criteria, written now:** every proposal traces to a quote actually present in the blob (hard fail if not); no critical field carries an unquoted value (hard fail); recall on case 1 is judged by a human against a hand-made key; case 4 produces fewer than two proposals.

Report every result with its n. Three good samples is not a pass.

## Data

**Schema changes:** likely one column or one answers-document key to hold the blob, mirroring PORT-6's `fastWay`. Taylor reviews and runs any migration. The proposals themselves are **not** persisted as answers — only what the client accepts, through the existing autosave path.

**Placement:** service in `server/services/`, alongside `extract.ts` and sharing its client and rate limiter. Action in `app/websites/coded/intake/_actions/`. UI reuses `ExtractionBlock` if it fits without contorting it; a third mode on that component is cheaper than a second component only if the modes stay legible.

**Validators:** the new field in `lib/validators/showcase-intake.ts`, its label in `lib/intake/showcase-answer-labels.ts`, and the input in the step component — all three, or the answer is silently dropped on save. That law is stated at the top of the validator file.

## Out of scope

- **File and URL ingestion.** Text paste only. Reading a PDF or fetching a site is its own slice with its own failure modes.
- **The durable track.** It has no extractor and this does not give it one.
- **Auto-accepting anything, ever.**
- **Applying proposals to steps 2 through 9 without the client passing through them.**

## Depends on

- **PORT-6** — the extraction service, its rate limiter, and its failure ladder. Complete.
- **ADM-2** — preview gating, so the admin review surface does not fire this. Complete.

## Recommended execution

**Opus, and do not choose down.** The whole slice is a grounding contract, and the failure it guards against reads perfectly well. A cheaper model will write a prompt that produces lovely output on the three cases anyone tries by hand.

---

### Kickoff (paste into the fresh session)

> Build **PORT-10 — The business primer** (attached spec). **Write the eval set before the prompt. Every proposal carries the quote that supports it, or it does not exist.**
> Attach/read first, in order: this spec · `docs/websites/specs/README.md` · `server/services/extract.ts` and `app/websites/coded/intake/_actions/extract.ts` (reuse; do not fork) · `docs/websites/portfolio-intake-questions-v2.md` § Step 1 · `docs/intake/ADMIN-HANDOFF.md` § Cautions · `components/intake/preview-mode.tsx` · repo `CLAUDE.md` · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Nothing is saved as an answer without the client seeing it. The blob never reaches a log. No proposal overwrites a client-authored answer. Gate the new action for preview mode and add it to the ADM-2 audit list. Report eval results with their n.
