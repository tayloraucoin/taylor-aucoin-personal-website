---
target: specs/web/ux/public/websites-coded.md
status: approved
promoted:
design:
  file: Taylor Aucoin (Paper)
  page: Websites (process on "Websites · iterations", D-SITE-110)
  artboards: "websites / default / <1440|390> / <dark|light>"
  captures: "captures/websites-coded/default-<width>[-dark].png"
  locked: 2026-10-16 (D-SITE-117)
---

# Coded websites — public

Intent refreshed 2026-10-16; handoff pass 2026-10-16. Served at `/websites`; `/websites/coded` redirects there (D-SITE-111; route note `websites.md`). Decisions are `D-SITE-n` in `overview.md`. Parts: `websites-coded-build.md` (layout, access, instrumentation, criteria) and `websites-coded-words.md` (words).

## Job

A buyer of a coded site learns that they own it, what it costs and how long it takes, sees live examples and the care plan, and starts the intake. Done for them: no fear of being stranded is left, and the intake is open. Order (brief): ownership, then price and time, then live examples, then the care plan. Durable is not named here: it stays on `/websites/platform` only; the brief's line is superseded by D-SITE-111 and D-SITE-112 (D-SITE-213).

## Entry and exit

- **Entry:** home's Websites tab link; the coded website offer on Work with me at `/work-with-me` (D-SITE-109, D-SITE-111, D-SITE-164); old `/websites/coded` links by redirect.
- **Exit:** the coded-site intake at `/websites/coded/intake` (D-SITE-160); an example's live link or its gallery in the lightbox; "Book a call first" to `/book`, the screening (D-SITE-210); the close's phone and email; `/websites/terms` and `/websites/privacy`; header and footer, which gain "Contact" at build (D-SITE-130).

## States

Every row reachable by `?state=`. Captures live in `captures/websites-coded/`.

| State                   | Key       | What shows                                                                                                                                                                                                                               | Canvas                                                                                         |
| ----------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Default                 | `default` | The page in the brief's order. Price $2,000 CAD + GST (verified `content/websites-coded.ts`). Two example rows, Kryshan Randel's site and Phoenix's site, as `/work`'s row led by a site screenshot (D-SITE-113, D-SITE-114, D-SITE-116) | `default-1440.png`, `default-1440-dark.png`, `default-390.png`, `default-390-dark.png`         |
| One example             | `one-example` | The list minus a row; the section keeps its heading (D-SITE-115). The page ships this way: Phoenix's row is hidden by a published flag until the site ships (D-SITE-211)                                                                                                     | N/A: `default` minus the second row (D-SITE-115)                                               |
| Row with no live link   | —         | The row minus its link line; "[All n images]" stays (D-SITE-14)                                                                                                                                                                         | N/A: `default` minus one link (D-SITE-14)                                                      |
| Row with no testimonial | —         | The row minus the quote and its attribution (D-SITE-114: a line only when the client gives one)                                                                                                                                          | N/A: `default` minus two lines                                                                 |
| Lightbox open           | —         | The example's gallery in `MediaLightbox.tsx` (D-SITE-39)                                                                                                                                                                                 | N/A: an existing component, captured on `/work` and the case study                             |
| FAQ item open           | —         | One answer under its question; the first is open at load (D-SITE-207)                                                                                                                                                                       | Shown inside `default` (first item open)                                                       |
| Empty, loading, offline | —         | N/A: content on file, server-rendered (D-SITE-18)                                                                                                                                                                                        | N/A                                                                                            |
| Error, partial, success | —         | N/A: a static page; success happens in the intake (`intake-coded.md`)                                                                                                                                                                   | N/A                                                                                            |

## Primary action

Start the coded-site intake ("Start your site →", three times: hero, under the cost, close; one label, one destination). No header call button (D-SITE-23).

## Open decisions

- Phoenix's site is unfinished: its row is drawn with bracketed placeholders (D-SITE-113) and ships hidden behind a published flag (D-SITE-211).
- Both clients' testimonials are coming; each row takes one named line when it exists (D-SITE-114, kit §7).
- Today's single case slot (`CodedCase.tsx`, `content/websites-coded-case.ts`) retires (D-SITE-114).
- The care plan row is a `[NEEDS DECISION]` marker on the canvas and is not sold in v1 (`content/websites-coded.ts`); the build renders nothing until its scope and price are settled (D-SITE-212).
- The page stays `noindex` with its custom social card (D-SITE-214).
