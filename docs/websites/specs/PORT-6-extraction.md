# PORT-6 — "Sort this for me": the extraction service, action, client prefill, and its state machine

**Epic:** PORT — portfolio intake · **Phase 3** · Size: M
**Slice type:** Third-party AI data path + a stateful client primitive. Risk class: a client's paste leaving the trust boundary wrongly, or being lost; extracted fiction saving as fact.
**Review:** Forge (the data path) — the blob is answer content transiting a third party.

**Status:** Complete (2026-08-26) — 16 server-side checks pass against a captured request: the outbound body carries the blob and no name, email, phone, token, or id; the model is pinned; malformed entries drop individually; the cap holds atomically; an empty paste spends no run. Browser-verified: entries appear, a re-run appends without touching an edited entry, and a failure keeps the paste with a gold retry line. **One divergence found and routed to Taylor — see M-PORT-16.**

> **Forge — data-path review.** Verify: the Anthropic call carries the blob and nothing else about the engagement (no name, email, token, id); the blob appears in no log, no error message, no analytics; extracted entries reach the answers document only through the normal autosave triggers; the rate-limit counter cannot be bypassed by parallel requests. State which failure paths were induced: API error · timeout · refusal/empty result · over-cap.

---

## Outcome

The fast way works. On steps 3 and 4, pasting a messy career blob and pressing **Sort this for me** fills the repeatable blocks below with structured entries — client-side only, visually identical to hand-made entries, committed by the user's own next blur or step change, never by the server. The blob survives every failure. Runs are counted per engagement and capped. The Durable track has no extraction anywhere.

## Why / intent

- **V2 doc "The fast way" blocks (binding, verbatim)** — steps 3 and 4's copy: "Paste everything — your LinkedIn, your old site's about page, your CV, your IMDb bio. One big messy blob is perfect." · placeholder "Paste it all here — don't tidy it." · button "**Sort this for me**" · the after-lines ("Entries appear below, filled in. Fix anything we got wrong — nothing saves as fact until you've seen it." / "Projects appear below, filled in as far as the blob allowed. Add links and images to the ones that matter.").
- **Handoff decision 6 + M-PORT-5** — one server endpoint, model pinned **`claude-sonnet-5`**, blob in → structured entries out, **prefilling client-side only**; rate-limit per token; on failure the blob is never lost.
- **D-PORT-3 (UX scope §6.1)** — commit semantics: entries render as ordinary editable blocks and reach the answers document via the normal autosave triggers; the blob field autosaves independently beforehand (PORT-5 laid this). Re-runs **append** and never touch a user-edited entry. The full state matrix: default · running · success · re-run · failure · rate-limited.
- **UX scope §8** — the six `[COPY — new]` strings ("Nothing to sort yet — paste something in first." · "Reading it through…" · the failure line · the rate-limit line, plus the two on other surfaces) are **drafts pending Taylor's human-hand pass** — ship them marked in code with a `// [COPY — pending Taylor]` comment so the pass has a grep target.
- **What this slice is NOT (binding):** no server-side write of extracted entries, ever; no streaming UI; no extraction on any other step or track; no retry loops hammering the API (one run per press).
- **Ground truth:** PORT-5's entry blocks, entry keys, and autosaving blob fields — the prefill target exists; this slice fills it.

**Rulings this slice makes (labelled, logged):**

- **Extraction output schema = the step's entry schema**, derived from the same Zod definitions in `lib/validators/showcase-intake.ts` (minus `entryKey`, which the client mints on receipt) — one shape authority; the service validates the model's output against it and drops malformed entries individually rather than failing the run. Logged.
- **"User-edited" for re-run protection means: any field of an entry changed after it rendered** — tracked client-side per entry; appended results never replace or merge into such entries. Logged.
- **Cap 25 runs per engagement** via `engagements.extraction_runs`, incremented atomically in the service before the API call (`UPDATE … SET extraction_runs = extraction_runs + 1 WHERE … AND extraction_runs < 25 RETURNING` — the predicate is the gate, same shape-law as M-INT-15) `[PROVISIONAL — the number]`. Logged.

## Behavior & states

Anatomy per UX scope §6.1: generous blob box (8-row min), GhostButton (the step's Continue stays the only gradient CTA). Press → action (token, stepKey, blob) → service: gate the counter, call the API, validate, return entries → client mints entry keys, appends below existing entries, shows the v2 after-line once.

**States (exhaustive — the §6.1 matrix, binding):**

| State | Behavior |
|---|---|
| Default | Button always enabled. Empty-box press → dim inline line (the `[COPY — new]` string), no color, not an error |
| Running | Button label swaps to the running string and disables; blob read-only but legible; no spinner; `aria-live="polite"` start + finish |
| Success | Entries appear with the eased reveal; after-line renders once above them; entries visually identical to hand-made — no badge, no robot iconography |
| Re-run | Appends; user-edited entries untouched |
| Failure | Blob untouched; gold line + inline Retry text link; never modal; Continue still works |
| Rate-limited | Same shape, calmer copy; no error state |

**Failure / edge states (named):** API 4xx/5xx and timeout → failure state; model refusal or zero valid entries → failure-shaped with the same line (the user cannot distinguish and should not need to); over-cap → rate-limited; parallel double-press → second press no-ops client-side while running (and the counter's atomic gate holds regardless); navigation mid-run → run result discarded, blob already saved, no orphan state.

## Non-negotiables (this slice)

- **Nothing extracted reaches the answers document until the user has seen it** — the server never writes entries; only autosave commits them.
- **The blob is never lost and never logged** — not in errors, not in warnings, not in the action's failure payloads.
- **The API call carries the blob and nothing else about the engagement.** Model pinned `claude-sonnet-5` — a different model is a deviation, not a preference.
- **Malformed model output degrades per-entry, never per-run** — mirroring the autosave law (a save never fails whole).
- **The six new strings ship draft-marked** — Taylor's copy pass has a grep target.

## Data

**Schema changes: none** (`extraction_runs` landed in PORT-1).

**Tables:** `engagements` (counter UPDATE via the seam's id; answers untouched by this slice's server code).

**Placement:** `server/services/extract.ts` (the service: gate, prompt, call, validate — prompts colocated per mode `experience | projects`) · a thin action under the showcase `[token]/_actions/` · client state machine inside the two step components (extend PORT-5's blob block from inert to live) · `lib/env.ts` gains `ANTHROPIC_API_KEY` via the static-literal switch (M-INT-22 — a dynamic lookup is invisible to the build-time collapse) · `.env.example` updated.

**Validators:** action input (token · stepKey restricted to `experience | work` · blob bounded ~100KB `[dev's call on the exact bound — refusal must be the gentle line, not a crash]`); output schemas derived from the entry schemas.

## Accessibility

`aria-live="polite"` on state transitions (start, finish, failure — one announcement each, no storms); the read-only running blob keeps its label association; Retry is a real link; the after-line is text in flow, not a toast; reduced motion collapses the entry reveal.

## Acceptance criteria (observable — real API key in local env; induced failures via a bad key / forced cap)

1. Step 3: pasting a real messy bio and pressing the button yields experience entries in the blocks, editable, identical in appearance to hand-made ones; the after-line renders once. Step 4 likewise for projects.
2. Commit semantics: after extraction, the answers document (DB check) contains **no** extracted entries until a blur or step change; after one, it contains exactly what was on screen.
3. Re-run appends; an entry the tester edited beforehand is byte-unchanged after the second run.
4. Induced API failure → the failure line, the blob intact in the box **and** already in the answers document from its own autosave; Retry works.
5. The 25th run succeeds, the 26th returns the rate-limited state (seed the counter); parallel double-fire consumes one run (DB counter check).
6. Privacy: server logs across all runs contain no blob content (grep the dev server output); the outbound request body contains no engagement identity (inspect via the SDK's logged request or a local proxy — state how verified).
7. The two blocks' v2 copy is verbatim; the six new strings carry the `[COPY — pending Taylor]` marker in code.
8. Negative: no extraction UI or route reachable on the Durable track; no server-side answers write in `extract.ts` (code inspection); model string is `claude-sonnet-5` exactly.
9. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `@anthropic-ai/sdk`, pinned exact. Use the API's structured-output support (`output_config.format`) with the JSON schema derived from the Zod entry schema — not freeform-text parsing, and not the deprecated `output_format` parameter; assistant-prefill steering returns 400 on this model family. A single non-streaming call with a bounded `max_tokens` is right at this payload size.
- Keep the prompt boring and extractive: verbatim-preserving, no embellishment, explicit "omit what the blob doesn't state" — hallucinated credits are this feature's worst failure and the prompt is the only defense the seen-first law doesn't already cover.
- Cost at Sonnet 5 rates is fractions of a cent per run — the cap bounds abuse, not budget; don't add caching machinery.

## Dev's call

Blob size bound · prompt wording (within the extractive constraints above) · client tracking of "user-edited" (dirty map keyed by entry key) · timeout value.

## Out of scope

- **The blob boxes' base rendering and autosave** — PORT-5, done. **Any other AI touchpoint** — none exist in this epic. **Copy ratification of the six new strings** — Taylor.

## Depends on

- **PORT-5** — entry blocks, entry keys, autosaving blob fields (the prefill target). Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** The seen-first commit semantics plus the privacy posture plus per-entry degradation is a lot of contract in one small feature; choosing down produces a working demo that writes server-side "for simplicity" — the exact violation the law names.

---

### Kickoff (paste into the session)

> Build **PORT-6 — Sort this for me** (attached spec). **Client-side prefill only; the blob is never lost and never logged; the call carries the blob and nothing else; model `claude-sonnet-5` pinned.**
> Attach/read first, in order: this spec · `specs/README.md` · `../portfolio-intake-questions-v2.md` "The fast way" blocks (the copy source) · `../PORTFOLIO-INTAKE-UX-SCOPE.md` §6.1, §8 · `PORT-5` (entry keys + blob autosave — reuse, don't fork) · `../PORTFOLIO-INTAKE-TECH-SCOPE.md` §8 · `lib/env.ts` + `docs/intake/specs/TECHNICAL-DECISIONS.md` M-INT-22 · this folder's logs.
> Close in three places. Run `yarn build` + `npx tsc --noEmit` + `yarn lint`.
