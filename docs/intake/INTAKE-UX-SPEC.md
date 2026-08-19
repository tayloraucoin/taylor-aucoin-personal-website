# Client intake — UX specification

Author: Vesper (design). Status: **Draft for Taylor's sign-off**, then handoff to Mason (architecture) and Reeve (tickets).

**Document authority.** This spec governs presentation, interaction, and copy register for the intake surface. On _what_ is collected and why, [`client-intake-requirements.md`](client-intake-requirements.md) wins. On field inventory and step contents, [`intake-form-build-spec.md`](intake-form-build-spec.md) §4 wins — this spec does not restate its field tables, it adds the layer those documents leave open. On tokens and visual law, [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) wins; this spec defines the sanctioned _variant_ of that system for this surface (§4 below) and, once ratified, extends it.

---

## 1. Frame

**Who is here, in what state.** A local trades or service business owner — detailer, landscaper, cleaner — on a phone, in a van between jobs or at the kitchen table at 9pm. Low patience, high suspicion of data-harvesting forms, no marketing vocabulary, and (new to this flow) about to be asked for money. The same person is also, minutes later, our most motivated user: deposit paid, wanting the site to exist.

**The one job of this surface:** convert a verbal yes from a phone call into (a) a paid deposit and (b) enough true facts to build the site — in that order, in one sitting if possible, across several sittings without punishment.

**The emotional contract**, screen by screen: _this is the same person I talked to on the phone → this payment is safe and exactly what we agreed → nothing I say here is wrong → I can stop anytime and lose nothing._ Every design decision below serves one of those four beliefs.

**The metric is completion, not thoroughness** (build spec §1). Second metric, upstream of it: deposit conversion. Nothing between the email link and the Stripe button may add friction.

---

## 2. Flow architecture

### Route map

```
/intake/[token]                 → state-routed entry (P0 pay / W0 welcome / resume / done)
/intake/[token]/[step]          → steps 1–9 (per build spec §4)
/intake/[token]/done            → confirmation
```

One token = one client = one engagement, created by Taylor after the sales call with: contact name, business name, phone, email, a 1–3 line project summary, deposit amount, and a `deposit_required` flag. These prefill the flow — the client must never be asked something Taylor already knows.

### The spine

```
Email link
  → P0  Confirm & pay        (skipped when deposit_required = false, or already paid)
  → Stripe Checkout          (hosted; Apple Pay / Google Pay / card)
  → W0  Welcome              (deposit confirmed · time estimate · autosave promise · send-my-link)
  → Steps 1–9                (linear; back always; skip everything; autosave continuous)
  → Done                     (what happens next · skipped list · book the call)
```

### State routing on `/intake/[token]`

| Engagement state                 | Landing behavior                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Unpaid, deposit required         | P0 Confirm & pay                                                                    |
| Payment canceled/abandoned       | P0 with one added quiet line (§6.1) — never an error banner                         |
| Paid (or waived), form untouched | W0 Welcome                                                                          |
| Form started                     | Resume screen: "Welcome back, {first name}" + Continue at step N + step list (§5.3) |
| Form complete                    | Done screen in revisit mode: summary + "add more photos" affordance + call booking  |
| Token expired                    | Quiet dead-end: no form, one line, one mailto CTA (§6.1). Warm, not alarmed         |

Navigation model: **linear with free back-travel.** After a step has been visited, it becomes reachable from the resume screen's step list. No step is ever locked except by payment state.

---

## 3. The deposit gate (new scope — design this hardest)

This is the highest-stakes screen in the flow and the coldest moment: money, on a phone, from a person who has been burned by "web guys" before. Charging entity is **Agora** (existing Stripe account); the relationship is with **Taylor**. The screen must hold both truths or the card statement becomes a dispute.

### P0 — Confirm & pay

Anatomy, top to bottom, single column:

1. **Mono eyebrow:** `AGORA · WEBSITE BUILD` with the gold hairline trailing right (site idiom).
2. **Greeting, display type (h2 scale):** `{Business name}` — their name is the headline, not ours. Sub-line in body: "Hi {first name} — here's everything from our call, ready to go."
3. **The agreement card** (`--color-card`, hairline border, 3px radius): Taylor's 1–3 line project summary, verbatim from link creation, followed by a hairline, then the deposit line: label in mono (`DEPOSIT TO START`), the amount in the stat-number treatment — display type, gold gradient. This is the sanctioned use of gradient-on-numbers, and the only gradient text on the surface.
4. **Primary CTA:** GradientButton, `Pay deposit — $X` → Stripe Checkout.
5. **Trust block**, mono, dim, 10px, directly under the CTA — three lines, no icons:
   - `Payment handled by Stripe · Apple Pay / Google Pay / card`
   - `Shows as AGORA on your statement — that's us`
   - `Receipt emailed automatically`
6. **What-happens-next line**, body dim: "Right after this you'll get a short questionnaire — about 20 minutes, skip anything you're not sure about."

**States:** default · CTA loading (label swaps to `Opening secure checkout…`, button disabled, no spinner theater) · returned-canceled (adds one body line above the CTA: "No charge was made. Whenever you're ready." — nothing red, nothing modal) · paid (this screen never renders again; route to W0).

**Laws inherited:** no gradient behind body copy; interface beats atmosphere (no root field on this surface at all, see §4); focus-visible 2px gold ring.

**Deliberate omissions:** no countdown, no "offer expires," no scarcity of any kind — manufactured urgency is banned in my practice and it is doubly banned next to a payment button. No testimonial strip here either; the sale already happened on the phone. The screen's confidence _is_ the reassurance.

Refund/cancellation terms for the deposit are **[OPEN — Taylor]**: one sentence must exist under the trust block before the first real charge ("If we don't end up building, the deposit comes back — full stop." or whatever is true). I will not invent refund policy; it is a money-and-trust claim.

### W0 — Welcome

First line: **`Deposit received — thanks, {first name}.`** in ink, plain. Then the build spec's intro contract, kept nearly verbatim (it is already right): time estimate, skip-anything promise, autosave promise, "send me my link" button (emails the resume URL immediately — device switching is the norm here, phone → maybe laptop). Close with the confidentiality line from build spec §5 in mono dim: `Everything you enter here is confidential — it's used to build your site and nothing else.` CTA: `Start — about your business`.

When `deposit_required = false`, W0 opens with the greeting instead of the deposit confirmation; nothing else changes.

---

## 4. Quiet Gilt — the sanctioned variant

Ratified direction: **same system, calmer dialect.** One brand from tayloraucoin.com through to this form — but tuned for a non-technical filler on a phone, not a hiring manager on a desktop.

### Kept from the design system, unchanged

- Ground gradient (`--color-ground-a` → `--color-ground-b`), the two radial glows, the grain overlay.
- Full token palette; **no new hexes** — this variant introduces zero colors.
- Type families and the mono grammar (eyebrows, labels, buttons). The mono register survives contact with tradespeople fine at label scale — it reads "official and exact," which is the right connotation on a form about facts.
- 3px radius, hairlines, gold `:focus-visible` ring, GradientButton/GhostButton, reduced-motion law.

### Muted for this surface

- **No `RootField` canvas.** The atmosphere on /intake is ground + glows + grain only. A recursive circuit-root system behind a payment form is exactly the "atmosphere beating the interface" failure the site's own laws exist to prevent — and it costs mobile CPU we need for a long form.
- **GradientRing appears exactly once in the whole flow:** the voice-note card on Step 5 (§7). The ring is the site's signature; rationing it to the single field we most want answered gives that field the visual gravity the build spec demands, without decorating a questionnaire.
- Motion approaches stillness: step transitions only (300ms `--ease-out`, fade + 8px rise), no ambient movement, no count-ups, nothing on scroll.

### New decisions this variant introduces (design-system extensions, need ratification)

| Decision                     | Value                                                                                                               | Why                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content column               | max 560px, centered                                                                                                 | Forms don't earn 1080px; 48ch discipline applies to questions too                                                                                                                   |
| Input font size              | **16px minimum, always**                                                                                            | Below 16px iOS zooms the viewport on focus — instant jank for our primary user                                                                                                      |
| Tap targets                  | 48px min height (above the spec's 44px floor)                                                                       | Gloved/thick thumbs are literal here, not a metaphor                                                                                                                                |
| Question labels              | Manrope 500, 16px, `--color-ink`                                                                                    | Body family, not display — questions are conversation, not headline                                                                                                                 |
| Help lines                   | Manrope 300, 13.5px, `--color-dim`, one line                                                                        | Build spec principle 8: explain why, briefly                                                                                                                                        |
| Inputs                       | `--color-card` bg, 1px `--color-faint` border, `--color-ink` text, `--color-dim` placeholder; focus = 2px gold ring | In-system, quiet, legible                                                                                                                                                           |
| Choice rows (radio/checkbox) | Full-width tap-cards, 48px min, faint border; selected = gold border + bg warms toward gold (card-hover idiom)      | Selection state readable at arm's length; no 20px native circles                                                                                                                    |
| Validation color             | **Gold, never red.** The palette has no red and this surface must not introduce one                                 | Nothing the client types here is "wrong"; the alarm test forbids escalating an activated user. If a true destructive state ever appears, that's a token proposal, not an inline hex |

---

## 5. Screen anatomy and navigation

### 5.1 StepShell (every step, 1–9)

```
┌─ header (not sticky) ─────────────────────────┐
│ mono eyebrow: STEP 3 OF 9 · gold hairline →   │
│ progress: 1px --color-faint track,            │
│           gold fill, no percentage text       │
│ h2 (display, 28px): How you work              │
│ step intro, body dim, ≤2 lines (only where    │
│   the build spec provides one)                │
├─ body ────────────────────────────────────────┤
│ fields, single column, grouped by hairline-   │
│   separated clusters with mono group labels   │
│   when a step exceeds ~7 fields (Steps 2, 3, 9)│
├─ footer (sticky, --color-card bg, hairline top)│
│ [← Back  ghost]        [Continue  gradient]   │
│ save indicator, mono 10px dim, left-aligned   │
│ next-step name: mono 10px dim, under Continue │
└───────────────────────────────────────────────┘
```

- One step = one scrollable screen. No sub-pagination — the step count (9) is a promise; it must not silently become 17.
- **Continue is never disabled.** Every step is skippable by design; a disabled primary button on an all-optional form is a lie about requirements. The single exception is P0's pay button while checkout opens.
- Back always works and never loses data (autosave guarantees it).
- On step change: scroll to top, move focus to the `h2`, announce step via the eyebrow. Transition 300ms; reduced-motion collapses it.

### 5.2 Progress

`STEP N OF 9` in mono plus the hairline/gold bar. Honest and dumb on purpose: no percentages, no "almost there!", no checkmark celebrations. P0/W0/Done sit outside the count.

### 5.3 Resume screen

Greeting, `Continue — Step N: {title}` as the primary CTA, then the nine steps as a quiet list (mono index · title · a dim `·` for untouched, gold `·` for visited). List rows navigate directly. This is the only place step-jumping is offered.

---

## 6. Interaction grammar (applies flow-wide)

### 6.1 "Not sure" and skipping

- Radio groups that carry factual risk (insurance, GST, domain, domain-email, GBP — per build spec) include **`Not sure`** as a rendered tap-card option, styled identically to its siblings. Never smaller, never grayed. A stated unknown is a _successful answer_.
- Free-text fields have no per-field skip buttons — clutter. Blank **is** skip. The contract is stated once at W0 and re-honored at Done ("we'll cover these on the call"), never nagged mid-flow.
- No field-level required markers anywhere. Nothing is required (Step 1's identity trio arrives prefilled from the token).

### 6.2 Autosave and the save indicator

Autosave on blur and on step change (build spec §8). The indicator lives in the sticky footer, mono 10px dim, and is a state machine, `aria-live="polite"`:

| State                     | Text                                                                  | Behavior                                                                       |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Idle/saved                | `Saved`                                                               | Steady. No timestamps, no flicker                                              |
| Saving                    | `Saving…`                                                             | Only if >400ms; otherwise skip straight to Saved — no UI stutter on fast saves |
| Offline                   | `Saved on this phone — will sync`                                     | Local persistence; retry silently on reconnect                                 |
| Error (retries exhausted) | `Having trouble saving — your answers are safe on this phone` in gold | Retry link. Never modal, never blocking                                        |

All state changes fade (`--dur-fast`); the never-snap law applies to text opacity too.

### 6.3 Repeatable blocks (services, add-ons, team, socials)

First block open and empty by default. `+ Add another service` as a GhostButton under the last block. Each block: hairline-bordered card, mono index (`01`, `02` — gold, the site's row-index idiom), remove as a quiet dim text link top-right ("Remove") with a single inline undo line after ("Removed. Undo") for 6 seconds — no confirm dialogs on a form this forgiving.

### 6.4 Uploads

Native file inputs, always (build spec §8 — no custom drag-drop). Tap-card trigger at 48px+. Per-file states: thumbnail grid (3-up mobile) with upload progress as a gold hairline under each tile · failed tile shows `Didn't make it — tap to retry` in gold · **never reject a format** (requirements doc law). Thumbnails render immediately from the local file, not after upload round-trip — this is the form's only moment of visual reward; it must feel instant.

### 6.5 Conditional reveals

Conditionals (deposit amount, insurance type, team fields, domain fields) reveal **in place, below their trigger**, with a 300ms ease — never a layout jump, never a new screen. Reduced-motion: instant.

### 6.6 Mutually exclusive "nothing/none"

On checkbox groups containing `nothing` / `none yet` (Step 3 customer-provides, Step 7 reviews): selecting it clears and de-emphasizes the others; selecting any other clears it. Silent, obvious, no error text.

---

## 7. Per-step deltas

Field inventories are the build spec's (§4) — binding, not restated. This section adds only presentation decisions per step.

- **Step 1 — About your business.** Business name, contact, phone, email arrive prefilled; shown as normal editable fields, quietly confirmed rather than asked. The three name fields sit adjacent (spec law); when two-plus differ, a gold help line appears under the third: `Different names? Good — that matters for Google. Leave them exactly as they really are.` This is information, not an error.
- **Step 2 — What you charge.** Repeatable service blocks per §6.3. Price stays free-form text (`$149`, `from $80/hr` both legal — no numeric input mask, ever).
- **Step 3 — How you work.** The build spec calls it the most important step; the design agrees by _slowing down_, not by decorating: its intro line renders in `--color-ink` (the only step intro that does): `These are the questions that stop us putting something on your site that isn't true.` The customer-provides checkbox group leads the step.
- **Step 4 — Customers and competition.** The three values inputs render as three separate single-line fields with mono indices — the spec's reasoning (three answers, not one) made visible.
- **Step 5 — How you talk.** The **voice-note card**: the flow's only GradientRing, card bg, the upload trigger inside, and the help copy from the build spec verbatim. Below it, plainly: `Can't be bothered recording? Skip it — the call covers this too.` (Prominence must never curdle into pressure.) Call-recording consent is an unchecked tap-card checkbox.
- **Step 6 — Photos and logo.** Thumbnail grid per §6.4. The `10–20 is ideal` line is a help line, not a counter — no `3/10` progress on photos.
- **Step 7 — Reviews.** Intro copy from the build spec verbatim (`…that's completely fine — we'll leave that section off…`). Permission-to-publish checkbox defaults unchecked. No placeholder testimonial styling anywhere, including empty states.
- **Step 8 — Your team.** Straight conditional reveals per §6.5.
- **Step 9 — Access.** Opens with the reassurance block from the build spec (`We never ask for passwords…`) styled as a `--color-card` callout with mono eyebrow `NO PASSWORDS · EVER`. Domain and domain-email questions sit first, visually weighted (ink labels), because they carry the breakage risk.

### Done — confirmation

1. `That's everything, {first name}.` (display) + what happens next and when, concretely: "Taylor reads all of this before your call, so the call is short."
2. Skipped items as a quiet mono list under `WE'LL COVER THESE ON THE CALL` — inventory, not error.
3. **Book the verification call** — Cal.com (already the site's booking rail), embedded if it embeds cleanly in the dark theme, otherwise a GradientButton out to it. `[ASSUMPTION: the v3 Cal.com account/event types serve this; reversible]`
4. `Add more photos anytime` — reopens Step 6 via the resume link.

---

## 8. Component inventory

New components, all app-local to the intake surface (placement is Mason's call; the _inventory_ is mine): `StepShell` · `StepProgress` · `AgreementCard` · `TrustBlock` · `Field` (label + help + control + note slot) · `TextField` · `TextArea` (auto-grow, 3-row min) · `ChoiceCard` + `ChoiceGroup` (radio and checkbox modes, exclusive-none support) · `RepeatableBlock` · `FileDrop` (native input under a tap-card) · `VoiceNoteCard` (the ring) · `SaveIndicator` · `FooterNav` · `ResumeList` · `SkippedList`.

Reused from the site: `GradientButton`, `GhostButton`, mono eyebrow/section-label idiom, focus ring.

**State floor for every interactive element:** default · hover (desktop only; touch shows selected/held states instead) · active · focus-visible (2px gold) · disabled (P0 pay only) · error (gold, §4) · loading (uploads, pay) · offline (§6.2). No component ships without the row filled in.

---

## 9. Copy register

The site's voice rules hold (sentence case, no exclamation marks, nothing startup-flavored) with one deliberate shift: **warmer and more spoken than the portfolio.** The portfolio talks to someone evaluating Taylor; this form talks to someone Taylor already won. Contractions on. Second person. Canadian English, CAD.

Rules:

- Where the build spec supplies copy (intros, help lines, reassurances), it ships **verbatim** — it was written for this user and it is right. This spec adds only the copy for new scope (P0, W0 deltas, states, emails).
- Questions read aloud like phone questions: "What do you bring to a job?" not "Equipment provided."
- No jargon the requirements doc bans (NAP, CTA, value prop). "It matters for Google" is the register for why-lines.
- Never blame: error copy states what happened and what we did about it ("your answers are safe on this phone"), not what the user should do differently.

---

## 10. Emails

Four system emails (Resend, per build spec), all dark-compatible plain-ish layouts — a mono header line, body text, one button. No hero images.

1. **Resume link** (on request from W0, and automatically after first autosave): subject `Your website questionnaire — pick up where you left off`. One button.
2. **Reminders ×3** (build spec §7 cadence: 48h unstarted / 48h abandoned / day 7; all killed on completion). Register gentle to the point of shrugging: `No rush — your answers are saved. The sooner it's back, the sooner you're live.` Deep-link to the abandoned step. **Never** "you're missing out," never a countdown.
3. **Completion confirmation**: recap of what happens next + call booking link if not yet booked + resume link "to add photos later."
4. The **initial link email is sent by Taylor personally**, not by the system — it should come from the human they talked to. This spec provides a suggested two-line template in the admin handoff. `[ASSUMPTION: reversible]`

Stripe's own receipt covers payment confirmation; we do not duplicate it.

---

## 11. Responsive and accessibility

- Mobile-first; the 560px column centers on desktop with the site's page-padding tokens. No layout forks besides the thumbnail grid (3-up → 4-up).
- Touch: no hover states; ChoiceCards use pressed/selected states; the voice-note ring runs at base speed always (no hover acceleration target on touch).
- WCAG 2.2 AA floor, inherited and extended: every control labeled (no placeholder-as-label, anywhere) · fieldset/legend semantics on choice groups · 48px targets · text scales to 200% without loss · focus order follows visual order · step change moves focus to the heading · save indicator is `aria-live=polite` · `prefers-reduced-motion` collapses transitions and holds the Step-5 ring static (site law).
- Contrast: all combinations used here (`ink`/`body`/`dim` on `card`) are already cleared by the design system; the gold-on-card validation text must be verified at 13.5px before ship — flagging now: **gold at small sizes is the palette's known trap.** If it fails AA, the fallback is validation text in `--color-ink` with a gold hairline, not a new color.

---

## 12. Assumptions and open items

**Assumptions (labeled, reversible):**

- ~~`[ASSUMPTION]` Deposit amount and project summary are set per-link by Taylor at creation; amounts vary per deal.~~ **WRONG — corrected 2026-08-19.** A standard build is a standard price. The deposit is a saved Stripe Price (`STRIPE_PRICE_DEPOSIT`); only the project summary is per-link. This assumption was never confirmed and should have been a question at scoping.
- `[ASSUMPTION]` A `deposit_required` flag exists per link so an edge deal can skip P0. `[PROPOSED — needs sign-off]`
- `[ASSUMPTION]` Surface lives at `tayloraucoin.com/intake/...`.
- `[ASSUMPTION]` Cal.com is the call-booking rail (it is already the site's).
- `[ASSUMPTION]` Taylor sends the initial link email personally; the system owns resume/reminder/completion emails.

**Open — need Taylor (money/brand, not mine to decide):**

1. **Deposit refund sentence** for P0's trust block. Blocks the first real charge, nothing else.
2. **Agora ↔ Taylor lockup.** Recommended treatment is specced (§3: Agora in the eyebrow and the statement line; Taylor in the greeting). Confirm Agora's legal name and Stripe statement descriptor so the "shows as AGORA" line is literally true.
3. **Gold-at-13.5px contrast check** result (mechanical; Mason can run `yarn`-equivalent audit or I will).

---

## 13. Decision log (binding — cite by ID)

Added at Mason's request so tickets cite rulings by ID rather than prose. Each is **Ruled** unless marked otherwise; re-opening requires new evidence routed to Taylor.

- **D-INT-1** — The deposit gate precedes the form; payment is **hosted Stripe Checkout** (wallets included); the app designs zero card UI. No urgency devices anywhere near payment.
- **D-INT-2** — Quiet Gilt variant governs `/intake`: no `RootField` canvas; 560px max column; 16px minimum input font; 48px targets; validation in gold, never red; zero new hexes.
- **D-INT-3** — `GradientRing` appears exactly once in the flow: the Step 5 voice-note card.
- **D-INT-4** — Nothing is required; **Continue is never disabled** (sole exception: P0 pay button while checkout opens); "Not sure" is a full-size rendered option on factual-risk radios.
- **D-INT-5** — One step = one scrollable screen; nine steps exactly; linear navigation with back, step-jumping only from the resume screen.
- **D-INT-6** — Autosave on blur + step change; save indicator per §6.2's state machine; offline persists locally and syncs silently.
- **D-INT-7** — System emails: resume link, three reminders maximum (all killed on completion), completion confirmation. Taylor sends the initial link email personally.
- **D-INT-8** — Prefill from link creation: the client is never asked what Taylor already knows.
- **D-INT-9** `[PROVISIONAL — Taylor]` — Per-link `deposit_required` flag may skip the pay gate.
- **D-INT-10** `[NEEDS DECISION — Taylor]` — Deposit refund sentence on P0. Blocks the first real charge only.

## 14. Handoff notes for Mason and Reeve

What forks tech, so it's scoped once: hosted Stripe Checkout vs embedded (this spec assumes **hosted** — redirect model, wallets included, zero card-UI to design or secure; the design intentionally has no card fields) · webhook → engagement state machine (`unpaid → paid → started → complete`, plus `waived`) · signed long-lived resumable tokens, single business per token (build spec §5) · autosave debounce + JSONB answers (build spec §8) · private storage + signed URLs for uploads including audio · Resend for §10 emails · Cal.com embed vs link on Done · prefill payload at link creation. Backend conventions come from Conscious Connections per Taylor's direction — Mason's section, not mine. The admin surface is deferred; its content requirements live in [`ADMIN-HANDOFF.md`](ADMIN-HANDOFF.md).
