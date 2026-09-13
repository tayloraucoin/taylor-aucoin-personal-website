# FIN-5 — `/websites/client`: the magic-link sign-in

**Epic:** FIN — finances · **Phase 3** · Size: S
**Slice type:** Public client surface, one form, one email. Risk class: account enumeration (the form confirming an address exists); a send flood; a link emailed to a client for the wrong engagement.
**Review:** **Vigil — enumeration from the seat of a stranger typing a client's address. Vesper — the form inside the site's grammar, dark only.**

**Status:** Not started — D-FIN-3 (the URL) defaulted to `/websites/client` per `00-build-order.md`.

> **Vigil — spot audit, enumeration.** Type an address that exists, one that does not, one with two engagements, one whose engagement is unpaid, one whose token is expired. Every response on screen must be byte-identical. Then measure: does the response *time* differ enough to tell? State the numbers.

---

## Outcome

A client who has lost their link — or who finished months ago and wants to come back — opens `/websites/client`, types their email, and is told the link is on its way if the address is one we know. It arrives from Agora, lands them on their entry page, and the page does what it already does: pay gate if unpaid, their step if in progress, `/done` if complete. Nothing on screen ever says whether an address exists. What this slice does not do: create an account, show a link on screen, or change where the link lands.

## Why / intent

- **M-FIN-4** — the login is the link, made requestable; no accounts.
- **Taylor, 2026-09-11** — "I need to add a login, please tell me where that should be."
- **`app/websites/intake/_actions/start.ts` § the returning-email branch** — already a magic link: emails, never shows. This slice is that branch given its own page, widened to finished engagements.
- **D-INT-1 / D-INT-11 grammar** — one field, one button, one line; no urgency, no marketing.
- **What this slice is NOT (binding):** no password, no OTP, no Supabase Auth for clients; no "we found 2 engagements — pick one" on screen (that is enumeration).
- **Ground truth:** `findResumableByEmail` (widen) · `sendResumeLink` (its send window in `email_events`) · `reissueEngagementToken` · `buildEntryUrlFor`.

**Rulings this slice makes (labelled, logged):**

- **`findEngagementForSignIn(email)`**: most recent engagement with `paid_at` set for `lower(email)`; if none, most recent of any. Returns the engagement and its decrypted token, reissuing when expired. Lives in `engagement.ts`. `findResumableByEmail` is left as-is for the start forms (it must stay unfinished-only there). Logged.
- **The response is one constant string regardless of outcome**, and the action awaits the same work on every branch (a no-op send on the miss path costs the same time as the real send's DB work; the email itself is fire-and-forget on both). `[COPY — draft]`: "If that address is one we know, your link is on its way." Logged.
- **Rate: the existing `sendResumeLink` window applies per engagement; per address, one send per five minutes enforced in the action via `email_events`.** `[PROVISIONAL — Taylor]` on the number. Logged.
- **The page lives at `app/websites/client/page.tsx`, outside both intake trees**, so neither tree's cookie scope covers it — the link sets the cookie when followed, as today. Logged.

## Experience & states

One card in the site's dark grammar: a short heading, one email field, one `GradientButton` — the primary CTA and the brightest thing on screen — and the constant line after submit. No header nav suppression beyond what `/websites/intake` already does.

**States (exhaustive):** idle · invalid email (client-side format only) · submitting · submitted (constant line) · rate-limited (same constant line; nothing sent).

**Failure / edge states (named):** email provider down → constant line; the failure is logged by id; nothing on screen · address with two engagements → the rule picks; the client can ask Taylor (FIN-4 sends the other) · expired token → reissued silently; the old link dies, which is correct because the client asked for a new one.

## Non-negotiables (this slice)

- **Byte-identical response for hit and miss.**
- **No link on screen, ever.**
- **No new auth surface.** `requireEngagement` stays the only door.
- **The honeypot and the email-format check from the start form are reused.**

## Data

**Schema changes: none.**

**Tables:** `engagements` (read; update via `reissueEngagementToken`) · `email_events` (read for the window; written by `sendResumeLink`).

**Placement:** `app/websites/client/page.tsx` · `app/websites/client/_actions/request-link.ts` · `app/websites/client/_components/sign-in-form.tsx` · `server/services/engagement.ts` (`findEngagementForSignIn`) · `lib/routes.ts` (`websiteRoutes.client`).

**Validators:** `lib/validators/client-sign-in.ts` (email, honeypot).

## Accessibility

Label on the field, `autocomplete="email"`, 16px input (the iOS zoom rule), the result line `aria-live="polite"`, focus stays on the field after submit; reduced motion honoured by the button.

## Acceptance criteria (observable — staging, real inbox)

1. A known paid address → one email with the current entry URL; following it lands per state (verified for paid-in-progress and complete).
2. An unknown address → the identical line, no email, no `email_events` row.
3. Timing: p50 of hit vs miss within 50 ms over 20 requests each (Vigil states the numbers).
4. Two engagements under one address, one paid → the paid one's link is sent.
5. An expired token → reissued, new link sent, old link 404s.
6. Six submits in five minutes for one address → one email.
7. The honeypot filled → redirect home, nothing sent.
8. No `token`, `ciphertext`, or address appears in any log line.
9. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Constant-time is approximated, not guaranteed; the goal is that a casual probe cannot tell. State it as such in the closure.

## Dev's call

Heading and line copy as `[COPY — draft]` · whether the form is a server action or a route handler (server action, per the start forms).

## Out of scope

- **Accounts, passwords, OTP** — M-FIN-4.
- **Choosing between engagements on screen** — enumeration; Taylor sends the other from FIN-4.
- **Links on `/done`** — FIN-7.

## Depends on

**No slice dependencies.** Sequenced after FIN-4 for surface coherence only.

## Recommended execution

**Sonnet is acceptable.** Small, all reuse; the enumeration rule is the one thing to hold.

---

### Kickoff (paste into the session)

> Build **FIN-5 — Client sign-in** (attached spec). **One constant response for hit and miss; no link on screen; no new auth; reuse `sendResumeLink` and `reissueEngagementToken`.**
> Attach/read first, in order: this spec · `specs/README.md` · `TECHNICAL-DECISIONS.md` M-FIN-4 · `app/websites/intake/_actions/start.ts` (the returning-email branch — reuse its shape) · `server/services/engagement.ts` · `docs/intake/INTAKE-UX-SPEC.md` (form grammar) · repo `CLAUDE.md`.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
