---
target: specs/web/ux/public/intake-coded-copy.md
status: draft
promoted:
---

# Coded intake — copy change list

Gloss, 2026-10-16. Lines the new brand makes stale, for Taylor to rewrite. No replacement copy is written here; the canvas carries today's strings verbatim (D-SITE-155). Rules cited: voice (`docs/product/brand/voice_taylor-aucoin.md`, rules 1 to 12, Avoid list), Taylor's human-hand checklist (em-dash rationing, no triads), canon A-07 and A-17. Paths are under `app/websites/`. Lines shared with the platform intake (`intake/_components/`) change it too (D-SITE-112: no copy work there, so a shared line is rewritten once for both).

## 1. "Agora · Website build" and "Agora · Custom build"

| Where                                                                                                                                                                                                                                                     | Why stale                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hardcoded eyebrow on 9 screens: `intake/page.tsx:60`, `intake/[token]/done/page.tsx:52`, `intake/_components/deposit-gate.tsx:66`, `welcome.tsx:32`, `link-unavailable.tsx:18`, `payment-confirming.tsx:44`, `coded/intake/add-ons/page.tsx:60, 104, 138` | The eyebrow goes (A-07, D-SITE-155). Agora is never a public name in the new voice (Avoid list). On the coded track two of them also name the wrong track: confirming and link unavailable say "Website build" |
| `eyebrowFor()` in `lib/intake/tracks.ts:361-362`, used by start, welcome, resume, pay gate, done                                                                                                                                                          | Same. [NEEDS DECISION] whether anything replaces it. The canvas shows nothing. Agora stays the charging entity on statements and in the terms (verified `tracks.ts:354`)                                       |

## 2. Voice: "we" and "Taylor" where the site says "I"

The site speaks in first person (voice rule 3). The intake speaks as "we" and names Taylor in the third person. [NEEDS DECISION] Taylor picks one voice for the intake. "We" may be deliberate here, since a machine reads step 1.

| Where                                                           | Line (today)                                                                                    |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `coded/intake/_components/showcase-welcome.tsx`                 | "What we'll ask"; "A skipped question just means we ask on a call"                              |
| Taste intro (`steps/step-taste.tsx`)                            | "This is how we skip the part where a designer…"                                                |
| Import result and marks (`lib/intake/showcase-copy.ts:872-960`) | "We filled in {n} answers…"; "We couldn't read…"; "Taylor will ask about that part on the call" |
| `showcase-done.tsx:51`                                          | "Taylor reads all of it…"; "We'll cover these on the call"                                      |
| `link-unavailable.tsx:26-27`, `payment-confirming.tsx:55`       | "Send Taylor a note and he'll send a fresh one"                                                 |

## 3. Em dashes (human-hand checklist)

`intake/_components/save-indicator.tsx:22-23` (both shared); `link-unavailable.tsx:26-27` (shared); `payment-confirming.tsx:55` (shared); `resume-list.tsx:63` "Continue — step n" (shared, a button); `send-my-link-button.tsx:24` "Sent — check your email"; `coded/intake/page.tsx:72` (start lede); `showcase-welcome.tsx:61, 76, 139`; `showcase-done.tsx:51, 67`; `showcase-pay-gate.tsx:71`; the taste intro. The start form's site-kind options carry them too ("Your creative work — a portfolio").

## 4. Triads and closers

`showcase-done.tsx:51` "every note, every rating, every file" (a triad); welcome "Ten steps. Every one of them optional but encouraged." (an epigram line, Taylor's call).

## 5. Labels and buttons (voice rule 6, A-17)

| Where                                                        | Today                                | Issue                                                                                                                                                                                                                                   |
| ------------------------------------------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Start submit (`showcase-start-form.tsx`) and welcome primary | "Start →"                            | Two different acts share one label, and neither names its consequence. The coded page's own button is "Start your site →"                                                                                                               |
| Import result card                                           | "Continue →"                         | One label, two outcomes on one view: the card's closes the notice, the footer's goes to the next step (Assay round 1). It needs its own verb. Arrows on primaries are also inconsistent ("Start →", "Continue →", "Continue"): one rule |
| Resume primary                                               | "Continue — step 4"                  | An em dash in a button; a third form of "Continue"                                                                                                                                                                                      |
| Pay button                                                   | "Pay deposit", then "Pay today — $n" | Two labels for one button across its states; the dash                                                                                                                                                                                   |
| Start resume offer                                           | "Pick up where you left off →"       | Was a mono caps link; now a text link, so the arrow is optional                                                                                                                                                                         |
| Welcome ghost                                                | "Send me my link"                    | Fine                                                                                                                                                                                                                                    |
| Footer                                                       | "← Back", "Continue", "Finish"       | Fine                                                                                                                                                                                                                                    |

## 6. Case and type, no wording change

Every mono caps string becomes sentence case at meta size (token rules): the start notice, the welcome footnote, trust lines, "Saved", "Next · step", "Picked · n of 5", source-list statuses, machine-filled marks. "Shows as TAYLORAUCOIN.COM on your statement" keeps its caps, since that is the statement descriptor.

## Labels invented on the canvas

None. The taste card's "Example site capture · 1512 × 982" is a placeholder, not copy.
