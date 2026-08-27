# Portfolio intake — full walkthrough

Every screen, question, and line of copy, in the order a client experiences it.
Field types in `backticks`. Conditional questions marked *(shows only if…)*.
Every question is optional, always — same law as the existing intake.
Placeholders are written for the film category; they swap per category cartridge.

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

**Current website** `url`
Help: If you have one. Leave blank if you don't.

*(Payment gate sits between the start form and step 1, same as the existing flow.)*

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

*Step intro:* The career itself — positions, memberships, awards, and the third-party proof that does your bragging for you.

**Your experience** `repeatable block` — add button: "Add another"
Help: Positions, ongoing roles, things you founded, programs you run. Not individual projects — those are the next step. "Feature this" marks the ones that should be impossible to miss.
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

*Step intro:* The heart of the site. Don't aim for complete — aim for the work you'd show first. The build includes up to twelve fully produced projects; a deeper archive is a small add-on we can sort out later.

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

**Any site outside your field you love?** `long text`
Help: A brand, a restaurant, a magazine — anything. Tell us what it gets right.

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

*Step intro:* Everything you want considered. Original files beat compressed copies; public links beat uploads for video.

**A photo of you** `file upload, image`
Help: For the about page. A real photo beats a stock one every time — a still of you working is even better.

**Stills from the work** `file upload, multiple, images`
Help: High-res frames from your projects — a few per featured piece is ideal. Name the files by project if you can.

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

*Step intro:* The shape of the thing — what pages exist and what each one is for.

**Pages you're imagining** `check all that apply`
- Home
- Work / projects
- A reel page
- About
- Contact
- A page for teaching or services
- Press / news

**Something else?** `text`

Help (under the group): Check what feels right — we'll push back if something's missing or unnecessary.

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

*Callout at top, carried over verbatim:*
**No passwords · ever** — We never ask for account passwords. Everything below is either something you send us an invite to, or something we set up together on a call.

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

**Want an admin panel?** `pick one`
- Yes — tell me more
- No
- Not sure
Help: An optional add-on: a private login where you change copy and swap images yourself, no code involved. Costs extra to build; most people do fine without it.

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

Taylor reads all of it — every note, every rating, every file. Next comes the first look at your site. If anything below is easy to answer by text, it all helps.

*(Skipped-items list renders here, same as the existing flow.)*

---

## Open items — decisions embedded in the copy above

1. **Twelve-project cap** (step 4 intro) — the included-project count and the archive-migration add-on price need ratifying before this copy ships.
2. **Admin panel add-on** (step 9) — price and scope undefined; the copy deliberately promises nothing beyond "costs extra."
3. **Done-screen timeline** — no turnaround promise made; add one if you want to commit ("first look within X days").
4. **Example-site count** (step 5) — copy avoids naming a number so the gallery can be 12–24 without edits.
5. **Category checkboxes on the start form** — "coming soon" labels commit you publicly to expansion; drop the disabled rows if you'd rather not signal it yet.
