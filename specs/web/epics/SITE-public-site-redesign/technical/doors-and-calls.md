---
epic: SITE
status: approved
---

# SITE — technical notes: one-way doors and routed calls

## One-way doors

Matched against `toolkit.json`'s reviewer rows (verified 2026-10-16).

| Door                                                               | Path glob                                                       | Record or ratification                                                                          | Reviewer           |
| ------------------------------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------ |
| New table holding personal data: `note_signups` and its migration  | `**/schema/**`, `**/migrations/**`, `**/*.sql`                  | C2                                                                                              | mason, warden      |
| Personal data through Resend: notes emailed to Taylor              | imports `resend` (`server/services/notes.ts`)                   | C3                                                                                              | warden             |
| Personal data to a third party: the Cal.com hand-off               | `app/book/**` (no reviewer row; Warden by this file)            | C4                                                                                              | warden             |
| Public POST endpoints: three server actions and one route handler  | `app/book/**`, `components/contact/**`, `app/_components/**`    | C3 (abuse controls)                                                                             | warden             |
| Analytics payloads: what GA4 receives, irreversible once collected | `components/analytics/**`, `lib/analytics/**` (no reviewer row) | C5                                                                                              | warden, with Tally |
| Permanent public URLs: four 308s, cached by browsers               | `next.config.ts`                                                | Ratified: D-SITE-22, 164, 165, 215                                                              | mason              |
| Public API shape                                                   | `app/api/**`                                                    | Not touched                                                                                     | —                  |
| Environment seam                                                   | `**/env.ts`                                                     | Not touched: notes go to the existing ops address (`INTAKE_NOTIFY_EMAIL`, verified `notifyOps`) | —                  |

No record in `docs/decisions/records/` is proposed: each door above is a ruling within existing law, logged as a D-SITE line when ratified. A record would be needed only if C2 chose a second vendor.

## Calls routed to Taylor

Each with one recommendation and the cost of being wrong.

**C1. Appetite.** Cut every ticket now; build the hirer path first; `/websites`, `/capabilities` and the intake restyle form the last wave and ship only if days remain (`verdict.md`). Wrong: if they are needed this cycle, the epic runs about four days over.

**C2. Where signup addresses live.** A `note_signups` table in the site's Postgres: email, time, consent wording version, source, unsubscribed time; nothing sent on signup; the first send to the list starts with a confirmation email (CASL wants proof of consent, and the CRM already keeps that kind of trail, M-CRM-3). Alternative: Resend's contacts, no schema, but consent wording and source are not first-class there. Wrong: a migration to move them later; small at this volume.

**C3. Where notes go.** Emailed to Taylor through Resend with the sender as `reply-to`, not stored; the screening answers ride in the body; nothing is ever sent to the address someone typed (otherwise the form relays spam to strangers). Spam: honeypot, minimum fill time, field caps; no CAPTCHA, no rate limiter until abuse shows. Wrong: a note lost when Resend fails, which the error state already handles by offering the email address (D-SITE-170).

**C4. The Cal.com hand-off.** The fit view posts to `app/book/handoff/route.ts`, which answers 303 to `BOOKING_URL` with Cal.com's prefill: name, email, "What are you building?" as notes, and `metadata[source]=site-screening` with the role. No GA tag runs on Cal.com's page unless Taylor installed one there. **Condition:** Taylor confirms no analytics app (GA, Meta pixel) is installed on that Cal.com event type; if one is, pass only the role and source. Wrong: names and emails in a third-party analytics property, which cannot be recalled.

**C5. Events and SITE-M1** (Tally). Ratify the registry in `data-contract.md` as D-SITE-176 wrote it; drop `coded_intake_start` (proposed in `websites-coded-build.md`, watched, not judged, and wave 4) unless Taylor wants it. Gtag loads with `send_page_view: false`; `PageViews` sends every page view, `q` stripped. Taylor's GA4 admin: register `surface`, `placement`, `outcome`, `from`, `slug` as event-scoped custom dimensions, and turn off enhanced measurement's form interactions. **SITE-M1 v1:** Cal.com bookings carrying `metadata[source]=site-screening`, counted in Cal.com; `book_call_click` with `placement: screening_fit` is its denominator and the other clicks the funnel. Every hand-off has passed the fit rule, which a "website or brand" role cannot (closing knowledge gap 4). The definition file, from `docs/measurement/metrics/definitions.template.md`, is written by the analytics ticket. Wrong: a metric that counts clicks, not calls.

**C6. QA levels.** The `/book` and `/contact` ticket, the signup ticket and the analytics ticket touch personal data, so Q3 with Warden (AGENTS.md; flagged once). The rest as the brief says: Q1, home Q2. Wrong, downward: a leak found after launch; upward: about half a day more per ticket.

**C7. The test harness.** Add `@playwright/test` and `@axe-core/playwright` (dev, exact pins, Quartermaster's rows) in the first ticket (`test-shape.md`). Wrong: most browser criteria recorded as manual.

**C8. `/privacy` before launch.** The page must say that notes are emailed to Taylor through Resend and that signup addresses are stored, with how to leave. Taylor's copy, Chancery's seat; blocks launch of `/contact`, `/book` and the signup, not their build. Wrong: collecting without telling.

**C9. Chrome on `/websites/platform`.** It follows the site's header and footer (D-SITE-130, "every page"); D-SITE-209 binds its body only, and the golden file covers the body. Wrong: the legacy page shows the new nav, which is the point of site-wide chrome.

## Rulings

Taylor ratified all nine as recommended on 2026-10-16, in the Technical thread; logged as D-SITE-222 to 230 in `ux/public/decisions-14.md`.

| Call | Ruling                                                                              | Log        |
| ---- | ----------------------------------------------------------------------------------- | ---------- |
| C1   | Ratified                                                                            | D-SITE-222 |
| C2   | Ratified: `note_signups` table                                                      | D-SITE-223 |
| C3   | Ratified: notes emailed, not stored                                                 | D-SITE-224 |
| C4   | Ratified, full prefill: Taylor confirmed no analytics app on the Cal.com event type | D-SITE-225 |
| C5   | Ratified; `coded_intake_start` dropped                                              | D-SITE-226 |
| C6   | Ratified                                                                            | D-SITE-227 |
| C7   | Ratified                                                                            | D-SITE-228 |
| C8   | Ratified                                                                            | D-SITE-229 |
| C9   | Ratified                                                                            | D-SITE-230 |

Every door is ratified; the Tickets stage is open. Taylor's own items, outside any ticket: register the five GA4 custom dimensions and turn off enhanced form interactions (D-SITE-226); write the two `/privacy` lines (D-SITE-229).
