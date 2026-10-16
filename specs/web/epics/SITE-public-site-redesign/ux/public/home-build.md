---
target: specs/web/ux/public/home-build.md
status: approved
promoted:
---

# Home — build

Part of `home.md`; words in `home-words.md`; proposals as logged in `plumb-proposals.md`.

## Layout and components

Column 1200 at 1440, full width less 24 at 390. Tokens kit §1 A; type kit §3, at most four sizes per component (D-SITE-173); sections 64 apart, 96 at 1440 (kit §6).

| Section | 1440 | 390 | Components and proposals |
| --- | --- | --- | --- |
| Header | Wordmark; Work · About · Work with me · Contact (D-SITE-130) · call button · toggle | Two rows, no call button | Proposals: the small ghost header call button; the two-row 390 header |
| Hero | Label with accent rule, Display, Headline, Lede, two buttons; headshot 176 right | Headshot first; buttons full width | `Button` primary (the one primary action) and ghost; headshot per D-SITE-172 |
| Proof bar | Four cells, hairlines between | Stacked | Proposal: the proof-strip ledger (Heading 4 fact over a meta line; never A-09) |
| Pillars | Ringed panel, four rows, title beside line, + right | Title over line | Proposal: the pillar ring list; the moving ring (kit §5) |
| Problems I take on | Heading, line right; 8 chips; toggle, link | Line under heading | Proposals: the capability chip (closed, open card 24 from chips, D-SITE-149; proof names D-SITE-145; motion D-SITE-147, 178; Fragment Mono tech line kept, D-SITE-187; no meter, D-SITE-65), the "Show all" toggle |
| Selected work | Tabs and type chips on one row; text 440 · gallery 720 | Chips wrap; gallery under text | Proposals: discipline tabs; type filter chip; story beat; story gallery (lead, 160x104 thumbs, "All n images"); `MediaLightbox` |
| How I work | Five steps in a row; three AI lists in columns | Stacked, fixed number column | Proposals: the how-I-work path; the three-list AI block |
| Testimonials | Cards two by two | One column | Proposal: testimonial card without an initials tile |
| Work with me | Role · terms · best-for rows; link; websites line | Stacked | Proposal: role rows with an engagement column |
| Notes | Text left; field, button, hint right | Stacked | Proposal: the signup block with the message row; `Input` |
| Footer | Domain left; links right, sentence case at meta | Wraps | Proposal: footer at meta; "Email" becomes "Contact" (D-SITE-130) |
| Consent | Card bottom left | Full width, bottom | `ConsentBanner` (existing); Privacy as a link (D-SITE-62) |

## Access

- **Landmarks:** `header` (labelled nav), `main`, `footer`; consent is a non-modal dialog (existing). `h1` the name; sections `h2`; stories and pillars `h3`.
- **Order:** skip link, header, hero buttons, pillars, chips, toggle, link, tabs, type chips, each story (story link, live link, thumbs, "All n images"), "See all work", Work with me, signup, footer. Consent comes first while shown.
- **Controls:** pillar rows and chips are buttons with `aria-expanded` and `aria-controls`; "Show all 25"/"Show fewer" is a button with `aria-expanded`. Tabs follow the ARIA tabs pattern; type chips are toggle buttons with `aria-pressed` in a labelled group. Thumbs are buttons named by their image alt; "All n images" names the story.
- **Focus on change:** "See the work" moves focus to the first story's heading. A chip or pillar keeps focus on its button when it opens; Esc closes and returns focus (D-SITE-147). A tab or chip change keeps focus on the control. Signup done: focus moves to the confirmation line (the form is gone).
- **Announced:** the signup message row is a polite live region (sending, done, error, invalid); the error and invalid lines are tied to the field by `aria-describedby`, with `aria-invalid` on invalid. Sending holds the button with `aria-busy`, not disabled (as D-SITE-169). A filter change announces the story count politely (wording to Gloss).
- **Contrast to verify** (kit §2): carbon-300 meta on carbon-800 cards; gold-600 underline and check on light; chip and field strong borders on both grounds; the graded headshot (D-SITE-172).
- **Reduced motion:** every transition is 0ms and the pillar ring stops (D-SITE-178); "See the work" jumps without smooth scroll.
- **390 targets:** every control reaches 44px; paired text links sit 24px apart.

## Instrumentation

Per D-SITE-176, fired only after consent (`Analytics.tsx` gate): `book_call_click` {surface: `home`, placement: `header` | `hero`} on every "Book a 30-minute call". It is the funnel above SITE-M1, which counts the `/book` fit click to Cal.com with the booking. Home fires nothing else; the signup's events wait on gap 5 (Technical). Never in a payload or a URL GA sees: name, email, any typed text, a filter query, the family office's name. Page views follow D-SITE-179.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-SITE-home-1 | `/` loads | Sections in D-SITE-50's order, matching `default-*` | capture |
| C-SITE-home-2 | A first visit with no stored theme | The page renders dark | test |
| C-SITE-home-3 | Any "Book a 30-minute call" is pressed | It goes to `/book`; the label is identical everywhere | test |
| C-SITE-home-4 | The header renders | Work, About, Work with me, Contact, call button (1440), toggle; footer shows Contact, not Email | test |
| C-SITE-home-5 | "See the work" is pressed | The first story is in view and its heading has focus | test |
| C-SITE-home-6 | A pillar or chip is pressed | It opens in place, `aria-expanded` flips, one chip open at most; Esc closes, focus returns | test |
| C-SITE-home-7 | Chips render | 8 in comfort order; no rating is in the DOM | test |
| C-SITE-home-8 | "Show all 25" is pressed | 25 chips show, the toggle reads "Show fewer", the `/capabilities` link stays | test |
| C-SITE-home-9 | A tab is chosen | Its three stories and only its own types show; Websites shows no type filter | test |
| C-SITE-home-10 | A type is chosen, then "See all work" | `/work` opens with `?tab=` and `?type=`; Featured maps to All | test |
| C-SITE-home-11 | A story link is pressed | `/work/[slug]` opens at the top; a kit row shows the link only when its data names a slug (D-SITE-175) | test |
| C-SITE-home-12 | A thumb or "All n images" is pressed | `MediaLightbox` opens on that image; Esc returns focus | test |
| C-SITE-home-13 | Testimonials render | Four, Dawson, Bruno, Vaughn, Yogesh; link to `/about#testimonials` | test |
| C-SITE-home-14 | Work with me renders | Rows and link go to `/work-with-me`; the websites line to `/websites` | test |
| C-SITE-home-15 | Each signup and selected-work state is opened by `?state=` | It matches its capture at 390 and 1440, dark and light | capture |
| C-SITE-home-16 | The signup sends | The address stays, the button holds with `aria-busy`, no layout shift | test |
| C-SITE-home-17 | Send fails or goes offline | `notes-error`: address kept, retry offered, the line announced | test |
| C-SITE-home-18 | An address with no ending is submitted | `notes-invalid`; no request is made | test |
| C-SITE-home-19 | A listed address is submitted | The output is identical to `notes-done` | test |
| C-SITE-home-20 | A call button is pressed | `book_call_click` fires with `surface` and `placement` only, never before consent | test |
| C-SITE-home-21 | The page is scanned | No family office name, Durable, Viewpoint.AI or marketing skill | check |
| C-SITE-home-22 | Reduced motion is set | Every transition is 0ms and the ring stops (D-SITE-178) | test |
| C-SITE-home-23 | 390 wide | No horizontal scroll; every control reaches 44px | check |
| C-SITE-home-24 | Keyboard only, top to bottom | The order above holds and every control shows the 2px focus ring | manual |
| C-SITE-home-25 | `consent` at 390x844 | The hero's primary button and both banner buttons are fully visible (D-SITE-186) | capture |
| C-SITE-home-26 | A production build | No bracketed value or `[draft]` tag renders (D-SITE-185) | check |
| C-SITE-home-27 | `pillar-open` is captured | It matches its crop at 390 and 1440, dark and light | capture |
