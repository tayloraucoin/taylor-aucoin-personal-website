# `/websites` — page specification

Author: Vesper (design), with Forge on the code contract. Status: **built, revised twice against Taylor's feedback, and passed through his Human-Hand tell scan. Awaiting his read-aloud pass and one content gate (§8).**

**Document authority.** On tokens and visual law, [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) wins. On register and what Taylor has rejected, [`../TASTE-PROFILE.md`](../TASTE-PROFILE.md) wins. On the offer itself — price, process, terms, timelines — **Taylor's client-facing "How We Work Together" document wins over everything here.** Every substantive sentence on this page is adapted from it or lifted from it; nothing about the commercial relationship was invented. Where this spec is silent, the `/services` page is the nearest precedent and its idioms are the default.

---

## 1. Frame

### Who is here, in what state

Two arrivals. They never share a scroll position, and that is the design's central fact.

**A — the buyer.** A detailer, landscaper, or cleaner, on a phone, minutes after a call in which Taylor said "go to tayloraucoin.com/websites." Standing in a driveway or sitting in a van. Has been sold to by a "web guy" before and it did not go well. Wants three things and will not scroll far to get them: what does it cost, how long does it take, what do I actually own at the end. Budget: about forty seconds before the first decision to keep reading or close the tab.

**B — the evaluator.** A hiring manager, or Durable, arriving from a link. On a desktop, unhurried, asking one question: is this a serious productized system or a guy doing cheap websites on the side. Will read the process section closely and skim everything else.

### The one job

Make the system legible in a single scroll, so that A books and B respects it — with one artifact, not two. The resolution the brief asked for holds: **the system is the proof for both audiences.** A client reading "brand extraction → written primer → build → verification pass" hears competence and low risk. An evaluator reads the same words and sees process design. There is no section on this page written for one audience that damages the other.

### The emotional contract

What the reader must believe by the end: *this person has done this before and it went well · the price is the price · I own what I get · nothing is being hidden from me.*

The fourth belief is the one this page is built around, because it is the one Taylor's competitors break. Every structural choice below — publishing the full price, publishing the change-round tiers, publishing the honest limits before the FAQ — is spending page real estate to buy it.

### Register

Taylor's own, from his document: first person, plain, blunt where bluntness is honest. "I'm not the kind of web guy who holds your business hostage. That's on purpose." That sentence is the voice of the page. No exclamation marks, sentence case, no marketing verbs. Per `TASTE-PROFILE.md` § voice, copy here is adapted from Taylor's writing rather than generated; the read-aloud pass is still his.

**Tone law, standing:** never apologetic, never "side hustle," never cheap-sounding. The price is low; the framing is not.

---

## 2. Placement and discovery

| Decision | Value | Why |
| --- | --- | --- |
| Route | `/websites` | Short enough to dictate over the phone and to print on a card. Taylor's call. |
| Linked from | **nowhere** | Explicit instruction: until this line earns money, no one evaluating Taylor for senior/staff roles should stumble into it. Not in `SiteHeader`, not on `/services`, not on `/about`, not from the work index. |
| Indexing | `robots: { index: false, follow: false }` | A no-links page is still one crawl away from a search result for "Taylor Aucoin." Direct URL is the whole distribution model, so indexing buys nothing and costs the thing above. |
| Sitemap | n/a | The repo has no `sitemap.ts`. Nothing to exclude. If one is added later, this route is excluded by hand. |
| Intake tree | nested at `/websites/intake` | Taylor's call. See §7. |

**Consequence to accept:** with `noindex` and no inbound links, this page's only traffic is people Taylor sends. That is the intended trade, and it means the hero does not have to do cold-open work — every visitor arrives pre-warmed by a phone call.

---

## 3. Surface dialect

Same system, same page furniture as `/services`. This is deliberate and it is the senior signal: the page must read as *part of tayloraucoin.com*, not as a landing page bolted to it.

**Kept, unchanged:**

- `RootField` at full page height. (Contrast with the intake surface, which drops it — a form under mobile CPU pressure is a different problem than a marketing page. See `INTAKE-UX-SPEC.md` §4.)
- 1080px max width, `px-[22px] py-10 md:px-14 md:py-14`, `mt-16` section rhythm, `SectionLabel` on every section.
- `SiteHeader` and `Footer`. Removing chrome would make this a landing page, which contradicts the whole positioning. The header's "Work with me" link is the correct exit for audience B and harmless noise for audience A; the footer carries Privacy, which a page adjacent to a payment flow should have within reach.

**Gradient rationing — the full budget for this page:**

| Where | Treatment |
| --- | --- |
| Hero eyebrow | gold hairline trailing right |
| Primary CTAs (×3) | `GradientButton`, gold→white fill |
| The price card | the page's **one** `GradientRing` |
| Hero stat values, process indices, section lead labels | flat `--color-c2`, never gradient |

**One ring on the page.** Same reasoning as the intake spec's single-ring rule: the ring is the site's signature, and rationing it to the one thing every visitor is scrolling to find gives that thing gravity without decorating the page. Every other card on the page is flat `--color-spec-bg`.

**Nothing new.** Zero new hexes in the design system, zero new spacing values, zero new components that duplicate an existing one with a small difference. The one genuinely new visual idea — the client palette artifact (§5) — is content rendering itself, not a system extension.

---

## 4. Section order and rationale

1. **Hero** — who it's for, the outcome, the three numbers, start
2. **What you get** — deliverables
3. **How it goes** — the process; the section both audiences are here for
4. **Not just a website** — the AI employees
5. **Case study — Clean Coast** — the centrepiece: gallery, live link, palette
6. **What it costs** — the full price, the platform fee, the ownership passage
7. **Start** — a door in the wall, right after the price
8. **Changes after the build** — tiers and rules
9. **Worth saying up front** — the honest limits
10. **FAQ**
11. **Close**

**The problem section was cut.** The brief allowed two or three sentences; Taylor's own opening — "You've got a real business with real customers who already say good things about you. What you don't have is a front door online that matches that." — does the entire job in the hero sub, and a separate section restating it would be the additive fix. Reduction pass applied and held.

**Price sits at 6, not 2.** Audience A gets the number above the fold as a stat, which satisfies the forty-second budget; the full breakdown with the platform fee and the ownership passage lands after the process and the case study, when it has been earned. Putting the full pricing table second would make the page read as a quote, not a service.

**Starting appears three times** — hero, immediately after the price, and at the close. The page is long, and the moment someone decides is the moment they finish reading the price, not three thousand pixels later. §7 is one line and one button with no section label: a door in a wall, not a section.

---

## 5. Section specs

### 5.1 Hero

```
mono eyebrow  Metro Vancouver · Agora Network Technologies   ──── gold hairline
h1            Websites for local businesses
sub (48ch)    You've got a real business with real customers who already say
              good things about you. What you don't have is a front door online
              that matches that. I build that front door.
stat row      $1,200        5–7 days        $0
              CAD + GST     TYPICAL BUILD   ONGOING COST TO ME
CTAs          [Start your site →]   [Book a call first]
note          Six questions first — nothing is charged until you've seen
              what you're starting. Rather talk it through? 604-353-4287
```

**h1 is plain, not clever.** "A front door that matches the business" was drafted and cut: audience A arrives with no bandwidth for a metaphor in the largest type on the page, and comprehension beats resonance when the user's state decides. The distinctive voice lives in the sub, which is two short sentences and will get read.

**The stat row is the page's most important twelve words.** It is the existing `Signal` grid idiom — hairline-separated cells, `--color-c2` display value, mono dim label — three-up instead of four. It answers A's three questions before the first scroll. `$0` as the third value is the surprise, and it is the trust hook the whole page then substantiates.

**The primary CTA starts the questionnaire.** This reverses the first build, which deliberately left the questionnaire unlinked (§7). That was the wrong read of the sales motion: Taylor calls first, then sends this URL, so everyone who arrives has already been sold and the page's only remaining job is to not stand between them and starting. Booking a call is the ghost, for the ones who want to talk it through first; the phone number sits in the note beneath.

**The note under the buttons is load-bearing, not a disclaimer.** A gold button reading "Start" directly beneath a published $1,200 looks like a payment button to a non-technical reader, and it is not one — the next screen is six fields and no charge. Saying so is what makes the button safe to press, and it is the single line on this page most likely to decide whether someone clicks.

**That note is body type, not the mono label register.** Wide-tracked uppercase at 10px is work to read, and this is the one sentence on the page written specifically for the least confident person on it. Mono earns its place on labels and metadata; a sentence that has to be absorbed is neither.

**h1 sizing** matches `/services` — `clamp(32px, 4.4vw, 52px)`. This is a page, not the front door; the home `h1` scale stays reserved for Taylor's name.

### 5.2 What you get

Six hairline-divided rows, `md:grid-cols-[240px_1fr]`, gold mono lead label + body — the `HowIWork` idiom, reused exactly.

**Why rows and not a card grid.** This is the page's most brochure-shaped content, and a six-cell card grid is precisely the generic template rhythm the drift test exists to catch. The inscription register — wide-tracked mono label against plain body — is what keeps a deliverables list from reading as a deliverables list. It is also the third distinct section shape on the page, which is what stops the scroll from feeling like one repeated component.

Eleven rows, and the length is the point: this is the section that has to survive being compared against a $3,000 quote. Two of them — the **SEO plan** (the site built for local search, plus a checklist of what to do next in the order Taylor would do it) and the **command centre** — are the newest and the least expected, which is why neither is buried at the bottom.

The SEO row and the "No ranking promise" row in §5.7 are written to hold each other up rather than to contradict: a plan and a checklist are things that can honestly be handed over, a ranking is not.

### 5.3 How it goes

Six numbered steps, stacked. Each: gold mono index (`01`), display-type title, a **mono system label** in dim beneath it, then body.

The mono system label is the mechanism that serves both audiences with one artifact. Audience A reads the titles — "You fill out the questionnaire," "You review it live." Audience B reads the taxonomy running down the page — `STRUCTURED INTAKE · GAP CLOSE · BRAND EXTRACTION → PRIMER → BUILD → VERIFICATION · LIVE PREVIEW · DNS CUTOVER · HANDOFF`. Neither audience pays for the other's needs, and there is one list to maintain.

**Step 03 is deeper than the others on purpose** — three sub-lines naming brand extraction, the written primer, and the verification pass. It is the step that proves a system exists rather than a workflow, and it is the only place on the page where the extra depth is spent.

**The platform is never named.** Per the brief: preview-first, platform-name-last. The page says "the platform," "your own account," "a dashboard." Nothing about this is coy — the client learns the name at handoff, and Taylor's sales motion is not undercut by a page a prospect reads before the close.

### 5.3b Not just a website — the AI employees

The section that stops this reading as "a website for $1,200," and the reason the price stops being the headline.

**The million-dollar question does the explaining.** "If someone handed you a million dollars tomorrow, you'd hire people — some on the tools, the rest at a desk. Those are the ones you can have now." A tradesperson has no hook for "AI roles" and every hook for "who would I hire." Lead with the question, explain the mechanism second (each one is a written brief you paste into an AI chat, already knowing your business), show examples third. Reversing that order loses the reader in the first sentence.

**Four examples, not a catalogue.** Copywriter, website designer, email marketer, business and finance consultant. The real set is per-trade; naming twenty would read as filler, and naming four a tradesperson recognises reads as real. The closing line says explicitly that these are examples and that the documentation carries videos of them used on real work — the claim stays sized to what actually ships.

Flat `--color-spec-bg` cards, two-up. The ring stays rationed to the price card.

The **command centre document** is what ties the section to the rest of the offer: one Notion doc covering how to run every part of the site, how to use each AI role, and what extended help looks like. It is listed in `deliverables` and named again in the process's Enablement step, because it is the artifact that turns "here are some files" into something a person can actually act on.

### 5.4 Case study — Clean Coast

`id="clean-coast"`, so the hero and the close can both anchor to it.

**The palette artifact is the section, and it needs no image assets.** Liam's logo carried two colours; those became two eight-step ramps, a neutral scale, semantic states, and a type pairing, written up as a brand guide before any page existed. That is rendered **in CSS from the real hex values** — four named brand chips with names and hex codes, then the two ramps as continuous strips with the brand step (500) ticked in gold.

This is the single best decision on the page. The brief predicted the logo→palette image would do more work than any paragraph; rendering it as live swatches does the same work, ships tonight instead of waiting on a screenshot, stays sharp at every zoom level, and is visibly *systematic* rather than decorative — which is exactly the claim being made.

**Hex values are hardcoded in `content/websites.ts` and this is not a violation.** `DESIGN-SYSTEM.md`'s "nothing hardcodes a hex" governs *the site's own theming*. These are a client's brand colours rendered as data — the subject of the case study, not a style decision. They are quarantined in the content file, annotated, and no component reads a colour token from anywhere but the theme.

**Contrast handling:** every swatch carries a `--color-faint` hairline so the pale end (`#F8F8F8`, `#E6EEF7`) does not float on the dark ground. Colour is never the sole carrier of meaning — every named chip states its hex as real text beside it, and the swatches themselves are `aria-hidden`.

**"What got built" is numbered cards, not a bullet list.** Seven flat `LabelCard`s with `01 ·`–`07 ·` indices, three across at `lg`, using the Specialties idiom from the home page. A non-technical buyer reading a case study is counting what they get, and indices answer that at a glance where bullets do not. The index is an optional prop on `LabelCard` rather than a forked component — every existing caller renders unchanged without one, because Specialties is a set with no order to imply.

The block runs full width and Outcome sits beneath it behind a hairline. It was a two-column split when the left side was bullets; as cards it needs the whole measure, and Outcome is two lines that never earned half the page.

**The gallery leads with phones.** Four captures: home and services on a phone, then the same two on desktop. Phones first is not a layout preference — the buyer reading this page is holding one, and so is nearly everyone who will find their business. Showing the desktop view first would be leading with the view they are least likely to have.

Every capture sits on a dark panel with a hairline. These are screenshots of a light-background site dropped onto a dark ground; without the panel they glare and butt straight into the page gradient, which is the same reason the case-study template carries `frame: "panel"`.

Zoom reuses `components/work/MediaLightbox` rather than rebuilding it. The figures stay server-rendered as its children, so only the shell hydrates.

**Captures were taken through CDP device emulation, not `--window-size`.** Chrome headless with a mobile-sized window still resolves `width=device-width` against the forced device scale factor, so the site laid out at roughly 500px and every "mobile" capture came out horizontally clipped — silently, and only visible once the images were on the page. `Emulation.setDeviceMetricsOverride` with `mobile: true` is what actually flips a responsive site into its phone layout. The script is in the session scratchpad; if these need retaking, that is the method.

**Media is still optional and the layout closes without it.** Same law as the case-study template (`SITE-SPEC.md`). `logo`, `shots`, and `testimonial` are each independently absent-able; with none of them, the palette artifact and the prose carry the section unaided.

**Never iframe the live site.** Per the brief: framing may be blocked outright, mobile iframes behave badly, and it pollutes Liam's analytics with portfolio traffic. Screenshots plus a live link is the treatment.

**Testimonial slot exists and is empty.** When Liam gives a real quote it renders; until then the section closes without it. The one testimonial on this page that has to be genuine is the only one on it.

### 5.5 What it costs

The page's one `GradientRing`. Inside: `WEBSITE BUILD` mono gold · `$1,200` in the display/gold stat treatment · `CAD + GST` mono dim · "Half to start, half before it goes live." · hairline · two rows for ongoing cost.

Beside the card on desktop and beneath it on mobile, in body type at 56ch, Taylor's ownership passage — with **"if you ever want to fire me, you keep everything"** in `--color-ink` rather than `--color-body`. That sentence is the page's thesis and it gets the one weight change in the section.

The passage sits on the flat `--color-spec-bg` surface rather than bare on the ground. It was drafted bare and changed after a mobile check: it is the longest run of prose on the page with nothing under it, and low on a page this tall it lands in the root field's densest zone, where the gold vias compete with it on a phone. The design system's own remedy for body copy over the field is a near-opaque surface, and the interface wins over the atmosphere. Flat, so the ring above it remains the only one on the page — the two read as a pair rather than as two cards.

The platform line is **$36/month, less annually**, paid by the client directly. It is stated as a real number rather than a range because a range next to a flat published price reads as the one soft edge on an otherwise hard quote.

Then add-ons: four flat hairline rows, price right-aligned, tabular figures.

**The care plan is deliberately absent.** The Stripe catalogue prices it at $250/month; no document in this repo states what it *includes*. Publishing a recurring charge with no stated scope is a trust leak, and inventing the scope is a money-and-service claim I will not make. See §8.

### 5.6 Changes after the build

Its own section with its own label, not a subsection of pricing.

**This is the most senior-reading content on the page and it is worth the space.** Three tiers ($500 / $250 / free for Taylor's own mistakes, 14 days), then the three rules — batches not messages, paid before started, Taylor calls the tier and says so before you pay. It reads as someone who has run this enough times to know where it goes wrong, which is precisely what both audiences are trying to determine.

Taylor's closing line stays: "I can charge $1,200 instead of $3,000 because I know exactly how much work I'm signing up for." It converts the whole section from a set of restrictions into the reason the price is what it is.

### 5.7 Worth saying up front

Five hairline rows, the same shape **and the same gold lead** as "What you get."

The leads were dim in the first build, on the reasoning that a caveat in gold reads as a feature. Taylor caught it and he is right: it is the identical component two sections below, so two colours read as a bug rather than as a distinction. Consistency of the component beats the semantic hair-split.

Timelines pause · two-business-day reply · no ranking promise · your content is yours · portfolio permission.

**"I can't promise you'll rank #1 on Google. Nobody honest can."** stays exactly as written. Publishing the limit is what makes the adjacent promises credible.

### 5.8 FAQ

`<details>`/`<summary>`, the existing `Faq` idiom — no JS, keyboard-accessible for free, instant open/close which is also the correct reduced-motion behaviour.

Seven questions, all answered from Taylor's document: ownership · leaving · timeline · do I write anything · existing domain · what if I don't like it · why it's this cheap.

The last one is load-bearing against the "cheap web guy" read. The honest answer — fixed scope, one build, no unlimited tinkering — is the answer that makes the price a decision rather than a discount.

### 5.9 Close

One line, one button, then the contact block and the legal entity.

"Ready?" is Taylor's word from the document and it stays. `GradientButton` to the booking link, phone and email in mono beneath, `Agora Network Technologies Inc.` last. The button is the brightest thing on screen at that scroll depth; nothing competes with it.

---

## 6. States, responsive, accessibility

### State matrix

The page is almost entirely static, which is a design decision rather than an omission — every interactive element on it is one the site already ships and has already specified.

| Element | Default | Hover | Focus-visible | Disabled/error/loading |
| --- | --- | --- | --- | --- |
| `GradientButton` (×3) | gold→white fill, ink-dark text | `translateY(-1px)` + gold glow | global 2px gold ring, 3px offset | n/a — links, not actions |
| `GhostButton` (`tel:`) | translucent card, faint gold border | gold border brightens, text → `c3` | same | n/a |
| `GradientRing` (price card) | ring at 82%, base rotation | bg warms toward gold, 2px lift, ring 100% + accelerates | n/a (not focusable) | reduced-motion: ring holds |
| `<details>` FAQ row | `+` glyph, ink summary | summary → `c3` | global ring on summary | open state swaps glyph to `−` |
| Live-site link | gold mono | → `c3` | global ring | absent entirely when the P0 gate is closed (§8) |
| Palette swatch | flat colour + hairline | none — not interactive | n/a | n/a |

Everything carrying `data-interactive` (the ring card, the stat cells) fades the field's cursor-glow to zero while hovered — invariant 2, inherited, not re-implemented.

**Empty states are structural, not messaged.** No testimonial → the block is absent. No logo → the palette artifact stands alone. No screenshots → prose carries the section. No live link → the case study renders without one. Nothing ever says "coming soon"; a section either has its content or does not exist. That is hospitality rather than apology, and it is the same law the case-study template already runs on.

**Reduced motion** is inherited whole: the field freezes to a static frame, the ring holds its angle, transitions collapse. Nothing on this page animates on scroll, counts up, or moves ambiently — there was no urgency to manufacture and none was.

### Responsive

| Breakpoint | Behaviour |
| --- | --- |
| `≥ 768px` | Label/body rows go `240px 1fr`. Add-on rows and change tiers hold price right-aligned. Palette ramps full width. |
| `< 768px` | Every two-column row stacks, mono label above body. Hero stat row stays 3-up — three short values fit 375px and splitting them across two rows would break the "three questions, one glance" read. Price card full width. |
| `< 375px` | Stat values reflow within their cells; no horizontal scroll anywhere. |

**Palette ramps are strips, not labelled chips, and that is a mobile decision.** Eight labelled swatches at 375px gives each about 40px, which cannot carry a legible hex. The ramp is a gradient of *system*; the individual steps are not the point. The named brand colours — the four that are the point — get full chips with names and hexes at every width.

### Accessibility floor

WCAG 2.2 AA, audited not assumed.

- Every text colour on this page is already in the system and already clears 4.5:1 on its surface. No new colour was introduced, so no new contrast risk was.
- Swatches are `aria-hidden`; every colour they show is stated as text.
- Tap targets ≥ 44px on both CTAs and every FAQ summary; the `tel:` link is a full button, not an inline link, because it is the one control a one-handed user in a driveway is most likely to reach for.
- `tel:` and `mailto:` links carry their number and address as visible text — never an icon alone.
- Section headings are a real `h1 → h2 → h3` ladder; the mono `SectionLabel` is a `div` and is not load-bearing for structure.
- Prices use tabular figures so the add-on column aligns without a table.
- Text scales to 200% without breakage: every column is `ch`-capped or fractional, nothing is pinned to a fixed pixel width except the 240px label rail, which collapses below `md`.

---

## 6b. The copy standard

This page is held to Taylor's Human-Hand checklist (`~/Documents/Professional/Job Search/human-hand-mode.md`), same as the rest of the site.

He asked whether it should be, given the audience is non-technical and the goal is plainness. It should, and the two are not in tension. Every tell on that list — em-dash pile-ups, `X, not Y` antithesis scaffolding, triads, uniform sentence rhythm — makes a paragraph harder to parse, not easier. A tradesperson reading this on a phone at 9pm is exactly who suffers most from prose with a metronome in it. Passing the scan and being clear are the same job.

First draft scored **41 em dashes across ~2,450 words**, which is the fingerprint Don Burks named. After the pass: **zero em dashes**, and the two surviving `X, not Y` constructions are both deliberate — "changes come in batches, not messages" is a rule stated the way a person states a rule, and "a real working website, not a picture and not a mock-up" answers a question the reader is actually holding.

The mechanical scan is worth re-running against `content/websites.ts` and `content/websites-clean-coast.ts` after any copy edit. It is a `grep`-level check, not a judgement call.

## 7. `/intake` → `/websites/intake`

Taylor's call, and the right one: the questionnaire is one service's onboarding, not a site-wide facility. A client who trims the URL back to its parent now lands on the page that explains what they are filling in instead of a 404 — which, for a user who has just been asked for $600, is a meaningful difference.

Mechanics are in `DEVIATIONS.md` (2026-08-19 · WEB-1). Summary: `INTAKE_PREFIX` in `lib/routes.ts` is the only place the literal lives; `intakeRoutes` gained `start` and `cookiePath`; `server/services/deposit.ts` stopped keeping a second copy of the entry path in its Stripe return URLs. The resume cookie's scope narrows with the prefix, which invalidates any cookie set at the old path — no live engagements exist, so that cost is zero now and would not be later.

**Nesting AND linking — reversed from the first build.** The first version deliberately left the questionnaire unlinked, on the reading that the motion was call → quote → questionnaire and that a self-serve start button next to a $600 deposit invited strangers into a flow built for people Taylor had already spoken to.

That was wrong about the motion. The actual sequence is: cold call → send this URL → they read it → they start and pay, ideally in the same sitting. Nobody arrives here cold, because the URL is only ever handed out by Taylor on a call. So this page is the front of the funnel, not a brochure beside it, and starting is the primary CTA in three places. Booking a call is the ghost for the ones who want more convincing.

The trust work that makes this safe is in §5.1: the note under the button, stating that the next screen is six questions and no charge.

---

## 8. Open items — flagged, not invented

### Resolved since the first build

| Was open | Resolved |
| --- | --- |
| Copy carrying AI tells | **Scanned and rewritten.** 41 em dashes to zero. See §6b. |
| AI employee documents missing from the deliverables | **Added**, along with the **command centre** Notion doc and the **SEO plan**. |
| Clean Coast P0s — fabricated testimonials, AI headshots, placeholder phone | **Fixed.** Verified against the live site 2026-08-19: no testimonials at all, real phone (778-269-0082), real published prices. `liveUrl` is now set. |
| GST — are the $600 Prices inclusive? | **Exclusive.** `scripts/setup-stripe-catalogue.ts` sets `tax_behavior: "exclusive"`, so "+ GST" on the page is correct and Stripe adds it at checkout. |
| Questionnaire duration contradicting itself (20 vs 30–45 min) | **Thirty minutes**, Taylor's call, now consistent across `/websites`, the intake start page, the welcome screen, and the three docs that quoted it. |
| Ongoing platform cost | **$36/month**, less annually. Was $22–25. |
| Are the AI employees real, or a promise ahead of the artifact? | **Real.** Markdown role briefs pasted into an AI chat to prime it, shipped with the documentation videos. Included in the build, not an add-on. |

### Still open

| Item | State |
| --- | --- |
| **Liam's written permission** | The one remaining gate on the case study. `CLEAN_COAST.published` is `true` and the section renders — flip it to `false` if permission does not land before this goes public. Ask for a testimonial in the same message: `testimonial` is still `null`, and there is no real quote anywhere on this page. |
| **Brand-guide sample** | Taylor is asking Liam. Format decided: **image previews of two or three spreads, not an embedded PDF** — PDF embeds are miserable on a phone and heavy to load, and the buyer is on a phone. If Liam says no, the fallback is an invented/anonymised sample rather than nothing. |
| **Care plan scope** | Still $250/month with no stated contents, and still deliberately absent from the page rather than published vague. Taylor's direction as of 2026-08-21, recorded beside the commented slot in `content/websites.ts`: on call for questions, with a monthly ceiling, possibly around two hours. That is a direction and not yet an offer — a published ceiling is the number clients hold him to, so it stays off until he settles it. |
| **Read-aloud pass** | Copy is adapted from Taylor's document and his spoken feedback, not generated — but it was re-cut for the page and he has not read it aloud. `TASTE-PROFILE.md` § voice says he will notice. |
| **Phone number is published** | `604-353-4287` as a `tel:` link in the hero note and the close. Will get scraped; accepted trade for tap-to-call. One line to remove. |

### Noted, not a task

Liam's hero image is AI-generated. That is consistent with what this page now promises — the photo approach is chosen per client in the questionnaire, and Taylor does not shoot photography — but it does mean the showcase build leads with a generated image. Real shots of the rig would strengthen it. Liam's call, not Taylor's.
