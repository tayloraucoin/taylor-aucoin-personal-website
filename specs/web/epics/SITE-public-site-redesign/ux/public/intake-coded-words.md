---
target: specs/web/ux/public/intake-coded-words.md
status: approved
promoted:
---

# Coded-site intake — words

Part of `intake-coded.md`. Handoff pass, 2026-10-16, Gloss. Every string is existing and Taylor's; the canvas carries today's strings verbatim (D-SITE-155), so nothing here is new copy and none is improved. What the new brand makes stale is listed in `intake-coded-copy.md`, not repeated here; this file names where each string lives and adds what that list missed. Paths are under `app/websites/` unless they start with `lib/`. Names in the captures (Mara Ellison, Halden Pictures, the files) are synthetic data, not copy.

## Where the strings live

| Screen      | Strings                                                                                                        | Source                                                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Start       | h1, lede, resume offer and its link, footnote with "Privacy"; the unfurl description                           | existing: `coded/intake/page.tsx` (68, 72, 79, 101; 17)                                                                          |
| Start       | labels, help, "Start →", "Starting…", the email error, the open-intake status line                             | existing: `coded/intake/_components/showcase-start-form.tsx`; site-kind options from `lib/intake/showcase-copy.ts`               |
| Welcome     | h1 (both forms), the step-count line, two paragraphs, "What we'll ask", footnote                               | existing: `coded/intake/_components/showcase-welcome.tsx`                                                                        |
| Welcome     | "Send me my link", "Sent — check your email"                                                                   | existing: `intake/_components/send-my-link-button.tsx` (shared)                                                                  |
| Resume      | h1, body, "Continue — step n"                                                                                  | existing: `intake/_components/resume-list.tsx` (shared)                                                                          |
| Steps       | step titles and intros; every question, option and help line                                                   | existing: `lib/intake/showcase-steps.ts`, `lib/intake/showcase-copy.ts`; step components under `coded/intake/_components/steps/` |
| Step chrome | "Step n of 10", "← Back", "Continue", "Finish", "Next · {step}"                                                | existing: `intake/_components/step-shell.tsx` (shared)                                                                           |
| Save line   | "Saving…", "Saved", the offline and error lines, "Try again"                                                   | existing: `intake/_components/save-indicator.tsx` (shared)                                                                       |
| Taste       | "Picked · n of 5"; the pick block's score ("n / 7"), Edit, Remove, See more                                    | existing: `coded/intake/_components/steps/step-taste.tsx`, `taste/pick-block.tsx`                                                |
| Taste       | group titles and lines, site names, role lines, tags                                                           | existing: the example packs in the admin (`/admin/intake/examples`), Taylor's content                                            |
| Import      | "Read it through", both bodies, the unread-files line, "Continue →"                                            | existing, marked `[COPY — draft, pending Taylor]`: `coded/intake/_components/ingest-run.tsx`                                     |
| Import mark | "Filled in from {file}" and the quoted sentence                                                                | existing: `intake/_components/machine-filled.tsx` (shared); the quote is the client's own                                        |
| Pay         | h1, lede, the canceled line, trust lines                                                                       | existing: `coded/intake/_components/showcase-pay-gate.tsx`                                                                       |
| Pay         | "How would you like to pay?", plans, "Worth adding?", extra pages, "Total today", the pay button               | existing: `coded/intake/_components/showcase-checkout.tsx`, `extras-checkout.tsx`, `showcase-pay-button.tsx`                     |
| Pay         | "Have a code from our call?"; the agreement; "How it works"                                                    | existing: `intake/_components/promo-rail.tsx`, `legal-agreement.tsx`, `addon-info.tsx` (shared)                                  |
| Confirming  | h1, both bodies, the email link                                                                                | existing: `intake/_components/payment-confirming.tsx` (shared)                                                                   |
| Unavailable | both h1s, both bodies, the email link                                                                          | existing: `intake/_components/link-unavailable.tsx` (shared)                                                                     |
| Done        | h1, body, "We'll cover these on the call", "Changed your mind about something?", its body, "Review my answers" | existing: `coded/intake/_components/showcase-done.tsx`; the feedback block in `feedback-block.tsx`                               |

Not copy: the taste card's "Example site capture · 1512 × 982" (placeholder for a real capture).

## Accessible names and announcements

All existing: the theme group "Theme" with Light, Dark, System (`components/ui/ThemeToggle.tsx`); the gallery's arrow and "Capture n of m" labels (`taste/site-stage.tsx`, `example-row.tsx`); the import dialogs, named by their titles (`ingest-run.tsx`). The visited and current marks on the resume list need a hidden word each (`intake-coded-build.md`, Access): Taylor's to write.

## Missed by the change list, for Taylor

Voice is first person throughout and the Agora eyebrow is replaced by nothing (D-SITE-220); Taylor rewrites these with the list.

| Where                                                                 | Line (today)                                                         | Issue                                                                                                                                                                      |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `showcase-start-form.tsx:131`, `intake/_components/start-form.tsx:77` | "That doesn't look like an email address — check for a typo."        | Em dash (checklist); shared                                                                                                                                                |
| `showcase-checkout.tsx:455`                                           | "Only if you already know you need them — … we can always add pages" | Em dash; "we": first person throughout (D-SITE-220)                                                                                                              |
| `promo-rail.tsx:50`                                                   | "Have a code from our call?"                                         | "our": first person (D-SITE-220); shared                                                                                                                         |
| `payment-confirming.tsx`, after 40s                                   | "Your payment went through — nothing is lost."                       | Said before the webhook confirms it; the code treats `?paid=1` as a hint, never a fact (`[token]/page.tsx`). Taylor's to write; joins the copy list (D-SITE-221) |
