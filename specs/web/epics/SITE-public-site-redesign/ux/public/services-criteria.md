---
target: specs/web/ux/public/services-criteria.md
status: approved
promoted:
---

# Work with me — instrumentation and criteria

Part of `services.md`. Captures named here are in `captures/services/`.

## Instrumentation

Names and parameters per D-SITE-176 (proposals, defined at Technical with Tally). Today the site sends GA4 page views only, behind consent (verified `components/analytics/`); these events fire only when the tag is loaded.

| Event | Fires when | Parameters |
| --- | --- | --- |
| `book_call_click` | Any "Book a 30-minute call" is activated: header, hero, close, contact sent, and the fit screen's button to Cal.com | `surface` (`services`), `placement` (`header`, `hero`, `close`, `contact_sent`, `screening_fit`) |
| `screening_outcome` | `/book` returns the D-SITE-166 result | `outcome` (`fit`, `not_a_fit`, `website`) |
| `contact_note_sent` | The server confirms a note (not on click) | `surface` (`services`), `from` (`contact`, `not_a_fit`) |

- SITE-M1 counts `book_call_click` with `placement: screening_fit` plus the Cal.com booking; the other clicks are the funnel above it (D-SITE-176).
- **Never in a payload or a URL GA sees:** name, email, the typed message or "What are you building?" text, the budget or start answers. The Cal.com hand-off carries no name or email in a URL GA4's outbound-click event records (D-SITE-176).

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-SITE-services-1 | `/services` is requested | it answers a permanent redirect to `/work-with-me` (D-SITE-164) | test |
| C-SITE-services-2 | `/work-with-me` loads at 1440 and 390, dark and light | sections run in the order of `services.md` and match `default-*` | capture |
| C-SITE-services-3 | the page renders | there are five role rows and three building rows; the $15K–$75K line appears once, under the roles; no row names marketing (D-SITE-125) | test |
| C-SITE-services-4 | any "Send a note" on the page is activated | it opens `/contact` | test |
| C-SITE-services-5 | any "Book a 30-minute call" on the page or in the header is activated | it opens `/book`, and every one carries that exact label (A-17) | test |
| C-SITE-services-6 | the building links are activated | "Websites" opens `/websites`; "Branding & UI" opens `/work?tab=branding` | test |
| C-SITE-services-7 | the FAQ renders | every answer is visible with no toggle | capture |
| C-SITE-services-8 | `/book` renders in any state | the header has no call button (D-SITE-167) | test |
| C-SITE-services-9 | a chip is chosen | it is the only checked chip in its group, its width is unchanged, and it shows the 3px mark bar (D-SITE-170) | test |
| C-SITE-services-10 | a chip group is used by keyboard | Tab enters it and arrow keys move and select | test |
| C-SITE-services-11 | Continue is pressed with a group unanswered or a malformed email | each invalid field shows its error line, has `aria-invalid`, and focus is on the first one | test |
| C-SITE-services-12 | budget $15K–$75K, over $75K or full-time salary, start this month or 1–3 months, role not "A website or brand" | the fit view shows, and its call button opens Cal.com | test |
| C-SITE-services-13 | any other combination | the not-a-fit view shows, the textarea holds the "What are you building?" answer, Name and Email are kept, and no call is offered | test |
| C-SITE-services-14 | role is "A website or brand" | not-a-fit shows with the line to `/websites`, whatever the budget and start | test |
| C-SITE-services-15 | a form is sending | the primary reads "Sending…", has `aria-busy="true"`, is not disabled, keeps at least 176px, and a second press sends nothing | test |
| C-SITE-services-16 | a send fails | the error line shows under the button with every answer kept and the address as its own `mailto:` link | test |
| C-SITE-services-17 | `/contact` is sent with valid fields | the intro and form give way to the sent line naming the email given, with "Prefer a call?" to `/book`, and the header call button still shows (D-SITE-202) | test |
| C-SITE-services-18 | a note is sent from not-a-fit | the URL stays `/book` and the sent line shows with no call offer anywhere on the view, header included (D-SITE-167, 169, D-SITE-202) | test |
| C-SITE-services-19 | a view changes (fit, not-a-fit, sent) | focus moves to its H1 or the sent line and the document title changes | test |
| C-SITE-services-20 | each state key is passed as `?state=` | that state renders and matches its capture at 1440 and 390, dark and light | capture |
| C-SITE-services-21 | the page is checked with axe | no serious or critical violation in any state | check |
| C-SITE-services-22 | any booking, screening or note event fires | its payload, and any URL GA4 records, holds no name, email, typed text, budget or start answer | test |
| C-SITE-services-23 | consent is declined or GPC is set | none of the three events fires | test |
| C-SITE-services-25 | Name is left blank on either form | the form sends, and the greeting reads without ", {first name}" (D-SITE-201) | test |
| C-SITE-services-26 | `/contact` is in any state with the form shown | "Or email hello@tayloraucoin.com" sits beside the button (D-SITE-202) | test |
| C-SITE-services-27 | the production build renders the building group | branding and conventions install show a price, never a bracket (D-SITE-203) | test |
| C-SITE-services-24 | Taylor reads the shipped strings | no `[draft]` or `[Taylor's …]` tag is left, and the canvas's synthetic names do not ship | manual |
