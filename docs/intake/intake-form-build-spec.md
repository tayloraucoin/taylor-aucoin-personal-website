# Client Intake Form — Build Spec

Companion to `client-intake-requirements.md`. That document defines **what** to collect and why. This one defines **how it should be presented and built.**

Read both before writing code. Where they conflict on content, the requirements doc wins; where they conflict on presentation, this one wins.

---

## 1. Who fills this in

Not a designer, not a marketer, not a technical person. A local trades or service business owner — a detailer, landscaper, mobile mechanic, cleaner. Assume:

- **On a phone**, often in a van between jobs or at the kitchen table at 9pm
- **Low patience**, high suspicion of anything that looks like a data-harvesting form
- **No marketing vocabulary.** They don't know what a "value proposition," "brand pillar," "NAP," or "CTA" is, and won't ask
- **Already paid a deposit** — this arrives after the sale, so they're motivated, but that motivation has a short half-life
- **Genuinely doesn't have** most written documentation

**The metric is completion, not thoroughness.** A 70%-complete form that comes back tonight beats a perfect form that never returns. Every design decision below serves that.

---

## 2. Design principles

1. **Nothing is required except contact details and business name.** Everything else is optional with a visible "I'm not sure" or "skip" path. Blanks are fine — gaps get chased on the verification call, which happens regardless.
2. **"I'm not sure" is a first-class answer,** rendered as an actual option, not an empty field. A stated unknown is more useful than a guess, and guesses are what put false claims on a live site.
3. **Multi-step, one topic per screen,** with a progress indicator and an honest time estimate up front.
4. **Autosave continuously; email a resume link.** Assume the form gets abandoned mid-way at least once. Losing their answers loses the client's goodwill and the answers.
5. **Sections named the way the owner thinks,** not the way the requirements doc is organized. "What you charge," not "Services, pricing, and exclusions." "How you talk," not "Voice capture."
6. **Never ask for a password.** Ever. Access is granted by invitation or share link — see §5.
7. **Concrete over open-ended.** Open text boxes get one-line answers. Checkbox lists with an "other" field get real data. This matters most in the Operations section, which is the section that prevents expensive mistakes.
8. **Explain why you're asking** when a question could seem intrusive or irrelevant. One short line under the label, not a paragraph.

---

## 3. Two separate forms

**Form A — Pre-call (public, ~6 fields).** Lives on the portfolio page. Anyone can fill it. Business name, contact name, phone, email, city, current website (if any), "what do you do" one-liner. Single screen, under 30 seconds. This is a lead capture, not an intake.

**Form B — Post-close intake (linked, resumable).** Everything else. Sent by link after deposit. Should open with a personalized header confirming their business name so it doesn't feel like a generic form.

Build A first — it's tiny and it's on the critical path for sales. B can follow.

---

## 4. Form B structure

Nine steps. Show step count and a progress bar throughout.

**Intro screen (not a step)**

> Everything we need to build your site — about 20 minutes.
> Skip anything you're not sure about; we'll go through it together on our call. Your answers save automatically, so you can stop and come back anytime.

Include a "send me my link" button that emails the resume URL immediately, so they can switch devices.

---

### Step 1 — About your business

| Field                                       | Type                     | Notes                                                                                                      |
| ------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Business name as customers know it          | text                     | required                                                                                                   |
| Legal or registered name                    | text                     | help: "if it's different"                                                                                  |
| Name on your logo or signage                | text                     | help: "if it's different again"                                                                            |
| What you do, in one sentence                | textarea                 |                                                                                                            |
| How long you've been doing this             | text                     | free-form; "since 2023" or "about two years" both fine                                                     |
| Business number / incorporation             | text                     | optional, help: "only if you have one handy"                                                               |
| Are you GST registered?                     | radio                    | Yes / No / Not sure                                                                                        |
| Do you have business insurance?             | radio + conditional text | Yes → "what kind?" · No · Not sure. Help: "we can only say you're insured on the site if you actually are" |
| Licences or certifications worth mentioning | textarea                 |                                                                                                            |

The three name fields exist because of a real failure — a logo saying one thing and a site saying another blocks Google Business Profile setup. Put them adjacent so the mismatch is visible to the client as they type.

---

### Step 2 — What you offer and what you charge

Repeatable service block — "Add another service" button, minimum one:

| Field                     | Type                                              |
| ------------------------- | ------------------------------------------------- |
| Service name              | text                                              |
| Price                     | text (free-form — allows "$149" or "from $80/hr") |
| What's included           | textarea, help: "bullet points are fine"          |
| How long it takes         | text                                              |
| What makes it take longer | text, optional                                    |

Then:

| Field                  | Type                    | Notes                                                                                        |
| ---------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| Add-ons and extras     | repeatable name + price |                                                                                              |
| Extra charges          | checkboxes + other      | travel/distance · size · after-hours · rush · none                                           |
| Things you don't offer | textarea                | help: "people ask for these but you don't do them — and whether that's 'never' or 'not yet'" |
| Minimum job size       | text                    | optional                                                                                     |
| How customers pay      | checkboxes              | cash · e-transfer · card · invoice · other                                                   |
| When they pay          | radio                   | on completion · deposit up front · full payment up front · varies                            |
| Deposit amount         | conditional text        |                                                                                              |
| Cancellation policy    | textarea                | help: "if you don't have one written down, just tell us what you'd do"                       |

---

### Step 3 — How you work

**The most important step in the form.** Frame it that way in the section intro:

> These are the questions that stop us putting something on your site that isn't true.

| Field                                       | Type               | Notes                                                                                              |
| ------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| What do you bring to a job?                 | textarea           |                                                                                                    |
| **What does the customer need to provide?** | checkboxes + other | power/electricity · water · parking space · indoor space · access/keys · someone present · nothing |
| What has to be true for you to do the job?  | textarea           | help: "the things you check before saying yes"                                                     |
| What makes you turn a job down?             | textarea           |                                                                                                    |
| Areas you cover                             | textarea           |                                                                                                    |
| Areas you'd rather avoid                    | textarea           | help: "even if you technically could"                                                              |
| Furthest you'll travel                      | text               |                                                                                                    |
| Days you work                               | checkboxes         | Mon–Sun                                                                                            |
| Typical hours                               | text               |                                                                                                    |
| Jobs per day, realistically                 | text               |                                                                                                    |
| How far ahead you take bookings             | text               |                                                                                                    |
| Shortest notice you'll accept               | text               |                                                                                                    |
| Bad weather or off-season                   | textarea           |                                                                                                    |
| How fast you reply to enquiries             | text               |                                                                                                    |
| How customers book you now                  | checkboxes + other | phone · text · social DM · email · website form · booking app                                      |

The customer-provides checkbox list is the single highest-value control in this form. It's the direct fix for the failure that put a false claim on 20+ places across a live site.

---

### Step 4 — Your customers and competition

| Field                                        | Type                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| Describe your ideal customer                 | textarea                                                                            |
| Who's a bad fit?                             | textarea                                                                            |
| Why do people pick you over the alternative? | textarea                                                                            |
| Who do you lose work to, and why?            | textarea                                                                            |
| Three things you won't compromise on         | three short text inputs                                                             |
| Sell yourself in one sentence                | textarea                                                                            |
| What are you _not_?                          | textarea, help: "'we're not the cheapest' or 'we're not a chain' — whatever's true" |

Three separate inputs for values rather than one textarea — it produces three answers instead of one.

---

### Step 5 — How you talk

Section intro:

> Most small business websites read like they were written by a robot. This is how we avoid that.

| Field                                                | Type                   | Notes                                                                                                                                                                                                                        |
| ---------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Voice note**                                       | file upload (audio)    | **Lead with this.** Help: "Record a 2–3 minute voice memo on your phone answering: how did you get into this, and what's a job you were proud of? Send the file here. This is the single most useful thing you can give us." |
| Screenshots of texts or emails you've sent customers | file upload, multiple  | help: "how you actually talk to customers — screenshots are fine"                                                                                                                                                            |
| Anything you've written                              | file upload + textarea | old website copy, brochures, price lists, social captions, your Facebook About section                                                                                                                                       |
| Words or phrases you'd never use                     | textarea               |                                                                                                                                                                                                                              |
| Consent to record the call                           | checkbox               | "Can we record our kickoff call? We use it to make the writing sound like you."                                                                                                                                              |

The voice-note field should be visually prominent — a bordered card, not a row in a list. Show an inline recording tip for mobile users.

---

### Step 6 — Photos and logo

| Field                   | Type         | Notes                                                                                                                         |
| ----------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Logo file               | upload       | help: "the original file if you have it — otherwise any version"                                                              |
| Do you have a logo?     | radio        | Yes · No, need one · Have one but hate it                                                                                     |
| Photos                  | multi-upload | help: "you, your work, before-and-afters, your vehicle or equipment. Phone photos in good light are perfect. 10–20 is ideal." |
| Photo of you            | upload       | help: "for the About page — a real photo beats a stock one every time"                                                        |
| Colours you already use | text         |                                                                                                                               |
| Anything you dislike    | textarea     | help: "colours, styles, or a competitor's site that makes you cringe"                                                         |

Accept any file type; never reject an upload for format. Show thumbnails as they upload — it's the only visually rewarding part of the form and it builds momentum.

---

### Step 7 — Reviews and proof

Section intro, stated plainly:

> We only put real reviews on your site. If you don't have any yet, that's completely fine — we'll leave that section off and add it later.

| Field                                   | Type                                                  |
| --------------------------------------- | ----------------------------------------------------- |
| Do you have reviews anywhere?           | checkboxes                                            | Google · Facebook · text messages from customers · none yet |
| Paste your best ones                    | textarea, help: "copy and paste, or screenshot below" |
| Screenshots                             | multi-upload                                          |
| Permission to publish these             | checkbox                                              |
| Notable clients or jobs worth featuring | textarea                                              |

Never auto-generate a placeholder testimonial, not even as a visual mock. Real or absent.

---

### Step 8 — Your team

| Field                                                             | Type             |
| ----------------------------------------------------------------- | ---------------- |
| Is it just you?                                                   | radio → Yes / No |
| _(conditional)_ How many people                                   | number           |
| _(conditional)_ Do you want them on the site?                     | radio            |
| _(conditional)_ Names, roles, photos                              | repeatable block |
| Your background — how you got into this, training, qualifications | textarea         |

---

### Step 9 — Accounts and access

Lead with reassurance, because this step has the highest abandonment risk:

> We never ask for passwords. Everything below is either something you send us an invite to, or something we set up together on a call.

| Field                                 | Type                      | Notes                                                                                |
| ------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------ |
| Do you own a domain?                  | radio                     | Yes · No · Not sure                                                                  |
| _(conditional)_ Which one             | text                      |                                                                                      |
| _(conditional)_ Where did you buy it? | text                      | help: "GoDaddy, Namecheap, Squarespace — or 'not sure'"                              |
| **Do you use email at that domain?**  | radio                     | Yes · No · Not sure. Help: "important — we need to know so your email keeps working" |
| Google Business Profile               | radio                     | have one · not sure · don't have one                                                 |
| Social accounts                       | repeatable platform + URL |                                                                                      |
| Existing website                      | text + radio              | URL; platform if known                                                               |
| Do you have a Stripe account?         | radio                     | only if taking payments                                                              |
| Booking or scheduling tool you use    | text                      |                                                                                      |
| Best way to reach you                 | radio                     | text · email · phone · WhatsApp                                                      |

Domain registrar and existing email get their own visual emphasis. Breaking a client's email during DNS cutover is the fastest way to destroy a relationship, and it's entirely preventable by asking here.

**Access is collected out-of-band, not in the form.** After submission, the confirmation email lists what invitations to send and to which address, with a link to a short how-to for each. Never build a credential field.

---

### Confirmation screen

- Thank them, confirm what happens next and when
- List anything they skipped, framed as "we'll cover these on our call" — not as an error
- Offer the resume link again in case they want to add photos later
- Book the verification call right here (embedded scheduler)

---

## 5. Security and data handling

- No password fields anywhere in the app. If a client types a password into a free-text box, that's a design failure upstream.
- Uploads to private storage with signed URLs; never public buckets.
- The form contains business-sensitive information (pricing, revenue hints, access details). Treat submissions as confidential and say so in one line at the bottom of the intro screen.
- Resume links: signed tokens, expiring, single business per token.

---

## 6. Output — what Taylor gets

This is what the whole build exists to produce, so get it right.

On submission, generate a **clean markdown document** — not a table dump, not raw JSON — structured to be pasted directly into Claude:

```
# Intake — [Business Name]
Submitted [date] · [contact] · [phone] · [email]

## Business identity
**Customer-facing name:** …
**Legal name:** …
**Name on logo:** …
⚠️ Names differ — resolve before GBP setup
…

## Not answered
- Insurance status
- Cancellation policy
- Reviews
```

Requirements:

- Empty fields collected into an explicit **"Not answered"** section rather than rendered as blank headings
- Automatic flags for known-risk conditions: name mismatches, "customer provides: nothing" (verify against reality), no reviews, no domain, existing email at the domain
- Uploaded files listed with signed links
- Downloadable as `.md` and viewable in an admin page
- Voice note and any recordings linked separately for transcription

Admin view: list of submissions, status (started / abandoned / complete), last-updated timestamp, one-click access to the markdown.

---

## 7. Reminders

Automated, gentle, three maximum:

- 48h after link sent, if not started
- 48h after last activity, if started and abandoned — deep-link to the step they stopped on
- Final nudge at day 7

Kill all reminders on completion.

---

## 8. Build notes

Match the portfolio's existing stack. Suggested shape:

- Next.js App Router; one route per step (`/intake/[token]/[step]`) so back/forward and deep-linking work
- React Hook Form + Zod per step; **all fields optional in the schema** except the three on Step 1
- Autosave on blur and on step change, debounced; visible "saved" indicator
- Supabase for submissions and file storage; one row per submission with a JSONB answers column so adding a field later doesn't require a migration
- Server-side markdown rendering of the submission
- Resend for the resume link and reminders
- Mobile-first: single column throughout, 44px minimum tap targets, native file inputs (don't build a custom drag-drop that breaks on iOS)

**Build order:** Form A (public lead capture) → Form B steps 1–3 → markdown output + admin view → remaining steps → autosave/resume → reminders. Steps 1–3 plus working output is a usable product; ship that and use it on the first real client before building the rest.

_If this ends up on a hosted form tool instead, the section structure, field types, conditional logic, and microcopy above all transfer directly — only §5, §6, and §8 become platform features rather than build work._
