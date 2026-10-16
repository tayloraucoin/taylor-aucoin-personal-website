---
target: specs/web/ux/public/websites-coded-build.md
status: approved
promoted:
---

# Coded websites — build

Handoff part of `websites-coded.md` (job, states, decisions there). Words in `websites-coded-words.md`.

## Layout and components

One column on the ground, content 1080 wide at 1440 (180 gutters); label rows put the label in a 240 column and the body at 452–1090. At 390: 24 gutters, everything stacks, label over body. Sections are split by a `--hairline` rule and open with a Heading 2. Top to bottom, as captured:

1. **Header** without its call button (D-SITE-23): wordmark · Work · About · Work with me · theme toggle; "Contact" joins after Work with me at build (D-SITE-130). At 390 the links sit on a second line under the wordmark.
2. **Hero:** Display h1, Lede sub (max 56ch), the primary button "Start your site →" with the Meta hero note beside it (under it at 390). No eyebrow, stats strip, secondary call link or case link (D-SITE-208).
3. **What you actually own:** Body paragraph, **the ownership line** at Headline 32 (Plumb, part 2), Body paragraph, then the Vercel note at Meta.
4. **What it costs:** **the price ledger** (Plumb, part 2): label rows, $2,000 at Stat 44 beside "CAD + GST", the terms line, then three label rows, the last with the "Vercel's pricing" link. Then the label "Add-ons" over **the priced row list** (Plumb, part 2), then the primary button.
5. **Sites I've built:** two **lead-screen example rows** (Plumb, part 2): 480 desktop and 150 phone screenshot (`--hairline`, 3px radius, kit §5) beside a 370 text column: name, line, meta, link pair, testimonial at Body 17 over a Meta attribution. At 390 the desktop shot leads at full width, no phone shot (D-SITE-116).
6. **Changes after the build:** intro Body, **the priced row list** for the three tiers, then the care plan as **the absent-row marker** (Plumb, part 2), which the build does not render (D-SITE-212); Heading 4 "Three rules…" with a square-bullet list; the closing line at Meta.
7. **What you get:** label rows (the case study's, reused).
8. **How it goes:** numbered label rows: number and label in the 240 column, Heading 4 title and Body beside; step 2 adds three Meta detail lines.
9. **Worth saying up front:** label rows.
10. **Questions:** the FAQ as a disclosure list (`components/ui/Faq.tsx`, native `<details>`), 880 wide, "+"/"−" at the right, first item open (D-SITE-207).
11. **Close:** the case study's close block: Headline line, primary button, "Book a call first" text link to `/book` (D-SITE-210), phone and email links, entity at Meta. At 390 the button is full width and the links stack.
12. **Footer:** domain left, links right; "Email" becomes "Contact" with the address beside the domain (D-SITE-130). It ends the page at 390 too (the 390 light capture's mid-page footer is a drawing slip).

Primary button: `--fill` / `--on-fill`, solid in both themes; full width at 390 (**full-width primary buttons at 390**, Plumb, part 2). Links: text colour with the `--mark` underline (kit §1 law 3). The only gradient is the Lamplight atmosphere behind the top of the page. Retire `CodedCase.tsx` and `content/websites-coded-case.ts` (D-SITE-114). Components shared with `/websites/platform` (`WebsitesHero`, `Pricing`, `Process`, `Changes`, `WebsitesClose`) keep that page's output unchanged (D-SITE-112, D-SITE-209).

## Access

- **Landmarks:** `header` (nav), one `main`, `footer`. One h1; each section an h2; "Three rules…" and step titles h3; example names h3 under "Sites I've built".
- **Keyboard path:** header links, theme toggle; hero button; "Vercel's pricing"; cost button; per row: desktop shot, phone shot, "[All n images]", live link; FAQ summaries in order; close button, "Book a call first", phone, email; footer. Visual order equals DOM order at both widths.
- **Names:** the arrow in "Start your site →" is `aria-hidden`, so the name is "Start your site". The screenshots are buttons named from the row's link text and name ("All n images, Kryshan Randel"), not new copy. The live link's name is its host text.
- **Lightbox:** focus moves in, is trapped, Escape closes, focus returns to the trigger (`MediaLightbox.tsx`).
- **FAQ:** native `<details>`; "+"/"−" are `aria-hidden`.
- **Announced on change:** nothing; no live regions (static page).
- **Focus ring:** 2px `--focus`, offset 2px, on every control including summaries and screenshot buttons.
- **Contrast to eye-check:** `--muted` Meta and the 12px uppercase labels over the Lamplight atmosphere in the cost section (dark); the `--mark` underline on the light ground is decorative (text carries the cue). The empty Phoenix screenshot boxes are hairline only and never ship (D-SITE-211).
- **Reduced motion:** no ring on this page; transitions collapse to 0ms (kit §5).
- **Touch targets at 390:** "[All n images]" and the live link sit 20px apart on one line, and the close's links stack tight: each needs a 24px minimum target with spacing (WCAG 2.5.8). FAQ rows clear 44px.

## Instrumentation

Page views come from the existing consent-gated GA4 tag (`components/analytics/`). Names are proposals, defined at Technical with Tally:

- `book_call_click` {surface: `websites`, placement: `close`} on "Book a call first" (D-SITE-176). It is funnel above `SITE-M1`, which counts only the screening's fit click.
- `coded_intake_start` [PROPOSED] {placement: `hero` | `cost` | `close`} on each "Start your site". Watched, not judged (brief, Metric).
- Never in a payload or a URL GA sees: name, email, phone, typed text, an intake token (D-SITE-176).

## Criteria

| ID                      | When                         | Then                                                                                                                       | Evidence |
| ----------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| C-SITE-websites-coded-1 | `/websites` at 1440 and 390, dark and light | Sections in the order and layout of the four `default` captures                                                 | capture  |
| C-SITE-websites-coded-2 | Any width                    | The header has no call button; it has "Contact" (D-SITE-23, D-SITE-130)                                                     | test     |
| C-SITE-websites-coded-3 | The three "Start your site" buttons | Each links to `/websites/coded/intake` and its accessible name is "Start your site"                                   | test     |
| C-SITE-websites-coded-4 | The price ledger, add-ons and tiers | Every price renders from `content/websites-coded.ts` / `content/websites.ts`; no price literal in a component         | check    |
| C-SITE-websites-coded-5 | A screenshot or "[All n images]" is activated | The lightbox opens on that row's gallery; Escape closes it and focus returns to the trigger                 | test     |
| C-SITE-websites-coded-6 | A row has no live link, or no testimonial | That line is absent with no empty gap                                                                           | test     |
| C-SITE-websites-coded-7 | Page loads                   | No bracketed placeholder, no Phoenix row until it ships, no care-plan row (D-SITE-211, D-SITE-212)                                        | check    |
| C-SITE-websites-coded-8 | Page loads                   | The first FAQ item is open, the rest closed; each toggles by keyboard                                                       | test     |
| C-SITE-websites-coded-9 | Tabbing the page             | Focus follows the Access path with a visible 2px ring on every control                                                      | manual   |
| C-SITE-websites-coded-10 | 390 wide                    | No horizontal scroll; primary buttons full width; link targets ≥ 24px                                                       | capture  |
| C-SITE-websites-coded-11 | The build lands             | `CodedCase.tsx` and `content/websites-coded-case.ts` are gone; `/websites/platform` renders as before                       | check    |
| C-SITE-websites-coded-12 | A start or booking click    | One event fires with only the allowed fields, and none before consent                                                       | test     |
| C-SITE-websites-coded-13 | Page text                   | No "Durable" (D-SITE-213), no Clean Coast, no family office, no marketing service                                           | check    |
| C-SITE-websites-coded-14 | Page head | `noindex, nofollow` and the custom social card (D-SITE-214); "Book a call first" links to `/book` | test |
