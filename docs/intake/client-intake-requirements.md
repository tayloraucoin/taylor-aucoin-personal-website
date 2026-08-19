# Client Intake — Requirements Spec

What to collect before building a client site. Derived from the Clean Coast build (Aug 2026), which is the first full case study.

**Governing principle:** the site will make factual claims about a real business. Every claim needs a source. The most expensive mistakes on Clean Coast were not design or copy mistakes — they were unverified operational claims that propagated from the intake document into the brand guide, the AI generation prompt, and 20+ places across five live pages.

---

## Structure: three stages, not one form

A single 60-field form kills conversion pre-sale and produces thin answers post-sale. Split it:

**Stage 1 — Pre-call (lightweight, ~6 fields).** Business name, industry, city, existing website/socials, phone. That's all you need to build a preview and make the pitch. Do not send a real intake form to someone who hasn't bought yet.

**Stage 2 — Post-close intake form.** Everything below. Sent immediately after deposit, framed as "the faster this comes back, the faster you're live."

**Stage 3 — Verification call (30 min).** Non-negotiable. Clean Coast proved forms get facts and conversation gets truth — the water/power reality only surfaced in a spoken interview, and it surfaced in a throwaway sentence, not an answer to a direct question. Budget this into every build.

**Stage 4 — Claim sign-off before publish.** A one-page list of every factual claim the site makes, sent for explicit written confirmation. Cheap, fast, and it moves the liability for a false claim onto the client where it belongs. Add it to the SOW.

---

## A. Brand & visual assets

- Existing logo — original file if possible (SVG/AI/PNG), not a screenshot
- Any other assets: vehicle wrap, uniforms, signage, business cards, prior website
- If no logo: do they want one generated, or will they supply later?
- Existing brand colours, if they know them (otherwise reverse-engineer from the logo — worked well on Clean Coast)
- Fonts they already use, if any
- **Anything they actively dislike** — colours, styles, competitor sites. Faster than positive direction.

_Process note:_ rather than delivering one finished brand PDF, present **2–3 palette directions** derived from the logo for the client to choose from. Clean Coast worked because the logo had two clear brand colours; a single-colour logo needs options generated for comparison.

## B. Business identity — verify before anything else

- **Legal business name** vs **trading name** vs **name on the logo** — these must all be reconciled
- Business number / incorporation status
- **GST registered?** (affects whether prices display tax-inclusive)
- **Insured?** What type, what coverage — "insured" is a trust claim that cannot be invented
- Licences or certifications that can be named
- Years in business, or start date

> ⚠️ Clean Coast: the logo says "Mobile Wash," every page says "Detailing." Unresolved at launch, and it blocks Google Business Profile setup because the NAP has to match everywhere.

## C. Services, pricing, and exclusions

- Every service, with real prices — not "starting from" unless that's genuinely how they sell
- What's included in each, as a checklist
- **How long each service takes** — and what changes it (vehicle size, property size, job complexity)
- Add-ons and their prices
- Surcharges: size, distance/travel, after-hours, rush
- **What they explicitly do NOT offer** — and whether it's "never" or "not yet"
- Minimum job size, if any
- Payment methods accepted, and when payment is due
- Deposit policy
- **Cancellation and refund policy** — if they don't have one, they need one before launch

> ⚠️ Clean Coast: site promised "the price you see is the price you pay" seven times while the owner intended a $20 travel fee. Discovered in interview, not intake.

## D. Operations — the section that prevents the expensive mistakes

**This is the section your current list is missing entirely.** Every question here maps to a false claim that reached production on Clean Coast.

- **What does the business bring, and what must the customer provide?** (equipment, power, water, space, access, parking, materials)
- **What has to be true at the job site for the work to happen?** Ask for the checklist they run through mentally before accepting a job.
- **What makes them turn a job down?**
- **Where do they actually work** — and where would they _rather not_, even if they technically could?
- Maximum travel distance or time
- **Working days and hours**, and how many jobs per day realistically
- How far ahead they book; how late a same-day booking can come in
- What happens in bad weather / off-season
- Lead time and response time they can genuinely commit to
- Who answers the phone and messages, and how fast
- **How do they currently take bookings?** (Their existing process reveals the fields the site's form actually needs.)

## E. Proof and social evidence

- **Real reviews** — Google, Facebook, text messages, anything. With permission to publish.
- If none: say so explicitly, and the testimonial sections get **removed**, not filled.
- Real photos: the owner, the work, before/afters, equipment, vehicles
- Case studies or notable clients, with permission

> ⚠️ Clean Coast: the platform auto-generated eleven fabricated customers with AI headshots — one reused as the owner's own portrait. Fabricated reviews for a real business are a Competition Act problem, not a style problem. **Add a standing build rule: no testimonial ships without a named, real source.**

## F. People

- Owner bio: background, training, education, why they started
- Owner photo (real, not stock)
- Employees: how many, do they go on the site, photos and bios
- Who the customer actually deals with

## G. Positioning & voice

- Who's the ideal customer? Who's a bad fit?
- Why do customers choose them over the alternative?
- Who do they lose to, and why?
- Top 3 values / what they refuse to compromise on
- **"Sell yourself in a sentence"** — your instinct here is right, it feeds the brand pillars
- **"What are you not?"** — also right; the answer usually produces the sharpest differentiator
- Any phrases or claims they want to avoid

### G2. Voice capture — how they actually talk

The point of difference between a site that reads as AI-generated and one that doesn't. Generic AI copy is the default failure mode of every managed website builder; a voice sample is the cheapest fix.

**Ask for, in order of usefulness:**

1. **A voice memo (2–3 minutes).** _"Record a voice note answering: how did you get into this, and what's a job you were proud of?"_ Everyone has WhatsApp or iMessage. Spoken language is unguarded — it's the strongest signal available and it takes the client three minutes.
2. **The verification call recording.** With permission, record Stage 3. It's already a spoken interview about their business; it doubles as the voice sample with zero extra effort from either side.
3. **Texts or emails they've sent actual customers.** Screenshots are fine. This is how they really talk to the people who pay them.
4. **Social captions, articles, newsletters, anything long-form.** Useful, but weakest — social posts are often already written in a performed "business voice" rather than a natural one.

**How to use it:** extract _personality_, not _habits_. If they write in all caps with six emoji, the brief is "warm, direct, high-energy, exclamatory" — not "reproduce the formatting." Pull out: sentence length, vocabulary level, humour, regionalisms, recurring phrases, what they get enthusiastic about, how they explain their pricing when challenged. Feed those into the brand voice section of the brand guide, which then cascades into every piece of copy.

**Good prompt questions** (for voice memo or call — they produce usable material rather than generic answers):

- How did you get into this line of work?
- Tell me about a job you were proud of.
- What do you say when someone asks why you cost more than the cheap option?
- What do people get wrong about your trade?

_Optional / not MVP:_ a browser-based record-and-transcribe widget on the intake form. Nice polish and a good portfolio piece, but a voice memo over text achieves the same result today with no build.

## H. Accounts & access

- **Domain: do they own it? Which registrar? Login access.**
- **Existing email on that domain?** — critical, this is the DNS-cutover breakage risk
- Google Business Profile: exists? claimed? access?
- Social accounts and handles
- Existing website: platform, who has access, what to preserve
- Analytics, if any
- Stripe account — exists, or does it need setting up?
- Booking/scheduling tool currently in use
- Preferred contact method for the project (email / text / WhatsApp)

## I. Site structure

- Show the default (Home, Services, Service Area, About, Contact) and ask what's missing
- Any page they specifically want (FAQ, gallery, fleet/commercial, blog)
- Anything on their old site that must carry over
- Do they need a booking flow, or is a contact form enough?

---

## Fallback: the document dump

Offer an upload field: _"Anything you already have written — old site copy, brochures, price lists, policies, ad copy, your Facebook About section."_ Process it afterward and pre-fill what it covers, then chase only the gaps.

Set expectations honestly: **most small local businesses will have nothing.** Treat this as a nice bonus, not the primary input path. It doesn't justify building infrastructure around it.
