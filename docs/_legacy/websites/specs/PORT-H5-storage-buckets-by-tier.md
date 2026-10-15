# PORT-H5 — Hotfix: the `intake` bucket is missing on staging (every upload and the voice note fail locally)

**Epic:** PORT — coded (showcase) intake · **Hotfix** · Size: S (code) + one Taylor action (infrastructure)
**Slice type:** Infrastructure gap plus the code that should have named it. Risk class: every client upload — project images, headshots, documents, media, the voice note — 500s on any tier whose Supabase project lacks the bucket, and the log line does not say which bucket or which project.
**Review:** Forge (the log line and the verify script touch a data path; nothing may log a filename, a path segment carrying an engagement id, or a token).

**Status:** Complete (2026-09-14) — Taylor's action (§ Taylor's action) done same day the gap was found; code shipped the same session. `yarn storage:verify` passes on both tiers for the two intake-process buckets (`intake`, `PRIVATE`); a signed-upload-URL probe against staging's `intake` bucket confirmed the exact failing call now succeeds. **Not walked in the running app** — no browser pass of an actual project-image upload or a recorded voice note through to a transcript; that is criterion 2's remaining half. Separately confirmed, out of this ticket's scope: production has no bucket named `public` (only `PUBLIC`), so the taste-gallery capture path is broken there until a Vercel env var is set — logged in `PROGRESS.md`, not fixed here.

> **Vigil — verification.** Runtime, against the staging project: one project-image upload, one voice-note recording through to a transcript, one step-2 document, one step-8 portrait — **still needed**, against the running app. Code: verified — the storage-layer probe (below) confirms the underlying call, and `yarn storage:verify`'s output for both tiers is captured under Acceptance criteria.

---

## Outcome

Uploading on localhost works again, and so does the voice note — which never reached OpenAI because it never reached storage. `yarn storage:verify` tells you, per tier, which of the three buckets the app expects actually exist, so the next missing bucket is a one-line answer rather than a field-test finding. The upload 500's log line names the bucket it could not reach. The two places in the repo that claim the bucket "was created in both projects" stop claiming it. This slice does **not** change what is uploaded, where inside the bucket it lands, or any client-facing state — the retry tile and the recorder's "That didn't send" card are already the correct surfaces for this failure and stay as they are.

## Root cause (investigated 2026-09-14)

`POST /api/intake/upload` → `issueUploadTicket` (`server/services/submission.ts`) → `createSignedUploadUrl` on `intakeBucket()`, which reads `SUPABASE_INTAKE_BUCKET` and falls back to `intake`. Supabase's storage service answers a signed-upload request for a bucket that does not exist with its foreign-key message — **"The related resource does not exist"** — which `issueUploadTicket` wraps as `Could not create an upload URL: …` and the route logs as `[intake] upload issuance failed`. That is the exact line in Taylor's terminal.

Local borrows the **staging** credentials (`lib/config/env/resolve-tier-env.ts`, `credentialSet`). The buckets actually present, read with the service-role key on 2026-09-14 (names only):

| Tier | Supabase project | Buckets present | Missing, and what breaks |
|---|---|---|---|
| staging (= local) | `wnsejddseaucmsirsfwo` | `public` (public) | **`intake`** — every client upload, the voice note, fetched link sources · **`PRIVATE`** — the invoice PDF archive (non-fatal by design; `pdf_storage_path` stays null and ops is notified) |
| production | `hfejudilalqxbewyfeoj` | `PUBLIC` (public) · `PRIVATE` · `intake` | nothing for uploads. **`captureBucket()` defaults to `public`, which does not exist there** — `SUPABASE_LIVE_PUBLIC_BUCKET=PUBLIC` must be set on Vercel or every taste-gallery capture write and the seeded gallery fail with "Bucket not found". Unverified from this machine (Vercel env is not readable here); it is the open Phase 10 item, restated with the evidence. |

So the 2026-09-12 fix (`CODED-INTAKE-FIELD-TEST-FINDINGS.md` §2.1, and the docblock on `intakeBucket()`) closed production and **did not close staging**, and the record says otherwise in three places. No environment override is set on this machine; the code reads the right name; the bucket is simply absent.

**The voice note is the same defect, not a second one.** `voice-recorder.tsx` uploads the recording through the one ladder in `app/websites/intake/_lib/upload-file.ts` (`fieldKey: "voice_note"`) and only then calls `/api/intake/transcribe`, which downloads the object from the bucket and sends the bytes to OpenAI (`server/services/voice-transcription.ts`, `downloadUpload`). The upload issuance 500s first, so the transcribe route is never called and `OPENAI_API_KEY` (set, and not the problem) is never used. The recorder's "That didn't send. Your recording is still here" card is the designed surface for a failed upload and is behaving correctly.

## Every upload site, and where it lands (the audit Taylor asked for)

Two buckets take client material, one takes admin material. Paths are built server-side from the engagement id and the field key; the client's filename is metadata only (`submission.ts` § Uploads).

**Bucket `intake` (private) — `{engagementId}/{fieldKey}/{uuid}{ext}`**, minted by `issueUploadTicket`, PUT by the browser via a signed URL, confirmed by `confirmUpload`. Every `FileDrop` and the recorder go through `uploadIntakeFile`:

| Surface | Component | `fieldKey` | Per-entry (`entryKey`) |
|---|---|---|---|
| Coded step 1 · ingest documents | `steps/step-ingest.tsx` | `ingest_documents` | — |
| Coded step 1 · fetched link pages (server-written text, `writeSourceObject`) | `server/services/document-reading.ts` | `ingest_links` | — |
| Coded step 1 · team headshots | `person-entry.tsx` | `headshot` | yes |
| Coded step 2 · documents | `document-drop.tsx` | `documents` | — |
| Coded step 4 · project images | `project-entry.tsx` | `project_images` | yes |
| Coded step 4 · piece images (venture) | `piece-entry.tsx` | `piece_images` | yes |
| Coded step 5 · inspiration | `steps/step-taste.tsx` | `inspiration` | — |
| Coded step 7 · voice note (recorded or dropped) | `voice-recorder.tsx` · `steps/step-words.tsx` | `voice_note` | — |
| Coded step 7 · writing | `steps/step-words.tsx` | `writing` | — |
| Coded step 8 · the place · portrait · behind the scenes · laurels · logo · brand assets | `steps/step-media.tsx` | `place` · `portrait` · `behind_scenes` · `laurels` · `logo` · `brand_assets` | — |
| Durable step · reviews | `app/websites/intake/_components/steps/step-reviews.tsx` | `review_screenshots` | — |
| Durable step · voice | `…/steps/step-voice.tsx` | `voice_note` · `screenshots` · `writing` | — |
| Durable step · photos | `…/steps/step-photos.tsx` | `logo` · `brand_assets` · `photos` · `portrait` | — |

Reads from the same bucket: `downloadUpload` (transcription; document reading), `linkUploads` (signed download links for the intake document and the admin engagement page).

**Bucket `PRIVATE` (private) — `PDFs/{engagementId}/{filename}.pdf` and `PDFs/stripe/{invoiceId}/{filename}.pdf`**, `server/services/invoices.ts` `archiveInvoicePdf`, overridable via `INVOICE_PDF_BUCKET`. Non-fatal on failure by design.

**Bucket `public` / `PUBLIC` (public) — `sites/examples/{slug}/{position}-{hex}.{ext}`**, `server/services/example-captures.ts`, id from `SUPABASE_PUBLIC_BUCKET` (`lib/intake/example-media.ts`, default `public`). Admin-only writes; every client reads. Not a client upload path.

Nothing else in `server/`, `lib/`, `app/`, or `scripts/` calls `storage.from(`. The three ids above are the whole surface.

## Taylor's action (infrastructure — nothing else in this ticket matters until it is done)

Create `intake` (private) in the **staging** project, and `PRIVATE` (private) while there. Either:

- `yarn db:setup` from this repo with `APP_ENVIRONMENT` unset or `local` — it resolves to staging, runs `db/supabase/setup/*.sql` in order, and is idempotent. It is safe on staging specifically because staging's public bucket is already lowercase `public`, so the file's `insert … 'public'` is a no-op there. **Do not run it against production** (the existing warning: it would add a lowercase `public` beside `PUBLIC`). Or:
- the dashboard: Storage → New bucket → id `intake`, private; again for `PRIVATE`.

Then confirm with the script this ticket adds, or until it exists, by uploading one project image on localhost and watching the terminal.

**Done, 2026-09-14.** Taylor created `intake` and `PRIVATE` in the staging project by hand, via the dashboard — matching the screenshot of production's bucket list, side by side. `yarn storage:verify` confirms both now exist with the right `public=false` flag on both tiers.

## Why / intent

- **M-INT-8** — the browser holds no Supabase key; the signed URL is minted server-side, so a missing bucket is only ever visible in a server log. That is why the log line has to be good.
- **`docs/intake/specs/DEVIATIONS.md:240` and this folder's 2026-09-04 PORT-32 entry** — bucket ids are per project, case-sensitive, and infrastructure rather than code facts. This ticket adds the check those entries implied and never got.
- **What this slice is NOT (binding):** not a change to `intakeBucket()`'s fallback, not a runtime bucket-creation call (the service-role key could create it, and an app that silently provisions its own storage on first request is the kind of magic that hides the next misconfiguration), not a change to any client-facing state or string.
- **Ground truth:** `server/services/submission.ts` (`intakeBucket`, `issueUploadTicket`, `writeSourceObject`, `downloadUpload`, `linkUploads`) · `app/api/intake/upload/route.ts` · `scripts/db-setup.ts` · `scripts/_env.ts` (`applyTierEnv`) · `lib/config/env/resolve-tier-env.ts`.

**Rulings this slice makes (labelled, logged):**

- **A read-only verify script, not a startup check.** Listing buckets on every cold start would add a network call to every serverless invocation to answer a question that changes once a quarter. `yarn storage:verify` is run by a human before a client run and by anyone who reads a "related resource" line. Logged.
- **The log line names the bucket id and nothing else new.** The id is infrastructure vocabulary, not client content. It must not carry the storage path (it contains the engagement id) or the filename. Logged.

## Experience & states

No client-facing change. Client-side, the failure already renders as the `FileDrop` retry tile ("Didn't make it — tap to retry") and the recorder's "That didn't send" card; both are correct for a server-side failure and remain.

**States (exhaustive):** bucket present → uploads work as before · bucket absent → 500, retry tile, log line now says `(bucket "intake")` · `yarn storage:verify` → one row per expected bucket per resolved tier, present or **MISSING**, with the public flag, exit code 1 on any missing.

**Failure / edge states (named):** `SUPABASE_URL` unresolved → the script says so and exits 1 (same message shape as `requireEnv`) · a bucket present with the wrong public flag (`intake` public, or `PRIVATE` public) → reported as **WRONG FLAG** and exit 1; the script never flips a flag.

## Non-negotiables (this slice)

- **Nothing here creates, deletes, or flips a bucket.** Infrastructure is Taylor's; the script reads.
- **No storage path, filename, token, or engagement id in any new log line.** Bucket id only.
- **The durable track is untouched.** No file under `app/websites/intake/` changes.

## Data

**Schema changes: none.** **Tables:** none. **Storage:** no new bucket ids; the three named above. **Placement:** `scripts/verify-storage.ts` (new; `yarn storage:verify` in `package.json`, same `node --env-file-if-exists=.env.local --import tsx` shape as `db:setup`) · `server/services/submission.ts` (the thrown message in `issueUploadTicket`, `writeSourceObject`, and `downloadUpload` gains `(bucket "<id>")`; the `intakeBucket()` docblock's "both projects" sentence corrected to say production only, staging closed by PORT-H5) · `.env.example` (the `SUPABASE_*_INTAKE_BUCKET` comment: same correction).

## Acceptance criteria (observable)

1. Before Taylor's action: `yarn storage:verify` on this machine prints `intake MISSING` and `PRIVATE MISSING` for tier `local → staging` and exits 1. `APP_ENVIRONMENT=production yarn storage:verify` prints all three present and exits 0 (production's public bucket is `PUBLIC`; the script reports whatever `SUPABASE_PUBLIC_BUCKET` resolves to, so on production it will print `public MISSING` until `SUPABASE_LIVE_PUBLIC_BUCKET=PUBLIC` is set — that is a true report, not a false positive).
2. After Taylor's action: `yarn storage:verify` exits 0 for local; on localhost a project image uploads (tile shows the thumbnail, no retry link), a step-8 portrait uploads, a step-2 document uploads, and a recorded voice note uploads **and** returns a transcript (this is the first time `/api/intake/transcribe` is exercised on this machine).
3. With the bucket temporarily misnamed via `SUPABASE_STAGING_INTAKE_BUCKET=nope` in `.env.local` (dev server restarted — the env block is baked at `next.config.ts` load, so a running server does not see a `.env.local` edit), the terminal line reads `[intake] upload issuance failed Could not create an upload URL (bucket "nope"): The related resource does not exist` and carries nothing else. Remove the override afterwards.
4. `grep -rn "both projects" server/services/submission.ts .env.example` returns nothing; the docblock and the comment say production only.
5. `git diff --stat app/websites/intake/` is empty.
6. `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The script is ~30 lines: `applyTierEnv()`, `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`, `storage.listBuckets()`, compare against `[{ id: intake, public: false }, { id: INVOICE_PDF_BUCKET ?? "PRIVATE", public: false }, { id: SUPABASE_PUBLIC_BUCKET ?? "public", public: true }]`. It must import the bucket-name readers rather than repeat the literals — export `intakeBucket()` from `submission.ts` (it is module-private today), reuse `captureBucket()` from `lib/intake/example-media.ts`, and export `archiveBucket()` from `invoices.ts` — so the script cannot drift from what the app actually reads. Print the tier and the project hostname (from `SUPABASE_URL`), never the key.
- Top-level `await` under `tsx` in this repo's CJS output fails; wrap in `async function main()` as `db-setup.ts` does.
- The docblock on `intakeBucket()` also names `SUPABASE_LIVE_INTAKE_BUCKET` / `SUPABASE_STAGING_INTAKE_BUCKET`; that part is accurate (`resolve-tier-env.ts:132`) and stays.

## Dev's call

Whether the verify script also lists the `intake_files` rows with `uploaded_at IS NULL` for the tier (started-and-abandoned uploads, which this defect produced dozens of) — useful, read-only, but not required.

## Out of scope

- Runtime bucket creation. · Any change to the upload ladder, the retry tile, or the recorder. · Setting Vercel environment variables (Taylor; the production `PUBLIC` casing is the open Phase 10 item). · Cleaning up the abandoned `intake_files` rows created while the bucket was missing (they are harmless: `uploaded_at` is null, the document lists what arrived).

## Depends on

- **Taylor's action above.** No slice dependencies.

## Recommended execution

**Sonnet, or Cursor composer.** One script, three error strings, two comments. The way to fail this is to make the script "helpful" by creating what is missing — criterion 1's exit code and the non-negotiables exist to catch exactly that.

---

### Kickoff (paste into the session)

> Build **PORT-H5 — the `intake` bucket is missing on staging** (attached spec). **Add `yarn storage:verify`, name the bucket in the three storage error messages, correct the two "both projects" claims. Create nothing.**
> Attach/read first, in order: this spec · `specs/README.md` · `server/services/submission.ts` § Uploads · `scripts/db-setup.ts` and `scripts/_env.ts` · `lib/config/env/resolve-tier-env.ts` · this folder's logs.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
