---
target: specs/web/ux/public/services-build.md
status: approved
promoted:
---

# Work with me — layout and access

Part of `services.md` (states, job, decisions). Plumb proposals named here are in `plumb-proposals.md` (PP-1) and `plumb-proposals-2.md` (PP-2). Tokens and type sizes from the kit (§1, §3).

## Layout and components

**Shell, all three routes.** Content column 1080 at 1440 (x 180–1260); 342 at 390 (24px sides). Header (D-SITE-2, 130): wordmark · Work · About · Work with me · Contact · the small ghost header call button (PP-1) · theme toggle; the current item takes the 2px mark underline. At 390 the two-row header (PP-1): wordmark and toggle, nav under; no call button. On `/book` the call button is gone at every width and no nav item is current (D-SITE-167). Footer (D-SITE-130): hairline, meta domain · address left, About · Résumé · Contact · GitHub · LinkedIn · Privacy right; wraps under at 390.

**`/work-with-me`, top to bottom** (one primary action per view: "Send a note"; the call is the ghost beside it, D-SITE-130):

1. Hero: eyebrow at Label 12 with the mark rule (the 390 eyebrow whose rule aligns with the first line, PP-1); Display H1; availability at Meta, muted; sub at Lede 19, max 56ch; primary "Send a note" + ghost "Book a 30-minute call" (the hero buttons, reused). At 390 both full width, stacked, 44px.
2. Roles: Heading 2 over a hairline; home's role rows with an engagement column (PP-1) extended with an includes line (PP-1, Work with me): name 240 · terms 240 at Meta · best-for in text over the includes line at Small 15, muted, items joined with " · ". At 390: name and terms on one line (terms right-aligned), lines stacked under. The price anchor line under the list (PP-1) at Small 15, text 2.
3. Building, for clients: Heading 4 over a hairline; the building group (PP-1): name 240 · price 240 at Meta, tabular numerals · line · a 160 right-aligned link column (proof link over "Send a note", mark underlines). At 390: name and price on one line, line, links side by side. Visibly smaller than Roles (D-SITE-125).
4. How I work: Heading 2; title 240 · line rows; the "What I'm not" block (PP-1).
5. How to start: Heading 2; the three-step row with its meta reply line (PP-1): three columns at 1440, stacked at 390 with the number in a 16 column.
6. FAQ: open question · answer rows, no accordion (PP-1): question 360 at 17, answer to 640 at Small 15; stacked at 390.
7. Close: the `/about` close block without its résumé link (reused): hairline, Headline, availability at Meta, primary "Send a note" (auto width at 390, as drawn), then "Prefer a call?" muted with the "Book a 30-minute call" link.

**`/book` and `/contact`:** one 640 column at 1440 (full 342 at 390). Display H1, intro at Lede 19 in text 2, a hairline, then the form.

- Screening fields (PP-2): the textarea (Components, 112 tall) with a visible label; three screening fields, each a Small 15 label over a group of single-choice chips (PP-2, D-SITE-168, 170), wrapping at 8px; Name and Email (Components inputs) side by side at 312 with a 16 gap, stacked at 390.
- Submit row: primary at min 176, the reply line at Meta beside it; at 390 the button is full width with the line under it. Sending: the busy primary button (PP-2). Field errors: the intake's error line between label and control, the invalid input with a 2px text-colour border (PP-2, reused). Send error: the error line under the button, its address a separate link (PP-2, D-SITE-170).
- Fit: H1, intro, hairline, primary "Book a 30-minute call" with the "Rather write first?" link pair (PP-2, reused).
- Not a fit: the note form (label, prefilled textarea, Name, Email kept), primary "Send a note", reply line. Website variant: a muted lead-in plus link line between intro and hairline.
- Contact: Message, Name, Email; primary "Send a note" with "Or email" + address as one mark-underlined Meta link beside it (D-SITE-169). Sent: the form and intro go; the sent line at Lede 19 replaces the intro (PP-2) under the hairline, with "Prefer a call?" + link under it at Small 15.
- Behaviour (D-SITE-201; mechanics at Technical): the screening posts, the server applies D-SITE-166 and answers fit, not-a-fit or website; the fit's call hands over to Cal.com with no name or email in a URL GA4 records (D-SITE-176); not-a-fit prefills the textarea with the "What are you building?" answer, carries the chip answers with the note unseen, and keeps Name and Email. Name is optional on both forms; the greeting uses its first word, or drops ", {first name}" when blank. A note sent from not-a-fit stays on `/book` with the header call button hidden (D-SITE-202).

## Access

- **Landmarks and headings:** header with `nav`, `main`, footer. One H1 per view. Work with me: H2 per section (Roles, Building, How I work, How to start, FAQ, the close line); H3 for each role, building row, step and FAQ question. Forms: H1 only; each chip group is a `fieldset`/`legend` or `role="radiogroup"` named by its label.
- **Focus order, Work with me:** wordmark, nav, call button (1440), theme toggle; hero Send a note, Book; building links row by row (proof, then Send a note); close Send a note, Book link; footer. Current page carries `aria-current="page"`.
- **Names:** every control's name is its visible label (A-17 label match). Toggle keeps "Theme" (verified `ThemeToggle.tsx`). The three building "Send a note" links share one destination, so one name is right.
- **Chips:** the selected bar is a state mark, not A-05 (D-SITE-177). Native radios styled as chips; Tab enters the group, arrows move and select; `aria-required` on each group. Selection shows by border, fill and the 3px bar, never colour alone, and is exposed as checked.
- **Invalid:** on Continue or Send, focus moves to the first invalid field; each field gets `aria-invalid` and `aria-describedby` to its error line. No summary box (none drawn).
- **Sending:** the button keeps focus with `aria-busy="true"`, not disabled (D-SITE-169); a polite status region says "Sending…"; repeat presses are ignored.
- **Send error:** the error line is `role="alert"`; answers and focus stay.
- **Outcome and sent:** fit, not-a-fit and sent are new views: focus moves to the H1 (fit, not-a-fit) or the sent line (`tabindex="-1"`), and the document title changes with it.
- **Inputs:** Name `autocomplete="name"`; Email `type="email"`, `autocomplete="email"`. Placeholders are hints under visible labels (A-16).
- **Contrast to check:** the chip's selected bar, mark on surface, A dark (kit: unverified, eye check); unselected chip border, strong on ground (3.97:1 dark, verified); the price cells and reply line, muted on ground (verified). Gold is never text in light: links are text colour with a mark underline.
- **Focus ring:** 2px mark, offset 2px, round the whole chip so it never reads as the selected bar.
- **Reduced motion:** no motion here beyond state transitions, which drop to 0ms.
- **Targets at 390:** buttons 44px; chips 36px; inline links ("Prefer a call?", "Rather write first?", building links) padded to at least 24px tall (WCAG 2.5.8).
