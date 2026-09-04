# PORT-27 — Capture tooling: one command that shoots a site at MacBook aspect, checks whether it frames, and writes the content entry

**Epic:** PORT — coded (showcase) intake · **Phase 9** · Size: S
**Slice type:** A script for Taylor's curation. Risk class: a capture at the wrong aspect reaching a set; `embed: true` set by guess; a dependency added unpinned.
**Review:** **Mason — the one new devDependency (pinned, ratified). No client surface.**

**Status:** Complete (2026-09-04). **`playwright` ratified by Taylor** and added pinned exact at 1.62.1. Exercised against three live sites: every first capture is exactly 3024 × 1964, the framing verdict reads `X-Frame-Options: deny` as refused and a header-free site as a hint, no output ever contains `embed: true`, a key collision refuses without overwriting, and a printed entry with its TODOs filled passes `yarn verify:tracks` in a curated set. The test captures were deleted afterwards — curation is Taylor's, and orphan captures would ship in the build.

---

## Outcome

Taylor runs one command with a URL and a pack, and gets back a 3024 × 1964 capture of the site's opening view saved under `public/intake-examples/<pack>/`, one or two scrolled captures, a line saying whether the site allowed itself to be framed (by reading its `X-Frame-Options` and `Content-Security-Policy` response headers, which is the honest proxy), today's date as `checkedOn`, and a ready-to-paste `ExampleSite` entry with the capture dimensions filled in and the taxonomy fields left as `TODO` for him to tag. Curating forty sites becomes forty commands and forty tag decisions rather than forty screenshot sessions. What this slice does not do: tag, choose, or commit any site; it produces material for a human.

## Why / intent

- **`../CODED-INTAKE-TASTE-UX-SCOPE.md` §4.4 and §5.2** — `embed`, `checkedOn`, captures at 1512:982 at 2×. §7.2 — why embeddability is a curation-time fact.
- **Both research libraries** — "re-check every link before showing the gallery to a client"; ~110 candidate sites. The tooling is what makes the curation contract achievable.
- **PORT-22** — the content shape the entry must match; `yarn verify:tracks` is the check on what he pastes.
- **What this slice is NOT (binding):** not curation; not a crawler; not run on a schedule; never run against a client's own reference links (those are the client's, not ours to capture).
- **Ground truth:** `scripts/` conventions (`node --import tsx`, `_env.ts`), `content/intake-examples/types.ts`.

**Rulings this slice makes (labelled, logged):**

- **`playwright` as a pinned devDependency, Chromium only.** `[NEEDS DECISION — Taylor]` — a new dependency is his to ratify; the alternative is manual capture. Cost of the dependency: ~300 MB of browser binaries on install, never shipped. Logged once ruled.
- **Embeddability is inferred from response headers, then stated as a hint, never written as `true` by the script.** `X-Frame-Options` present or `frame-ancestors` without our origin → `embed: false` in the entry; neither present → the entry says `embed: false, // headers allow framing — verify by opening it in the overlay before flipping` because JS-based frame-busting exists and only a look proves it. Logged.

## Behavior & states

**No client surface.** `yarn capture:example --url https://… --pack film [--key slug]`:

1. Launches headless Chromium at a 1512 × 982 viewport, device scale 2, `prefers-reduced-motion: reduce` (so an autoplay reel's first frame is what lands), waits for network idle with a ceiling, dismisses nothing (a cookie banner in the capture is honest).
2. Writes `<key>-1.jpg` (opening view), `<key>-2.jpg` and `<key>-3.jpg` (scrolled one and two viewports) to `public/intake-examples/<pack>/`, quality 82.
3. Reads the response headers of the document request and prints the framing verdict.
4. Prints an `ExampleSite` literal with `key`, `name` (from `<title>`, for editing), `url`, `checkedOn` today, `captures` with real dimensions and `alt: "TODO"`, `embed` per the ruling, and `role`, `group`, `axes`, `styles`, `build` as `TODO` comments.

**Failure states (named):** DNS or TLS failure → one line, nothing written · timeout → whatever loaded is captured and the line says so · a login wall or an interstitial → captured as-is (Taylor decides) · `--key` collides with an existing file → refuses rather than overwriting.

## Non-negotiables (this slice)

- **The script never writes to a set file.** It prints; Taylor pastes.
- **`embed` is never emitted as `true`.**
- **Nothing here runs in the app, at build, or on Vercel** — a script under `scripts/`, devDependency only.
- **The dependency is pinned exact and ratified before install.**

## Data

**Schema changes: none.** **Tables:** none.

**Placement:** `scripts/capture-example-site.ts` · `package.json` script `capture:example` · `.gitignore` unchanged (captures are committed content; the browser binaries are not in the repo).

**Validators:** none.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. Running against three public sites (one known to send `X-Frame-Options`, one not) produces three sets of captures at exactly 3024 × 1964 for the first frame and prints entries whose `captures[0]` dimensions match the files.
2. The framing verdict is `false` for the header-sending site and the hint comment for the other; no output contains `embed: true`.
3. Pasting one printed entry into a dev-local set and flipping `curated: true` passes `yarn verify:tracks` once the `TODO` fields are filled.
4. A collision on `--key` refuses without overwriting.
5. `yarn build:agent` is unaffected (the script is not in the app graph); `npx tsc --noEmit` and `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `page.emulateMedia({ reducedMotion: "reduce" })` before navigation.
- Read the document response via `page.waitForResponse` on the main frame, not from a second fetch — one request, one set of headers.
- JPEG over PNG: forty PNG hero captures at 3024 wide would be tens of megabytes in `public/`.

## Dev's call

Timeouts · scroll distances for captures two and three · filename slugging · whether `name` is taken from `<title>` or `og:site_name`.

## Out of scope

- **Curation and tagging** — Taylor.
- **Any automated re-check of `checkedOn`** — `[REVISIT]` when a pick's link is found dead on a call.

## Depends on

- **PORT-22** — the content shape. Complete in `PROGRESS.md` required.
- **Taylor** — ratify the `playwright` devDependency. `[NEEDS DECISION]`.

## Recommended execution

**Sonnet.** A script against a precise output shape; the only judgment is already pinned (never emit `embed: true`, never write to a set file).

---

### Kickoff (paste into the session)

> Build **PORT-27 — Capture tooling** (attached spec). **Print, never write to a set; never emit `embed: true`; pinned dependency, ratified.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-TASTE-UX-SCOPE.md` §4.4, §5.2, §7.2 · `content/intake-examples/types.ts` (PORT-22's shape) · `scripts/_env.ts` and one existing script for conventions · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Confirm the dependency is ratified before `yarn add -D --exact playwright`. Close in three places. Run `npx tsc --noEmit` + `yarn lint` + `yarn verify:tracks`.
