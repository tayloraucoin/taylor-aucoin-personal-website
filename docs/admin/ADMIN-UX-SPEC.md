| D-ADM-13 | `/admin` has a Light / Dark / System theme control in the rail footer, between Collapse and the signed-in email. Light is Palette D on paper (D-DOC-1) with gold-700 for gold text and borders; it is gated on the admin tree and the public site stays dark-only. Two light values are `[PROPOSED]` (§9) | Taylor asked 2026-09-03; values Vesper's, logged |

# Admin UX spec — shell information architecture + intake question review

Author: Vesper. Governing UX handoff for the **ADM** track.
Status: ratified 2026-09-01. All §7 items decided.

> **Authority.** This document governs product behavior and visual law for `/admin`
> only. Where it is silent, repo `CLAUDE.md` + `docs/DESIGN-SYSTEM.md` +
> `docs/TASTE-PROFILE.md` govern. Where it conflicts with those, they win —
> except on the two points §7 records as deliberate admin-only departures.

---

## 1. The problem

`/admin` today is a flat top bar of six sibling links — Call queue, Leads,
Engagements, Sync, Scoreboard, Transcripts. Every one of them belongs to the
same job (turning a call into a lead into a signed engagement), and none of
them is grouped as such. The bar is already at its width limit at six items,
and the intake surfaces have not landed yet.

Conscious Connections solved the same problem with a left rail of labelled,
collapsible **sections** whose items nest beneath them
(`packages/ui/src/composed/navigation/admin-shell/`). Sections carry the
taxonomy; items carry the destinations. That structure is what this track
adopts. It is the structure that transfers, not the look — see §7.1.

## 2. Information architecture

Four sections. Section order is **the flow of a job through the business**, which
is Taylor's explicit call (2026-09-01): a name arrives as a lead, is asked
questions by the intake, becomes an engagement that gets built, and settles as
money. Item order **within** a section is alphabetical, per CC's own rule in
`constants.ts`.

Those two rules do not conflict — CC's alphabetical rule governs links, and
CC's own sections happen to be alphabetical because nothing sequences them.
Ours are sequenced. Logged as **D-ADM-2**.

**Leads** — the existing CRM, unchanged in behavior:

| Item        | Route                | Ready |
| ----------- | -------------------- | ----- |
| Call queue  | `/admin/queue`       | yes   |
| Leads       | `/admin/leads`       | yes   |
| Scoreboard  | `/admin/scoreboard`  | yes   |
| Sync        | `/admin/sync`        | yes   |
| Transcripts | `/admin/transcripts` | yes   |

**Intake** — new:

| Item      | Route                     | Ready       |
| --------- | ------------------------- | ----------- |
| Questions | `/admin/intake/questions` | ADM-2 flips |

**Engagements** — promoted out of Leads to its own section (Taylor,
2026-09-01), because an engagement is a different object at a different stage,
not a lead with a flag:

| Item        | Route                | Ready |
| ----------- | -------------------- | ----- |
| Engagements | `/admin/engagements` | yes   |

**Finances** — named now, built later. Shows real revenue:

| Item    | Route | Ready |
| ------- | ----- | ----- |
| Revenue | —     | no    |

**Unbuilt items render as dimmed labels, not links.** This reinstates the
`ready: false` pattern the previous shell already carried, and the comment that
justified it stands: the shape of the tool is useful information, and a dimmed
label is honest where a link to a 404 is not. An earlier draft of this spec
deleted the pattern on the grounds that every item existed; naming Finances
before building it makes the pattern load-bearing again. Reversal logged as
**D-ADM-7**.

`/admin` continues to redirect to `/admin/queue`. The rail's home link points at
the same place.

## 3. The rail

A persistent left column, full viewport height, its own quiet surface, with the
main content in a scrolling pane beside it.

**Structure, top to bottom:**

1. **Header** — `public/icon.png` at 24px beside `Admin` in the display face,
   linking home. Taylor supplied the mark (2026-09-01), which settles the open
   question an earlier draft of this spec raised. The mark alone stands in for
   the pair when the rail is collapsed.
2. **Sections** — each a collapsible group. The trigger is a 16px lucide icon
   plus the section label in the mono register (uppercase, wide-tracked,
   `--color-dim`), matching the eyebrow rule already used across the site. Items
   are a 14px icon plus a body-face link, indented, hairline-ruled off the
   rail's left edge.
3. **Footer** — the signed-in email in `--color-dim` at `text-xs`, and Sign out.
   Same server-action form as today; only its position changes.
   Between the collapse control and the email sits the theme control (§9).

**Section open/closed:** a section containing the active route is open. Others
default open too — with two sections and seven items the whole tree fits, and
collapsing something the user did not ask to collapse is a puzzle, not an
affordance. Collapse state is user-toggled and not persisted in v1.

**Active item:** `--color-c2` (gold) text plus a 2px gold rule on the item's
left edge. Gold as punctuation, one item at a time. `aria-current="page"` rides
with it — the color is not the only signal.

**Rail collapse:** the rail shrinks to a 3.5rem icon strip, as CC's does. Every
section and item now carries an icon (D-ADM-1), so the strip stays legible.
Collapsed section triggers open their items as a flyout to the right rather than
in place — a nested list inside a 3.5rem column has nowhere to go.

## 4. Responsive

- **`>= 1024px`** — rail fixed at 15rem, content pane beside it.
- **`< 1024px`** — rail is off-canvas. A top bar carries a menu button and the
  `Admin` home link. Opening the rail overlays the content with a scrim; it
  closes on route change, on scrim click, and on `Escape`. Focus moves into the
  rail on open and returns to the trigger on close.

Reuse `app/admin/_components/ui/sheet.tsx` for the off-canvas panel rather than
hand-rolling a second overlay. It is the sanctioned Radix exception and it
already owns focus trap, scrim, `Escape`, and the reduced-motion behavior.

## 5. State matrix — nav item

| State          | Treatment                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| default        | `--color-body`, transparent left rule                                                                                                 |
| hover          | `--color-ink`, background `--color-card-hover`                                                                                        |
| active (route) | `--color-c2`, 2px `--color-c2` left rule, `aria-current="page"`                                                                       |
| focus-visible  | 2px gold ring per `PRIM-04` — never removed, never color-only                                                                         |
| pressed        | no separate treatment; the navigation is the feedback                                                                                 |
| disabled       | not modelled. The old `ready: false` dimmed-label pattern is dropped: every item in §2 exists. Reintroducing it needs a new decision. |

Reduced motion: the collapsible height transition and the off-canvas slide both
collapse to instant. The sitewide `globals.css` rule already does this; nothing
in this track may add a duration that escapes it.

## 6. Intake question review — the surface

**One job:** let Taylor read, in one scroll, every question the intake actually
asks — in the client's exact words, in order.

**Shape.** A single vertical column. For each of the nine steps: the step number
and title in the intake's own step-heading register, the step intro where it has
one, then the step's real fields rendered by the real components. Steps are
separated by a hairline rule. Nothing is paginated and nothing is behind a tab —
"top to bottom" is the entire point of the surface.

**Fidelity is by construction, not by transcription.** The preview mounts the
production step components. There is no second copy of the question copy
anywhere, so there is nothing to drift. This is the one design constraint that
outranks every other choice on this screen.

**Controls,** in a header that stays out of the way:

- **Track** — `Website build` (durable) / `Portfolio build` (showcase). Two
  tracks, nine steps each, different questions. Both are real; the surface must
  show either.
- **Copy pack** — shown only on the portfolio track, which flexes between
  `generic` and `film`. Hidden on the website track, which has one voice.

**Fields are typeable and nothing is saved.** Taylor said "review and test."
A dead form cannot be tested — choice groups, repeatable blocks, and the
conditional reveals are half the questionnaire's behavior, and they only exist
when you can click them. So inputs work, state is local to the tab, and it is
gone on reload. What must never happen is a preview keystroke reaching a real
engagement; §6 of the tech scope makes that structural rather than promised.

**The banner is permanent, not dismissible.** A fixed line at the top of the
content pane: `Preview — nothing here is saved.` Plain words, `--color-dim`, no
alarm color and no icon. It is orientation, not a warning, and a person testing
a form should never have to reconstruct which mode they are in.

**Uploads are visibly inert.** File fields render so their prompt copy can be
read, with the drop target disabled and a single line beneath it:
`Uploads are disabled in preview.` A dropzone that accepts a file and then
fails is worse than one that says up front that it will not.

**Empty state:** none is reachable. Both tracks always have nine steps.

### 6.1 Document mode (ADM-4)

A second render mode for the same page, chosen by a `Mode` switch in the header
and carried in the URL. **Interface** is §6 above, unchanged. **Document** renders
the same production components as prose — a page that reads as if it were
written in Notion before being codified, which is what Taylor asked for
(2026-09-02) and how he intends to review the copy before finalising it.

The words are not transcribed. Every label, help line, option, placeholder, and
prompt is the string the component already renders, so D-ADM-6 holds without a
second home to keep in sync.

**Register** — this is law, not the builder's taste:

| Element           | Treatment                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| Measure           | `max-w-[68ch]` — wider than the form's 48ch because tags and keys need the room, narrower than the pane |
| Step              | `h2`, display 28/500 — the register the stack already uses                                              |
| Step intro        | body 16/300, `--color-body`                                                                             |
| Question          | `h3`, display 18/500, `--color-ink` (the DS card-heading size)                                          |
| Field key         | mono 10px, `--color-dim`, right of the question                                                         |
| Component tag     | literal `[Multiple choice]`, mono 10px, `--color-dim`                                                   |
| Help line         | body 15/300, `--color-dim`, under the label                                                             |
| Options           | `ul`, body 16/300, `--color-body`                                                                       |
| Reveal block      | `border-l border-(--color-faint) pl-5`, with `Shown when …` in mono 10px `--color-dim` above it         |
| Kind tag          | mono 10px, `--color-c2`                                                                                 |
| Between questions | space (`mb-8`). Hairlines stay for steps and groups only                                                |

Gold appears once in this design and only in the kind tag, because "who gets
this question" is the single thing the overview exists to show. Nothing in the
document hovers, moves, or takes focus.

**Component tags** are Taylor's own notation, kept literally: `[Short text]`,
`[Long text]`, `[Single choice]`, `[Multiple choice]`, `[Upload]`,
`[Upload · multiple]`, `[Repeatable · "<add label>"]`, `[Checkbox]`,
`[Paste box · "<button>"]`, `[Shown, not asked]`, `[Ranked list · …]`.

**Conditionals must be visible.** A document cannot be clicked, so a question
that only appears after an answer would be a question missing from the review —
the one defect this surface cannot have (ADM-2 §Failure states). Document mode
renders every reveal, indented, under a plain line naming its condition by field
key and stored value. The condition is structured data, never a hand-written
sentence naming the question (D-ADM-10).

**The overview is the same document, annotated.** An eighth view, `Every kind`,
renders the generic pack with every kind-driven branch shown and tagged
`asked of: studio · venture · business · other`, computed from the kind
registry. Questions with no tag are the base questions. There is no matrix table
and there will not be one: a table is a second home for the copy and reads as a
generic dashboard, which §7.1's ruling on ornament does not license.

**The document downloads as Markdown.** A `Download Markdown` button, document
mode only, saves the page as a `.md` file that opens cleanly in Notion —
headings nest, options are bulleted lists, component tags and answer keys are
inline code, and a reveal's condition is a block quote. The filename carries
what the site is for, so a folder of them is self-describing:
`intake-questions-coded-venture.md`, `intake-questions-coded-portfolio-film.md`,
`intake-questions-coded-every-kind.md`, `intake-questions-platform.md`.

The file is **the rendered document's own HTML, converted** — never a generator
that walks the step registry, which would be the second home for question copy
this surface exists to prevent. The chain is unbroken: what a client reads is
what the page shows is what the file contains.

**Words that change by pack** are listed at the foot of the document, derived by
diffing each copy pack against the generic floor. This is the other half of
"unique for certain types": the same question, different words. Slot names match
the ones the human-hand copy pass edits.

## 7. Ratified items

All open items were ruled on by Taylor, 2026-09-01. Recorded here as decided,
with the reasoning that produced the recommendation kept where it explains the
shape of the result.

### 7.1 Icons in the rail — **RATIFIED: icons, lucide, CC's set**

The recommendation was no icons, on the grounds that this site has none anywhere
and `TASTE-PROFILE` is a long record of ornament being rejected. Taylor
overruled: the rail is a private tool, it is being deliberately oriented onto
CC's convention, and CC's rail is icon-led.

Consequences accepted with the ruling:

- `lucide-react` is added as a dependency. It is the first icon dependency in
  the repo and it amends `specs/README.md`'s "no new dependency"
  non-negotiable, which now reads "no new dependency beyond `lucide-react`."
- Icons stay inside `/admin`. This ruling does not license an icon on any
  public surface, where `TASTE-PROFILE` still governs.
- With icons present, the collapsed rail becomes an icon strip rather than a
  hide-entirely toggle (§3).

### 7.2 `/admin` is exempt from the site's no-component-library law — **RATIFIED**

Already true on disk (`app/admin/_components/ui/sheet.tsx`, D-CRM-30). Stated
plainly so it is a standing exception with a boundary: the exception is the
Radix dependency for `/admin` overlays and the lucide dependency for `/admin`
icons — not a licence to reach for a component registry.

### 7.3 Where `Engagements` lives — **RATIFIED: its own section**

Overruled in the better direction. The earlier draft put Engagements under
Leads because that was the instruction at the time, while noting it reads more
naturally elsewhere. Taylor promoted it to a section of its own and named the
sequence the four sections now follow.

## 8. Decision log (D-ADM)

| ID       | Decision                                                                                                                         | Status                    |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| D-ADM-1  | Icons in the admin rail, via `lucide-react`, following CC's set                                                                  | RATIFIED 2026-09-01       |
| D-ADM-2  | Sections order by business flow; items order alphabetically within a section                                                     | RATIFIED 2026-09-01       |
| D-ADM-3  | `/admin` may use Radix overlays and lucide icons; the exception is bounded                                                       | RATIFIED 2026-09-01       |
| D-ADM-4  | `Engagements` is its own section, between Intake and Finances                                                                    | RATIFIED 2026-09-01       |
| D-ADM-5  | Preview fields are interactive and local-only; the banner is permanent                                                           | Vesper's call, logged     |
| D-ADM-6  | The preview mounts production step components; no transcribed copy exists                                                        | Binding — fidelity law    |
| D-ADM-7  | `ready: false` dimmed labels are reinstated; Finances ships named but unbuilt                                                    | RATIFIED 2026-09-01       |
| D-ADM-8  | `public/icon.png` is the rail's mark, at 24px, and stands alone when collapsed                                                   | RATIFIED 2026-09-01       |
| D-ADM-9  | The document is a render mode of the production primitives; no transcription exists                                              | Extends D-ADM-6 — binding |
| D-ADM-10 | Reveals are declared with a structured `dependsOn`; the document always shows them                                               | Vesper's call, logged     |
| D-ADM-11 | `Every kind` renders generic-pack words plus the pack-diff appendix; a branch with no generic floor prints a stub pointing at it | Vesper's call, logged     |
| D-ADM-12 | The Markdown export converts the rendered document rather than generating from the registry; the filename carries the site-kind  | RATIFIED 2026-09-03       |

## 9. Theme — Light / Dark / System (D-ADM-13)

Taylor asked for it 2026-09-03. Repo `CLAUDE.md` says the site has no light
mode; that law is about the site a client sees, and it now says so. `/admin`
is a tool one person uses for hours, sometimes in daylight, and a theme
preference there is a working condition, not a brand decision.

**The control.** Three cells — Light, Dark, System — as a group in the rail
footer, between Collapse and the signed-in email. Icon-only in both widths — the labels made it bulky (Taylor, 2026-09-03) — with
the word in `title` for the pointer and a screen-reader span for everyone
else. Restyled 2026-09-03 as shadcn's `ToggleGroup` pattern (Taylor asked for
it by link): a connected segmented group — one shared border, dividers between cells,
rounded only at the ends — rather than three separate buttons. Row when
expanded, column when collapsed. Shrunk 2026-09-03 (Taylor: "too big and
blocky") from the rail's 44px nav-target size to a 28px `size-7` cell with a
14px icon, and from `--color-line` to the site's standard `--color-faint`
hairline — a settings control this low-frequency does not need primary-nav
weight, and this is a desktop tool with one user. Three visible choices, not a
cycling button: the stored preference is a fact the user reads, not one they
infer from an icon. Selection is ink on `--color-tint`, deliberately not gold —
gold in the rail says _where you are_; this is a setting. `aria-pressed`
carries the state. Default is System.

**The values.** Every light token is Palette D on paper (D-DOC-1) or a ramp
step from DESIGN-SYSTEM §1. Ink is `ground-a`; body, dim, and hairline are the
paper counterparts; the rail and panels take the tint; gold text and borders
step to gold-700, the first gold legal on white (6.0:1). Fills that must stay
gold in both themes (the day-strip "best" bar) read `--color-gold-500`, which
never moves. Two values had no documented counterpart and ship as reversible
proposals, built by the same construction D-DOC-1 used for its tint (ground-a
at ~3%): `--color-card-hover` at ground-a 7%, and `--color-well` — the sunken
fill under inputs — at ground-a 4%. `[PROPOSED — needs sign-off]`, judged on
the live surface, not swatches.

**The contrast floors, measured on paper:** body 10.4:1, dim 5.3:1 (4.9:1 on
the tint), gold-700 6.0:1, white on `--color-action` 5.33:1 unchanged. Known
carry-over: the `ready: false` dimmed label sits at `--color-dim` at 60%
alpha in both themes and is below the floor in both — non-interactive, and
unchanged by this ticket.

**What did not change.** The dark admin is pixel-for-pixel the ground state:
the `white/N` and `black/N` alpha classes the CRM used became role tokens
carrying their exact former values (DESIGN-SYSTEM §1 "Admin surface tokens").
The public site is untouched by construction — see M-ADM-8 for the gate.

**Feedback round, 2026-09-03 (Taylor, on the intake preview in light).** Four
findings, three changes:

- The toggle labels made the control bulky → icon-only, above.
- The primary CTA ran gold-700 → cream on paper: a muddy cold end with the
  ink label at 3.4:1, and a hot end that vanished into the page. The ghost
  CTA rendered as a grey slab — `ground-a` at 55%, hardcoded in
  `GradientButton.tsx`, showing through on white. Both fills now read fill
  tokens that never follow the text golds: the gradient is gold-500 →
  `--color-gradient-hot` (cream in dark, gold-300 on paper), and the ghost
  takes `--color-ghost-*` (paper fill, gold-600 line, gold-700 on hover).
  Dark values are exactly what shipped.
- Faded text on the tint: D-DOC-1 dim measured 4.9:1 there. Light dim is now
  `#5A5773` `[PROPOSED]` — night-650, the OKLCH midpoint of the ramp's 600 and
  700 — at 6.4:1 on the tint and 6.9:1 on paper, which is the site's own floor.
- The light-mode choices otherwise stand.
