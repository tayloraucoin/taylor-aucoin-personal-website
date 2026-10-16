---
target: specs/web/ux/public/about.md
status: approved
promoted:
design:
  file: Taylor Aucoin (Paper)
  page: About (process on "About · iterations", D-SITE-66)
  artboards: "about / <default|pending-testimonial> / <1440|390> / <dark|light>; pending-testimonial is a region crop of Testimonials"
  captures: "captures/about/<default|pending-testimonial>-<width>[-dark].png"
  locked: 2026-10-15 (D-SITE-76)
---

# About — public

Intent pass, then the Design stage (D-SITE-66 reopened the canvas, amending D-SITE-17), then the handoff pass. Decisions are `D-SITE-n` in `decisions*.md`. Spine A, person first (D-SITE-74). Parts: `about-build.md` (Layout and components, Access, Instrumentation, Criteria) and `about-words.md` (Words).

## Job

The hirer decides on the person: the story, the experience, how he teaches, the tools, and every testimonial in full. Then they book a call. Segment 3 reads it too (brief). Done for them: no question about who he is is left for the call.

## Entry and exit

- **Entry:** the header and the footer (D-SITE-2). The redirects from `/testimonials` and `/stack` (brief). Each lands at its section, `#tools` or `#testimonials` (D-SITE-22). Home's Testimonials link to `/about#testimonials` (D-SITE-56).
- **Exit:** booking, through the screening step at `/book` (D-SITE-126, 165, 166); an Experience row's or a testimonial's project link to its case study `/work/[slug]`; the résumé PDF (close, Tools, footer; D-SITE-2); the close's "Send a note" (D-SITE-174) and header and footer "Contact" (D-SITE-130), all to `/contact`.

## Sections, in order (D-SITE-67, D-SITE-74)

Intro (the page's one eyebrow "The person behind the work", the h1 "About", location line, story, headshot about 280px, D-SITE-69, D-SITE-172) · How I think (three rows; Mentorship moved to Teaching) · Experience (Full-time, Contract and fractional, My own products with one "Also built" line, Programmes; D-SITE-68, D-SITE-70) · Teaching `#teaching` (ledger by programme, then the mentorship text) · Education · Tools `#tools` (core items only, five groups, résumé link; D-SITE-72) · Testimonials `#testimonials` (one list, two subheads, all four in full; D-SITE-71) · Off the clock · Close (closing line, availability, booking, résumé, email) · footer.

## States

| State                   | Key                                   | What shows                                                                                                                                                                                                               | Canvas                                                                                                                                       |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                 | `default`                             | The sections above, every one, with fixture copy at real density                                                                                                                                                         | `captures/about/default-1440-dark.png`, `default-1440.png`, `default-390-dark.png`, `default-390.png`                                         |
| Pending testimonial     | `pending-testimonial`                 | Outside production only (`SHOW_PENDING_TESTIMONIALS`; verified `lib/config.ts`). One extra card under Engineers I led, the "Pending approval" marker, synthetic text, never Micheal Ozdoba's words; the flag shows the synthetic fixture too, and a real entry never renders until approved (D-SITE-12, D-SITE-199) | `captures/about/pending-testimonial-1440-dark.png`, `pending-testimonial-1440.png`, `pending-testimonial-390-dark.png`, `pending-testimonial-390.png` (region crops) |
| Landed from a redirect  | `landed-tools`, `landed-testimonials` | N/A: the default page at an anchor, no layout of its own; scroll and focus go to the code critic (D-SITE-73)                                                                                                             | N/A: no layout of its own (D-SITE-73)                                                                                                        |
| Empty, loading, offline | —                                     | N/A: content on file, server-rendered (D-SITE-18)                                                                                                                                                                        | N/A: server-rendered (D-SITE-18)                                                                                                             |
| Error, partial, success | —                                     | N/A: a static reading page                                                                                                                                                                                               | N/A: a static reading page                                                                                                                   |

Every drawn state has 390 and 1440, dark and light (D-SITE-61). Header "Contact" and footer "Contact" are not on these captures; they arrive at build, no redraw (D-SITE-130).

## Primary action

Book a 30-minute call (A-17), to `/book` (D-SITE-165). The close's button is the page's one primary fill; the header's is the small ghost button.

## Open decisions

- Headshot: today's photo graded to sit on carbon, supplied by Taylor before the build ticket (D-SITE-172).
- [Taylor confirms] the cohort counts per programme and their names, Education's schools and years, FYBR, the FLUI and League of Innovators roles and years, and whether "Artist Hivemind Hub" passes the no-music rule.
- [Taylor writes] the bracketed canvas lines and the four D-SITE-67 rewrites (see `about-words.md`).
- Close fallback: "Send a note" → `/contact` in place of the address (D-SITE-174).
- Ambers carried for Plumb (D-SITE-76): full testimonials at body size, not Quote 20px; type sizes read per component story under D-SITE-173.
