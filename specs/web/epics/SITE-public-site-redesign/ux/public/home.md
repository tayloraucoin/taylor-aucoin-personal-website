---
target: specs/web/ux/public/home.md
status: approved
promoted:
design:
  file: Taylor Aucoin (Paper)
  page: Home
  artboards: "home / <state> / <1440|390> / <dark|light>; states: default, consent, notes-sending, notes-done, notes-error, notes-invalid, notes-already, selected-work-filtered, selected-work-websites, selected-work-branding, capabilities-open, capabilities-all"
  captures: "captures/home/<state>-<width>[-dark].png"
  process: "page Home · iterations (D-SITE-59)"
  locked: 2026-10-15
---

# Home — public

Intent pass, then handoff pass (2026-10-16). Decisions are `D-SITE-n` in the decision logs. Parts: layout, access, instrumentation and criteria in `home-build.md`; every string in `home-words.md`.

## Job

The one-minute hirer learns what Taylor shipped end to end and the decisions behind it, then books a call. Done for them: by the end of the first decision story they can say what he would own on their team (brief, Vesper's check; judgment). Section order is D-SITE-50: header, hero, proof bar, pillars, Problems I take on, Selected work, How I work (with the AI block), Testimonials, Work with me plus one line to `/websites`, Notes signup, footer.

## Entry and exit

- **Entry:** a link from LinkedIn or an application, a direct visit, the wordmark from any page. Often a laptop between tabs, sometimes a phone (brief, User; verified).
- **Exit:**
  - "Book a 30-minute call" (header at 1440, hero) goes to `/book`; a fit goes on to Cal.com, else the note (D-SITE-126, 165, 166). Header "Contact" goes to `/contact` (D-SITE-130).
  - A decision story opens `/work/[slug]` full page, at the top (D-SITE-3); a kit row links one only when its data names a slug (D-SITE-175).
  - "See the work" scrolls to the first story (D-SITE-4).
  - "See all work" goes to `/work` with the tab and chip (D-SITE-101); a chip opens to `/capabilities` through "Search every capability".
  - The Work with me rows and link go to `/work-with-me` (D-SITE-164); the one line and the Websites tab link go to `/websites` (D-SITE-111); the Branding tab link to `/work-with-me` (D-SITE-38, 164); "Read them in full" to `/about#testimonials` (D-SITE-56).

## States

Every state is reachable by `?state=<key>` and captured in dark and light at 390 and 1440 (`<key>-390.png`, `-390-dark`, `-1440`, `-1440-dark` in `captures/home/`). Dark is the target; light must hold (D-SITE-61).

| State | Key | What shows | Canvas |
| --- | --- | --- | --- |
| Default | `default` | Every section in D-SITE-50's order. Proof bar: D-SITE-48's four items. Pillars: four closed rows (D-SITE-44, 52). Chips: 8 (D-SITE-46). Selected work: Product engineering tab, Featured: Conscious Connections (live link), Everbook (Dawson's quote, D-SITE-7), the family office, unnamed (Bruno's quote, diagram). Testimonials: four, Dawson first (D-SITE-56). Signup idle | `default-*` (full page) |
| Consent | `consent` | Default with the consent banner, bottom left, prior-consent jurisdictions only (verified `ConsentBanner.tsx`); at 390 it may cover "See the work" (D-SITE-186) | `consent-*` (first viewport) |
| Signup sending | `notes-sending` | Address stays; the button reads "Sending"; nothing else moves (A-20) | `notes-sending-*` (crop) |
| Signup done | `notes-done` | The form gives way to one past-tense line with a check; no celebration (A-13) | `notes-done-*` (crop) |
| Signup error | `notes-error` | Address stays; button "Try again"; an error line under the field. Covers offline (D-SITE-9) | `notes-error-*` (crop) |
| Signup invalid | `notes-invalid` | Field takes the invalid border; a line says what is wrong; nothing sent | `notes-invalid-*` (crop) |
| Already signed up | `notes-already` | Identical to `notes-done` (gap 5, Technical) | `notes-already-*` (crop) |
| Work, websites tab | `selected-work-websites` | Websites tab: Clean Coast, Kryshan Randel, Holistica, each a gallery; no type filter (D-SITE-54); ends "How a coded website works" and "See all work" | `selected-work-websites-*` (crop) |
| Work, branding tab | `selected-work-branding` | Branding & UI tab: the Taylor Aucoin kit, Conscious Connections, Agora; filter Featured, Business, Passion projects, Own brand; ends "Branding, on Work with me" and "See all work" | `selected-work-branding-*` (crop) |
| Work, filtered | `selected-work-filtered` | Full-time on Product engineering: Everbook, Roomvy, Calculate by QxMD (text only, no artifact); ends "See all full-time work" (D-SITE-51, 62) | `selected-work-filtered-*` (crop) |
| Capability open | `capabilities-open` | One chip open in place as a card, the rest stay; one open at a time (D-SITE-46, 147) | `capabilities-open-*` (crop) |
| Capabilities, all | `capabilities-all` | All 25 chips; toggle reads "Show fewer"; the `/capabilities` link stays (D-SITE-46, 142) | `capabilities-all-*` (crop) |
| Pillar open | `pillar-open` | Pillar 2 open in place, its second line in the open row (D-SITE-44, 53) | `pillar-open-*` (crop): [NEEDS DECISION — BLOCKING] until captured (D-SITE-184) |
| Lightbox | — | The story gallery's "All n images" and thumbs open `MediaLightbox` | N/A: existing component (D-SITE-182) |
| Empty | — | Every section's content is on file | N/A |
| Loading, offline | — | Server-rendered, no client fetch (D-SITE-18); signup offline is `notes-error` | N/A |
| Partial | — | A story with no artifact renders text only (D-SITE-181) | in `selected-work-filtered` |
| Error | — | Only the signup's; not-found lives on the case study (D-SITE-19) | N/A |
| Success | — | `notes-done` | — |
| Pending testimonial | — | Drawn on `/about` (D-SITE-12) | N/A |

## Primary action

Book a 30-minute call, to `/book` (D-SITE-165). One label in the header (1440 only, D-SITE-180) and the hero (A-17). Opening a decision story is the secondary path (brief).

## Open decisions

- [NEEDS DECISION — BLOCKING] `pillar-open` crop, drawn in a Design thread before the home build ticket (D-SITE-184).
- `notes-already` stays identical to `notes-done`; where an address is stored is gap 5, settled at Technical.
- The newsletter ban is amended for one notes block on home (`house-design.md`, 2026-10-15; D-SITE-20 closed).
- Settled at the handoff: headshot (D-SITE-172); type sizes (D-SITE-173); kit story links (D-SITE-175); events (D-SITE-176); reduced motion (D-SITE-178); the consent banner at 390 (D-SITE-186); Fragment Mono on the tech line (D-SITE-187).
- Taylor's facts (the bar's [12] and [23] with programme names, "product designer" in the seats, his Product designer line, his comfort ratings, never shown, D-SITE-65): the build starts on the bracketed values and launch waits (D-SITE-185).
- [NEEDS DECISION] Clean Coast and Kryshan Randel on the Websites tab (D-SITE-42).
- Never on home: launch and funnel work, Durable, Viewpoint.AI, the family office's name, marketing as a skill, a bento, or a hero-metric block (A-09).
