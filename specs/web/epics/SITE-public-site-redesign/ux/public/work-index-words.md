---
target: specs/web/ux/public/work-index-words.md
status: approved
promoted:
---

# Work index — words

Part of `work-index.md`. Every visible string and accessible name. Sources: `existing: <path>`; `canvas` (drawn on the locked Work page, D-SITE-108; the canvas is the intent where it differs from the repo); `[draft]` (a placeholder on the canvas Taylor has not written); `Taylor's to write`. Nothing here is new public copy.

## Page

| String | Where | Source |
| --- | --- | --- |
| Work | h1 | canvas |
| [Taylor writes: one line on what this page holds] | intro line | Taylor's to write |
| Page `<title>` and meta description | head | Taylor's to write |
| Product engineering · Websites · Branding & UI | tabs | canvas (D-SITE-100) |
| All · Full-time · Contract · Business · Passion projects · Own brand | chips | canvas (D-SITE-54, 100) |
| Full-time · Contract · Business · Passion projects · Client · Own brand | group labels | canvas (D-SITE-100) |
| Name of the tabs' `nav`; name of the chips' `nav` | accessible names | Taylor's to write (not on canvas) |
| Search every capability [draft] | capabilities line | [draft]; Assay read "every" as leaning to a menu (`capabilities.md`), Taylor rewords |

## Product engineering rows

Titles and taglines: existing `content/work/<slug>.ts` (`title`, `tagline`), except where noted.

| Row | Meta on canvas (role · period) | Source |
| --- | --- | --- |
| Everbook | Founding engineer · 2024 – 2025 | canvas, as a list-role field; repo `role` stays for the case study (D-SITE-189) |
| Roomvy | Senior frontend engineer · 2023 | canvas, as a list-role field (D-SITE-189) |
| Calculate by QxMD | Frontend software engineer · 2019 – 2021 | existing `role`; en dash at render (D-SITE-189) |
| Multi-entity family office platform | Fractional CTO · 2026 | canvas; casing applied at render, repo `title` unchanged (D-SITE-189) |
| Agora | Founder, engineer · 2021 – 2026 | existing `role` |
| Conscious Connections | Founder, engineer, designer · 2026 – present | existing `role` |
| Read the decision story | row link, every row with a study | canvas |

## Websites rows (all Client)

| Row | Tagline | Meta | Links | Source |
| --- | --- | --- | --- | --- |
| Clean Coast Detailing [NEEDS DECISION] | [Taylor writes: one line on the site] | Website and brand guide · [year] | All 4 images · cleancoast.ca | canvas; images and URL existing `content/websites-clean-coast.ts`; tagline, year Taylor's to write |
| Kryshan Randel [NEEDS DECISION] | [Taylor writes: one line on the site] | Coded website, brand kit · [year] | [All n images] · [live link] | canvas; tagline, year, links Taylor's to write |
| Holistica | [Taylor writes: one line on the site] | Coded website · [year] | [All n images] · [live link] | canvas; Taylor's to write when it ships |

## Branding & UI rows

| Row | Tagline | Meta | Links | Source |
| --- | --- | --- | --- | --- |
| Agora | [Taylor writes: one line on the kit] | Brand kit and components · [year] | Read the decision story · [All n boards] · [live link] | canvas; bracketed parts Taylor's to write |
| Conscious Connections | [Taylor writes: one line on the kit] | Brand kit and components · [year] | Read the decision story · [All n boards] · consciousconnections.app | canvas; domain existing `content/work/conscious-connections.ts` |
| Taylor Aucoin | [Taylor writes: one line on the kit] | Kit, tokens, components · 2026 | All 10 boards · tayloraucoin.com | canvas; no story link until its story exists (D-SITE-175) |

"All n images" / "All n boards": n is the gallery's count, rendered from the data.

## Chrome (reused; owned by home)

| String | Source |
| --- | --- |
| Taylor Aucoin (wordmark, accessible name) | existing `components/ui/Wordmark.tsx` |
| Work · About · Work with me · Contact | canvas; Contact added at build (D-SITE-130) |
| Book a 30-minute call | canvas; the hero's label (A-17), to `/book` (D-SITE-165) |
| Theme (toggle's accessible name) | existing `components/ui/ThemeToggle.tsx` |
| tayloraucoin.com · About · Résumé · Contact · GitHub · LinkedIn · Privacy | canvas; Contact replaces Email (D-SITE-130) |

## Lightbox (existing `components/work/MediaLightbox.tsx`)

| String | Source |
| --- | --- |
| Dialog name: the image's `alt` | Taylor's to write per image (website and kit galleries); existing for Clean Coast in `content/websites-clean-coast.ts` |
| Previous image · Next image · Close | existing |
