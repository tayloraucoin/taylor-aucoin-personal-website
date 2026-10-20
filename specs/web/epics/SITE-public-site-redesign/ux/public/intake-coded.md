---
target: specs/web/ux/public/intake-coded.md
status: approved
promoted:
design:
  file: Taylor Aucoin (Paper)
  page: Intake (process on "Intake · iterations", D-SITE-152)
  artboards: "intake / <step|save|invalid|start|start-resume|welcome|resume|taste|import|import-mark|pay|confirming|unavailable|done> / <1440|390> / <dark|light>; save, invalid, start-resume and import-mark are region crops"
  captures: "captures/intake-coded/<state>-<width>[-dark].png"
  locked: 2026-10-16 (D-SITE-163)
---

# Coded-site intake — public

Intent pass, then handoff pass, 2026-10-16. A restyle under the new brand, not a redesign: the flow, steps and questions stay as they are (verified `app/websites/coded/intake/`). Amends the brief's "The intake flows get tokens only": a few screens are drawn, the rest restyle by the token rules below. Decisions are `D-SITE-n` in the decision logs.

Parts: layout, access, instrumentation and criteria in `intake-coded-build.md`; words in `intake-coded-words.md`; the copy change list in `intake-coded-copy.md`.

## Job

A client who has decided to buy a coded site gets set up, answers the questionnaire in as many sittings as they need, pays the deposit, and hands over everything the build needs. Done for them: nothing they typed is lost, they know what was charged and what happens next.

## Route

`/websites/coded/intake` stays (D-SITE-160). The `/websites/coded` redirect matches that exact path only; a `/:path*` rule would swallow the intake. Trimming the URL back still lands on the coded page, through that redirect.

## Entry and exit

- **Entry:** the coded page's start (`websites-coded.md`); an emailed resume link; the start page's resume offer (cookie scoped to the intake path, verified `_actions/start.ts`); Stripe's return (`?paid=1`, `?canceled=1`; verified `server/services/deposit.ts`).
- **Order** (verified `[token]/page.tsx`): start → pay gate while a deposit is owed → confirming until the webhook lands → welcome on a first visit, resume list after → ten steps → done.
- **Exit:** the done screen; `/websites/privacy` and `/websites/terms`.

## Chrome

None: no header, footer, analytics or consent banner (verified `app/websites/intake/layout.tsx`; hidden by `components/ui/SiteChrome.tsx`). The theme toggle stays (`intake-theme.tsx`). Shared components (`app/websites/intake/_components/`) take the new brand everywhere, so the platform intake changes too, with no screens or copy work (D-SITE-112).

## States

Drawn at 390 and 1440, dark then light (D-SITE-60, D-SITE-61); states other than default as region crops (D-SITE-35). D-SITE-161, amended by D-SITE-156. Canvas: `captures/intake-coded/<key>-*.png` is the four files `-390`, `-1440`, `-390-dark`, `-1440-dark`. Rows found in code, not in the intent pass: D-SITE-216. States are reached by the admin client preview, never a public `?state=` (D-SITE-218).

| Screen         | State                                        | Key            | Canvas                                                          |
| -------------- | -------------------------------------------- | -------------- | --------------------------------------------------------------- |
| Start          | default                                      | `start`        | `start-*.png`                                                   |
| Start          | resume offer ("already started")             | `start-resume` | `start-resume-*.png` (crop)                                     |
| Start          | email invalid (the one validated field)      | `invalid`      | `invalid-*.png` (crop)                                          |
| Start          | submitting                                   | —              | N/A: the primary's label swaps to "Starting…"                   |
| Start          | an intake already open for that email        | —              | N/A: default plus one status line above Start                   |
| Start          | server error                                 | —              | N/A: the error line of `invalid`, above Start                   |
| Welcome        | default                                      | `welcome`      | `welcome-*.png`                                                 |
| Welcome        | after payment                                | —              | N/A: same layout, h1 differs (`showcase-welcome.tsx:60`)        |
| Welcome        | link sent                                    | —              | N/A: the ghost's label swaps to the sent line                   |
| Resume list    | returning client, step 4 of 10               | `resume`       | `resume-*.png`                                                  |
| Question step  | default (idle save), the pattern for all ten | `step`         | `step-*.png`                                                    |
| Question step  | saving, saved, offline, error with retry     | `save`         | `save-*.png` (crop, four rows)                                  |
| Taste gallery  | one group open, one pick saved               | `taste`        | `taste-*.png`                                                   |
| Credits import | reading (in progress)                        | —              | N/A: the result modal with the working line, by the token rules |
| Credits import | "Read it through" card over step 1           | `import`       | `import-*.png`                                                  |
| Credits import | a filled-in field on a later step            | `import-mark`  | `import-mark-*.png` (crop)                                      |
| Pay gate       | plan chosen, one add-on, agreement ticked    | `pay`          | `pay-*.png`                                                     |
| Pay gate       | canceled                                     | —              | N/A: default plus one line                                      |
| Payment        | confirming (`?paid=1`)                       | `confirming`   | `confirming-*.png`                                              |
| Payment        | confirming after 40s                         | —              | N/A: body swap plus the email link, as `unavailable`            |
| Link           | unavailable, expired                         | `unavailable`  | `unavailable-*.png`                                             |
| Link           | unavailable, invalid                         | —              | N/A: same layout, h1 and body differ                            |
| Done           | default, two skipped answers                 | `done`         | `done-*.png`                                                    |
| Done           | loading                                      | —              | N/A: server-rendered                                            |

## Primary action

One per view (A-17): Start; Begin; Continue; Pay the deposit. The save indicator is status, never an action. Done has none; "Review my answers" stays a ghost (D-SITE-157).

## Token rules

For every screen not drawn, in both intake trees (D-SITE-158). Counts verified by grep over `app/websites/intake/` and `app/websites/coded/intake/`.

| Old idiom (files)                                      | Rule                                                                                                                                                                 | Law                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `font-mono` uppercase at 9–11px (66)                   | Albert Sans meta 13, sentence case, muted. The kit label (12/500/+0.2em) only in a ledger's label column. Fragment Mono only for code or technical data              | kit §3; A-07                |
| `--color-c2` / `c3` as text (63)                       | Numbers and counts: text or muted. Errors: D-SITE-154. Links: text link (text colour, mark underline; hover 2px). Gold stays a mark: dot, progress, underline, focus | kit §1 law 1; house law 3   |
| `GradientButton` (29)                                  | Already a solid fill: keep it as the one primary per view. `GhostButton` for the rest. No `GradientRing` anywhere in the intake                                      | house law 3; A-17           |
| `Eyebrow` (13)                                         | Remove. Position becomes "Step n of 10" in meta; section and card kickers become Heading 4                                                                           | A-07                        |
| `font-display` 22–38 medium (23)                       | h1 at Heading 2 (30/600); the welcome line at Heading 3 weight 500                                                                                                   | kit §3                      |
| `font-light` body, 13.5px help (70, 44)                | Body 17 (16 under 640) at 400; help and notes at meta 13, muted                                                                                                      | kit §3: weights 400 and 500 |
| `--color-gold-line*` borders on choices and inputs (8) | Strong border at rest, text colour selected or hovered, a mark dot for the chosen radio; invalid is a 2px text-colour border                                         | D-SITE-153, D-SITE-154      |
| Gold amounts and score readouts                        | Text colour at Heading 4, or meta for a readout; tick numerals muted, the chosen one in text colour                                                                  | kit §1 law 1                |
| 9px mono tag chips                                     | The Components topic tag                                                                                                                                             | Components                  |
| Cards (`--color-card`, faint border)                   | The kit surface card with a hairline, only for a grouped block (offer, confirm, modal, example). Never around a single field                                         | kit §6                      |
| Backdrop `carbon-900/86`                               | The theme's ground at 86%, so light gets a light backdrop                                                                                                            | kit §1                      |
| `WorkingIndicator` cycling lines                       | No spinner; reduced motion shows the first line only [PROPOSED]                                                                                                      | house law 7; kit §5         |

## Settled at handoff

- Theme: today's Light, Dark, System group stays, restyled; not the canvas's single icon button (D-SITE-219).
- Voice first person throughout; the Agora eyebrow is replaced by nothing; Taylor rewrites the flagged lines with the copy list (D-SITE-220).
- Done stays as drawn: the Stripe receipt carries the amount (D-SITE-220).

No open decisions.
