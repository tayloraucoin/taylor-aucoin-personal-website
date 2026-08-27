# PORT-8 — The site step, the output document, the done screen, and the email variants

**Epic:** PORT — portfolio intake · **Phase 4** · Size: M
**Slice type:** The point of the system — the honest document Taylor builds from — plus the last step and the completion rail. Risk class: dishonest output (a skipped answer rendered as an answer, a rights flag missed) reaching a real build.

**Status:** Complete (2026-08-26) — 30 document checks pass: every flag fires on its trigger and stays silent otherwise, a clean engagement flags nothing, projects render as their own sections with their own images, no raw keys reach the document, and the label sweep is clean. The durable document is byte-identical to HEAD. **Email delivery itself is unverified** (no Resend domain); copy slots only.

> **Review note.** The output document's honesty rules are the review: state that a seeded engagement with deliberate gaps produced an explicit "Not answered" inventory (never blank headings), that every risk flag below fired on its trigger case, and that the completion email's idempotency rode the existing `email_events` machinery untouched.

---

## Outcome

The track completes. Step 8 (**site**) renders the v2 fields with the over-five page note. Finishing the flow generates the showcase markdown document — every answered field labeled, every gap explicit, rights and permission flags surfaced at the top, per-project files grouped under their projects — and emails it to Taylor with signed file links; the client's done screen shows the v2 copy with the real skipped-items inventory; the resume/reminder/completion emails carry the portfolio-variant copy in their named slots. The reminder cron, ceiling, and idempotency are consumed unchanged. Kryshan can now go end to end.

## Why / intent

- **V2 doc step 8 + done screen (binding, verbatim)** — step 8's intro and fields ("Five pages are included in the build; extra pages are $150 each, and we'll always confirm with you before anything is charged…" — note five-pages is `[PROPOSED]`; the copy ships as written and changes only if Taylor re-rules); the done copy: "**That's everything.** Taylor reads all of it — every note, every rating, every file. You'll see the first look at your site within three days…" with the skipped-items list "same as the existing flow".
- **UX scope §5 step 8 + D-PORT-6** — the over-five note: appears only when checked count exceeds five, dim, informational, never gold, never a total, never a charge; `[COPY — new]` draft-marked. Contact-preference and availability radios per v2.
- **Build spec §6 lineage (inherited)** — the two honesty laws: a blank field never renders as an empty heading (gaps collect into "Not answered"); risk conditions flagged at the top. The showcase renderer inherits both through the seam.
- **M-PORT-4 boundary** — the document *reports* payment state (plan, add-ons, paid amounts from the basket rows); it never triggers a charge.
- **What this slice is NOT (binding):** no extra-page charging (PORT-9 — the step-8 note is words, structurally incapable of charging by M-PORT-4); no admin surface; no transcription of the voice note.
- **Ground truth:** `renderIntakeMarkdown`'s helpers, the completion action, `email_events` idempotency, the reminder cron, signed-URL minting — consumed through the PORT-1 seam, never rebuilt.

**Rulings this slice makes (labelled, logged):**

- **Showcase risk flags, each tracing to a stated failure mode:** kind-words present but "Can we publish those?" unchecked → flag (fabricated-testimonial class); any project with "Yes, but there are rules — ask me" or "Not sure — check with me" → per-project rights flag (the strings-attached class); share-password present on a link → surfaced under the project, plainly labeled a share password; email-at-domain "Yes" or "Not sure" → breakage flag (inherited class); zero favourites and empty brain dump → "taste signal thin — cover on the call". Logged.
- **Document structure:** flags → identity/plan/payment summary → steps in registry order with per-project subsections (files grouped by `entry_key`) → the "Not answered" inventory keyed by the label map. Logged.
- **Email variant slots:** subject and the deliverable-naming lines only; cadence, ceiling, and mechanism untouched. The three-day promise appears where the deliverable is named, quoting the done screen's phrasing. `[COPY — new]` variants draft-marked for Taylor's pass. Logged.

## Experience & states

Step 8: pages checkbox group + "Something else?" + the group help line verbatim → over-five note (eased reveal, disappears when the count drops) → the multi-thing separation long-text → contact-method and availability radios → old-site survival + links-out fields. Done: headline, body verbatim, skipped list under the `WE'LL COVER THESE ON THE CALL` mono label (existing idiom), revisit mode per the existing state router.

**States (exhaustive):** note hidden · visible (N > 5); done first-visit · revisit; completion email sent-once (ledger row) · resend of the output (the legitimately-repeating kind); skipped list empty (everything answered) · populated.

**Failure / edge states (named):** document generation failure → completion still lands for the client (done screen renders; the email retries per existing machinery — the client's moment never blocks on Taylor's email); a file row without `uploadedAt` → listed as "started, didn't arrive" (existing honesty pattern); signed links expire ≥7 days (inherited M-INT-4 constraint).

## Non-negotiables (this slice)

- **A blank is never rendered as an answer.** The "Not answered" inventory is explicit and complete.
- **Every risk flag fires on its trigger and only its trigger** — a flag that cries wolf is a flag Taylor stops reading.
- **The step-8 note charges nothing and totals nothing.**
- **Reminder ceiling stays three; all sends die on completion** (D-INT-7 inherited; the ledger is the guarantee, not the copy).
- **V2 strings verbatim; new strings draft-marked.**

## Data

**Schema changes: none.**

**Tables:** `engagements` (read via seam; `completedAt` via the existing completion path) · `intake_files` (read, grouped by entry) · `email_events` (existing writes).

**Placement:** `step-site.tsx` + the note component under the showcase `_components/` · the showcase renderer beside `server/services/output.ts`'s existing code (same file or sibling — dev's call, one seam either way) · email variant strings in `server/services/emails.ts`'s established template home · `lib/validators/showcase-intake.ts` (site schema) · labels file completed for **all nine** steps (the document renders raw keys otherwise — sweep them here).

**Validators:** site schema all-optional per the pattern.

## Accessibility

The over-five note is associated with the checkbox group (`aria-describedby`), announced politely on appearance, and never `role="alert"`; the done screen's skipped list is a real list; no other new surface.

## Acceptance criteria (observable — seeded engagements: one gap-heavy, one complete, one flag-tripping)

1. Step 8 renders the v2 fields verbatim; checking a sixth page shows the note with the correct count; unchecking hides it; nothing about it is gold and no total appears anywhere on the step.
2. The gap-heavy engagement's document: no empty headings; every unanswered field in the "Not answered" inventory under its label; answered fields labeled correctly (no raw keys — the label-map sweep held).
3. The flag-tripping engagement fires all five flag classes at the top, each once; the complete engagement fires none it shouldn't.
4. Per-project grouping: a project's images and its share-password line render under that project; ungrouped files render in their field sections.
5. Completion: done screen copy verbatim with the real skipped inventory; output email lands with working signed links; a re-send repeats the output kind while `completion` stays send-once (ledger check).
6. Reminder variants: the portfolio copy renders in the named slots; cadence and ceiling untouched (code inspection + ledger constraint unchanged).
7. Payment reporting: the document shows plan, add-ons, and struck amounts from the basket rows for a paid engagement; "not paid" states render honestly for a waived one.
8. Negative: nothing in this slice creates a Stripe object (grep the diff); the Durable document generator's output for a durable engagement is byte-unchanged (re-run PORT-1's oracle).
9. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The existing renderer's `renderValue` handles arrays-of-objects generically; project entries deserve a bespoke section renderer (title/year/role line, story, credits, flags) rather than the generic dump — the document is for reading, and it is the deliverable.
- The done screen's "add more photos anytime" affordance from the Durable flow: v2's done copy doesn't include it — do not import it; v2 is the copy authority.
- The three-day line is a promise Taylor keeps by hand; it has no system behavior — resist inventing a deadline tracker.

## Dev's call

Renderer file placement (sibling vs same file) · project-section formatting details · seeded-fixture shape for the three test engagements (no real names — the no-fabricated-data law applies to fixtures).

## Out of scope

- **Extra-page and care-plan charging** — PORT-9. **Admin/CRM rendering of showcase engagements** — the CRM's own backlog, not this epic. **Voice transcription** — deferred admin scope.

## Depends on

- **PORT-3** — payment state to report. **PORT-4** — five steps' fields and labels. **PORT-5** — entries and entry-grouped files. **PORT-7** — taste answers. All Complete in `PROGRESS.md`. (PORT-6 is deliberately not a gate: extraction only prefills what PORT-5's fields store.)

## Recommended execution

**Opus/Fable-class.** The document is the product and its failure mode is quiet dishonesty — a missed flag or a blank-as-answer reads fine and builds a site on a false claim, which is the original sin this whole system exists to prevent.

---

### Kickoff (paste into the session)

> Build **PORT-8 — Output and done** (attached spec). **Blanks are never answers; flags fire on their triggers exactly; the note charges nothing; reminder ceiling stays three.**
> Attach/read first, in order: this spec · `specs/README.md` · `../portfolio-intake-questions-v2.md` step 8 + done (the copy source) · `../PORTFOLIO-INTAKE-UX-SCOPE.md` §5 step 8, §11 D-PORT-6 · `server/services/output.ts` + `emails.ts` (reuse through the seam, don't fork) · `PORT-1` (the seam + the durable oracle) · this folder's logs.
> Close in three places. Run `yarn build` + `npx tsc --noEmit` + `yarn lint`.
