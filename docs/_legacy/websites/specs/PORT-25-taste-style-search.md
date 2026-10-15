# PORT-25 — Find more like it: the style brief, the web search, the result links, and "Add to my sites"

**Epic:** PORT — coded (showcase) intake · **Phase 9** · Size: M
**Slice type:** Third-party data path (the fourth on this track) with a server-side web search. Risk class: a client's identity leaving with the request; an unbounded run budget; a result presented as vetted; a `pause_turn` returned as a finished answer; a suggestion written to the answers document without the client taking it.
**Review:** **Forge — the run budget and the allow-list of what leaves. Vesper — the states (D-PORT-18). Mason — the two-call shape and the service seam (M-PORT-37).**

**Status:** Complete (2026-09-04), with two criteria unverified and named. Two live runs were made against a real key with every outbound request captured. The allow-list holds: seven decoy fields planted in the answers (display name, what they do, city, audience, bio, domain, brain dump) appear in neither request. `pause_turn` was exercised against a stubbed transport — two pauses resume and finish, endless pauses stop after three and fail rather than returning a truncated answer. **Not verified: the run counter incrementing, and Add-to-my-sites in a browser** — both need a real engagement token and no database was reachable in this session. The first live run returned nothing and produced two real defects; see `DEVIATIONS.md`.

> **Forge — data-path review.** Capture the outbound request and state, field by field, what it contains. It must be: the brief, the three words, the never-feel-like line, and the picks' scores and notes with the sites' names — and nothing else. No display name, no contact column, no token, no engagement id, no upload. State the run counter's value before and after one press.

---

## Outcome

Under the three words, a client describes the site they are picturing in their own words and presses Search with AI. The button says it is reading their picks and the three words too. A few seconds later three to six real links appear, each with its host as a link that opens a new tab and one line on why it came back, under a line saying plainly that nobody has checked them. Add to my sites on a result creates an entry in the sites-you've-found list with the URL filled in and its scale and note open, and scrolls there. A second search replaces the list; what they added has already left it. Every failure is a calm sentence and their description is still in the box. What this slice does not do: store what was suggested, vet the links, or count a found site toward the five.

## Why / intent

- **`../CODED-INTAKE-TASTE-UX-SCOPE.md` §9** — the section, the states, the result card, what the search reads (D-PORT-18, provisional — build against). §13 — every string.
- **`come-across.tsx` / `come-across.ts` / `server/services/come-across.ts`** — the grammar: the button says what it is; nothing returned is an answer until pressed; calm states none of which is the client's mistake; material read server-side under an allow-list; the shared `claimRun` budget. **Reuse the shape, not the file.**
- **M-PORT-5** — one service, thin action, model pinned via `MODEL` in `extract.ts`, per-engagement counter cap.
- **PORT-22** — `picksOf`, `references[].source: "search"`, `styleBrief`. **PORT-23** — `ReferenceList` and its "add an entry prefilled and composing" hook.
- **The Claude API's web search is a server tool** (`web_search_20260209`, supported on `claude-sonnet-5`): the search runs on Anthropic's infrastructure, never as an outbound request from a Vercel function on client-supplied text. A long server-tool turn can end in `stop_reason: "pause_turn"`, which must be resumed, not returned.
- **What this slice is NOT (binding):** no search of our own catalogue (the client can already see it); no storing of results; no "verified" or "checked" wording anywhere; no result counted as a pick; no autosave of a suggestion.
- **Ground truth:** `extract.ts` (`getClient`, `MODEL`, `claimRun`, `ExtractionUnavailableError`) · `come-across.ts` (the sources allow-list idiom) · the preview-mode network-caller audit in `components/intake/preview-mode.tsx` (this slice adds the fifteenth caller and updates that list).

**Rulings this slice makes (labelled, logged):**

- **Two calls per search.** Call one: `MODEL` with `tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6, blocked_domains: [...] }]`, a manual loop that resumes `pause_turn` up to three times, harvesting every `web_search_result` URL and the model's closing text. Call two: `messages.parse` with a Zod result schema over that text and URL list, producing `{ url, why }[]` bounded to six, http(s) only, deduplicated against the current pack's gallery URLs. Whether structured output composes with a server tool in one call is `[NEEDS VALUE AT BUILD]` — if it does, collapse to one call and log it; if not, two is the shape. `M-PORT-37`. Logged.
- **The brief is posted; everything else is read server-side.** The action takes `{ token, brief }` with the brief capped at 2,000 characters (the extractor's blob-in shape), and the service reads the three words, `neverFeelLike`, and the picks from the saved answers (the come-across allow-list shape). Posting the brief means a client need not wait for autosave before pressing; reading the rest server-side means a forged request cannot put words in the model's mouth about who they are. Logged.
- **`blocked_domains` starts as a short list of places that are not websites** — `pinterest.com`, `instagram.com`, `facebook.com`, `dribbble.com`, `behance.net`, `awwwards.com`, `format.com`, `fabrik.io`, `squarespace.com` — because a client asked for sites gets galleries and template stores otherwise. Dev extends from the first live runs; the list is data in the service. `[PROVISIONAL]`. Logged.
- **Runs share the extraction counter.** One budget per engagement across every AI button (M-PORT-5's cap), so a leaked link spends one bounded number whichever button it presses. Logged.

## Experience & states

The UX scope §9 is the spec, including the result card and every string. The state table there is binding: default · empty press · running (`Looking…`, box read-only and legible, no spinner, `aria-live`) · results (line above, three to six cards) · nothing found · failed (gold, brief intact) · rate-limited / budget (button stays enabled, line repeats) · preview (disabled, the preview line).

**Result card:** host as external link (`hostOf`), the why line, **Add to my sites** (gold mono text link) → `ReferenceList.addFromSearch(url)` creates `{ entryKey, url, source: "search" }` composing, scrolls to it, focuses its scale; the card then reads `Added` in dim, not a link. Searching again clears the list.

**Failure / edge states (named):** `pause_turn` three times → treated as failure, not returned as results · zero URLs harvested → nothing found · a result URL matching a gallery site → dropped before render · a result that is not http(s) → dropped · the model returns more than six → truncated to six · the action called with a brief over the cap → refused as `failed`, nothing runs, no run claimed · preview → the action is never called (the preview audit list gains this caller).

## Non-negotiables (this slice)

- **Nothing identifying leaves.** The outbound request holds the brief, the words, the never line, and the picks with site names. Nothing else, ever.
- **Nothing is written by the search.** A result becomes an answer only through Add to my sites and the client's own autosave.
- **The copy never claims the links were checked.**
- **`pause_turn` is resumed or treated as failure — never returned as a result.**
- **The run is claimed before the model is called and the brief is never logged.**
- **Preview never reaches the network.**

## Data

**Schema changes: none.** **Tables:** `engagements` (answers read; `extraction_runs` incremented by `claimRun`).

**Placement:** `server/services/style-search.ts` (the service: sources allow-list, the two calls, the result schema, `blocked_domains`) · `app/websites/coded/intake/_actions/style-search.ts` (thin: parse `{ token, brief }`, `requireEngagement`, showcase-only, call, return a result never a throw — the come-across `Result` shape) · `app/websites/coded/intake/_components/taste/style-search.tsx` (the section) · `taste/reference-list.tsx` gains `addFromSearch` · `components/intake/preview-mode.tsx` audit list updated. Mason's call, M-PORT-37.

**Validators:** the action's input schema in the action file (`token`, `brief` ≤ 2,000) and the result schema in the service; nothing in `lib/validators/` because nothing here is an answer.

**AI notes:** touchpoint `style-search`, `MODEL` (`claude-sonnet-5`, pinned), server-tool web search, structured second call, no streaming, `max_tokens` 4,000 on call one and 2,000 on call two. No prompt is versioned separately; the instruction lives in the service beside the extractor's idiom. **Eval: none in this slice** — the output is links, and the grade is Taylor opening them; `[REVISIT]` if quality complaints arrive.

## Accessibility

The button is a real `GhostButton`; the running state is announced once and the results once; result links carry the host as text, never a bare URL glyph; Add to my sites moves focus to the new entry's scale and announces the addition; the read-only brief keeps its label association.

## Acceptance criteria (observable — one live run against a real key, reported with the request captured)

1. Pressing with an empty box shows the empty-press line and claims no run.
2. A live run with a real brief returns three to six cards with http(s) hosts and why lines; none matches a gallery URL; the results line above reads the §13 string.
3. The captured outbound request contains exactly the allow-listed material and nothing else. *(Forge.)*
4. `extraction_runs` increments by one per press; at `MAX_RUNS` the button shows the budget line and claims nothing.
5. Add to my sites creates a reference entry with the URL, `source: "search"`, composing, focused; Save persists it; the card reads `Added`.
6. Searching again replaces the list; the added reference remains in the list below.
7. Induced `pause_turn` (or a mocked response with that stop reason) is resumed; after three, the failed line shows and the brief is intact.
8. Preview: the button is disabled with the preview line; no request leaves.
9. `grep` finds the word "verified" and "checked" nowhere in the section's copy except in the "we haven't checked them" line.
10. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The web search result block's `content` is a list on success and an error object on failure — branch on that before indexing.
- The system instruction should tell the model it is looking for *personal or studio websites of practitioners*, that it must return the exact URLs it visited, and that a template store or a gallery page is not a result.
- `messages.parse` with `zodOutputFormat` is already the idiom in `extract.ts`.
- Seed the first `blocked_domains` from the ruling; report which domains actually came back on the live run.

## Dev's call

Whether one call suffices (log it) · the instruction wording · `max_uses` · how the two calls share the client · the harvest of `web_search_result` blocks vs. the model's own list.

## Out of scope

- **Storing results** — ruled out at PORT-22.
- **Searching our own catalogue** — the gallery is the catalogue.
- **Counting found sites toward five** — D-PORT-16.
- **An eval** — `[REVISIT]`.

## Depends on

- **PORT-23** — `ReferenceList` and the section's place on the step. Complete in `PROGRESS.md` required.
- **PORT-22** — `picksOf`, `hostOf`, `references[].source`. Complete.

## Recommended execution

**Opus.** The value is in what does not leave and what is not returned: the identity allow-list and the `pause_turn` handling. A cheaper model posts the whole answers document for context and returns a paused turn as an empty result.

---

### Kickoff (paste into the session)

> Build **PORT-25 — Find more like it** (attached spec). **Nothing identifying leaves; nothing is written by the search; the links are never called checked; `pause_turn` is resumed or failed; preview never reaches the network.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-TASTE-UX-SCOPE.md` §9, §13 · `server/services/come-across.ts` + `_actions/come-across.ts` + `_components/come-across.tsx` (the shape — reuse, don't fork) · `server/services/extract.ts` (`getClient`, `MODEL`, `claimRun`) · `PORT-23` (`ReferenceList`) · `components/intake/preview-mode.tsx` (the caller audit) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (M-PORT-37).
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`; run one live search and paste the captured request into the closing report.
