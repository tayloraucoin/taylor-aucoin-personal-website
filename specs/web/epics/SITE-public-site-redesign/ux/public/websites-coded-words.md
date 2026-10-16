---
target: specs/web/ux/public/websites-coded-words.md
status: approved
promoted:
---

# Coded websites — words

Words part of `websites-coded.md`. Copy is Taylor's: canvas copy is today's content verbatim, so the build carries it as is. `[draft]` is a placeholder line on the canvas Taylor has not written; it never ships bracketed.

| Where | String | Source |
| --- | --- | --- |
| Title, social card | "Websites for creative work" and its description | existing: `app/websites/coded/page.tsx` (moves to `app/websites/page.tsx`) |
| Hero h1, sub | `hero.title`, `hero.sub` | existing: `content/websites-coded.ts` |
| Hero note | `heroNote`, without the appended "Rather talk it through first?" and phone (D-SITE-208) | existing: `content/websites-coded.ts` |
| Every primary button | `ctaLabel` ("Start your site →") | existing: `content/websites-coded.ts` |
| Section headings | "What you actually own", "What it costs", "Changes after the build", "How it goes", "Worth saying up front", "Questions"; "What you get" | existing: `components/websites/coded/Ownership.tsx`, `Pricing.tsx`, `Changes.tsx`, `Process.tsx`, `UpFront.tsx`, `app/websites/coded/page.tsx` |
| Ownership, two paragraphs and the line | `ownership.before` split at "Which means:", `ownership.emphasis` set as "Which means: if you ever want to fire me, you keep everything.", `ownership.after` | existing: `content/websites-coded.ts` (the split is layout, not new words) |
| Vercel note | `hostingTerms.body` | existing: `content/websites-coded.ts` |
| Price ledger | `pricing` (label, $2,000, CAD + GST, terms, rows, "Vercel's pricing") | existing: `content/websites-coded.ts` |
| Add-ons label | "Add-ons" | `[draft]`, Taylor's to write |
| Add-on rows | `addOns` | existing: `content/websites-coded.ts` |
| Sites heading | "Sites I've built" | `[draft]`, Taylor's to write |
| Kryshan row | "Kryshan Randel"; "kryshanrandel.com"; "Coded website, brand kit" | canvas (D-SITE-113, 116); goes into a content file at build |
| Kryshan row, open | one line on the site; [year]; [role]; testimonial | Taylor's to write; testimonial is Kryshan's own words (D-SITE-114) |
| Phoenix row | site name, line, year, live link, testimonial and attribution | Taylor's to write; Phoenix's own words (D-SITE-113, 114) |
| Gallery link | "All n images" (n = gallery count) | `[draft]` pattern from `/work`'s row (D-SITE-114) |
| Changes intro, tiers, rules, "Three rules that keep this fair both ways" | the intro and heading, `changeTiers`, `changeRules` | existing: `content/websites.ts`, `components/websites/Changes.tsx` |
| Changes closing | `changesClosing` | existing: `content/websites-coded.ts` |
| Care plan row | not rendered (D-SITE-212); when sold, its label and price from the file's comment | Taylor's to write |
| What you get | `deliverables` | existing: `content/websites-coded.ts` |
| How it goes | `processSteps` (title, system label, body, step 2 detail) | existing: `content/websites-coded.ts` |
| Worth saying up front | `upFront` | existing: `content/websites-coded.ts` |
| Questions | `faq` (nine q/a) | existing: `content/websites-coded.ts` |
| Close | `closing.line`, `closing.entity`; "Book a call first"; phone `AGORA.phone`; `SITE.email` | existing: `content/websites-coded.ts`, `components/websites/WebsitesClose.tsx`, `lib/config.ts` |
| Header, footer | as site-wide, with "Contact" (D-SITE-130) | existing: `components/sections/` |

## Accessible names

| Control | Name | Source |
| --- | --- | --- |
| Primary buttons | "Start your site" (arrow hidden) | existing label |
| Screenshot buttons | "All n images, <site name>" | derived from the row's own strings |
| Lightbox | as `MediaLightbox.tsx` | existing |
| FAQ summaries | the question | existing |
| Theme toggle | as `ThemeToggle.tsx` | existing |

No status messages: the page announces nothing.
