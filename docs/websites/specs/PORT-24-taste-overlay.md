# PORT-24 — See more: the full-screen gallery overlay, the live frame where it is allowed, and paging

**Epic:** PORT — coded (showcase) intake · **Phase 9** · Size: M
**Slice type:** A modal surface over a long form with a third-party site inside it. Risk class: the intake token leaking to a framed site through the Referer; a frame that captures scroll and traps the client; focus lost on close; a paged-away note lost; the fitted-size image trap; two live sites in the DOM at once.
**Review:** **Vesper — the overlay's anatomy, paging, and reduced-motion (D-PORT-17). Mason — the frame's sandbox and referrer posture; nothing else in this slice is one-way.**

**Status:** Complete (2026-09-04). The three criteria that are invisible in a screenshot were each proven directly: the framed page was pointed at a local route that echoes its request headers and reported `REFERER: (none)` with `sec-fetch-dest: iframe`; a `MutationObserver` recorded a maximum of **one** iframe across eight rapid pages; and focus return was exercised by focusing the opener first, since a scripted click does not move focus. Browser verification found two defects: focus never entered the dialog, and See more disappeared once a site was picked. Both fixed and re-verified.

> **Mason — trust review.** Inspect the network panel for the framed site's document request and state the `Referer` header value (it must be absent) and the frame's `sandbox` attribute verbatim. State that at no point during paging two `iframe` elements existed in the DOM.

---

## Outcome

Pressing See more on a row opens the site full-screen: the group and position as an eyebrow, Close, the site in a MacBook-aspect stage, and beneath it the same name, host link, role, tags, and pick block the row had — so a client can pick without leaving the overlay. On a wide viewport, a site Taylor has marked embeddable shows live inside a sandboxed frame with the capture underneath until it loads; every other case shows the capture set as a snapping strip. Arrows and arrow keys page through the whole gallery in group order; the eyebrow says where they are; the ends do not wrap. Close returns focus to the button that opened it, with that row's group open and the row in view. What this slice does not do: search, checkout, or any change to the pick grammar.

## Why / intent

- **`../CODED-INTAKE-TASTE-UX-SCOPE.md` §7** — shell, the frame law (D-PORT-17, provisional — build against), the pick block inside, paging. §12 — the overlay's accessibility lines.
- **PORT-23** — `PickBlock`, `ExampleRow`'s See more slot, the accordion's open/scroll-to hooks. Consumed.
- **PORT-22** — `embed`, `captures`, `hostOf`.
- **`components/work/MediaLightbox.tsx`** — the reasoning is reused (portal to `body`, capture-phase Escape, `body.overflow` saved and restored to its prior value, an explicit fitted pixel size). **The component is not.** Its contract is server-rendered case-study figures; this is a client gallery with a live frame.
- **What this slice is NOT (binding):** no frame in a row, ever; no frame on a viewport under 1024px; no frame for a site not marked `embed: true`; no preloading of adjacent sites; no slide transition between items.
- **Ground truth:** `MediaLightbox.tsx` (reference) · PORT-23's components · the existing `rel="noreferrer noopener"` link grammar.

**Rulings this slice makes (labelled, logged):**

- **The frame is `sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"` with `referrerpolicy="no-referrer"`.** No forms, no top navigation, no downloads, no modals. `allow-same-origin` lets a cross-origin site keep its own origin (its scripts and cookies work); it grants nothing on ours. `no-referrer` is the line that matters: the intake URL carries the token, and a framed site must never receive it. `M-PORT-36`. Logged.
- **One frame in the DOM at a time.** Paging unmounts the current frame before mounting the next; the capture is visible throughout. Logged.
- **The overlay is a sibling of `MediaLightbox`, not a reuse of it or of `components/ui/Overlay`.** Overlay listens for Escape on `document` in the bubble phase and owns `body.overflow`; the intake pages do not mount it, but the reasoning that made `MediaLightbox` purpose-built applies here in reverse — this surface has its own focus and paging contract and a live frame. Logged.

## Experience & states

The UX scope §7 is the spec. The states the builder must not miss:

**Open:** fade 300ms `--ease-out`, reduced-motion instant · focus moves to Close · `body.overflow` saved · the row's group stays open behind.

**Stage:** the largest 1512:982 box inside `viewport width − 112px` by `viewport height × 0.62`, never narrower than 320px, explicit pixel width and height on the frame and the capture.

- **Wide (≥ 1024px) and `embed: true`:** capture paints first; the frame mounts with `loading="lazy"` removed (it is the thing being looked at) and the capture fades out 400ms after the frame's `load` event. A frame that never fires `load` leaves the capture in place and the client none the wiser; the Open the site link is always present.
- **Wide and `embed: false`, or any narrow viewport:** the capture strip — every capture from the content file, horizontal snap, dots beneath, swipe or arrow keys inside the strip on focus.

**Below the stage:** name, host link, role, tags, `PickBlock mode="row"` without See more. Saving here updates the row beneath and the footer count (hidden while open, correct on close).

**Paging:** Previous / Next buttons (48px, text-labelled, at the stage's sides ≥ 1024px, below it otherwise, always rendered), ArrowLeft/ArrowRight, disabled at the ends, no wrap, across the flattened gallery in group order · the eyebrow updates · `aria-live="polite"` announces `"{name}, {n} of {total}, {group}"` · a composing pick is flushed on blur before the swap, so nothing typed is lost.

**Close:** Escape (captured on `document`, propagation stopped), the Close button, or the scrim · focus returns to the opening row's See more · `body.overflow` restored to its prior value · the current item's row scrolled into view.

**States (exhaustive):** closed · opening · open-capture · open-frame-loading (capture visible) · open-frame-live · paging (frame unmounted, capture visible) · at-start (Previous disabled) · at-end (Next disabled) · composing-inside · closing · reduced-motion (every transition instant).

**Failure / edge states (named):** frame blocked by the site (blank behind the capture) → capture stays, nothing announces, link works · frame load slower than the client's next arrow → unmounted, no orphan · viewport resized across 1024px while open → the stage re-measures and swaps frame ↔ strip without losing the composing pick · the set changes under an open overlay (impossible in practice; content is static) → out of scope · preview / document mode → no overlay; See more is present in interface mode and disabled with the preview line, and absent from the document.

## Non-negotiables (this slice)

- **The token never reaches a framed site.** `referrerpolicy="no-referrer"` on the frame, verified in the network panel.
- **One frame in the DOM at a time. No frame in a row. No frame under 1024px. No frame for `embed: false`.**
- **Focus returns to the opener.** Every time, including after paging.
- **Explicit pixel dimensions on the stage.** The `w-auto` trap applies exactly as in `MediaLightbox`.
- **Escape closes the overlay and never discards a note** — the composing pick flushes first.
- **No motion between items.** A swap, not a slide.

## Data

**Schema changes: none.** **Tables:** none beyond the pick saves PORT-23 already makes.

**Placement:** `app/websites/coded/intake/_components/taste/gallery-overlay.tsx` (the dialog, portal, focus trap, paging) · `taste/site-stage.tsx` (the fitted box, frame-or-strip decision, load handling) · `taste/example-row.tsx` gains See more · `steps/step-taste.tsx` holds the open index. Mason's call, M-PORT-36.

**Validators:** none.

## Accessibility

`role="dialog" aria-modal="true"` labelled by the site name; focus trapped; Escape captured; the frame carries `title="Live view of {host}"`; arrows are buttons with text labels and are never hover-revealed; paging announces politely and singly; the strip's dots are buttons with labels; the stage link text is "Open the site", not the URL; reduced motion honoured on open, close, capture fade, and strip snap.

## Acceptance criteria (observable — 375px and 1280px throughout; network panel open for 1 and 6)

1. On a wide viewport, a site marked `embed: true` shows the capture, then the live frame; the frame's document request carries **no** `Referer` header and the element's `sandbox` attribute is exactly the ruled string. *(Mason.)*
2. A site marked `embed: false` shows the capture strip in the same box; on a 375px viewport every site shows the strip regardless of `embed`.
3. Paging with Next and with ArrowRight moves through the whole set in group order; the eyebrow changes at a group boundary; Previous is disabled at the first site and Next at the last; the live region announces each move once.
4. Picking inside the overlay (score 6, a note, Save) updates the row beneath on close and the footer count reads correctly.
5. Typing a note then pressing Next: the note is saved on the site it belonged to; typing a note then pressing Escape: the overlay closes and the note is saved.
6. During ten rapid Next presses across embeddable sites, the DOM never holds two `iframe` elements (assert with a `MutationObserver` in the console during the run and report the max). *(Mason.)*
7. Close by button, by Escape, and by scrim each return focus to the opening row's See more, with that row's group open and the row in the viewport.
8. Reduced motion: open, close, capture fade, and strip snap are instant.
9. Resizing across 1024px while open swaps frame and strip without losing a composing note.
10. Preview mode: See more is disabled with `Not available in preview.`; document mode prints no overlay.
11. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Measure the stage in a layout effect on open and on resize; initialise from `window` in the state initialiser as `MediaLightbox` does so the first frame is not a layout jump.
- A `MutationObserver` in the closing report is cheaper than arguing about criterion 6.
- The capture-under-frame swap is opacity on the capture, not a conditional render — a conditional render would flash the scrim between the two.
- Swipe on the strip vs. paging: the strip's own scroll snapping handles the swipe; the arrows page. Do not add a gesture library.

## Dev's call

Focus-trap implementation (hand-rolled `Tab` cycling is fine) · scrim colour composition · whether the flattened index lives in the step or the overlay · the strip dots' markup.

## Out of scope

- **Search, the motion notice, checkout** — PORT-25, PORT-26.
- **Detecting whether a site embeds** — impossible at runtime (D-PORT-17); Taylor sets `embed` at curation, PORT-27 helps him check.
- **Any change to `MediaLightbox` or `Overlay`** — untouched.

## Depends on

- **PORT-23** — `PickBlock`, `ExampleRow`, the accordion's scroll-to-and-open hook. Complete in `PROGRESS.md` required.

## Recommended execution

**Opus.** Three of the criteria are invisible in a screenshot: the Referer, the second iframe, and focus return. A cheaper model ships a lightbox that looks right and leaks the token to forty personal websites.

---

### Kickoff (paste into the session)

> Build **PORT-24 — See more overlay** (attached spec). **`no-referrer` on the frame; one frame at a time, never in a row, never under 1024px, never for `embed: false`; focus returns to the opener; Escape never loses a note.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-TASTE-UX-SCOPE.md` §7, §12 · `PORT-23` (consume `PickBlock` and `ExampleRow`) · `components/work/MediaLightbox.tsx` (reasoning reference — do not import) · repo `CLAUDE.md` (the `next/image` trap) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (M-PORT-36).
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
