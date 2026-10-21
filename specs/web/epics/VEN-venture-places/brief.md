---
epic: VEN
status: draft
---

# Brief — venture places in the coded intake

> **Who fills:** Compass, with Taylor, at Frame on 2026-10-20. Gloss checked the question register; Chancery set the claims boundary.
> **When:** before the UX pass. Approved at "Frame go" by Taylor, 2026-10-20.
> **Lives at:** `specs/web/epics/VEN-venture-places/brief.md`. Research: `research/place-venture-intake.md` (Note A), `research/venture-place-references.md` (Note B).
> **Rules:** the template keeps solution vocabulary out of a brief. The Frame prompt asks this brief for scope in pieces, and the session's instruction outranks the template (rung 2 over rung 5), so the pieces and the facts each must collect are here. Layout, components and words are not; the UX level owns them.
> **Evidence labels:** verified (read in a named file, or said by Taylor in this thread), secondary (reported by a source we did not check), judgment (a role's call), estimate.

## The one rule this epic builds by

**Ask only what the website needs.** Every new question must end up as a page, a line, a label, a link or a form on the client's site (Taylor, this thread; verified). A fact we would want for running the place, but that no page shows, is out. This is why operations, application processing and data-handling questions from Note A are cut below.

## Job

- **Trigger:** a founder whose venture is a place or a community (a property being restored, a retreat centre, an ecovillage) opens the coded intake to get a site that brings in investors first. In their words: "I need a site investors can take seriously, and people can join."
- **Baseline:** they pick "A venture or project" and get the general venture pack (`lib/intake/showcase-copy.ts:1533`, `lib/intake/showcase-kinds.ts`; verified). It asks for stage, "What you're building", an "offering" page and "who speaks for it (counsel, a broker…)". All of these read wrong for a place (Note A, "Existing venture questions that read wrong"; judgment). It never asks for the facts an investor page cannot be written without: who issues, what is sold, where it may be sold, what counsel requires, the property's real status, and whether each image is a photo or a render (Note A gap table; verified against the code). Taylor finds out at the call or by email. The live example of the risk: a comparable client site offers shares publicly, names no issuer and shows AI-named images with no label (Note A F1, checked 2026-10-20; verified).

## User

- **Primary:** the founder of a place-or-community venture, often not technical, filling in the form on a laptop with the deck open in another app. They are raising money and finding members at the same time, and use "community", "co-owner" and "investor" loosely (Note A F4, synthesizer's notes; verified and judgment).
- **Second user:** Taylor, who reads the intake document and builds the site from it. He needs each critical fact either quoted or plainly marked unknown.
- **Audiences the founder's site must serve**, added to the venture-place picker (round 1.3, accepted): retreat leaders or facilitators, co-owners (separate from investors, with a help line), guests. Event attendees are added on any kind when the event section is on. "Members" gets a defining help line.

## Metric

- **Signal:** qualitative, named plainly (no metric definitions file covers the intake yet). On the first venture-place intake, every critical fact in the venture-place block comes back quoted from the founder or answered "not sure" or "counsel pending", and the primer infers none of them. Taylor can write the investor, property and event pages without a follow-up email about those facts.
- **By when:** the first venture-place client's submitted intake.
- **Kill criterion:** if that intake comes back with most of the critical block unanswered and no counsel named, stop adding questions. The block becomes a short "send this list to your counsel" handoff instead.

## Evidence

- Note A: the gap table, F1–F6, and the regulatory note (Italy/EU, Canada/BC, US). Its labels are kept. Every operative legal conclusion stays [REQUIRES LICENSED ATTORNEY]; the intake asks for counsel's wording and decides nothing.
- Note B: 24 sites checked 2026-10-20, about 12 with taste value, 5 structure spectrums, 6 tags. The visual axes are judgment from page text and need Taylor's visual check (Note B Method; verified).
- Code (verified):
  - The kind registry is the single home for per-kind facts.
  - The primer's criticality map makes money, dates, headcount, legal status and claims quote-or-nothing (`lib/intake/showcase-primer-fields.ts:34`).
  - The film pack is the one kind built in full, with its own taste spectrums (`showcase-copy.ts:1245`) rendered by a step that reads any pack's set (`step-taste.tsx:280`).
  - The venture pack has no spectrums.
  - The taxonomy has none of the six proposed tags (`content/intake-examples/taxonomy.ts`).
  - Venture already carries a documents drop on Media that uploads to Supabase storage (`document-drop.tsx`, `file-drop.tsx`, `server/services/submission.ts`).
- **Counter-evidence:**
  - One client is in this shape today, and the sub-type could stay a one-client feature (judgment).
  - Asking legal questions in a website form may make a founder under-answer (kinds scope §1, the regulated practitioner; verified). That is why "not sure" is a first-class answer and the kill criterion exists.

## Appetite

- **Small batch: 2 build days** (Taylor, this thread: "we're talking about adding some questions"). Plus Taylor's own time to enter the gallery in the admin.
- How the 2 days split, as an estimate:
  - venture-place questions and rewording: 1 day
  - event section: 0.5 day
  - image brief, spectrums and tags: 0.5 day
- **Cut order if it runs over:** application questions first, then the event section's later rows (refunds, lodging), then the extra tags.
- **Share, don't fork** (Taylor, this thread). Film is the kind built in full, so venture-place reuses what film and the floor already run: the kind registry flags, `ForKinds`, the copy pack shape and its pending-copy markers, the `TasteSpectrum` type and the taste step, the gallery admin and taxonomy, `FileDrop` and storage, and the primer's criticality map. No new primitive unless the UX pass names one.

## Mode

- Production.

## Scope, in pieces

Each new field is registered once: in the kind registry (`showcase-kinds.ts`) for who sees it, and in the primer field map (`showcase-primer-fields.ts`) for its criticality. A component never decides either inline (prompt focus; M-ADM-7). Investment and event facts are critical, which makes them quote-or-nothing.

### 1. The venture sub-type

- Venture gains one sub-type question. "A place or community" is the only value built out.
- Named, not designed: a company or startup, a fund, a cause or nonprofit, a product launch, something else (round 1.4, accepted). Each falls back to today's venture pack exactly.
- Plain venture's questions and copy are unchanged.

### 2. Venture-place questions

Everything below is venture-place only unless marked. Each row says what on the site it feeds.

**The investor ask** (feeds the model page, the deck request, the legal footer and the disclaimer)

| Fact                                                                                                                                                      | Critical | On the site                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| Legal name and country of the entity investors pay into, and its registration number (all venture)                                                        | yes      | Legal footer, disclaimer                              |
| What an investor receives, in counsel's words (shares, membership, title, lease, use rights, loan)                                                        | yes      | The model page                                        |
| Whether a co-owner differs from an investor, with one counsel-approved line each                                                                          | yes      | The model page, audience routing                      |
| Currency, and whether the minimum is the same everywhere (an add-on to the existing `asks[].number`)                                                      | yes      | The model page, if shown                              |
| Who may get the deck, and the steps before numbers are seen (the existing `mechanism` and `visibility`, plus eligibility, for example accredited only)    | yes      | The deck-request gate                                 |
| Countries and states that may invest, and those excluded (all venture)                                                                                    | yes      | Disclaimer, the gate                                  |
| Required disclaimer and wording per jurisdiction, pasted verbatim, and who approved it (an extension of `requiredWording` and `signOff`)                  | yes      | Disclaimer                                            |
| Whether any return, income, appreciation or scarcity wording may appear. Default: none (all venture)                                                      | yes      | Nowhere, unless quoted                                |
| Perks or stays tied to the amount invested, exactly as counsel approved                                                                                   | yes      | The model page                                        |
| Whether raise progress may be shown (added to `showAvailability`)                                                                                         | yes      | Status line                                           |
| **Pitch deck(s): a multi-file upload slot**, to Supabase storage, with the existing promise line that nothing goes on the site unless the founder says so | n/a      | The deck request (what gets sent), the build's source |

The deck slot reuses `FileDrop` and the existing upload path. [PROPOSED] It is a dedicated field key, so the intake document lists decks apart from other documents, shown on all venture. The UX pass places it.

**The property** (feeds the place page, the home page's lead and phases)

- Status: owned, under contract, option, leased, or searching; who holds title, and since when. This replaces `howLong` for venture-place. Critical.
- Phases: what stands now, what is planned, when, and whether each is funded. This rewords "What you're building" / `pieces`. Critical.
- Size and capacity: land, buildings, rooms, beds, now and per phase. Critical.
- Permits: needed, granted or pending, with dates. Critical; it appears only as counsel allows.
- Location precision on the site (region, province, town, address or pin) and the reason. Critical.
- Whether people can visit now. Feeds a visit ask.

**Images** (feeds labels and credits on every image)

- Which uploads are photos of this property, and when they were taken (venture-place). Critical.
- Which are renders or AI, and whether each shows this building, a concept or a mood. The exact render label wording and who approves it (all venture). Critical.
- Which are stock, and whether they may sit beside the investment ask (all venture). Critical.
- Photo credits, and consent from identifiable people (all venture). Critical.

**Applying** (feeds the apply page; facts only, no application builder)

- Who can apply, and for what.
- What happens after someone applies, and how soon they hear back.
- Any fee or deposit, and when it is refundable. Critical.
- A paste box for the current application questions.

**Rewording for venture-place** (round 5, accepted)

- Stage stays as it is, and the property status above sits beside it.
- Representation gains "local partner" and "licensed professional (licence type)", and loses the bare "broker".
- `askField` gains reserve, hire the venue and register.
- The pages checklist renames "offering" to "The model" and adds stays, retreats or venue hire, and events.
- Portrait and video turn on for venture-place.
- Audiences: see User above.

**Claims boundary** (Chancery, round 4.3, accepted)

- The intake collects facts and counsel's verbatim wording. It never drafts, suggests or infers investment wording.
- Its own examples never model share wording, and use synthetic names only (D-PORT-14).
- The block opens with one calm line: the founder's counsel, not us, decides what may be said, and "not sure" or "counsel pending" is a fine answer.
- Nothing about the raise reaches the site unless it is quoted and counsel has approved it.

### 3. The event section (every kind)

- An optional "Do you have an event planned?" toggle on all six showcase kinds. The coded track only, not durable (round 6.2, accepted).
- Event types: summit (designed first), retreat, open day, workshop, festival, other. Choosing one reveals the event questions.
- The questions, each feeding the event page or its sign-up:
  - format (in person, online, both)
  - dates and time zone, or "not fixed yet"
  - place, and whether it is confirmed
  - capacity, and what happens when it is full
  - free, paid or pay-what-you-can, with tiers and prices
  - speakers: confirmed or invited, and whether each may be named yet
  - draft schedule, or "to come"
  - what "registry" means: a public attendee list, a private sign-up list, an application list, or a gift or contribution registry
  - what arrives after sign-up, and where sign-ups go (which tool)
  - whether sign-ups may be emailed about other things (asked separately)
  - refund or transfer policy
  - attendee lodging
  - whether any part presents the investment (if so, counsel reviews the invitations)
  - who keeps the dates current after launch
- Critical: dates, place, capacity, prices and tiers, speakers, registry meaning, consent, refunds, the investment flag.

### 4. The image brief (every kind, Media step)

- "Want us to generate images? Brainblurt what you want": a free-text box plus optional reference uploads (settled). No generation in the intake.
- Not critical. It is a preference about the site, not a claim, so it is a candidate for the primer's non-critical allowlist. [PROPOSED; the technical calls confirm.]

### 5. Gallery spectrums and tags

- The venture-place set gets Note B's five structure spectrums as a `tasteSpectrums` list, the same shape and step as film's:
  1. place first ↔ model first
  2. as it is ↔ as it will be
  3. programme-led ↔ place-led
  4. founder's voice ↔ community's voice
  5. open door ↔ members' door
- Spectrum 1 is withdrawn if counsel rules out model first.
- Spectrum 4 sits alongside `personVoice` and does not replace it (round 5.7, accepted).
- The taxonomy gains six style tags: booking-bar, date-cards, stat-counter, render-labelled, founder-letter, legal-footer.

### 6. Gallery content

- Taylor enters about 12 sites in the admin (Note B rows 1–4, 7, 9–12, 15, 21, 23) and confirms each site's group, axes and tags by eye as he goes.
- The warning examples (Note B rows 4, 8, 24) are recorded for the designer and admin only, never shown to the client (round 5.6, accepted).
- **Which pack the sites go in:** the existing `venture` pack. Place is the only venture sub-type built, so for now the venture set is the place set. This avoids a new pack value, which would be a Postgres enum migration (`db/schema/example-sites.ts:267`; verified) and would put the ticket at Q3. When a second sub-type is designed, that epic decides on a split. [judgment; the technical calls may overrule]

### Living UX truth

There is no truth for the intake under `specs/web/ux/` (verified: the folder is empty). This epic proposes `ux/intake/` only for the surfaces it touches: the kind picker and sub-type, the venture-place steps, the event section, Media, and Taste. Shipping promotes those files. There is no back-fill of the rest of the intake (round 3.2, accepted).

## What's out

- Kickstarter and crowdfunding perks (settled).
- Operations: stay types, prices, booking, venue-hire terms, residencies, co-owner usage nights, cancellation, merchant account, tourist tax and registration codes. They are pinned for a later operations epic. Capacity and visits are asked once here so that epic does not re-ask them.
- Application processing: who reviews, sensitive-data handling, and keeping existing forms working. No page shows these.
- Image generation; Paper (settled); languages other than English (settled).
- Designing the other venture sub-types; changes to plain venture's copy; placeholder copy outside the venture pack (prompt).
- The durable track's intake.

## Knowledge gaps

1. **Gallery pack.** Does the venture-place set stay in the `venture` pack (this brief's lean) or get its own pack value, with a migration and Q3? _Resolved here by judgment; the technical calls may reopen it. No research needed._
2. **Visual axes for the 12 sites.** Do the group, ground, motion, density and tags Note B inferred from text match the rendered sites? _Taylor checks during gallery entry (piece 6). No research thread._
3. **The client's own facts.** What does an investor or co-owner receive in law, which jurisdictions are open, and what does "registry" mean for their summit? _Resolved for the epic: the intake asks each one (pieces 2 and 3). They block the client's site, not this build. No research thread._
4. **The client's unreadable pages** (/join-us, /h-quiz, /founding-supporters, /supporter-perks, /terms). Does the UX need their content? _No. The intake collects those facts from the founder. Not pursued._

No gap needs its own research thread.

## Decision this unblocks

- Vesper writes the UX proposal for pieces 1–5 from this brief in one pass, straight to code.
- Taylor sends the first venture-place client an intake that collects what their investor, property and event pages need, without a site that makes an offer counsel has not seen.
- Next decider: Taylor, at the UX gate.

## QA and tickets

- Epic default Q2; Vigil (spec against code) at each ticket's harden. Levels are confirmed at the Tickets gate.
- Any ticket that adds a DB column or a migration goes to Q3. None is expected (see piece 6).
- One ticket per piece, cut at level 5. Piece 6 is Taylor's admin work, tracked as a ticket with no code.
