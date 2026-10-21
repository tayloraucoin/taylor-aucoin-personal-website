---
target: specs/web/ux/intake/investor-ask.md
status: approved
promoted:
---

# The investor ask — intake

## Job

The founder hands over what their counsel said about the raise; nothing here drafts it. Done means the model page, the deck-request gate, the legal footer and the disclaimer each have counsel's words, or a plain "Not sure yet" or "counsel pending". Nothing about the raise reaches the site unless it is quoted and approved (the claims boundary in the brief).

## Layout and components

**Claims cluster** on Work: the existing `InkCluster` (D-PORT-10), the one ink treatment. Rows render in this order, absent where not asked.

| #   | Key                  | Who                                          | Shape                                | Primer                    |
| --- | -------------------- | -------------------------------------------- | ------------------------------------ | ------------------------- |
| 1   | `signOff`            | claims kinds                                 | existing; place overlay help         | critical                  |
| 2   | `issuerEntity`       | all venture (`raise`)                        | long                                 | critical                  |
| 3   | `investorReceives`   | place                                        | long                                 | critical                  |
| 4   | `coOwnerDiffers`     | place                                        | radio: `same`, `different`, `unsure` | critical; `CHOICE_BACKED` |
| 5   | `coOwnerLines`       | place; `Reveal` on 4 `equals different`      | long                                 | critical; `REVEAL_GATED`  |
| 6   | `jurisdictions`      | all venture                                  | long                                 | critical                  |
| 7   | `cantSay`            | claims kinds                                 | existing                             | critical                  |
| 8   | `returnWording`      | all venture                                  | radio: `none`, `approved`, `unsure`  | critical; `CHOICE_BACKED` |
| 9   | `returnWordingQuote` | all venture; `Reveal` on 8 `equals approved` | long                                 | critical; `REVEAL_GATED`  |
| 10  | `perks`              | place                                        | long                                 | critical                  |
| 11  | `requiredWording`    | claims kinds                                 | existing; place overlay help         | critical                  |

Nothing is preselected. An unanswered `returnWording` prints as "not answered", and the build treats it as `none` (D-VEN-10).

**Invest card** (`ask-entry.tsx`): on a card whose `ask = invest`, for all venture, there are three `EntryRow`s. `currency` (text) and `sameMinimum` (radio: `yes`, `no`, `unsure`) go after "The number". `eligibility` (text) goes after "Show it on the site?". These are entry keys, outside the primer inventory. The registry supplies the `raise` test as a prop; the component never compares the kind.

**Site, step 9:** `raiseProgress` (radio: `approved`, `no`, `unsure`), venture-place only, sits inside the existing reveal that opens on `showAvailability in [yes, unsure]`, after `availabilityDetail`. It is critical, `CHOICE_BACKED` and `REVEAL_GATED`. `showAvailability` stays in `NON_CRITICAL` (D-VEN-8).

## States

The base rows are in `overview.md`.

| State             | Key                  | What shows                                                               | What the person can do    | Copy  | Artboard |
| ----------------- | -------------------- | ------------------------------------------------------------------------ | ------------------------- | ----- | -------- |
| plain venture     | `ask-plain`          | the cluster with the venture intro, rows 1, 2, 6, 7, 8, 11               | answer                    | below | `—`      |
| place, unanswered | `ask-place-empty`    | the place intro, every row, no reveal open                               | answer, or "Not sure yet" | below | `—`      |
| co-owner differs  | `ask-coowner`        | row 5 open under row 4                                                   | paste the two lines       | below | `—`      |
| returns approved  | `ask-returns`        | row 9 open under row 8                                                   | paste the wording         | below | `—`      |
| invest card       | `ask-invest-card`    | one open Invest card with the three new rows; an Apply card without them | edit                      | below | `—`      |
| raise progress    | `ask-raise-progress` | Site's availability reveal open, with `raiseProgress` after the detail   | answer                    | below | `—`      |

## Words

By Gloss. `[COPY — pending Taylor]`, venture pack. They never model share wording, and they suggest no investment wording.

- Cluster intro, all venture: 'These questions stop us putting something on your site that isn\'t true. "Not sure" is a fine answer to any of them.'
- Cluster intro, place: 'Your counsel decides what the site may say about the raise. We only collect what they have said, so "not sure" or "counsel pending" is a fine answer to anything here.'
- `signOff` help, place: "Who approves the investor wording in each country, and have they seen the exact page text?"
- `issuerEntity`: "The legal entity investors pay into". Help: "Its exact legal name, the country it is registered in, and its registration number. It goes in the footer and the disclaimer."
- `investorReceives`: "What an investor receives". Help: "Paste your counsel's description. The model page uses their words as written."
- `coOwnerDiffers`: "Is a co-owner the same as an investor here?". Options: "The same", "Different", "Not sure yet".
- `coOwnerLines`: "One line for each, as counsel approved them".
- `jurisdictions`: "Where people may invest from". Help: "The countries, provinces or states that are open, and any that are excluded."
- `returnWording`: "May the site mention returns?". Help: 'Income, appreciation, or lines like "only a few left". Unless counsel approved the exact words, the answer is no.' Options: "No", "Yes, counsel approved the wording", "Not sure yet".
- `returnWordingQuote`: "Paste the approved wording". Help: "Exactly as approved, and who approved it."
- `perks`: "Perks or stays tied to the amount invested". Help: "Exactly as counsel approved them. Leave it empty if there are none."
- `requiredWording` help, place: "Each country's disclaimer, pasted exactly, and who approved it."
- `currency`: "Currency".
- `sameMinimum`: "Is the minimum the same in every country?". Options: "Yes", "No", "Not sure yet".
- `eligibility`: "Who may see the numbers?". Help: "Anyone who asks, people after a call, or only some investors. Say who checks."
- `raiseProgress`: "Has your counsel approved showing how much has been raised?". Help: "Until they have, the site won't show it." Options: "Yes, approved", "No", "Not sure yet".

## Access

By Threshold.

- Radios are `fieldset`s with legends.
- A reveal opens after its trigger in DOM order, focus stays on the trigger, and nothing is announced (the §6.5 reveal law). A closed reveal is removed from the tab order.
- Card rows keep the card's ids: `f-ask-currency-${index}`, `f-ask-sameMinimum-${index}`, `f-ask-eligibility-${index}`.
- Reduced motion: reveals appear without animation.

## Instrumentation

None.

## Criteria

| ID          | When                                                     | Then                                                                                                                                | Evidence |
| ----------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- |
| C-VEN-ask-1 | `ventureType = place`                                    | the cluster shows rows 1–11 in order, with the place intro                                                                          | test     |
| C-VEN-ask-2 | plain venture                                            | rows 1, 2, 6, 7, 8, 11 only, with the all-venture intro; practice, studio, business and other render exactly as today               | test     |
| C-VEN-ask-3 | `coOwnerDiffers` or `returnWording` changes              | its reveal opens only on `different` or `approved`; closing it keeps the stored text                                                | test     |
| C-VEN-ask-4 | an ask card's `ask` is `invest` on a venture             | the three rows render at their positions; on any other ask, or any other kind, they are absent                                      | test     |
| C-VEN-ask-5 | `showAvailability` is `yes` or `unsure` on venture-place | `raiseProgress` renders inside the reveal; `showAvailability` stays in `NON_CRITICAL` and `raiseProgress` is critical               | test     |
| C-VEN-ask-6 | the primer and ingestion inventories                     | every key here is critical; reveal-gated keys and ask-entry keys are never proposed or written                                      | test     |
| C-VEN-ask-7 | the pack's strings for this block                        | none contains return, yield, appreciation or scarcity wording except as the thing being asked about, and no client name (D-PORT-14) | check    |
| C-VEN-ask-8 | each state row                                           | captured at 390, 834 and 1440, light and dark                                                                                       | capture  |
| C-VEN-ask-9 | keyboard and screen reader on `ask-coowner`              | the reveal is reached next in Tab order, and the cluster's intro is read when the region is entered                                 | manual   |

## Decisions and open items

D-VEN-5, 7, 8, 10, 13 (`overview.md`). [REQUIRES LICENSED ATTORNEY] stays with the client's counsel. Nothing blocks.
