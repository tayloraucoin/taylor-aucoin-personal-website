# Handoff — the `/websites` chooser and the portfolio sales page

**From:** Vesper + Mason (scoping thread) · **To:** Vesper (marketing-page thread)

You are receiving this primer and the repo. Your deliverable is a **proposal** — the chooser page and the portfolio sales page as specs plus drafted content, in the shape of `docs/websites/WEBSITES-PAGE-SPEC.md` and `content/websites.ts`. Before drafting, ask Taylor the open questions at the bottom in one batched message; several of them fork the work. Taylor writes final copy himself — your draft is the armature he cuts from, held to his register from the first line, never a lorem pass he must rescue.

## What this is

Taylor sells two website builds under one roof. Track A, live today at `/websites`: Metro Vancouver service-business sites on a managed platform, $1,200, 3–7 days, the platform never named on the page. Track B, new: bespoke portfolio sites for creatives, built in real code by Claude Code, $2,000 base ($1,000/$1,000 split, or $1,900 paid in full at 5% off), static Next.js + TypeScript on Vercel, no database, hosting near zero. First client: Kryshan Randel, filmmaker (director/camera/editor/teacher), at $1,600 as trial client. Both tracks feed the same intake system; the portfolio intake is specced in `docs/websites/portfolio-intake-questions-v2.md` and is being built in a parallel thread — read it for what the process actually is, because the sales page describes it.

## Read before drafting — in this order

1. `docs/websites/WEBSITES-PAGE-SPEC.md` — the existing page's spec. This is your strongest precedent: frame, register, gradient budget, section rationale, copy standard, the two-audience mechanism. Its laws are inherited unless this primer or Taylor says otherwise.
2. `content/websites.ts` — the shipped copy. Read it aloud. This is the voice.
3. `docs/TASTE-PROFILE.md` and `docs/DESIGN-SYSTEM.md` — what Taylor has rejected, and the token law.
4. `docs/websites/portfolio-intake-questions-v2.md` — the product you are selling. The taste gallery, "Sort this for me," the payment screen with its add-ons, the nine steps.
5. `CLAUDE.md` — the one rule: unspecified design decisions mean stop and ask. And the Human-Hand copy standard: the site was once flagged as reading AI-written; the existing page went from 41 em dashes to zero. Yours starts at zero.

## Decisions already ratified — build on these, do not relitigate

1. **Naming is by buyer, not platform.** "Platform-hosted / code-hosted" was considered and rejected: buyers self-select by identity, and platform labels create a basic-vs-premium ladder that poisons the $1,200 track. Doors say who each build is for. No coined product names — descriptive and plain, per the site's register.
2. **URLs:** `/websites` becomes the chooser · the existing page moves whole to `/websites/service-based` · the new page is `/websites/portfolio`. Future categories become sibling audience-named doors. Internally, "portfolio" collides with the codebase's name for tayloraucoin.com itself — public slug stays, internal keys differ (already recorded in the intake handoff).
3. **The chooser must be effectively instant.** Track A's sales motion is a phone call ending in "go to tayloraucoin.com/websites" — every pre-warmed trades buyer now pays one extra click, and the chooser design is what makes that cost acceptable. Two doors, one glance, no scroll, no cleverness. The least-resilient user on it is the trades buyer on a phone in a driveway; the portfolio buyer arrives calmer, by DM'd link. Design the worst moment first.
4. **The existing page's content does not change** beyond what the move to `/websites/service-based` mechanically requires. It is shipped, scanned, and revised against Taylor's feedback twice. Leave it alone.
5. **Commercial facts for the portfolio page** — these are the offer, not suggestions: $2,000 CAD + GST · half to start, half before launch, or $1,900 in full · first look within 3 days · five pages included, project detail pages don't count, extras $150/page · $0/month ongoing (Vercel hosting near-free, video embedded from Vimeo/YouTube, no platform fee at all) · add-ons: admin panel $500 [PROPOSED], logo/wordmark refresh $250, booking setup $250, care plan $100/mo [PROPOSED] · changes after build carry the existing tiers ($500 standard / $250 small / free for Taylor's own mistakes, 14 days) unless Taylor says otherwise · the deliverable includes the repo, the client's own accounts, a style guide, and a written guide to editing the site with Claude Code.
6. **The process the page describes** (from the intake spec): questionnaire with the taste gallery (roughly two dozen real portfolio sites, favourites + notes + ranking — "choosing a template, except it extracts *why*"), a paste-anything credits importer, voice-note-driven copy, build, first look in 3 days, revision, DNS cutover with redirects preserved (old sites often carry years of inbound links — Kryshan's has nine), handoff with the editing guide.

## The central design fact for the portfolio page

On the existing page, **the system is the proof** — a tradesperson reads "brand extraction → primer → verification" and hears competence. On the portfolio page, **the page's own craft is the proof.** A filmmaker deciding whether Taylor can make something beautiful is judging the page he is standing on; the site's design system is the demo, and every choice on this page is a work sample. This raises the stakes on restraint, not on ornament — the drift test applies double, and the gradient budget is not an invitation.

What transfers from the existing page because it is trust architecture, not trades content: the three-stat hero row answering cost / speed / ownership in one glance · price at position six, earned, not second · the start CTA three times with the door-in-a-wall after the price · the note under the button that makes it safe to press · changes tiers and rules · honest limits before the FAQ · the load-bearing "why this price" FAQ · empty states that are structural, never "coming soon" · one GradientRing per page, on the price card.

What changes:

- **The ownership passage is promoted to thesis.** "If you ever want to fire me, you keep everything" is *literal* on this track — a repo, their own Vercel and domain accounts, and a guide that teaches them to change the site by describing the change. No subscription anywhere. This is the differentiator against both the $20/month template platforms and the $5,000 agency quote, and it deserves the page's structural emphasis.
- **The taste-extraction step gets the depth** the existing page spends on step 03 — it is this page's proof that a system exists rather than a workflow.
- **The AI-employees section has no equivalent and is omitted.** The Claude Code editing guide is that story here.
- **The FAQ must answer the price question from both directions:** why $2,000 when Squarespace is $20/month (you get code you own, a design extracted from your taste, and no subscription, ever) and why $2,000 when an agency quoted $5,000 (fixed scope, a questionnaire that replaces the meetings, and no one staying in the middle of your hosting). Portfolio buyers arrive holding one of these two anchors; name which one each answer serves.
- **Honest limits, track-B flavour:** no web apps or e-commerce · video lives on Vimeo/YouTube, embedded, and that is what keeps hosting near-free · Taylor doesn't cut reels, retouch photos, or produce media — the site presents the work, it doesn't make it · rights: the client confirms they may show what they show · timelines pause when waiting on the client · the no-ranking-promise row translates to no promise about who finds you — this site is for the people already looking.
- **The case-study slot follows the Clean Coast pattern:** published flag, testimonial null until a real quote exists, media independently absent-able. Kryshan's site fills it when it exists and he consents.

## Open questions — ask Taylor these before drafting, in one message

1. **Evidence before Kryshan ships.** The page launches with no track-B case study. Is tayloraucoin.com itself claimable as the demo ("the site you're reading was built the same way") — and does he want that said explicitly, given this page sits on the very site his job-search audience must not stumble through?
2. **Name Claude Code on the page?** The existing page's law is platform-name-last. On this track the tool is part of the deliverable (the editing guide) and Taylor named it freely to Kryshan in DMs. Naming it invites "so why do I need you" — which the FAQ can answer honestly, as the existing page's version does. Recommend naming it; confirm.
3. **Total build timeline.** First look in 3 days is committed. Is there a full-build number he'll publish (the existing page commits 5–7 business days)? A page with one timeline number reads as hiding the second.
4. **Discovery.** Both pages are noindex today; the whole distribution is URLs Taylor hands out. Does the portfolio track keep that model, or does he want this page public and indexable eventually? This decides nothing visual but changes what the hero must do cold.
5. **The two [PROPOSED] prices** — admin panel $500 and care plan $100/mo. The existing page's law: never publish a recurring charge without stated scope (the $250/mo Durable care plan is deliberately absent for exactly this reason). The v2 intake copy gives the portfolio care plan a stated scope ("email me a change, live within 48 hours, software kept current") — does he ratify both numbers for publication, or do they stay checkout-only?
6. **Chooser stakes.** Are there live track-A prospects mid-funnel who were given `/websites` and would now land on the chooser? Decides whether the move ships behind anything.
7. **Hero stats.** Recommend `$2,000 · first look in 3 days · $0/month, forever` — the third cell is the surprise, same mechanism as the existing page's `$0`. Confirm the three, especially whether "3 days" or a full-build number leads.
8. **Ring budget across three pages.** Recommend: each sales page keeps its one ring on its price card; the chooser gets none — doors are flat, and the chooser must never out-dress the pages behind it. Confirm.

## Working method

- Spec first, in the shape of `WEBSITES-PAGE-SPEC.md`: frame (who arrives, in what state), placement, gradient budget, section order with rationale, per-section specs, states, open items flagged not invented. Then content drafts in the `content/websites.ts` idiom.
- Reuse the existing page's components and idioms wherever they fit — the two pages must read as siblings, and every new component is a liability. The chooser is likely one new, very small thing.
- The Human-Hand scan runs on your draft before Taylor sees it: no em-dash pile-ups, no antithesis scaffolding, no triads, no metronome. His read-aloud pass is still his.
- One recommendation per fork, tradeoff named. Anything touching price, timeline commitments, or what the offer includes routes to Taylor for ratification — those are his one-way doors, not yours.

The page you are matching ends on "Ready?" — one word, his. Aim for work that sits beside it without a seam.
