---
target: specs/web/ux/intake/overview.md
status: approved
promoted:
---

# Coded intake — overview

## Frame

A founder of a place-or-community venture fills the coded intake on a laptop, with the deck open beside it. Legal questions can make them under-answer. The job: the site's investor, property and event pages get their facts, each quoted or plainly "not sure". Every question feeds something on the client's site (brief). One pass, no canvas, existing components only.

## Routes and surfaces

Steps: 1 ingest, 2 about, 3 audience, 4 experience, 5 work, 6 taste, 7 words, 8 media, 9 site, 10 access. No step is added. Entry and exit: the previous and next step.

| Route                                           | Surface file       |
| ----------------------------------------------- | ------------------ |
| start form; `/[token]/about`                    | `kind-picker.md`   |
| `/[token]/about`, `/audience`, `/work`, `/site` | `venture-place.md` |
| `/[token]/work` (claims, ask cards); `/site`    | `investor-ask.md`  |
| `/[token]/work`                                 | `event-section.md` |
| `/[token]/media`                                | `media.md`         |
| `/[token]/taste`                                | `taste.md`         |

**`?state=` (C-P08):** `/admin/intake/questions?track=showcase&kind=<kind>&subtype=place&state=<key>`. It seeds synthetic answers outside production through `readPageState`, with names per D-PORT-14. The client's token route has no fixtures.

## Navigation and shell

Unchanged: the step shell, progress, footer note and autosave indicator.

## Registry and copy

- **`showcase-kinds.ts`:** `VENTURE_TYPES` (six values; only `place` is built). Venture gains the group `raise` (all-venture rows). Sub-type `place` adds the group `place`. `ForKinds` tests read the sub-type. [PROPOSED: Mason names it; Turner rules if `ForKinds` changes shape.]
- **`showcase-primer-fields.ts`:** new text keys are critical by default.
  - New radios go in `CHOICE_BACKED`, and fields behind a reveal in `REVEAL_GATED`.
  - `raise` and `place` keys go in `KIND_GATED`.
  - `imageBrief` joins `NON_CRITICAL` (ratified by Taylor, 2026-10-20).
  - Ask-card sub-keys are outside the inventory, so nothing is ever proposed into them.
- **`showcase-copy.ts`:** venture-place strings go in the venture pack's `place` overlay; every-kind strings go in the floor pack (D-VEN-24). All are `[COPY — pending Taylor]`.
- **`content/intake-examples/`:** six style tags.

## Shared states

Every surface is fields on an autosaving step. These rows apply everywhere, and each surface file adds only its own:

- `empty`: unanswered.
- `partial`: some answers, reveals open where their trigger is set.
- `save-error`: `SaveIndicator` error with retry; typed text stays.
- `offline`: `SaveIndicator` offline; edits are held and resent.
- `saved`: `SaveIndicator` "Saved".
- Loading: N/A. Steps render server-side with their answers.

## Decision log

All dated 2026-10-20, from the interview round unless marked.

| ID       | Decision                                                                                                     | Why                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| D-VEN-1  | Each new block sits next to the question it extends (the surface files place them)                           | Context                                                                                                                                      |
| D-VEN-2  | `?state=` lives on the admin preview, with fixtures outside production only                                  | The client route holds real answers                                                                                                          |
| D-VEN-3  | Sub-type is a radio revealed under the venture choice; six values; optional                                  | Unanswered reads as plain venture                                                                                                            |
| D-VEN-4  | A sub-type change keeps the answers, and they still print                                                    | D-PORT-11                                                                                                                                    |
| D-VEN-5  | The investor ask lives inside the claims ink cluster                                                         | One ink treatment (D-PORT-10)                                                                                                                |
| D-VEN-6  | `asksPortrait` and `asksVideo` stay false; help lines carry the intent                                       | Flipping them drops the place drop, re-asks headshots (D-INT-8) and removes the tools question. Amends the brief's mechanism, not its intent |
| D-VEN-7  | Invest cards gain currency, a same-minimum row and eligibility                                               | The brief's `asks[]` add-ons                                                                                                                 |
| D-VEN-8  | Raise progress is its own critical field; `showAvailability` stays non-critical                              | A claim versus a preference                                                                                                                  |
| D-VEN-9  | Piece cards gain "Is it funded?"; size and permits are long answers                                          | Phases need a funding status                                                                                                                 |
| D-VEN-10 | Critical choices end "Not sure yet"; nothing is preselected                                                  | A preselection is a claim never made                                                                                                         |
| D-VEN-11 | Image facts are text, not per-file tags                                                                      | No `FileDrop` change in 2 days                                                                                                               |
| D-VEN-12 | Applying sits under the asks and is cut first                                                                | The brief's cut order                                                                                                                        |
| D-VEN-13 | Plain venture's strings stay, except the claims intro and name help                                          | New rows broke "Three of them" and "the last step"                                                                                           |
| D-VEN-14 | "Event attendees" is derived in the document, never asked                                                    | Audience precedes Work                                                                                                                       |
| D-VEN-15 | Event section on Work: after the asks, before claims                                                         | Beside the asks                                                                                                                              |
| D-VEN-16 | One event, plus "Any other events coming?"                                                                   | No `Reveal` inside a card                                                                                                                    |
| D-VEN-17 | The event investment row is venture only                                                                     | Only venture raises                                                                                                                          |
| D-VEN-18 | `decks` is its own drop for all venture, above documents, with the promise line                              | The brief's [PROPOSED], placed                                                                                                               |
| D-VEN-19 | The image brief is asked of every kind, with a reference drop, non-critical                                  | A site preference                                                                                                                            |
| D-VEN-20 | Five structure spectrums for venture-place, gated on the first pick; no feel forks                           | Film's law                                                                                                                                   |
| D-VEN-21 | Spectrum 1 is never gated at runtime; its high end names counsel                                             | Counsel's answer is free text                                                                                                                |
| D-VEN-22 | Tag words as in `taste.md`                                                                                   | Gloss                                                                                                                                        |
| D-VEN-23 | Venture-place splits into two files (writing pass)                                                           | The token cap                                                                                                                                |
| D-VEN-24 | Every-kind strings go in the floor pack, beside `ask` and `claims` (writing pass; default taken at approval) | Every kind reads them                                                                                                                        |

## Open

- Mason: the sub-type mechanism, the `ForKinds` signature, the group names, fixture seeding. None of them blocks.
- Piece 6 (gallery entry) must land before the first venture-place intake is sent.
