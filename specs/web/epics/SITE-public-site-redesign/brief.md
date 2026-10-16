---
epic: SITE
status: draft
---

# Brief — the public-site redesign

> **Who fills:** Compass, with Taylor, at Frame on 2026-10-15. Hearth checked the framing; Vesper checked the page list.
> **When:** before the UX intent pass. Approved at "Frame go" by Taylor, 2026-10-15.
> **Lives at:** `specs/web/epics/SITE-public-site-redesign/brief.md`.
> **Rules:** the template keeps solution vocabulary out of a brief. The Frame prompt asks this brief to fix the sitemap and each page's section order, and the session's instruction outranks the template (precedence rung 2 over rung 5). So the page list and section order are here as scope. Layout, components and words are not; the UX and Design levels own them.
> **Evidence labels:** verified (read in a named file or said by Taylor in this thread), secondary (reported by a source we did not check), judgment (a role's call).

## Job

- **Trigger:** a founder, CTO or head of product has the site open from a link or an application and asks, in their words, "what would this person own on my team next month?" They give it "one minute per application review" (PostHog, audience §1; verified).
- **Baseline:** today they land on a home page ordered Hero · Capabilities · Specialties · Testimonials · Selected work · Signal (`app/page.tsx`; verified). The shipped products and the decisions behind them sit fifth. The offers still say "Contract senior/staff engineer" and the stat says "9.5" years (`content/services.ts`, `components/sections/Signal.tsx`; verified), while the brand layer that landed on this branch says Product Engineer and "since 2016" (value decisions 1 and 7; verified). A contact said the site's copy reads machine-written (memory: human-hand copy standard; secondary). What goes wrong: the one-minute reader meets a capability list before any shipped work. Long tech lists and breadth with no visible depth are what stop this reader (audience §6; verified and secondary).

## User

- **Primary (Segment 1):** founders, CTOs and heads of product at founder-led, seed-to-Series-B, AI-native product companies, hiring a Product Engineer full-time, on contract or as a fractional CTO. Time-poor and sceptical of AI-polished applications. Usually on a laptop between other tabs, sometimes on a phone from a LinkedIn message. They are checking one thing: what has he shipped end to end, and can he explain the decisions? (audience §1, §6; verified)
- **Secondary (Segment 2):** founders and professionals buying a coded website or a 0→1 build. Wary, sometimes embarrassed about not being technical, afraid of lock-in. They need ownership in writing, a fixed price and time, and live examples (audience §6; verified and secondary). They have their own path at `/websites` and never compete with Segment 1 for the home page.
- **Light (Segment 3):** learners and peers who come for the writing. Served by the notes signup and `/about` only.

### Who each page serves, and its one action

All confirmed by Taylor in this thread (rounds 1, 2 and 4).

| Route                                                | Serves                                                                    | One action                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `/`                                                  | Segment 1                                                                 | Book a 30-minute call. Opening a decision story is the secondary path |
| `/work` (new)                                        | Segment 1, checking depth                                                 | Open a case study                                                     |
| `/work/[slug]`                                       | Segment 1, inside one story                                               | Book a 30-minute call                                                 |
| `/about`                                             | Segment 1, deciding on the person; Segment 3 reads it too                 | Book a 30-minute call                                                 |
| `/services` (Work with me)                           | Segment 1 at the hiring door; Segment 2 build buyers at the building door | Book a 30-minute call, from both doors                                |
| `/websites`, `/websites/coded`, `/websites/platform` | Segment 2 site buyers                                                     | Start the coded-site intake                                           |
| `/capabilities`                                      | Segment 1, the reader who wants the whole list                            | Open the case study a card proves                                     |

## Scope

### Sitemap

| Route                                                | In this epic                                         | Source                                     |
| ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------ |
| `/`                                                  | Redesigned                                           | Builder proposal; confirmed rounds 1, 4, 5 |
| `/work`                                              | New                                                  | Builder proposal; groups confirmed round 4 |
| `/work/[slug]`, all six case studies                 | Redesigned                                           | Builder proposal; shape changed round 5    |
| `/about`                                             | Redesigned; absorbs `/testimonials` and `/stack`     | Rounds 2.2, 2.3                            |
| `/services` (Work with me)                           | Redesigned                                           | Builder proposal; doors confirmed round 4  |
| `/websites`, `/websites/coded`, `/websites/platform` | Redesigned                                           | Builder proposal                           |
| `/capabilities`                                      | Kept, restyled, linked from `/work`                  | Round 2.1                                  |
| `/testimonials`                                      | Retired; redirects to `/about`                       | Round 2.2                                  |
| `/stack` and its intercepting modal                  | Retired; redirect to `/about`                        | Round 2.3                                  |
| `/privacy`, `/websites/privacy`, `/websites/terms`   | Restyled only: new tokens, no layout or content work | Round 2.4                                  |
| The intake flows under `/websites/*/intake`          | Tokens only                                          | Settled in the prompt                      |

### Each page, in order

**Home `/`** (order confirmed, round 5.1)

1. Header: the call button and the theme toggle.
2. Hero: the headshot, the "Product Engineer" label, the name, the essence line, the 25-word line, two actions (book a call; see the work).
3. Proof strip, four numbers, each traced (round 5.2):
   - "Since 2016": value decision 7. Replaces the "9.5" years stat.
   - Twelve products taken from zero to one: `lib/config.ts`, `components/sections/Signal.tsx`.
   - Fourteen BCIT cohorts: `components/sections/Capabilities.tsx`.
   - Five production apps in six weeks: `content/work/family-office-platform.ts`.
4. Three decision stories (problem / decided / happened, a real artifact, a live link): Conscious Connections, Everbook, the family office. The family office has no live link; its architecture diagram is the artifact, and Bruno's named quote stands in for the link (round 3.4, judgment).
5. How I work: the path, stopping at scope, build, ship, measure, iterate (round 5.4; value decision 2). Launch and funnel work never appears on home. With it, the "what I let AI do / what I check" block.
6. Named testimonials.
7. Four ways to work together: full-time role · contract engineer · 0→1 build · fractional CTO. Then one plain line to `/websites` (round 4.4). Branding stays on Work with me.
8. Notes signup block. No `/notes` page until a first post exists.
9. Footer.

The one-minute answer has to be complete by the end of the first decision story (Vesper's check, judgment).

**Work `/work`** (new)

- Grouped as Full-time · Contract and fractional · My own products (round 4.2, confirmed by Taylor):
  - Full-time: Calculate by QxMD, Everbook, Roomvy.
  - Contract and fractional: the family office.
  - My own products: Conscious Connections, Agora.
- Rows open into case studies.
- Links to `/capabilities`.
- The "also built" projects (`lib/config.ts`) and Synapse are left out of the groups. [ASSUMPTION: case studies only, since no one asked for rows without a story; the also-built list can sit on `/about`]

**Case study `/work/[slug]`** (shape changed, round 5.3)

1. At a glance.
2. Three to five decision blocks, each with the artifact that shows it.
3. A gallery for the remaining artifacts.
4. Where AI sat, only when it did. The 2019–2023 work has little AI.
5. A testimonial, only when one exists (today: Everbook has Dawson, the family office has Bruno).
6. Book a call.

Every case study must read complete with an empty gallery, because Calculate has no images on file (`content/work/calculate-qxmd.ts`, `media: []`; verified).

**About `/about`**

- The story.
- Experience grouped like the work, plus the extras: BCIT ISSP, the FLUI design hackathon, League of Innovators.
- Education.
- Teaching.
- Tools (absorbing `/stack`).
- All the testimonials, in full (absorbing `/testimonials`).

**Work with me `/services`** (doors confirmed, round 4.3)

- Two doors, each offer with its scope and price band, then how it starts and the objections.
- **Hiring door:** full-time role (case by case) · contract engineer (bills monthly; "Most engagements land between $15K and $75K CAD", `content/services.ts`) · fractional CTO (retainer, within that range).
- **Building door:** 0→1 build (within that range) · coded website (links to `/websites`; $2,000 CAD + GST, `content/websites-coded.ts`) · branding.
- AI coaching and offer and funnel consulting stay off: no final price and no proof yet (value §2; product.md open question 7).

**Websites `/websites` (+ `/coded`, `/platform`)**

- Ownership first, then price and time, then live examples, then the care plan.
- Durable sits lower down, and only here, never on home or in the Product Engineer story (product.md offers table).
- The intake flows get tokens only.

### Out of scope

- The intake flows (tokens only), the admin, `/api`, `/banner-export` and the social cards (tokens only, round 2.4).
- A `/notes` page, until a first post exists.
- Viewpoint.AI, anywhere on the site.
- New public copy. Taylor writes it. Builds use the existing site copy or voice drafts labelled as drafts, and anything drafted passes his human-hand checklist.
- Naming the family office client.
- A headshot reshoot. The current headshot is graded to carbon per kit §5.
- Legal pages beyond a restyle.
- Analytics beyond the events the success signal needs: no dashboards, no new tools (round 2.4).
- Bento grids, marketing presented as a headline skill, and an "I do everything" menu.

### Carried as settled

- Artboards use direction A (Black tie). Home and one case study are also drawn in direction B (Patina).
  - [PROPOSED] Conscious Connections as the B case study: it has the most artifacts on file, a live link, and it is Taylor's own product. The Design stage confirms.
- The Design stage uses a new page in the Paper file the wordmark came from.
- All tickets are cut before any build.
- QA: the epic default is Q1. Home tickets are Q2, with one fresh-context reviewer. Focus: "home answers in one minute what was shipped end to end, and the decisions behind it." Each ticket's level is confirmed at the Tickets gate.

## Metric

- **Signal:** `SITE-M1` v1, hirer calls booked from the site. That is a call booked through the site's booking button by a founder, CTO or head of product, counted from the booking-button click event in GA4 plus the Cal.com booking (round 3.1). [PROPOSED: the definition is written from `docs/measurement/metrics/definitions.template.md` at the Technical level, with Tally] Interview invitations for product roles and coded-site intakes are watched, not judged (value §3).
- **By when:** eight weeks after the redesigned home goes live (round 3.2).
- **Kill criterion:** fewer than two hirer calls in those eight weeks sends the home page back to Frame (round 3.2). This is a judgment bar for small traffic, not a benchmark.
- **Baseline:** [NOT FOUND: hirer calls booked from the site per month today]. See knowledge gap 1.

## Evidence

- **For:**
  - Product Engineer posts: 6/6 asked for end-to-end ownership or product sense, 5/6 named AI work, 0/6 mentioned a degree (audience TL;DR; verified count).
  - Hirers are helped by concrete shipped artifacts, decision stories, live links and a referral (audience §6; verified and secondary).
  - Distrust of AI accuracy outweighs trust, 46% to 33% (Stack Overflow 2025, audience TL;DR; verified), which is why AI shows as judgment.
  - Taylor: "being able to show capabilities is what honestly people care about. Like, can this person solve my problem?" (product.md; verified).
  - The redirects keep one home per thing: the full quotes and the tools each live once, on `/about` (judgment).
- **Against:**
  - Most hirer traffic may never reach the site; LinkedIn and Taylor's outreach carry the first contact, so the site's effect on calls is hard to isolate at this volume (judgment).
  - No measured outcome is on file for any project, so the strongest proof a hirer could want is missing until a client supplies a business case (value decision 8; verified).
  - Coded-site buyers are the weaker, more divided market, and many are content with DIY builders (audience TL;DR; verified). The `/websites` work may move little.
  - Keeping `/capabilities` keeps a long list on the site, which the audience file says stops hirers (audience §6; verified). Hearth's condition for keeping it is in Constraints below.

## Constraints from the support checks

- **Hearth, against the pillars and the "not us" list:**
  - The four ways to work are four shapes of one job, not a menu.
  - Marketing appears only as evidence, never on home's path.
  - AI is described as work under Taylor's judgment.
  - `/capabilities` stays clean only while every card links to the work that proves it and the page never reads as "I do everything" (pillars, "Explicitly NOT us"; audience §7).
  - No dev-shop, agency, AI-guru or life-coach register anywhere.
- **Vesper, on the page list and order:**
  - Designable as written.
  - The changes taken: artifacts sit beside the decisions they show, and the AI and testimonial blocks are optional per case study.
  - The "Contract and fractional" group holds one row today; it must read as a group, not as a gap (judgment).
- **Kit never-list (§7) binds every surface:**
  - No logo without permission.
  - No metric without a source.
  - No unnamed testimonial.
  - No bento.
  - No gradient on the name or behind body text.
- **Testimonials:** four are approved (Dawson Whitfield, Bruno, Vaughn Richards, Yogesh Verma; `content/testimonials.ts`). Micheal Ozdoba's is not approved and does not render. [ASSUMPTION: Bruno's first name, title and "Family Office" count as named, as on the current site]

## Open items

- [NEEDS DECISION] The family office label. It is drawn and built under its current unnamed label. When the client's written confirmation is on file, the label changes as a content edit. Not blocking (round 4.1).
- [NEEDS DECISION] The branding price on the building door. "Maybe 750 bucks" is not final (product.md). It is needed before the Work with me page ships, not to start it.
- [NEEDS DECISION] The contract offer's name. "Contract senior/staff engineer" predates the Product Engineer identity (product.md open question 5). It is Taylor's copy.
- [NEEDS DECISION] Which branding kits can be shown as proof behind the building door (product.md open question 4).
- [ASSUMPTION: builds ship with the existing copy and the labelled voice drafts, and Taylor's copy replaces them as content edits without reopening a ticket]
- [ASSUMPTION: Work with me keeps the `/services` path]

## Knowledge gaps

None needs a research thread. Each is a fact Taylor holds or a call for a later level, so the builder's rule (`prompt-builder.md` §5) keeps them in the working threads.

1. How many calls did hirers book from the site in the last eight weeks? (The baseline for `SITE-M1`; from GA4 and Cal.com. Taylor, before launch.)
2. For each case study, which Paper design files, new screen captures and further family office artifacts will be used? (Taylor said all three exist. The list is due before the Design stage draws a case study.)
3. Which live coded sites can `/websites` show, with whose permission? (The coded case slot renders nothing today, `content/websites-coded-case.ts`. Kryshan's and Phoenix's sites are the candidates in product.md.)
4. How does a booked call get attributed to a hirer: a Cal.com question, a link parameter, or Taylor's own tag after the call? (Technical level, with Tally.)
5. Where does the notes signup store an address, and under what consent? (Technical level. No cadence is promised, per the voice file.)

## Appetite

- **10 working days** for the epic, from the UX intent pass through the last hardening. [ASSUMPTION: "about two weeks" read as ten working days, Design stage included] The work is a big batch for a site of this size. If it outgrows ten days, cut the `/websites` and `/capabilities` restyles before any home or case-study ticket.

## Mode

- Production. [ASSUMPTION: no cycle charter exists in this repo; the redesign ships to the live domain]

## Decision this unblocks

- With this brief approved, the UX intent pass writes the overview and the per-surface intent for every route in the sitemap. The Design stage then settles home and the case study in Paper.
- For the business: the live site stops selling the old positioning and starts answering the one-minute question. Whether that brings hirer calls is what `SITE-M1` reads.
- Taylor decides next, at the UX page list gate.
