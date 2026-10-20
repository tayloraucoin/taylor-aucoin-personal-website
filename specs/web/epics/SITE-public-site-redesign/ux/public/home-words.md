---
target: specs/web/ux/public/home-words.md
status: approved
promoted:
---

# Home — words

Part of `home.md`. Copy is Taylor's; Gloss changes nothing. Source: `existing: <file>`; `canvas` (Taylor's, as locked, new to the repo); `[draft]` (a placeholder line on the canvas); `Taylor's to write`. A `[draft]` tag or bracketed value is not shipped text: Taylor replaces it as a content edit, and none reaches production (D-SITE-185).

## Chrome and hero

| Where               | String                                                                                                                                                                                                 | Source                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| Header              | Taylor Aucoin · Work · About · Work with me · Contact                                                                                                                                                  | canvas; Contact D-SITE-130    |
| Header, hero        | Book a 30-minute call                                                                                                                                                                                  | canvas (A-17, one label)      |
| Theme toggle        | name "Theme"; Light, Dark, System                                                                                                                                                                      | existing: `ThemeToggle.tsx`   |
| Hero label          | Product engineer (set uppercase by the label style)                                                                                                                                                    | canvas                        |
| Hero                | Taylor Aucoin · The whole product, thought through. · Product Engineer, building software for over a decade. I shape the problem, ship it, and set it up to be measured, with my judgment over the AI. | canvas                        |
| Hero ghost          | See the work                                                                                                                                                                                           | canvas                        |
| Headshot alt        | Taylor's to write                                                                                                                                                                                      | —                             |
| Footer              | tayloraucoin.com, the address beside it (D-SITE-130) · About · Résumé · Contact · GitHub · LinkedIn · Privacy                                                                                          | canvas; Contact D-SITE-130    |
| Consent             | Google Analytics counts page views here. No advertising, no profiles, nothing sold. Decline and the script never loads. · Accept · Decline · Privacy                                                   | existing: `ConsentBanner.tsx` |
| Consent dialog name | [ASSUMPTION: "Analytics", the label D-SITE-63 removed, kept as its hidden name]                                                                                                                        | existing word                 |

## Proof bar and pillars

| Where            | String                                                                                                                                                                                                                                        | Source                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Bar              | Since 2016 / building software · [12] products / zero to one, and counting · [23] cohorts taught / BCIT ISSP · VFS · a design cohort · virtual interns · Four seats [draft] / founder · founding engineer · product designer · fractional CTO | canvas, D-SITE-48; numbers and names Taylor confirms                                         |
| Pillar 1         | Systems, end to end / Turborepo monorepos, typed contracts from Postgres to the pixel, and infrastructure a team of one can actually operate.                                                                                                 | existing: `components/sections/Capabilities.tsx`                                             |
| Pillar 2         | Judgment, not tickets / A feature starts as a UX problem and has to end as a business outcome.                                                                                                                                                | existing: same (D-SITE-53)                                                                   |
| Pillar 3         | Conventions that compound / I learn your codebase's conventions down pat, or level them up with an AI build system your team keeps using. [draft]                                                                                             | canvas, D-SITE-55                                                                            |
| Pillar 4         | Fast and precise / Founders, leads and clients keep saying the same thing: fast, and it holds up in production. [draft]                                                                                                                       | canvas, D-SITE-52                                                                            |
| Pillar open rows | What a team gets, naming no client or product; the cases live in Problems' "Done at". Text: `content/home.ts` `pillars`                                                                                                                       | Taylor's pick, round 3 (copy-review-r3.md, Pillars); row 2 keeps the founder line, D-SITE-53 |

## Problems I take on

| Where                                       | String                                                                        | Source                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| Heading, line                               | Problems I take on · Open one for the approach and where it was done. [draft] | existing heading: `Specialties.tsx`; line [draft] |
| Chips, open card title, tech line, approach | names and text per capability                                                 | existing: `content/capabilities.ts`               |
| Open card proof                             | Done at {proof names}, usually on contract. [draft]                           | [draft] (D-SITE-62)                               |
| Controls                                    | Show all 25 · Show fewer · Search every capability [draft]                    | canvas; link [draft]                              |

## Selected work

| Where                       | String                                                                                                                | Source                                                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading, tabs               | Selected work · Product engineering · Websites · Branding & UI                                                        | canvas                                                                                                                                                                                                  |
| Type chips                  | Featured · Full-time · Contract · Business · Passion projects · Own brand                                             | canvas (D-SITE-54)                                                                                                                                                                                      |
| Beat labels, link           | Problem · Decided · Happened · Read the decision story (kit rows per D-SITE-175)                                      | canvas (D-SITE-62)                                                                                                                                                                                      |
| Product engineering stories | meta, title, beats, quote, live link                                                                                  | existing: `content/work/{conscious-connections,everbook,family-office-platform,roomvy,calculate-qxmd}.ts`, `content/testimonials.ts`; family office Happened and Roomvy, Calculate lines marked [draft] |
| Websites stories            | Clean Coast beats "[Draft, from /websites copy] …"; Kryshan Randel and Holistica beats and live links                 | [draft]; Taylor's to write                                                                                                                                                                              |
| Branding stories            | Taylor Aucoin kit beats "[Draft] …"; Conscious Connections and Agora beats; Agora live link                           | [draft]; Taylor's to write                                                                                                                                                                              |
| Gallery                     | All {n} images · All {n} boards; image alt per artifact                                                               | canvas; alt Taylor's to write                                                                                                                                                                           |
| Tab footers                 | See all work · See all full-time work [draft] · [Draft] How a coded website works · [Draft] Branding, on Work with me | canvas; [draft]                                                                                                                                                                                         |

## How I work, Testimonials, Work with me

| Where             | String                                                                                                               | Source                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| How I work        | How I work · Scope · Build · Ship · Measure · Iterate                                                                | existing heading: `HowIWork.tsx`; steps canvas                                                                          |
| AI block          | What I give it · What I let AI do · What I check; the three lists                                                    | labels canvas; lists Taylor's to write (D-SITE-58)                                                                      |
| Testimonials      | heading; four quotes, names, titles                                                                                  | existing: `content/testimonials.ts` (D-SITE-56 spans)                                                                   |
| Link              | Read them in full [draft]                                                                                            | [draft]                                                                                                                 |
| Work with me rows | Product engineer · Product designer · Systems consultant · Fractional CTO · 0→1 build, with terms and best-for lines | existing: `content/services.ts` where present; Product designer line Taylor's to write; Systems consultant line [draft] |
| Links             | Work with me · [Draft] Need a website you own? Websites                                                              | canvas; [draft]                                                                                                         |

## Notes signup

| Where                      | String                                                                                              | Source                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Block                      | Notes · [Draft] How I build with AI: what I let it do, what I check, and why.                       | canvas; [draft]                                |
| Field                      | label Email; placeholder you@company.com; hint Used only for the notes. Unsubscribe from any email. | canvas                                         |
| Button                     | Get the notes · Sending · Try again                                                                 | canvas                                         |
| Done, already              | [Draft] Signed up. Notes will go to {address}.                                                      | [draft]                                        |
| Error                      | [Draft] It didn't send. Check your connection and try again; your address is still here.            | [draft]                                        |
| Invalid                    | [Draft] That address needs an ending, like .com or .ca. Nothing was sent.                           | [draft]; other invalid cases Taylor's to write |
| Filter count (live region) | Taylor's to write                                                                                   | Access                                         |
