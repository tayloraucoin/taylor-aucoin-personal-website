# CRM-UX-SPEC — Admin CRM for lead calling, v1.2

**Author:** Vesper (with Drummer — sales model) · **Signed off:** Taylor, 2026-08-21 · **v1.1 amendment (call windows): 2026-08-21** · **v1.2 amendment (call mode, §3.8): 2026-08-22**
**Kind:** Contract — the UX handoff for the CRM track. §6 (Decision Log) is binding; tickets cite it by ID.
**Governs:** everything under `/admin`. The client-facing intake surface stays governed by `docs/intake/INTAKE-UX-SPEC.md`; the one CRM-driven change to it (promo pass-through) is D-CRM-10 here and deliberately minimal.

---

## 1. Frame

Taylor, solo operator, working a call block: laptop open, phone in the other hand, between contract-work sessions. The one job of this surface is **who do I call next, and log what happened in two clicks**. The worst moment is a prospect answering while he is mid-scroll — the pitch facts must be one glance away, and logging must survive a distracted, hurried user. Register: utilitarian, plain, Taylor-only. Never any manufactured urgency — an overdue callback is a warm lead, not an emergency.

The sales model under the screens (Drummer): three axes, never collapsed — **stage** (where the lead sits, mostly derived), **disposition** (what happened on one dial, logged per touch), **next action + date** (what drives the queue). "Basically interested" is not a stage.

## 2. Information architecture & routes

All routes from `lib/routes.ts` (`adminRoutes`). Nav order = frequency of use.

| Route | Surface |
|---|---|
| `/admin` | redirect → `/admin/queue` |
| `/admin/login` | login (the only unauthenticated admin route) |
| `/admin/queue` | Call queue (home) + focus card |
| `/admin/leads` | all leads, filter/search |
| `/admin/leads/[id]` | lead detail |
| `/admin/engagements` | intake admin (list) |
| `/admin/engagements/[id]` | engagement detail (reminders, output) |
| `/admin/sync` | CSV ingest |
| `/admin/scoreboard` | funnel readout |

## 3. The surfaces

### 3.1 Call queue (`/admin/queue`)

Three bands, top to bottom: **Overdue callbacks** (nextAction passed; gold emphasis, never red) → **Due today** → **Fresh** (never dialed). Default filter: no-website thread; audit thread, niche, city behind filters. Row: business name · niche, city · proof line ("4.9 × 154 reviews") · phone with click-to-copy (`tel:` link on mobile) · attempt summary ("2 tries · last Tue 2pm, no answer") · stage chip · window chip (§3.7). Click → focus card in a right-hand panel. Keyboard: j/k move, Enter opens, Esc closes.

**Ordering inside Fresh** (D-CRM-18): in-window leads first — `best` tier, then `fair` — each tier by lead score; out-of-window leads follow, also by score. The two callback bands are **never** reordered or filtered by window: a promised callback at 2pm is a promise regardless of whether 2pm suits that trade.

Empty state: "Nothing due. N leads scheduled for later — next comes due {date}." plus a **Pull 10 fresh leads** button. The queue never dead-ends.

### 3.2 Focus card

> **Superseded in part by §3.8 (v1.2).** The logging vocabulary below — dispositions, chips, follow-through — is unchanged law. The surface it lives on is redesigned as call mode; where this section and §3.8 disagree on layout or sequencing, §3.8 wins.

Top: phone number large with copy button · name · niche · rating × reviews · city · maps link · address. The opener facts in one glance. Middle: note field (autosaves on blur), then touch history newest-first. Bottom: **the disposition row** — one click each: No answer · Voicemail · Busy — callback · Conversation · Wrong number · Not interested · Do not call.

Follow-through, contextual, chip-based (two clicks total for every common case; nothing beyond disposition ever required):

- **No answer / Voicemail** → next attempt auto-set per cadence (D-CRM-5); chips to override: Tomorrow AM · +2 days · Next week · Pick.
- **Busy — callback** → time chips: This afternoon · Tomorrow AM · Tomorrow PM · Pick date & time.
- **Conversation** → interest chips: Wants info (opens intro-email dialog, or shows the sms: option on mobile) · Talk to the boss (blocker tag) · Price talk · Not now (requires resurface chips: 1 month · 3 months · Pick) · Ready for intake (jumps to engagement creation, prefilled).
- **Not interested** → reason chips: Has a guy · No need · Money · Timing (suggests Not now instead). Optional note.
- **Wrong number / Do not call** → terminal, one confirm for DNC.

### 3.3 Lead detail (`/admin/leads/[id]`)

Contact block: phone (admin override editable), email (inline add/edit; empty state "Add an email to send the intro"), address, maps link. One merged timeline: dials with dispositions, emails sent, stage changes, notes. Engagement panel:

- **Unlinked:** *Create intake link* (prefills contact name, business, phone, email, project summary — the client is never asked what Taylor already knows) · *Link existing engagement* with suggested matches on phone/email.
- **Linked:** derived engagement status (sent / paid or waived / started / in progress / abandoned / complete) · deposit state ("paid $600 on Aug 12 via Stripe" / waived) · questionnaire progress (step n of 9) · reminder history with per-engagement kill switch (ceiling of three is law; the admin never grows a fourth nudge) · one-click markdown output · **money**: itemized `engagement_products` at actually-paid prices, with total.

### 3.4 Intro email dialog

Modal from lead detail or the Wants-info chip. To (prefilled, editable) · Subject · full body drafted plain-text, editable in place. Checkbox **"Include free change-round promo"** appends `?promo=TAYLOR_FREE_ITERATION_ROUND` to the intake link and one sentence naming the grant. One quiet line: "Send only after they've asked on a call." Confirm before any re-send to the same lead. Failure: say what happened, keep the draft, offer retry. Default body (Drummer, Taylor's register):

> Subject: {Business name} — website info from our call
>
> Hey {first name} — good talking today. Here's everything in one place: {sales page link}. Short version: five pages, $1,200 + GST, half to start, you own all of it, live about a week after your answers.
>
> When you're ready, this link starts things — the deposit and a short questionnaire (about 30 minutes): {intake link}
>
> *(promo checked)* That link includes a free small round of changes after launch, from our call.
>
> Text me if anything's weird. — Taylor

### 3.5 Sync (`/admin/sync`)

Drag-drop the CRM export CSV. Preview before commit: "12 new · 40 refreshed · 130 unchanged" with a sample diff. Commit = transactional upsert. **Sync never touches stage rulings, notes, schedules, contact edits, or engagement links.** Persistent sync log below. Files without a `place_id` column are rejected with a pointer to `yarn leadgen export --crm`.

### 3.6 Scoreboard (`/admin/scoreboard`)

One screen, no charts. This week and all-time: dials → conversations → info sent → intake sent → deposit → complete, counts always, rates only with their n (below threshold: "n too small"). Health numbers: live leads with no next action (should be zero by construction) · overdue callbacks count.

**Timing model check (D-CRM-21).** A second block: reach rate (conversation ÷ dials) by window tier (`best` / `fair` / `avoid`), by profile, and by weekday — counts always, rates only above threshold, "not enough data yet" otherwise. This is the surface that tells Taylor whether the call-window model is real. It is allowed to say the model is wrong.

### 3.7 Call windows — "Ready to call now"

The premise (Drummer): published cold-call timing data describes SDRs dialing desk workers. This list is people under a car or on a roof, and the two groups want opposite hours. Each niche carries a **call-window profile** — `storefront` · `field_trade` · `solo_mobile` — with `best` / `fair` / `avoid` hours and a day-of-week tier. The profile table is config, and its single home is `TECH-SCOPE.md` §12; nothing restates those values.

**The toggle.** One control in the queue header: **Ready to call now**. On, it filters the **Fresh** band to leads whose current local hour is in their `best` or `fair` window. Off (default), it does not filter — it only sorts (§3.1). The callback bands ignore it entirely.

**The window chip.** Quiet text, never a colored dot — traffic-light semantics are banned, and a lead outside its window is not an error. Shown on queue rows **only when the toggle is off**, where it explains the sort ("good now", "best 4:30pm", "best Wed 10am"); always shown in the focus card, where it is a fact about the call being made. Copy states the fact, never a scold and never pressure: "best window ends 11:30" is fine; anything counting down is not.

**The day strip.** A compact 7:00–18:00 band in the queue header showing which profiles are open in which hours, with now marked. It answers "when should I run my block" without Taylor holding the model in his head, and it makes the sort legible rather than magic. *Trim first if CRM-12 runs long.*

**Empty state — the state that decides this feature.** Toggling at 9:00am legitimately yields almost nothing: auto shops are in the drop-off rush and the trades are already on site. It must never read as "no work". It names what is open next, with counts, and offers the escape:

> Nothing in its best window right now. Auto shops open up at 10:00 — 129 waiting. Field trades are best again at 4:30pm — 47 waiting.
> [Show everyone anyway]

**Seasonal note.** One line on the focus card, per niche, changing the *pitch* rather than the timing — late August: a roofer is booked into October, so "get more calls" is the wrong hook and "you're quoting against companies with real websites" is the right one. Advisory copy only; no machinery, and it never filters or reorders (D-CRM-20).

**Walk-in.** `storefront` profiles carry `walkInViable`. The focus card surfaces the address and maps link with one line noting a walk-in beats a call for these, and `walkInViable` is available as a queue filter so an afternoon route through a Surrey cluster can be built. No routing, no mapping UI in v1.

**Honesty (D-CRM-21).** The whole model is a labeled hypothesis, not data — it is reasoned from how these trades structure a day, plus one contractor's account, and none of it has been tested against Taylor's own outcomes. Every attempt is already timestamped, so the scoreboard (§3.6) reports **actual reach rate by profile × window tier × weekday**, with n, and says "not enough data yet" below threshold rather than showing a rate. The model is built to be falsified by the next hundred calls, and the config is one file to edit when it is.

### 3.8 Call mode (v1.2)

Ruled by Taylor 2026-08-22 from `CALL-MODE-BRIEF.md` (Vesper + Drummer thread). The calling loop as one piece, as numbered states:

0. **Queue.** Left: the banded list (§3.1 unchanged). Right: the **pre-call panel** for the selected lead — opener facts, the number large with **Copy** and **Call now** beside it, window line, seasonal note, walk-in line, attempt summary, **Full record** (opens the Sheet, D-CRM-30). j/k/Enter as before.
1. **Call mode — dialing.** *Call now* means "I am dialing"; nothing is logged yet. Left: the call sheet (`docs/crm/CALL-SHEET.md`, D-CRM-28) rendered as markdown, with the seasonal note surfaced beside it (D-CRM-20 stands). Right: the disposition row live (buttons + number keys); the conversation fields visible but dimmed. *Back*/Esc exits with nothing logged.
2a. **Non-conversation branch.** The disposition click logs immediately (optimistic, never lost — §4 failure contract stands); its contextual chips (§3.2) adjust the follow-up after the fact; **Next lead** (Enter too) only advances. The note field accepts text here as well.
2b. **Conversation branch.** The fields open: contact name · email · better phone · channel preference (text / email) · interest tags (D-CRM-3 vocabulary unchanged) · notes · a visible **next-touch** field defaulted per the tag's cadence rule, editable before commit. **Save** commits everything at once. Number-key accelerators inert while any field has focus.
3. **Post-call actions.** Derived from what was saved — one motion, nothing re-entered. *Wants info* → the intro draft inline, prefilled from the call, sent per channel preference: email keeps the full editable draft (D-CRM-9); text stays on Taylor's phone (D-CRM-14). *Ready for intake* → the intake mint prefilled from the captured contact, show-once link with Copy. A promised callback shows as scheduled, nothing to do.
4. **Review.** Conversations only (D-CRM-27): everything saved — including the committed next-touch date — and every action completed. **Next lead.**
5. **Advance.** The lead leaves the list; selection moves in band order; landing is the next lead's pre-call panel (state 0).

Mobile: one column, dispositions first, the call sheet behind a toggle (D-CRM-29; D-CRM-7 stands). Every standing law survives unamended except where a row below says otherwise: cadence, never-lost logging, DNC, no urgency styling, inert-when-double-loggable accelerators, advisory windows and seasons, the SOP dialog on the queue.

## 4. States

Every interactive element ships default · hover · active · focus-visible · disabled · loading · error · empty. The ones that carry the design:

- **Queue empty** — hospitality, never apology (§3.1). **Queue loading** — skeleton rows, no spinner storm.
- **Disposition save failure** — the logged outcome is never lost: optimistic UI, on failure the disposition row reverts with "Couldn't save — retry" inline; the note field content persists locally until saved.
- **Email send failure** — dialog stays open, draft intact, error states what happened.
- **Sync failure** — preview stage catches malformed files; commit is all-or-nothing; partial writes never persist.
- **Offline** — a quiet banner; disposition buttons disabled with the reason, notes keep local draft.

## 5. Accessibility

Targets ≥44px on disposition and chip rows (they get hit fast and one-handed). Focus-visible on every control; the disposition row is fully keyboard-operable (number keys 1–7 as accelerators, labeled). Contrast AA at rendered sizes — the gold overdue emphasis is checked against the admin background first. `prefers-reduced-motion`: panel transitions collapse.

## 6. Decision Log (binding — tickets cite by ID)

| ID | Ruling | Status |
|---|---|---|
| D-CRM-1 | Three-axis model: derived stage · per-touch disposition · next-action date drives the queue. Never one flat status field | Ruled |
| D-CRM-2 | Stage vocabulary: to_call · trying · in_conversation · info_sent · intake_sent · client (sub-state from engagement) · not_now · not_interested · do_not_call · bad_lead. Back half derived from engagement facts, never hand-set | Ruled |
| D-CRM-3 | Disposition taxonomy (§3.2) and interest-chip vocabulary: wants_info · decision_maker · price_talk · not_now · ready_for_intake | Ruled |
| D-CRM-4 | Every live lead carries a next action + date; leads without one are a scoreboard defect, not a normal state | Ruled |
| D-CRM-5 | Cadence defaults: retry +2 business days rotated time-of-day; 4-attempt cap then auto not_now with 60-day resurface | `[PROVISIONAL — Taylor tunes]` |
| D-CRM-6 | Queue bands: overdue callbacks → due today → fresh by lead score. Overdue = gold emphasis; never red, never alarm | Ruled |
| D-CRM-7 | Desktop-first (laptop open, phone dials); mobile usable; keyboard j/k/Enter + numeric disposition accelerators | Ruled — Taylor 2026-08-21 |
| D-CRM-8 | Logging ≤2 clicks for every common case; nothing beyond the disposition is required | Ruled |
| D-CRM-9 | Intro email: full editable draft · promo checkbox appends `?promo=TAYLOR_FREE_ITERATION_ROUND` · CASL soft guard (copy line + confirm), not a hard gate · confirm on re-send | Ruled — Taylor 2026-08-21 |
| D-CRM-10 | Public intake start forwards `?promo=` into the minted engagement's entry URL | Ruled — Taylor 2026-08-21 |
| D-CRM-11 | Sync is preview-then-commit, transactional, and never touches admin-owned fields | Ruled |
| D-CRM-12 | Scoreboard: counts with n; rates only above threshold; no charts in v1 | Ruled |
| D-CRM-13 | The engagement panel absorbs `docs/intake/ADMIN-HANDOFF.md` in full, including the three-reminder ceiling and kill switch | Ruled |
| D-CRM-14 | Texts stay on Taylor's phone: `sms:` deep link with prefilled body on mobile; the app never sends SMS | Ruled |
| D-CRM-15 | Both lead threads ingested; queue defaults to no-website | Ruled — Taylor 2026-08-21 |
| D-CRM-16 | The admin surface is exempt from the site's visual law (no RootField, no Quiet Gilt obligation): plain utilitarian, noindex. The no-urgency/no-alarm law still binds | Ruled |
| D-CRM-17 | Each niche maps to a call-window profile (`storefront` · `field_trade` · `solo_mobile`) with best/fair/avoid hours + weekday tiers. Values are config with one home: `TECH-SCOPE.md` §12 | Ruled |
| D-CRM-18 | "Ready to call now" filters only the **Fresh** band; default off, where it sorts in-window-first instead. Callback bands are never window-filtered or reordered — a promise outranks a model | Ruled |
| D-CRM-19 | Out-of-window leads are never hidden by default and never auto-suppressed. Hiding them strands Taylor with an empty queue and 300 callable leads invisible | Ruled |
| D-CRM-20 | Seasonality is advisory pitch copy on the focus card only. It never filters, reorders, or scores — burying 137 roofers for two months on an untested model is not a thing software should do quietly | Ruled |
| D-CRM-21 | The timing model is a labeled hypothesis. The scoreboard reports actual reach rate by tier/profile/weekday at honest n, and is allowed to falsify it | Ruled |
| D-CRM-22 | Window copy states facts, never pressure. No countdowns, no "closing soon", no colored status dots (traffic-light semantics are banned) | Ruled |
| D-CRM-23 | Call mode is the calling loop's one surface (§3.8): queue → call now → script left / logging right → non-conversation or conversation → post-call actions → review → advance. Supersedes §3.2's *surface*, never its vocabulary | Ruled — Taylor 2026-08-22 |
| D-CRM-24 | Non-conversation dispositions log on click; Next lead (and Enter) is pure advance, never a commit. D-CRM-8's ≤2-clicks law, measured from hang-up, stands | Ruled — Taylor 2026-08-22 |
| D-CRM-25 | Conversation form: contact name · email · better phone · channel preference · interest tags · notes · visible next-touch defaulted per tag cadence. Openness is not a field — warmth is read from the tags | Ruled — Taylor 2026-08-22 |
| D-CRM-26 | Post-call actions derive from what the call captured — one motion, nothing re-entered. Email keeps the full editable draft (D-CRM-9); texts stay on Taylor's phone (D-CRM-14) | Ruled — Taylor 2026-08-22 |
| D-CRM-27 | The review screen follows conversations only; non-conversation paths advance without one | Ruled — Taylor 2026-08-22 |
| D-CRM-28 | The sales script is content, not code: `docs/crm/CALL-SHEET.md` rendered as markdown in call mode's left column. Its facts must match the website exactly (platform fee ~$36); the preview-first ask is removed — nothing is built before the questionnaire | Ruled — Taylor 2026-08-22 |
| D-CRM-29 | Mobile call mode: a single column, dispositions first, the call sheet behind a toggle | Ruled — Taylor 2026-08-22 |
| D-CRM-30 | `/admin` may vendor headless primitives: CC's Sheet source (Radix dialog) adopted for the lead drawer, slide + reduced-motion fade. The site-wide component-library ban (CLAUDE.md) stands untouched; the drawer keeps "Open full page" | Ruled — Taylor 2026-08-22 |

## 7. Open items routed onward

- Cadence numbers (D-CRM-5) → Taylor, after real call data. Build against defaults.
- Call-window values (D-CRM-17) → falsified or confirmed by the scoreboard's timing block after ~100 attempts. `[NEEDS VALIDATION]` — reasoned, not measured.
- BC statutory holidays as a poor-day tier → `[REVISIT]` when a holiday actually lands in a call block; a maintained holiday list is not worth it for v1.
- Per-lead learned window override ("this owner is always in at 8am") → `[REVISIT]`; `notes` and a scheduled callback cover it today.
- Schema, placement, auth, sync identity → Mason (`docs/crm/TECH-SCOPE.md`).
- CASL/CRTC posture for cold calling and texting overall → counsel (standing flag, unchanged by this build; the CRM records touches either way).
