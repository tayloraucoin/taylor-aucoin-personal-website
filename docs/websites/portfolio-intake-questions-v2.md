# Portfolio intake — full walkthrough (v2)

Every screen, question, and line of copy, in the order a client experiences it.
Field types in `backticks`. Conditional questions marked *(shows only if…)*.
Every question is optional, always — same law as the existing intake.
The start form asks what kind of work the portfolio holds; that answer picks the example-site set for the taste step and flavours the copy throughout. This doc shows the **film** flavour; flex points are marked inline with their generic fallback.

Changes from v1: add-on menu and pay-in-full option on the payment screen · "Sort this for me" paste-a-blob extraction on Experience and The Work · Experience vs Work distinction made explicit · per-project images, no project cap · taste catch-all (images, links, brain dump) · extra-page pricing surfaced on the pages step · invites routed to hello@tayloraucoin.com · admin panel moved to checkout · three-day first look on the done screen · discipline question on the start form, with copy that flexes to it.

---

## Start form — public, before payment

**Your name** `text`

**Email** `email`
Blur validation: "That doesn't look like an email address — check for a typo."

**Phone** `phone`
Help: So Taylor can reach you about the build.

**What you do, in one line** `text`
Placeholder: Director and camera operator in Vancouver

**What kind of site is this?** `check all that apply`
- Portfolio — your creative work is the product
- Consultant or coach *(coming soon — disabled)*
- Speaker or author *(coming soon — disabled)*
- Studio or small team *(coming soon — disabled)*

Help: More categories open soon. If you're a mix, check everything that's true.

**What's the work?** `check all that apply`
- Film or video
- Photography
- Design
- Illustration or fine art
- Music or performance

**Something else?** `text`

Help: This decides which example sites you'll review later, and how we talk about your work inside. Check everything that's true.

**Current website** `url`
Help: If you have one. Leave blank if you don't.

---

## Payment screen — after the start form, before step 1

**The build is $2,000.**
Five pages, your work fully produced, real code you own, hosting that costs close to nothing. Extra pages are $150 each — you'll pick pages inside, and nothing extra is ever charged without a conversation first.

**How would you like to pay?** `pick one`
- Half now, half before launch — **$1,000 today**
- All up front, 5% off — **$1,900 today**

**Worth adding?** `check any` — each row has an info button, same pattern as the existing checkout
- **Admin panel — $500** · A private login where you change copy and swap images yourself, no code involved. Most people do fine without it — the site comes with a guide for editing it yourself either way.
- **Logo / wordmark refresh — $250** · Most portfolio sites don't need a logo; your name in good type usually does it better. This is for when you want the mark anyway.
- **Booking setup — $250** · A booking page wired to your calendar, for coaching, teaching, or consults. Honestly: you can set Cal.com up yourself in an afternoon — this is for skipping the afternoon.
- **Care plan — $100/mo** · Email me a change, it's live within 48 hours — plus I keep the underlying software current. Cancel whenever; the site never depends on it.

*(Payment runs through the same Stripe checkout as the existing flow. Add-ons charge with today's payment.)*

---

## Welcome screen — after payment

**Nine steps. Every one of them optional.**

Budget about 45 minutes — longer if your back catalogue runs deep. It saves as you type, so leave and come back whenever; your link always brings you back to where you were.

Skip anything. A skipped question just means we ask on a call, or leave it out. The more you give us here, the closer the first version lands to the site you actually want.

---

## Step 1 of 9 — About you

**Your name, as it should appear on the site** `text`
Help: If you go by something different professionally, use that.

**What you do, in one line** `text` *(prefilled from start form)*
Help: The line that sits under your name. "Director / Camera / Editor / Teacher" counts. So does something looser. We'll sharpen it together.

**Your roles** `repeatable block` — add button: "Add another role"
Per entry:
- **Role** `text` — placeholder: Director

**Which role leads?** `text`
Help: If a stranger could only know one thing you do, which is it?

**How long you've been doing this** `text`
Help: "Since 2008" or "about fifteen years" — either is fine.

**Where you're based** `text`
Placeholder: Vancouver, BC
Help: And how far the work travels, if that matters — "Vancouver-based, works anywhere" is a common shape.

**Who we'll be dealing with** `text` *(prefilled)*

**Best phone number** `phone` *(prefilled)*

**Email** `email` *(prefilled)*

**Union or guild memberships** `long text`
Help: IATSE, DGC, a guild, a professional college — with the category or number if it matters. We only list what's current.

**Representation** `long text`
Help: Agent, manager, or rep — who they are, and whether enquiries should go through them.

---

## Step 2 of 9 — Who this site is for

*Step intro:* A portfolio isn't for you — it's for the person deciding whether to work with you. This step is about who that is.

**Who ends up on your site?** `check all that apply`
- Producers or production companies
- Agencies or brands
- Direct clients
- Festivals or programmers
- Students or their parents
- Press
- Recruiters or employers
- Other people in my field

**Anyone else?** `text`

**Who matters most?** `text`
Help: If the site could only impress one of them, which one?

**What should they do next?** `long text`
Help: For each kind of visitor — watch the reel, email you, book a call, pass your name along. Plain words are fine.

**What work do you want more of?** `long text`
Help: The site's job is shaping what comes next, not cataloguing what came before. What do you want the phone ringing about?

**What do you want to stop attracting?** `long text`
Help: Work you'd rather age out of — even if it pays.

**Why do people pick you?** `long text`
Help: What people say when they recommend you — not what you'd write in a cover letter.

**What are you not?** `long text`
Help: "I'm not the cheap option" or "I'm not a corporate video guy" — whatever's true.

**After one visit, what should someone think of you?** `long text`
Help: The impression, in your own words. "Someone you'd trust with a crew" reads differently from "someone who makes strange, beautiful things" — both are good answers.

---

## Step 3 of 9 — Experience and proof

*Step intro:* Think of this as the LinkedIn layer: positions, memberships, ongoing roles — the timeline your career sits on. The individual films and projects that timeline produced come in the next step. This one is where you've worked, taught, founded, and belonged.

**The fast way** `long text` + button
Copy above the box: Paste everything — your LinkedIn, your old site's about page, your CV, your IMDb bio. One big messy blob is perfect.
Placeholder: Paste it all here — don't tidy it.
Button: **Sort this for me**
After the button runs: Entries appear below, filled in. Fix anything we got wrong — nothing saves as fact until you've seen it.

**Your experience** `repeatable block` — add button: "Add another"
Help: Positions, ongoing roles, things you founded, programs you run. "Feature this" marks the ones that should be impossible to miss.
Per entry:
- **What it is** `text` — placeholder: Instructor — Film Production
- **Where** `text` — placeholder: LaSalle College
- **When** `text` — placeholder: 2019–now
- **What to say about it** `long text` — placeholder: A sentence or two — or leave it and we'll ask
- **Category** `text` — placeholder: Teaching, directing, community…
- **Feature this** `checkbox`

**Awards, grants, and festival selections** `long text`
Help: Every prize, nomination, grant, and official selection you can remember — festival names and years included. Festivals hand out laurel graphics for these; there's a spot for the files in the media step.

**Press** `long text`
Help: Reviews, interviews, write-ups. Paste quotes or links.

**Kind words** `long text`
Help: Things clients, collaborators, or students have said about working with you — paste from emails or texts. One or two is plenty.

**Can we publish those?** `checkbox`
Box label: Yes — these are real, and the people who said them would be fine seeing them on my site.

**Notable names** `long text`
Help: Clients, companies, or people you've worked with that carry weight — and, honestly, whether you're allowed to say so publicly. "Worked with them, can't name them" is useful to know too.

---

## Step 4 of 9 — The work

*Step intro:* Now the work itself — the films, videos, and projects the last step's career produced. Add as many as you want; there's no cap. Don't aim for polished — aim for honest, and lead with what you'd show first.
*(Flexes by discipline — generic: "Now the work itself — the pieces the last step's career produced." Photography: "the shoots, series, and commissions…" Art: "the pieces, series, and shows…")*

**The fast way** `long text` + button
Copy above the box: Same trick as the last step — paste your filmography, credit list, IMDb page, or the projects off your old site, and hit the button.
Placeholder: Paste it all here — don't tidy it.
Button: **Sort this for me**
After the button runs: Projects appear below, filled in as far as the blob allowed. Add links and images to the ones that matter.

**Your projects** `repeatable block` — add button: "Add another project"
Per entry:
- **Title** `text`
- **Year** `text`
- **Your role on it** `text` — placeholder: Director · or: Camera op / editor
- **What kind of thing it is** `text` — placeholder: Short film, commercial, music video, EPK…
- **Who it was for** `text` — placeholder: Client, production company, network — if any
- **Where to watch** `url` — placeholder: Vimeo or YouTube link
- **Password, if the link has one** `text`
  Help: Share passwords only — the kind Vimeo puts on a private link. Never an account password; we don't take those.
- **Images for this project** `file upload, multiple, images`
  Help: Stills, frames, the poster — a few is ideal, more is fine.
- **The story, in a sentence or two** `long text`
  Help: What it is, and anything worth knowing — it was shot in a night, the budget was $500, Aubrey Plaza is in it.
- **Credits worth listing** `long text`
  Help: The collaborators who should be named.
- **Awards or selections for this one** `long text`
- **Are you allowed to show it?** `pick one`
  - Yes — it's public
  - Yes, but there are rules — ask me
  - Not sure — check with me
  Help: Studio and client work sometimes comes with strings. We'd rather ask than get you in trouble.
- **Where it belongs** `pick one`
  - Front and centre
  - In the archive
  - Leave it off for now

**Which piece is *the* reel?** `text`
Help: The one video a stranger should see first. If you don't have a current reel, say so — the site can lead with your best piece instead, and we'll note the reel needs a refresh.
*(Flexes by discipline — generic label: "Which piece leads?" with help "The one thing a stranger should see first.")*

**If you could only show five** `long text`
Help: Which five, in what order? This tells us more than any rating.

**How should the work be organized?** `check all that apply`
- By role — directing, camera, editing
- By type — films, commercials, music videos
- One curated grid, no filters
- By who it's for
- You decide — I trust the design

**Anything else?** `text`

**Say more about that** `long text`
Help: How you imagine someone moving through the work. Checked more than one above? This box is where you think out loud — we'll read it carefully.

---

## Step 5 of 9 — Taste

*Step intro:* This is how we skip the part where a designer shows you three drafts you don't like. Below are real portfolio sites from across the whole spectrum. Go with your gut — the pattern in your reactions is what we're after.

**The gallery** `custom block — one card per example site`
Each card shows a screenshot set and a "Visit site" link, plus two actions:
- **Add to favourites** `toggle`
- **Add a note** `long text, revealed on tap`
  Placeholder: What catches you — good or bad. A detail, a feeling, the type, the way it moves.

**Your favourites** `ranked list — appears below the gallery`
Instruction copy: Drag your favourites into order, best first. Then tell us why — the why is worth more than the order.
Each favourite shows its note, open for editing.

**Dark or light?** `pick one`
- Dark
- Light
- Could go either way
Help: Most film sites run dark so the footage glows. Yours doesn't have to.
*(Flexes by discipline — photography/art: "Most gallery sites run light so the work hangs clean. Yours doesn't have to.")*

**How still should it be?** `pick one`
- Dead still — nothing moves
- Quiet — small, settled movement
- Alive — motion is part of the personality

**How much on screen at once?** `pick one`
- Almost nothing — one thing at a time
- Balanced
- Rich — I like density

**Three words the site should feel like** `text × 3`
Help: One per box.

**And one thing it must never feel like** `text`

**Anything else that's caught your eye** `file upload, multiple, images`
Help: Screenshots you've saved, posters, album covers, a photo of a book jacket — anything whose look you'd steal.

**Links worth a look** `long text`
Help: Sites, videos, profiles, Pinterest boards — paste anything you'd want us to see, from any field.

**The brain dump** `long text`
Help: Everything about look and feel that the questions above didn't catch. Half-formed is fine — "I like when the type is huge" is a real instruction.

**Anything that makes you close a tab instantly?** `long text`
Help: Pet hates. Autoplay music, tiny grey text, whatever it is.

---

## Step 6 of 9 — Your words

*Step intro:* Most portfolio bios read like a stranger wrote them in a hurry. This step is how we make the site sound like you.

**Voice note** `file upload — the one gradient-ring moment, same as the existing flow`
Prompt copy: Record a 2–3 minute voice memo on your phone answering two things: how did you get into this, and what's a piece of work you're proud of — and why? Don't script it. This is the single most useful thing you can give us.
Skip line beneath, same as existing.

**Your current bio** `long text`
Help: Paste whatever exists — old site, festival program, LinkedIn. All versions welcome.

**Keep my wording** `checkbox`
Box label: Where I've written something myself — bio, project notes, experience blurbs — keep it. Fix typos, change nothing else.
Help: Unchecked, we treat everything you've pasted as raw material and write from it.

**First person or third?** `pick one`
- First — "I direct…"
- Third — "Kryshan directs…"
- Not sure — you pick
Help: Third person reads like a program note; first person reads like a letter. Both work.

**Anything you've written** `file upload, multiple`
Help: Artist statements, director's notes, grant applications, captions — anything in your own words.

**Or paste it here** `long text`

**Words or phrases you'd never use** `long text`
Help: "Visual storyteller," "passionate" — whatever makes you wince.

**Can we record our calls with you?** `checkbox`
Help: Only the calls about your site, and only so the writing sounds like you.
Box label: Yes — we use it to make the writing sound like you.

---

## Step 7 of 9 — Media

*Step intro:* Project images live with their projects back in step 4. This step is everything else — and original files beat compressed copies every time.

**A photo of you** `file upload, image`
Help: For the about page. A real photo beats a stock one every time — a still of you working is even better.

**Behind the scenes** `file upload, multiple, images`
Help: You on set, behind a camera, teaching. This is where the site gets its humanity.

**Laurels and award graphics** `file upload, multiple`
Help: Festivals send these as PNGs. Whatever you've got.

**Do you have a logo or wordmark?** `pick one`
- Yes, I have one
- No — my name in good type is fine
- Have one, but I hate it
Help: Most portfolio sites don't need a logo — a well-set name usually does it better.

**Your logo file** `file upload` *(shows only if "Yes" or "hate it")*
Help: The original file if you have it — otherwise any version.

**Anything else with your name on it** `file upload, multiple`
Help: Posters, title cards, business cards, the old site — it helps us work out what you've already got going.

**Colours you're drawn to** `text`

**Anything you dislike** `long text`
Help: Colours, styles, or a site that makes you cringe.

---

## Step 8 of 9 — The site itself

*Step intro:* The shape of the thing — what pages exist and what each one is for. Five pages are included in the build; extra pages are $150 each, and we'll always confirm with you before anything is charged. Project detail pages don't count — they come with the work section.

**Pages you're imagining** `check all that apply`
- Home
- Work / projects
- A reel page
- About
- Contact
- A page for teaching or services
- Press / news

**Something else?** `text`

Help (under the group): Check what feels right — we'll push back if something's missing or unnecessary, and flag it before anything goes past the five included.

**If you do more than one thing, how separate should they be?** `long text`
Help: A producer looking at your reel and a parent looking at your film camp want different things. Different pages? Different sections? Or does one of them belong on a separate site entirely?

**How should people reach you?** `pick one`
- An email link — no form
- A short form
- Both
- Through my rep
Help: Forms filter people; a bare email converts. For portfolios we usually recommend the email.

**Should the site say whether you're available?** `pick one`
- Yes — show availability
- No
- Not sure
Help: "Booking for fall 2026" can prompt the email. It also needs updating — only say yes if you'll actually update it.

**Your old site: what must survive?** `long text`
Help: Anything on the current site that has to carry over — and anything that should die with it.

**Links out in the world** `long text`
Help: If your site's been up for years, links to it live in old emails, articles, festival pages. We'll redirect the important ones — any addresses you know people still use?

---

## Step 9 of 9 — Accounts and access

*Callout at top, carried over and extended:*
**No passwords · ever** — We never ask for account passwords. Everything below is either something you send us an invite to, or something we set up together on a call. **Any invite — domain, Vimeo, anything — goes to hello@tayloraucoin.com.**

**Do you own a domain?** `pick one`
Help: A web address you've already bought — yourname.com, or similar.
- Yes
- No
- Not sure

**Which one?** `text` *(label changes by answer, carried over: Yes → "Which one?" · Not sure → "What do you think it is?" with help "A guess is fine — we can look it up from there." · No → "Any address you'd want?" with help "Registering it is part of the build. If you haven't thought about it, skip this.")*
Placeholder: yourname.com

**Where did you buy it?** `text` *(shows only if Yes)*
Help: GoDaddy, Namecheap, Squarespace — or "not sure."

**How would you rather handle access?** `pick one` *(shows only if Yes)*
- Invite you to my domain account
- Send me what to add and I'll do it
- Not sure — let's sort it on the call
Help: Invites go to hello@tayloraucoin.com.

**Do you use email at that domain?** `pick one`
Help: Important — we need to know so your email keeps working.
- Yes
- No
- Not sure

**Where does your video live?** `check all that apply`
- Vimeo
- YouTube
- A drive or Dropbox
Help: The site embeds from Vimeo or YouTube rather than hosting video itself — that's what keeps your hosting close to free.

**Somewhere else?** `text`

**Your accounts around the web** `repeatable block` — add button: "Add another account"
Help: IMDb especially, if you have a page — people in film check it.
*(Flexes by discipline — generic: "Wherever your work already lives — people will look." Photography: Instagram/Behance; art: Instagram/gallery pages.)*
Per entry:
- **Platform** `text` — placeholder: Instagram, Vimeo, IMDb…
- **Link or handle** `text`

**What's your current site built on?** `text`
Help: Wix, Squarespace, WordPress — or "not sure."

**After launch, how hands-on do you want to be?** `pick one`
- Very — I'll edit it myself with Claude Code
- A little — small tweaks myself, you for the rest
- Not at all — I'll send you changes
Help: No wrong answer — it shapes the handoff guide we write for you.

**Best way to reach you** `pick one`
- Text
- Email
- Phone
- WhatsApp

**Anything else we should know?** `long text`
Help: Anything I haven't asked — something you want on the site, something you'd hate, a person whose opinion of it matters.

---

## Done screen

**That's everything.**

Taylor reads all of it — every note, every rating, every file. You'll see the first look at your site within three days. If anything below is easy to answer by text, it all helps.

*(Skipped-items list renders here, same as the existing flow.)*

---

## Open items — decisions embedded in the copy above

1. **Admin panel at $500** — [PROPOSED — needs sign-off]. Real scope: auth plus an editing surface over the content files; $500 is the floor for it to be worth building.
2. **Care plan at $100/mo** — [PROPOSED — needs sign-off], per the goal-1 discussion.
3. **Five included pages** — [PROPOSED — needs sign-off]. Matches the existing five-page deliverable; project detail pages excluded from the count by copy above.
4. **Example-site count** (step 5) — copy avoids naming a number so the gallery can be 12–24 without edits.
5. **"Coming soon" category rows** on the start form publicly signal expansion — drop them if you'd rather not.

## Build notes — Mason

- **Payment screen**: reuses the existing deposit checkout (products table + `offeredAtCheckout`). New rows needed: portfolio deposit $1,000, portfolio balance $1,000, pay-in-full $1,900 (its own product, not a runtime discount — simpler and auditable), admin_panel $500, care_plan_portfolio $100/mo. Kryshan's $1,600 rides the existing promo-code mechanism.
- **Extra pages after the fact** (step 8): needs a post-intake payment path — a Stripe payment link or a re-entry to checkout scoped to `extra_page` quantity. Confirm-before-charge is a copy promise above; the mechanism must enforce it (nothing auto-charges off a checkbox).
- **"Sort this for me"** (steps 3 and 4): one server endpoint, Claude Sonnet, blob in → structured entries out, prefilling the repeatable blocks client-side. Nothing saves until the user has seen the entries — same law as autosave. Cost per run is fractions of a cent; rate-limit per token anyway.
- **No project cap**: per-project image uploads reuse the existing 50MB-per-file intake upload path; the only limit that can reject a file remains size, never format or count.
