# `/websites/coded` and the `/websites` chooser — page specification

Author: Vesper. Status: **built, lint-clean, verified in the browser at 375px and desktop. Awaiting Taylor's read-aloud pass and the eight ratifications in §9.**

**Document authority.** On tokens and visual law, [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) wins. On register and what Taylor has rejected, [`../TASTE-PROFILE.md`](../TASTE-PROFILE.md) wins. On the offer itself — price, process, terms, timelines — Taylor's rulings as recorded in [`PORTFOLIO-MARKETING-EXECUTION-SCOPE.md`](PORTFOLIO-MARKETING-EXECUTION-SCOPE.md) §2 win over everything here. On anything this file does not mention, [`WEBSITES-PAGE-SPEC.md`](WEBSITES-PAGE-SPEC.md) is the precedent and its laws are inherited by default. This document records only what is **new or different**; it does not restate the sibling page.

---

## 1. Frame

### Who is here, in what state

**The chooser** has two arrivals and they are not equally resilient.

**A — the trades buyer.** On a phone, in a driveway, seconds after a call in which Taylor said "go to tayloraucoin.com/websites." This person was previously landing directly on the sales page and now pays one extra click. They are the least-resilient user on the site and the entire chooser is designed around them.

**B — the creative buyer.** Arriving from a DM'd link, on a laptop, unhurried, curious. Can read past one card without harm.

**The coded page** has one arrival that matters: a working creative, most likely a filmmaker, who has been sent a link by someone they trust. Calm, with bandwidth, and judging craft. They arrive holding one of exactly two price anchors: the $20/month template platform, or the $5,000 agency quote. Which one they hold decides which FAQ answer lands.

### The one job

**Chooser:** get the right person through the right door in under five seconds, and cost the driveway buyer nothing for the extra click.

**Coded page:** convince someone whose profession is visual judgment that this person can build something worth their name being on.

### The central design fact

On the platform page, **the system is the proof**: a tradesperson reads "brand extraction → primer → verification" and hears competence. On the coded page, **the page's own craft is the proof**. A filmmaker deciding whether Taylor can make something beautiful is judging the page they are standing on.

This raises the stakes on **restraint**, not on ornament. The drift test applies double. The gradient budget did not increase, and the temptation to spend more of it here is the single most likely way to lose this page.

### The emotional contract

Chooser: *I know which one I am, and I did not just get sold to.*

Coded page: *this person has taste · the price is the price · I own the result outright · nothing is being hidden from me.* The third belief is this page's thesis and it gets a section of its own.

### Register

Taylor's own, unchanged from the sibling page: first person, plain, blunt where bluntness is honest. Sentence case, no exclamation marks, no marketing verbs.

**Tone law, standing:** never apologetic, never "side hustle," never cheap-sounding. Against a $5,000 agency quote, $2,000 is the confident number and the page has to sound like it knows that.

---

## 2. Placement, routes, naming

| Decision | Value | Why |
| --- | --- | --- |
| Chooser | `/websites` | The address already handed out on calls and printed on cards. It keeps working; it grew a door. |
| Platform track | `/websites/platform` | Moved whole from `/websites`. Content unchanged. |
| Coded track | `/websites/coded` | New. |
| Indexing | `noindex, nofollow` on all three | Inherited. Until this line earns money, nobody evaluating Taylor for a senior role should stumble into it. |
| Linked from | the chooser only | No site header entry, no `/services` link, no footer link. |
| Intake tree | **stays at `/websites/intake`** | See below. |
| Route literals | `websiteRoutes` in `lib/routes.ts` | One home per path, same law the intake routes already follow. |

**Naming is by deliverable, not by buyer, and this reversed an earlier decision.** The scoping thread had settled on audience-named doors ("service-based" / "portfolio"). Taylor overruled it: a profession can genuinely sit in both tracks, so "who it's for" cannot carry the distinction, while "what you get handed at the end" always can. Each door leads with the deliverable and states applicability underneath. The one part of the original decision that survives is the ban on a basic-versus-premium ladder, which is why the coded door is never called "custom" or "premium."

**The intake did not move with its page, and that is deliberate.** `INTAKE_PREFIX` is untouched, so no live resume link breaks and no cookie scope shifts under a client who is mid-form. The cost: trimming `/websites/intake` back now lands on the chooser rather than on the page explaining what you are filling in. That is one extra click for a client who has already paid, against a broken session for one who has not finished. The trade is obvious in that direction and it is the only regression in the move.

**Consequence of the move, accepted:** every pre-warmed prospect currently holding `/websites` pays one extra click. Taylor accepted this explicitly rather than gating the change behind a redirect window. It ships ungated.

---

## 3. Surface dialect and the gradient budget

Same system, same page furniture as the platform page and `/services`: `RootField` at full page height, 1080px max width, `px-[22px] py-10 md:px-14 md:py-14`, `mt-16` section rhythm, `SectionLabel` on every section, `SiteHeader` and `Footer`. Both new pages must read as *part of tayloraucoin.com*.

**Gradient rationing — the complete budget across all three pages:**

| Page | Where | Treatment |
| --- | --- | --- |
| Chooser | Eyebrow hairline **only** | No ring, no gradient button, nothing on either price, nothing in the picker. The eyebrow's fading gold rule is page furniture shared with every other page on the site, not a spend from the ration — dropping it would make the chooser's eyebrow the one on the site that looks unfinished. |
| Coded | Hero eyebrow | gold hairline trailing right |
| Coded | Primary CTAs (×3) | `GradientButton`, gold→white fill |
| Coded | The price card | the page's **one** `GradientRing` |
| Coded | Hero stat values, process indices, door prices | flat `--color-c2`, never gradient |

**The chooser gets no gradient at all.** It sits in front of two pages that each spend their one ring on their price card. A chooser that out-dresses the pages behind it has quietly become the destination, and the one thing this page must not do is be interesting enough to stop on. Flat cards, hairlines, and the site's standard card hover.

**One ring per sales page, unchanged.** The coded page did not get a second ring for its ownership section even though ownership is that page's thesis. Two rings in a row would read as decoration, and the argument of that section is that nothing is hidden.

**Nothing new in the design system.** Zero new hexes, zero new spacing values. Three new components total (§4), one of which renders nothing yet.

---

## 4. Component strategy

**Six existing components were generalized rather than forked.** `WebsitesHero`, `Process`, `Changes`, `StartCta`, `WebsitesClose`, and `Pricing` each gained optional props that default to the platform track's content. That page's call sites are unchanged, its output is unchanged, and there is one implementation of each shape rather than two.

This matters more than usual here. The two pages have to read as one person's work, and the fastest way to lose that is to fork the components that set the impression and let them drift apart over a year of edits.

**Two wrappers were bypassed rather than generalized.** `Deliverables` and `UpFront` are eight-line bindings of one content array to `SectionLabel` + `LabelRows`. The coded page composes those two elements directly. Threading content through a wrapper whose only job is to bind different content would add a seam for nothing.

**Three genuinely new components:**

| Component | Why it exists |
| --- | --- |
| `websites/TrackDoors` | The chooser has no precedent on this site. Small, flat, and the only new visual idea in this scope. |
| `websites/coded/Ownership` | Ownership is a section here rather than a column beside the price. Different shape, different job. |
| `websites/coded/CodedCase` | The case-study slot. Renders nothing today (§7). |

---

## 5. The chooser

```
mono eyebrow  Agora Network Technologies    ──── gold hairline
h1            Two ways I build websites
sub (52ch)    Both end with a real site you own, on your own web address.
              What changes is what you get handed at the end.

┌── door A ────────────────────┐  ┌── door B ────────────────────┐
│ A site on a managed platform │  │ A site built in code         │
│ $1,200  CAD+GST · 3–7 DAYS   │  │ $2,000  CAD+GST · FIRST LOOK │
│ what it is, 3 lines          │  │ what it is, 3 lines          │
│ ─────────────────────────    │  │ ─────────────────────────    │
│ most applicable for…         │  │ most applicable for…         │
│ SEE THIS BUILD →             │  │ SEE THIS BUILD →             │
└──────────────────────────────┘  └──────────────────────────────┘

note          If you can see yourself in both, the deliverable is the thing
              to decide on. Call me and I'll tell you which one I'd build
              for you and why.  604-353-4287
```

**The h1 is a signpost, not a hero,** and runs smaller than either sales page's at `clamp(27px, 3.6vw, 38px)`. Nothing is being sold on this screen. Every pixel the heading takes is a pixel the second door loses on a 375px phone.

**Door order is platform-first.** That buyer is the one under time pressure and the one who was told this URL on a call. The coded buyer arrived from a link someone sent them and can read past one card.

**The whole card is the link.** A CTA button inside a card that is itself a button gives a phone user two targets for one action and a screen reader two announcements of one destination. "See this build →" is text inside the single anchor, styled to read as the affordance.

**Price is on the card** because a buyer who recognises neither description can still self-select on the number. It is `--color-c2` flat, never the gradient stat treatment — that belongs to the price cards on the pages behind.

**"Most applicable for" is applicability, not a gate.** Nobody is turned away at a door on the strength of a job title. The wording keeps a reader who half-fits reading instead of bouncing.

**Copy length is set by the worst moment.** Door bodies were cut twice against a 375×812 capture until both doors cleared the fold. The first draft ran door A to six lines and pushed door B's price below the fold, which would have made the chooser a scroll — the one thing it must not be.

### 5.1 The picker — "Not sure which one?"

Taylor's addition after the first build: something after the cards for a reader who did not recognise themselves in either, which asks what they do and picks the track for them.

**It is a fixed list of jobs and a fixed mapping, not a model call.** A describe-what-you-do box routed through an LLM was the original idea and this is better on every axis that matters here: somebody who just failed to place themselves is not in the mood to compose a sentence about their own work, a list is faster to answer than a text field, the answer is instant, and nothing can come back weird. It also costs nothing to run and cannot break in production.

**Collapsed by default, sitting after the doors.** This is the load-bearing placement decision. The chooser's entire constraint is the driveway buyer reaching two doors without scrolling, so the picker stays shut and the doors keep their measured 259px and 630px. Somebody who already knows what they want never pays for somebody who doesn't, and anybody who opens it has told us they have a moment.

**The trigger is a card, and that was a correction.** It first shipped in the site's quietest register: 10px dim mono, wide-tracked, upper case, 49px tall. Taylor's read was that most people would miss it, and he was right for a diagnosable reason rather than a matter of taste — that register is the `SectionLabel` register, so the row was wearing the one costume on this site that means *"this is a heading for the thing below it."* It was reading as furniture, which is the opposite of "press me."

It now takes the door cards' own surface: `--color-spec-bg`, hairline border, a display-size question at 19px in `--color-ink`, a dim second line saying what pressing it does, and a gold `+`. Gold is the tell. On a page whose only other gold is the two prices and the two "see this build" lines, that is enough to read as an action without spending a gradient. Hover warms the border to gold at 34%, the same response the doors give.

**It is a full-width band under both doors, never a third column.** The distinction is the whole design of this element: it has to be impossible to miss without ever reading as a third option. Full width and below carries "helper"; a third card in the row would carry "third build." It also has no price, which is what the eye actually sorts on here.

**The result is a hairline-separated block, not a nested card.** A `--color-spec-bg` panel inside a `--color-spec-bg` card reads as mud, two near-identical translucent surfaces stacked with no contrast between them. The rule separates, the gold job label marks the answer, and the gold link points.

**Every option carries `cursor: pointer`.** Buttons do not get it from the browser the way links do, and a row that highlights on hover but keeps an arrow cursor reads as decoration.

**`<details>` for the disclosure, React only for the pick.** Keyboard support and the global focus ring come free, and open/close is instant, which is already correct reduced-motion behaviour. Without JavaScript the panel still opens and the job list still reads; only the pick goes dead, and everything it would have told you is reachable from the two cards above and the phone number below. That is an acceptable floor for something that aids a decision rather than gating one.

**Jobs are buttons, not links.** Picking shows the answer in place, so a wrong pick costs nothing. A list that navigated on first tap would punish exactly the hesitation this exists to serve.

**The list is alphabetical, and that is a correctness decision.** Grouping by verdict would let the grid leak its own answer, and a reader who can see the mapping is no longer answering honestly about themselves. "Something else" is pinned last because it is a catch-all rather than a job.

**`either` is a real verdict, not a hedge.** Taylor's original point was that some professions genuinely fit both tracks and the deliverable is what separates them. Four jobs resolve to it — architecture or interior design, consulting, personal training or coaching, and "something else" — and the answer says so plainly and hands over the question that settles it: *does someone hire you because of how your work looks, or because you turned up and did the job properly?* Sorting a photographer into a bucket with false confidence would be worse than useless. That verdict offers both doors.

Verdict headlines are **read off `doors`** rather than stored twice, so a recommendation can never name a door differently from the card it points at.

**The phone number survives beneath it**, shortened. Two escalating steps: the picker for people a list can settle, the call for people it cannot.

**Tap targets:** job rows measure 49px. They were 41px at the first padding value, under this site's own stated 44px floor, and were corrected. Height is free here because the block is collapsed and below the doors.

---

## 6. The coded page — section order and rationale

1. **Hero** — who it's for, the outcome, the three numbers, start
2. **What you get** — deliverables
3. **How it goes** — the process, with taste extraction carrying the depth
4. **What you actually own** — the thesis
5. **Case study** — dark at launch (§7)
6. **What it costs** — the price, the ring, the add-ons
7. **Start** — a door in the wall, right after the price
8. **Changes after the build** — tiers and rules
9. **Worth saying up front** — the honest limits
10. **FAQ**
11. **Close**

**Ownership is promoted to position four, out of the pricing section.** On the platform page it is a paragraph beside the price card. Here it is the single answer to both anchors this buyer arrives holding, and the differentiator against the whole category. It earns a section.

Placing it *before* the price rather than after is the load-bearing part. The reader meets "you own the code, the accounts, and the ability to change it without me" and then meets $2,000. In the other order the number arrives first and the ownership passage reads as justification.

**Price stays at position six, earned rather than second** — inherited, and the reasoning is unchanged. The number is above the fold as a hero stat, which satisfies anyone scanning for it; the full breakdown lands after the process and the thesis.

**Starting appears three times** — hero, immediately after the price, and at the close. Inherited.

**No AI-employees section.** It has no equivalent on this track. The guide to editing the site with Claude Code is that story here, and it lives in the deliverables and the FAQ rather than in a section of its own.

### 6.1 Hero

Stats: `$2,000 / CAD + GST` · `3 days / To your first look` · `$0/mo / Hosting, on Vercel's free tier`.

**The third cell is the surprise, same mechanism as the platform page's `$0`** — and its label is doing work the platform page's does not have to. Taylor will not personally promise free hosting forever, because it is not his promise to make. The label attributes the free tier to Vercel in the stat itself, so no cell on this page can be read as him underwriting it. §6.4 carries the full qualifier and the link.

**Only one timeline number is published, and that is a decision rather than an omission.** "First look in three days" is committed. A total-build number is not, because the total depends on how many revision rounds the client wants. The process's build step and the FAQ both say so in plain words rather than leaving the second number to be inferred, which is what a page with one timeline number otherwise looks like.

**The CTA points at the real questionnaire, as of 2026-08-26.** A parallel thread landed `/websites/coded/intake` (`showcaseIntakeRoutes.start`), and every primary CTA on this page now opens it — hero, mid-page door, and close — matching the platform page's law exactly: starting is primary, "Book a call first" is the ghost for people who want to talk before they commit. All three CTAs briefly pointed at booking instead, while the intake did not yet exist; a disabled button or a "coming soon" would have wasted the click in the meantime. `startHref` and `ctaLabel` in `content/websites-coded.ts` are the two values that carried that arrangement and now carry the real route; nothing else on the page moved when they flipped, confirming the design held.

**The note under the buttons is load-bearing, not a disclaimer** — inherited law. It states that a call costs nothing and that Taylor will say so if the other track fits better. That sentence is the one most likely to decide whether someone presses the button.

### 6.2 What you get

Eight hairline rows, the `LabelRows` idiom, reused exactly. Not a card grid: that shape is the generic template rhythm the drift test exists to catch, and on a page whose whole argument is craft it would be the loudest possible own goal.

Two rows are the least expected and neither is buried: **the guide to changing it yourself**, which is the closest thing this offer has to a moat, and **your old links keep working**, which is a competence signal this audience actually checks. Kryshan's current site carries nine years of inbound links.

### 6.3 How it goes

Eight steps in the `Process` idiom: gold mono index, display title, mono system label, body. The mono taxonomy running down the page is the same two-audience mechanism the platform page uses.

**Step 02, taste extraction, carries the sub-lines.** Exactly one step per page gets extra depth, and it is the step where that page's buyer decides whether a system exists or whether this is a guy with a laptop. On the platform track that is the build; here it is taste, because a creative buyer's real fear is a designer who will show them three drafts they hate.

**The stack is named here, reversing the platform page's law.** That page never names its platform, protecting a sales motion that closes on a call. Here the tooling is part of what gets handed over — the repository, the Vercel account, the guide to editing with Claude Code — so hiding it would be hiding the deliverable. Naming it invites "so why do I need you," which the FAQ answers honestly rather than dodges.

### 6.4 What you actually own

Flat `--color-spec-bg` panel carrying Taylor's ownership passage, with **"if you ever want to fire me, you keep everything"** in `--color-ink`. One weight change, on the sentence that earns it. The line is carried over from the platform page word for word and is more literally true here.

Beneath it, behind a hairline rail, **the hosting qualifier**. This exists because Taylor ruled it must: free is Vercel's tier, on Vercel's terms, in the client's own account, and those terms are Vercel's to change. The page says that plainly.

**The link to Vercel lives on the price card, not here.** Both were built at first, and two identical links 500px apart in adjacent sections read as padding rather than as thoroughness. The link belongs where the claim is a number and where a sceptic goes to check it; this paragraph explains the arrangement and points down to it.

**This must never be softened to "hosting is free."** It is the difference between describing an arrangement and underwriting one, and the second is a promise Taylor is not in a position to keep.

### 6.5 What it costs

The page's one `GradientRing`. `SITE BUILD` · `$2,000` in the display/gradient stat treatment · `CAD + GST` · "Two ways to pay." · the two options as a hairline-railed list · then the two ongoing-cost rows.

**`options` is the one new element in this component**, and it exists because this track has two payment shapes and the platform track has one. Which one you pick is a real decision made at this card, so it renders as a list rather than being crushed into a sentence.

**The card stands alone at its beside-prose width** rather than stretching to full measure now that the ownership column is gone. Letting it fill the row would make the price the loudest object on a page whose argument is craft.

**The Vercel link travels with the `$0`.** A published zero without whose zero it is would be the one soft edge on an otherwise hard quote.

Add-ons: three flat hairline rows, price right-aligned, tabular figures. **Two are deliberately absent** — see §9.

### 6.6 Changes after the build

Tiers and rules shared verbatim with the platform track. Only the closing line differs, and it names this track's anchor: *"I can charge $2,000 instead of $5,000 because I know exactly how much work I'm signing up for."* The sentence only lands if it names the quote this buyer is actually holding.

### 6.7 Worth saying up front

Eight `LabelRows`, gold leads, same component and same treatment as What you get. Consistency of the component beats the semantic hair-split about caveats in gold — settled on the platform page, inherited here.

**"No promise about who finds you"** is this track's translation of the no-ranking-promise row. The honest version for a portfolio is that the site is for the people already looking you up, and saying so is what makes the adjacent promises credible.

**"I don't make the work"** is the row most likely to save a project. A filmmaker who expects their reel re-cut as part of a website build is a dispute waiting to happen, and the row says the conversation is better had before the build than after.

### 6.8 FAQ

Nine questions in the existing `<details>` `Faq` idiom: no JS, keyboard-accessible for free, instant open and close which is also the correct reduced-motion behaviour.

**Two of them carry the page, and their wording names the anchor out loud** — "Why is this $2,000 when Squarespace is $20 a month?" and "Why is this $2,000 when an agency quoted me $5,000?" A buyer holding one of those two numbers will not read an answer addressed to the other, so neither question is allowed to be generic about price.

The template answer concedes the real case: if $20 a month is genuinely the better deal, Taylor says so on the call. The concession is what makes the rest of the answer believable.

**"If an AI can build it, why do I need you?"** is the price of naming the stack, and it is answered rather than deflected: the building is the fast part, and it is fast because the thinking happened first.

### 6.9 Close

"Ready?" is Taylor's word from the platform page and it opens this page's closing line too. One line, one button, contact block, legal entity.

---

## 7. States, responsive, accessibility

### State matrix

| Element | Default | Hover | Focus-visible | Other |
| --- | --- | --- | --- | --- |
| Door card (chooser) | flat spec-bg, hairline | border → gold at 34%, 1px lift, CTA text → `c3` | global 2px gold ring, 3px offset | reduced-motion: no lift |
| `GradientButton` (×3) | gold→white fill | `translateY(-1px)` + gold glow | global ring | n/a — links |
| `GhostButton` (mailto) | translucent card, faint gold border | border brightens, text → `c3` | same | n/a |
| `GradientRing` (price) | ring at 82%, base rotation | bg warms, 2px lift, ring accelerates | n/a (not focusable) | reduced-motion: ring holds |
| `<details>` FAQ row | `+` glyph | summary → `c3` | global ring on summary | open swaps glyph to `−` |
| Vercel / pricing links | gold, hairline underline | → `c3` | global ring | `target="_blank"` + `rel="noopener noreferrer"` |

Doors are `<a>` elements, so they are already inside the field's `INTERACTIVE` selector and fade the cursor-glow to zero on hover without an added attribute. Invariant 2, inherited rather than re-implemented.

**Empty states are structural, never messaged.** The case study is absent, not "coming soon." No testimonial → the block does not render. No shots → prose carries it. No live URL → no link. A section either has its content or does not exist.

**Reduced motion** is inherited whole: the field freezes, the ring holds its angle, the door lift is suppressed via `motion-reduce:hover:translate-y-0`. Nothing on either page animates on scroll, counts up, or moves ambiently.

### Responsive

| Breakpoint | Behaviour |
| --- | --- |
| `≥ 768px` | Chooser doors go two-up. Label/body rows go `240px 1fr`. Price card holds its 420px column. |
| `< 768px` | Doors stack, padding tightens to `p-5`. Every two-column row stacks. Hero stat row **stays 3-up** — three short values fit 375px and splitting them would break the one-glance read. |
| `< 375px` | Stat values reflow within their cells. No horizontal scroll anywhere. |

**The chooser was sized against a real 375×812 capture, not a guess.** Both doors' names, prices, and opening lines clear the fold. Copy was cut twice to get there.

### Accessibility floor

WCAG 2.2 AA, audited rather than assumed.

- No new colour was introduced on either page, so no new contrast risk was.
- Tap targets: door cards are full-card anchors far above 44px; CTAs and FAQ summaries inherit their existing sizes.
- `tel:` and `mailto:` links carry their number and address as visible text, never an icon alone.
- Chooser heading ladder is `h1` → door `h2`s, contiguous.
- **The coded page runs `h1` → `h3`, skipping `h2` while the case study is dark, and this is inherited rather than introduced.** `SectionLabel` is a `div` by design-system decision, so section titles are not headings; the only `h2` on either sales page is the case study's client name, which renders after the process steps on the platform page and not at all here yet. Skipping a level is **not** a WCAG 2.2 AA failure — 1.3.1 requires that headings be marked up as headings, which they are, and sequential levels are best practice rather than a success criterion. Recorded because the honest description of the audit is "passes AA, imperfect ladder," not "clean ladder." Fixing it properly means giving `SectionLabel` an optional heading element and applying it to **both** pages in one change; doing it only here would give two sibling pages different semantics for identical shapes, which is worse than the imperfection. Flagged as a follow-up in §9.
- Prices use tabular figures so the add-on column aligns without a table.
- Text scales to 200% without breakage: every column is `ch`-capped or fractional.

---

## 8. The copy standard

Both pages are held to Taylor's Human-Hand checklist, same as the rest of the site.

The platform page's first draft scored 41 em dashes across ~2,450 words and was cut to zero. **This draft was written at zero** rather than scanned down to it, along with no `X, not Y` antithesis scaffolding, no rhetorical triads, and no aphorism closers. The mechanical scan is a `grep`-level check and is worth re-running against `content/websites-coded.ts` and `content/websites-chooser.ts` after any copy edit.

Copy here is drafted in Taylor's register from his own sentences and rulings. **It is an armature for him to cut from, and his read-aloud pass is still his.**

---

## 9. Open items — flagged, not invented

Each was built on a labeled reversible default rather than left broken. Every one of these is Taylor's call.

| # | Item | What shipped | Cost of changing it |
| --- | --- | --- | --- |
| a | **Slugs** — `platform` and `coded` | Both live | One `git mv` plus a grep of `websiteRoutes` while nothing external links here. Cheap now, dead links later. **Close this first** — the intake thread's routes depend on it. |
| b | **tayloraucoin.com as the demo** | Not claimed. The page's craft argues it silently. | One paragraph. Flagged because an explicit claim invites the job-search audience collision the sibling spec guards against. |
| c | **Full-build timeline** | First-look only, with the process and FAQ stating plainly that the total depends on revision rounds. | One number, one sentence. |
| d | **Discovery** | `noindex`, hero written for the pre-warmed arrival. | Metadata one-liner, but the hero would want rewriting for a cold reader. |
| e | **Vercel terms treatment** | On-page qualifier plus a link to Vercel's pricing, in §6.4. **No repo legal edits made.** | Note for Taylor: Vercel's Hobby tier is non-commercial by their ToS. Whether a working creative's portfolio sits inside that line is a call worth making deliberately, and it is the same conversation as the intake thread's open item on terms coverage for this track. |
| f | **Admin panel $500** | **Closed, published.** Ruled a live add-on by Taylor 2026-08-26 (`M-PORT-6`, "admin panel is an upsell right now"), seeded active and `offeredAtCheckout: true`. Now on the page, in the checkout's own row order. Its row keeps the catalogue copy's "most people do fine without it" clause, which is load-bearing rather than modest: a $500 login sold directly beneath a page arguing that a written guide gives you control without a subscription reads as an admission the guide is insufficient, unless the row says otherwise. The same qualifier now closes the "can I change it myself" FAQ answer. |
| f2 | **Care plan $100/mo** | **Closed, withheld.** Not a pending signature any more — Taylor ruled it out of v1 outright (`M-PORT-6`, "don't charge for the maintenance care plan until it's done"). Seeded inactive, sells nowhere, and no recurring code ships. This matches his standing pattern (`WEBSITES-PAGE-SPEC.md` §8: a direction, not yet an offer). Commented slot in `content/websites-coded.ts` shows what to add when its scope settles. |
| g | **Chooser chrome and gradient budget** | Full site furniture, zero gradient. | Both reversible in one file. |
| h | **Claude Code named on the page** | Named, with the FAQ answer that names it. | Removing it means removing the editing guide from the deliverables, which would cost the offer its differentiator. |

### Also open, not decided here

| Item | State |
| --- | --- |
| **Trading entity for this track** | The page closes as `Agora Network Technologies Inc.`, matching the platform track and the Stripe account. `[ASSUMPTION]` — nothing in the brief states whether the coded track sells under the same entity. One string in `content/websites-coded.ts` if not. |
| **Case study** | Structure built, `published: false`, renders nothing. Fills when Kryshan's site exists **and he consents**. `testimonial` stays null until a real person says a real thing. |
| **Coded intake route** | **Shipped.** `/websites/coded/intake` landed in a parallel thread (`M-PORT-7`), and every CTA on this page now points there via `showcaseIntakeRoutes.start`. Copy that assumed a call was the mandatory next step (`heroNote`, two FAQ answers, the mid-page `StartCta` line, `closing.line`) was rewritten to assume the questionnaire instead; a call is still offered as the secondary CTA everywhere the platform page offers one. |
| **Refund sentence for this track** | Taylor, per the intake tech scope §10. `D-INT-10` covered $600, not $1,900. |
| **Heading ladder** | Both sales pages skip `h2` (see §7). Not an AA failure. Fixing it means an optional heading element on `SectionLabel` applied to both pages at once, threaded through `Process`, `Changes`, and `Pricing`. Small, shared, and deliberately out of this scope because it edits the platform page. |

---

## 10. Verification performed

- `npx eslint` clean across all fourteen new and modified files.
- `npx tsc --noEmit`: **no errors in any file in this scope.** The repository does not currently typecheck as a whole, because the parallel intake thread is mid-refactor in `lib/intake/steps.ts` and `server/services/*` (M-PORT-1 moving step identity to `lib/intake/tracks.ts`). Those errors predate and are unrelated to this work.
- Both pages rendered in the browser at 375×812 and at desktop width, console clean.
- Chooser worst-moment check at 375px: both doors clear the fold.
