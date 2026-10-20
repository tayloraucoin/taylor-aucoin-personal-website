---
target: specs/web/ux/public/about-build.md
status: approved
promoted:
---

# About — build (layout, access, instrumentation, criteria)

Part of `about.md` (job, states, decisions there). Words in `about-words.md`.

## Layout and components

Column: 1080 content (180 margins) at 1440; 24px gutters at 390. Section heads: Heading 2 over a `--hairline`; one eyebrow only (A-07). Plumb names are from `plumb-proposals.md` ("From `/about`"), unless marked home.

| Section | 1440 | 390 | Components / Plumb proposal |
| --- | --- | --- | --- |
| Header | wordmark · Work · About (current) · Work with me · Contact (D-SITE-130) · call button → `/book` · theme toggle | two rows: wordmark + toggle; Work · About · Work with me · Contact; no call button | header current-page mark (2px `--mark` underline, `aria-current`); home's small ghost header call button and two-row 390 header |
| Intro | eyebrow, Display h1, meta line, story in a 610 column (first paragraph Lede, rest Body `--text2`); headshot 280 right, hairline frame, 3px radius | headshot ~200 first, then eyebrow, h1, meta, story | the 280px headshot beside the story; label with accent rule |
| How I think | lead 240 · body at Small 15 `--text2`, hairline below | stacked lead over body | record row (two-column use) |
| Experience | group heads (Heading 4): Full-time, Contract and fractional, My own products, Programmes; rows name 240 · role 360 · years 120 meta · trailing link right | stacked: name, role, years on its own meta line, link (D-SITE-75) | record row; group head; quiet "Also built" line (meta label in the name column, middot list) |
| Teaching `#teaching` | meta count right of the h2; four-cell ledger (Heading 4 over meta), no top rule (D-SITE-75); mentorship paragraph, 610 column | cells stacked, hairline between | ledger reused per programme |
| Education | record rows without links | stacked as Experience | record row |
| Tools `#tools` | Heading 2 with the résumé text link right; five tools rows | label over items | tools row (group label · items joined by middots) |
| Testimonials `#testimonials` | two subheads; cards on `--surface`, hairline border: who column 240 (name, meta lines, project link) · full text at Body | who block over text | full testimonial card; its pending variant (marker atop the text); testimonial subheads |
| Off the clock | two Body paragraphs, 640 column | same | — |
| Close | hairline above; closing line at Headline; availability meta; button · résumé link · "Not ready to book?" "Send a note" → `/contact` (D-SITE-174), one row | button and résumé on one row, fallback row under | close block |
| Footer | domain left, links right; "Email" becomes "Contact", address beside the domain (D-SITE-130) | domain, then wrapped links | home's footer in sentence case at meta size |

One primary action: the close's "Book a 30-minute call" (`--fill` on `--on-fill`). Links are text-coloured with a 1px `--mark` underline, 3px offset (kit §1 law 3). Retires here: `TestimonialTabs.tsx` (D-SITE-71), `GradientButton`, `SectionLabel`, mono labels, `RootField`. Experience roles come from an about-specific field, not `content/work/*.ts` `role` (D-SITE-197). Dates take an en dash.

## Access

- **Landmarks:** `header` (nav "Main"), `main`, `footer` (nav "Site", D-SITE-237). One h1 "About"; h2 per section; h3 for group heads, testimonial subheads and Teaching's four programme titles. Each testimonial is a `figure`: `blockquote`, then a `figcaption` with the who column.
- **Keyboard path:** header (wordmark, Work, About, Work with me, Contact, call button, toggle) → Experience's six "Read the decision story" links, "Teaching" → Tools' résumé link → three project links (Vaughn's FYBR line is text) → close: button, résumé, "Send a note" → footer.
- **Accessible names:** each of the six "Read the decision story" links adds its row's name, visually hidden. Résumé links name "(PDF)". Theme toggle keeps its name. Headshot alt "Taylor Aucoin" (`SITE.name`); the eyebrow rule and middots are `aria-hidden`.
- **Anchors:** `#tools`, `#testimonials`, `#teaching` sit on the section and get `scroll-margin-top` so the h2 is not under the header; landing, focus moves to the h2 (`tabindex="-1"`) [ASSUMPTION: method left to build, D-SITE-73].
- **Live regions:** none; nothing changes after load.
- **Pending marker:** the text carries it; the clock glyph is `aria-hidden`.
- **Contrast, confirm by computed style:** `--muted` on `--surface` (card meta, both themes); the 1px `--mark` underline on `--ground` (3:1); `--border-strong` on `--surface` (pending marker).
- **Focus:** 2px solid `--focus`, offset 2px, on every link and button.
- **Reduced motion:** only hover transitions; every one is 0ms (D-SITE-178).
- **Touch at 390:** inline links ("Read the decision story", project links, footer links, "Send a note") pad to 44px targets, as `/capabilities` did.

## Instrumentation

Today only GA4 `page_view` fires, consent-gated. Per D-SITE-176: `book_call_click` {surface: "about", placement: "header" | "close"} on each "Book a 30-minute call", consent-gated. These clicks are the funnel; `SITE-M1` counts the `/book` fit screen's click to Cal.com (placement `screening_fit`) with the Cal.com booking, and `screening_outcome` and `contact_note_sent` fire on `/book` and `/contact`, not here. Never in a payload or a URL GA sees: a name, an email, a quote or typed text.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-SITE-about-1 | `/about` loads | sections render in the order of `about.md`, one h1, an h2 per section | test |
| C-SITE-about-2 | `/about` at 1440 and 390, dark and light | matches `captures/about/default-*` | capture |
| C-SITE-about-3 | the header renders on `/about` | About carries `aria-current="page"` and the 2px mark underline at both widths; Contact sits after Work with me | test |
| C-SITE-about-4 | any "Book a 30-minute call" on the page | it links to `/book`, never to Cal.com directly | test |
| C-SITE-about-5 | a request to `/stack` or `/testimonials` | permanent redirect to `/about#tools` or `/about#testimonials` | test |
| C-SITE-about-6 | landing at `#tools` or `#testimonials` | the section's h2 is in view, not under the header, and holds focus | manual |
| C-SITE-about-7 | Testimonials render | four approved cards in full, Dawson, Bruno, Vaughn under People I worked for, Yogesh under Engineers I led; no tabs; `TestimonialTabs.tsx` deleted | test |
| C-SITE-about-8 | `?state=pending-testimonial` | outside production: one synthetic card marked "Pending approval" under Engineers I led, no text from an unapproved entry; in production: no pending card | test |
| C-SITE-about-9 | Tools render | only items flagged core in `content/stack.ts`, in five groups | test |
| C-SITE-about-10 | Experience renders | each row with a case study links to its `/work/[slug]`; "Also built" holds no links; BCIT ISSP's "Teaching" goes to `#teaching` | test |
| C-SITE-about-11 | the three résumé links | each follows the theme (`ResumeLink`) and names "(PDF)"; in dark, Tools and the close add "Print version" | test |
| C-SITE-about-12 | 390 width | no horizontal scroll; every Experience and Education date on its own line; inline link targets ≥44px tall | capture |
| C-SITE-about-13 | `pending-testimonial` at 1440 and 390, dark and light | matches `captures/about/pending-testimonial-*` | capture |
| C-SITE-about-14 | a booking button is clicked with analytics consent | one `book_call_click` with `surface: "about"` and `placement` only; none without consent | test |
| C-SITE-about-15 | the page's text | no "Mentorship" row in How I think; no DJ, music or festival content; the family office unnamed | check |
| C-SITE-about-16 | before the build ticket starts | the carbon-graded headshot is on file (D-SITE-172) | manual |
| C-SITE-about-17 | the close renders | "Not ready to book?" offers "Send a note" linking to `/contact`; no bare email address in the close | test |
