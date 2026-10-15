# Portfolio intake track — UX scope

Author: Vesper (design). Status: **Draft for Taylor's sign-off**, then handoff to Mason for technical scoping.

**Document authority.** On what is asked and every line of client-facing copy, [`portfolio-intake-questions-v2.md`](portfolio-intake-questions-v2.md) wins — it is approved verbatim, including placeholders and validation strings; this scope does not restate it. On decisions ratified in the scoping thread, [`portfolio-intake-handoff-prompt.md`](portfolio-intake-handoff-prompt.md) wins. On the existing intake's presentation law, [`../intake/INTAKE-UX-SPEC.md`](../intake/INTAKE-UX-SPEC.md) and its §13 decision log win — this track inherits that law wholesale (§3 below) and this document defines only the deltas and the new primitives. On tokens and visual law, [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) wins.

Copy note: every client-facing string this document introduces that is not in the v2 doc is marked `[COPY — new]` and needs Taylor's human-hand pass before ship. Nothing here rewrites v2 copy.

---

## 1. Frame

**Who is here, in what state.** A working creative — filmmaker, photographer, designer — most often in the evening, on a laptop as much as a phone, with a deep and disorganized back catalogue. First real client: Kryshan Randel, filmmaker (director / camera / editor / teacher). This user differs from the Durable track's trades owner in three ways that change the design:

1. **They are precious about the work.** The trades owner's risk was suspicion; this user's risk is *perfectionist stall* — re-cutting a filmography at midnight instead of finishing the form. Every long-catalogue surface (Experience, The Work, Taste) must make "rough and done" feel like the intended answer. The "Sort this for me" extraction and the "don't tidy it" placeholders are the structural fix; the presentation must never undercut them with polish pressure (no counts, no completeness meters, no "great progress!").
2. **They have taste and know it.** The taste step treats them as a peer with reactions worth trusting, not a client to be surveyed. Gut-first, pattern-over-answer.
3. **They are paying more, sooner.** $1,000–$1,900 on a self-serve screen with no Taylor-authored per-deal summary above it. The payment screen carries the whole weight of "this is real and safe" that the Durable track's phone call plus agreement card carried.

**The one job of this surface:** convert an interested creative into (a) a paid deposit and (b) enough true material — work, words, taste signal — to put a first look in front of them within three days. In that order.

**The emotional contract**, screen by screen: *this is a real service with a real person behind it → this payment is safe and exactly what the page says → my mess is welcome here → nothing I do here is wrong → I can stop anytime and lose nothing.*

**The metric is completion, not thoroughness** — unchanged from the Durable track, and *more* at risk here because the catalogue is deeper. A 70%-complete intake tonight beats a perfect one that never comes back.

---

## 2. Flow architecture

### The spine

```
Entry link (sent by Taylor for now; the /websites chooser is later scope)
  → Start form        (public, tokenless — v2 doc's field set; mints the token)
  → PP  Pay screen    (plan choice + add-ons + Stripe hosted checkout)
  → W0  Welcome       ("Nine steps. Every one of them optional." · 45 min · autosave promise)
  → Steps 1–9         (linear; back always; skip everything; autosave continuous)
  → Done              (three-day first look · skipped list)
```

Nine steps exactly. The welcome copy promises it; D-INT-5 (no sub-pagination) holds even though steps 3, 4, and 5 are the heaviest screens this system has ever had. They stay one scroll each; the extraction and the gallery are designed to keep them survivable at that length (§6).

### Route shape

`[ASSUMPTION — routing is Mason's; the UX requirements are these]` The track gets its **own public start route**, nested under `/websites` so a trimmed URL lands on an explainer, never a 404 (WEBSITES-PAGE-SPEC §7). The existing `/websites/intake` start form ships byte-for-byte unchanged (handoff decision 1). The v2 start form's category question ("What kind of site is this?", with the coming-soon rows) belongs to the *new* track's start form, not the shared one — sharing one start form would force edits to the Durable form and violate the byte-for-byte law. Cost of being wrong: one route move and one redirect. Reversible.

### State routing

Inherited unchanged from the existing `[token]` state router: pay / welcome / resume / done, the resume screen's step list, the quiet expired-token dead end, the returned-from-canceled-checkout quiet line. No deltas.

---

## 3. Inherited law — what carries, what flexes

The Quiet Gilt variant (D-INT-2) governs this surface in full: no `RootField`, 560px column, 16px minimum input font, 48px targets, validation in gold never red, zero new hexes. Per-decision status:

| ID | Ruling | Status on this track |
| --- | --- | --- |
| D-INT-1 | Hosted Stripe Checkout, no card UI, no urgency near payment | Carries unchanged |
| D-INT-2 | Quiet Gilt variant | Carries unchanged |
| D-INT-3 | GradientRing exactly once: the voice-note card | Carries — the ring is on **step 6** in this flow (Your words). Still exactly once |
| D-INT-4 | Nothing required; Continue never disabled; "Not sure" full-size | Carries. The pay CTA's disabled-until-terms state (D-INT-11 amendment) remains the sole exception |
| D-INT-5 | One step = one screen; nine steps; step-jump from resume only | Carries |
| D-INT-6 | Autosave on blur + step change; honest indicator | Carries, with one extension: extraction results commit through the same triggers (§6.1) |
| D-INT-7 | Three reminders max, dead on completion | Carries |
| D-INT-8 | Never ask what's known; prefill shown, not asked | Carries — start-form answers prefill step 1's name / one-liner / phone / email |
| D-INT-10 | Deposit refund sentence | **Does not automatically carry.** Ruled for the $600 Durable deposit; this track has a $1,000/$1,900 charge and a pay-in-full option. Needs its own ruling (§10, open item 1) |
| D-INT-11 | Add-on checkbox rows, info dialogs, running total, terms checkbox gating the CTA | Carries — the portfolio pay screen reuses this exact grammar (§4) |
| D-INT-12 | Promo rail behind "Have a code from our call?", `?promo=` auto-apply, $0 catalogue items never discounts | Carries — this is Kryshan's $1,600 rail |

Interaction grammar §6.1–6.6 of the existing spec (skipping, autosave indicator, repeatable blocks, uploads, conditional reveals, exclusive-none) carries verbatim. The upload law — **size is the only thing that may reject a file, never format, never count** — extends to every new upload surface in this track, including per-project images.

---

## 4. PP — the pay screen (design this hardest)

Extends P0's anatomy; the deltas are the plan choice, the standard (not per-deal) framing, and a monthly add-on. Single column, top to bottom:

1. **Mono eyebrow:** `AGORA · PORTFOLIO BUILD` with the gold hairline trailing right. `[ASSUMPTION: Agora remains the charging entity; the statement-descriptor line must stay literally true]`
2. **Headline, display type:** the v2 doc's price statement, verbatim: "The build is $2,000." with its supporting paragraph as body copy.
3. **Plan choice** — "How would you like to pay?" as two full-width ChoiceCards (radio mode), the v2 copy verbatim. The today-amount inside each card gets the stat-number treatment (display type, gold gradient — the sanctioned gradient-on-numbers use, and the only gradient text on this surface). Default state: **neither selected.** Selecting a plan is the screen's one required act, so the CTA renders the plan's amount only after selection; before selection the CTA reads `Pay deposit` with no amount and behaves per the terms-gating rule below.
4. **Add-on menu** — "Worth adding?" as checkbox rows per D-INT-11: label + price on the row, info button opening the existing add-on dialog pattern, populated from the catalogue. The care plan row renders its price as `$100/mo` and its line in the total stays separated (below). Admin panel and care plan rows ship only after their `[PROPOSED]` sign-offs (§10).
5. **Running total** — today's charge: plan amount + one-time add-ons. If the care plan is checked, a second dim line under the total: `plus $100/mo, starts …` — the start point is an open item (§10, item 4); the line ships only once it can be stated truthfully.
6. **Terms acceptance** — real checkbox, CTA disabled until ticked, one dim explanatory line under the button (D-INT-11 as amended). Terms link opens in the site Overlay; the portfolio track needs its own terms section or an amended `/websites/terms` — Taylor + Mason (§10, item 5).
7. **Primary CTA:** GradientButton → hosted Stripe Checkout. Loading label `Opening secure checkout…`, disabled, no spinner.
8. **Trust block** — mono, dim, three lines, no icons, same grammar as P0 (Stripe / statement descriptor / receipt). Followed by the refund sentence once ruled (§10, item 1).
9. **Promo rail** — "Have a code from our call?" per D-INT-12, `?promo=` auto-apply. How a promo interacts with the *plan choice* (does Kryshan's $1,600 split half/half? is pay-in-full offered against it?) is a money mechanic, not a design call — flagged to Taylor + Mason (§10, item 6).

**States:** default · plan selected · CTA loading · returned-canceled (P0's quiet line, verbatim grammar) · paid (never renders again). **Deliberate omissions carry from P0:** no countdown, no scarcity, no testimonials, no "spots limited." The screen's confidence is the reassurance.

---

## 5. Per-step deltas

Field inventory and copy are the v2 doc's — binding, not restated. Presentation decisions only.

- **Start form.** Six-ish fields plus the category and discipline questions. Coming-soon rows render as ChoiceCards in a true disabled treatment: reduced opacity, no hover response, `aria-disabled`, the "coming soon" text inside the card label — never a tooltip. They remain in the tab order as inert, announced items so screen-reader users hear the same roadmap sighted users see. (Whether they appear at all is Taylor's open item.)
- **W0 — Welcome.** V2 copy verbatim. "Send me my link" button carries from the existing flow.
- **Step 1 — About you.** Prefilled fields shown as editable, quietly confirmed (D-INT-8 grammar). Roles as a repeatable block with the mono-index idiom.
- **Step 2 — Who this site is for.** All text — the longest unrelieved run of `long text` in the flow. Hairline-separated clusters with mono group labels (StepShell law for 7+ field steps): audience / direction ("what work do you want more of") / identity.
- **Step 3 — Experience and proof.** Opens with the extraction block (§6.1), then the repeatable entries, then the proof cluster. "Feature this" renders as a checkbox row inside the entry card, not a star icon — words before icons.
- **Step 4 — The work.** The heaviest screen in the system: extraction block, then unlimited project entries each carrying eleven fields plus an image drop. Survivability decisions: entries render **collapsed to a summary row** (mono index · title · year · role) once they contain a title, expanding in place on tap — one open at a time is not enforced (people compare), but a newly added or extracted entry opens expanded. Collapse state is presentation only; autosave is untouched. The per-entry image drop uses the §6.4 upload grammar inside the card, 3-up thumbnails. "Where it belongs" (front and centre / archive / leave off) renders as a three-option ChoiceCard row — this is curation, and it deserves full-size targets, not a dropdown.
- **Step 5 — Taste.** The gallery (§6.2), then the ranked favourites, then the preference radios, then the catch-all uploads and brain dump. The three "feel like" words render as three single-line fields with mono indices (the step-4-Durable idiom: three answers, not one).
- **Step 6 — Your words.** The voice-note card: the flow's **only** GradientRing, upload trigger inside, v2 prompt copy verbatim, skip line beneath. "Keep my wording" is a consequential checkbox — it renders as a full-width tap-card directly under the bio field, not buried mid-list.
- **Step 7 — Media.** Straight §6.4 upload grammar. Logo conditional reveals in place (§6.5 law).
- **Step 8 — The site itself.** Pages as a checkbox group. When the checked count exceeds five, one dim line appears under the group (never gold, never a total, never a charge): `[COPY — new] "That's N pages — five are included. Nothing extra gets charged without a conversation first."` It appears and disappears with the eased reveal law; it is information, not a warning. No price math on this screen — the confirm-before-charge promise means the *design* must make auto-charging impossible to even imply.
- **Step 9 — Accounts and access.** Opens with the `NO PASSWORDS · EVER` callout, extended with the invite-routing line (hello@tayloraucoin.com) verbatim. Domain questions first, ink labels, breakage-risk weighting — same as the Durable step 9.
- **Done.** V2 copy verbatim: three-day first look, skipped list under the `WE'LL COVER THESE ON THE CALL` mono label. No call-booking CTA is specified in v2 for this track — deliberate; the three-day first look is the next event. If Taylor wants booking here, that's a copy amendment, not a design default.

---

## 6. New interaction grammar

### 6.1 "Sort this for me" — the extraction block (steps 3 and 4)

The block: v2's copy line, the blob `long text` (auto-grow, generous 8-row min — it should *look* like it wants a mess), and the **Sort this for me** button as a GhostButton (the step's Continue stays the only gradient CTA on screen).

**The one law:** nothing reaches the answers document until the user has seen and kept it. Mechanism: extracted entries render as ordinary editable repeatable blocks, client-side; they commit through the **normal autosave triggers** — field blur or step change — which by construction only fire after the entries have been on screen in front of the user. The blob field itself autosaves like any field, so the raw paste is never lost even if the user bails mid-run. `[PROPOSED — needs sign-off, D-PORT-3]`

State matrix:

| State | Presentation |
| --- | --- |
| Default | Button enabled always. Tapped with an empty box: one dim inline line, `[COPY — new] "Nothing to sort yet — paste something in first."` No color change; this is not an error |
| Running | Button label swaps to `[COPY — new] "Reading it through…"` and disables; blob goes read-only (not visually disabled — content stays legible); no spinner, no progress bar. `aria-live="polite"` announces start and finish |
| Success | Entries appear below with the eased reveal; the v2 after-line renders once above them ("Fix anything we got wrong — nothing saves as fact until you've seen it"). Entries are visually identical to hand-made ones — no "AI" badge, no robot iconography, ever |
| Re-run | With entries already present, a second run **appends** below existing entries and never touches an entry the user has edited. `[PROPOSED — needs sign-off]` |
| Failure | The blob is untouched. One gold line: `[COPY — new] "That didn't work — your paste is still here. Try again, or add entries by hand below."` with Retry as an inline text link. Never modal, never blocking, and Continue still works |
| Rate-limited | Same shape as failure, calmer: `[COPY — new] "Give it a minute and try again — your paste is safe."` |

### 6.2 The favourites gallery (step 5)

**Card anatomy** (one per example site): primary screenshot (lazy-loaded, explicit dimensions — the repo's known `next/image` trap applies here directly), additional captures as a horizontally swipeable strip inside the card, site name in card-heading type, `Visit site` as a mono text link opening a new tab (autosave makes leaving safe), then two actions:

- **Add to favourites** — a full-width tap-row at the card's foot, ChoiceCard selected grammar (gold border, bg warms toward gold). Selected label flips to `[COPY — new] "In your favourites"`. No hearts, no stars — words. No ring, no gradient: nothing in this gallery may out-dress the step's CTA (handoff: Quiet Gilt, one ring, one moment).
- **Add a note** — dim text link revealing an inline `long text` below the card, eased, in place.

**The ranked list** appears below the gallery only once a first favourite exists — until then the section is absent, not empty. Each row: drag handle (labeled, not icon-only) · site name · its note held open for editing · remove. Reordering:

- Pointer: drag with a lifted-card treatment (2px lift, gold hairline), drop settles with `--ease-out`. Reduced motion: no lift, instant reflow.
- Keyboard and touch-fallback: every row carries **Move up / Move down** as real buttons (mono, dim, always rendered — not hover-revealed; touch has no hover). Drag is the enhancement, buttons are the floor.
- `aria-live="polite"` announces "Moved to position N of M" on any reorder.

No cap on favourites. No minimum. Zero favourites is a legitimate outcome — the notes and the brain dump still carry signal, and the Done screen's skipped-list grammar covers it.

**Curation contract (Taylor-facing, recorded here so the build isn't blamed for the content):** 12–24 sites per discipline, spanning dark/light, video-first/grid-first, animated/still, personality-forward/work-only. Screenshot sets: first capture is the site's opening view at a consistent aspect ratio (16:10 recommended); 2–4 captures per site. Build ships against a labeled stub set.

### 6.3 Per-project images (step 4)

`RepeatableBlock` gains an upload slot inside entries. The grammar is §6.4 of the existing spec, unchanged: native input under a 48px tap-card, instant local thumbnails, 3-up mobile grid, gold hairline progress per tile, `Didn't make it — tap to retry` on failure, size the only rejection, no count cap. The only new rule: thumbnails live inside the entry card and collapse with it (§5, step 4), and the collapsed summary row shows a dim mono count (`3 images`) so nothing looks lost.

### 6.4 Discipline flavour

The start form's "What's the work?" answer selects the example-site set and the flavoured copy at the v2 doc's marked flex points. Rendering rule: **exactly one discipline checked, and that discipline has a flavour pack → its flavour; anything else (multiple, none, or an unflavoured discipline) → the generic fallback.** Never a broken slot, never a mixed sentence. Film ships first; generic is the permanent floor. `[PROPOSED — needs sign-off, D-PORT-5]`

---

## 7. Component inventory

Everything from the existing inventory reuses as-is: `StepShell`, `StepProgress`, `Field`, `TextField`, `TextArea`, `ChoiceCard`/`ChoiceGroup`, `RepeatableBlock` (extended per §6.3), `FileDrop`, `VoiceNoteCard`, `SaveIndicator`, `FooterNav`, `ResumeList`, `SkippedList`, `GradientButton`, `GhostButton`, the add-on row + info dialog from P0, the promo rail.

New (placement is Mason's; the inventory is mine):

- `PlanChoice` — the two-card payment picker (§4).
- `ExtractionBlock` — blob + button + state machine (§6.1).
- `ExampleCard` — gallery card with capture strip, favourite toggle, note reveal.
- `FavouritesRank` — the drag/button-reorder list.
- `ProjectEntry` — the collapsible step-4 entry (a `RepeatableBlock` presentation variant, not a fork).
- `PageCountNote` — the step-8 over-five line.

**State floor for every one of them, no exceptions:** default · hover (desktop only) · active · focus-visible (2px gold) · disabled (pay CTA and running extraction only) · error (gold) · loading · empty · reduced-motion. The extraction and the drag-rank ship with their matrices in the spec slice, not discovered in review.

---

## 8. Copy register

- V2 copy ships **verbatim** — placeholders, help lines, validation strings, button labels. It was approved in-register; drift is a defect.
- Strings this scope introduces are marked `[COPY — new]` above and are **drafts**: Taylor holds a human-hand copy standard and every new string gets his pass before ship. There are six.
- The register shift from the Durable track: same warmth, more peer. This user knows what a reel is; the copy already reflects that. Do not re-explain their own field to them anywhere in system states or emails.
- Emails: the existing four-email system carries (resume, three reminders, completion). Reminder copy needs a portfolio variant only where it names the deliverable — flag for the build thread; the cadence and the no-guilt law are unchanged.

---

## 9. Responsive and accessibility additions

Everything in existing spec §11 carries. New surfaces add:

- **Step 4 and 5 are long.** The sticky footer's next-step line matters most here; test both steps at 200% text scale and on a 375px viewport with 20+ entries / 24 gallery cards before calling them done.
- Gallery images: meaningful alt (`"Screenshot of {site name}"`), lazy-loaded below the fold, explicit pixel dimensions (repo trap: `w-auto` + `next/image`).
- Drag-rank: buttons are the accessibility floor (§6.2); drag is never the only path. Focus order after a move follows the moved row.
- Extraction: `aria-live` on state changes; the read-only blob keeps its label association; Retry is a real link, not a div.
- Collapsible project entries: the summary row is a `button` with `aria-expanded`; collapse state never hides validation-relevant content from AT that sighted users can see.
- Info dialogs on the pay screen inherit the P0 dialog's focus trap and escape behavior.

---

## 10. Assumptions and open items

**Assumptions (labeled, reversible):**

- `[ASSUMPTION]` The track gets its own nested public start route; the Durable start form ships untouched (§2). Routing specifics are Mason's.
- `[ASSUMPTION]` Agora remains the charging entity and statement descriptor for this track.
- `[ASSUMPTION]` The existing resume/reminder/completion email system serves this track with copy-level deltas only.
- `[ASSUMPTION]` Taylor sends the entry link personally until the `/websites` chooser exists.

**Ruled 2026-08-26 (Taylor):** items 2, 4, and 6 below are closed — see M-PORT-6. The admin panel is a live $500 add-on. **The care plan is off the pay screen entirely in v1** ("don't charge for it until it's done"), which retires §4's monthly-total line and the care-plan row; the v2 copy for that row waits in the doc for the day it turns on. Kryshan's $1,600 is reached by promo code substituting the build line, so a promo and the plan choice compose without new arithmetic.

**Still open — need Taylor (money/brand, not mine to decide):**

1. **Refund sentence for this track.** D-INT-10 covered a $600 deposit; this is $1,000–$1,900 with a pay-in-full option. Blocks the first real charge.
2. **Coming-soon category rows** — keep or drop (v2 open item 5).
3. **Terms coverage** — does `/websites/terms` bind this track as-is, or does it need a portfolio section? The acceptance line points somewhere; it must point at something true.
4. **Five included pages** — `[PROPOSED]` in v2; step 8's over-five line depends on it.

**Open — routed to Mason (§11):** everything in the build-notes section of the v2 doc plus the extraction endpoint's failure/rate-limit contract, the collapse-state non-persistence, and the pay-in-full product row.

---

## 11. Proposed decision log — D-PORT series

For ratification; cite by ID once ruled. D-INT rulings remain in force as inherited law (§3).

- **D-PORT-1** `[PROPOSED]` — The portfolio track has its own public start route nested under `/websites`; the Durable track's surfaces ship byte-for-byte unchanged.
- **D-PORT-2** `[PROPOSED]` — The pay screen reuses P0's grammar (D-INT-11/12) with a two-card plan choice; neither plan preselected; today's charge is the only total rendered until the care-plan start question is ruled.
- **D-PORT-3** `[PROPOSED]` — Extraction results are client-side until the user's next natural autosave trigger; the blob autosaves independently and is never lost; re-runs append and never overwrite user-edited entries.
- **D-PORT-4** `[PROPOSED]` — The favourites flow replaces rating sliders permanently: toggle + note + drag-rank, keyboard buttons as the reorder floor, no minimum, no cap, section absent until the first favourite.
- **D-PORT-5** `[PROPOSED]` — Flavour renders only for exactly one checked discipline with a shipped pack; all other cases get generic. Film first.
- **D-PORT-6** `[PROPOSED]` — Step-4 project entries collapse to summary rows (presentation state only, never persisted, never hiding data from autosave); step 8's over-five page note is informational, colorless, and chargeless.
- **D-PORT-7** `[PROPOSED]` — The voice-note card on step 6 is this flow's single GradientRing (D-INT-3 applied per-flow).

## 12. Handoff notes for Mason

What forks tech, so it's scoped once: track parameterization of the step registry (one home for step identity; internal track key must not collide with "portfolio" = tayloraucoin.com itself, handoff decision 2) · new product rows (deposit $1,000 / balance $1,000 / pay-in-full $1,900 as its own row / add-ons) and the care-plan subscription mechanics · promo × plan interaction · the extraction endpoint (Claude Sonnet, per-token rate limit, blob in → typed entries out, client-side prefill only) · `RepeatableBlock` file-upload support on the existing upload path · example-site content modules (`content/intake-examples/<discipline>.ts`, stub set first) · the post-intake extra-page payment path (payment link vs scoped checkout re-entry — the mechanism must make auto-charge impossible, not just the copy) · portfolio-variant email copy slots. The spec-slice structure mirrors `docs/intake/specs/` per the handoff's working method.
