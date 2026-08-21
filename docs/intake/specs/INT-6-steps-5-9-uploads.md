# INT-6 — Steps 5–9: uploads, the voice-note card, and the access step

**Epic:** INT — client intake · **Phase 3** · Size: L
**Slice type:** Form content + private file pipeline. Risk class: confidentiality (private bucket discipline, voice recordings) and the flow's single signature moment built wrong.

**Status:** Code complete (2026-08-18) — schemas, upload-record scoping, and the size/format rules verified against a scratch Postgres; the actual bytes-to-Supabase-Storage path is NOT verified (no project yet)

> **Review note.** The storage path is the confidentiality surface: verify no public URL is ever minted, upload issuance requires the token seam, and object paths are engagement-scoped. State which upload cases ran: happy · oversize · odd format (.heic, .amr) · mid-upload disconnect · retry.

---

## Outcome

The back half of the form is real. Step 5 (How you talk) leads with the voice-note card — the flow's only GradientRing — plus screenshots, writings, never-say words, and the call-recording consent checkbox. Step 6 (Photos and logo) uploads with instant local thumbnails. Step 7 (Reviews) with the plain-honesty intro and unchecked publish permission. Step 8 (Team) conditionals. Step 9 (Access) opening with the NO PASSWORDS callout, domain questions weighted first. Files land in the private `intake` bucket under `{engagementId}/…` via server-issued signed upload URLs, registered in `intake_files`. The whole nine-step flow is now fillable end to end. Completion (Done) is still INT-7's; no emails move.

## Why / intent

- **Build spec §4 Steps 5–9 (binding)** — field inventory verbatim, including: voice-note help copy, "never reject an upload for format," 10–20 photos help line (not a counter), reviews intro, the Step 9 reassurance framing, out-of-band access collection (no credential fields, ever — §5).
- **UX spec §6.4** — native file inputs; per-file states; instant local thumbnails; gold hairline progress; retry tile. **§7 deltas** — D-INT-3 ring on the voice card only, with the no-pressure skip line; Step 9's `NO PASSWORDS · EVER` mono-eyebrow callout; domain/email questions ink-weighted.
- **TECH-SCOPE §5 storage** — private bucket; server-issued signed upload URLs after `requireEngagement`; downloads only as server-minted signed URLs (INT-7's email); no client-side listing.
- **M-INT-8** — the seam guards issuance; `intake_files` rows written server-side on confirmation.
- **What this slice is NOT (binding):** no transcription, no audio playback UI beyond a filename row (the recording is source material for Taylor, not a player feature); no image processing/resizing — originals only.

**Rulings this slice makes (labelled, logged):**

- **Upload protocol:** client asks `app/api/intake/upload/route.ts` (token + field key + filename + size) → server validates via the seam, enforces the size ceiling, creates the storage signed-upload URL and the pending `intake_files` row → client PUTs the file → client confirms → server marks the row uploaded (or a cleanup sweep in INT-8's cron prunes stragglers `[PROVISIONAL — cheap to change]`). Large files never transit our functions. Logged.
- **Size ceiling 50MB/file `[PROVISIONAL]`** — generous for phone video/voice, small enough to bound the bucket. Oversize is refused _at issuance_ with a gentle gold line ("That one's too big — text it to Taylor instead"), which is not a format rejection and does not violate the never-reject-format law. Logged.

## Experience & states

Steps per build spec §4 + UX spec §7. Voice card: `--color-card` bg, GradientRing at base speed (no hover accel on touch; reduced-motion holds it static — site law), upload trigger inside, verbatim help copy, the skip line below. Thumbnails render from the local file immediately (the flow's one moment of visual reward — instant, per §6.4); non-image files render a mono file-type tile.

**States (exhaustive):** per-file: queued · uploading (gold hairline progress) · uploaded · failed (`Didn't make it — tap to retry`, gold) · removed; voice card: empty · file-attached · replaced; consent + permission checkboxes: unchecked default (both) · checked; Step 8 conditionals per §6.5; Step 9 domain conditionals per build spec.

**Failure / edge states (named):** disconnect mid-PUT → failed tile with retry (re-issue URL); issuance refused (oversize) → gold line, no tile; token invalid at issuance → same not-found behavior as any action; duplicate filename → allowed (paths are uuid-keyed, `originalName` is metadata); a file selected then step-changed before upload completes → upload continues (component stays mounted within the step; on unmount, unfinished uploads are marked failed locally and shown on return `[dev's call on exact mechanics]`).

## Non-negotiables (this slice)

- **No credential or password field exists on Step 9** — and no free-text field is labeled in a way that invites one (build spec §5: a password typed into a text box is an upstream design failure).
- **The bucket stays private; no public URL is ever created; issuance requires the seam.**
- **Never reject an upload for its format.** Size is the only refusal, and it is gentle.
- **The ring appears here and nowhere else in the flow** (D-INT-3).
- **Voice/consent framing ships verbatim** — prominence must not curdle into pressure (UX spec §7).

## Data

**Schema changes: none.**

**Tables:** `intake_files` (insert/update via `server/services/submission.ts`); `engagements` (answers merge for the non-file fields; reads via seam).

**Placement:** `app/intake/_components/steps/{step-5-voice,step-6-photos,step-7-reviews,step-8-team,step-9-access}.tsx` · `app/intake/_components/{file-drop,voice-note-card,upload-tile}.tsx` · `app/api/intake/upload/route.ts` · `server/services/submission.ts` (extend: issuance, confirmation, file listing for a step) · `lib/validators/intake.ts` (steps 5–9 schemas + upload-issuance input).

**Validators:** per-step all-optional schemas; issuance input (fieldKey enum from the registry, size, filename — filename sanitized for metadata only, never used as the storage path).

## Accessibility

File inputs are real `<input type="file">` (build spec §8 — no custom drag-drop): label association on the styled trigger, upload state changes announced politely per file (not a storm on a 15-photo batch — batch the announcement), the ring is decorative (`aria-hidden` on the ring layer), checkbox copy readable as accessible names in full.

## Acceptance criteria (observable — mobile primary; a real phone for the camera/file-picker path if available)

1. Steps 5–9 render every build spec §4 field with specified types, help lines, conditionals; checklist against the tables; no credential field anywhere.
2. Voice card: the only GradientRing under `app/intake/` (`grep` for the component name); ring static under `prefers-reduced-motion`.
3. Uploading a photo: instant local thumbnail → progress hairline → uploaded state; row appears in `intake_files` with engagement-scoped `storagePath`, correct field key, mime, size.
4. A 15-photo batch uploads without UI jank; announcements are batched.
5. `.heic` and an odd audio format upload without rejection; an oversize file is refused at issuance with the gentle line and no tile.
6. Kill the network mid-upload → failed tile; retry succeeds.
7. Bucket check: objects are not publicly fetchable (direct URL 400/403); issuance endpoint without a valid token 404s.
8. Consent and publish-permission checkboxes default unchecked and persist via the normal answers path.
9. Negative: no image processing dependencies added; no answer or filename content in logs.
10. `npm run build`, `npx tsc --noEmit`, `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Supabase `createSignedUploadUrl` (service client, server-side) + client `PUT`/`uploadToSignedUrl` is the standard shape; the anon key is not required and must not be introduced for it.
- Storage path: `{engagementId}/{fieldKey}/{uuid}` — extension preserved for Taylor's convenience, name never trusted.
- Reuse INT-5's `useStepAutosave` for the non-file fields — the engine, not a fork (Forge's law).

## Dev's call

Progress event mechanics (fetch upload progress vs optimistic) · unmounted-upload handling detail · thumbnail generation (object URL) lifecycle.

## Out of scope

- **Signed _download_ links** — INT-7 (output email). **Transcription** — the deferred admin scope (`../ADMIN-HANDOFF.md`). **Straggler cleanup sweep** — INT-8's cron, if adopted.

## Depends on

- **INT-5** — the autosave engine and step patterns this slice copies. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** The confidentiality surface plus a multi-state file pipeline; choosing down produces a working uploader with a public-URL shortcut or a seam bypass — the incident class this project must never have.

---

### Kickoff (paste into the session)

> Build **INT-6 — Steps 5–9 + uploads** (attached spec). **Private bucket, seam-gated issuance, never reject a format, no password fields, the ring appears once.**
> Attach/read first, in order: this spec · `specs/README.md` · `../intake-form-build-spec.md` §4 Steps 5–9 + §5 · `../INTAKE-UX-SPEC.md` §6.4, §7 · `INT-5` (autosave engine — reuse, don't fork) · `../TECH-SCOPE.md` §5 · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Files go client → storage directly via signed upload URLs. Close in three places. Run `npm run build` + `npx tsc --noEmit` + `npm run lint`.
