# CRM-13 — The Sheet primitive: the lead record slides, focus behaves, keys go inert

**Epic:** CRM — call-mode redesign (v1.2) · **Phase 5** · Size: S
**Slice type:** Vendored primitive + rewire of an existing surface. Failure class: focus/keyboard regression on the one surface where a stray keystroke can log a call.

**Status:** Complete (2026-08-22)

---

## Outcome

The lead record opens over the queue or the leads list as a true sliding sheet: it slides in from the right, traps focus while open, closes on Esc or the overlay, returns focus to where it came from, and collapses to a fade under `prefers-reduced-motion`. The URL contract is unchanged — `?lead=<id>` opens it, closing strips only that param, deep links and the back button keep working — and "Open full page" survives. While the sheet is open, the queue's j/k navigation and number-key disposition accelerators are inert. No other surface changes in this slice: call mode is CRM-15, post-call actions are CRM-16.

## Why / intent

- **D-CRM-30** — `/admin` may vendor headless primitives: CC's Sheet source (Radix dialog) adopted for the lead drawer, slide + reduced-motion fade; the site-wide component-library ban (`CLAUDE.md`) stands untouched; the drawer keeps "Open full page".
- **DEVIATIONS 2026-08-22 (CRM-6)** — the drawer already exists, keyed on `?lead=<id>`, with the full page at `/admin/leads/[id]` rendering the same `LeadRecord`. This slice replaces the drawer's shell, not its contents or its URL contract.
- **Ground truth:** `app/admin/_components/lead-drawer.tsx` is a hand-rolled fixed overlay — no slide, no focus trap, no scroll lock. `LeadRecord` is a server component passed in as children; that composition survives.
- **CC precedent (read, then vendor):** `packages/ui/src/primitives/layout/sheet/sheet.tsx` in the CC repo (`/Users/taylor/lighthouse/conscious-connections/conscious-connections`) — standard shadcn Sheet over `@radix-ui/react-dialog`, `side` prop, `data-[state]` slide/fade, `hideClose` addition. Usage model: `apps/marketing/app/admin/(protected)/affiliates/leads/_components/lead-sheet.tsx` (URL-driven open state, `sm:max-w-lg`, `p-0` + own header).
- **Spec §5** — `prefers-reduced-motion`: panel transitions collapse. **D-CRM-16** — no urgency/alarm styling binds here as everywhere.

**Rulings this slice makes (labelled, logged):**

- **Vendored source, not a registry.** The Sheet lands as `app/admin/_components/ui/sheet.tsx`, copied and trimmed from CC — no `components.json`, no shadcn CLI. The dependency added is `@radix-ui/react-dialog`, pinned exact. Logged (mechanics of D-CRM-30).
- **Animation utilities are admin-scoped.** Tailwind here is v4; CC's `tailwindcss-animate` plugin idiom is v3-era. Use `tw-animate-css` (pinned) or hand-written `data-[state]` keyframes — builder verifies which is cleaner in this repo `[PROVISIONAL — mechanics; cost of wrong pick: swap one import]`. Either way the animation CSS must not reach the public site's payload. Logged.
- **Open-while-sheet keys go inert.** The queue's `j`/`k` and number-key handlers gain a guard for the sheet being open. Today a bare number keystroke with the drawer open can reach the focus card behind the overlay and log a disposition — exactly the class of double-log the accelerator law exists to prevent. Logged.

## Experience & states

Open (slide from right, ~200ms settle, overlay fade) · open via deep link on fresh load (no animation jank; content present) · close via Esc, overlay click, Close link, back button — all strip only `lead` · closing (slide out) · reduced-motion (fade only, both directions) · focus: trapped inside while open, returned to the trigger row on close, focus-visible on all controls · scroll: page behind locked, sheet scrolls internally · width `max-w-xl` as today.

**Failure / edge states:** unknown `?lead=` id → the sheet renders the existing null/absent behavior, never a crash; sheet open during a pinned call (`working` set) → the focus card keeps its pin; nothing about the sheet releases it.

## Non-negotiables (this slice)

- **The URL contract is law.** `?lead=<id>` opens; close strips only that param; filters and `shown` survive; back button closes.
- **Queue accelerators are inert while the sheet is open.** A keystroke must not reach the disposition row behind the overlay.
- **"Open full page" stays.** Same record, own URL, for a second tab or a paste.
- **No dependency reaches the public site.** Radix and the animate utilities load for `/admin` only; the static site's payload is unchanged.
- **Reduced motion collapses to fade.** Spec §5 verbatim.

## Data & AI

**Schema changes: none.**
**Tables:** none touched.
**Placement:** `app/admin/_components/ui/sheet.tsx` (new, vendored) · `app/admin/_components/lead-drawer.tsx` (rewired to compose Sheet) · `app/admin/_components/call-queue.tsx` (keyboard guard only). Mason placement call: `ui/` subfolder marks vendored primitives apart from house components.
**tRPC / validators:** none.
**AI notes:** **None.**
**Instrumentation:** none — no analytics on `/admin` (D-CRM-16).

## Accessibility

Radix supplies `role=dialog`/`aria-modal`, focus trap, and focus return — verify rather than re-implement. Sheet title announced (`aria-label="Lead record"` or a visually-hidden title). Close targets ≥44px. Focus-visible ring on the overlay-close is not required (it is a backdrop), but the Close and Open-full-page links keep theirs.

## Acceptance criteria (observable)

1. From `/admin/queue`, opening a lead slides the sheet in from the right; closing slides out; `prefers-reduced-motion` gets fade both ways.
2. `?lead=<id>` pasted into a fresh tab opens the sheet over the correct surface; back button closes it; filters and scroll state survive close.
3. With the sheet open, focus is trapped inside; Tab cycles sheet controls only; closing returns focus to the row that opened it.
4. With the sheet open, pressing `j`, `k`, or any digit does nothing to the queue or focus card behind it.
5. Esc closes the sheet. Esc with the sheet closed changes nothing (no stray handler).
6. "Open full page" navigates to `/admin/leads/[id]` and renders the identical record.
7. The public site's build output gains no Radix or animate bytes. **Baseline measured 2026-08-22 on the current tree: shared first-load JS = 102 kB.** Re-run `npm run build` after the change and compare — shared first-load must not grow.
8. `npm run build` · `npx tsc --noEmit` · `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Radix `Dialog.Root` wants controlled `open`; drive it from the presence of the `lead` param and route `onOpenChange(false)` through the existing `closeHref` push — the current `lead-drawer.tsx` already computes it.
- The children are a server-rendered `LeadRecord`; keep the sheet a thin client shell around `{children}` exactly as the current drawer does.
- CC's `hideClose` prop and `SheetPanel` wrapper are more than this repo needs — trim on vendoring; a smaller vendored file is a better pattern to copy.

## Dev's call

Animate mechanism (tw-animate-css vs hand-rolled keyframes) · exact trim of the vendored file · whether the keyboard guard reads sheet state from context or a prop.

## Out of scope

- **Call mode itself** — CRM-15.
- **Any change to `LeadRecord`'s contents** — it renders as-is.
- **Adopting Radix/shadcn anywhere else in `/admin`** — future slices propose per-use; D-CRM-30 licenses vendoring, not a kit.

## Depends on

**No slice dependencies** (CRM-6 Complete in `PROGRESS.md`).

## Recommended execution

**Sonnet 5.** Precedented mechanical work against a vendored reference; the risky part (keyboard inertness, URL contract) is pinned by criteria 2–5. Failure mode of choosing down to Haiku 4.5: a focus trap that "mostly works" — focus escaping to the disposition row behind the overlay is invisible in a screenshot and logs a phantom call in real use.

---

### Kickoff (paste into the session)

> Build **CRM-13 — Sheet primitive & sliding lead record** (attached spec). Model: **Sonnet 5**.
> **The URL contract is law; queue keys go inert while the sheet is open; nothing new reaches the public site's payload.**
> Attach/read first, in order: this spec · `docs/crm/CRM-UX-SPEC.md` §3.8 + §5 + D-CRM-30 · `app/admin/_components/lead-drawer.tsx` · `app/admin/_components/call-queue.tsx` · CC's `sheet.tsx` + `lead-sheet.tsx` (paths in Why) · `docs/crm/specs/DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` last — reality overrides stale strings.
> Vendor, don't install a kit; pin the Radix dep exact. Close in three places (Status line · PROGRESS.md · DEVIATIONS.md per divergence). Run `npm run build` · `npx tsc --noEmit` · `npm run lint`. Do not start the next ticket.
