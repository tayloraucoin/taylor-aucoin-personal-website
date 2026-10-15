# INT-7 — Done screen, the markdown output, completion + output emails

**Epic:** INT — client intake · **Phase 4** · Size: M · **Launch-blocking**
**Slice type:** The point of the build — the document the whole system exists to produce (build spec §6), plus flow completion. Risk class: a dishonest document (blank headings, missing flags) that quietly reintroduces the Clean Coast failure mode.

**Status:** Code complete (2026-08-18) — the document generator, every risk flag, Not-answered honesty, and completion monotonicity verified against a scratch Postgres; email delivery and rendering are NOT verified

> **Content-integrity review.** The generator is reviewed against build spec §6's requirements list item by item: Not-answered section, risk flags, signed links, deposit line. A generated document from a deliberately half-filled engagement is part of verification, not an afterthought.

---

## Outcome

A client tapping Continue on Step 9 lands on Done: "That's everything, {first name}," the what-happens-next line, their skipped items as a warm inventory, the Cal.com booking CTA, and the add-more-photos affordance. The moment completion lands, Taylor receives two emails' worth of value in one: the completion notification containing the full generated markdown intake document — Not-answered section, auto-flags (name mismatch, customer-provides-nothing, no reviews, no domain, email-at-domain, deposit state), uploads as signed links, voice note linked separately — ready to paste into Claude. `scripts/render-intake.ts` regenerates and re-sends on demand. Reminders and the resume-link email remain INT-8's; revisit-mode Done (adding photos later) ships here in its simple form.

## Why / intent

- **Build spec §6 (binding)** — the output format law: clean markdown, explicit **Not answered** section (never blank headings), automatic risk flags (its list, verbatim), files with signed links, voice note linked separately for transcription. **M-INT-4** — delivery is email to `INTAKE_NOTIFY_EMAIL`; no admin page.
- **UX spec §7 Done** — the four content blocks; skipped list framed as call inventory, not error; Cal.com embed-or-link (its `[ASSUMPTION]` stands: the v3 account serves). **§10** — completion email content; Stripe's receipt not duplicated.
- **Vesper's `../ADMIN-HANDOFF.md`** — the deposit-state flag added at the top of the document (carried into the generator now, since the generator is being written now).
- **M-INT-7** — `getEngagementStatus` and step registry are reused by the generator — no second status logic, no second step list.
- **What this slice is NOT (binding):** no reminder logic, no resume-link email (INT-8); no admin UI (deferred); no editing of answers on Done.

**Rulings this slice makes (labelled, logged):**

- **Completion is monotonic:** `completedAt` set once when Done is first reached; later photo additions update files and re-send on demand but never un-complete. Reminder kill (INT-8) keys off this. Logged.
- **The markdown renderer is a pure function** `renderIntakeMarkdown(engagement, files, signedUrlFactory)` in `server/services/output.ts` — deterministic given inputs, so the CLI, the completion email, and the future admin page share one implementation. Logged.
- **Signed link expiry 14 days `[PROVISIONAL]`** — outlives inbox lag; re-run the CLI for fresh links. Logged.

## Experience & states

Done per UX spec §7: display greeting · concrete next-step line ("Taylor reads all of this before your call, so the call is short") · `WE'LL COVER THESE ON THE CALL` mono list of skipped items (computed: registry × answers; a fully-answered form omits the block entirely) · Cal.com CTA (GradientButton out-link, or embed if it takes the dark theme cleanly — dev verifies, decides, logs) · quiet add-photos line reopening Step 6 via the resume route.

**States (exhaustive):** first completion · revisit (already complete: Done renders in revisit mode — summary tone, booking CTA if unbooked-unknown, add-photos) · fully-answered (no skipped block) · heavily-skipped (long list, still warm) · unpaid-but-waived engagement completing (deposit line in the document reads `waived`).

**Failure / edge states (named):** email send failure → completion still commits (the client's Done is never hostage to Resend); the `email_events` row absent signals the CLI/INT-8 sweep to retry; signed-URL minting failure for one file → the document ships with that file listed as `link unavailable — re-run render-intake` rather than dying; markdown generation error → logged (ids only), email deferred, client unaffected.

## Non-negotiables (this slice)

- **Empty fields collect into "Not answered" — never rendered as blank headings** (build spec §6).
- **Every §6 auto-flag implemented**, plus the deposit-state line: name mismatch · customer-provides "nothing" · no reviews · no domain · existing email at the domain.
- **The client's completion never depends on email success.**
- **No fabricated content in the document** — absent data is stated absent, everywhere.
- **Signed links only; no public URLs in the email.**

## Data

**Schema changes: none.**

**Tables:** `engagements` (`completedAt` write via service; reads via seam for Done; the CLI reads by id — the second sanctioned non-token reader, noted in the service header like the webhook's) · `intake_files` (read) · `email_events` (insert `completion` / `output` kinds).

**Placement:** `server/services/output.ts` · `server/services/emails.ts` (new: send wrappers + templates as string builders — no email framework) · `app/intake/[token]/done/page.tsx` · `app/intake/[token]/_actions/complete.ts` · `scripts/render-intake.ts`.

**Validators:** none new.

## Accessibility

Done is a reading screen: heading order sane, the skipped list a real `<ul>`, the Cal.com control a link with a full accessible name ("Book your call with Taylor"), no timing content. If the Cal.com embed is adopted it must be keyboard-reachable or the out-link ships instead — the embed is a convenience, not a requirement.

## Acceptance criteria (observable — run against a deliberately half-filled engagement and a full one)

1. Completing Step 9 renders Done with all four blocks; the skipped list names exactly the unanswered items; a fully-answered engagement shows no skipped block.
2. `completedAt` set exactly once; revisiting the link lands on revisit-mode Done; add-photos reopens Step 6 and new uploads appear in `intake_files`.
3. The completion email arrives at `INTAKE_NOTIFY_EMAIL` containing the full markdown: identity block, every answered section, **Not answered** section listing every skipped field, and the flag block.
4. Flags fire correctly on a seeded matrix: differing names · customer-provides `nothing` · no reviews · no domain · email-at-domain yes · deposit paid vs waived — each present when true, absent when false.
5. Uploads render as working signed links; the voice note appears in its own labeled section; a revoked/failed link case renders the unavailable line, not a crash.
6. `scripts/render-intake.ts <engagementId>` prints the markdown and (with `--send`) re-sends; `email_events` rows written per send.
7. Kill Resend (bad key in dev): Done still completes; the failure is visible in server logs by id only.
8. `npm run build`, `npx tsc --noEmit`, `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Build the markdown with a plain template-literal builder — a templating dependency is entropy for one document shape.
- The flag predicates belong beside the renderer in `output.ts`, pure and unit-exercisable via the CLI, so the admin build inherits them.
- Email as both plain text and a minimal HTML wrapper; the markdown body is the payload, not a designed email.

## Dev's call

Markdown section ordering beyond the build spec's skeleton · flag copy phrasing (spec gives the semantics) · Cal.com embed vs link (verify, decide, log).

## Out of scope

- **Reminders, resume-link email, expiry screen** — INT-8. **Admin viewing surface** — deferred (`../ADMIN-HANDOFF.md`). **Transcription** — deferred.

## Depends on

- **INT-3** — deposit state feeding the document's deposit line. Complete in `PROGRESS.md`.
- **INT-6** — full answer surface + files. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class acceptable; Sonnet-class viable** — the risky reasoning (flags, Not-answered honesty) is pinned by spec; the failure mode of choosing down is a generator that renders blank headings on missing data, which criterion 3–4's half-filled run catches.

---

### Kickoff (paste into the session)

> Build **INT-7 — Output + Done** (attached spec). **Absent data is stated absent; every flag implemented; completion never waits on email.**
> Attach/read first, in order: this spec · `specs/README.md` · `../intake-form-build-spec.md` §6 (output law, verbatim) · `../INTAKE-UX-SPEC.md` §7 Done, §10 · `../ADMIN-HANDOFF.md` (deposit flag) · `INT-6` + `INT-2` (seam, registry, status — reuse, don't fork) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Verify with a half-filled engagement, not just a full one. Close in three places. Run `npm run build` + `npx tsc --noEmit` + `npm run lint`.
