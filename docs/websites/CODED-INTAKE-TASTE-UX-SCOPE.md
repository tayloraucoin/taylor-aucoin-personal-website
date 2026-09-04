# Coded-track intake — the taste step, redesigned: UX scope

Author: Vesper (design). Status: **Approved by Taylor, 2026-09-03** (soft minimum; D-PORT-4 reversed in part). Scoped by Mason and Reeve the same day as `specs/PORT-22…27`; M-PORT-35…38 record the architecture. This is the "Taylor's own separate pass" on step 6 that `portfolio-intake-questions-v2.md` § pass two left open.

**Document authority.** On presentation law, [`PORTFOLIO-INTAKE-UX-SCOPE.md`](PORTFOLIO-INTAKE-UX-SCOPE.md) §3 and the D-INT / D-PORT logs win; this document inherits them whole and defines deltas, and where it asks to reverse a logged ruling it says so by ID (§14). On architecture already ruled, [`specs/TECHNICAL-DECISIONS.md`](specs/TECHNICAL-DECISIONS.md) wins. On tokens, [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) wins. On what the gallery holds, the two research libraries Taylor commissioned (film batch one and batch two, August 2026) are the source for the taxonomy in §4; the sites themselves remain Taylor's curation.

Copy note: every client-facing string introduced here is a **draft** marked `[COPY — draft]`, written in the v2 register so Taylor's human-hand pass edits rather than starts from nothing. They are tabled in §13. Nothing here is approved copy until he says so.

---

## 0. What this answers

Taylor's brief (2026-09-03): most of the taste step's questions are noise; the example-site picks are the signal. Rebuild the step around the picks — grouped, scored, annotated, with a minimum of five — add an AI search for sites that feel like what the client describes, keep the brain dump and the three words, and put the motion add-on in front of them at the end, purchasable in place.

This document decides what stays, what goes, what the gallery is made of, and how every new piece looks, moves, and fails. It is written so Mason can cut tickets from §16 without a call.

The short version: **one gallery, one pick grammar used three times, one AI button, one add-on notice.** Six of the old eleven questions go. Three new sections arrive. The step gets longer in signal and shorter in questions.

---

## 1. Frame — who is here, in what state

The user is unchanged from the track's scope §1: a working creative, evening, laptop or phone, precious about the work, at risk of stalling on the surface that most invites perfectionism. Taste is that surface. Two things about their state shape this step more than any other:

**They have taste and they have never had to explain it.** Asked "dark or light?" they answer honestly and it tells us nothing; shown twenty sites they react in seconds and the pattern in the reactions is the whole brief. So the step's job is to get reactions out of them cheaply and to get the *why* attached to each one before it evaporates. The number is the cheap part; the sentence is the signal. Everything below is built to make the sentence easy.

**Twenty-plus live websites is a lot to hold in one scroll on a phone.** The current step lays every card flat. Accordions are the fix Taylor asked for and the right one: closed groups let the client choose where to spend attention, and a group title is itself a first reaction ("not that one").

**The one job of this step:** leave Taylor with at least five annotated, scored, tagged picks from a set he has tagged himself, so the first look is aimed rather than guessed. Everything else on the step is context for those five.

**The emotional contract** gains one clause: *I am not being tested on design vocabulary.* Every input is either a tap, a slider, or "say what you liked, in your own words."

**What has not changed:** completion over thoroughness (scope §1). Every field stays optional (D-INT-4). The minimum of five is an *ask*, stated plainly and counted honestly, not a gate — §6.4 makes the case and §14 flags it for ratification because it brushes a binding ruling.

---

## 2. The spine

```
Step intro (v2, verbatim)
  1  The gallery          — closed accordions, one group each; rows inside
  2  Your picks           — absent until the first pick; compact list, edit in place
  3  Three words          — v2, verbatim ×3
  4  Never feel like      — v2, verbatim
  5  Find more like it    — style brief + "Search with AI" + result links
  6  Sites you've found   — their own links, same pick grammar (scale + note)
  7  Images you've saved  — the existing inspiration upload
  8  The brain dump       — last, largest, rewritten intent
  9  Motion               — add-on notice (unbought) or confirmed notice + its three questions (bought)
Footer (StepShell) — Back · Continue · save indicator · picks counter (§6.4)
```

One scroll, per D-INT-5. Sections 1–2 carry the design signal; 3–4 distil it; 5–6 widen it beyond our set; 7–8 catch everything else; 9 is the one commercial moment and it sits last so it never colours the reactions above it.

---

## 3. What persists, what goes — the assessment

| Today | Verdict | Why |
|---|---|---|
| Gallery cards + favourite toggle + note reveal | **Replaced** by §5–6 | Same intent, new grammar: grouped rows, a score, a note that is the point rather than a reveal |
| Ranked favourites (drag / move buttons) | **Retired** | The seven-stop scale is the rank. Ties are honest; a forced total order was asking for a precision nobody has |
| What should the site sit on? (ground tone, 6 options) | **Retired** | Every pick carries a ground tag; five scored picks vote on this axis with more nuance than one radio. Fallback if Taylor wants exactly one radio kept: this is the one, because it is the axis clients feel most strongly about |
| How still should it be? | **Retired** | Motion is now a purchase decision (§12), and buyers answer "how much should it announce itself?" inside the add-on block. The animation block's body line that references "the questions above about stillness" needs one clause edited (§13) |
| How much on screen at once? | **Retired** | Density is a tag on every pick; derivable |
| Animations add-on questions (bought only) | **Persist**, moved to §12 | Same three fields, same keys; now framed by the confirmed notice |
| Three words the site should feel like | **Persists** (Taylor's floor) | v2 verbatim. Also feeds the come-across prediction and, proposed, the AI search |
| And one thing it must never feel like | **Persists** (Taylor's floor) | v2 verbatim |
| Anything else that's caught your eye (images) | **Persists**, moved into §11 | Same `inspiration` upload field and file path |
| Links worth a look (long text) | **Replaced** by §11's structured list | A bare URL list told us nothing about *why*; each link now takes the pick grammar |
| The brain dump | **Persists**, promoted and re-briefed | Last input on the step, largest box, help rewritten to Taylor's intent |
| Anything that makes you close a tab instantly? | **Retired** as a field; its clause folds into the brain-dump help | Low picks with notes already carry dislikes; one fewer box |

Net: eleven questions become five inputs plus the gallery. Nothing that carried unique signal is lost; three things that carried derivable signal are derived.

---

## 4. The taxonomy — what a row is tagged with

The two research libraries agree on the structure and it is more useful than the axes alone. Four things describe a site; three are shown to the client and one is kept for Taylor.

### 4.1 Groups (the accordions)

The archetypes that recurred across ~110 film sites, in client-facing words. Groups are **style**, never occupation — a DP should meet every archetype, and the point of the exercise is to find out which one their eye goes to. Occupation is a per-row line (§4.4).

| Key | Accordion title `[COPY — draft]` | One line under the title `[COPY — draft]` | Research source |
|---|---|---|---|
| `dark-cinematic` | Dark and cinematic | The footage is the light. Reel up top, a grid underneath, motion on hover. | Batch one archetype 1; batch two "platform-template reel-grid" |
| `light-editorial` | Light and editorial | White space, good type, the work hung like prints. | Batch one archetype 2 |
| `type-first` | Type does the work | Almost no images up front. An index, a list, names that carry weight. | Batch one archetype 3 |
| `warm-textured` | Warm and textured | Grain, paper, colour, a bit of personality. Breaks the black-or-white habit. | Batch two cluster "warm/organic & personality" |
| `stills-credits` | Stills and credits | Frames and credit lists carry it. Built for people with more credits than cut footage. | Batch two "credits/stills-first crew"; letterbox motif folds in |
| `statement` | Statement pieces | Custom-built, motion-heavy, the site is part of the work. | Batch one archetype 4 |

Six groups for the film set. The vocabulary is shared across packs; a generic or venture set uses the same keys with its own sites, and a group with zero sites in a set does not render. Order on the page is the order above: the genre default first, the extreme last, so the client sees the familiar before the exotic. `[PROPOSED — D-PORT-15]`

Batch two's "audio-first" cluster is folded into `type-first` (it is the text-first archetype for a non-visual discipline), and its "achievability" finding becomes the private `build` field below rather than a group: a client should never be sorted by what they can afford to copy.

### 4.2 Axes (three tags, always present)

The three intake axes the research tagged every site on. Rendered as the first three tags on every row, in this order, in mono tag type.

| Axis | Values | Tag text `[COPY — draft]` |
|---|---|---|
| `ground` | `dark` · `light` · `warm` | Dark · Light · Warm |
| `motion` | `still` · `quiet` · `alive` | Still · Quiet · Alive |
| `density` | `sparse` · `balanced` · `dense` | Sparse · Balanced · Dense |

These are exactly the three retired radios, moved from a question the client answers cold to a property of things they react to. Five scored picks give Taylor a weighted vote on each axis without asking.

### 4.3 Style tags (up to three, bounded vocabulary)

The modifiers that recurred and that a client can see in a screenshot. A **closed list**, so tags stay comparable across sites and the intake document can group by them. Taylor picks at most three per site.

`hover-preview` · `full-bleed-video` · `grid` · `index-nav` · `horizontal-scroll` · `oversized-type` · `serif` · `mono` · `grain` · `monochrome` · `one-colour-accent` · `letterbox` · `lightbox-stills` · `single-page` · `case-studies` · `credits-heavy` · `splash-gate` (for the deliberately included cautionary sites)

Client-facing text is the key with hyphens as spaces, sentence case (`Hover preview`, `Full-bleed video`). Adding a tag is a content-type edit, not a code edit; the list lives beside the group vocabulary.

### 4.4 Per-row facts

- **`role`** — the occupation line, free text, short: *"Cinematographer · commercials, music video"*. Rendered under the name.
- **`host`** — the display URL, derived from `url` by stripping scheme and `www.` at render (`matiasboucard.com`). Never typed twice.
- **`build`** — `template` · `designer` · `custom`. **Not rendered to the client.** Printed in the intake document beside each pick so Taylor knows what a favourite costs to reach. `[PROPOSED]`
- **`embed`** — boolean. True only where Taylor has opened the site inside a frame and seen it work. §7.2 explains why this cannot be detected at runtime.
- **`checkedOn`** — ISO date of the last time the link was verified live. Not rendered; both libraries warn personal sites go dark, and the document can flag a pick whose check is older than ninety days.
- **`captures`** — as today, with the aspect changed (§5.2).

---

## 5. The gallery

### 5.1 Accordions

Closed on arrival, every one. A header is a full-width `button` with `aria-expanded`, min-height 56px, hairline above and below (the work-row grammar from the design system, without the sweep):

```
┌─────────────────────────────────────────────────────────────┐
│ DARK AND CINEMATIC                            6 sites · 2 picked  ▾ │
│ The footage is the light. Reel up top, a grid underneath…   │
└─────────────────────────────────────────────────────────────┘
```

- Title in mono section-label type (10px, `.28em`, `--color-dim`), the one-liner in card-body type (`--color-body`), the counts right-aligned in mono dim. `N picked` appears only once N is at least one, in `--color-c2`; it is the accordion's only colour.
- Open: the rows reveal in place with the §6.5 eased reveal (300ms, reduced-motion instant). The chevron rotates; nothing else moves.
- Several may be open at once — people compare, and forcing one-open is the accordion pattern that makes people lose their place.
- Open state is presentation only, never persisted, with one exception: closing the overlay (§7) leaves the current row's group open and scrolls the row into view, so the client lands back where they were.
- Preview and document modes: every group renders open with its rows; nothing is behind a click in a document nobody can click (ADM-2 law).

### 5.2 A row

One site per row, full column width (560px), stacked, never a two-up grid — a screenshot at 260px wide cannot show a site's type.

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │              hero capture · 1512 × 982 box              │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Matias Boucard                        matiasboucard.com ↗   │
│ Cinematographer · commercials, music video                  │
│ DARK · ALIVE · BALANCED · HOVER PREVIEW · GRID              │
│                                                             │
│ [ Select ]   [ See more ]                                   │
└─────────────────────────────────────────────────────────────┘
```

- **The capture** is the site's opening view at the MacBook Pro 14" aspect, **1512 × 982** (≈1.54:1), captured at 2× (3024 × 1964) for retina. This replaces PORT-7's 16:10 recommendation; the content contract's dimensions law is unchanged (explicit `width`/`height`, the repo trap). Additional captures stay in the content file for the overlay; the row shows only the first, so a twenty-four-row gallery loads twenty-four images at most, lazily below the fold as today.
- **Why a capture and not a live frame in the row:** §7.2. Short form: most sites refuse to be framed, the ones that allow it are heavy, and a frame inside an accordion inside a form on a phone is a scroll trap. The row is for reacting; the overlay is for looking.
- **Name** in card-heading type, ink. **Host** as the link: mono 10px, `.18em`, dim, underline offset 4, external-arrow glyph after it, `target="_blank" rel="noreferrer noopener"`, hover to ink. The name itself is not a link — one link per row, and it says where it goes.
- **Role** in card-body type, body colour, one line, truncated with an ellipsis at two lines.
- **Tags** in the card-tag grammar (mono 9px, `.24em`, dim), separated by a middle dot, wrapping to two lines at most. Axes first, then styles.
- **Two buttons**, both `GhostButton`, min-height 44px, side by side; on a 375px viewport they take half the width each. No ring, no gradient, no lift — nothing on a row out-dresses Continue (PORT-7 law, unchanged).
- Capture 404 → the quiet placeholder block PORT-7 specified, name and link intact.

---

## 6. The pick — one grammar, used three times

The same block appears on a gallery row (§5.2), inside the overlay (§7.3), and on each of the client's own reference sites (§11.1). Designed once.

### 6.1 Composing

Pressing **Select** replaces the two buttons, in place, with the eased reveal:

```
┌─────────────────────────────────────────────────────────────┐
│ HOW CLOSE IS THIS TO WHAT YOU WANT?                          │
│  ○    ○    ○    ○    ○    ○    ○                            │
│  1                                  7                       │
│  One detail                  Build me this                  │
│                                                             │
│ WHAT DO YOU LIKE ABOUT IT?                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ The hover previews, the way the grid breathes, the      │ │
│ │ project pages more than the home page…                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Click around — the project pages and the about page count   │
│ as much as the home page. A word or a paragraph, either is  │
│ fine.                                                       │
│                                                             │
│ [ Save ]   Cancel                                           │
└─────────────────────────────────────────────────────────────┘
```

**The scale.** Seven discrete stops, not a continuous range thumb. Each stop is a 44px target; the track is a hairline; the chosen stop fills gold and the stops below it warm slightly so the scale reads as a level. Keyboard: the group is one `role="slider"` with `aria-valuemin=1`, `aria-valuemax=7`, `aria-valuetext` reading the end labels at 1 and 7 and the number between; arrow keys step, Home/End jump. **No default value.** A range input with a default fabricates a score nobody gave and every unmoved pick would read as the same middle number; an untouched scale saves no score and the pick shows a dim dash where the number would be.

Why the question is *closeness* and not *liking*: they pressed Select, so they like it. What Taylor needs is *how much of it*. A 2 with the note "just the hover previews" is a precise instruction; a 7 is a different one. The ends are labelled so a low number is a real answer rather than a slight.

**The note.** `TextArea`, three rows, auto-grow. Label and help carry Taylor's three intents verbatim in the draft: which *parts* they like, look past the home page, as much or as little as they want. No character count.

**Save** is a `GhostButton` (not gradient — the step's Continue remains the only gradient on screen). Enabled always; saving with an empty note is allowed because nothing on this form refuses a save (D-INT-4), and the saved state asks for the note once, quietly (§6.2). **Cancel** is a dim text link. Cancel on a fresh pick returns the row to default; cancel while editing an existing pick restores the previous score and note.

Autosave: Save flushes. Typing in the note does not — a half-typed note is committed on blur like every other field, so backing out of the step mid-sentence loses nothing.

### 6.2 Picked

```
┌─────────────────────────────────────────────────────────────┐
│ ● PICKED · 5 / 7                                  Edit · Remove │
│ "The hover previews, the way the grid breathes…"            │
└─────────────────────────────────────────────────────────────┘
```

- The row takes the selected grammar every choice on this surface uses: gold hairline border at `rgb(232 185 97 / .55)`, background `--color-card-hover`. Same as the favourited card today.
- The block reads `PICKED · 5 / 7` in mono, the numeral in `--color-c2`; a dash if unscored. The note's first two lines follow in body type, ink; if empty, one dim line: `[COPY — draft]` *"No note yet — the why is the useful part."* with **Add a note** as the link. That line is the only nudge on the step and it is dim, not gold.
- **Edit** reopens §6.1 with the values in place. **Remove** clears the pick with the six-second inline undo the repeatable block uses (`Removed. Undo`). No confirm dialog.

### 6.3 Your picks (the summary section)

Appears below the gallery once the first pick exists; absent, not empty, before that (PORT-7 law). Mono label `YOUR PICKS`, then one compact row per pick in gallery order, no drag, no move buttons — the score is the order and ties are fine:

```
01  Matias Boucard          5 / 7   "The hover previews, the way…"   Edit
02  Jacob McKee             7 / 7   "Build me this. Nothing else…"   Edit
```

Gold mono index, name in ink, score in gold mono, note excerpt dim, **Edit** scrolls to and opens that row's composer (opening its group if closed). Above the list, the intro line that states the ask once, in full: `[COPY — draft]` *"Five is the number we're after. More is welcome; fewer and the first look is more of a guess."* This is where the minimum is explained; the footer counter (§6.4) only counts.

### 6.4 The five, and where the count lives

Taylor asked whether a persistent bottom bar carrying the minimum is smart or noise. **A second bar is noise.** The step already has a fixed footer (Back · Continue · save indicator · next-step line); stacking another bar above it on a 375px phone spends a fifth of the viewport on chrome. But a persistent count is right, because the ask is real and the client should never have to scroll up to know where they stand.

So the count lives **in the footer's second row, in the slot the next-step line occupies**, on this step only:

```
Saved                                         PICKED · 3 OF 5
```

- Mono 10px `.18em`, dim, the numerals in `--color-c2`. Once five is reached it reads `PICKED · 5 OF 5` for one save cycle and then yields the slot back to `Next · Media` — the ask is met, the footer goes back to normal, and the count is still on the picks section above. Reduced motion: text swaps, no fade.
- It **never colours toward alarm, never animates, never says anything but the count.** It is a fact about a stated ask, not a completeness meter; the scope §1 law against meters is about pressuring thoroughness on open-ended catalogues, and this is a closed ask with a number Taylor chose. §14 records the distinction.
- **Hidden whenever the overlay is open**, for free: the overlay is a full-viewport portal above the footer's `z-10` (§7.1).
- **Continue is never disabled** (D-INT-4). Under five, Continue works, and the done screen's skipped-list grammar carries `[COPY — draft]` *"Example sites: 3 picked (we asked for 5)"* so the shortfall is recorded, not enforced. A client who cannot proceed is a client who abandons; that law was learned on the durable track and it holds harder here, where the step is the longest in the flow. `[PROPOSED — D-PORT-16; Taylor asked for "required for submit" and this is the softer reading — see §14]`
- Picks from the client's own sites (§11.1) do **not** count toward the five. The five are from our tagged set because the tags are what make five picks computable. The counter's label says `PICKED`, the picks intro says "from the sites above"; nothing else needs to explain it.

---

## 7. See more — the gallery overlay

### 7.1 Shell

A full-viewport dialog, portalled to `document.body` (the `MediaLightbox` reasoning: a `backdrop-filter` ancestor would otherwise become the containing block). `role="dialog"`, `aria-modal`, labelled by the site name, focus trapped, focus returned to the row's **See more** on close. `body.overflow` saved and restored to its prior value. Escape closes. Scrim: `--color-ground-a` at 92% with the grain overlay; no blur (the frame beneath is a live site — blurring it is wasted work).

Open: fade 300ms `--ease-out`; reduced motion: instant. Close: same.

```
┌──────────────────────────────────────────────────────────────────┐
│ DARK AND CINEMATIC · 3 OF 24                              Close  │
│                                                                  │
│      ┌────────────────────────────────────────────────────┐      │
│  ‹   │                                                    │   ›  │
│      │             frame or capture · 1512 : 982          │      │
│      │                                                    │      │
│      └────────────────────────────────────────────────────┘      │
│                                                                  │
│ Matias Boucard                              matiasboucard.com ↗  │
│ Cinematographer · commercials, music video                       │
│ DARK · ALIVE · BALANCED · HOVER PREVIEW · GRID                   │
│                                                                  │
│ [ Select ]                                                       │
└──────────────────────────────────────────────────────────────────┘
```

- Top bar: the group name and position as a mono eyebrow (`3 OF 24` counts across the whole gallery, §7.4), **Close** as a real button with text, right.
- The stage box is computed, not expressed in CSS: the largest 1512:982 rectangle that fits `viewport width − 2 × 56px` (room for the arrows) by `viewport height × 0.62`. Explicit pixel width and height on both the frame and the capture — the repo's `w-auto` trap applies to the capture exactly as it did in `MediaLightbox`.
- Below the stage, the row's facts and the pick block, identical to §5.2 and §6 minus **See more** (we are in it). Scrolls within the dialog if the viewport is short; the stage never shrinks below 320px wide to make room.

### 7.2 The frame — when it is live and when it is not

Taylor's preference is a live embed at MacBook aspect, and where it works it is the best possible "see more". Three facts bound it:

1. **Most sites refuse to be framed.** `X-Frame-Options` and `frame-ancestors` are defaults on Squarespace, Wix, Webflow, Format, and Fabrik, which between them host most of the research set. A refused frame renders blank, and the browser does not tell page script *why* — `load` fires on a blocked frame in Chromium. So whether a site embeds **cannot be detected at runtime**; it is a fact Taylor establishes at curation and records as `embed: true`. Default false.
2. **Sites that do embed are heavy and grabby** — autoplay reels, WebGL, scroll hijacking, cookie banners. One at a time is the most the step should ever run.
3. **On a phone the frame is a different site.** A 340px-wide frame gets the site's mobile layout, which is not the desktop hero the capture shows and not what a MacBook aspect box is for.

So:

- **Row:** always the capture (§5.2). Never a frame.
- **Overlay, viewport ≥ 1024px, `embed: true`:** the frame, sandboxed (`sandbox="allow-scripts allow-same-origin allow-popups-to-escape-sandbox"` — no forms, no top navigation, no downloads), `loading="lazy"`, `referrerpolicy="no-referrer"`, mounted on open and unmounted on page or close. Never more than one frame in the DOM. The capture renders **under** the frame from the first paint and stays until the frame's `load` fires plus 400ms, then the capture fades out — the client sees the site immediately either way and a slow frame never shows a blank box.
- **Overlay, viewport ≥ 1024px, `embed: false`:** the capture set as a horizontally snapping strip inside the stage (first capture, then the two or three more from the content file), with the strip's own dots under it. Same box, same size.
- **Overlay, viewport < 1024px:** the capture strip regardless of `embed`.
- Every overlay carries the **Open the site** link, so nothing depends on the frame. `[PROPOSED — D-PORT-17]`

Cost of being wrong on the 1024px threshold: one constant. Reversible.

### 7.3 The pick block inside the overlay

Identical component, identical states, identical storage. Saving in the overlay updates the row beneath it and the footer count (which is hidden, and correct when it reappears). Composing persists across paging: if the client pages away mid-note, the draft is flushed by the same blur rule and the row shows picked-with-note. Nothing is lost by pressing an arrow.

### 7.4 Paging

- **Arrows** are real buttons with text labels for assistive tech (`Previous site`, `Next site`), 48px, rendered at the stage's sides on wide viewports and below the stage on narrow ones. Always rendered, never hover-revealed. Disabled at the ends — no wrap, because a loop hides the size of the set.
- **Keys:** ArrowLeft / ArrowRight page. Escape closes. Tab order: Close, previous, stage link, next, then the pick block.
- **Order:** the whole gallery flattened in group order, so a client can flip through everything in one sitting. The eyebrow names the group so they always know where they are; when paging crosses a group boundary the eyebrow changes and nothing else announces it.
- **Announce:** `aria-live="polite"`: `[COPY — draft]` *"Jacob McKee, 4 of 24, Light and editorial."*
- **Motion:** none between items. The stage content swaps; the capture under the incoming frame is there from the first frame. A slide transition between two live websites is the kind of motion that reads as lag.
- **Touch:** horizontal swipe on the stage pages, when the stage is showing a capture strip the swipe scrolls the strip and the arrows page — two gestures, two jobs. On a live frame the frame owns its own scroll and the arrows are the only paging control.

---

## 8. Three words, and never

Unchanged from v2, verbatim, in the same three-box shape with per-box accessible names. Placed **after** the picks rather than before: having just looked at twenty sites and chosen five, "three words" is an easier question than it was cold, and the words prime §9's search box. Keys unchanged (`wordOne`–`wordThree`, `neverFeelLike`) — the come-across prediction reads them and must keep reading them.

---

## 9. Find more like it — the AI search

A section with a mono label `FIND MORE LIKE IT`, an intro, one `TextArea`, one button, and a result list. Same grammar as **Predict with AI** on step 6 (`come-across.tsx`): the button says what it is, nothing it returns is an answer until the client takes it, the states are calm and none is styled as the client's mistake.

```
FIND MORE LIKE IT
Describe the site you're picturing and we'll go looking for real
ones that feel like it. Anything helps — a mood, a site you can't
remember the name of, "like the second one above but lighter".

┌─────────────────────────────────────────────────────────────┐
│ Dark but warm, big type, one project at a time, nothing     │
│ moves until you hover…                                      │
└─────────────────────────────────────────────────────────────┘

[ Search with AI ]   Reads your picks and the three words too.
```

**States:**

| State | Presentation |
|---|---|
| Default | Button enabled. Pressed with an empty box: one dim line, `[COPY — draft]` *"Say a little first — even three words."* Not an error |
| Running | Label swaps to `[COPY — draft]` *"Looking…"*, button disabled, box read-only (legible, not greyed). No spinner. `aria-live` announces start and finish. Nothing else on the step is blocked — they can keep scrolling |
| Results | Three to six link cards reveal below with the eased reveal, one line above them: `[COPY — draft]` *"Found these. We haven't checked them — some may be dead or nothing like you meant. Open the ones that sound right."* |
| Nothing found | `[COPY — draft]` *"Nothing convincing came back. Try different words, or put what you're picturing in the brain dump below — that reaches a person."* Not an error |
| Failure | Gold line, box untouched: `[COPY — draft]` *"That didn't work — your description is still here. Try again in a moment."* |
| Rate-limited / budget spent | `[COPY — draft]` *"That's the lot for now. Anything you'd have searched for is welcome in the brain dump."* The button stays enabled; a second press repeats the line |
| Preview | Button disabled, `Not available in preview.` — the come-across grammar |

**A result card:**

```
┌─────────────────────────────────────────────────────────────┐
│ juliarossetti.com ↗                                          │
│ Colorist · dark grid, hover previews, dense                  │
│ Add to my sites                                              │
└─────────────────────────────────────────────────────────────┘
```

Host as the external link (new tab), one line of why in body type, and **Add to my sites** as the gold mono text link. Pressing it creates an entry in §11.1 prefilled with the URL, scrolls there, and opens its pick block — which is how "reference these in the next part" becomes one press rather than an instruction. A result already added reads `Added` in dim and is no longer a link.

**Searching again** replaces the result list; anything added has already left it for §11.1, so nothing the client kept is lost.

**What the search reads** (proposed, Mason's to bound): the description, the three words, `neverFeelLike`, and the picks' scores and notes — the same allow-list discipline the come-across service uses, and the same per-engagement run budget every AI touchpoint on this track shares. What it searches (the open web, our own catalogue across every pack, or both) is an architecture decision; the UX above is honest for any of them because it promises nothing about the results except that they are real links. `[Mason]`

The description autosaves as `styleBrief` like any field, so it reaches the document whether or not the search ever ran.

---

## 10. Sites you've found, images, the brain dump

Under one mono label `EVERYTHING ELSE`, three inputs in this order — references first because the search above feeds them, images second, the brain dump last because it is the catch-all and the step should end on the widest door.

### 10.1 Sites you've found (`references`)

A `RepeatableBlock`, gold mono indices, add label `[COPY — draft]` *"Add another site"*. Each entry:

```
01                                                       Remove
Link
┌─────────────────────────────────────────────────────────────┐
│ https://                                                    │
└─────────────────────────────────────────────────────────────┘
[ the pick block, §6, composing — scale + note + Save/Cancel ]
```

- The URL field is a `TextField`, `inputmode="url"`, no validation beyond shape at save (a pasted "juliarossetti.com" without a scheme is normalised, never refused).
- The pick block is **the same component** as the gallery's, with the same question, same scale, same note help. The one difference: it opens **composing** by default, because there is no Select to press — adding the row *is* selecting. Save collapses it to the picked summary (§6.2) with Edit; Cancel on an entry with no URL removes the entry.
- No capture, no tags, no See more: we have not looked at these sites. The document prints the URL, the score, and the note.
- The old `linksWorthALook` text is read into the document unchanged for engagements that answered it; new engagements never see that field.

### 10.2 Images you've saved

The existing `inspiration` `FileDrop`, unchanged field and path, v2 label and help verbatim ("Anything else that's caught your eye" / "Screenshots you've saved, posters, album covers…"). Multiple, images, the §6.4 upload grammar.

### 10.3 The brain dump

The last input. `TextArea` with an eight-row minimum like the extraction blob — it should look like it wants a lot. Label stays v2's **"The brain dump"**. Help is rewritten to Taylor's intent, and it absorbs the retired close-a-tab question in its last clause: `[COPY — draft]` *"Tell us as much as you can about what you're picturing — the home page, and then everything past it: how a project page should feel, what the about page should do, what happens when someone lands on a phone. If you've said it above, say it again here in your own words; if something makes you close a tab instantly, this is where that goes. Half-formed is fine."*

---

## 11. Motion — the add-on notice

The last thing on the step before the footer. Two states, decided by the settled basket (`Reveal`'s `extra` condition), never by an answer.

### 11.1 Not bought

The upsell callout grammar from the durable track (card, mono eyebrow, body), which is what every add-on block on both tracks looks like, so a client meets the same kind of thing:

```
┌─────────────────────────────────────────────────────────────┐
│ MOTION · AN ADD-ON                                           │
│ Animation — things that move, settle, respond when you       │
│ scroll or hover — is built rather than bolted on, and it's   │
│ priced on its own: $N. The site works and looks finished     │
│ without it. If any of the sites you picked above won you     │
│ over with how they move, this is the part that buys that.    │
│                                                              │
│ [ Add motion · $N ]     Pay on Stripe, same as before.       │
└─────────────────────────────────────────────────────────────┘
```

- Eyebrow in `--color-c2`, body in `--color-body`, the price from the catalogue (never a literal). The button is a `GhostButton` — not gradient; Continue stays the only gradient CTA on screen — and the line beside it is the trust grammar in one clause.
- **No urgency, no "most clients add this", no strike-through, no timer** (D-INT-1's law applies to every payment surface, not only the first). The notice states a fact and a price and stops.
- Press → the button reads `[COPY — draft]` *"Opening secure checkout…"* and disables (the pay-button grammar) → hosted Stripe Checkout for **this one item** → success returns to **this step** with the basket settled, which flips the block to §11.2 with the eased reveal and scrolls it into view; cancel returns to this step with the notice unchanged and one quiet line beneath it: *"No charge was made. Whenever you're ready."* (P0's returned-canceled grammar, verbatim).
- Failure to open Checkout: the pay button's existing line, verbatim: *"That didn't open — try once more, and tell Taylor if it keeps happening. Nothing has been charged."*
- Preview / document mode: the notice renders with the button disabled and `Not available in preview.`; the document prints both states under the `Reveal` line, as every add-on block already does (ADM-4).

### 11.2 Bought

The same card, re-headed as confirmation, followed by the three existing animation questions unchanged:

```
┌─────────────────────────────────────────────────────────────┐
│ MOTION · ADDED                                               │
│ You've added motion to the build, so the three questions     │
│ below are yours to answer. What you say must never move is   │
│ as useful as anything you want moving.                       │
└─────────────────────────────────────────────────────────────┘
Motion you've seen and liked …
How much should it announce itself? …
What must never move? …
```

- Confirmation is carried by the gold eyebrow and the hairline, the same treatment as every confirmed state on this surface. **No green** — the palette has no traffic-light semantics and validation on this surface is gold, never red or green.
- The existing block body's clause *"The questions above about stillness set the temperature"* is retired with the stillness question; the draft above replaces it (§13).
- Whether the add-on was bought on the pay screen or here, the state is identical. The basket is the only source of truth.

---

## 12. Responsive, accessibility, reduced motion

- **375px viewport:** accordion header counts wrap under the title; row buttons split the width; the overlay shows the capture strip, arrows below the stage, and the pick block scrolls beneath. The footer counter and the save indicator share one row at 10px mono — measured, both fit at 375px with `Saved` on the left; the offline string (`Saved on this phone — will sync`) does not, so at < 400px the counter yields to the save indicator, which is the more important fact.
- **200% text scale:** the scale's seven stops stay 44px and wrap to a second row if they must; the tags wrap; nothing truncates a label. Test on this step specifically (scope §9 already names it as one of the two long steps).
- **Keyboard:** accordions are buttons; rows tab in reading order (link, Select, See more); the scale is one slider stop in the tab order with arrow keys inside it; the overlay traps focus and returns it; Escape closes the overlay and never cancels a composing pick (a stray Escape mid-note must not lose the note).
- **Screen readers:** capture alt from the content file (`"Matias Boucard — opening view: full-bleed reel over a dark grid"`); the frame carries `title="Live view of {host}"`; the scale announces its value text; picks announce on save (`"Picked Matias Boucard, 5 of 7"`); paging announces per §7.4; the count in the footer is `aria-live="polite"` but only announces at 5 (announcing every increment is noise).
- **Reduced motion:** accordion reveal instant; overlay open/close instant; capture-under-frame swap instant (no crossfade); scale fill has no transition; the six-second undo still counts down (it is not motion).
- **Contrast:** tags at 9px mono dim on card are the design system's card-tag grammar and pass at the D-CON-1 floor; the gold numeral in the picked state and the counter is 10:1 on ground.

---

## 13. Copy — every new string, for Taylor's pass

All `[COPY — draft]`. Register: v2's — plain, specific, peer, no exclamation marks, sentence case.

| Where | String |
|---|---|
| Group title / line | Dark and cinematic — The footage is the light. Reel up top, a grid underneath, motion on hover. |
| | Light and editorial — White space, good type, the work hung like prints. |
| | Type does the work — Almost no images up front. An index, a list, names that carry weight. |
| | Warm and textured — Grain, paper, colour, a bit of personality. Breaks the black-or-white habit. |
| | Stills and credits — Frames and credit lists carry it. Built for people with more credits than cut footage. |
| | Statement pieces — Custom-built, motion-heavy, the site is part of the work. |
| Accordion counts | `6 sites` · `2 picked` |
| Row buttons | Select · See more |
| Scale label | How close is this to what you want? |
| Scale ends | 1 — One detail · 7 — Build me this |
| Note label | What do you like about it? |
| Note help | Click around — the project pages and the about page count as much as the home page. A word or a paragraph, either is fine. |
| Note placeholder | The hover previews, the way the grid breathes, the project pages more than the home page… |
| Composer buttons | Save · Cancel |
| Picked state | PICKED · 5 / 7 · Edit · Remove · Removed. Undo |
| Empty-note line | No note yet — the why is the useful part. · Add a note |
| Picks intro | Five is the number we're after. More is welcome; fewer and the first look is more of a guess. |
| Footer counter | PICKED · 3 OF 5 |
| Done-screen skipped line | Example sites: 3 picked (we asked for 5) |
| Overlay | Close · Previous site · Next site · Open the site · `{group} · 3 OF 24` |
| Overlay announce | Jacob McKee, 4 of 24, Light and editorial. |
| Search label | FIND MORE LIKE IT |
| Search intro | Describe the site you're picturing and we'll go looking for real ones that feel like it. Anything helps — a mood, a site you can't remember the name of, "like the second one above but lighter". |
| Search placeholder | Dark but warm, big type, one project at a time, nothing moves until you hover… |
| Search button / aside | Search with AI · Reads your picks and the three words too. |
| Search running | Looking… |
| Search empty press | Say a little first — even three words. |
| Search results line | Found these. We haven't checked them — some may be dead or nothing like you meant. Open the ones that sound right. |
| Search none | Nothing convincing came back. Try different words, or put what you're picturing in the brain dump below — that reaches a person. |
| Search failed | That didn't work — your description is still here. Try again in a moment. |
| Search budget | That's the lot for now. Anything you'd have searched for is welcome in the brain dump. |
| Result card | Add to my sites · Added |
| Section label | EVERYTHING ELSE |
| References label / add | Sites you've found · Add another site · Link |
| Brain dump help | Tell us as much as you can about what you're picturing — the home page, and then everything past it: how a project page should feel, what the about page should do, what happens when someone lands on a phone. If you've said it above, say it again here in your own words; if something makes you close a tab instantly, this is where that goes. Half-formed is fine. |
| Motion, unbought | MOTION · AN ADD-ON — Animation — things that move, settle, respond when you scroll or hover — is built rather than bolted on, and it's priced on its own: $N. The site works and looks finished without it. If any of the sites you picked above won you over with how they move, this is the part that buys that. · Add motion · $N · Pay on Stripe, same as before. |
| Motion, bought | MOTION · ADDED — You've added motion to the build, so the three questions below are yours to answer. What you say must never move is as useful as anything you want moving. |
| Motion, canceled | No charge was made. Whenever you're ready. *(P0, verbatim — not new)* |

Unchanged v2 strings: the step intro, the three-words label and help, the never-feel-like label, the inspiration label and help, the brain-dump label, all three animation questions. Retired v2 strings: ground tone, stillness, density, links-worth-a-look, close-a-tab, and the favourites instruction line.

---

## 14. Decision log — amendments and proposals

For ratification; cite by ID once ruled.

- **D-PORT-4 — reversed in part** `[RULED — Taylor, 2026-09-03]`. "The favourites flow replaces rating sliders permanently … no minimum, no cap" is amended. What is being reversed and why it is not the thing D-PORT-4 refused: the rejected slider was a score *instead of* a why, applied to every card in isolation. The seven-stop scale is a weight *on* a why, exists only inside a pick the client chose to make, has no default, and is asked as closeness rather than rating. The drag-rank retires because the scale is the rank. Toggle-plus-note, words-not-icons, keyboard floor, and section-absent-until-first-pick all carry. New evidence: Taylor's brief, 2026-09-03. Recorded here so the next session does not re-fight it.
- **D-INT-4 — held** `[RULED — Taylor, 2026-09-03: "soft minimum is fine"]`. Continue is never disabled. The five is an ask with an honest count and a line on the done screen (§6.4). If Taylor rules a hard gate, the change is one condition in `StepShell` and the counter's copy; the cost is the one thing the whole track was designed to avoid, and it should be his call with that cost in front of him.
- **D-PORT-15** `[PROVISIONAL — approved with the design 2026-09-03; build against]` — Gallery groups are the six style archetypes in §4.1, shared across packs; rows carry three axis tags and up to three style tags from closed vocabularies; occupation is a per-row line; achievability is stored and never shown to a client.
- **D-PORT-16** `[RULED — Taylor, 2026-09-03]` — The minimum of five is stated once in the picks section, counted in the footer's next-step slot on this step only, never coloured toward alarm, and never gates Continue. Own-site references do not count toward it.
- **D-PORT-17** `[PROVISIONAL — approved with the design 2026-09-03; build against]` — Rows show captures only. The overlay shows a live frame only where the content file says `embed: true` and the viewport is at least 1024px, one frame at a time, sandboxed, with the capture beneath it until it loads; everywhere else the capture strip. Every overlay carries the open-the-site link.
- **D-PORT-18** `[PROVISIONAL — approved with the design 2026-09-03; build against]` — The AI search follows the come-across grammar: says what it is, returns links that are not answers until added, calm states, shared run budget. Adding a result creates a reference entry; nothing else is written by the search.
- **D-PORT-19** `[PROVISIONAL — approved with the design 2026-09-03; build against]` — The motion add-on is offered on the taste step as a single-item hosted Checkout re-entry, client-initiated, returning to the step; the notice is the durable track's callout grammar with no urgency device; the bought state is the same card re-headed plus the existing three questions.
- **D-PORT-20** `[PROVISIONAL — approved with the design 2026-09-03; build against]` — Ground tone, stillness, density, links-worth-a-look, and close-a-tab are retired from the step; their signal is carried by tagged picks, the motion block, structured references, and the brain dump respectively. Stored answers under the old keys remain in the document.

---

## 15. Assumptions and open items

**Assumptions (labelled, reversible):**

- `[ASSUMPTION]` Captures are re-shot at 1512 × 982 for the curated sets; none exist yet, so this costs nothing today.
- `[ASSUMPTION]` The film set is curated first (the research is film), and the generic set follows with the same group vocabulary. Other packs' sets may leave groups empty.
- `[ASSUMPTION]` The AI search's budget rides the existing per-engagement AI counter.
- `[ASSUMPTION]` The animations product row is sellable mid-intake at its catalogue price with no promo interaction. If a promo granted it free, the block is in the bought state already.

**Open — need Taylor:**

1. ~~D-PORT-4 reversal and D-INT-4 hold (§14)~~ — ruled 2026-09-03.
2. The six group titles and their one-liners are the strings the client meets first; they need his pass before any other string.
3. Whether `build` (template / designer / custom) is printed in the document per pick. I recommend yes; it is the research's most useful finding for pricing a build off a favourite.

**Open — routed to Mason (§16):** everything below.

---

## 16. Handoff notes for Mason

Placement and rails are his; these are the shapes the UX needs, stated once so the tickets do not rediscover them.

- **Content contract.** `ExampleSite` gains `group`, `role`, `axes`, `styles`, `build`, `embed`, `checkedOn`; `captures[0]` becomes 1512:982 at 2×. Group and style vocabularies are closed types beside the set files. Keys remain stable and outlive files (PORT-7 law).
- **Answer shape (proposed).** `taste.picks: [{ siteKey, score?: 1–7, note? }]` replaces `favourites` + `notes` — order is gallery order, no rank. `taste.references: [{ key, url, score?, note?, source?: "search" }]` replaces `linksWorthALook`. `taste.styleBrief: string`. Whether the last search's result set is stored for the document (so Taylor sees what was shown) is his call; nothing in the UX depends on it. Existing `favourites` read as unscored picks; existing `notes` on unpicked sites print in the document and are never migrated into a pick the client did not make. M-PORT-17's array-answer updater applies to both new arrays.
- **Consumers of `favourites` to move:** `showcase-answer-labels.ts` (label), `output.ts` (the thin-taste flag becomes picks-plus-brain-dump), the come-across allow-list (unchanged keys, but `picks[].note` is worth adding to the sources), and the admin document renderer.
- **Overlay.** A sibling of `MediaLightbox` in reasoning (portal, capture-phase Escape, saved `body.overflow`, fitted explicit pixel size); not a reuse — that component's contract is case-study figures. One frame in the DOM at a time; `sandbox` and `referrerpolicy` as §7.2.
- **Footer slot.** `StepShell` is a server component; the counter is client state. A `footerNote` slot beside `saveSlot`, filled by the taste step, keeps the shell server-rendered.
- **AI search.** A server action taking only the token (the come-across law: material is read server-side, never posted up), a service beside `come-across.ts` with its own allow-list, the shared `claimRun` budget, and a result type of `{ url, host, why }[]`. Whether it reaches the web or only our catalogue is an architecture decision with a cost line attached; the UX is honest for either.
- **Single-item checkout.** A client-initiated Checkout for `showcase_animations` re-entering at the taste step. It is not a post-intake charge (the client presses a priced button on hosted Checkout, the same act as the pay screen), but it settles through the ancillary path and **must never touch `paid_at`** (RUNBOOK §4). Return URLs carry the step, not a flag the browser could forge; the bought state is read from the settled basket on render, never from the query string.
- **Document mode.** Every new primitive renders itself as prose with `DocTag` / `DocHint` and no question words held anywhere but the component that owns them (D-ADM-6): groups open, rows listed with tags, the pick block described once, the overlay absent, both motion states printed.

---

## 17. Convergence tests run

- **Worst moment:** phone, one hand, evening, twelve sites in, wants to stop. Every pick is two taps and an optional sentence; the count tells them where they are; Continue works; nothing typed is lost by leaving.
- **Register:** every string is a draft in v2's voice; none re-explains their own field to them.
- **Trust:** the search says what it reads; the frame is sandboxed; the add-on states a price and stops; no charge happens without a hosted Checkout the client opened.
- **Alarm:** no red, no green, no countdown, no motion between overlay pages, the counter never colours.
- **Contrast:** every new text colour is an existing token at an existing size.
- **State:** default · hover · active · focus-visible · disabled (search running, checkout opening, preview) · error (gold) · loading · empty · reduced-motion — present for the row, the pick, the overlay, the search, the notice.
- **Drift:** an accordion of tagged rows with a seven-stop scale is not a dashboard template; the mono grammar, the gold ration, and the 3px radius keep it in the house.
- **Buildability:** §16 names every shape; the open items are Taylor's, not a developer's.
