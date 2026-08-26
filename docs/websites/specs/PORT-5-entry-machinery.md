# PORT-5 — Entry machinery: per-entry uploads in RepeatableBlock; the Experience and Work steps

**Epic:** PORT — portfolio intake · **Phase 3** · Size: L
**Slice type:** New primitive (files inside repeatable entries) + the two heaviest content steps. Risk class: answer loss on the deepest-catalogue surface, and per-project files orphaned from their entries.

**Status:** Complete (2026-08-26) — both steps render every v2 field verbatim; entry keys mint, persist, and group files correctly; collapse proven to leave the answers document byte-identical; the share-password field is plain text with autocomplete off. **The bytes-to-storage path is NOT verified** — the scratch environment has no `intake` bucket, so issuance 500s after passing validation. Oversize refusal (400, at the schema) and format acceptance were verified.

> **Review note.** The answer-loss surface is the point: state which paths ran — 20+ project entries with images each · collapse/expand under autosave · entry removal with pending uploads · undo restoring an entry with its images intact · tab-kill mid-entry and resume. And confirm the storage posture: per-entry uploads are seam-gated, private-bucket, engagement-scoped, exactly like every other upload.

---

## Outcome

The catalogue steps are real. Step 3 (**experience**) holds the repeatable experience entries plus the proof cluster (awards, press, kind words with its publish-permission checkbox, notable names). Step 4 (**work**) holds unlimited project entries — eleven fields plus a per-project image drop each — rendering collapsed to summary rows once titled, with the curation questions beneath (the reel, the five, organization, the think-out-loud box). `RepeatableBlock` supports file uploads inside entries via stable entry keys, with no cap on entries or images. The extraction blocks render as static placeholders (copy only — the button arrives in PORT-6). The output document does not read these yet.

## Why / intent

- **V2 doc steps 3 and 4 (binding, verbatim)** — every entry field and placeholder. Anchors: step 3's intro ("Think of this as the LinkedIn layer…") and step 4's ("Now the work itself — the films, videos, and projects the last step's career produced…", flavour-flexed per the marked generics); the share-password help "Share passwords only — the kind Vimeo puts on a private link. Never an account password; we don't take those."; the can-you-show-it options ("Yes — it's public" / "Yes, but there are rules — ask me" / "Not sure — check with me") and where-it-belongs options ("Front and centre" / "In the archive" / "Leave it off for now"); the reel question with its flavour fallback ("Which piece leads?").
- **Handoff binding law 3** — the per-project "share password" field is the deliberate, documented exception to the no-password law: Vimeo link passwords are share artifacts, not credentials — **say so in a doc comment** at the field definition.
- **Handoff decision 6 / M-PORT-3** — `RepeatableBlock` gains file-upload support reusing the existing upload path and its 50MB size-only law; entries carry a short client-generated `entryKey` stored in the answers document; `intake_files.entry_key` associates uploads; no cap on count.
- **UX scope §5 step 4 + D-PORT-6** — entries collapse to summary rows (mono index · title · year · role, plus a dim image count) once titled; presentation state only, never persisted, never hiding data from autosave; a newly added entry opens expanded. §6.3 — thumbnails live inside the entry card and collapse with it.
- **What this slice is NOT (binding):** no extraction endpoint or button behavior (PORT-6 — this slice renders the blob box and its copy as an inert field so the paste can already autosave); no reordering of entries (not in the v2 doc — do not invent it); no image processing.
- **Ground truth:** `repeatable-block.tsx` (undo grammar), `file-drop.tsx` (XHR progress, size-only refusal), the upload issuance route, `useStepAutosave` — extended, never forked.

**Rulings this slice makes (labelled, logged):**

- **Entry keys are client-generated, 8–12 chars, created when an entry is added and never regenerated.** They live in the entry's answer object; uploads carry them to `intake_files.entry_key`. Removal of an entry does **not** delete its files (undo must restore them; orphan cleanup is Taylor-side, listed honestly in the output) `[PROVISIONAL — cheap to add a sweep later]`. Logged.
- **The blob boxes autosave as ordinary long-text fields from this slice on** — the never-lose-the-paste contract predates the extraction button. Logged.
- **Collapse threshold: an entry collapses when it has a non-empty title and loses focus; expanded state is component state only.** Logged.

## Experience & states

Step 3: fast-way blob (inert), experience entries (what/where/when/say/category/feature-this checkbox), proof cluster. Step 4: fast-way blob (inert), project entries per the v2 field list with the image drop inside, then the reel / five / organization / anything-else / say-more fields. Choice rows (`can we show it`, `where it belongs`) as full-size ChoiceCards inside the entry.

**States (exhaustive):** entry expanded · collapsed (summary row: index, title, year, role, `N images` dim mono) · newly-added (expanded, focused) · removed-with-undo (six seconds, files restored with it); per-file states inherited (§6.4); feature-this and publish-permission checkboxes unchecked by default; blob box default/filled (autosaving).

**Failure / edge states (named):** upload failing inside a collapsed entry → the summary row's count shows a gold marker and expanding reveals the retry tile `[dev's call on exact treatment — must be visible collapsed]`; entry removed while a file is mid-upload → upload cancelled locally, row's pending record handled per the existing straggler posture; autosave failure → the engine's local-first honesty, unchanged; 30 entries × images → no jank (virtualize only if measurement demands it — do not pre-optimize).

## Non-negotiables (this slice)

- **Answers are never lost** — entry keys, collapse, and undo all sit on top of autosave, never beside it.
- **Size is the only upload refusal — never format, never count.** No cap on entries or images, anywhere, including validators.
- **The share-password field ships with the exception doc comment** and help copy verbatim; nothing else in the flow may reference account passwords.
- **Collapse is presentation only** — the answers document is identical whether every entry is open or shut.
- **V2 strings verbatim.**

## Data

**Schema changes: none** (`entry_key` landed in PORT-1).

**Tables:** `engagements` (answers merge) · `intake_files` (insert with `entry_key` via extended issuance).

**Placement:** `step-experience.tsx` · `step-work.tsx` + a `project-entry.tsx` presentation variant under the showcase `_components/` · `repeatable-block.tsx` extended in place (upload slot support — Durable call sites unaffected; regression-check its usages) · `app/api/intake/upload/route.ts` + `server/services/submission.ts` (accept/record `entryKey`) · `lib/validators/showcase-intake.ts` (both step schemas + `uploadIssueInput` extension) · labels file.

**Validators:** entry schemas with `entryKey` required-within-entry (the one non-optional key — it is machinery, not an answer); arrays unbounded; `uploadIssueInput` gains optional bounded `entryKey`.

## Accessibility

Collapsed summary rows are `button`s with `aria-expanded`; focus lands on the first field on expand; the undo line is announced; ChoiceCards inside entries keep fieldset/legend; image-count markers have text equivalents; 20-entry screens stay navigable by heading/landmark structure at 200% text scale.

## Acceptance criteria (observable — mobile primary; a seeded showcase engagement)

1. Both steps render every v2 field verbatim (field-by-field diff, stated per step); the blob boxes render with their copy and autosave as text.
2. A project entry round-trips: add → fill → images upload (instant thumbnails, progress, retry on induced failure) → `intake_files` rows carry the entry's key → collapse shows the summary row with the image count → expand restores everything.
3. Remove + undo within six seconds restores the entry with its images and answer content intact; after the window, the entry is gone from answers while its files remain in storage (the logged `[PROVISIONAL]`).
4. Tab-kill mid-entry → resume shows the entry per the autosave engine's local-first contract.
5. 20 entries with images: collapse keeps the screen scannable; no console errors; interaction stays responsive on a throttled profile.
6. The share-password field: help copy verbatim; doc comment present at the schema definition; input is a plain text field (never `type="password"` — it is not a credential and must not trigger password managers).
7. Durable regression: every Durable `RepeatableBlock` usage (services, add-ons, team, socials) renders and behaves unchanged.
8. Negative: no entry cap or image cap anywhere (code inspection + a 30th entry adds fine); no reorder affordance; no extraction network call exists yet.
9. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `RepeatableBlock` is generic over `T` with `renderItem` — the upload slot likely arrives as render-prop context (entry key + step key) rather than a new prop surface; keep the Durable signature intact.
- FileDrop already takes `fieldKey` — threading `entryKey` through issuance is the smaller change; the `existing` files listing needs entry-scoped filtering.
- The summary row's failed-upload marker: the collapsed state must never hide a failure a sighted user would act on (mirrors the a11y law).

## Dev's call

Entry-key generation (nanoid vs crypto slice) · collapse animation within reduced-motion law · failed-marker treatment on summary rows · virtualization threshold if measurement demands one.

## Out of scope

- **The Sort-this-for-me button and endpoint** — PORT-6. **Entry reordering** — not specified; not invented. **Orphan-file sweep** — logged provisional; a later cron if adopted. **Output rendering of entries** — PORT-8.

## Depends on

- **PORT-2** — StepShell, routes, autosave on this track. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** The entry-key ↔ file association and the collapse-over-autosave interaction are exactly where a cheaper model ships a demo that loses a filmmaker's back catalogue on the second visit.

---

### Kickoff (paste into the session)

> Build **PORT-5 — Entry machinery** (attached spec). **Answers never lost; collapse is presentation only; size-only refusal with no caps; the share-password exception documented in code.**
> Attach/read first, in order: this spec · `specs/README.md` · `../portfolio-intake-questions-v2.md` steps 3–4 (the copy source) · `../PORTFOLIO-INTAKE-UX-SCOPE.md` §5 steps 3–4, §6.3 · `repeatable-block.tsx` + `file-drop.tsx` + the upload route (reuse, don't fork) · `docs/intake/specs/TECHNICAL-DECISIONS.md` M-INT-17/18 · this folder's logs.
> Close in three places. Run `yarn build` + `npx tsc --noEmit` + `yarn lint`.
