# Taylor Aucoin — what the site says

**Step 0 of the brand track.** A read-only Alembic scan of the public site (2026-10-14, at `2cb1e7b` on `feature/review-process`), prompt from `product-engineering-mastery/docs/prompts/brand/0-repo.md` as amended. Attach to thread 1 as `repo-scan.md`. Facts from the repo only; every item cites a file; `[INFERRED]` marks judgement, `[NOT IN SOURCE]` marks gaps.

Corpus: public `app/` routes, `components/`, `content/`, `public/`, `docs/SITE-SPEC.md`, `docs/DESIGN-SYSTEM.md`, `docs/TASTE-PROFILE.md`, plus `lib/config.ts` (where `SITE` lives). `data/` read for column headers only — the rows are prospect contact data. No intake, admin, or env files opened.

## 1. Who Taylor is and what he offers

The site presents Taylor Aucoin as a "Senior/staff product engineer" in Vancouver and a "technical founder" with "Twelve products taken from zero to one — consumer marketplaces, AI platforms, healthtech, and accommodation booking" (`lib/config.ts` `SITE`, `components/sections/Hero.tsx`). He sells three engagements — contract senior/staff engineer, fixed-scope 0→1 build (flagged flagship), and fractional CTO — at "between $15K and $75K CAD" (`content/services.ts`), proven by six case studies, four capability cards, a capabilities index, a stack taxonomy, and LinkedIn testimonials (`content/work/index.ts`, `components/sections/Capabilities.tsx`, `content/capabilities.ts`, `content/stack.ts`, `content/testimonials.ts`). A second offer, under "Agora Network Technologies", sells fixed-price websites — $1,200 on a managed platform for local businesses and $2,000 in code for creative work (`content/websites-chooser.ts`) — at `/websites`, which nothing in the header, footer, home, services, or about pages links to (searched `app/page.tsx`, `app/services`, `app/about`, `components/sections`, `components/services`, `components/ui`).

## 2. Pages

- `/` — Hero → Capabilities → Specialties → Testimonials → Selected work → Signal → Bio row → Footer (`app/page.tsx`)
- `/work/[slug]` — full case study; also intercepted as an overlay from `/` (`app/work/[slug]/page.tsx`, `app/@modal/(.)work/[slug]/page.tsx`)
- `/stack` — full stack, eight categories; also an overlay (`app/stack/page.tsx`, `app/@modal/(.)stack/page.tsx`)
- `/services` — "Work with me": hero, offer cards, problem grid, how I work, how to start, proof strip, FAQ, closing CTA (`app/services/page.tsx`)
- `/capabilities` — filterable capability index (`app/capabilities/page.tsx`)
- `/testimonials` — tabs: worked for / led (`app/testimonials/page.tsx`, `components/testimonials/TestimonialTabs.tsx`)
- `/about` — story, How I think, Off the clock, booking CTA (`app/about/page.tsx`)
- `/privacy` (`app/privacy/page.tsx`)
- `/websites` — chooser, "Two ways I build websites" (`app/websites/page.tsx`)
- `/websites/platform` — "Websites for local businesses" (`app/websites/platform/page.tsx`)
- `/websites/coded` — "Websites for creative work" (`app/websites/coded/page.tsx`)
- `/websites/terms`, `/websites/privacy` (`app/websites/terms/page.tsx`, `app/websites/privacy/page.tsx`)
- `/banner-export` — noindex, "Temporary", LinkedIn cover capture (`app/banner-export/page.tsx`)
- Reserved, not built: `/ventures`, `/writing`, `/media` (`docs/SITE-SPEC.md` § Routes)

## 3. Claims and proof

**Roles and positioning**
- "Senior/staff product engineer" (`lib/config.ts` `SITE.role`)
- "Senior product engineer and technical founder: twelve products taken from zero to one across healthtech, AI platforms, commerce, and booking. Remote from Vancouver." (`content/services.ts` `bio`)
- Eyebrow: "Vancouver · Senior/staff product engineer" (`components/sections/Hero.tsx`)
- "From BC · Vancouver for ten years" (`content/about.ts` `locationLine`)

**Numbers**
- Signal stats: "9.5" Years shipping · "12" 0→1 builds · "14" Cohorts mentored · "0→1" Founding engineer (`components/sections/Signal.tsx`)
- "After twelve products I know which corners are load-bearing and which are decoration." (`components/sections/Capabilities.tsx`)
- "Fourteen cohorts through BCIT's industry-sponsored projects program over five years — at peak, four concurrent teams and over twenty junior developers" (`components/sections/Capabilities.tsx`)
- "Five years and fourteen cohorts at BCIT" (`content/about.ts` `howIThink`)
- **Contradiction:** "Nine products shipped to production" (`docs/TASTE-PROFILE.md`) and "`9` products in prod" (`docs/SITE-SPEC.md` § Signal) vs "Twelve" / "12" (`lib/config.ts`, `components/sections/Signal.tsx`). Role: "Senior product engineer" (`docs/TASTE-PROFILE.md`, `content/services.ts` `bio`) vs "Senior/staff" (`lib/config.ts`).

**Education and credentials**
- "I was on a semester off from a bio-medical degree when one question struck me" … "Within a year I'd left the path to medicine to build software instead." (`content/about.ts` `story`)
- "I trained in coding, UX design, and digital marketing" (`content/about.ts` `story`)
- Degrees, schools, years, certifications: [NOT IN SOURCE] (the résumé PDF `public/taylor-aucoin-resume.pdf` exists and was not opened)

**Clients, employers, organisations named**
- QxMD, "a WebMD/Medscape company"; Medscape (`content/work/calculate-qxmd.ts`)
- Pathfinder Studios (`content/work/roomvy.ts`)
- Pine Studio (Everbook) (`content/testimonials.ts`)
- A family office, unnamed: "a retreat center, a foundation, an events operation, a personal brand, and the headquarters" (`content/work/family-office-platform.ts`)
- FYBR Inc. — "first development job" (`content/testimonials.ts`)
- BCIT ISSP; "an SFU co-op" (`components/sections/Capabilities.tsx`, `content/work/agora.ts`)
- Clean Coast Detailing, `cleancoast.ca` — websites case, `published: true` (`content/websites-clean-coast.ts`)
- Logos: no client logos on the site; no logo files in `public/`.

**Case studies** (display order, `content/work/index.ts`)

| # | Title | Role | Period | Tagline (verbatim) | Outcome claims (verbatim) | File |
|---|---|---|---|---|---|---|
| 1 | Multi-Entity Family Office Platform | Fractional CTO | 2026 | "Unified five separately built business systems into one monorepo and database: an operational HQ with a custom CRM, plus the booking and sales engine for the group's retreat centre." | "Ten legacy systems unified into one database" · "Five production applications live on a shared platform" · meta: "Five production apps in six weeks." | `content/work/family-office-platform.ts` |
| 2 | Conscious Connections | Founder, engineer, designer | 2026 — present | "A communication and coaching tool for couples, with AI-mediated conflict translation and a safety layer that screens for intimate-partner-violence signals. My own product, built between engagements." | "Ninety-one human-reviewed migrations and two append-only decision logs" · "The marketing site is live; the toolkit is in beta ahead of launch." | `content/work/conscious-connections.ts` |
| 3 | Everbook | Founding engineer, CTO-track | 2024 — 2025 | "An AI voice interview that becomes a typeset, press-ready hardcover: the interview engine, print pipeline, and commerce platform behind it, built solo from first commit through a relaunch." | "MVP to production in six" (of fourteen months) · "Over 99% production stability" · "Two checkout systems and three print providers" · "The role ended in October 2025 in a company-wide layoff after a strategic pivot to marketing operations." | `content/work/everbook.ts` |
| 4 | Roomvy | Senior frontend engineer (Pathfinder Studios) | 2023 | "The entire client-facing booking frontend, built solo: an Airbnb-style room-block flow for conferences and tournaments, with zero issues reported in production." | "Zero reported defects, with self-managed QA as the only release gate" · "the agency's pipeline dried up before a next project existed, and the role ended there." | `content/work/roomvy.ts` |
| 5 | Agora | Founder, engineer | 2021 — 2026 | "A full marketplace commerce build (cart, checkout, tax, refunds, shipping) that later became a cross-marketplace discovery engine for independent sellers." | "Technical founder: five years, three versions, three fresh codebases" · "Backlogged deliberately in March 2026. The numbers didn't work; the judgment did" | `content/work/agora.ts` |
| 6 | Calculate by QxMD | Frontend software engineer | 2019 — 2021 | "Clinical calculators used by physicians at the point of care, including the version embedded in Medscape." | "Two years, nine months" · "Zero reported defects across both platforms, launch through December 2021" · "Expiring third-party calculator licensing replaced with an owned product" | `content/work/calculate-qxmd.ts` |

- Also built: "Social Photography Hub · Artist Hivemind Hub · Crypto Alerts · GIS Drone Imagery Reporting Suite" (`lib/config.ts` `OTHER_BUILDS`, `components/sections/SelectedWork.tsx`)
- Websites coded-tier case: `published: false`, `client: ""` (`content/websites-coded-case.ts`)

## 4. Testimonials

Verbatim from `content/testimonials.ts` ("Source: LinkedIn recommendations, text VERBATIM"). Home shows Dawson Whitfield, Bruno, Yogesh Verma (`lib/config.ts` `HOME_TESTIMONIALS`).

**Dawson Whitfield — "Co-founder of Looka · Founder, Everbook"** · "Managed Taylor directly at Pine Studio · 2025" · approved
> "Taylor is a phenomenal engineer. During his time at Pine Studio, he took rough concepts and turned them into full products. He owned the project scope, technical architecture, and development through to launch. He was a pleasure to work with, always reliable, sharp, and dedicated to building great product. I highly recommend him."

**Bruno — "Creative Director, Family Office"** · "Creative Director · family office engagement · 2026" · approved
> "Taylor served as our fractional CTO during a period when our operations spanned five businesses across ten disparate systems. He successfully consolidated our infrastructure into a single unified platform, database, and authentication system.
>
> His execution speed and adaptability were exceptional, successfully completing multiple initiatives within a six-week timeframe. This included delivering a booking engine ahead of a critical event deadline and deploying a CRM system in four days to accommodate an expanded project scope.
>
> Beyond technical execution, Taylor provided vital strategic clarity to our internal team. At a stage when our vision was not yet fully articulated, he effectively aligned and structured our technical strategy. Furthermore, he articulated complex technical trade-offs in accessible terms, ensuring our executive decision-making was fully informed.
>
> Most importantly, Taylor established robust technical conventions, documentation, and standard operating procedures. These foundational assets, along with the industry standards and development methodologies he imparted, have enabled us to continuously maintain and expand the platform independently without dedicated engineering staff.
>
> I highly recommend Taylor to any organization seeking a true strategic technical partner."

**Vaughn Richards — "Product development, engineering and IT, FYBR Inc."** · "Managed Taylor directly · September 2017" · approved
> "Adaptable and a quick study. Taylor came into our fast-paced and constantly changing environment and hit the ground running. He was responsible for all technical design and execution aspects of a software development project that I managed and completed it with aplomb. This project was wide, varied and changing and required a broad base of developer skills. Technical ability aside, his success and positive impact was due in large part to his adaptability, team mentality and ability (and desire) to learn quickly.
>
> He's an "ok" table tennis player too.
>
> Happy to provide a reference anytime."

**Yogesh Verma — "Senior Software Engineer"** · "Reported to Taylor directly · BCIT ISSP, two terms · 2021" · approved
> "Taylor is a detail-oriented and proficient engineer, with great potential for project management. I worked with Taylor for two terms as a part of BCIT's ISSP program. Taylor's ability to wear different hats (client, project manager and senior engineer) while excelling at each of them was remarkable.
>
> As a client: he provided a very in-depth explanation of the product's story and value proposition. His thorough research and vast market knowledge helped the team quickly understanding the product's impact.
>
> As a project manager: he ensured that the requirements were well-communicated before starting the development work. His ability to break down a complex task into small, well-elaborated action items is impeccable and a joy to work with.
>
> As a senior engineer: Taylor's well-informed opinions reduced confusion, helped accelerate the development process while ensuring the highest standards for the codebase. His code review suggestions helped in significantly improving my frontend skills, especially React, Redux and JavaScript.
>
> I believe Taylor will be a great addition to any team looking for a Senior Frontend Engineer, with an additional focus on project management."

**Micheal Ozdoba — "Software Developer, SAP"** · "Reported to Taylor directly · BCIT ISSP, two terms · 2021" · **`approved: false` — not rendered** (`lib/config.ts` `SHOW_PENDING_TESTIMONIALS = false`)
> "I was able to work with Taylor for two terms as part of my BCIT ISSP program. Taylor acted as our technical client / senior developer. His efficiency and work-ethic left a lasting impression.
>
> Taylor's management ability and his dedication to efficiency is outstanding and impressive.
>
> There are many examples to draw from to credit Taylor's management ability. From the beginning, Taylor was someone you could count on to provide broad-level instruction at amazing depth. Taylor's JIRA ticket-management and feature elaborations provided immense detail for every development-task. Taylor's one-on-one's provided valuable mentorship advice & great resources for self-development. His time-tracking habits and general advice was beyond helpful. I was continually impressed with his ability to provide amazing guidance.
>
> Taylor's skillset is a great addition to any team looking for a senior engineer."

## 5. Services and calls to action

**Engineering offers** (`content/services.ts`)

| Offer | Cadence | Best for | Includes |
|---|---|---|---|
| 01 / Contract — "Contract senior/staff engineer" | "3–12 months · embedded" | "Teams that need senior throughput now." | "Embed with your team, on your stack and conventions" · "Ship production features end to end" · "Raise the bar in review and specs" |
| 02 / 0→1 Build — "Fixed-scope 0→1 build" (`flagship: true`) | "8–16 weeks · fixed scope, fixed timeline" | "Founders who need a real product, not a prototype." | "Idea to shipped product, with architecture, schema, and infrastructure included" · "Built solo, with weekly written updates" · "Documentation and conventions the next engineer inherits" |
| 03 / Fractional — "Fractional CTO / technical partner" | "1–2 days a week · retainer" | "Non-technical founders and scaling teams." | "Architecture and technical strategy" · "Hiring, code review, and standards" · "AI-native process — conventions that let a team build safely" |

- Price: "Most engagements land between $15K and $75K CAD. Fixed scope where it makes sense, with no hourly surprises." "Contract engagements bill monthly." (`content/services.ts`)
- How to engage: "A 30-minute call" → "A scoped proposal" ("Within 48 hours: scope, timeline, price, start date") → "A start date". "I reply within one business day." (`content/services.ts`)
- Booking: `https://cal.com/taylor-aucoin/30min` (`lib/config.ts` `BOOKING_URL`)
- Availability: "Taking up to two engagements, or the right full-time role." (`content/services.ts`)
- Contact: `hello@tayloraucoin.com`, GitHub, LinkedIn (`lib/config.ts` `SITE`)
- CTAs: "Work with me →" (primary), "Selected work" (ghost) (`components/sections/Hero.tsx`); header "Work with me", "Résumé" (`components/ui/SiteHeader.tsx`); "Book a 30-min call →" (`app/about/page.tsx:125`)

**Websites — "Agora Network Technologies"** (`content/websites-chooser.ts`, `content/legal.ts:49`)
- Platform: "$1,200" "CAD + GST", "Half to start, half before it goes live."; client pays the platform "$36/month" directly; add-ons: booking $250, Stripe payments $250, extra page $150/page, Google Business Profile deep clean $300, logo refresh $250; change rounds $500 standard / $250 small / "My mistakes" free. Audience: "Detailers, landscapers, cleaners, trades." (`content/websites.ts`)
- Coded: "$2,000" "CAD + GST", "Or $1,900 in full up front, which is five percent off."; "$0/mo" hosting on Vercel's free tier; add-ons: extra page $150/page, admin panel $500, logo or wordmark refresh $250, booking $250, animations $250, Supabase setup $250, SEO blog $750, and "A blog post, written for you" (`content/websites-coded.ts:283`, `:328`). Audience: "Filmmakers, photographers, designers, artists." CTA: "Start your site →" (`content/websites-coded.ts`)

## 6. The site's own words

- Section labels: "Signal", "Specialties", "Selected work", "Testimonials", "How I think", "Off the clock", "FAQ" (`components/sections/*.tsx`, `app/about/page.tsx`, `app/services/page.tsx`)
- Card tags and titles: "01 / Architecture · Systems, end to end", "02 / Product · Judgment, not tickets", "03 / Leadership · Twenty juniors, four teams", "04 / Process · Conventions that compound" (`components/sections/Capabilities.tsx`)
- Capability titles: "Ship AI features that don't rot your codebase", "Make a slow app fast", "Turn AI coding agents into a disciplined engineering team" (`content/capabilities.ts`)
- "Not a dev shop that upsells hours." "Not a body you have to manage." (`content/services.ts`)
- "A 30-minute call, no pitch. We'll figure out if I'm the right fit." (`content/services.ts`)
- "I'm a systems designer, and I emotionally invest in the company's success." (`content/about.ts`)
- "Some people ease into their life's work. Mine hit like lightning." / "I perform much higher than I test." (`content/about.ts`)
- "if you ever want to fire me, you keep everything." (`content/websites.ts`, `content/websites-coded.ts`)
- "I build that front door." (`content/websites.ts`)
- Shared tone [INFERRED from the samples above]: plain, first person, specific, dry, sentence case, no exclamation marks — matching `docs/TASTE-PROFILE.md` § Voice. Shifts: the websites pages are folksier and blunter ("the guy down the road", "It'll be a hell of a lot better than what you've got now", `content/websites.ts`); About turns reflective ("state and cached queries firing like synapses", "gatherings with conscious people", `content/about.ts`).

## 7. The current brand in code

- **Colours** — palette "D · Gilt", as written in `app/globals.css` `@theme`: `--color-ground-a: #060b1e` · `--color-ground-b: #151033` · `--color-c1: #8b7be8` (structure violet) · `--color-c2: #e8b961` (gold) · `--color-c3: #fff6e3` (warm white) · `--color-action: #6d5cc0` · `--color-ink: #f1effa` · `--color-body: #b0adcd` · `--color-dim: #9c99bc` · `--color-proof-label: #b48934` · `--color-card: rgb(9 12 34 / 0.9)`. Runner-up "E · Reliquary": `ground-a #011627 · ground-b #120E2E · c1 #A76EE8 · c2 #C792EA · c3 #E8B961` (`docs/DESIGN-SYSTEM.md` §1).
- **Fonts** — Space Grotesk 400/500 (display), Manrope 300/400/500 (body), JetBrains Mono 400/500 (utility); "Inter is banned." (`app/layout.tsx`, `docs/DESIGN-SYSTEM.md` §2)
- **Logo** — none. The wordmark is mono text "tayloraucoin.com" (`components/ui/SiteHeader.tsx`, `components/sections/Footer.tsx`). Icons: `app/favicon.ico`, `app/apple-icon.png`, `public/icon.png`.
- **Headshot** — `public/images/me-headshot-1.png`, via `PHOTO` (`lib/config.ts`).
- **Social image** — none: `OG_IMAGE = null` (`lib/config.ts`); the spec calls for `next/og` images (`docs/SITE-SPEC.md` § SEO) and none exist. LinkedIn banner: `public/banner/banner-3168x792.png`.
- **Signature motifs** — root field "a recursive root system that resolves into PCB traces" (`docs/TASTE-PROFILE.md`, `components/field/*`); moving masked gradient ring (`components/ui/GradientRing.tsx`); stated position "Ancient futures" / "Old soul, new machine." (`docs/TASTE-PROFILE.md`)

## 8. What's missing that a brand thread will want

- **Coded websites** — the offer page exists (`app/websites/coded/page.tsx`) but nothing on the engineering site links to it, and its case study is empty and unpublished (`content/websites-coded-case.ts`).
- **Branding service** — appears only as a capability, "Take a company through a formal branding process", proof Agora, mapped to the "Fractional CTO" offer (`content/capabilities.ts`). No branding offer, price, or page. [NOT IN SOURCE]
- **PEM / Product Engineering Mastery** — no mention anywhere in the corpus. [NOT IN SOURCE]
- **Blog** — `/writing` reserved, not built (`docs/SITE-SPEC.md`); the only blog is a client add-on on the coded tier (`content/websites-coded.ts`).
- **Newsletter** — [NOT IN SOURCE].
- **Podcast** — `/media` reserved, not built (`docs/SITE-SPEC.md`).
- **Ventures page** — `/ventures` reserved, not built (`docs/SITE-SPEC.md`).
- **Education and credentials** — no degree, school, or year beyond the About story. [NOT IN SOURCE]
- **Logo or mark** and **social image** — neither exists.
- **Which offer leads** — the spec names hiring managers as primary (`docs/TASTE-PROFILE.md`), while the home hero now leads with "Work with me →" (`components/sections/Hero.tsx`). The corpus doesn't say which audience comes first today.
- **How the two businesses relate** — "Taylor Aucoin" engineering vs "Agora Network Technologies" websites; no explanation beyond the legal line (`content/legal.ts:49`). "Agora" is also a case study (`content/work/agora.ts`).
- **Buyers and competitors** — who buys, why, and against whom: [NOT IN SOURCE], beyond the testimonials and the prospect columns in `data/*.csv` (niche, city, rating, website_bucket, lead_score).
- **The personal side** — "conscious community" is excluded from v1 (`docs/TASTE-PROFILE.md`), but the About copy touches on it (`content/about.ts` `offTheClock`).
