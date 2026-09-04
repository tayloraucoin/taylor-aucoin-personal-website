# PORT-21 — Files and links: reading what a client attached and linked

**Epic:** PORT — coded (showcase) intake · **Phase 7** · Size: L
**Slice type:** Two new third-party data paths — a client's uploaded documents and the pages behind links they typed — feeding the ingestion run (PORT-18). Risk class: a 40 MB deck that silently reads as nothing; a scanned page whose transcription invents a sentence the quote validator then "verifies"; an outbound fetch on client-supplied input; a client's confidential deck leaving the trust boundary with anything attached to it.
**Review:** **Loom — the read stage's contract and the weakened quote guarantee. Mason — the source rows, the no-migration reuse of PORT-20's columns, the SSRF posture. Vesper — the per-source states on the card and in the completed summary.**

**Status:** **Complete (2026-09-03).** Files are read the moment they upload — PDFs and images by the model, Word and PowerPoint and text unzipped and read on our own server, everything else stored for Taylor. Links are fetched by the model's own server-side tool, so no request leaves our infrastructure. Every source feeds the run, and every value the run writes says which source it came from and whether a machine did the reading. **Three live evals clean**: sources (24 of 24 lines recalled, zero invented, links fetch and fail as values), ingestion (5 cases, 25 fields, 22 entries), extraction (10 of 10). **Never exercised against a real engagement** — no database is reachable in this session, so the upload-to-read path, the source rows, and the run reading a real file are verified by isolated eval and by reading, not by a round trip. Decisions recorded as M-PORT-35, 36, and 37.

A post-build audit against this spec found three gaps, all now closed: the run did not wait for a file still being read (it does, for 20 seconds, and names what did not finish), the confirmation did not list what was about to be read (it does, including how many are mid-read), and two helpers were written for that confirmation and never wired (deleted).

Two things are Taylor's: **ratify `fflate`**, one new pinned dependency; and **run PORT-20's migration `0011`**, without which the transcript columns this ticket writes into do not exist.

**Original scope, as written before the build:** Mandatory follow-up to PORT-18 (Taylor, 2026-09-03: "we MUST do the files and links after"). Numbered 21 because another thread shipped PORT-19 (questions pass two) and PORT-20 (voice transcription) the same day; PORT-18's earlier references to "PORT-19" mean this ticket.

**Where the build departed from this spec**, each logged in `DEVIATIONS.md`: `fflate` replaced `mammoth` and reads both Office formats with one path (M-PORT-36); the eval lives in `--sources` modes on the existing harness with fixtures generated at run time rather than committed; and the per-value provenance became `{ name, transcribed }` on `IngestedField` rather than a file id and a kind, because what the mark has to say is which file and whether we read it (M-PORT-37).

> **Loom — cognition review.** Everything PORT-18 verifies, it verifies against text we hold. This slice adds text a *model* produced from a PDF page or a fetched web page, and a quote that matches a model's transcription is weaker evidence than a quote that matches a client's paste. The design below keeps that weakening visible rather than hiding it inside the same green tick.

---

## Outcome

A client drops a deck, a one-pager, a PDF of their old site, a flyer, a scan, onto step 1's file drop. Each one is read as it lands — the card says "reading…", then "read", with the text it produced available to open and correct — and when they press **Read it all** the run has the file's words alongside their paste. A client types the links that explain them — the old site, an interview, a festival page, a profile — into a box on the same step, one per line. When they press the button, those pages are fetched and read on Anthropic's infrastructure, never from our server, and their text joins the same run. Every source the run used is listed in the completed summary with what happened to it: read, couldn't be read, too big, or not ready in time. A file nothing can read is still stored, still in Taylor's document, and the card says so in plain words.

What this slice does **not** do: read files dropped on any other step (step 2's old primer drop, step 8's documents); follow links found inside the paste box; summarise anything; or let a fetched page or a transcribed file reach the answers document except through PORT-18's validators.

## Why / intent

- **Taylor, 2026-09-03** — "I want files to be analyzed by AI and stored in Supabase storage. The links must be investigated by AI." Ratified as the mandatory follow-up when PORT-18 cut both.
- **PORT-18 (in progress)** — the ingestion run, its kind-scoped inventory, its quote validator, its provenance record and machine-filled mark. This slice adds sources to that run; it adds no second run, no second validator, no second mark.
- **PORT-20 (Complete) · M-PORT-29 / M-PORT-30** — a file's derived text lives on its `intake_files` row in six columns, with a per-file attempt budget and a status vocabulary. **This slice reuses those columns for documents and needs no migration.** A transcript of a voice note and a transcription of a PDF are the same kind of fact: the file, written out, by a machine, unreviewed until someone edits it.
- **The Claude API reads PDFs and images natively** — a `document` block for a PDF (32 MB per request, 600 pages on `claude-sonnet-5`'s 1M context), an `image` block for a photo of a flyer. A scanned PDF is read the same way a typed one is, without an OCR dependency. DOCX and PPTX are not native and are read by unzipping their XML locally.
- **The Claude API's web fetch is a server tool** (`web_fetch_20260209`, supported on `claude-sonnet-5`): the model fetches only URLs already in the conversation, on Anthropic's infrastructure, restricted to an `allowed_domains` list we set from the client's own links. The SSRF surface leaves our server entirely. Client-supplied input never becomes an outbound request from a Vercel function.
- **`extract.ts` / `voice-transcription.ts`** — the two existing disciplines for material leaving the trust boundary: nothing identifying travels with it, nothing is logged, the model is pinned.

**Rulings this slice makes (labelled — ratify or overrule):**

- **Files are read at upload, not at run.** The moment `confirmUpload` lands for an `ingest_documents` file, a fire-and-forget server action reads it, exactly as PORT-20 transcribes a recording after it uploads. The run then finds renderings ready and does not carry a 60-page deck's minute of transcription inside its own `maxDuration`. A file still reading when the button is pressed is waited on for a bounded time, then listed in the summary as not ready. `[PROPOSED]`
- **A document's rendering lives in `intake_files.transcript`** and its five companion columns, docstring widened from "the voice note, written out" to "the file, written out". `transcript_model` records `claude-sonnet-5`, `mammoth`, `pptx-xml`, or `text`, so the quality of a rendering is never a mystery. No migration. `[PROPOSED]`
- **Links become source rows too.** Each fetched page is written to the private `intake` bucket as `{engagementId}/ingest_links/{sha256(url)}.txt` and gets an `intake_files` row (`field_key = ingest_links`, `original_name` = the URL, `mime_type = text/plain`, `uploaded_at` = now) with the fetched text in the same transcript columns. One shape for every source, one query to list them, one place the intake document renders them. `[PROPOSED]`
- **Links are read only from a dedicated field.** `links` on the ingest schema, one URL per line, capped at ten, http(s) only, hostnames only. A URL inside the paste box is text and stays text. Explicit consent to fetch, and the copy says so. `[PROPOSED]`
- **The web fetch call harvests the tool result and ignores the model's prose.** The `web_fetch_tool_result` block carries the page's document content; that is what we store. We do not ask the model to echo a page back, which would make the rendering model output for no reason. `[PROPOSED]`
- **Model-transcribed sources are flagged on every value they support.** `IngestedField` gains `source: { fileId, kind: "paste" | "text" | "transcribed" | "fetched" }`; the machine-filled mark names the source file or page beside the quote, and says "as we read it" when the text came from a transcription rather than from something the client typed. The quote validator is unchanged; what changes is that the client and Taylor can see how far the quote is from the original. `[PROPOSED]`

## The read stage (Loom)

**Job, one sentence per source kind:** *write this file out, verbatim, page by page* (PDF, image); *extract this document's text* (DOCX, PPTX, TXT/MD/CSV — no model); *fetch these pages and hand back their text* (links).

**Routing, by MIME type and extension, decided in one table in the service:**

| Source | How | Model? | Unreadable when |
|---|---|---|---|
| PDF | `document` block, base64; instruction: transcribe verbatim, `--- page N ---` markers, describe an image in brackets, never summarise | `claude-sonnet-5` | over 32 MB, or the API rejects the page count |
| PNG / JPEG / WebP / GIF | `image` block; same instruction plus one line on what the image shows | `claude-sonnet-5` | over the image size limit |
| DOCX | `mammoth` (pinned exact) → raw text | no | parse failure |
| PPTX | unzip, read `ppt/slides/slide*.xml` `<a:t>` runs in slide order | no | parse failure |
| TXT / MD / CSV | as-is | no | — |
| Keynote / Pages / Numbers / audio / video / archives / anything else | — | — | always: **stored, Taylor reads it** |
| Link | `web_fetch_20260209` with `allowed_domains` = the link's host, `max_uses: 1` per URL, `max_content_tokens` capped | `claude-sonnet-5` (as the tool's caller) | the tool returns an error block: blocked, 404, timeout, a JS-only app, a login wall |

**Context set.** The file bytes or the URL, and the instruction. Nothing else: no name, no kind, no other answers, no engagement id. The transcription prompt is a versioned module beside `extract.ts`'s, deliberately dull: copy what is there, mark what you cannot read as `[unreadable]`, never fill a gap.

**Budgets.** Per file, `transcript_attempts` capped at 5 (M-PORT-30). Per run, a **source ceiling** of roughly 400k characters across paste plus renderings (≈100k tokens — well inside the 1M window, bounded for cost and latency). When sources exceed it, **whole sources are omitted, largest first, and named in the summary** — never truncated, per the refuse-not-truncate law. Links are capped at ten and each fetch at a fixed `max_content_tokens`.

**Cost, estimated, unmeasured:** a 60-page deck ≈ 120–180k input tokens plus ≈ 30k output ≈ $0.60 at Sonnet 5 rates; ten fetched pages ≈ 100k input ≈ $0.20. Report actuals from `usage` on the first live run.

**Latency, estimated:** a 60-page PDF transcription is one to two minutes; a DOCX is milliseconds; ten fetches in one call are ten to thirty seconds. Reading at upload is what keeps this off the run's critical path.

**The weakened guarantee, stated.** PORT-18's validator proves a quote is *in the source text we hold*. For a transcribed PDF or a fetched page, that text is itself a model's output. A hallucinated transcription sentence would pass the check. Mitigations, in order of weight: the transcription instruction forbids composition and the eval grades it against a fixture whose true text is known; the rendering is visible and editable on the card, so a client can correct it before the run; every value from such a source is marked "as we read it" with the file named; the intake document lists which values rest on transcribed sources; and Taylor holds the original file. What this does not do is make a transcription as trustworthy as a paste, and the copy never claims it does.

**Degradation ladder, per source, never per run.** Unreadable format → `transcript_status = 'unsupported'`, card says stored for Taylor · too big → `'too_large'`, same line · model or parse failure → `'failed'`, attempts incremented, retry offered · fetch error → a `'failed'` link row with the tool's error code kept internally and a plain sentence on the card · still reading at run time → the run waits up to 20 seconds, then proceeds and lists it as not ready · over the source ceiling → omitted whole, named. A run with every source unreadable still runs on the paste. A run with an empty paste and one readable file runs on the file.

**Privacy.** Document bytes and fetched pages reach Anthropic and nowhere else; the request carries no name, token, id, or answer. `/websites/privacy` names the vendor and describes the flow in plain words, as PORT-20 did for OpenAI, **before** the first file can be read. Nothing — bytes, text, URL, filename — is logged.

**Eval, before the prompt.** Extend `scripts/eval-primer.ts` with a `--sources` mode and `scripts/evals/sources/`: a synthetic 12-page PDF generated at eval time with `@react-pdf/renderer` (already a dependency) whose true text is known, graded for verbatim recall and for zero composed sentences · a synthetic DOCX and PPTX built at eval time, pure · a Keynote-shaped binary and a 33 MB blob, pure, must route to unsupported / too_large · a private-IP, a `localhost`, and a `file:` URL, pure, must be refused before any call · a static page and a 404 and a JS-only page, live, graded for the tool's error handling · a scanned page, **human-graded by Taylor with one real scan** because no synthetic scan can be committed. Every number with its n.

## The surface (Vesper)

**On the ingest step.** The file drop gains per-file states under each tile, in the vocabulary PORT-20 already uses on the voice card: *reading…* · *read — open the text* · *couldn't read this one — it's stored, and Taylor reads it* · *too big to read — stored for Taylor* · *didn't make it — tap to retry*. "Open the text" reveals an editable box with the rendering, above one line saying it is a machine's reading and theirs to correct. Nothing about an unreadable file is styled as a mistake.

A new field, **Links worth reading** `long text` — "One per line. Your old site, an interview, a festival page, a profile. We read the page; we don't follow anything on it." `[COPY — pending Taylor]`. Under it, the honest ceiling: Instagram, LinkedIn, and most logged-in pages can't be read from outside; paste what they say instead.

**The files copy** on the step drops its "for now only the box above gets read" sentence the day this ships. Its `[COPY — pending Taylor]` marker stays.

**In the confirmation.** The card lists what the run will read: the paste, N files read, M files still reading, K links. A client sees before pressing that a file is still reading and can wait.

**In the completed summary.** Every source, with its outcome, in plain words. Sources that were omitted for size or not ready in time are named, with "Taylor reads it" beside each.

**In the intake document.** A `## Sources read` section: each file and link, its status, and a link to the original; renderings themselves are not printed (they are the file, and Taylor has the file). Values that rest on a transcribed source carry that in the machine-filled list PORT-18 adds.

## Structure (Mason)

- `server/services/document-reading.ts` — the read stage: routing table, transcription prompt module, the DOCX/PPTX readers, `readUploadedFile(fileId)` and `readLinks(engagementId, urls)`, each writing the transcript columns under the M-PORT-30 attempt guard. Named to sit beside `voice-transcription.ts`, not inside it.
- `lib/intake/source-kinds.ts` — the routing table as data, so the card and the document read the same list of what is readable.
- `app/websites/coded/intake/_actions/read-source.ts` — thin: resolve the token, call the service, return a result. Refuses in preview.
- `stepIngestSchema` gains `links: text`; label `links: "Links worth reading"`; upload field key `ingest_links` labelled for the document.
- `submission.ts` — `downloadUpload` exists (PORT-20); add `writeSourceObject` for the link `.txt` objects, service-role, same bucket.
- PORT-18's ingestion service takes a `sources: Source[]` list instead of one string; `keepValidProposals` runs against the concatenation of every source's text with section markers, and the section a quote falls in becomes the `source` on the `IngestedField`.
- Dependencies: `mammoth` pinned exact. Nothing else — the PPTX reader is forty lines over `jszip`, which `mammoth` already brings.
- `.env.example` unchanged: the Anthropic key is already required.

## Questions for Taylor (defaults attached; the build proceeds on them)

1. **Read at upload, or at run?** Default: at upload. It keeps a deck's transcription off the run's timeout and lets the client see and fix the reading before pressing the button.
2. **Reuse PORT-20's transcript columns for documents, or add document-specific columns with a migration?** Default: reuse, docstring widened. One shape for "a file, written out".
3. **Which drops are read?** Default: only step 1's `ingest_documents`. Step 8's `documents` and the old primer drop stay Taylor-read in this pass; reading them is one more field key in the routing table when wanted.
4. **Links: a dedicated field only, or also URLs found in the paste?** Default: dedicated field only. Fetching is a real action on the client's behalf and should be something they typed into a box labelled for it.
5. **The source ceiling.** Default 400k characters per run. Higher costs money per run; lower omits decks. The number is provisional; the mechanism is not.

## Acceptance criteria

1. A PDF with a text layer, a scanned PDF, a PNG of a flyer, a DOCX, a PPTX, and a TXT each produce a rendering on their row; a Keynote and a 33 MB PDF produce `unsupported` / `too_large` and stay in the intake document as files.
2. Ten links produce ten source rows with text; a 404 and a login wall produce `failed` rows with a plain sentence on the card and no thrown error; a private-IP or `file:` URL is refused before any request is made.
3. The outbound request for a file carries the bytes and the instruction and nothing about the engagement (captured and inspected); the fetch call's `allowed_domains` is exactly the link's host.
4. PORT-18's run uses every readable source; a value supported by a transcribed source is marked "as we read it" with the file named; the intake document's machine-filled list says which values rest on transcriptions.
5. Nothing logs bytes, text, a URL, or a filename across every induced failure.
6. `/websites/privacy` names the vendor and the flow.
7. The eval's pure modes pass; the live mode is run and reported with its n before a client uses it.
8. `npx tsc --noEmit` · `yarn build:agent` · `yarn verify:tracks` · `yarn eval:primer --inventory` · eslint clean.

## Depends on

- **PORT-18** slices 3–5 (the run, the validators, the record, the mark, the surface) — in progress.
- **PORT-20** — the transcript columns and `downloadUpload`. Complete; **migration `0011` must be run against the hosted databases first.**
