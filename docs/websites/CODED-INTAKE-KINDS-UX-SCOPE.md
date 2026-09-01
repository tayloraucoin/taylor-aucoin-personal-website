# Coded-track intake — kinds: solution analysis and UX scope

Author: Vesper (design). Status: **Draft for Taylor's sign-off**, then handoff to Mason for technical scoping. Companion to [`CODED-INTAKE-CATEGORY-AUDIT.md`](CODED-INTAKE-CATEGORY-AUDIT.md), which is the finding; this is the fix.

**Document authority.** On what the current form asks and its approved copy, [`portfolio-intake-questions-v2.md`](portfolio-intake-questions-v2.md) wins and nothing here rewrites a v2 string that stays. On presentation law, [`PORTFOLIO-INTAKE-UX-SCOPE.md`](PORTFOLIO-INTAKE-UX-SCOPE.md) §3 and the D-INT / D-PORT logs win; this document inherits them whole and defines deltas. On architecture already ruled, [`specs/TECHNICAL-DECISIONS.md`](specs/TECHNICAL-DECISIONS.md) M-PORT-1 through 20 win. On tokens, [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) wins.

Copy note: every client-facing string this document introduces is a **draft** marked `[COPY — new]`, written in the v2 register so Taylor's human-hand pass edits rather than starts from nothing. There are roughly ninety of them, tabled in §6 so the pass is one sitting. Nothing here is approved copy until he says so.

---

## 0. What this answers

The audit found that the coded track's nine steps serve one kind of client and the start form sells five. This document decides how one questionnaire serves six kinds without becoming six questionnaires, and specifies the screens, fields, copy, and states that get it there. It is written so Mason can cut tickets from §12 without a call.

The short version: **one new answer on the start form, one step that changes shape, and a copy pack for everything else.** Nine steps hold. The machinery does not fork.

---

## 1. Frame — who is here now, in what state

The original scope framed one user: a working creative, precious about the work, at risk of perfectionist stall. That user is still here and nothing below makes their path longer. Three more are now in scope, and each changes a design decision.

**The founder filling this in on behalf of others.** Holistica's form will be filled by Amy, for an entity that is also Alexis and Taylor and a property in Italy. She is answering "you" questions about a "we". She is in fundraising mode, which means every sentence about the offering carries a small legal weight she may or may not know how to measure, and she is doing this at night, between calls, probably from the deck she already wrote. *Consequence:* the subject of the form must be able to be a thing rather than a person; the offer must be askable in plain words; the claims boundary must be asked in the calmest register the track has, not as a legal warning; and pasting the deck must do most of the work.

**The regulated practitioner.** A therapist, a naturopath, a coach with a college behind them. Their risk is the opposite of the filmmaker's: not a wrong credit but a sentence a college would object to. They will under-answer if the form feels like it might publish something without asking. *Consequence:* the claims cluster exists for them as much as for the venture, and "not sure" must be a first-class answer on it.

**The owner-operator.** A studio principal or a service business. Plural, busy, often on a phone. They already know what they sell and what it costs, and they find "what do you want the phone ringing about" faintly patronising because they know exactly. *Consequence:* the offer step must let them list services fast, in the shape the durable track already proved (`step-pricing.tsx`), and the audience step's direction cluster must be worded for a business, not a career.

**What has not changed:** the metric is completion, not thoroughness. A 70%-complete intake tonight beats a perfect one that never comes back. Every field stays optional (D-INT-4). Nothing below adds a required answer, a count, or a completeness meter.

**The one job of this surface** is unchanged: convert a paying client into enough true material to put a first look in front of them within three days. The emotional contract gains one clause for the entity kinds: *nothing goes on the site that I haven't been asked about.*

---

## 2. The shape of the fix — one decision

### 2.1 Engagement kind

The start form currently asks two questions whose answers the system then ignores: a multi-select "What kind of site is this?" and a multi-select "What's the work?". The flavour resolver reads only the second, requires exactly one answer, and has one pack. Two questions, zero effect.

**Replace both with one single-select question, "What is this site for?", stored as the engagement's `kind`.** It is the one input every downstream decision reads: which copy pack, which field groups appear, what shape step 4 takes, which gallery set loads.

| `kind` | Start-form label `[COPY — new]` | Pack | Step 4 shape | Groups revealed | Gallery set |
|---|---|---|---|---|---|
| `portfolio` | Your creative work — a portfolio | `film` or `generic` (by discipline, as today) | The work | — | by discipline |
| `practice` | Your practice — consulting, coaching, speaking, writing | `practice` | What you offer | ask · claims | `practice` |
| `studio` | A studio or team's work | `entity` | The work | roster · ask · claims · documents | by discipline, else `entity` |
| `venture` | A venture or project — raising money, finding members, launching something | `venture` | What you're building | roster · ask · claims · documents · stage | `venture` |
| `business` | A business that sells services | `service` | What you offer | roster · ask · claims | `service` |
| `other` | Something else | `generic` | The work | roster · ask · claims · documents | `entity` |

**Why single-select.** The exactly-one rule that made flavour impossible was the *right* rule attached to the wrong question. A site has one job that leads; a person can have several disciplines. Making kind single-select is what lets every downstream string be certain, and the help line handles the mixed case honestly: *pick the one that leads; the questions inside have room for the rest.* Tradeoff named: a consultant who also does photography loses the film gallery. They gain a form that asks about their practice. That is the right trade for a $2,000 build with a five-page scope.

**Disciplines survive** for `portfolio` and `studio` only, as a conditional reveal under the kind question, and do exactly what they do today: pick film versus generic within the portfolio pack, and pick the gallery set. Every other kind never sees the question.

**Why not a third track.** M-PORT-1's revisit trigger is "a third track whose steps diverge *structurally*." They do not. Nine steps, the same autosave, the same repeatable block, the same extraction, the same uploads. What diverges is strings, option lists, and one step's entry shape. That is a cartridge, and the cartridge slot already exists (`showcaseSteps(flavour)`, `copyPackFor`). A third track would be the second machine M-PORT-1 exists to prevent.

**Why nine steps hold.** D-INT-5 and the welcome copy promise nine. Every addition below lands *inside* an existing step, as a field group that is present or absent by kind. Step 4 is the only step whose title and intro change, and `showcaseSteps` already takes the argument that lets it.

### 2.2 Packs are layered, not forked

A pack is a record of strings. `generic` is the complete floor. Every other pack overrides only the slots where its words genuinely differ, and any slot it leaves alone falls through to `generic`. Six packs, roughly thirty slots, no pack repeats a string it did not need to change. `[PROPOSED — Mason's placement; the law is one home per string, M-PORT-1]`

### 2.3 Groups are present or absent, never revealed

Kind is fixed before step 1 renders, so a kind-gated group is simply in the tree or not. There is no reveal animation for kind, because there is no moment on any step where kind changes under the client's hands. The §6.5 reveal law still governs conditionals *inside* a group (a person's headshot slot appearing once they have a name; "where it lands" appearing once an ask has a mechanism).

### 2.4 Changing kind later

Step 1 shows the kind as a `KnownFact` line with a **Change** text link beside it. Tapping it swaps the line for the same radio group the start form used, in place. Choosing a new kind autosaves and re-renders the step. One dim line under the group, always: `[COPY — new]` *"Changing this changes the questions, not your answers. Anything you've written stays."* That sentence is true by construction: every answer lives under its own key, a key is never deleted, and a shape that stops rendering a key leaves its value in the document for the intake generator to print. `[PROPOSED — D-PORT-11]`

---

## 3. The start form

Field order, top to bottom. Existing fields keep their v2 copy verbatim.

1. Your name · Email · Phone — unchanged.
2. **What is this site for?** — `pick one`, the six kinds from §2.1, as `ChoiceGroup` tap-cards in radio mode. Help `[COPY — new]`: *"Pick the one that leads. If you're a mix, the questions inside have room for the rest."* No option is disabled; the coming-soon treatment retires with this change (the 2026-09-01 amendment already removed the flags).
3. **What's the work?** — the existing disciplines group, verbatim, *revealed only for portfolio and studio* (§6.5 reveal law, 300ms, in place). Its help line moves from the "Something else?" text field up to the group, where the reason to answer is visible before the answer. This is a placement fix the audit flagged, not a copy change.
4. **What's it called?** `[COPY — new]` — `text`, revealed for every kind except portfolio. Placeholder `[COPY — new]`: *"Holistica, or Northshore Physio, or whatever's on the door."* This writes the engagement's `business_name`, which today is set to the contact's name on the assumption that a filmmaker's practice is themselves (M-PORT-3). For an entity that assumption is wrong and this field corrects it at the source. Step 1's name field prefills from it.
5. What you do, in one line — stays, but its *label* flexes by kind at render time on the start form too: portfolio and practice keep *"What you do, in one line"*; the rest read `[COPY — new]` *"What it is, in one line"*. Same key, same placeholder.
6. Current website — unchanged.

**States:** unchanged from PORT-2 — blur validation on email only, honeypot, no autosave. The kind group has no empty state; it simply has no selection, and an engagement created without one resolves to `generic` and asks again on step 1. Nothing gates on it.

**Existing engagements** carry no `kind`. The resolver derives one from `siteKinds` when `kind` is absent (portfolio → portfolio; consultant or speaker → practice; studio → studio; other → other; none → portfolio, because every engagement before this change was a portfolio). That keeps every existing engagement rendering exactly what it rendered yesterday. `[ASSUMPTION — no existing coded-track engagement is a non-portfolio; Taylor to confirm]`

---

## 4. Per-step design

Field inventories name every key. Labels for the intake document are in §6 with the copy. Anything not mentioned is unchanged and stays verbatim.

### Step 1 — About you

**Job:** who or what this site is about, and who is filling this in.

Order, top to bottom:

1. **Kind line** — `KnownFact` grammar: mono label `THIS SITE IS FOR`, the kind's label in ink, **Change** as a dim text link (§2.4).
2. **Name.** Key `displayName`, unchanged. Label by pack: portfolio and practice keep v2's *"Your name, as it should appear on the site"*; entity, venture, and service read `[COPY — new]` *"What it's called, as it should appear on the site"* with help *"The name people will search for. If the legal name is different, we'll ask about that on the last step."*
3. **One line.** Key `whatYouDo`, unchanged; label flexes as on the start form.
4. **Roles + lead role** — portfolio and practice only. Unchanged.
5. **Stage** — venture only. Key `stage`, `pick one` `[COPY — new]`: *An idea with a plan · Raising, not yet built · Underway · Operating*. Help: *"Where it honestly stands today. The site says this differently at each stage, and none of them is a bad answer."* Single question, four tap-cards, "not sure" not needed because the options are exhaustive and non-judgemental.
6. **How long.** Key `howLong`. Label by pack: v2's for portfolio and practice; entity and service `[COPY — new]` *"How long it's been going"*; venture: hidden, because `stage` asks the better question.
7. **Where you're based** — unchanged. Venture pack adds to the help `[COPY — new]`: *"…and where the thing itself is, if that's somewhere else."*
8. **The roster** — studio, venture, business, other. See §5.2 for the primitive. Field keys: `justYou` (`pick one`, durable's exact options *Just me / There's a few of us*), `showTeam` (`pick one`, durable's *Yes, put them on the site / No, keep it to me*), `people[]` (entries: `entryKey`, `name`, `role`, `line`, headshot as an entry-keyed file under field key `headshot`), `leadPerson` (single select from the people entered, same grammar as `leadRole`).
9. **Who we'll be dealing with** — the three `KnownFact` contact lines, unchanged.
10. **Memberships and credentials · Affiliations and partnerships** — unchanged; these already carry across kinds.
11. **Representation.** Key `representation`. Label by pack: v2's for portfolio and practice; entity and venture `[COPY — new]` *"Who speaks for it"* with help *"Counsel, a broker, an investor-relations contact, a board. Who they are, and whether enquiries should go through them."*

The primer's paste box (PORT-10) stays at the top of this step when it ships, above the kind line. For a venture it is the single highest-leverage field on the form: the deck goes in here.

### Step 2 — Who this site is for

**Job:** unchanged. Three clusters (PORT-4's hairline grouping), all keys unchanged. What flexes:

- **Audience options** by pack. The list is the pack's, not a union: a filmmaker never reads "Donors", a nonprofit never reads "Festivals or programmers". Lists in §6.
- **Direction cluster** labels and help by pack. The four questions are the right questions; the nouns change. `wantMoreOf` for a venture reads *"Who do you want more of?"*; for a business *"What jobs do you want more of?"*. Full table in §6.
- **Help-line examples** in `whatYouAreNot` and `afterOneVisit` by pack.

Nothing structural changes on this step. It was already the step the audit rated closest to right.

### Step 3 — Experience and proof

**Job:** unchanged — the timeline the site sits on. Keys unchanged. What flexes:

- The paste intro's list of sources (`[COPY — new]` per pack; the venture one names the deck and the origin story).
- Entry placeholders (`what` / `where` / `category`), per pack.
- `awards` label and help — entity, venture, and service read `[COPY — new]` *"Recognition, grants, and milestones"*.
- `kindWords` help — service reads *"Things customers have said…"*; entity *"clients, partners, or people you've worked with"*.
- `notableNames` help gains, for venture `[COPY — new]`: *"Backers, partners, advisors, anyone whose name is already attached. And whether you're allowed to say so."*

The extraction mode stays `experience` for every kind; the prompt's source list widens (§9).

### Step 4 — the kind-shaped step

This is the one step whose **title, intro, and entry shape** change by kind. It is also where the two things the audit found missing, the ask and the claims boundary, live, because they are one job: *what are you putting in front of people, and what may we say about it.*

**Order for every non-portfolio kind:** the fast way (paste + Sort) → the entries block (shape by kind) → the ask block (§5.3) → the claims cluster (§5.4) → organisation and "say more".

**Order for portfolio** is unchanged: fast way → projects → reel → top five → organisation → say more. Portfolio gets neither the ask block nor the claims cluster: its ask is "hire me" and step 8's contact question already carries it, and its claims boundary is the per-project rights question that exists today. Adding either would be asking a filmmaker about securities language.

**Entry shapes.** Each is a `RepeatableBlock` with entry keys (M-PORT-14) and per-entry images (PORT-5 path). Collapse-to-summary (M-PORT-15) applies to all four.

| Kind | Block label `[COPY — new]` | Array key | Entry fields |
|---|---|---|---|
| portfolio · studio | Your projects (v2) | `projects` | unchanged eleven, plus images |
| practice | What you offer | `offerings` | `title` · `format` (1:1, group, workshop, keynote, book, course…) · `forWhom` · `scope` (length, size, what's included) · `pricePosture` (`pick one`: *On the site · On request · Don't show*) · `price` (revealed when posture = on the site) · `link` · `story` · `placement` (v2's three) |
| venture | What you're building | `pieces` | `title` · `kind` (the property, a phase, a programme, a product…) · `status` (`pick one`: *Planned · Underway · Done*) · `when` · `story` · images · `placement` |
| business · other | Your services | `services` | `title` · `price` (durable's placeholder *"$149, or from $80/hr"*) · `included` · `duration` · `takesLonger` · `placement` |

**Fields that hide by kind:** `reel` and `topFive` render only for portfolio and studio. `organization` options are the pack's (§6); the studio pack keeps v2's list.

**The step-4 collapsed summary row** (M-PORT-15) shows `mono index · title · one dim field`: year for projects, format for offerings, status for pieces, price for services. Same row, different second column, so nothing looks lost when it folds.

### Step 5 — Taste

**Job:** unchanged. One rule changes and one state is added.

**Gallery set by pack, not discipline.** `examplesFor(pack, disciplines?)` — portfolio and studio still refine by discipline; every other kind loads its pack's set. `[PROPOSED — D-PORT-12]`

**Uncurated set → the gallery is absent.** Today both sets map to six placeholders whose file header forbids shipping them. Until a set is curated, the step renders *without* the gallery and favourites sections at all: the intro, then one dim line, then the preference radios, the three words, the catch-all uploads, links, brain dump, and pet hates, which together are still most of the step's signal. The line `[COPY — new]`: *"The example sites for this kind of build are still being chosen. Skip that part for now; everything below still counts, and we'll look at sites together on the call."* Absent, not empty; a real sentence, not placeholder art. The done screen's skipped-list grammar already covers the missing favourites. `[PROPOSED — D-PORT-12]`

**Dark or light help** joins the pack: film keeps *"Most film sites run dark so the footage glows"*; generic and practice `[COPY — new]` *"Sites like this run either way. Go with what you'd want to open at night."*; entity and venture *"Most sites for a place or a project run light so the photography carries it. Yours doesn't have to."*; service *"Most service sites run light; it reads as open for business. Yours doesn't have to."*

**Curation contract, extended.** One set per pack: `film`, `generic` (portfolio, non-film), `practice`, `entity`, `venture`, `service`. 12–24 each, spread across the same axes PORT-7 named. The venture set should span "raising" sites (a fund, a property, a co-op) and "joining" sites (a residency, a members' club), because Holistica is both. Content work, Taylor's, and this document does not pretend otherwise.

### Step 6 — Your words

**Job:** unchanged. Three fixes.

1. **The voice-note prompt** flexes by pack (§6). Venture: *"why does this need to exist, and what does it look like if it works."* The slot accepts multiple files already; the skip line under the card gains, for roster kinds, `[COPY — new]` *"More than one of you? One each is ideal."*
2. **First or third person** stops shipping a client's name. The option labels interpolate `displayName` from step 1, falling back to a pronoun when it is blank. Entity packs render first person as *we*. Rendered forms `[COPY — new]`:
   - film: *First — "I direct…"* / *Third — "{name} directs…"*
   - generic: *First — "I make…"* / *Third — "{name} makes…"*
   - practice: *First — "I work with…"* / *Third — "{name} works with…"*
   - entity · venture: *First — "We build…"* / *Third — "{name} builds…"*
   - service: *First — "We do…"* / *Third — "{name} does…"*
   With `displayName` blank, `{name}` renders *They*. The help line is unchanged. `[PROPOSED — D-PORT-14]`
3. **Bio and writing help** by pack (§6). Venture's *"Anything you've written"* help names *"the deck's story slide, a founder letter, an application you wrote for a grant or a residency."*

### Step 7 — Media

**Job:** unchanged: everything that is not a project image. Four changes.

- **A photo of you** renders for portfolio and practice only. Roster kinds collect headshots on step 1, per person, and asking again would be D-INT-8's failure. For roster kinds the slot is replaced by `[COPY — new]` **"The place"**: *"The studio, the property, the shop, the room where it happens. Wide shots and details both."* Field key `place`.
- **Behind the scenes** label and help by pack (§6).
- **Laurels and award graphics** becomes, for entity, venture, and service, `[COPY — new]` **"Logos, badges, and certifications"**: *"Partner logos, press logos, memberships, certifications. Only what you're allowed to show."* Same file key, so the document's Files section needs one label change.
- **Documents** — new upload slot for studio, venture, business, other. `[COPY — new]` **"Documents worth having"**: *"A deck, a one-pager, floor plans, renders, a menu, a price sheet, a brochure. We read them to understand the thing; nothing from them goes on the site unless you say so."* Field key `documents`; multiple; the upload law holds — size is the only rejection. The privacy sentence is load-bearing for a venture whose deck may be confidential, and it must appear wherever a document is accepted, in those words.
- **Logo help** by pack: entity, venture, service `[COPY — new]` *"Most organisations have one. If it's fine, send the original. If it isn't, there's an add-on for that; say so and we'll talk about it."* The add-on menu's copy says the opposite today; PORT-3's row copy for the logo refresh needs the matching pack-aware line, routed to Taylor as a checkout-copy amendment.

### Step 8 — The site itself

**Job:** unchanged. Lists and labels flex; one option set grows.

- **Pages** by pack (§6). The five-included note is unchanged and now fires against a list that contains the pages the client actually needs.
- **`howSeparate`** help by pack.
- **How should people reach you?** gains three options for non-portfolio kinds `[COPY — new]`: *An application form · A request-a-document form · A booking link*. Help gains one sentence for kinds with the ask block: *"The asks from step 4 get their own buttons. This is for everything else."* That sentence is what keeps this question and the ask block from asking the same thing (D-INT-8).
- **Availability** label and help by pack (§6). Venture: *"Should the site say where the raise, or the applications, stand?"* with the v2 caution carried word for word: *only say yes if you'll actually update it.* This is a status line, never a countdown, never a progress bar, never a percentage raised. Vesper's law 7 and D-INT-1's no-urgency posture both apply; a thermometer is manufactured urgency wearing a chart's clothes.

### Step 9 — Accounts and access

**Job:** unchanged. Two changes.

- **Where does your video live?** stays for portfolio and studio verbatim. For other kinds it folds into the tools group below, as an option.
- **Tools you already use** — new `check all that apply` for every non-portfolio kind `[COPY — new]`: *An email list (Mailchimp, ConvertKit…) · Booking (Cal.com, Calendly…) · Payments (Stripe, Square…) · A form tool · Analytics · A CRM · Vimeo or YouTube · None of these* (exclusive, §6.6 law). Followed by **"Which ones, and whose account?"** `long text`, help: *"Name the tool and say whether it's the organisation's account or somebody's personal one. Invites go to hello@tayloraucoin.com."* Keys `tools`, `toolsDetail`. The "whose account" clause is the audit's finding about founder-owned assets; it is one phrase and it is the whole fix.

The no-passwords callout, the domain cluster, `handsOn`, `bestContactMethod`, and `anythingElse` are unchanged.

---

## 5. New interaction grammar

Everything reuses the existing inventory (`Field`, `TextField`, `TextArea`, `ChoiceGroup`, `RepeatableBlock`, `FileDrop`, `ExtractionBlock`, `KnownFact`). Four compositions are new. State floors per PORTFOLIO-INTAKE-UX-SCOPE §7 apply to all of them without exception.

### 5.1 KindPicker (start form) and KindLine (step 1)

`ChoiceGroup` in radio mode, six tap-cards, no disabled options. On the start form its conditionals (disciplines; what's-it-called) reveal in place per §6.5. On step 1 it renders collapsed as a `KnownFact` line with a **Change** text link; the link swaps the line for the group in place (300ms ease, reduced-motion instant), the group autosaves on change like any radio, and the dim reassurance line (§2.4) sits under it whenever the group is open.

States: default · open · changed (the line re-collapses after autosave confirms, with the new kind; the save indicator carries the honesty) · focus-visible on the link and on each card. No error state exists; no choice is wrong.

### 5.2 TeamRoster (step 1)

Durable's two-question preamble verbatim (*Is it just you?* → *Do you want them on the site?*), then the roster as a `RepeatableBlock` with the gold mono index idiom. Per entry: name (`text`), role or title (`text`), one line about them (`text`, placeholder `[COPY — new]` *"What they're best at, in a sentence"*), **Their photo** (`FileDrop`, single, entry-keyed, PORT-5 path) revealed once the name has content. Below the block: **Who leads?** `[COPY — new]`, single select from the names entered, help *"Whose name goes first, and whose story the About page opens with."* Same grammar and same zero-state sentence as `leadRole`: with no names it explains itself instead of showing an empty group.

The roster asks names and roles even when `showTeam` is *No* — the durable step's reasoning holds (the About page still needs to know who a client deals with), and the document labels the answer accordingly.

States: inherits `RepeatableBlock` (six-second undo, always-one-block) and `FileDrop` (progress hairline, retry line, size-only refusal). The collapsed summary row (M-PORT-15) reads `index · name · role` and shows a dim `photo` mark when one exists, so nothing looks lost.

Worst-moment note: a founder adds three people on a phone. Each entry is four fields and one drop; the block collapses as they go. Nothing asks for a bio paragraph here; the "one line" is deliberately one line, and the primer or the call fills the rest.

### 5.3 AskBlock (step 4, non-portfolio kinds)

`[COPY — new]` throughout. Block label **"What you're asking people to do"**, help *"One entry per thing a visitor can do. Holistica-shaped sites often have three: invest, apply, and get in touch. A coach usually has one."* Add label *"Add another ask"*. Per entry:

| Field | Key | Control | Copy |
|---|---|---|---|
| The ask | `ask` | `pick one` | *Invest · Donate · Apply or join · Book · Buy · Subscribe · Get in touch · Something else* |
| Who it's for | `forWhom` | `text` | placeholder by pack (venture: *"Accredited investors, or anyone, or people we've met"*) |
| What they get | `getWhat` | `long text` | help *"In plain words. Ownership, a place, a session, a product, a reply."* |
| The number, if there's one | `number` | `text` | help *"A minimum, a price, tiers, a target. Leave it blank if it isn't public yet, and we'll ask on the call."* |
| How it should happen | `mechanism` | `pick one` | *A form on the site · Request a document · Book a call · A link to somewhere else · Email* |
| Where it lands | `destination` | `text` | revealed for form, request, and email · help *"The inbox or tool that should receive it. If there isn't one yet, say so; setting one up is part of the build."* |
| Show it on the site? | `visibility` | `pick one` | *Yes, front and centre · Yes, behind a request · Not yet* |

**What this block refuses to be:** a pricing table builder, a payment integration, a countdown. `number` is text so a client can write *"from €50k"* or *"tiers, not public"* without a validator arguing. `visibility: Not yet` is the calm answer for a raise that is not open, and it is rendered full-size like every "not sure".

States: inherits `RepeatableBlock`. The `destination` reveal follows §6.5. The collapsed summary row reads `index · ask · mechanism`.

### 5.4 The ink cluster — what we can say (step 4, non-portfolio kinds)

The showcase track's one ink treatment, granted for the same reason the durable track granted its own: this is the cluster that stops a false claim reaching a live site. It renders as a hairline-separated group with a mono label and an intro at **full ink** rather than dim, and nothing else on the track gets that. `[PROPOSED — D-PORT-10]`

`[COPY — new]`:

- Mono label: `WHAT WE CAN SAY`
- Intro (ink): *"These are the questions that stop us putting something on your site that isn't true. Three of them, and 'not sure' is a fine answer to all three."*
- **Who signs off on the words before they go live?** `text` — help *"You, a partner, a lawyer, a board. If it's more than one person, name them; the first look goes to them too."* Key `signOff`.
- **Anything you can't say, or can't say yet?** `long text` — help *"Returns, outcomes, guarantees, numbers that aren't public, a name under NDA. We'd rather ask than get you in trouble."* Key `cantSay`.
- **Any wording that has to be there?** `long text` — help *"A disclaimer, a registration number, 'this is not an offer', a line your college requires. Paste it exactly as it has to appear."* Key `requiredWording`.

**Alarm test, run here specifically.** The register is the v2 rights question's (*"We'd rather ask than get you in trouble"*), which is warm and already shipped. No word in the cluster is "legal", "compliance", "liability", or "risk". The intro says what the questions are *for*, which is the only reason it earns ink. A founder in fundraising mode should read this and feel looked after, not audited.

**Downstream:** the document renders the cluster as its own section directly under the asks; the admin flags (M-PORT-18) gain three: *sign-off is someone other than the contact* (so Taylor routes the first look), *can't-say is non-empty*, *required wording is non-empty*. Each stays silent when its trigger is absent, as the existing five do. The primer's criticality map marks all three quote-or-nothing.

### 5.5 DocumentDrop (step 7)

`FileDrop`, multiple, any format, entry-less. The one addition to the upload grammar is the sentence beneath the drop that says what happens to the files, and it is not optional: *"We read them to understand the thing; nothing from them goes on the site unless you say so."* Trust is a designed artefact; this promise gets one treatment and appears in these words wherever a document is accepted.

### 5.6 The uncurated gallery (step 5)

Not a component: an absence. When `examplesFor` returns a set flagged uncurated, the step omits the gallery and favourites sections and renders the §4 step-5 line in their place, dim, in flow. No card, no ring, no placeholder image reaches the DOM. The step's skipped-list entry for favourites reads as any other skipped answer.

---

## 6. Copy — every new string, by pack

All `[COPY — new]`, all drafts for Taylor's pass. The `generic` column is v2's approved string where one exists (marked *v2*) and the floor otherwise. A blank cell means the pack inherits `generic`. Film is omitted where it matches generic; its existing four strings are unchanged.

### 6.1 Start form and step 1

| Slot | generic | practice | entity (studio · other) | venture | service |
|---|---|---|---|---|---|
| Kind help | Pick the one that leads. If you're a mix, the questions inside have room for the rest. | | | | |
| What's it called, placeholder | — | | Holistica, or Northshore Physio, or whatever's on the door. | ← | ← |
| One-line label | What you do, in one line *(v2)* | | What it is, in one line | ← | ← |
| One-line help | *(v2)* | | The line that sits under the name. "A design studio in Halifax" counts. So does "A community-owned sanctuary in the hills of Umbria." We'll sharpen it together. | ← | The line that sits under the name. "Residential electricians, North Shore" counts. |
| Name label | Your name, as it should appear on the site *(v2)* | | What it's called, as it should appear on the site | ← | ← |
| Name help | *(v2)* | | The name people will search for. If the legal name is different, we'll ask about that on the last step. | ← | ← |
| How long label | How long you've been doing this *(v2)* | | How long it's been going | *(hidden; stage instead)* | ← |
| Stage label · options · help | — | | | Where it stands · An idea with a plan / Raising, not yet built / Underway / Operating · Where it honestly stands today. The site says this differently at each stage, and none of them is a bad answer. | |
| Based-in help suffix | | | | …and where the thing itself is, if that's somewhere else. | |
| Representation label · help | Representation *(v2)* | | Who speaks for it · Counsel, a broker, an investor-relations contact, a board. Who they are, and whether enquiries should go through them. | ← | ← |
| Roster: one line placeholder | What they're best at, in a sentence | | | | |
| Roster: who leads · help | Who leads? · Whose name goes first, and whose story the About page opens with. | | | | |
| Kind-change line | Changing this changes the questions, not your answers. Anything you've written stays. | | | | |

### 6.2 Step 2

| Slot | generic | practice | entity | venture | service |
|---|---|---|---|---|---|
| Intro | *(v2)* | | This site isn't for you — it's for the person deciding whether to work with you, join you, or back you. This step is about who that is. | ← | This site isn't for you — it's for the person deciding whether to call you. This step is about who that is. |
| Audiences | *(v2 list)* | Clients · Companies or teams · Event organisers · Readers · Press · Peers · Referrers (therapists, doctors, agencies) · Prospective collaborators | Clients · Agencies or brands · Partners or suppliers · Press · Recruits · Investors · Prospective collaborators | Investors or backers · Members or applicants · Residents or guests · Partners · Grant committees or funders · Press · Local government or regulators · Prospective collaborators | Customers · Property managers or businesses · Referrers and other trades · Reviewers · Suppliers · Press |
| wantMoreOf label · help | *(v2)* | What kind of work do you want more of? · The site's job is shaping what comes next. What do you want the inbox filling with? | ← | Who do you want more of? · Backers, members, partners: the site's job is shaping who shows up next. | What jobs do you want more of? · The site's job is shaping what comes next. What do you want the phone ringing about? *(v2 tail)* |
| stopAttracting label · help | *(v2)* | | | Who do you want to stop attracting? · The enquiries you'd rather not spend an hour on, even when they're flattering. | What jobs do you want to stop taking? · Work you'd rather age out of, even if it pays. *(v2 tail)* |
| whatYouAreNot help | *(v2)* | "I'm not a life coach" or "I'm not the cheap option" — whatever's true. | "We're not an agency" or "we don't do rush jobs" — whatever's true. | "We're not a resort" or "this isn't a timeshare" — whatever's true. | "We're not the cheapest" or "we don't do commercial" — whatever's true. |
| afterOneVisit help | *(v2)* | The impression, in your own words. "Someone who'll tell me the truth" reads differently from "someone who's done this a hundred times" — both are good answers. | The impression, in your own words. "A studio I'd trust with the whole thing" reads differently from "the people who make the strange, beautiful ones" — both are good answers. | The impression, in your own words. "People who've actually done this before" reads differently from "a place I want to be part of" — both are good answers. | The impression, in your own words. "They'll show up when they say" reads differently from "the ones who do it properly" — both are good answers. |

### 6.3 Step 3

| Slot | generic | practice | entity | venture | service |
|---|---|---|---|---|---|
| Paste intro | *(v2)* | Paste everything — your LinkedIn, your old site's about page, your CV, a speaker bio. One big messy blob is perfect. | Paste everything — the about page, the team page, a capability deck, LinkedIn for the principals. One big messy blob is perfect. | Paste everything — the deck's team and story slides, LinkedIn for the founders, the origin story off the old site. One big messy blob is perfect. | Paste everything — the old site's about page, a Google Business description, a CV. One big messy blob is perfect. |
| Entry placeholders (what · where · category) | *(v2)* | Adjunct — Executive Coaching · Sauder School of Business · Teaching, consulting, speaking… | Studio founded · Vancouver · Founding, partnerships, awards… | Founder · Holistica Properties · Founding, prior ventures, advisory… | Owner-operator · Northshore Electric · Trades, licences, community… |
| awards label · help | *(v2)* | | Recognition, grants, and milestones · Awards, grants, press mentions, a milestone worth a date — the first hire, the first location, the first thousand. | ← | Recognition, grants, and milestones · Awards, certifications, a trade association's recognition, a milestone worth a date. |
| kindWords help | *(v2)* | Things clients have said about working with you — paste from emails or texts. One or two is plenty. | Things clients, partners, or people you've worked with have said — paste from emails or texts. One or two is plenty. | ← | Things customers have said — paste from emails, texts, or reviews. One or two is plenty. |
| notableNames help suffix | | | | Backers, partners, advisors, anyone whose name is already attached. And whether you're allowed to say so. | |

### 6.4 Step 4

| Slot | generic | practice | entity (studio) | venture | service |
|---|---|---|---|---|---|
| Step title | The work *(v2)* | What you offer | The work *(v2)* | What you're building | What you offer |
| Intro lead | *(v2)* | Now what you actually offer — the engagements, sessions, talks, or books people come to you for. | Now the work itself — the projects the studio has made. | Now the thing itself — what exists, what's planned, and what you're asking people to be part of. | Now what you actually do — the services people call you for. |
| Intro tail | *(v2)* | Add as many as you want; there's no cap. Don't aim for polished — aim for honest. | *(v2)* | Add what's real and what's planned, and say which is which. Don't aim for polished — aim for honest. | Add as many as you want; there's no cap. Rough prices are fine. |
| Paste intro | *(v2)* | Same trick as the last step — paste your services page, a rate card, a speaker one-sheet, or the offers off your old site, and hit the button. | Same trick — paste the studio's project list, case-study titles, or the work page off the old site. | Same trick — paste the deck's product, phases, and offering slides, or the old site's vision and amenities pages. | Same trick — paste your services page, a price list, or a quote you've sent, and hit the button. |
| Block label · add label | Your projects · Add another project *(v2)* | What you offer · Add another offer | *(v2)* | What you're building · Add another piece | Your services · Add another service |
| Lead label · help (reel) | *(v2 generic)* | *(hidden)* | *(v2 generic)* | *(hidden)* | *(hidden)* |
| Organisation options | *(v2)* | By who it's for · By format — sessions, talks, writing · One page, top to bottom · You decide — I trust the design · Something else | *(v2)* | By what exists vs. what's planned · By who it's for — investors, members, visitors · One story, top to bottom · You decide — I trust the design · Something else | By service · By who it's for — homes, businesses · One list, no filters · You decide — I trust the design · Something else |
| Ask block (all strings) | §5.3 | | | | |
| Ink cluster (all strings) | §5.4 | | | | |

### 6.5 Steps 5 to 9

| Slot | generic | practice | entity | venture | service |
|---|---|---|---|---|---|
| Dark/light help | Sites like this run either way. Go with what you'd want to open at night. | | Most sites for a place or a project run light so the photography carries it. Yours doesn't have to. | ← | Most service sites run light; it reads as open for business. Yours doesn't have to. |
| Voice-note prompt | *(v2)* | Record a 2–3 minute voice memo on your phone answering two things: how did you end up doing this, and tell us about one person you helped and what changed for them. Don't script it. This is the single most useful thing you can give us. | Record a 2–3 minute voice memo on your phone answering two things: how did this start, and what's the thing you've made together that you're proudest of. Don't script it. This is the single most useful thing you can give us. | Record a 2–3 minute voice memo on your phone answering two things: why does this need to exist, and what does it look like if it works. Don't script it. This is the single most useful thing you can give us. | Record a 2–3 minute voice memo on your phone answering two things: how did you get into this, and tell us about a job that went exactly right. Don't script it. This is the single most useful thing you can give us. |
| Voice-note skip suffix (roster kinds) | | | More than one of you? One each is ideal. | ← | ← |
| Person options | §4 step 6 | | | | |
| Bio help | *(v2)* | Paste whatever exists — old site, speaker bio, LinkedIn, a book jacket. All versions welcome. | Paste whatever exists — old site, a deck, LinkedIn for the principals. All versions welcome. | ← | Paste whatever exists — old site, Google Business, a flyer. All versions welcome. |
| Writing help | *(v2)* | Talks, articles, a newsletter, a book chapter, a workshop handout — anything in your own words. | Case studies, a manifesto, proposals you're proud of — anything in your own words. | The deck's story slide, a founder letter, an application you wrote for a grant or a residency — anything in your own words. | Quotes, a flyer, an email you send every customer — anything in your own words. |
| The place label · help | — | | The place · The studio, the property, the shop, the room where it happens. Wide shots and details both. | The place, as it is now · The property, the land, the renders, the drone shots, the team on site. Honest beats polished. | The place · The shop, the van, the workshop. Wide shots and details both. |
| Behind the scenes help | *(v2)* | You with clients, on stage, at a desk. This is where the site gets its humanity. | The team at work. This is where the site gets its humanity. | The team on site, at the table, in the field. This is where the site gets its humanity. | You on the job. This is where the site gets its humanity. |
| Logos label · help | *(v2 laurels)* | | Logos, badges, and certifications · Partner logos, press logos, memberships, certifications. Only what you're allowed to show. | ← | ← |
| Documents label · help | — | | Documents worth having · A deck, a one-pager, floor plans, renders, a menu, a price sheet, a brochure. We read them to understand the thing; nothing from them goes on the site unless you say so. | ← | ← |
| Logo help | *(v2)* | | Most organisations have one. If it's fine, send the original. If it isn't, there's an add-on for that; say so and we'll talk about it. | ← | ← |
| Pages | *(v2)* | Home · About · Services or offers · Speaking or events · Books or writing · Testimonials · Contact · Booking | Home · Work · About · Team · Services · Press or news · Contact | Home · The vision · The place · Team · The offering · Apply or join · FAQ · Press or news · Contact · Legal | Home · Services · Pricing · About · Reviews · Service area · FAQ · Contact · Booking |
| howSeparate help | *(v2)* | A company booking a keynote and a person booking a session want different things. Different pages? Different sections? Or does one of them belong on a separate site entirely? | A client looking at the work and a designer looking to join want different things. Different pages? Different sections? | An investor reading the model and someone applying to live there want different things. Different pages? Different sections? Or does one of them belong behind a request? | A homeowner and a property manager want different things. Different pages? Different sections? |
| Reach options (added) | — | An application form · A request-a-document form · A booking link | ← | ← | ← |
| Reach help suffix (ask kinds) | | The asks from step 4 get their own buttons. This is for everything else. | ← | ← | ← |
| Availability label · help | *(v2)* | Should the site say whether you're taking clients? · "Taking new clients from March" can prompt the email. It also needs updating — only say yes if you'll actually update it. | Should the site say whether you're taking work? · *(same caution)* | Should the site say where the raise, or the applications, stand? · "Founding round open" or "Applications open for 2026" can prompt the click. It also needs updating — only say yes if you'll actually update it. | Should the site show booking availability? · *(same caution)* |
| Tools label · options · detail · help | Tools you already use · An email list (Mailchimp, ConvertKit…) / Booking (Cal.com, Calendly…) / Payments (Stripe, Square…) / A form tool / Analytics / A CRM / Vimeo or YouTube / None of these · Which ones, and whose account? · Name the tool and say whether it's the organisation's account or somebody's personal one. Invites go to hello@tayloraucoin.com. | | | | |
| Accounts help | *(v2 generic)* | Wherever you already show up — LinkedIn especially. | Wherever the studio already lives — Instagram, Behance, LinkedIn. | Wherever the project already lives — Instagram, LinkedIn, a crowdfunding page, a newsletter. | Google Business especially, if you have a listing — people check it. |

### 6.6 Document labels

Every new key needs a line in `showcase-answer-labels.ts`, in Taylor's third-person register. `[COPY — new]`: `kind` "Kind of site" · `stage` "Where it stands" · `justYou` "Just them, or a team" · `showTeam` "Team on the site" · `people` "The people" · `name` "Name" · `line` "One line about them" · `leadPerson` "Who leads" · `offerings` "What they offer" · `pieces` "What they're building" · `services` "Services" · `format` "Format" · `scope` "Scope" · `pricePosture` "Price on the site" · `price` "Price" · `included` "What's included" · `duration` "How long it takes" · `takesLonger` "What makes it take longer" · `status` "Status" · `asks` "What they're asking people to do" · `ask` "The ask" · `getWhat` "What they get" · `number` "The number" · `mechanism` "How it happens" · `destination` "Where it lands" · `visibility` "Shown on the site" · `signOff` "Who signs off on the words" · `cantSay` "What they can't say" · `requiredWording` "Required wording" · `tools` "Tools they already use" · `toolsDetail` "Which tools, and whose" · file keys `headshot` "Their photo" · `place` "The place" · `documents` "Documents".

---

## 7. Convergence tests — run against the venture path

Run on the Holistica path specifically, because it exercises every new group.

- **Worst-moment.** A founder, on a phone, at night, with a deck open in another app. Step 1: paste the deck into the primer, pick nothing else, continue. Step 4: three asks at seven fields each, collapsing as they go; the claims cluster is three questions with "not sure" as a legal answer. No count, no meter, no field that must be finished. Passes, on the condition that the primer (PORT-10) ships; without it the venture path is honest but long, and the paste boxes on 3 and 4 carry the load.
- **Register.** Every new string is in the v2 voice: second person, plain, one wry half-clause at most, no exclamation marks, "not sure" honoured. The ink cluster borrows its warmest line from a shipped v2 string. Flagged for Taylor's pass regardless; this test is his to close.
- **Trust.** Two new promises: documents are read, not published; the "where it lands" field asks for an inbox, never a credential. Both get one treatment and one wording. The no-passwords callout is unchanged and still opens step 9. Nothing on the ask block takes money or implies it will.
- **Alarm.** The claims cluster contains no legal vocabulary and its intro states its purpose. The stage question's four options are all acceptable answers. The availability line forbids the thermometer. Passes.
- **Contrast.** Zero new colours. Ink intro on the cluster is `--color-ink`; mono label `--color-dim`; everything else inherits the step's existing tokens. CON-08's owed audit of the `[token]` flows should include step 4 after this lands.
- **State.** Every new composition inherits a floor-complete primitive and adds at most one conditional reveal, all listed in §5. The uncurated gallery is an absence with one line, which has no states to design.
- **Drift.** Kind picker, roster, ask block, and cluster all render in the intake's existing card, hairline, and mono-index grammar. A dashboard template would put the asks in a table with a status pill; this puts them in the same repeatable block as a filmography.
- **Buildability.** Every field has a key, a control, a label, and a home; every conditional names its trigger; the pack slots are enumerated; the resolver change is one function's input. What Mason still has to decide is listed in §9.

---

## 8. Holistica, after

The audit's dry run, re-run against this scope.

| Step | Before | After |
|---|---|---|
| Start | Nothing fits; both answers ignored | Picks *A venture or project*; types *Holistica*; gets the venture pack everywhere |
| 1 | Subject is a person; two team members homeless | Pastes the deck into the primer. Name is *Holistica*. Stage: *Raising, not yet built*. Roster: Amy, Alexis, Taylor with photos; Amy leads. *Who speaks for it* catches counsel |
| 2 | One checkbox fits | Investors or backers · Members or applicants · Residents or guests · Press. Direction questions ask about backers and members |
| 3 | Career-shaped | Paste intro names the deck's team slides; awards become milestones; notable names asks about backers and permission |
| 4 | **Fails** | *What you're building*: the property (Underway, 2026), Phase 1 residences (Planned), the retreat programme (Planned). Three asks: Invest → request a document → deck inbox → behind a request; Apply or join → form → applications inbox → front and centre; Get in touch → email. Claims: sign-off is Amy and counsel; can't say returns; required wording pasted |
| 5 | **Blocked** on placeholders | Gallery absent with an honest line until the venture set is curated; radios, three words, links, brain dump all still collected |
| 6 | Reads another client's name | *First — "We build…" / Third — "Holistica builds…"*; voice prompt asks why it needs to exist; one note each invited |
| 7 | Told they don't need their logo | The place (property, renders, drone); logos and badges; documents (the deck, floor plans) with the not-published promise; logo help says send the original |
| 8 | One of eight needed pages offered | Vision · The place · Team · The offering · Apply or join · FAQ · Press · Contact · Legal on the list; over-five note fires honestly; reach adds an application form and a request form; status line asks about the raise with the update caution |
| 9 | Asked about video only | Tools: email list, form tool, payments; *whose account* answered; invites routed |

**Net, after:** nine of nine steps collect what the build needs. The three facts the audit found captured nowhere, entity with a team, soliciting money, regulatory exposure, are each a named group with a document section and an admin flag.

---

## 9. Component inventory and handoff notes for Mason

**Reused as-is:** `StepShell`, `Field`, `TextField`, `TextArea`, `ChoiceGroup`, `RepeatableBlock`, `FileDrop`, `ExtractionBlock`, `KnownFact` (promote from `step-about.tsx` to the shared components folder), `SaveIndicator`, the collapse presentation from `ProjectEntry`.

**New compositions (inventory is mine; placement is yours):** `KindPicker` / `KindLine` (§5.1) · `TeamRoster` (§5.2) · `AskBlock` (§5.3) · `InkCluster` (§5.4, a presentation wrapper: mono label + ink intro + children) · `DocumentDrop` (§5.5, `FileDrop` plus the promise line) · `OfferEntry` / `PieceEntry` / `ServiceEntry` (three `RepeatableBlock` render functions beside `ProjectEntry`, sharing its collapse).

**What forks tech, so it is scoped once:**

- **`kind` storage.** Reading it from `answers.about.kind` is zero-migration and `flavourFor` already reads answers; a column is better once the admin wants to filter by it. Recommend answers-doc first, reversible. The derivation from `siteKinds` for existing rows lives in the resolver, not a backfill.
- **`business_name` from the start form** for non-portfolio kinds (M-PORT-3 amendment).
- **Pack registry**: `SHOWCASE_COPY` widens from two packs and four slots to six packs and ~30 slots with fall-through to generic. `showcaseSteps(pack)` flexes step 4's title and intro. `copyPackFor` stays the one read seam.
- **`examplesFor(pack, disciplines)`** with an `uncurated` flag per set; the stub file is deleted, not kept as a set.
- **Schemas**: new keys per §4 in `showcase-intake.ts`, labels per §6.6, all three together or the answer drops on save (the validator file's own law).
- **Extraction** gains modes `people` (blob → roster entries) and `offer` (blob → offerings / pieces / services by kind, and asks); output schemas derived from the entry schemas as PORT-6 did. The `experience` prompt's source list widens per pack.
- **Primer** criticality map adds `stage`, `number`, `destination`, `signOff`, `cantSay`, `requiredWording`, `price` as quote-or-nothing; its non-critical allowlist is unchanged.
- **Output document** (`output.ts`): sections for the roster, the asks, and the claims cluster; three new flags per §5.4.
- **Admin review surface**: the flags render where the existing five do; nothing else changes.
- **Person-option interpolation** on step 6 reads `about.displayName` client-side; no new data.
- **Marketing page**: `/websites/coded`'s hero and the logo add-on's row copy both contradict this scope. Copy, not design; routed to Taylor and the marketing role, not built here.

---

## 10. Assumptions and open items

**Assumptions (labelled, reversible):**

- `[ASSUMPTION]` No existing coded-track engagement is a non-portfolio; the `siteKinds` derivation keeps them rendering unchanged.
- `[ASSUMPTION]` PORT-10 (the primer) ships before or with this; the venture path's worst-moment test leans on it.
- `[ASSUMPTION]` The five-included-pages count and $150 extra-page price hold for every kind. A venture routinely needs eight to ten; that is a pricing conversation this scope surfaces honestly on step 8 rather than a number it changes.
- `[ASSUMPTION]` One ink treatment per flow is the law, by analogy with D-INT-3's one ring per flow.

**Open — need Taylor:**

1. **The ninety strings in §6.** Human-hand pass. The venture and service packs are the ones a real client meets first.
2. **The logo add-on's checkout copy** contradicts the entity logo help. One of them changes.
3. **Gallery curation, six sets.** Until a set exists its kind gets the absent-gallery state. Which sets to curate first: `venture` (next client), then `service` and `practice`.
4. **The marketing hero.** "Websites for creative work" versus a start form that sells five other things.
5. **Whether `other` should exist.** It is the honest option for a nonprofit or a hospitality kind this scope did not name. The alternative is naming them; that is two more packs. Recommend keeping `other` and adding packs as real clients arrive.

**Open — routed to Mason:** everything in §9, plus whether `kind` becomes a column now or later.

---

## 11. Proposed decision log — D-PORT-8 through 14

For ratification; cite by ID once ruled.

- **D-PORT-8** `[PROPOSED]` — One single-select **engagement kind** on the start form is the flavour input; the multi-select site-kind group retires. Disciplines are asked only for portfolio and studio and refine within the portfolio pack.
- **D-PORT-9** `[PROPOSED]` — Nine steps hold. Step 4 is the one kind-shaped step (title, intro, entry shape, the ask block, the claims cluster). Every other step flexes strings and option lists only; kind-gated groups are present or absent, never revealed.
- **D-PORT-10** `[PROPOSED]` — The claims cluster is the showcase track's single ink treatment, granted on step 4 for every non-portfolio kind, for the same reason the durable track granted its own.
- **D-PORT-11** `[PROPOSED]` — Changing kind after start changes questions, never answers. Keys persist; no deletion path exists; the reassurance line states this in words.
- **D-PORT-12** `[PROPOSED]` — Gallery sets are keyed by pack. An uncurated set renders the taste step without the gallery, with one honest line. No placeholder art reaches a client.
- **D-PORT-13** `[PROPOSED]` — The roster reuses the durable track's two-question preamble verbatim and the showcase track's entry-keyed uploads; one photo per person; no per-person show flag.
- **D-PORT-14** `[PROPOSED]` — Step 6's person-voice options interpolate the step-1 name; no client's name is ever a literal in shipped copy, on any track.

---

## 12. Tickets — PORT-11 through 17, with build order

Sizes and dependencies for `specs/00-build-order.md`. Every ticket closes in three places per the folder's law.

**Hotfix, before anything, one thread, ten minutes:** `step-words.tsx` person options → name interpolation per D-PORT-14, generic verb. Removes another client's name from every client's screen today.

| Ticket | Title | Size | Depends on |
|---|---|---|---|
| PORT-11 | **Kind**: start-form picker with conditionals, `business_name` from the form, `kind` in answers with `siteKinds` derivation, resolver rewire, pack registry widened to six with fall-through, step 4 title/intro flex | M | PORT-1, 2 |
| PORT-12 | **Copy packs**: the §6 strings landed as pack slots; option lists for audiences, organisation, pages, reach; document labels. Gated on Taylor's pass | M | PORT-11 |
| PORT-13 | **Step 1**: kind line with change, entity name label, stage, `TeamRoster` with headshots and lead, representation flex | M | PORT-11 |
| PORT-14 | **Step 4 by kind**: `OfferEntry` / `PieceEntry` / `ServiceEntry`, `AskBlock`, `InkCluster`, hidden reel/topFive, collapsed-row variants; output sections and three flags; primer criticality additions | L | PORT-11, 13 |
| PORT-15 | **Steps 2 · 7 · 8 · 9**: pack-driven lists, the place, logos, `DocumentDrop` with its promise, reach additions, availability flex, tools group | M | PORT-12 |
| PORT-16 | **Taste sets by pack** with the uncurated-absent state; stub file deleted; curation contract per set in the content folder header | S | PORT-11 |
| PORT-17 | **Extraction modes** `people` and `offer`; widened `experience` sources per pack; eval cases for each mode (a deck; a rate card; a team page) | M | PORT-6, 14 |

**Order:** hotfix → 11 → (12 ∥ 13 ∥ 16) → 14 → 15 → 17. PORT-14 is the thread to protect: it carries the ask and the claims cluster, and its failure mode is a working screen that quietly omits "not yet" or renders the cluster dim.

---

## Sign-off

I have read the audit, the v2 doc, the two UX scopes, the D-INT and D-PORT logs, M-PORT-1 through 20, and every step component on both tracks. The finding was right: the machine is sound and the cartridge is wrong. The fix above is one answer, one step, and a table of strings, and it holds nine steps, one ring, one ink treatment, zero required fields, zero new colours, and zero new components that are not compositions of ones already shipped.

What I am recommending, in one sentence: **ask what the site is for, once, and let that one answer choose the words, the lists, and the shape of step 4, so a founder raising money and a filmmaker cutting a reel each meet a form that was plainly written for them.**

What I am not deciding: the ninety strings (Taylor's), the six gallery sets (Taylor's), the pricing of a ten-page venture site (Taylor's), and where `kind` lives in the database (Mason's).

Tradeoff named: single-select kind costs the mixed client one gallery. It buys every client a form that is certain about who it is talking to. For this product, certainty is the brand.

— Vesper
