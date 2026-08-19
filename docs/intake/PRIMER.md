# Primer — client intake questionnaire

**Paste or attach this to start a fresh thread.** Written 2026-08-19, at the point where the intake system's plumbing works end to end and the next work is reviewing and refining the questions themselves.

---

## 1. What this is

Taylor Aucoin contracts through **Agora Network Technologies, Inc.** A side-gig within that builds websites for local trades and service businesses around Metro Vancouver — roofers, detailers, landscapers. Cold call, text them a preview, close on the phone.

This system is what happens after the close: a **public link the client opens themselves**, which takes a deposit and then asks about their business, so Taylor can build the site from real answers rather than guesses.

**The link:** `https://tayloraucoin.com/websites/intake` — stable, public, tokenless. The client's own submission mints a per-engagement token; everything after that lives at `/websites/intake/<token>/…`.

**The flow:** public start form (6 fields) → **$600 deposit** via hosted Stripe Checkout → nine-step questionnaire → done screen. On completion Taylor is emailed a generated markdown document of every answer, with unanswered fields collected explicitly and risk conditions flagged.

**Repo:** `/Users/taylor/lighthouse/taylor-aucoin` — Next.js 15, App Router, TypeScript strict, Tailwind v4, Yarn 4. Deploys to Vercel.

---

## 2. Read these first, in this order

| Document | What it governs |
|---|---|
| `CLAUDE.md` (repo root) | **Site law.** Design invariants, banned patterns, known traps. Non-negotiable |
| `docs/intake/INTAKE-UX-SPEC.md` | **Product behaviour for the intake surface.** §13 is a binding decision log (`D-INT-1`…`D-INT-10`) |
| `docs/intake/intake-form-build-spec.md` | **The field inventory is binding here.** §4 defines every question, per step |
| `docs/intake/client-intake-requirements.md` | *Why* each question exists. Every one traces to a real failure on a prior build |
| `docs/intake/specs/DEVIATIONS.md` | 73 entries. On-disk reality plus this log **overrides any stale spec string** |
| `docs/intake/specs/TECHNICAL-DECISIONS.md` | `M-INT-1`…`M-INT-22`. Architecture choices with real alternatives |
| `docs/intake/TECH-SCOPE.md` | Placement law — where code goes and why |
| `docs/AGORA-STRIPE.md` | Stripe catalogue, tax status, local testing recipe |

Two source PDFs sit outside the repo in `~/Downloads` and are the **commercial source of truth**: `how_we_work.pdf` (process and prices) and `website_toolkit.pdf` (what the client gets). `call_sheet.md` is the cold-call script and is the best available read on the client's state of mind.

---

## 3. The client, and the register

Not a designer, not a marketer, not technical. A trades owner **on a phone, in a van between jobs or at the kitchen table at 9pm**. Low patience, high suspicion of anything resembling a data-harvesting form, no marketing vocabulary. They have already paid a deposit, so they are motivated — but that motivation has a short half-life.

**The metric is completion, not thoroughness.** A 70%-complete form that comes back tonight beats a perfect one that never returns.

Copy rules, in force everywhere on this surface:

- Sentence case. No exclamation marks. Contractions on. Second person. Canadian English, CAD.
- No jargon the requirements doc bans: NAP, CTA, value proposition, brand pillar.
- **"I'm not sure" is a first-class answer**, rendered as a real option, never an empty field. A stated unknown is more useful than a guess, and guesses are what put false claims on a live site.
- **Nothing is required.** Blank is a legitimate answer everywhere in the nine steps. Gaps get chased on the verification call.
- **Never manufacture urgency.** No countdowns, no scarcity, no guilt, no badges — especially near the payment screen.
- Errors never blame. Say what happened and what we did about it.

---

## 4. Decisions that are settled — do not re-litigate without new evidence

From `INTAKE-UX-SPEC.md` §13:

| ID | Ruling |
|---|---|
| D-INT-1 | Hosted Stripe Checkout; no card UI; no urgency devices near payment |
| D-INT-2 | "Quiet Gilt" variant governs `/websites/intake`: no background canvas, 560px column, 16px minimum input font, 48px targets, **validation in gold, never red**, zero new hexes |
| D-INT-3 | The gradient ring appears **exactly once** in the whole flow — the Step 5 voice-note card |
| D-INT-4 | Nothing is required; **Continue is never disabled**; "Not sure" is a full-size rendered option |
| D-INT-5 | One step = one scrollable screen; **nine steps exactly**; step-jumping only from the resume screen |
| D-INT-6 | Autosave on blur and step change; the indicator never claims more than is true |
| D-INT-7 | Three reminder emails maximum, all dead on completion |
| D-INT-8 | **Never ask a client something already known.** Prefilled fields are shown, not asked |
| D-INT-9 | `[PROVISIONAL]` per-link `deposit_required` flag may skip the pay gate |
| D-INT-10 | `[NEEDS DECISION — Taylor]` the deposit refund sentence on the pay screen. Blocks the first real charge |

The nine-step count is a promise made on the welcome screen. Adding a tenth step, or sub-paginating one, breaks it.

---

## 5. Where the questions actually live

Each step is one file. **This is what you will be editing.**

```
lib/intake/steps.ts                          step order, titles, intro copy
lib/validators/intake.ts                     per-step Zod schemas (every field optional)
lib/intake/answer-labels.ts                  labels for the generated document
app/websites/intake/_components/steps/
  step-business.tsx      1  About your business
  step-pricing.tsx       2  What you offer and what you charge
  step-operations.tsx    3  How you work          ← the highest-value step
  step-positioning.tsx   4  Your customers and competition
  step-voice.tsx         5  How you talk          ← the only gradient ring
  step-photos.tsx        6  Photos and logo
  step-reviews.tsx       7  Reviews and proof
  step-team.tsx          8  Your team
  step-access.tsx        9  Accounts and access
```

Shared input components live in `app/websites/intake/_components/`: `field.tsx`, `text-field.tsx`, `choice-group.tsx`, `answer-inputs.tsx` (the `TextAnswer` / `LongAnswer` / `ChoiceAnswer` wrappers every step uses), `repeatable-block.tsx`, `file-drop.tsx`.

**Adding or renaming a field means three files:** the step component, the Zod schema in `lib/validators/intake.ts`, and the label in `lib/intake/answer-labels.ts`. A field missing from the schema is silently dropped on save; a field missing from labels renders in the document as its raw key.

### Current question inventory

- **1 Business** — businessName, legalName, logoName, whatYouDo, howLong, contactName, contactPhone, contactEmail, businessNumber, gstRegistered, insured, insuranceType, licences
- **2 Pricing** — services[] (repeatable), addOns[] (repeatable), extraCharges, extraChargesOther, dontOffer, minimumJob, paymentMethods, paymentMethodsOther, whenTheyPay, depositAmount, cancellationPolicy
- **3 Operations** — customerProvides, customerProvidesOther, whatYouBring, whatMustBeTrue, whatMakesYouDecline, areasCovered, areasAvoided, furthestTravel, daysWorked, typicalHours, jobsPerDay, howFarAhead, shortestNotice, badWeather, replySpeed, howCustomersBook, howCustomersBookOther
- **4 Positioning** — idealCustomer, badFit, whyPickYou, whoYouLoseTo, valueOne/Two/Three, sellYourself, whatYouAreNot
- **5 Voice** — voice note upload, screenshots upload, writing upload, writtenNotes, neverSay, recordingConsent
- **6 Photos** — logoStatus, logo upload, photos upload, portrait upload, coloursYouUse, dislikes
- **7 Reviews** — reviewSources, bestReviews, review screenshots upload, publishPermission, notableClients
- **8 Team** — justYou, headcount, showTeam, team[] (repeatable), yourBackground
- **9 Access** — ownsDomain, domainName, registrar, emailAtDomain, googleBusinessProfile, googleMapsUrl, existingWebsite, existingWebsitePlatform, hasStripe, bookingTool, bestContactMethod

### Questions carrying the most weight

**Step 3's `customerProvides`** is the single highest-value control in the form. On a prior build the site claimed the business brought its own water and power; it did not, and that false claim reached twenty-odd places across five live pages. The checkbox list with an exclusive "Nothing — you bring it all" is the direct fix. Its step intro renders at full ink — the only one that does.

**Step 5's voice note** is the most valuable single thing a client can give. It gets the flow's only gradient ring, and a "skip it, the call covers this too" line directly beneath so prominence never becomes pressure.

**Step 7's "none yet"** must stay comfortable to choose. A platform once auto-generated eleven fabricated customers with AI headshots for a real business — a Competition Act problem, not a style one. No testimonial ships without a named real source.

**Step 9 opens with `NO PASSWORDS · EVER`.** There is no credential field anywhere and there never will be; access is collected out of band after submission.

---

## 6. State of the build

All eight tickets are code complete. Everything below is verified against a real Postgres unless noted.

| Verified | Not verified |
|---|---|
| Schema, migrations, RLS deny-all | Rendering, keyboard, iOS zoom, reduced motion |
| Token seam, expiry, reissue | Live Stripe round-trip |
| Webhook signature + fulfillment idempotency | Upload bytes reaching Supabase Storage |
| Answer merge, concurrency, malformed-field tolerance | Real email delivery |
| Document generator, every risk flag, Not-answered honesty | Browser-side autosave (offline, tab-kill, retry) |
| Tier resolution across local/staging/live | |

**The browser half is the largest untested surface.** Two bugs have already reached Taylor from exactly that gap — a Checkout redirect pointing at production from localhost, and a crash on the first step visit from a `Date` interpolated into a raw `sql` template. Assume more live there.

### Open, needing Taylor

1. **D-INT-10** — the deposit refund sentence. Blocks the first real charge, not the build.
2. **Stripe Tax is off.** Tax Settings status is `pending`, zero registrations. Every published price is quoted "+ GST", so an invoice currently renders $600 flat. Enabling `automatic_tax` without an active registration silently collects **zero** tax and cannot be corrected retroactively. Needs a head office address and a GST registration confirmed with an accountant.
3. Resend sending domain, live Stripe keys, Supabase projects per tier.

---

## 7. Working conventions

**Verify with:** `yarn build` · `npx tsc --noEmit` · `yarn lint` — all three, every time, reported honestly.

**Local development:** `yarn dev` plus `yarn stripe:listen` in a second terminal. The webhook secret it prints goes in `STRIPE_LOCAL_WEBHOOK_SECRET`, and **`yarn dev` must be restarted** for it to take effect — env is collapsed at build time in `next.config.ts`.

**Environment tiers:** `local` / `staging` / `live`, resolved once in `next.config.ts` via `lib/config/env/resolve-tier-env.ts`. Application code reads canonical names only (`STRIPE_SECRET_KEY`, `DATABASE_URL`) and has no idea a tier exists. Never add a tier-suffixed name outside that resolver.

**Database work** can be verified locally without Supabase — Postgres 15 is installed at `/usr/local/opt/postgresql@15`. A scratch instance in the session scratchpad, migrate, exercise, tear down. Taylor runs migrations against hosted databases; author the SQL and stop.

**Never:** put answer content, tokens, or file contents in logs. Use raw hex instead of design tokens. Write `-[--` in a Tailwind class (v3 idiom that v4 silently drops — this shipped broken once). Add analytics to the intake surface.

**Record everything:** one line per divergence in `docs/intake/specs/DEVIATIONS.md` (`YYYY-MM-DD · <ticket> · <what> · <why>`); architectural choices with real alternatives in `TECHNICAL-DECISIONS.md`.

Taylor works with named role prompts from `~/Downloads/universal-roles-files/` — **Vesper** (design, UX, copy), **Mason** (architecture), **Reeve** (tickets, sequencing), **Forge** (code quality), **Vigil** (verification). Questionnaire content and copy is Vesper's seat.

---

## 8. Starting the questionnaire review

The goal is reviewing and refining the questions — wording, order, what is missing, what is redundant, what a tired person at 9pm will actually answer.

Useful framings:

- **Read it as the client.** Nine steps, ~45 fields, on a phone. Where does someone stall? Which questions produce a one-word answer where a real one was needed?
- **Check every question against `client-intake-requirements.md`.** Each exists because something went wrong before. A question that cannot name its failure mode is a question to cut.
- **Concrete beats open-ended.** Open text boxes get one-line answers; checkbox lists with an "other" field get real data. This matters most in step 3.
- **Watch for questions Taylor already knows the answer to** (D-INT-8). He looks a business up on Google Maps before dialling — he has their review count before they answer the phone.
- **The build spec's §4 field inventory is binding.** Departing from it is legitimate but gets a `DEVIATIONS.md` line saying why.

Do not start by rewriting. Read the three source documents, walk the nine step files, and come back with a severity-ranked review — what breaks a trust contract, what hurts the experience, what is taste — before changing anything.
