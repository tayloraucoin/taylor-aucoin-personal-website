---
target: specs/web/ux/public/decisions-13.md
status: approved
promoted:
---

# Public site: decision log, part 13

The UX handoff pass, part 2: Work with me, `/book` and `/contact`, `/capabilities`, `/websites` and the coded intake. D-SITE-180 to 199 are in `decisions-12.md`. All dated 2026-10-16.

| ID | Decision | Source |
| --- | --- | --- |
| D-SITE-200 | Each Work with me role row carries an includes line under its best-for line (Small 15, muted, items joined with " · "), from `content/services.ts` where the role exists there; Product designer and Systems consultant are Taylor's to write. | diff (canvas element the intent never named) |
| D-SITE-201 | Not-a-fit prefills the note with the "What are you building?" answer only, carries the chip answers with it unseen, and keeps Name and Email. Name is optional on both forms; the fit and not-a-fit greetings use its first word, or drop ", {first name}" when it is blank. | diff; Taylor |
| D-SITE-202 | A note sent from not-a-fit stays on `/book` (key `contact-sent-from-not-a-fit`) with the header call button hidden; `/contact`'s sent state keeps both the header call button and "Prefer a call?"; contact's line beside the button is "Or email …" in every state (the submit crop's reply line is a drawing slip). | Taylor |
| D-SITE-203 | Branding and the conventions install ship with a price slot shown like the coded row; Taylor names both figures before launch (launch-blocking, not build-blocking). Branding's proof is whatever `/work`'s Branding & UI tab shows, adding none; the conventions install's only link is "Send a note" and its PEM page is a later ticket. | Taylor |
| D-SITE-204 | The four-proof variant gets its own state key, `card-open-four-proofs`, matching its captures, so every drawn row is reachable by `?state=` (C-P08). | diff (state table vs captures) |
| D-SITE-205 | An open card closes when its chip leaves the list (a filter or tab change removes it), and focus stays where it was. | diff (motion board, "Also") |
| D-SITE-206 | The open card's toggle is the chip's own button, placed by layout (top right at 1440, above the title at 390), so opening never moves focus. | diff (card-open captures); Threshold |
| D-SITE-207 | The coded page's FAQ opens with its first question ("Who owns the site?") expanded and the rest closed, on today's disclosure component (`components/ui/Faq.tsx`) | diff: drawn open on all four captures, never named in the intent |
| D-SITE-208 | The coded page's hero is h1, sub, "Start your site →" and the note only: the eyebrow, stats strip, hero "Book a call first", case link and the appended "Rather talk it through first?" with the phone go; the call link, phone and email stay in the close | diff: canvas changes today's `WebsitesHero` use; Paper wins on look |
| D-SITE-209 | Components the coded page shares with `/websites/platform` (`WebsitesHero`, `Pricing`, `Process`, `Changes`, `WebsitesClose`) are forked or extended so the platform page's output does not change | D-SITE-112 applied to shared code |
| D-SITE-210 | The coded page's "Book a call first" keeps its label and goes to `/book`, the screening, firing `book_call_click` (D-SITE-176) | Taylor, 2026-10-16 handoff rulings |
| D-SITE-211 | Phoenix's example row is hidden by a published flag until the site ships; the page ships in the `one-example` state, and no bracketed placeholder ships | Taylor, 2026-10-16 handoff rulings |
| D-SITE-212 | The care plan renders nothing on the coded page until its scope and price are settled | Taylor, 2026-10-16 handoff rulings (settled by default) |
| D-SITE-213 | Durable stays on `/websites/platform` only; the brief's "Durable sits lower down, only here" is superseded by D-SITE-111 and D-SITE-112 | Taylor, 2026-10-16 handoff rulings |
| D-SITE-214 | `/websites` keeps `noindex` and its custom social card | Taylor, 2026-10-16 handoff rulings |
| D-SITE-215 | `/websites/coded` → `/websites` is a 308 on that exact path, with the query string carried through; the page route constant and the intake prefix in `lib/routes.ts` are split so the intake stays at `/websites/coded/intake` (D-SITE-160). Closes `websites.md`'s [ASSUMPTION] | Taylor, 2026-10-16 handoff rulings (settled by default) |
| D-SITE-216 | Six states the code reaches but the intent pass missed join the States table as N/A: start submitting, start with an intake already open, start server error, welcome after payment, welcome link sent, import reading. Each is a line or label swap on a drawn screen | diff against code |
| D-SITE-217 | The restyle carries access fixes: one `main` on every intake screen, the import result traps focus, resume rows carry `aria-current="step"` and a hidden visited word, and meta-size text links get a 44px hit area at 390 | Threshold; Assay round 3 Consider |
| D-SITE-218 | Intake states are reached through the admin client preview with one seeded synthetic engagement per state; no public `?state=` on intake routes | Taylor |
| D-SITE-219 | The intake keeps today's three-way Light, Dark, System theme group at 48px, restyled; the canvas's single 36px icon button does not ship | Taylor |
| D-SITE-220 | The intake speaks in first person throughout and the Agora eyebrow is replaced by nothing; Taylor rewrites the "we" lines with the copy list. Done stays as drawn, since the Stripe receipt carries the amount (closes D-SITE-159's note to the brief owner) | Taylor |
| D-SITE-221 | The 40-second confirming line joins the copy list as Taylor's to write, because it asserts a payment the webhook has not confirmed | Taylor |
