# FIN-4 — The engagement page: Orders section, sibling engagements, Send their link, Rotate link

**Epic:** FIN — finances · **Phase 2** · Size: M
**Slice type:** Admin read surface plus two client-facing link actions. Risk class: a link emailed to the wrong address; a rotation that kills a link a client is mid-form on; the wrong sibling mistaken for the paid one (the 2026-09-11 confusion).
**Review:** **Vigil — the sibling notice and the two link actions from the seat of an admin in a hurry. Forge — rotation and send are each one write, one email.**

**Status:** Not started

> **Vigil — feature review.** Walk: three engagements under one email, one paid — is the paid one unmistakable in under five seconds? Send their link on an expired token (must reissue first, say so). Rotate on an engagement whose client is mid-questionnaire (the confirm names the consequence). Send on an engagement with no email (impossible by schema; confirm).

---

## Outcome

Opening an engagement, Taylor sees what it has paid for and what it has not, every order against it, and — when the same email has other engagements — a short notice naming them with their paid state, so the right one is never a guess. Two buttons beside the client's details: **Send their link**, which emails the current link to the address on record without changing it; and **Rotate link**, which mints a new one, shows it once to copy, and kills the old. What this slice does not do: show the link on screen without rotating (the plaintext is never stored), or send any other email.

## Why / intent

- **The incident** — three rows for one client; the admin offered no way to tell which was paid or to send the right link without the CLI.
- **D-ADM-4** — Engagements is its own section; this page is where a client's money and access live.
- **`reissueEngagementToken`, `sendResumeLink`, `decryptToken`** — all exist; this slice gives them buttons.
- **M-FIN-4** — possession of the link is the identity; Send is the admin side of the magic link FIN-5 gives the client.
- **What this slice is NOT (binding):** no link displayed except at the moment of rotation; no email to an address not on the record; no edit of `contact_email` here.
- **Ground truth:** `app/admin/(protected)/engagements/[id]/page.tsx` · `app/admin/_components/engagement-state.tsx`, `engagement-panel.tsx` (the "copy it now — it isn't stored" grammar) · `server/services/engagement-admin.ts` (`loadEngagementAdminDetail`) · `server/services/engagement.ts`.

**Rulings this slice makes (labelled, logged):**

- **Send their link decrypts the stored token and emails via `sendResumeLink`; if the token is expired it reissues first and says so in the result line.** The client's link never silently stops working because of an admin action. Logged.
- **Rotate confirms in-line with the consequence in words** — "Their current link stops working the moment you press this." — then shows the new link once with Copy, as the lead panel does. Logged.
- **Siblings are engagements sharing `lower(contact_email)`**, listed with track, created date, paid state, and a link; the current one is marked. Read-only. Logged.
- **The Orders section reuses FIN-2's row component** with the engagement column dropped. Logged.

## Experience & states

Above the existing state block: the sibling notice when siblings exist — one line per sibling, the paid one carrying the same "Deposit paid" chip the page already uses. Beside the contact details: the two buttons. Below the basket block: Orders, FIN-2's rows for this engagement, newest first, each linking to its detail.

**States (exhaustive):** no siblings · siblings (none paid / one paid / several paid) · send idle · send confirming · send done (with the address it went to) · send reissued-and-done · send failed · rotate idle · rotate confirming · rotate done (link shown once) · orders empty · orders populated.

**Failure / edge states (named):** email provider down → send failed, line says so, nothing rotated · rotate pressed twice → second press mints again (harmless; the confirm is the guard) · the engagement's email is shared with a *durable*-track sibling → listed with its track; no assumption about which is "his".

## Non-negotiables (this slice)

- **The plaintext token appears on screen only at rotation**, never on load.
- **Send goes to `contact_email` read inside the action.**
- **No write to `engagements` except through `reissueEngagementToken`.**

## Data

**Schema changes: none.**

**Tables:** `engagements` (read; update via `reissueEngagementToken`) · `orders`, `engagement_products`, `products` (read) · `email_events` (written by `sendResumeLink` as today).

**Placement:** `app/admin/(protected)/engagements/[id]/page.tsx` (three additions) · `app/admin/(protected)/engagements/_actions/send-link.ts`, `rotate-link.ts` · `app/admin/_components/engagement-siblings.tsx`, `engagement-link-actions.tsx` · `server/services/engagement-admin.ts` (`loadEngagementSiblings`, `loadEngagementOrders`) · `server/services/engagement.ts` (`sendCurrentLink(engagementId)` wrapping decrypt-or-reissue + `sendResumeLink`).

**Validators:** `lib/validators/admin-engagements.ts` (uuid) — create if absent.

## Accessibility

Buttons have words; confirms are disclosures with managed focus; the shown-once link is in a labelled read-only input with a Copy button that announces "Copied"; the sibling list is a list, the current item marked in text.

## Acceptance criteria (observable — staging, real inbox)

1. An engagement whose email has two siblings shows both with paid state; the current is marked; the paid one is visually the one the page already calls "Deposit paid".
2. Send their link → one email to `contact_email` containing the current entry URL; the token hash in the database is unchanged. *(Forge.)*
3. Send on an engagement whose `token_expires_at` is past → the token is reissued, one email sent with the new link, the result line says it was reissued. *(Forge.)*
4. Rotate → confirm text names the consequence; on confirm the old link 404s, the new link works, and the new link is shown exactly once.
5. Reloading after rotation shows no link.
6. The Orders section lists this engagement's orders and links to FIN-2's detail.
7. No `resume_token_ciphertext` or token value appears in any log line or client component prop.
8. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `buildEntryUrlFor(track, token)` already picks the tree; do not rebuild paths.
- The lead panel's "Copy link" block is the grammar for shown-once; lift it into a shared component rather than copying it.

## Dev's call

Section order on the page · whether siblings render above or beside the state block.

## Out of scope

- **Editing the client's email** — not in this epic.
- **Merging sibling engagements** — a data decision Taylor makes by hand when it matters.
- **The client-side sign-in** — FIN-5.

## Depends on

- **FIN-1** — `orders` for the Orders section. Complete in `PROGRESS.md`. (The link actions have no dependency; they ship in this slice for surface coherence.)

## Recommended execution

**Sonnet is acceptable.** Everything is reuse; the risk is pinned by the non-negotiables.

---

### Kickoff (paste into the session)

> Build **FIN-4 — Engagement page money and links** (attached spec). **The token shows once, at rotation only; send goes to the record; reuse `reissueEngagementToken` and `sendResumeLink`.**
> Attach/read first, in order: this spec · `specs/README.md` · `app/admin/(protected)/engagements/[id]/page.tsx` · `app/admin/_components/engagement-panel.tsx` (the shown-once grammar) · `server/services/engagement.ts` · `FIN-2` (the row component) · repo `CLAUDE.md`.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
