---
target: specs/web/ux/public/services.md
status: approved
promoted:
design:
  file: Taylor Aucoin (Paper)
  page: Work with me (process on "Work with me · iterations", D-SITE-110)
  artboards: "services / default / <1440|390> / <dark|light>; screening / <form|fit|not-a-fit> / <1440|390> / <dark|light>; contact / <default|sent> / <1440|390> / <dark|light>; region crops: screening / <submit|not-a-fit-website>, contact / <submit|sent-from-not-a-fit>"
  captures: "captures/services/<state>-<width>[-dark].png"
  locked: 2026-10-16 (D-SITE-171)
---

# Work with me — public

Intent pass 2026-10-16 (D-SITE-120 to 130, 164 onward); handoff pass 2026-10-16 from the locked captures. Decisions are `D-SITE-n` in the decision logs. Three routes: `/work-with-me` (`/services` redirects, D-SITE-164), the screening step `/book` and the contact page `/contact` (D-SITE-165). Parts: `services-build.md` (layout, access), `services-words.md` (every string), `services-criteria.md` (instrumentation, criteria).

## Job

A hirer sees the roles home named, each with how it is engaged and who it suits, and the price band they land in. A build buyer finds the smaller building group below: a coded website at its price, and branding with its proof. Each then sees how it starts and the objections answered, and writes or books. Done for them: they know which role fits and what it costs. Hearth: seats of one job, never a menu (D-SITE-125).

## Entry and exit

- **Entry:** the header's "Work with me" (D-SITE-2); home's Work with me rows and link (D-SITE-57); home's Branding & UI tab link (D-SITE-38); `/services` by redirect (D-SITE-164).
- **Exit:**
  - The contact form leads: the hero's primary, the close's primary, and each building row's "Send a note [draft]" go to `/contact` (D-SITE-127, 130, 165).
  - Booking is offered beside it, one label (A-17): the header button (1440), the hero's secondary and the close's "Prefer a call?" link all go to `/book` (D-SITE-126, 165). A fit (D-SITE-166) goes on to Cal.com (`BOOKING_URL`); anything else to the note, prefilled from the screening.
  - The coded website row's "Websites" goes to `/websites` (D-SITE-111, 122). The conventions install has only "Send a note" until a PEM page exists (D-SITE-128).
  - The branding row's "Branding & UI" goes to `/work?tab=branding` (D-SITE-101, 122).
  - Header "Contact" and footer "Contact" on every page (D-SITE-130).

## Order

Header, hero (eyebrow, H1, availability line, sub, two buttons), the five role rows (D-SITE-57) with the $15K–$75K CAD line under them, the building group (coded website, branding, conventions install; D-SITE-128), How I work with "What I'm not", How to start with the reply line, FAQ, closing block, footer (D-SITE-120, 121, 123).

## States

Captures are in `captures/services/`, each at `-1440` and `-390`, light and `-dark` (four files per row); crops are region-only.

| State                   | Key       | What shows                                                                                                                                                   | Canvas                                 |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| Default                 | `default` | Every section in the order above. Roles: Product engineer, Product designer, Systems consultant, Fractional CTO, 0→1 build. Building: coded website ($2,000 CAD + GST), branding and conventions install (price slot, Taylor names the figure before launch, D-SITE-203) | `default-1440.png`                     |
| Empty                   | —         | N/A: content on file                                                                                                                                         | N/A                                    |
| Loading, offline        | —         | N/A: server-rendered, no client fetch (D-SITE-18)                                                                                                            | N/A                                    |
| Error, partial, success | —         | N/A: a static route with no optional section; booking leaves through `/book` (D-SITE-124)                                                                    | N/A                                    |

`/book` and `/contact`:

| State                   | Key                           | What shows                                                                                                                         | Canvas                                    |
| ----------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Screening form          | `screening-form`              | What they're building, budget, start, the role (home's five plus "A website or brand", "Not sure yet"), name, email, Continue; no header call button (D-SITE-167) | `screening-form-1440.png`                 |
| Fit                     | `screening-fit`               | The fit rule passes (D-SITE-166): "Book a 30-minute call" to Cal.com with the answers passed through, never name or email in a URL GA sees (D-SITE-176); "Rather write first? Send a note" | `screening-fit-1440.png`                  |
| Not a fit               | `screening-not-a-fit`         | "Let's talk first": the note prefilled from the screening, name and email kept                                                      | `screening-not-a-fit-1440.png`            |
| Not a fit, website      | `screening-not-a-fit-website` | Role "A website or brand": the same, with one line to `/websites` under the intro                                                    | `screening-not-a-fit-website-1440.png` (crop) |
| Screening submit        | `screening-submit`            | Invalid (field errors, email malformed), sending ("Sending…", D-SITE-169/170), error (answers kept, email link)                       | `screening-submit-1440.png` (crop)        |
| Contact default         | `contact-default`             | Message, name, email, "Send a note", "Or email" link beside it in every state (D-SITE-202)                                                                     | `contact-default-1440.png`                |
| Contact sent            | `contact-sent`                | The sent line at Lede 19 in the intro's place, the reply address echoed, "Prefer a call?" to `/book`; the header call button stays (D-SITE-169, D-SITE-202)                    | `contact-sent-1440.png`                   |
| Sent from not-a-fit     | `contact-sent-from-not-a-fit` | Stays on `/book` under "Let's talk first": the sent line alone, no call offer, header call button hidden (D-SITE-167, 169, D-SITE-202)                                  | `contact-sent-from-not-a-fit-1440.png` (crop) |
| Contact submit          | `contact-submit`              | Invalid (message empty, email malformed), sending, error, as the screening's                                                       | `contact-submit-1440.png` (crop)          |
| Loading, offline, empty | —                             | N/A: server-rendered forms with no fetch before submit (D-SITE-18); sending and error cover the submit                             | N/A                                       |

Dark is the target; light must hold up (D-SITE-61).

## Primary action

Book a 30-minute call, with home's label (A-17). On this page the note leads and the call sits beside it (D-SITE-130); on `/book` the step's own button (Continue, then the fit's call); on `/contact`, "Send a note".

## Open decisions

- Launch-blocking, not build-blocking: Taylor names the branding and conventions install prices; proof is whatever `/work`'s Branding & UI tab shows; the PEM page is a later ticket (D-SITE-203).
- Settled: sent-from-not-a-fit, contact sent and the contact beside-button line (D-SITE-202); Name optional (D-SITE-201); the chip's bar is not A-05 (D-SITE-177); event names (D-SITE-176).
- Taylor's copy: every `[draft]` and `[Taylor's …]` string in `services-words.md`, including the closing line, How to start step 1 and the FAQ's first answer (both assume the call comes first), the hero sub (D-SITE-129) and the contract offer's name.
- Off the page: AI coaching, offer and funnel consulting, marketing as a skill (brief); the family office's name; Viewpoint.AI.
