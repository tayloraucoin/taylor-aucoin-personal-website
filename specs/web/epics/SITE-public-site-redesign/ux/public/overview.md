---
target: specs/web/ux/public/overview.md
status: approved
promoted:
---

# Public site — overview

Intent pass, 2026-10-15, Vesper with Hearth. From the brief (`../../brief.md`) and Taylor's five interview rounds. Labels: verified (a named file, or Taylor), judgment.

**Finding:** no living UX truth exists (`specs/web/ux/` holds only `.gitkeep`; verified), so every surface file here is a new truth file.

## Frame

A founder, CTO or head of product opens the site from a link or an application and gives it about a minute. They are asking what this person shipped end to end, and whether he can explain the decisions (audience §1; verified). Site buyers (Segment 2) have their own path under `/websites` and never compete for home. Learners (Segment 3) get the signup and `/about`.

## Routes and flow order

| Route                    | Surface                                        | Entry from                                                               | Exit to                                                |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| `/`                      | `home.md`                                      | link, application, wordmark                                              | booking; `/work/[slug]`; `/work-with-me`; `/websites`  |
| `/work`                  | `work-index.md`                                | header                                                                   | `/work/[slug]`; `/capabilities`                        |
| `/work/[slug]`           | `case-study.md`                                | home story; `/work` row; capability proof; `/about` quote; pasted link   | booking; live link; `/work`                            |
| `/about`                 | `about.md`                                     | header; footer; both redirects                                           | booking; case studies; résumé                          |
| `/work-with-me`          | `services.md` (D-SITE-164)                     | header "Work with me"; home's Work with me rows; `/services` by redirect | `/contact`; `/book`; `/websites`; `/work?tab=branding` |
| `/book`                  | `services.md`, screening (D-SITE-165)          | every "Book a 30-minute call"                                            | Cal.com (a fit, D-SITE-166); the note                  |
| `/contact`               | `services.md`, contact (D-SITE-165)            | header and footer "Contact"; Work with me; not-a-fit                     | sent; `/book`                                          |
| `/websites`              | `websites-coded.md` (route note `websites.md`) | home's Websites tab; coded website offer; `/websites/coded` by redirect  | coded intake; example live links                       |
| `/websites/platform`     | `websites-platform.md` (legacy, out of epic)   | direct URL only                                                          | platform intake                                        |
| `/capabilities`          | `capabilities.md`                              | `/work`                                                                  | `/work/[slug]`                                         |
| `/websites/coded/intake` | `intake-coded.md` (D-SITE-160)                 | the coded page's start; emailed resume link; Stripe return               | done; `/websites/privacy`; `/websites/terms`           |

Flow for the one-minute reader: home → first decision story → booking, or → case study → booking.

Retired: `/testimonials` and `/stack` redirect to `/about`, both overlays go (`@modal/(.)stack` and `@modal/(.)work`), and so does the `@modal` slot (D-SITE-3). `/websites/coded` redirects to `/websites`, and the websites chooser retires (D-SITE-111). Restyle only, no surface file: `/privacy`, `/websites/privacy`, `/websites/terms`, and the platform intake. The coded intake is a restyle with a few drawn screens (`intake-coded.md`).

## Navigation

- **Header** (D-SITE-2): wordmark · Work · About · Work with me · Contact (D-SITE-130) · the call button to `/book` (hidden on `/book` and `/websites`, D-SITE-167, 23) · the theme toggle (verified `ThemeToggle.tsx`).
- **Footer:** About, Contact (was email, D-SITE-130), GitHub, Privacy, LinkedIn (verified `Footer.tsx`), Résumé (D-SITE-2).
- **Hidden** on intake, legal and admin paths, as today (verified `SiteChrome.tsx`).
- **Shared states:** light and dark (D-SITE-11); direction B by `?direction=b` (verified `layout.tsx`); `consent` (D-SITE-16).

## Design

Paper: file "Taylor Aucoin", pages Components, Current, Home, About, Case study, Work and Capabilities (D-SITE-25, D-SITE-66, D-SITE-77, D-SITE-105). Home locked 2026-10-15 (D-SITE-64); captures in `captures/home/`. About locked 2026-10-15 (D-SITE-76), spine A person first; captures in `captures/about/`. Case study locked 2026-10-15 (D-SITE-97); captures in `captures/case-study/`. Work locked 2026-10-16 (D-SITE-108); captures in `captures/work-index/`. Capabilities locked 2026-10-16 (D-SITE-150); captures in `captures/capabilities/`. Direction A only (D-SITE-60). The site opens in dark (D-SITE-61). Shipping artboards on Home, About, Case study and Work; process on each one's "· iterations" page (D-SITE-59, D-SITE-66, D-SITE-77, D-SITE-105). Websites (the coded page at `/websites`) drawn on page "Websites", process on "Websites · iterations" (D-SITE-110 to 116); locked 2026-10-16 (D-SITE-117); captures in `captures/websites-coded/`. The coded intake (`/websites/coded/intake`) drawn on page "Intake", process on "Intake · iterations" (D-SITE-152 to 159); locked 2026-10-16 (D-SITE-163); captures in `captures/intake-coded/`; copy change list in `intake-coded-copy.md`. Work with me (`/work-with-me`) with the screening step (`/book`) and contact (`/contact`) drawn on page "Work with me", process on "Work with me · iterations" (D-SITE-110, D-SITE-120 to 130, D-SITE-164 to 170); locked 2026-10-16 (D-SITE-171); captures in `captures/services/`.

## Decision log

D-SITE-n lines live in `decisions.md` and `decisions-2.md` to `decisions-14.md` (the handoff pass: D-SITE-172 to 221, D-SITE-117 back-filled; Technical: 222 to 230); Plumb proposals in `plumb-proposals.md` and `plumb-proposals-2.md`.

## Handoff pass (2026-10-16)

Each surface splits under the cap: `<surface>.md` (job, states, open items) with `-build.md` (layout, access, instrumentation, criteria) and `-words.md`; services adds `services-criteria.md`. A contract cites the main file and reads its parts as one surface (A5).

## Open

- Not found: `docs/references/README.md`, so no references were loaded.
- Before build tickets: the `pillar-open` crop (D-SITE-184, blocking home); the case study's capture re-export (D-SITE-196); the graded headshot (D-SITE-172).
- For Plumb: record D-SITE-173 and 177; the machine-filled quote in `plumb-proposals-2.md` is upright, not italic (D-SITE-159).
- Site-wide, at Technical: no skip link exists today.
