# Voice note — record in the browser, transcribe, never lose it

**A scoping primer, not a ticket.** Paste the § Kickoff prompt at the bottom
into a fresh thread. That thread writes `PORT-20` into
`docs/websites/specs/` and builds it; this file is the brief it starts from.

Raised by Taylor on 2026-09-03, reading step 7 (Your words) at
`/admin/intake/questions`. Deliberately kept out of PORT-19, which shipped the
other twelve notes from that read.

---

## The ask

Today step 7 says *"Record a voice memo on your phone… and upload it here."* The
file lands in `intake_files` under `voice_note`, and the intake document prints
it under a heading that says **"Voice note (transcribe this)"** — a human does
the transcribing, later, by hand.

Taylor wants two changes:

1. **Record in the browser**, so the client never leaves the form, never hunts
   for a file, and never emails themselves an `.m4a`.
2. **Transcribe it automatically**, so the transcript is in the intake document
   rather than on a to-do list.

And one constraint above both of them, in his words:

> Make sure this is super stable as it's sooo annoying when you finish a voice
> recording and an error happens.

That constraint is the ticket. Everything else is ordinary work.

---

## Provider: OpenAI, not Claude

Taylor asked whether Claude is as good as OpenAI at this. **Claude cannot do it
at all** — not "less well". The Anthropic Messages API accepts text, images,
PDFs, and documents; there is no audio content block and no speech-to-text
endpoint. Any transcription in this repo goes to a second vendor.

Recommendation: **OpenAI `gpt-4o-transcribe`**, with `whisper-1` as the
documented fallback if a file trips the newer model. It handles the register
this form actually collects — a person rambling into a phone for twenty
minutes, with names, festivals, and film titles in it — and it takes a prompt,
which matters: passing the client's own display name, discipline, and project
titles as the `prompt` measurably improves proper nouns, and this form already
holds all three by the time step 7 renders.

The real alternatives, and why not:

| | Why not |
|---|---|
| Deepgram / AssemblyAI | Better diarisation and word timings; we need neither. A third vendor and a third key for no gain. |
| Whisper self-hosted | No per-minute cost, but it is a GPU to own on a Vercel deployment that has none. |
| Web Speech API | Free and in the browser, but Safari's is poor, it needs a live network the whole time, and it produces no audio file — so a failure loses the recording, which is the one thing forbidden here. |

**This is a new third-party data path.** It carries the same law the extraction
blob already carries: the audio goes to the transcription vendor and nowhere
else, no engagement identity attached, and nothing about it is logged. Add the
vendor to the privacy page's processor list in the same ticket — that is a real
disclosure, not a formality.

---

## The stability requirement, spelled out

"An error happens after you finish recording" has five distinct causes, and a
build that only handles the last one will still lose recordings. Each of these
has to be survivable **without the client noticing anything worse than a
retry**:

1. **The tab dies mid-recording** — a phone backgrounds it, iOS reclaims memory,
   the browser crashes.
2. **The upload fails** — rural LTE on a twenty-minute file.
3. **The transcription call fails** — vendor 500, rate limit, timeout.
4. **The transcript is wrong** — it heard the festival name as a person.
5. **The client changes their mind** — records again, or decides the first take
   was better.

The design that survives all five:

- **The audio is the artifact; the transcript is derived.** Everything else
  follows from this. A transcript that never arrives costs Taylor the hand
  transcription he does today — which is exactly where we started, so it is a
  degradation, not a failure. A lost recording costs the client twenty minutes
  they will not spend again.
- **Chunks land in IndexedDB as they are recorded**, not at stop. `MediaRecorder`
  with a timeslice, every `dataavailable` written straight to local storage.
  A tab that dies at minute eighteen leaves eighteen minutes on disk, and the
  step offers them back on reload: *"There's a recording here from earlier —
  keep it, or start again?"*
- **Upload is its own retryable step**, and the recording survives every failure
  of it. The existing `FileDrop` already uploads with `XMLHttpRequest` for
  progress; reuse that path rather than building a second one.
- **Transcription is a separate, retryable step after the bytes are safe.** It
  never runs inside the upload request, and its failure never touches the file
  row. A `voice_note` row with no transcript is a valid, complete state.
- **The transcript is shown to the client and is editable.** Same seen-first law
  the extractor and the primer follow (D-PORT-3): nothing a machine produced
  reaches the answers document as fact until a person has read it. This also
  disposes of failure 4 — a wrong transcript is a text box, not a support email.
- **A second recording never overwrites the first.** Both rows stay; the client
  says which one counts.

**Nothing here may block the step.** Every field on this form is optional
(D-INT-4) and that includes this one. A client whose microphone is denied, whose
browser has no `MediaRecorder`, or who simply would rather not, meets the
existing file drop and the existing "record on your phone" copy — which stays,
as the floor, not as a fallback anyone has to discover.

---

## What it touches

- `app/websites/coded/intake/_components/steps/step-words.tsx` — the voice-note
  card, the one place in the whole flow that carries the gradient ring
  (D-INT-3 / D-PORT-7). **That ring is a non-negotiable and appears exactly
  once; do not add a second.**
- A new `_components/voice-recorder.tsx` — permission, level meter, elapsed
  time, pause, stop, the IndexedDB chunk store, the recovery prompt.
- `/api/intake/upload` — probably unchanged; confirm it takes the blob a
  `MediaRecorder` produces (`audio/webm` on Chrome and Firefox, `audio/mp4` on
  Safari) and that **size is still the only thing that may reject a file**.
- A new transcription service under `server/services/`, and a server action
  beside it. Model pinned, key via `lib/env.ts` only.
- A `transcript` column or a `voice_note_transcript` answer — **the ticket
  decides which, and says why in `TECHNICAL-DECISIONS.md`.** It is a derived
  artifact of one file, not an answer the client typed, which argues for the
  file row.
- `server/services/output.ts` — the "Voice note (transcribe this)" heading
  becomes the transcript itself, with the audio link beside it, and keeps the
  old heading when no transcript exists.
- `docs/websites/specs/` — `PORT-20`, plus rows in `PROGRESS.md`,
  `00-build-order.md`, `DEVIATIONS.md`, `TECHNICAL-DECISIONS.md`.
- The privacy page — the new processor.

## Open questions for Taylor

1. **Does the client see the transcript?** The primer above assumes yes, on the
   seen-first law. It also means they can fix "Cannes" for us. The argument
   against is that reading your own rambling back is discouraging, and the
   value of the memo is partly that it is unselfconscious.
2. **A twenty-minute ceiling, or none?** The copy already invites half an hour.
   A thirty-minute recording is roughly 30 MB and costs cents to transcribe —
   the constraint is the upload, not the bill.
3. **Does this replace the phone-memo copy, or sit beside it?** The primer
   assumes beside.
4. **Do the other voice-shaped boxes get it too** — the step 1 braindump, the
   step 5 story fields — or is this step 7 only for now?

---

## Kickoff prompt

```
You are scoping and building ONE ticket for docs/websites/specs/: PORT-20 —
in-browser voice recording with automatic transcription via the OpenAI
transcription API.

START HERE
1. Read docs/websites/VOICE-NOTE-TRANSCRIPTION-PRIMER.md end to end. It is the
   brief. Its "Open questions for Taylor" are genuinely open — ask them before
   you write the spec, and do not answer them yourself.
2. Read docs/websites/specs/README.md (process, non-negotiables, closure
   protocol), then DEVIATIONS.md and TECHNICAL-DECISIONS.md in that folder and
   in docs/intake/specs/. On-disk reality overrides any stale string in a spec.
3. Read the repo CLAUDE.md. Its invariants are law, including: Tailwind v4
   token syntax (never `-[--`), no gradient behind body copy, the gradient ring
   appears exactly once in this flow and it is already spent on the voice-note
   card, and prefers-reduced-motion is respected everywhere — a level meter is
   an animation.
4. Write docs/websites/specs/PORT-20-voice-transcription.md from the primer and
   Taylor's answers, using the slice-spec template. Get it agreed before you
   build.

THE ONE REQUIREMENT ABOVE ALL OTHERS
A client must never lose a recording. Not to a backgrounded tab, not to a dead
connection, not to a vendor 500. The audio is the artifact and the transcript is
derived from it: a missing transcript is a degradation back to today's
behaviour, and a missing recording is twenty minutes of somebody's life. Design
for the five failures the primer enumerates, and say in the spec how each one is
survived.

CONSTRAINTS
- Every field on this form is optional (D-INT-4). Nothing here may block a step,
  and a client with no microphone permission meets the existing file drop.
- Nothing a machine produced reaches the answers document as fact until the
  client has seen it (D-PORT-3).
- Size is the only thing that may reject a file — never format, never duration.
- Third-party data path: the audio goes to the transcription vendor and nowhere
  else, with no engagement identity attached. Nothing about it is logged. Add
  the vendor to the privacy page's processor list in this ticket.
- Client-facing copy is [COPY — pending Taylor]; write it plainly, mark it, and
  do not "improve" the existing strings around it.
- The provider is OpenAI and the decision is made: `gpt-4o-transcribe`, pinned,
  with `whisper-1` documented as the fallback. Claude has no audio input and no
  speech-to-text API — do not try to route this through the Anthropic API, and
  do not re-open the provider comparison.
- This repo has no OpenAI dependency yet. `yarn add openai` (Yarn 4), and the
  key goes through `lib/env.ts` like every other secret — never `process.env`
  at a call site.
- Yarn 4. Never npm. Never `yarn dev` or `yarn build` — use dev:agent /
  build:agent (Taylor keeps a dev server on port 3000; see CLAUDE.md).
- The Durable track at /websites/intake must be behaviourally unchanged.

DEFINITION OF DONE
1. yarn build:agent · npx tsc --noEmit · yarn lint pass.
2. yarn verify:tracks passes, including the durable regression checks.
3. Recording, tab-kill recovery, upload retry, transcription retry, and re-record
   each exercised by hand — say which browser, and include Safari.
4. Ticket Status: Complete (YYYY-MM-DD); PROGRESS.md row + checklist ticked;
   00-build-order.md ticked; one DEVIATIONS.md line per divergence; the storage
   decision recorded in TECHNICAL-DECISIONS.md.
5. Close with 3–5 lines: what shipped, deviations, the one thing the next ticket
   must know.

Do not start another ticket.
```
