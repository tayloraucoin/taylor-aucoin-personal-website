# ADM-1 — Admin shell: left rail, grouped sections, mobile off-canvas

**Epic:** ADM — admin shell + intake review · **Phase 1** · Size: M
**Slice type:** Presentational restructure of a private tool. Risks: broken navigation, lost keyboard access, a mobile dead end.
**Review:** none required — no data, no auth, no money path.

**Status:** Complete (2026-09-01)

---

## Outcome

Taylor opens `/admin` and lands on the call queue as before, but the six links
that used to wrap across a top bar now sit in a left rail, grouped into the four
stages a job actually moves through: **Leads** → **Intake** → **Engagements** →
**Finances**. The grouping makes the tool's shape legible for the first time:
there is a place a new surface goes, and it is obvious which one. Two items are
named but not yet built — Intake's Questions, which ADM-2 fills in, and
Finances' Revenue — and both read as dimmed labels rather than links to a 404.

On a phone the rail is behind a menu button in a slim top bar, and it closes
itself when you navigate.

Nothing about how the CRM works changes. This slice moves links and rebuilds the
frame around them. It does not touch the queue, the lead drawer, call mode,
sync, any server action, or any page body.

## Why / intent

- **Taylor, 2026-09-01** — "this wasn't necessarily done to convention from a
  layout perspective... take a look at how conscious connections has this done
  and oriented more like that." Then, on the taxonomy: "let's make engagements
  their own category actually. so the flow would go: Leads -> Intake ->
  Engagement -> Finances (future, to show actual revenue)."
- **D-ADM-1 / -2 / -3 / -4 / -7 / -8** — icons via lucide; sections in flow
  order and items alphabetical within; the bounded `/admin` dependency
  exception; Engagements promoted; `ready: false` reinstated; `public/icon.png`
  as the mark. All ratified. See `../ADMIN-UX-SPEC.md` §7-8.
- **What this slice is NOT (binding):** not a visual redesign of any admin page
  body. Page content is untouched. `AdminPageHeader` is introduced but adopting
  it across existing pages is out of scope — it exists for ADM-2 to consume, and
  retrofitting it is a later sweep, if ever.
- **Ground truth:** `adminRoutes` in `lib/routes.ts`; `requireAdmin` and the
  bound `signOutAction` already threaded through `(protected)/layout.tsx`; the
  vendored sheet at `app/admin/_components/ui/sheet.tsx`.

**Rulings this slice makes (labelled, logged):**

- **Sections order by flow; items order alphabetically within a section.**
  Taylor's sequence for the sections, CC's `constants.ts` rule for the items.
  Logged as **D-ADM-2**.
- **Active-path match becomes exact-or-descendant.** Today's bare
  `startsWith(href)` marks `/admin/leads` active for any route sharing that
  prefix. Logged as **M-ADM-3**.
- **The `ready: false` dimmed-label pattern is kept.** An earlier draft of this
  spec deleted it on the grounds that every item existed. Naming Finances before
  building it makes the pattern load-bearing again, and the comment in the
  pre-ADM shell already argued for it correctly. Reversal logged as **D-ADM-7**
  and **M-ADM-5**.

## Experience & states

**Happy path.** Sign in → `/admin` redirects to `/admin/queue` → the rail shows
Leads open with Call queue gold-marked, and Intake open beneath it. Clicking any
item navigates; the rail persists across navigation without remount flicker.

**States (exhaustive):**

- Rail item: default · hover · active · focus-visible. Matrix in
  `../ADMIN-UX-SPEC.md` §5.
- Section: open · closed. A section containing the active route is always open
  on load.
- Rail (`< lg`): closed (default) · open (overlay + scrim).
- Footer: email + Sign out, always present.

**Failure / edge states (named):**

- **Route with no matching nav item** (e.g. `/admin/leads/<id>`) — the parent
  item stays active by the descendant rule. Detail pages must never leave the
  rail with nothing marked.
- **Long signed-in email** — truncates with ellipsis; never wraps the footer or
  pushes Sign out off the rail.
- **Keyboard-only** — every item, every section trigger, the mobile menu button
  and Sign out are reachable by Tab with a visible gold ring. Section triggers
  are `<button>` with `aria-expanded`.
- **Reduced motion** — collapse and slide are instant.
- **JS disabled** — not a supported state for `/admin`; the CRM already requires
  it. No work here.

## Non-negotiables (this slice)

- **One new dependency, and only one.** `lucide-react` via `yarn add --exact`
  (D-ADM-1). Never `npm install` — it writes a `package-lock.json` beside the
  yarn lockfile. Everything else is built from repo tokens; the mobile overlay
  reuses the vendored sheet.
- **Icons stay inside `/admin`.** This ticket does not put an icon on any public
  surface.
- **Never `-[--token]`.** v4 syntax is `-(--token)`.
- **Sign out keeps its bound server action.** The shell is a client leaf and
  cannot own one; it receives `signOut` as a prop exactly as it does today.
- **No route string inline.** Every `href` resolves through `adminRoutes`.
- **`aria-current="page"` on the active item.** Gold is not the only signal.

## Data

**Schema changes:** none.

**Tables:** none.

**Placement:** per `../TECH-SCOPE.md` §3. New files:
`app/admin/_components/admin-nav.ts`, `admin-sidebar.tsx`,
`admin-nav-section.tsx`, `admin-mobile-bar.tsx`, `admin-page-header.tsx`.
Rewritten: `app/admin/_components/admin-shell.tsx`.
Edited: `lib/routes.ts` (adds `adminRoutes.intake`, `adminRoutes.intakeQuestions`).

**Validators:** none.

## Accessibility

- Rail is `<nav aria-label="Admin">`; sections are `<button aria-expanded>` +
  a labelled region.
- Mobile overlay: focus moves in on open, returns to the trigger on close,
  `Escape` closes, the scrim is not the only way out. The vendored sheet
  supplies all of this — do not reimplement it.
- Targets at or above 44px on touch. The rail is a list of text links; give them
  real vertical padding rather than relying on line-height.
- Text scales to 200% without the rail overlapping content.

## Acceptance criteria (observable)

1. `/admin` redirects to `/admin/queue`, unchanged.
2. At `>= 1024px`: a persistent left rail headed by `public/icon.png` + `Admin`,
   with sections in this order — **Leads** (Call queue, Leads, Scoreboard, Sync,
   Transcripts), **Intake** (Questions), **Engagements** (Engagements),
   **Finances** (Revenue) — and a footer carrying the signed-in email and Sign
   out. Items within each section are alphabetical.
3. `Questions` and `Revenue` render as dimmed, non-interactive labels with no
   `href`. Every other item is a working link. ADM-2 flips `Questions` to ready.
4. Visiting `/admin/leads/<any-id>` leaves `Leads` marked active.
5. Clicking a section label collapses and expands it; the section holding the
   active route is open on load.
6. At `< 1024px`: a top bar with a menu button; opening it overlays the rail;
   navigating closes it; `Escape` closes it; focus returns to the button.
6a. Collapsing the rail leaves a legible icon strip; a collapsed section opens
   its items as a flyout rather than in place.
7. Tabbing from the top of the page reaches every rail item, every section
   trigger, and Sign out, each with a visible focus ring.
8. Sign out still signs out.
9. With `prefers-reduced-motion: reduce`, no collapse or slide animates.
10. No page body under `/admin` renders differently than before this ticket.
11. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The current shell is already a client component reading `usePathname`; keep
  that. The rail needs the pathname and the sections need local open state.
- CC's equivalents are worth reading for structure, not for code:
  `packages/ui/src/composed/navigation/admin-shell/admin-sidebar.tsx` and
  `admin-sidebar-nav-section.tsx`. They are built on shadcn's `Sidebar` and
  Radix `Collapsible`; we have neither. A `<details>` element or a `useState`
  height toggle both work — `<details>` gives keyboard behavior free but is
  harder to animate under the reduced-motion rule. Dev's call.
- Layout: the rail is a fixed-width flex column at `lg:` and the content pane
  is the scroller. The existing `max-w-6xl` content column can stay inside the
  pane; the rail sits outside it.
- The `AdminPageHeader` shape to mirror is
  `packages/ui/src/composed/navigation/admin-shell/admin-page-header.tsx`:
  title, optional description, optional actions slot.

## Dev's call

Collapse mechanism (`<details>` vs. state), whether the rail is `position: fixed`
or a flex sibling, and how the mobile bar composes with the sheet. Real
alternatives land in `TECHNICAL-DECISIONS.md`.

## Out of scope

- **Adopting `AdminPageHeader` on existing pages** — later sweep, if ever.
- **Any change to a page body, a server action, or the CRM's behavior.**
- **Persisted collapse state** — pinned in `00-build-order.md`.
- **Icons** — locked out by D-ADM-1 unless Taylor overrules.

## Depends on

**No slice dependencies.**

## Recommended execution

**Opus.** The work is mechanically simple but it is a frame rewrite touching
every admin surface at once, and the failure mode is a subtle one — a keyboard
trap, a lost focus ring, an active state that lies on detail routes. Choosing
down here buys an hour and costs a regression nobody notices until it is old.

---

### Kickoff (paste into the session)

> Build **ADM-1 — Admin shell: left rail, grouped sections, mobile off-canvas**
> (attached spec). **You are moving links and rebuilding the frame. You are not
> touching a single page body.**
> Attach/read first, in order: this spec · `specs/README.md` (kickoff contract +
> non-negotiables) · `../ADMIN-UX-SPEC.md` §2-5 · `../TECH-SCOPE.md` §3-4 ·
> the current `app/admin/_components/admin-shell.tsx` and
> `app/admin/(protected)/layout.tsx` · `app/admin/_components/ui/sheet.tsx` ·
> repo `CLAUDE.md` · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> No new dependency — if you think you need one, stop and ask. No icons. Every
> href from `adminRoutes`. Never write `-[--`. Close in three places. Run
> `yarn build` + `npx tsc --noEmit` + `yarn lint`.
