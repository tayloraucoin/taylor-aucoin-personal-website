# Coded-track intake — category fit audit

**Date:** 2026-09-01 · **Scope:** the nine showcase steps, the public start form, and the copy packs behind them.
**The fix:** [`CODED-INTAKE-KINDS-UX-SCOPE.md`](CODED-INTAKE-KINDS-UX-SCOPE.md) (Vesper) — solution analysis, per-step spec, copy packs, decisions D-PORT-8…14, tickets PORT-11…17.
**Trigger:** the next client (Holistica Properties) is not a portfolio. The questions were written for a filmmaker and have been de-biased twice in passing, but never audited against the categories the start form already sells.

Sources read: `docs/websites/portfolio-intake-questions-v2.md`, `lib/intake/showcase-steps.ts`, `lib/intake/tracks.ts`, `lib/validators/showcase-intake.ts`, `lib/intake/showcase-answer-labels.ts`, `content/intake-examples/*`, all nine `app/websites/coded/intake/_components/steps/*`, `app/websites/coded/intake/_components/showcase-start-form.tsx`, `content/websites-coded.ts`, and the live site at holisticaproperties.com.

---

## 1. The twelve lenses

Each is a plausible buyer of a $2,000 coded five-page site. **Fit** is how much of the nine steps they can answer as written.

| # | Category | Example | Fit | What breaks first |
|---|---|---|---|---|
| 1 | Creative portfolio — film | director, DP, editor | **Full** | nothing; this is the copy's native case |
| 2 | Creative portfolio — stills | photographer, illustrator, ceramicist | **High** | "reel", "footage glows", laurels, IMDb |
| 3 | Consultant or coach | strategy consultant, exec coach | **Partial** | no offer/pricing step; "the work" has no artefacts |
| 4 | Speaker or author | keynote speaker, non-fiction author | **Partial** | no talks/books/dates model; no booking ask |
| 5 | Studio or small team | 3-person design studio, agency | **Partial** | no team roster; identity is singular throughout |
| 6 | **Venture raising investment** | **Holistica Properties** | **Low** | entity subject, team, the ask, claims, future-tense work |
| 7 | Nonprofit or foundation | land trust, arts charity | **Low** | donors, donation tiers, charitable status, impact |
| 8 | Local service business | contractor, clinic, detailer | **Low** | service area, pricing, hours, reviews, booking |
| 9 | Regulated practitioner | therapist, naturopath, RMT | **Low** | credentials gating, claim limits, intake/booking, privacy |
| 10 | Product, SaaS, or app | B2B tool, mobile app | **Low** | pricing tiers, docs, signup, changelog |
| 11 | Hospitality or retreat | retreat centre, venue, restaurant | **Low** | dates, rates, availability, location, menus |
| 12 | Musician or performer | band, DJ, ensemble | **Partial** | releases, tour dates, riders, EPK, streaming links |

Lenses 6–11 are the ones the current form fails, and five of the six are categories the start form actively offers or implies. **The start form sells four categories and one "Something else"; the questions serve one.**

---

## 2. Blockers — these hit the next client regardless of category work

### B1 · The taste gallery is placeholder data and cannot ship

`content/intake-examples/film.ts` holds six invented sites: names like "Placeholder — dark, video-first", URLs pointing at `example.test`, and generated SVG captures. Its own header says *"Nothing here may ship to a client."* `content/intake-examples/index.ts` maps **both** `film` and `generic` to that array.

Step 5 is one of nine, and it carries the promise the whole track is sold on — `content/websites-coded.ts:425` tells clients the taste gallery is the reason the first version lands close. Any client who reaches step 5 today reaches placeholder art.

Curation guidance already exists in the file header (12–24 sites, spread deliberately across dark/light, video-first/grid-first, animated/still, personality-forward/work-only). It is content work, not code work.

### B2 · `siteKinds` is collected and then read by nothing

The start form asks "What kind of site is this?" and stores the answer. It is in the schema (`showcase-intake.ts:59`), in the label map, and in the intake document. **Nothing reads it.**

Copy flavour comes from `flavourFor` → `flavourFromDisciplines`, which:
- consults `about.disciplines` only, never `siteKinds`;
- returns `generic` unless **exactly one** discipline is checked;
- has a pack for `film` and nothing else.

So the single answer that says "this is not a portfolio" changes zero downstream copy, and every non-film client — consultant, venture, studio, photographer — gets the same generic strings plus the film gallery.

### B3 · The subject of the site is always one person

Every identity field in step 1 is singular:

- `displayName` — "Your name, as it should appear on the site"
- `roles` / `leadRole` — "If a stranger could only know one thing **you** do"
- `howLong` — "How long you've been doing this"
- `representation` — "Agent, manager, or rep"

`app/websites/coded/intake/_actions/start.ts:80` sets the engagement's `businessName` to `contactName`, on the documented assumption that "a filmmaker's practice is usually themselves."

There is no field for an organisation's name distinct from the contact's, and **no roster of people anywhere in nine steps**. The durable track has a whole Team step (`lib/intake/steps.ts`, step 8). Showcase traded it for Experience, which is one person's career timeline.

Holistica's site names three people with distinct titles, bios, and a "Full Team" link. Under the current form that is either three `experience` entries about the same person, or free text in "Anything else."

### B4 · Nothing asks what the visitor is being asked to do

Not one field in nine steps captures the commercial ask: invest, donate, apply, book, buy, subscribe, enquire.

The closest are `whatShouldTheyDo` ("watch the reel, email you, book a call") and `howToReach` (email / form / both / through my rep). Both assume the conversion is *contact*.

The durable track's step 2 is literally "What you offer and what you charge." Showcase has no equivalent, because a portfolio's offer is "hire me."

Holistica's live homepage runs three distinct conversions — **Support the vision**, **Request investor deck**, **Join our community** — with different audiences and different gating. The intake captures none of them, and cannot capture a minimum cheque, a close date, an accreditation gate, or where a deck request is delivered.

The same hole hits lenses 3, 4, 7, 8, 9, 10, 11.

### B5 · There is no claims guard on this track

`lib/intake/steps.ts` grants `emphasis: "ink"` to exactly one durable step — "How you work" — described as *"the questions that stop us putting something on your site that isn't true."*

`lib/intake/showcase-steps.ts` notes deliberately that **no showcase step carries it**, because nothing in the approved copy asked for one.

The only rights question in the entire showcase track is per-project: "Are you allowed to show it? — Yes it's public / there are rules / not sure." That covers a client's NDA on a commercial. It does not cover:

- **securities language** — Holistica's homepage already runs "Own a Piece of the Future" and "REQUEST INVESTOR DECK" beside a co-ownership model;
- **health and wellness claims** — "healing happens in relationship", retreats, thermal springs (lenses 6, 9, 11);
- **charitable status and receipting** (lens 7);
- **licensing and professional-college advertising rules** (lens 9);
- **who signs off on copy before it goes live** — for an entity that is rarely the person filling in the form.

This is the finding with the most downside. A portfolio publishing a wrong credit is an embarrassment; an investment page publishing a wrong promise is a different category of problem, and the intake currently gives Taylor no record that he asked.

---

## 3. Wording that mis-fires, step by step

### Step 1 — About you
- Identity is singular (B3). No entity name, no founding date distinct from a person's tenure, no legal entity or jurisdiction.
- `credentials` and `affiliations` (broadened 2026-09-01) actually carry well across lenses 3, 5, 6, 9 — this is the one field the de-biasing pass got fully right.
- `representation` is agent-shaped. For lenses 6, 7, 13 the equivalent is counsel, a broker, or an IR contact.

### Step 2 — Who this site is for
- Audience list: producers · agencies/brands · direct clients · festivals · students or their parents · press · recruiters/employers · peers · **investors** · **prospective collaborators**. The last two were added 2026-09-01 and are the reason Holistica has any option at all.
- Still missing across the twelve lenses: **donors and funders · members or applicants · customers or buyers · patients and clients in care · partners, suppliers, and vendors · grant committees and juries · municipalities and regulators · residents or tenants · guests · employers hiring a team** (distinct from recruiters hiring a person).
- Holistica's four real audiences — prospective co-owners, community applicants, retreat leaders, press — map to *one* checkbox plus a free-text "Anyone else?".
- Framing assumes inbound client work: "What work do you want more of? … **What do you want the phone ringing about?**" and "What do you want to stop attracting?" These are the right questions with the wrong noun. For a raise it is the kind of capital and the kind of co-owner; for a nonprofit, the kind of donor; for a retreat, the kind of guest.
- `whatYouAreNot` help: *"I'm not a corporate video guy."* `afterOneVisit` help: *"Someone you'd trust with a crew."*

### Step 3 — Experience and proof
- The `fastWay` paste-and-extract is the strongest thing in the track and works for every lens. Keep it, widen the prompt.
- Placeholders are film school: "Instructor — Film Production" / "LaSalle College" / "2019–now" / "Teaching, directing, community…"
- `awards` is festival-shaped: *"festival names and years included. Festivals hand out laurel graphics."* For lenses 6–11 the proof is traction, permits, LOIs, grants, certifications, case-study numbers, and prior exits — none of which read as "awards, grants, and festival selections."
- `kindWords` + `publishPermission` is a good pattern that generalises well to testimonials and reviews. Rename, keep.
- `notableNames` generalises well to backers, partners, and logos-we-can-show.

### Step 4 — The work
This is the step that breaks hardest. `projectEntrySchema` is a **delivered past artefact**: title, year, *your role on it*, what kind of thing, who it was for, **where to watch**, share password, the story, credits, awards, *are you allowed to show it*, where it belongs.

For lens 6 the "work" is one thing that mostly does not exist yet: a property, a model, phases, amenities, a timeline. For lens 3 it is engagements and frameworks. Lens 8, services and a service area. Lens 10, features and pricing. Lens 11, dates and rates.

Dead fields for anyone outside lenses 1, 2, 12:
- `reel` / `topFive` ("if you could only show five") — presume a back catalogue big enough to cut down.
- `organization`, all five options: *By role — directing, camera, editing* · *By type — films, commercials, music videos* · *One curated grid, no filters* · *By who it's for* · *You decide*.
- Paste intro: *"paste your filmography, credit list, IMDb page."*

### Step 5 — Taste
- Blocked on B1.
- `darkOrLight` help ships as a constant: *"Most film sites run dark so the footage glows."* The v2 doc lists a photography variant that was never written, so **every non-film client reads the film line**.
- Even once curated, the gallery keys on *discipline*, which is the wrong axis for lenses 3–11. A venture and a filmmaker do not need the same twenty sites.

### Step 6 — Your words
- **`step-words.tsx:18` ships another client's name to every client**: `'Third — "Kryshan directs…"'`. It is also discipline-specific ("directs").
- Voice-note prompt assumes one person with a back catalogue: *"how did you get into this, and what's a piece of work you're proud of."* One `voice_note` file slot. A three-person team with a founding story and a thesis needs a different prompt, and possibly more than one recording.
- `writtenNotes` help: *"Artist statements, director's notes, grant applications, captions."*
- `keepMyWording` and `neverSay` generalise perfectly. No change needed.

### Step 7 — Media
- "A photo of **you**" — singular. No slot for a team of headshots with names attached.
- "Behind the scenes — **You on set, behind a camera, teaching**."
- "Laurels and award graphics — **Festivals send these as PNGs**."
- **No document slot at all.** Deck, one-pager, floor plan, rendering, site map, menu, price sheet, brochure, annual report. For Holistica the deck is the single most information-dense asset they own, and there is nowhere to put it.
- Logo help: *"Most sites like this don't need a logo — a well-set name usually does it better."* True for a portfolio. Wrong for every entity in lenses 5–11, and it argues against a $250 add-on that is on the checkout menu.

### Step 8 — The site itself
- Pages offered: Home · Work/projects · A reel page · About · Contact · A page for teaching or services · Press/news.
- Missing across the lenses: **Services and pricing · The offering / Invest · FAQ · Apply or Join · Donate · Team · News or blog** (distinct from press) **· Events or dates · Location · Legal and disclosures · a gated page** (data room, deck download).
- Holistica's live site already runs roughly eight sections. The list surfaces one of them, so the `INCLUDED_PAGES = 5` warning fires against a page list that does not contain the pages they need — which defers the extra-page conversation past the point where the scope is set.
- `howSeparate` help: *"A producer looking at your reel and a parent looking at your film camp."*
- `howToReach`: email · form · both · **through my rep**. No "an application", no "request the deck", no "book a call", no "donate".
- `showAvailability` is freelancer-shaped ("Booking for fall 2026"). The entity equivalents are higher-stakes and unasked: is the raise open, how much is committed, when does it close, are applications open, are dates on sale. The existing caution — *only say yes if you'll actually update it* — is exactly the right instinct and should carry over.

### Step 9 — Accounts and access
- "Where does your video live?" (Vimeo / YouTube / a drive) is asked of **everyone**, framed as load-bearing for hosting cost.
- Missing for entity clients: existing **email list or CRM** (Mailchimp, ConvertKit), **booking or calendar tool**, **payment processor** (Holistica takes money today), **analytics**, **Google Business Profile**, existing **form endpoints** — and, importantly, **who owns each account**: a founder's personal Instagram is a different asset from the org's.
- `accountsHelp` generic — "Wherever your work already lives" — is fine; film's IMDb line is correctly gated.
- No-passwords law and the `linkPassword` exception are sound and category-neutral. Leave them alone.

---

## 4. Holistica dry run — the nine steps as they would actually go

| Step | What happens |
|---|---|
| Start form | "What kind of site is this?" → nothing fits; checks **Something else** and types "community property venture raising investment". "What's the work?" → none of film/photo/design/illustration/music. Both answers are then ignored by the system (B2). |
| 1 · About you | "Your name as it should appear on the site" → Amy? Holistica? The site's subject is the project, the form's subject is a person. Roles block gets one person's roles. Two other named team members have nowhere to go. |
| 2 · Audience | Checks **Investors**, types the other three into "Anyone else?". Answers "what work do you want more of" about capital, into a box that asked about client work. |
| 3 · Experience | Best-fit step. Pastes the deck into "The fast way"; extraction returns Amy's career, not the project's. Awards/festival framing collects nothing. `notableNames` catches partners. |
| 4 · The work | **Fails.** No delivered projects. The property, the phases, the amenities, the ownership model, the Italy timeline — all of it goes into "Say more about that" as prose, or nowhere. `reel`, `topFive`, and all five organisation options are inert. |
| 5 · Taste | **Blocked.** Placeholder gallery, film-flavoured dark/light help. |
| 6 · Your words | Reads *"Kryshan directs…"*. Voice-note prompt asks about a piece of work they are proud of; the honest answer is about a building that does not exist yet. One recording slot for a three-person founding story. |
| 7 · Media | Has property photography, renderings, drone, a deck, three headshots, a logo. The form offers: one photo of you, behind-the-scenes, festival laurels, a logo file, and a catch-all. Logo help tells them they probably do not need the logo they already have. |
| 8 · The site | Needs Vision, Location, Community, Team, Amenities, Origin story, Invest, Apply, plus legal. Ticks Home / About / Contact / Press and types the rest into "Something else?". The five-page note fires against the wrong list. |
| 9 · Access | Asked where their video lives. Not asked where deck requests go, where applications go, what their email list is on, or whether they take payment today. |

**Net:** of nine steps, two land cleanly (1 partially, 3 mostly), three mis-fire on wording, and four (4, 5, 7, 8) fail to collect what the build actually needs. The three most consequential facts about this client — **it is an entity with a team**, **it is soliciting money**, and **the copy carries regulatory exposure** — are captured nowhere.

---

## 5. What already works and should not be touched

- **`fastWay` paste-and-extract** (steps 3 and 4) is the highest-leverage mechanism in the track and is category-neutral. It only needs a wider prompt.
- **The business primer** (`lib/intake/showcase-primer-fields.ts`) derives its field inventory from the live schemas and enforces quote-or-nothing on anything touching money, dates, headcount, credentials, legal status, or claims about results. That criticality rule is exactly the discipline a fundraising client needs — but it is a multiplier on whatever the schema captures, so it cannot rescue fields that do not exist.
- **The flavour mechanism** is the right shape. It is wired to the wrong input and has one pack; both are small fixes, not a second track.
- **No-passwords law**, the documented `linkPassword` exception, `INCLUDED_PAGES`, and the confirm-before-charge promise are all category-neutral and correct.
- **`keepMyWording`, `neverSay`, `handsOn`, `bestContactMethod`, `credentials`, `affiliations`** all generalise as written.
- **Every question optional** is what makes a mis-fit question survivable rather than fatal. It is the reason this audit is a wording problem and not an outage.

---

## 6. Recommendation

**Widen the showcase track in place. Do not build a third track.**

The nine-step count is promised on the welcome screen and on `/websites/coded`, so a tenth step has a real cost. But nothing about the *machinery* is portfolio-specific — repeatable blocks, autosave, paste-extraction, file uploads, and the flavour resolver are all generic. What is portfolio-specific is the strings and the field sets, and those are exactly what the flavour mechanism was built to swap.

Suggested order:

1. **Ship-blockers, do first, small:** delete the "Kryshan" string; curate a real taste gallery or route the next client around step 5 with a call.
2. **Wire `siteKinds` to flavour.** Merge site-kind and discipline into one "engagement kind" the resolver reads, and stop requiring exactly one discipline. This is the change every other fix depends on.
3. **Write three more copy packs** — `entity` (lenses 5–7, 13), `service` (8, 9, 11), `practice` (3, 4) — starting with the ~15 strings identified in §3 that ship film wording to everyone.
4. **Reshape step 4 by kind.** Same repeatable block, different fields and labels: "The work" for a portfolio, "What you're building" for a venture, "What you offer" for a consultant, "Services" for a trade. This is the biggest win and does not add a step.
5. **Add the offer and the claims guard.** Recommend folding both into step 2 (which is already about the visitor and what they should do) rather than adding step 10 — with the claims half carrying `emphasis: "ink"`, matching the durable track's precedent.
6. **Add optional field groups revealed by kind:** a team roster on step 1, a document upload on step 7, an expanded page list and account list on steps 8 and 9.
7. **Reconcile `/websites/coded` with the intake.** The hero says "Websites for creative work" and "Your work is the reason anyone hires you" while the start form sells Consultant, Speaker, Studio, and Something else. One of the two is wrong about who this track is for, and Holistica landing on that page today reads a page that says it is not for them.

**For Holistica specifically, before any schema work lands:** fix the Kryshan string, skip or manually run step 5, and cover entity, team, the ask, and the claims guard in a supplementary questionnaire on the call. Then decide how much of §6 is worth building against the next five clients rather than this one.
