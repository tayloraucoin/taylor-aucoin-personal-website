---
target: specs/web/ux/public/decisions-12.md
status: approved
promoted:
---

# Public site: decision log, part 12

The UX handoff pass, part 1: home, `/work`, the case study and `/about`, after Taylor's handoff rounds. D-SITE-172 to 179 (cross-site) are in `decisions-11.md`; D-SITE-200 onward in `decisions-13.md`. D-SITE-117 is back-filled here: cited since the Websites lock, it was never logged. All dated 2026-10-16.

| ID | Decision | Source |
| --- | --- | --- |
| D-SITE-117 | Websites (the coded page at `/websites`) locked on Taylor's "lock"; captures in `captures/websites-coded/`. Back-filled in the handoff pass: the line was cited in `overview.md` and `websites-coded.md` but missing from every log | overview.md |
| D-SITE-180 | At 390 the header is two rows (wordmark and theme toggle, then the nav, which gains Contact at build per D-SITE-130) with no call button; on a phone the hero's "Book a 30-minute call" is the only one | diff: `default-390*`, `consent-390*` |
| D-SITE-181 | Partial on home is a story with no artifact: it renders its text and links only, with no empty frame (Calculate by QxMD under Full-time). Replaces home.md's "Partial: N/A" | diff: `selected-work-filtered-*` |
| D-SITE-182 | The story gallery's lightbox is N/A on home's canvas: it is the existing `MediaLightbox`, as on `/websites` (D-SITE-115) | diff; D-SITE-39 |
| D-SITE-183 | Signup access: sending holds the button with `aria-busy`, not disabled (as D-SITE-169); error and invalid lines are tied to the field by `aria-describedby` in a polite live region; on done the form is gone, so focus moves to the confirmation line | Threshold, handoff pass |
| D-SITE-184 | `pillar-open` (pillar 2, D-SITE-53) is drawn as one crop at 390 and 1440, dark and light, in a Design thread before the home build ticket; the state row is [NEEDS DECISION — BLOCKING] until captured | Taylor, handoff round |
| D-SITE-185 | Taylor's facts (the bar's [12] and [23] with programme names, the product designer seat and line, his comfort ratings) may stay bracketed through the build; launch waits on them, and no bracketed value or `[draft]` tag ships to production | Taylor, handoff round |
| D-SITE-186 | The consent banner may cover "See the work" at 390x844; accepted while the hero's primary and both banner buttons stay fully visible. Closes that D-SITE-63 amber | Taylor, handoff round |
| D-SITE-187 | Fragment Mono stays on the open chip's tech line: the line is technical data, which kit §3 allows, not a label. Closes that D-SITE-63 amber | Taylor, handoff round |
| D-SITE-188 | Website and branding rows live in one typed content file (name set at Technical) that `/work`, home's Websites and Branding tabs and `/websites`' examples read; case studies gain a type field (Full-time, Contract, Business, Passion projects), Roomvy and Calculate being Full-time. Rows sit newest first within a group, as drawn | Taylor (handoff rulings); D-SITE-100 |
| D-SITE-189 | Canvas row strings win on `/work` only: a short list-role field per study, title casing and en dash applied at render; case-study pages keep today's strings | Taylor (handoff rulings) |
| D-SITE-190 | `/work`'s tabs and chips are links that write `?tab=` / `?type=`, in named `nav`s, the selected one `aria-current="true"`; focus stays on the control used and no live region announces the list (D-SITE-8). Repeated row links are described by their row title, and tabs, chips and row links get a 44px hit area at 390 | Threshold, handoff pass; D-SITE-101 |
| D-SITE-191 | With one chip selected, the hidden group label (D-SITE-106 A3) stays in the outline as a visually hidden h2 | Threshold, handoff pass |
| D-SITE-192 | `/work`'s entry adds Work with me's branding proof (D-SITE-122) and `/capabilities`' website and kit proofs (D-SITE-141); a record of later threads' links, no new behaviour | diff; D-SITE-122, 141 |
| D-SITE-193 | `format-band` joins the case-study state table: What I built as the screens band, kept for Conscious Connections, captured in the What I built region of the `no-testimonial` captures; every `?state=` key forces its named fixture (C-P08). | diff (D-SITE-91 named the format, no row); Taylor kept the band |
| D-SITE-194 | [PROPOSED] A per-study `facts` content field holds the facts ledger's four cells (fact over a meta line, the last a link); today they exist only on the canvas. | diff: canvas element with no content field |
| D-SITE-195 | `PageDismiss` retires from `/work/[slug]`; "All work" is the way back, and Escape acts only inside the lightbox. | Taylor, 2026-10-16 |
| D-SITE-196 | The base's `no-testimonial` captures (eight files, 390 two-part split) are re-exported from Paper in a Design thread before the case-study build ticket, so they show At a glance (D-SITE-96); an export, no canvas edit. | Taylor, 2026-10-16 |
| D-SITE-197 | `/about` Experience shows the canvas's role lines (e.g. "Founding engineer, at Pine Studio") from an about-only field, with en-dash dates; `content/work/*.ts` `role` stays as `/work` uses it | diff: canvas words differ from content |
| D-SITE-198 | Tools render the canvas's five groups and short labels, mapped from the `core` items in `content/stack.ts`; the `core` flags and the eight inventory groups stay unchanged | diff: D-SITE-72 said "about five groups"; the canvas named them |
| D-SITE-199 | The `pending-testimonial` state and the `SHOW_PENDING_TESTIMONIALS` flag render only the synthetic fixture; a real entry (today Micheal Ozdoba's, `approved: false`) never renders until approved | Taylor, 2026-10-16; D-SITE-12 |
