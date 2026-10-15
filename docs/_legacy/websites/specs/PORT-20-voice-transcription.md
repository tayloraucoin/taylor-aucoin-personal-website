# PORT-20 — In-browser voice recording, with automatic transcription

**Epic:** PORT — coded intake track · **Phase 8** · Size: L
**Slice type:** Client-side media capture with a local durability store, plus a new third-party data path. The class of failure it risks is the only one this track treats as unrecoverable — a client's twenty minutes of speech, gone.
**Review:** Mason (migration; the recover/upload/transcribe seam) · Forge (data-loss path; third-party processor disclosure)

**Status:** Complete (2026-09-03)

> **Mason — migration and seam review.** Six columns land on `intake_files`; review the SQL before it is applied and confirm column order, nullability, and that no existing row's meaning changes. Then review the three-stage seam — capture → upload → transcription — and confirm each stage's failure leaves the stage before it intact. Verification must state, per browser, that a recording survived a killed tab, a failed upload, a failed transcription, and a re-record.

> **Forge — data-loss and disclosure review.** Confirm no path exists in which a `dataavailable` chunk is discarded before it is durable; confirm the OpenAI request carries no engagement id, token, or email; confirm nothing logs audio, a transcript, or a prompt; confirm the privacy page's processor list names the vendor before the first recording can be made.

---

## Outcome

A client on step 7 sees a record button inside the voice-note card. They press it, talk for as long as they like, and press stop. While they talk, the audio is being written to their own device every few seconds, so a phone that backgrounds the tab, a browser that crashes, or a laptop that sleeps costs them nothing: on the next load the card says there is a recording here from earlier and offers to keep it. When they stop, the audio uploads with the same progress line the file drop already shows, and — separately, afterwards, as its own retryable step — it is transcribed. The transcript comes back into a text box on the same card, theirs to correct or ignore, and lands in Taylor's intake document as text under the audio link rather than as a file with a note asking him to type it out.

A client who denies the microphone, whose browser has no `MediaRecorder`, or who would simply rather not, sees exactly what they see today: the phone-memo prompt and the file drop, unchanged, on screen from the start rather than revealed by a failure.

This slice does **not** add a recorder to any other field, does not touch the durable track, does not diarise or timestamp, does not summarise the transcript, and does not let a transcript reach the answers document as an answer the client typed.

## Why / intent

- **The brief** — `../VOICE-NOTE-TRANSCRIPTION-PRIMER.md`, in full. Its five enumerated failures are this spec's acceptance criteria, restated as behaviour.
- **D-INT-4 — every field is optional.** Nothing here may block a step, gate the Next button, or make progress conditional on a working microphone.
- **D-PORT-3 — nothing a machine produced reaches the answers document as fact until the client has seen it.** Taylor's answer of 2026-09-03 settles the open question in the primer's favour: the transcript is shown and editable.
- **D-INT-3 / D-PORT-7 — the gradient ring appears exactly once in this flow**, on this card. The recorder goes *inside* the existing `GradientRing`; it does not get one of its own and the existing one is not duplicated, restyled, or made to pulse.
- **M-INT-18 — bytes go browser → storage directly.** The recorded blob takes the existing `issueUploadTicket` → signed PUT → `confirmUpload` path. No audio transits a Next function on the way in.
- **Size is the only thing that may reject a file** (README non-negotiable) — never format, never duration. See the ruling on the 30-minute stop below, which is not a rejection.
- **Ground truth, consumed and never rebuilt:** `FileDrop`'s upload path, `issueUploadTicket`/`confirmUpload`, `listUploads`, `GradientRing`, the preview seam (`useIsPreview`/`useIsDocument`), the `SaveIndicator` vocabulary, `extract.ts`'s third-party discipline.

**What this slice is NOT (binding):**

- **Not a second upload path.** If the recorder builds its own XHR ladder rather than reusing the one `FileDrop` already runs, the ticket is wrong.
- **Not an answers-document field.** The transcript is a property of one audio file, not a step answer. It never goes through `saveStepAnswers`.
- **Not a blocking step.** No state of this component may disable Next, and no failure of it may render an error style. Nothing here is the client's mistake.
- **Not a copy rewrite.** `voiceNotePrompt`, `voiceNoteSkipSuffix`, the skip line, and the drop label ship exactly as they are today.

**Rulings this slice makes (labelled, logged):**

- **The transcript lives on `intake_files`, not in the answers document.** It is derived from one specific file: two recordings mean two transcripts, and an answer key can hold one. It also has states an answer cannot have — never attempted, pending, failed, machine-written-but-unreviewed — and `saveStepAnswers` replaces a step's object wholesale, so a transcript stored there would be at the mercy of any step save. Logged as **M-PORT-29**.
- **Transcription is bounded per file, not per engagement.** `extraction_runs` is extraction's budget and a client who used it up must still be able to transcribe. A `transcript_attempts` counter on the file row, capped at 5, is the right granularity because retry is per-file. `[PROVISIONAL — the number 5, not the mechanism]` Logged as **M-PORT-30**.
- **The OpenAI request carries the client's display name, discipline, and project titles as its `prompt`, and nothing else about them.** This widens `extract.ts`'s anonymous-blob rule toward `come-across.ts`'s allow-list rule, deliberately and by the ticket's instruction: proper nouns are most of what this memo contains, and a model that has never heard "Le Guess Who" will not spell it. No engagement id, no token, no email, no address, no answers beyond those three. Logged as **M-PORT-31**.
- **The recording self-stops at 30 minutes and keeps everything recorded.** Taylor's answer of 2026-09-03. This is a property of the browser recorder, not of the field: the file drop beside it still accepts a recording of any duration, so nothing is ever *rejected* for being long. Logged in `DEVIATIONS.md` against the "never duration" line so the distinction is on the record rather than in a reader's head.
- **The service is `voice-transcription.ts`, not `transcription.ts`.** `server/services/transcripts.ts` already exists and holds the CRM's call transcripts. Two files one letter apart, both about transcripts, both server services, is a mistake somebody makes at 1am. Logged as **M-PORT-32**.

## Experience & states

**Happy path.** The card renders with its existing prompt. Below it, a record control; below that, the existing file drop and skip line, both unchanged. The client presses record, grants the microphone, and sees an elapsed counter and a level meter. Every few seconds a chunk is written to IndexedDB. They press stop. The card shows the recording with a duration and a progress line while it uploads, then "Sent". Transcription starts on its own; the card says it is being written up. Thirty to ninety seconds later the transcript appears in an editable box, above a line saying it is a machine transcript and they should fix anything it got wrong. Edits save the way the rest of the form saves — debounced, with the same indicator vocabulary. The local chunks are deleted only once the server has confirmed the upload.

**States (exhaustive), per recording:**

| State | What the client sees |
| --- | --- |
| `idle` | The record control. Nothing else. |
| `permission_pending` | The control, disabled, while the browser's own prompt is up. |
| `recording` | Elapsed time, level meter, pause, stop. |
| `paused` | Elapsed time frozen, resume, stop. |
| `stopped_local` | Duration, and that it is saved on this device. |
| `uploading` | Progress line, from the same XHR the file drop uses. |
| `uploaded` | "Sent", and the transcription state below it. |
| `transcribing` | A calm line, no spinner. |
| `transcribed` | The editable transcript box, with the machine-transcript line above it. |
| `transcript_edited` | Same box; the indicator reports the save. |

**Failure and edge states (named, each with its handling):**

1. **Tab dies mid-recording.** Chunks written on every `dataavailable` at a 5-second timeslice are already in IndexedDB with an open session record. On the next load of step 7 the card leads with the recovery prompt — keep this recording, or start again — and "keep" assembles the chunks into a blob and enters `stopped_local`, ready to upload. "Start again" deletes the session. The prompt is never auto-dismissed and never auto-uploads: an unattended upload of audio somebody may not want sent is worse than an extra tap.
2. **Upload fails.** Identical handling to `FileDrop` today: the item stays, says it didn't make it, and offers a tap to retry. The local chunks are **not** deleted — deletion is gated on `confirmUpload` returning, not on the PUT resolving. A client who closes the tab mid-upload finds the recording waiting on the next load.
3. **Transcription fails** (vendor 500, rate limit, timeout, a file the model refuses). The file row keeps `transcript_status = 'failed'` and an incremented attempt count; the card says the write-up didn't come through and offers to try again. **The audio row is untouched and the intake document still carries the audio link.** A voice note with no transcript is a valid, complete, shippable state — it is exactly what ships today.
4. **Transcript is wrong.** It is a text box. The client fixes it. `transcript_edited_at` is stamped, and the intake document marks an unedited transcript as machine-written so Taylor knows which he is reading.
5. **Client records again.** A second recording is a second `intake_files` row with its own transcript. Neither row is deleted, neither transcript is overwritten, and both appear in the intake document in the order they arrived. Which one counts is the client's to say in their own words, or Taylor's to judge — it is not a decision this code makes.
6. **No `MediaRecorder`, or microphone denied, or a webview that lies about both.** The record control is absent (feature-detected) or, after a denial, replaced by one plain line pointing at the drop below. No modal, no retry loop, no "enable microphone access in your browser settings" instructions. The floor was already on screen.
7. **Recording exceeds 30 minutes.** It stops itself, keeps every byte, and enters `stopped_local`. The client is told it stopped, not scolded.
8. **Recording exceeds `MAX_UPLOAD_BYTES` (50 MB).** Not reachable at the configured bitrate inside 30 minutes, but if it ever is, it fails exactly as an oversized file does today, with the existing sentence.
9. **IndexedDB unavailable** — private mode, quota, an embedded webview. Recording still works and holds chunks in memory; the card says the recording is only safe once sent. Degrading the safety net is correct; refusing to record is not. Same reasoning as `readLocal`'s catch in `use-step-autosave.ts`.
10. **Preview and document modes** (`/admin/intake/questions`). The recorder renders a disabled affordance saying recording is off in preview, matching `FileDrop`'s existing behaviour; in document mode it renders a `DocTag`/`DocHint` pair. There is no engagement behind a preview, so there is nothing a recording could mean.

## Non-negotiables (this slice)

- **A chunk is durable before it is acknowledged.** No code path may hold a `dataavailable` blob only in memory when IndexedDB is available.
- **Local chunks are deleted only after `confirmUpload` succeeds.** Not after the PUT, not after stop, not on unmount.
- **Transcription never runs inside the upload request** and its failure never writes to `storage_path`, `uploaded_at`, or any answer.
- **No audio, transcript, prompt, or filename is logged.** Errors log the vendor's status and nothing else. A transcript is a client talking unguardedly about their career for twenty minutes.
- **The OpenAI request carries no engagement id, token, or email** (M-PORT-31 bounds exactly what it does carry).
- **The gradient ring appears once.** Inside it, no gradient goes behind the transcript text.
- **`prefers-reduced-motion` freezes the level meter to a static bar.** A level meter is an animation; the elapsed counter is information and keeps counting.
- **The durable track is behaviourally unchanged.** `intake_files` gains columns the durable path never writes; `renderIntakeMarkdown` gains a branch the durable fixture never enters.
- **Never `-[--` in a class.** Tailwind v4 token syntax throughout.

## Data

**Schema changes: yes — one migration. Taylor reviews the SQL and runs it.**

`intake_files` gains six columns, all nullable or defaulted, placed alphabetically in the table's middle block between `storage_path` and `uploaded_at` per the file's existing order:

| Column | Type | Meaning |
| --- | --- | --- |
| `transcribed_at` | `timestamptz` | When a transcript last landed. Null until one does. |
| `transcript` | `text` | The text. Null when never attempted, pending, or failed. |
| `transcript_attempts` | `integer not null default 0` | The per-file budget (M-PORT-30). |
| `transcript_edited_at` | `timestamptz` | Stamped when the client edits. Null means machine-written and unreviewed — the intake document says so. |
| `transcript_model` | `text` | Which model produced it. `whisper-1` and the pinned model are both legible in the record. |
| `transcript_status` | `text` | `pending` · `done` · `failed`. **Null means never attempted**, which is every row that exists today and every non-audio upload. |

No column changes meaning for an existing row: every one of them reads null, and null is a documented state.

**Tables:** `intake_files` (read/write) · `engagements` (read only, through `requireEngagement`; this slice writes nothing to it — deliberately not `extraction_runs`, per M-PORT-30).

**Placement:**

| Path | What |
| --- | --- |
| `db/schema/intake-files.ts` | The six columns, documented in the file's existing voice. |
| `db/migrations/00NN_*.sql` | Generated by `yarn db:generate`. Reviewed as SQL, run by Taylor. |
| `lib/env.ts` | `OPENAI_API_KEY` in `ServerEnvVar` and in `rawValue`'s switch. Not tiered — same as `ANTHROPIC_API_KEY`, so it does not enter `resolve-tier-env.ts`. |
| `.env.example` | The key, beside `ANTHROPIC_API_KEY`. |
| `server/services/voice-transcription.ts` | The service (M-PORT-32): pinned model, the prompt, the vendor call, the per-file budget, the row write. |
| `app/websites/coded/intake/_actions/transcribe.ts` | Thin action: resolve through `requireEngagement`, check the file belongs to it, call the service, return a result never an exception. Mirrors `_actions/extract.ts` exactly. |
| `app/websites/coded/intake/_actions/save-transcript.ts` | The client's edit. Debounced, scoped to the engagement, stamps `transcript_edited_at`. |
| `app/websites/coded/intake/_components/voice-recorder.tsx` | The surface. One consumer, one track, so it co-locates here rather than in the shared `app/websites/intake/_components/`. |
| `app/websites/coded/intake/_lib/recording-store.ts` | The IndexedDB chunk store. New folder; one consumer. |
| `app/websites/coded/intake/_components/steps/step-words.tsx` | The recorder mounted inside the existing `GradientRing`, above the untouched `FileDrop`. |
| `app/websites/coded/intake/[token]/[step]/page.tsx` | `voiceNote` uploads gain their transcript fields. |
| `server/services/submission.ts` | `listUploads` returns the transcript fields. |
| `server/services/output.ts` | The heading branch. |
| `content/legal.ts` | OpenAI in "Who else touches it". |
| `scripts/transcribe-voice-note.ts` + `yarn transcribe:voice-note` | Taylor's hand-crank for a client who closed the tab and never came back. Same shape as `charge:extra-pages`. |

**Validators:** `lib/validators/intake.ts` — a `transcriptSaveInput` schema (file id as uuid, transcript as a bounded string). The action's own input schema lives with the action, as `extract.ts`'s does.

**Storage key convention.** The IndexedDB session record is scoped by `token.slice(0, 8)`, mirroring `storageKey()` in `use-step-autosave.ts` and for the same reason stated there: enough to separate two engagements on one device, not enough to hand the link to anything that reads storage. **The full token is never written to IndexedDB.**

**Recording format.** `audio/webm;codecs=opus` where supported, `audio/mp4` on Safari, and whatever `MediaRecorder.isTypeSupported` allows otherwise — the browser's choice is accepted, never constrained to one container. `audioBitsPerSecond: 32000`: speech-grade Opus, which puts 30 minutes at roughly 7 MB, comfortably under both the 50 MB upload ceiling and the vendor's 25 MB request limit.

**The output document.** Where a delivered `voice_note` row has a transcript, the heading becomes `## Voice note` with the audio link on the first line and the transcript below it, marked `_Machine transcript — not reviewed by the client._` when `transcript_edited_at` is null. Where it does not, the existing `## Voice note (transcribe this)` heading and file line ship byte-identical — which is what the durable fixture in `verify-track-cartridge.ts` asserts, and it must keep passing untouched.

## Accessibility

- The record control is a `<button>` with an accessible name that changes with state, not an icon with a title.
- Recording start, stop, and recovery are announced once each through a single `aria-live="polite"` region — one announcement per transition, following `FileDrop`'s "one announcement for a batch, not fifteen".
- The level meter is decorative and `aria-hidden`; the elapsed counter is the accessible signal that recording is live, and it is text.
- Under `prefers-reduced-motion` the meter renders a static bar. The counter still counts — suppressing it would remove the only non-visual confirmation that anything is happening.
- The transcript box is a labelled `<textarea>` with the machine-transcript line as its `aria-describedby`, so a screen reader hears the caveat before the text.
- The recovery prompt takes focus on mount, because it is the one thing on the card that is time-sensitive to the client's intent. It is not a modal and does not trap focus.

## Acceptance criteria (observable, and under what conditions)

1. On step 7 with a working microphone, pressing record starts a recording; an elapsed counter and a level meter appear; pressing stop yields a playable local recording.
2. Killing the tab at ≥60 seconds and reloading step 7 shows the recovery prompt; "keep" restores a recording whose duration matches what was recorded to within one chunk; "start again" removes it and leaves the card in `idle`.
3. With the network disabled at stop, the upload fails visibly and offers a retry; re-enabling the network and tapping retry completes the upload. The recording is still present after a reload taken between the failure and the retry.
4. Forcing the vendor call to fail leaves `transcript_status = 'failed'`, leaves `uploaded_at` and `storage_path` intact, shows a retry, and still renders the audio link in the intake document.
5. A returned transcript appears in an editable box; editing it and waiting out the debounce persists the text and stamps `transcript_edited_at`; a reload shows the edited text.
6. Recording a second time produces a second `intake_files` row; both rows and both transcripts survive; the intake document lists both.
7. With the microphone denied, the card renders the prompt, the file drop, and the skip line, and the step's Next button is unaffected.
8. In `/admin/intake/questions` preview the recorder is disabled and says so; in document mode it renders as a tag and a hint.
9. Under `prefers-reduced-motion` the level meter does not animate.
10. The OpenAI request body, inspected in a network trace or a logged shape (never a logged value), contains the audio, the pinned model, and a prompt built only from display name, discipline, and project titles — and no engagement id, token, or email.
11. No log line anywhere in the slice contains audio, a transcript, a prompt, or a filename.
12. `content/legal.ts` names OpenAI in "Who else touches it", and the page renders it.
13. `yarn verify:tracks` passes, including the durable document fixture, whose voice-note heading is byte-identical to today's.
14. `yarn build:agent`, `npx tsc --noEmit`, and `yarn lint` pass.
15. Criteria 1–7 exercised by hand in Chrome and in **Safari** (which records `audio/mp4` and is the browser most likely to reclaim a backgrounded tab), with the browser and version stated in the closing report.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `MediaRecorder`'s `timeslice` argument is what makes chunking happen at all; without it `dataavailable` fires once, at stop, and the whole durability story is gone. 5 seconds is the suggested slice — short enough to bound loss, long enough that IndexedDB writes are not the bottleneck.
- iOS Safari suspends `MediaRecorder` when the tab backgrounds and does not always fire a final `dataavailable`. This is the exact case the chunk store exists for; do not try to defeat it with `visibilitychange` heroics, just make sure the last durable chunk is enough.
- Assembling chunks back into a blob must use the same MIME type the recorder produced, or Safari yields a file it will not itself play back.
- The vendor's request limit is 25 MB per file; the configured bitrate keeps a 30-minute recording well under it. An *uploaded* phone memo can exceed it — that transcription fails and the audio is untouched, which is failure 3 and is fine.
- `whisper-1` is the documented fallback when the pinned model refuses a file. Whether to fall back automatically once, or to surface a retry, is the dev's call; automatic-once is likely kinder and should record which model produced the text in `transcript_model` either way.
- Vercel's default function timeout will not cover a 30-minute file's transcription. The route or action needs an explicit `maxDuration`. PORT-18's spec has an open question on `maxDuration` generally — this slice sets its own and does not settle that one.
- `listUploads` is called per field on every step render. Adding six columns to its projection is free; adding a join is not — there is nothing to join to.
- `FileDrop`'s `send()` is the upload ladder to reuse. Extracting it to a shared helper the recorder can call is the dev's call; copying it is not.

## Dev's call

- Whether the upload ladder is extracted from `FileDrop` or driven by mounting a headless variant of it. Reuse is binding; the mechanism is not.
- The IndexedDB schema's exact shape (one store keyed `[sessionId, seq]` plus a session store is the obvious one).
- Automatic single fallback to `whisper-1` versus a surfaced retry.
- Whether transcription is kicked off by the client immediately after `confirmUpload` or by a mount-time sweep of untranscribed rows. Both are required to exist in some form — the second is what serves a client who returns to the step later — so the call is really about whether the first is a separate trigger or just the first pass of the second.
- The `maxDuration` value.

Real alternatives, chosen, land in `TECHNICAL-DECISIONS.md`.

## Out of scope

- **Recorders on the step 1 ingestion box and the step 5 story fields** — Taylor's answer of 2026-09-03: step 7 only for now. Lifting the component to another field is a later, cheap ticket once this machinery is proven.
- **The durable track's step-voice.tsx** — unchanged, deliberately.
- **Diarisation, word timings, summarisation, translation** — not needed, and a second vendor for them would be a third key for no gain.
- **Playback trimming or re-take of a portion** — a client who wants a different take records again, which is failure 5 and already handled.
- **Retention or deletion policy for audio** — governed by the privacy page's existing 24-month clause; nothing here changes it.
- **Settling PORT-18's general `maxDuration` question** — that belongs to PORT-18.

## Depends on

- **PORT-19** — Complete in `PROGRESS.md` (2026-09-03). This slice edits the step-7 card PORT-19 last touched.
- **PORT-15** — Complete. Owns `voiceNotePrompt` / `voiceNoteSkipSuffix` in the copy packs, which ship here untouched.
- **PORT-8** — Complete. Owns `renderIntakeMarkdown` and the voice-note heading this slice branches.

## Recommended execution

**Opus.** The reasoning load is not the recorder, which is ordinary; it is holding three failure boundaries apart under pressure to collapse them — durable-before-acknowledged, delete-after-confirm, transcription-never-inside-upload. A model that chooses down will write a component that uploads at stop and transcribes in the same request, which passes every happy-path check and loses a recording the first time somebody's train enters a tunnel.

---

### Kickoff (paste into the session)

> Build **PORT-20 — In-browser voice recording, with automatic transcription** (attached spec). **A client must never lose a recording: chunks are durable before they are acknowledged, local chunks are deleted only after the server confirms, and transcription is a separate retryable step whose failure never touches the audio.**
> Attach/read first, in order: this spec · `../VOICE-NOTE-TRANSCRIPTION-PRIMER.md` · `specs/README.md` (kickoff contract + non-negotiables) · `../PORTFOLIO-INTAKE-TECH-SCOPE.md` · `app/websites/intake/_components/file-drop.tsx` and `app/websites/intake/_lib/use-step-autosave.ts` (the durability patterns to reuse, not fork) · `server/services/extract.ts` and `server/services/come-across.ts` (the third-party discipline) · repo `CLAUDE.md` · this folder's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`, then `docs/intake/specs/`'s.
> Every field on this form is optional and nothing here may block a step. Size is the only thing that may reject a file. No audio, transcript, or prompt is ever logged, and the OpenAI request carries no engagement identity. The gradient ring appears exactly once and it is already spent on this card. `yarn add openai`; the key goes through `lib/env.ts`. Yarn 4, and `build:agent` / `dev:agent` only. Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint` + `yarn verify:tracks`.

---

## Verification (what was actually run, 2026-09-03)

**Mechanical.** `yarn build:agent`, `npx tsc --noEmit`, `yarn lint`, and `yarn verify:tracks` all pass. The durable document renders byte-identical: `## Voice note (transcribe this)` and the same `- [name](url)` line, in the same position before `## Files`.

**Against a real Postgres.** All eleven migrations plus `0011_bouncy_stranger.sql` applied cleanly to a scratch database; `\d intake_files` shows the six columns, every one nullable or defaulted, no existing column altered. Then, driven end to end:

- `listUploads` projects the transcript columns.
- `pendingTranscriptions` returns the delivered untranscribed row and excludes the reserved-but-never-delivered one.
- `saveTranscript` trims, writes, sets `transcript_status = done`, and stamps `transcript_edited_at`.
- Once a transcript exists nothing is pending — there is no retry loop.
- The document renders all three branches: machine transcript with the `_Machine transcript — not reviewed by the client._` marker, client-edited transcript without it, and no-transcript falling back to today's heading unchanged.

**In the browser (Chromium, Browser pane, against that scratch database).**

- The card renders the recorder *inside* the existing gradient ring, above the untouched prompt, drop, and skip line. No console errors.
- On mount, **no** transcription call fires for a row that already has a transcript or one already marked `failed` — the auto-kick is once, for never-attempted rows only.
- Pressing "Try again" on a failed row: `POST /api/intake/transcribe` → handled failure → the calm line and the retry return, no error styling. In the database `transcript_attempts` went 2 → 3 while `uploaded_at`, `storage_path`, and the row's other facts were untouched. **Transcription failure does not touch the audio**, observed.
- Microphone denied: one plain line pointing at the drop below. No modal, no browser-settings instructions, Continue unaffected.
- **Tab-kill recovery**, exercised by writing a session with three chunks and no `endedAt` directly into IndexedDB and reloading: the prompt appears with the correct duration ("about 1:03") and offers Keep it / Start again.
- **Keep it** assembled the chunks and attempted the upload; the upload failed (no storage credentials in that environment) and the card said so — "Your recording is still here". **All three chunks and 60,000 bytes remained in IndexedDB**, and a reload brought the recovery prompt back. The delete-after-confirm gate holds.
- **Start again** removed the session and every chunk.
- Editing a transcript persisted it to the row and stamped `transcript_edited_at`; the indicator read "Saved".

**Not verified, and it is Taylor's to run.**

- **Recording itself, chunking to IndexedDB from a live `MediaRecorder`, and re-record.** The Browser pane blocks microphone access. The recovery, assembly, upload, and delete-gate paths downstream of it were exercised with a hand-written session; `MediaRecorder` start/stop/timeslice was not.
- **Safari, at all.** No Safari driver in this environment. Safari records `audio/mp4` and is the browser most likely to reclaim a backgrounded tab, so it is the one that most needs the pass.
- **A live OpenAI call.** No key was set; the vendor path was exercised only through its failure branch.
- **The level meter under `prefers-reduced-motion`** — it only renders while recording.
