# The `/websites` chooser and the coded-track sales page — execution scope

Author: Vesper (scoping pass, 2026-08-26). Status: **ready for execution.** Taylor answered the handoff's open questions by voice note; his answers are folded in below and marked where they supersede the primer. What he did not answer is in §8, each with a labeled reversible default — build on the default, never silently invent past it.

**Document authority.** Register and what Taylor has rejected → [`../TASTE-PROFILE.md`](../TASTE-PROFILE.md). Tokens and visual law → [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md). The existing page's laws → [`WEBSITES-PAGE-SPEC.md`](WEBSITES-PAGE-SPEC.md), inherited wholesale unless this file says otherwise. The product being sold → [`portfolio-intake-questions-v2.md`](portfolio-intake-questions-v2.md) and [`PORTFOLIO-INTAKE-UX-SCOPE.md`](PORTFOLIO-INTAKE-UX-SCOPE.md). The original brief → [`portfolio-marketing-handoff-prompt.md`](portfolio-marketing-handoff-prompt.md); where that primer and this file disagree, **this file wins — it is the primer plus Taylor's rulings.** Repo law → `CLAUDE.md`, including the one rule: unspecified design decisions mean stop and ask.

**Executor's first hour, in order:** `WEBSITES-PAGE-SPEC.md` → `content/websites.ts` read aloud → `TASTE-PROFILE.md` → `portfolio-intake-questions-v2.md` → this file again. Do not draft a line of copy before that pass.

---

## 1. Deliverables

1. **Route move** — the existing `/websites` sales page relocates whole to its new slug (§3). Content unchanged. Mechanical.
2. **The chooser** — a new page at `/websites`: two doors, one glance, no scroll. Spec in §5.
3. **Coded-track sales page spec** — a new section appended to `WEBSITES-PAGE-SPEC.md` or a sibling spec file (executor's call; sibling file recommended, cross-linked), in the same shape: frame, placement, gradient budget, section order with rationale, per-section specs, state matrix, open items flagged.
4. **Content draft** — `content/websites-coded.ts` (name per §3 vocabulary) in the `content/websites.ts` idiom. This is Taylor's armature to cut from, in his register from the first line, never a lorem pass.
5. **Page build** — the coded-track page composed from existing `/websites` components and idioms. New components only where §5/§6 name one.
6. **Report** — what shipped, what is behind a flag, the §8 items restated with what was assumed.

Work them in that order. 1 and 2 are shippable without 3–5; do not hold the chooser hostage to the new page's copy.

---

## 2. Decisions ratified — including Taylor's voice-note rulings

Numbered R-1…; cite these when a choice is questioned.

- **R-1 · Naming is by deliverable, not by buyer.** **Supersedes primer decision 1.** Taylor's ruling: some professions could plausibly buy either track, and what actually differs is the deliverable — one is a site on a managed platform handed over self-serve, the other is a coded thing. Each door names **what the deliverable is**, then says who it is most applicable for. Still no coined product names; descriptive and plain.
- **R-2 · The existing page moves whole and does not change.** No copy edits, no section changes, nothing beyond what the new URL mechanically requires. It is shipped and twice revised; leave it alone.
- **R-3 · The Durable intake does not move and does not change.** `/websites/intake` stays exactly where it is (`INTAKE_PREFIX` in `lib/routes.ts` untouched). Cost accepted: trimming `/websites/intake` back now lands on the chooser instead of the track-A sales page — one more click, which Taylor has explicitly accepted for every pre-warmed prospect ("they just have one more click").
- **R-4 · The chooser ships ungated.** Live track-A prospects who were given `/websites` land on the chooser and click once. No feature flag, no interstitial, no redirect period.
- **R-5 · Price is $2,000 CAD + GST**, half to start and half before launch, or $1,900 paid in full. Published.
- **R-6 · The stack is named on the page:** built in code — Next.js, hosted on Vercel; Supabase if a build ever needs a database (in v1 scope nothing does; the base offer is static, no database — name Supabase only where a database is actually in play, e.g. the admin-panel add-on's description, not in the hero).
- **R-7 · The $0/month claim is Vercel's, not Taylor's.** **Supersedes the primer's `$0/month, forever` hero cell.** Taylor will not personally promise free hosting forever; free is Vercel's Hobby-tier fact. The page states hosting lands on Vercel's free tier, **links to Vercel's own pricing/terms**, and the terms treatment (§8-e) makes clear the client is being set up on Vercel's tier under Vercel's conditions. No sentence on the page may read as Taylor underwriting $0 in perpetuity.
- **R-8 · Five pages included; project detail pages do not count against the five.** Extra top-level pages $150 each. Published.
- **R-9 · No case study at launch.** The slot is built structurally — `published` flag, `testimonial` null until a real quote exists, media independently absent-able, exactly the Clean Coast pattern — and stays dark until Kryshan's site exists and he consents. Nothing on the page says "coming soon"; the section simply does not render.
- **R-10 · ~~Future chooser enhancement, out of scope~~ — SUPERSEDED, BUILT 2026-08-26.** Originally reserved: a describe-what-you-do input routed through a model. Taylor then asked for it directly, and it shipped as a **deterministic picker** rather than a model call — "Not sure which one?" after the cards, opening a list of jobs, each mapping to a fixed verdict. Better than the original idea on every axis that matters: someone who just failed to place themselves does not want to compose a sentence, a list answers faster than a text field, the result is instant, nothing can come back weird, and it costs nothing to run. Collapsed by default so the doors keep their fold. `either` is a real verdict for the professions that genuinely fit both, and it says so rather than guessing. Spec: `CODED-PAGE-SPEC.md` §5.1.
- **R-11 · Everything the primer lists as trust architecture transfers:** three-stat hero row · price at position six · start CTA three times with the door-in-the-wall after the price · the note under the button that makes it safe to press · changes tiers ($500 / $250 / free for Taylor's own mistakes, 14 days) and the three rules · honest limits before the FAQ · the load-bearing why-this-price FAQ · structural empty states · one `GradientRing` per sales page, on the price card.
- **R-12 · Both new pages are `noindex, nofollow`**, same as today, per the standing distribution model (§8-d holds the open question about later).

---

## 3. Naming, routes, vocabulary

Taylor rejected both `service-based` and `portfolio` as public slugs (R-1). Slugs are not yet ratified. Proposed, one recommendation each, cost-of-wrong low (redirects are cheap while nothing has shipped):

| Track | Today | Proposed slug | Door names the deliverable as |
| --- | --- | --- | --- |
| A (Durable) | `/websites` | `/websites/platform` `[PROPOSED — Taylor ratifies]` | a site on a managed platform, handed over with the dashboard and training — you run it yourself, no code |
| B (showcase) | — | `/websites/coded` `[PROPOSED — Taylor ratifies]` | a site built in code — you get the repo, your own accounts, and a guide to changing it |

Rejected alternatives, so they are not re-proposed: `custom` (implies a basic-vs-premium ladder over track A — the exact poison primer decision 1 was guarding against, and the one part of that decision that survives Taylor's override) · `service-based`/`portfolio` (Taylor, voice note) · coined names (site register).

**Vocabulary law (standing, from the intake handoff):** internal identifiers never say "portfolio" — the codebase's internal track key is `showcase` (`M-PORT-1`). Public slugs are whatever Taylor ratifies above. Content file: `content/websites-coded.ts` under the proposed slug; rename with the slug if it changes.

**Coordination with the intake thread (do this before either thread ships routes):** `PORTFOLIO-INTAKE-TECH-SCOPE.md` §4 (M-PORT-2) currently routes the new track at `/websites/portfolio/intake` with `/websites/portfolio` redirecting to `/websites`. Under R-1 that becomes `/websites/<slug-B>/intake` nested under the new sales page, and the redirect stub dies the day the sales page exists. One thread owns the rename; tell the other. The trim-back law (a trimmed URL lands on an explainer, never a 404) is why track B's intake nests under its sales page even though track A's stays put (R-3).

**Route-move mechanics (deliverable 1):** move `app/websites/page.tsx` to `app/websites/<slug-A>/page.tsx` unchanged except its own doc comment; `/websites/intake`, `/websites/terms`, `/websites/privacy` do not move (R-3; `legalRoutes` untouched). Grep for hardcoded `/websites` links in components and content before assuming there are none. The chooser takes over `app/websites/page.tsx`. No redirect from `/websites` needed — the URL keeps working, it just grew a door.

---

## 4. The one job of each page

**Chooser:** get the right person through the right door in under five seconds, on a phone, in a driveway. The least-resilient user here is the trades buyer post-phone-call; the coded-track buyer arrives calmer, by DM'd link. Design the worst moment first: the trades buyer must find their door without reading the other one.

**Coded-track page:** the central design fact from the primer stands — **the page's own craft is the proof.** A filmmaker deciding whether Taylor can make something beautiful is judging the page they are standing on. This raises the stakes on restraint, not ornament; the drift test applies double, and the gradient budget is not an invitation.

---

## 5. Chooser spec

- **Furniture:** `RootField`, `SiteHeader`, `Footer`, 1080px max width, same padding rhythm — it must read as part of tayloraucoin.com, same reasoning as the existing page's §3. `[PROPOSED]` since the primer never specced chrome; the cost of wrong is one wrapper edit.
- **Structure:** short plain heading (not the track-A hero h1 — that moved with its page), then **two doors**. Each door: deliverable name in display type · two or three lines saying what the deliverable is · one line saying who it is most applicable for · the price as a plain stat (`$1,200` / `$2,000`) so self-selection can happen on money alone when it needs to · the whole card is the link. No CTA button inside a card that is itself a button.
- **No scroll on a 375px phone** for the doors themselves — heading plus two stacked doors above the fold, or near enough that both doors are visible without a deliberate scroll gesture. Footer may sit below.
- **Gradient budget: zero.** No `GradientRing`, no `GradientButton`. Doors are flat `--color-spec-bg` with hairlines; hover brightens border and lifts 1px per the site's card idiom; `data-interactive` so the field glow yields (invariant 2). The chooser must never out-dress the pages behind it. `[PROPOSED — Q8 default, unanswered]`
- **Order:** track A first. Its buyer is the one under time pressure and the one who was told this URL on a phone call; the coded-track buyer was DM'd a link and can read past one card.
- **States:** doors are links — default, hover, focus-visible (global 2px gold ring) only. Reduced motion: no lift. Empty/loading/error do not exist on a static page.
- **Copy:** drafted by the executor in register, scanned (§9), cut by Taylor. Door copy is the highest-leverage copy in this scope per word; budget accordingly.
- **Metadata:** `noindex, nofollow`; title along the lines of "Websites" (plain).
- **One new component maximum** (the door card), and only if no existing card idiom composes cleanly. Everything else exists.

---

## 6. Coded-track page spec — the deltas

Inherit `WEBSITES-PAGE-SPEC.md` structurally: same furniture, same width and rhythm, same section-label idiom, price at position six, CTA three times, `<details>` FAQ, close on one short line. The full per-section spec is deliverable 3; what follows is what is *different*, decided here.

**Section order:** Hero → What you get → How it goes → Ownership (promoted, see below) → Case study slot (dark at launch, R-9) → What it costs (the ring) → Start door-in-the-wall → Changes after the build → Worth saying up front → FAQ → Close.

- **Hero stats:** `$2,000` (CAD + GST) · `first look in 3 days` · third cell is the hosting surprise **reframed per R-7** — the value is `$0/mo` with a label that attributes it (e.g. value `$0/mo`, label "hosting, on Vercel's free tier"), and the pricing section carries the link to Vercel's terms plus the plain-language sentence about whose tier it is. Exact wording is the executor's draft, Taylor's cut. Whether "first look in 3 days" or a full-build number leads is §8-c.
- **Ownership promoted to thesis.** Its own section, not a passage inside pricing. "If you ever want to fire me, you keep everything" is literal on this track: the repo, their own Vercel and domain accounts, a style guide, and a written guide to editing the site with Claude Code by describing the change. No subscription anywhere. This is the differentiator against both the $20/month platforms and the $5,000 agency, and it gets the structural emphasis the existing page gives the process.
- **The taste-extraction step gets the depth** the existing page spends on step 03 — the taste gallery (roughly two dozen real portfolio sites, favourites + notes + ranking, "choosing a template, except it extracts *why*"), the paste-anything credits importer, voice-note-driven copy. This is the page's proof a system exists. Source the process facts from `portfolio-intake-questions-v2.md`; do not invent steps.
- **Claude Code is named.** `[PROPOSED — recommend yes, Taylor confirms]` The platform-name-last law was track A's sales-motion protection; on this track the tool is part of the deliverable (the editing guide) and Taylor has named it freely to clients. The "so why do I need you" question this invites goes in the FAQ, answered honestly.
- **No AI-employees section.** The editing guide is that story here.
- **FAQ answers the price from both anchors,** and names which anchor each answer serves: vs. $20/month template platforms (you get code you own, a design extracted from your taste, no subscription ever) · vs. the $5,000 agency quote (fixed scope, a questionnaire replacing the meetings, nobody staying in the middle of your hosting).
- **Honest limits, this track's flavour:** no web apps or e-commerce · video lives on Vimeo/YouTube embedded, and that is part of what keeps hosting free · Taylor doesn't cut reels, retouch photos, or produce media — the site presents the work · the client confirms they have the right to show what they show · timelines pause while waiting on the client · no promise about who finds you — this site is for the people already looking.
- **DNS cutover with redirects preserved** is worth a named line in the process — old sites carry years of inbound links (Kryshan's has nine), and "your old links keep working" is a competence signal this audience actually checks.
- **Start CTA target:** the showcase intake at `/websites/<slug-B>/intake` once the intake thread ships it. If this page is ready first, the interim CTA is contact (email/booking) — never a dead link, never "coming soon." State which mode shipped in the report.
- **What is published vs. withheld on the pricing card:**

| Item | Status |
| --- | --- |
| $2,000 + GST · half/half · $1,900 in full | published (R-5) |
| Extra pages $150; project detail pages free of the count | published (R-8) |
| Logo/wordmark refresh $250 · booking setup $250 | published (catalogue-ratified) |
| Admin panel $500 | **published** — ruled a live add-on 2026-08-26 (`M-PORT-6`) |
| Care plan $100/mo | **withheld** — ruled out of v1 entirely (`M-PORT-6`), not merely unsigned |
| Changes tiers $500/$250/free-14-days | published (R-11) |
| Hosting $0/mo | published **as Vercel's tier, linked** (R-7) |

- **Gradient budget:** the page's one `GradientRing` on the price card, `GradientButton` on the CTAs, eyebrow hairline. Nothing else. Same table shape as the existing spec §3.

---

## 7. What the executor must not do

- Invent a value for anything in §8. Surface it, or build on the labeled default and restate it in the report.
- Edit track-A copy, the Durable intake, or `content/websites.ts` (beyond, if truly required, a pointer comment).
- Publish a price, timeline, or scope sentence not in §2/§6's published set.
- Add a component that duplicates an existing one with a small difference; add any second ring to any page.
- Write copy that fails the Human-Hand scan (§9). Starting at zero em dashes is cheaper than removing 41.
- Touch `INTAKE_PREFIX`, `legalRoutes`, or anything in the intake machine — that is the other thread's floor.

---

## 8. Open items — flagged, not invented

| # | Item | Default to build on | Who closes it |
| --- | --- | --- | --- |
| a | Slugs for both doors (§3) | `platform` / `coded` | Taylor, before merge — renames are one `git mv` + grep now, dead links later |
| b | Is tayloraucoin.com itself claimable on-page as the demo ("the site you're reading was built the same way")? Voice note did not address it. | **Do not claim it.** The page's craft argues it silently; an explicit claim invites the job-search audience collision the existing spec guards. | Taylor |
| c | Full-build timeline number. "First look in 3 days" is committed; a page with one timeline number reads as hiding the second. | Publish first-look only, and have the process's revision step say plainly that total time depends on feedback rounds and pauses while waiting on the client — the honest shape of the missing number. | Taylor |
| d | Discovery: does track B stay noindex forever, or eventually go public? Changes what the hero must do cold. | noindex (R-12); hero written for the pre-warmed DM arrival. | Taylor, later — not blocking |
| e | Terms treatment for the Vercel free-tier framing (R-7): a linked line on the page, a `/websites/terms` addition, or both. Note for that decision: Vercel's Hobby tier is non-commercial by ToS; whether a working creative's portfolio stays inside that line is Taylor's call to have made, and the intake thread's open item on terms coverage for this track (`PORTFOLIO-INTAKE-TECH-SCOPE.md` §10) is the same conversation. | On-page link to Vercel's pricing/terms beside the hosting line, phrased as "you're on Vercel's free tier, under Vercel's terms." No repo legal edits without Taylor. | Taylor |
| f | ~~Admin panel $500 and care plan $100/mo — ratified for publication?~~ **CLOSED 2026-08-26 (`M-PORT-6`).** Admin panel is a live $500 add-on and is now on the page; the care plan is ruled out of v1 outright rather than left unsigned, so it stays off. | Built as ruled. | Closed |
| g | Chooser gradient budget and chrome (§5's two `[PROPOSED]` rows) | As specced: zero gradient, full site furniture. | Taylor, at review |
| h | Claude Code named on-page (§6) | Named, with the FAQ answer. | Taylor, at review |

---

## 9. Verification — every deliverable, before report

1. `yarn build` · `npx tsc --noEmit` · `yarn lint` (Yarn 4 — never npm; CLAUDE.md's `npm run build` line predates the switch).
2. **Human-Hand scan** on every new copy string: the checklist at `~/Documents/Professional/Job Search/human-hand-mode.md`. Mechanical pass first — `grep`-count em dashes (target: zero), `", not "` antithesis constructions (only where a rule is genuinely being stated), triads, aphorism closers, soft-banned vocabulary. Then a read-aloud-shaped pass for metronome rhythm. Taylor's own read-aloud is still his; the scan is the executor's floor, not his ceiling.
3. **375px phone check** on the chooser (both doors visible, no horizontal scroll) and on the coded page's stat row and pricing card.
4. **Reduced-motion and focus-visible** spot-check on the doors and the ring — both inherited behaviours; verify inheritance, don't re-implement.
5. **Track-A regression:** the moved page renders byte-identical at its new URL (diff the HTML if in doubt); `/websites/intake` still resumes, still pays, untouched.
6. Report per deliverable 6, restating every §8 default that was built on.
