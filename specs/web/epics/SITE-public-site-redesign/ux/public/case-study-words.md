---
target: specs/web/ux/public/case-study-words.md
status: approved
promoted:
---

# Case study — words

Part of `case-study.md`. Gloss, handoff pass. Every string is Taylor's; none is improved here. Sources: `existing: <path>` (in the repo today), `canvas` (drawn at lock, not yet in the repo), `[draft]` (a placeholder line on the canvas), `Taylor's to write`. `<slug>` is `content/work/<slug>.ts`. The canvas draws content verbatim (D-SITE-95).

## Page

| Where                     | String                                                                     | Source                                                                                 |
| ------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `<title>`, description    | `title`; `metaDescription`                                                 | existing: `<slug>`, `app/work/[slug]/page.tsx`                                         |
| Back link                 | "All work"                                                                 | canvas (D-SITE-88)                                                                     |
| Meta line                 | type label · `meta` (e.g. "Passion project · AI mediation · Safety systems") | type label: canvas, home's filter (D-SITE-93); `meta`: existing `<slug>`               |
| h1, tagline               | `title`, `tagline`                                                         | existing: `<slug>`                                                                     |
| Facts ledger              | Conscious Connections: "Solo build [draft]" / "founder · engineer · designer"; "2026 to present" / "first commit May 2026"; "Beta" / "marketing site live · toolkit ahead of launch"; "consciousconnections.app" / "live site". Other studies as on their Paper pages | "Solo build [draft]": [draft]; the rest canvas; no content field ([PROPOSED] `facts`) |
| Lead artifact caption     | the media group label in sentence case (e.g. "Marketing site" from "MARKETING SITE") | existing: `<slug>` `media` (case set at render)                                        |
| At a glance               | "At a glance"; role · period · `engagementType`; each `atAGlance` label and value; "Stack" and `stack`; "Links" and each link's label, status and note | existing: `components/work/CaseBody.tsx`, `CaseLinks.tsx`, `<slug>`                    |
| Section heads             | "The brief", "What I built", "Process", "Decisions", "What broke", "Outcome", "Testimonial" | existing: `CaseBody.tsx`                                                               |
| Section head              | "Where AI sat"                                                             | canvas (D-SITE-85)                                                                     |
| The brief                 | `brief` intro, group heads (e.g. "The product", "The duty of care"), items | existing: `<slug>`                                                                     |
| What I built              | `built` intro, surface names and bodies; tile captions                     | existing: `<slug>` (`built`, `media`)                                                  |
| Gallery opener            | "All n images" (n from the study's media count)                            | canvas (D-SITE-82)                                                                     |
| Rows credit               | e.g. "Design direction by Nick Kidd (Pathfinder Studios); I built the application." | existing: `roomvy.ts` media caption                                  |
| Paired caption, link      | the family office diagram caption; Agora's "Read the design overview"      | existing: `family-office-platform.ts`, `agora.ts` (D-SITE-96)                          |
| Process                   | intro; step titles, muted intros, bullets                                  | existing: `<slug>` `process`                                                           |
| Decisions                 | `chip` labels (rendered uppercase), statement, "Instead of", "Why", bodies | existing: `<slug>`, `components/ui/DecisionCard.tsx`                                   |
| Privacy artifact caption  | "Each partner's brain-dump stays private to its author. [draft]"           | [draft]                                                                                |
| What broke, Outcome       | intros, row titles, bodies, bullets; live link label                       | existing: `<slug>` (`broke`, `outcome`, `links`)                                       |
| Where AI sat labels       | "In the product", "In the build", "What I checked"                         | canvas (D-SITE-85)                                                                     |
| Where AI sat values       | Conscious Connections: first two from `atAGlance` "AI system", "Method", verbatim; the third, and all three for Everbook, Agora and the family office | existing: `conscious-connections.ts`; the rest Taylor's to write (canvas holds synthetic placeholders) |
| Testimonial               | name, title, relationship line; the span                                   | existing: `content/testimonials.ts`; spans per D-SITE-84, 94                           |
| Close line                | `closingLine`                                                              | existing: `content/about.ts` (per-study line open, decisions-5)                        |
| Availability              | "Available now" · `availability`                                           | existing: `content/services.ts`                                                        |
| Close actions             | "Book a 30-minute call"; "Résumé (PDF)"; "Not ready to book?" + "Send a note" | button and Résumé: canvas (home's label, A-17; code's "Book a 30-min call →" retires); "Not ready to book?": existing `app/about/page.tsx`; "Send a note" to `/contact`: Work with me's close (D-SITE-127, 174) |

## Chrome, not found, controls

| Where              | String                                                                                             | Source                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Header             | "Taylor Aucoin", "Work", "About", "Work with me", "Contact", "Book a 30-minute call"                | home's locked header; "Contact" D-SITE-130                            |
| Footer             | "tayloraucoin.com", "About", "Résumé", "Contact", "GitHub", "LinkedIn", "Privacy"                    | home's locked footer; "Email" becomes "Contact" (D-SITE-130)          |
| Not found          | "This page isn't here. [draft]"; "See all work [draft]"                                           | [draft] (D-SITE-19)                                                   |
| Theme toggle name  | "Theme"                                                                                            | existing: `components/ui/ThemeToggle.tsx`                             |
| Lightbox names     | "Previous image", "Next image", "Close", "Play video"; dialog named by the item's `alt`              | existing: `components/work/MediaLightbox.tsx`, `<slug>` `media`       |
| Tile names         | the tile's visible caption                                                                         | existing: `<slug>` `media`                                            |
| Lightbox-only alt  | each media item's `alt`; Agora's generation labels                                                 | existing: `<slug>` (copy doc only, D-SITE-96)                         |
| Skip link          | Taylor's to write                                                                                  | Taylor's to write                                                     |
