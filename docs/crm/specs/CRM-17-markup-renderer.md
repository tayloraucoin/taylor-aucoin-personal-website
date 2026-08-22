# CRM-17 — The markdown renderer: extracted, extended, one home for two documents

**Epic:** CRM — call-mode redesign (v1.2) · **Phase 5** · Size: S
**Slice type:** Pure presentation utility, extracted from a working consumer. Failure class: a silent rendering regression in the SOP dialog, or a call-sheet block type that renders as raw pipe characters.

**Status:** Complete (2026-08-22)

---

## Outcome

One renderer serves both operator documents. `Markup` moves out of the SOP dialog into its own component and learns the block types the call sheet actually uses — headings at two levels, unordered lists, blockquotes, and tables — while the SOP dialog renders exactly as it does today. Nothing else changes: no new surface, no call mode, no queue behavior. CRM-15 consumes this and never has to write a parser inside a state machine.

## Why / intent

- **D-CRM-28** — the sales script is content at `docs/crm/CALL-SHEET.md`, rendered as markdown. **M-CRM-9** rules it is read at render rather than copied into code.
- **Ground truth:** `Markup` currently lives at the bottom of `app/admin/_components/sop-dialog.tsx` (line ~96) and handles `---`, `## `, inline bold, and paragraphs. `CALL_SOP` in `lib/crm/sop.ts` is its only consumer today.
- **The gap, measured against the real document:** `docs/crm/CALL-SHEET.md` uses an `#` title, `##` sections, `-` bullet lists, `>` blockquotes for the spoken lines, and a six-row pipe table for the objections. Three of those five block types render as literal text today — the objections table, which is the most-used part of the sheet mid-call, would render as a wall of pipes.
- **Why its own slice (CRM-12 precedent):** CRM-12 was pulled out of CRM-5 for exactly this reason — a small, precedented dependency built separately so the large ticket does not write it twice or write it badly under context pressure. The numbering does not match queue position; the build order is the queue.
- **What this slice is NOT (binding):** not a markdown library adoption. No `react-markdown`, no `marked`, no MDX pipeline — the site's no-dependency posture holds for a renderer this small, and the two documents are ours.

**Rulings this slice makes (labelled, logged):**

- **The renderer's supported grammar is closed and documented in the file.** `#`/`##` headings, `---`, `-` lists, `>` blockquotes, pipe tables, inline bold and italic, paragraphs. Anything else renders as plain text rather than throwing — an operator document must never fail to display because someone used a syntax the renderer does not know. Logged.
- **Both documents are the test fixtures.** `CALL_SOP` and `CALL-SHEET.md` are the only inputs this component must handle; correctness is judged against them, not against CommonMark. Logged.

## Behavior & states

**No new surface.** Observable through its two consumers.

- The SOP dialog ("How to work the queue" on the queue) renders identically to today, plus its own `-` bullet lists now render as lists rather than run-on paragraphs.
- Given `CALL-SHEET.md`, every block type renders semantically: `#` and `##` as headings, `-` runs as a `<ul>`, `>` lines as a blockquote, the objections block as a real `<table>` with a header row.
- **States:** normal render · empty string (renders nothing, no crash) · unknown syntax (renders as plain text) · a malformed table row (renders the row as text, never drops content).

## Non-negotiables (this slice)

- **No rendering regression in the SOP dialog.** It is in use today; compare before and after.
- **Content is never dropped.** An unparseable block renders as text; silence is worse than ugly.
- **No markdown dependency added.**
- **No `dangerouslySetInnerHTML`.** The documents are ours, but the habit is not one to establish in a repo an agent will copy from.

## Data & AI

**Schema changes: none.**
**Tables:** none.
**Placement:** `app/admin/_components/markup.tsx` (new) · `app/admin/_components/sop-dialog.tsx` (imports it; local copy deleted).
**tRPC / validators:** none.
**AI notes:** **None.**
**Instrumentation:** none.

## Accessibility

Tables render as real `<table>` with `<th>` header cells — the objections table is scanned mid-call and a div grid does not announce. Headings keep their level order (`#` → `h2`, `##` → `h3`) so the dialog's own heading hierarchy stays intact. Body text stays AA at rendered size in the admin theme.

## Acceptance criteria (observable)

1. The SOP dialog opens from the queue and renders the same content as before the change, with its bullet lists now rendering as lists. No block of `CALL_SOP` renders as raw markup.
2. Rendering `docs/crm/CALL-SHEET.md` produces: one `h2` title, `h3` section headings, `<ul>` bullets, a blockquote for each spoken line, and one `<table>` with a header row and six body rows for the objections.
3. An empty string renders nothing and does not throw.
4. A line using unsupported syntax renders as visible plain text — content is never dropped.
5. `sop-dialog.tsx` no longer defines a local `Markup`; there is exactly one definition in the repo.
6. `npm run build` · `npx tsc --noEmit` · `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The existing block-splitting approach (`source.split(/\n{2,}/)`) survives; lists and tables are consecutive-line groups *within* a block, so the parse is one pass over a block's lines rather than a rewrite.
- The existing `inline()` helper already handles bold — extend it there rather than at the block level.
- A quick way to exercise criterion 2 without building call mode: render the file in a scratch route or a temporary page, verify, then remove it. Do not leave a debug route behind.

## Dev's call

Internal parse structure · whether table cells run through `inline()` · component file layout.

## Out of scope

- **Reading the call sheet from disk** — CRM-15 owns the server-side read and the column.
- **Any call-mode surface** — CRM-15.
- **Markdown features neither document uses** (images, code fences, ordered lists, nested lists) — add them the day a document needs them.

## Depends on

**No slice dependencies.**

## Recommended execution

**Sonnet 5.** A contained parser extension with two concrete fixtures and a regression constraint; the reasoning is shallow and the correctness is checkable by eye. Failure mode of choosing down to Haiku 4.5: a rewrite that renders the new block types correctly and quietly changes the SOP dialog's existing output, which nobody would notice until mid-call.

---

### Kickoff (paste into the session)

> Build **CRM-17 — Markup renderer** (attached spec). Model: **Sonnet 5**.
> **No regression in the SOP dialog; content is never dropped; no markdown dependency.**
> Attach/read first, in order: this spec · `app/admin/_components/sop-dialog.tsx` (the current `Markup`) · `lib/crm/sop.ts` (fixture 1) · `docs/crm/CALL-SHEET.md` (fixture 2) · `docs/crm/CRM-UX-SPEC.md` D-CRM-28 · `docs/crm/specs/DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` last.
> Close in three places. Run `npm run build` · `npx tsc --noEmit` · `npm run lint`. Do not start the next ticket.
