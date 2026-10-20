---
target: specs/web/ux/intake/venture-place.md
status: approved
promoted:
---

# Venture-place questions: property, phases, applying, rewording — intake

The investor ask is in `investor-ask.md`; the image facts are in `media.md`.

## Job

The founder tells us what the place is today: who holds it, where it is, what stands and what is planned, and how people join. Done means the place page, the home page's lead and phases, and the apply page each have their facts quoted or marked "Not sure yet".

## Layout and components

Every block below is venture-place only (registry group `place`), built from existing pieces: `ChoiceAnswer`, `TextAnswer`, `LongAnswer`, `EntryRow`, `Field`. No new primary action; the step's own continue stays primary.

| Key                 | Step, position                         | Shape                                                                      | Primer                            |
| ------------------- | -------------------------------------- | -------------------------------------------------------------------------- | --------------------------------- |
| `propertyStatus`    | About, after `stageDetail`             | radio: `owned`, `underContract`, `option`, `leased`, `searching`, `unsure` | critical; `CHOICE_BACKED`         |
| `propertyTitle`     | About, after `propertyStatus`          | text                                                                       | critical                          |
| `locationPrecision` | About, after `basedIn`                 | radio: `region`, `province`, `town`, `address`, `pin`, `unsure`            | critical; `CHOICE_BACKED`         |
| `locationWhy`       | About, after `locationPrecision`       | text                                                                       | critical                          |
| `visitsNow`         | About, after `locationWhy`             | long                                                                       | critical                          |
| `pieces[].funded`   | Work, piece card, after "When"         | `EntryRow` radio: `funded`, `partly`, `notYet`, `unsure`                   | outside the inventory (entry key) |
| `placeSize`         | Work, after the pieces block           | long                                                                       | critical                          |
| `permits`           | Work, after `placeSize`                | long                                                                       | critical                          |
| `apply*` ×4         | Work, "Applying" group, after the asks | long                                                                       | critical                          |

`apply*` is `applyWho`, `applyAfter`, `applyFee`, `applyQuestions`; the group sits before the event section. The registry home for every row is group `place` (`showcase-kinds.ts`), and every primer key is in `KIND_GATED` on it. No reveals here.

**Rewording overlay** (venture-place only; option `value`s never change): the strings under Words › Overlay. New audience options follow `residents`, new asks precede `contact`, new pages follow `apply`.

## States

The base rows are in `overview.md`.

| State             | Key               | What shows                                                                                     | What the person can do | Copy    | Artboard |
| ----------------- | ----------------- | ---------------------------------------------------------------------------------------------- | ---------------------- | ------- | -------- |
| plain venture     | `plain-venture`   | none of these blocks; today's venture labels                                                   | carry on               | today's | `—`      |
| place, unanswered | `place-empty`     | the blocks in place, unanswered; Applying shows its skip line                                  | answer or skip         | below   | `—`      |
| place, filled     | `place-filled`    | every field answered with fixture text; one piece card set to "Partly funded"                  | edit                   | below   | `—`      |
| still searching   | `place-searching` | `propertyStatus = searching`; `propertyTitle` keeps its label (the answer may be "nobody yet") | carry on               | below   | `—`      |

## Words

By Gloss. `[COPY — pending Taylor]`, venture pack, `place` overlay.

**About**

- `propertyStatus`: "Where things stand with the property". Help: "Every page that mentions the place depends on this." Options: "Owned", "Under contract", "Under option", "Leased", "Still searching", "Not sure yet".
- `propertyTitle`: "Who holds title, and since when?". Help: "A person, a company or a co-op. A year is plenty."
- `locationPrecision`: "How exactly should the site say where it is?". Help: "Some places show a pin. Others name the region until a purchase closes." Options: "The region", "The province", "The town", "The full address", "A map pin", "Not sure yet".
- `locationWhy`: "Why that level?". Help: "A sale that hasn't closed, or privacy for people living there. Whatever the reason is."
- `visitsNow`: "Can people visit now?". Help: "If they can, say who arranges it. This becomes the visit button, if there is one."
- `rosterLead` help suffix: "Their headshot is the founder portrait on the site."

**Work**

- Piece card placeholder: "A building, a phase, the land, a programme".
- `funded`: "Is it funded?". Options: "Funded", "Partly", "Not yet", "Not sure yet".
- `placeSize`: "Size and capacity". Help: "Land, buildings, rooms and beds. Say what is there now and what each phase adds."
- `permits`: "Permits". Help: "Which you need, which are granted and which are pending, with dates where you have them. The site mentions them only as your counsel allows."
- Applying group: "Applying". Help: "Skip this if nobody applies."
  - `applyWho`: "Who can apply, and for what?"
  - `applyAfter`: "What happens after someone applies?". Help: "The steps, and how soon they hear back."
  - `applyFee`: "Is there a fee or a deposit?". Help: "How much, and when it is refunded. If there isn't one, say so."
  - `applyQuestions`: "Your current application questions". Help: "Paste them as they are."

**Overlay**

- Representation help: "Counsel, a local partner, a licensed professional (say which licence), an investor-relations contact. Who they are, and whether enquiries go through them."
- Audiences: `residents` "Residents"; `members` "Members of the community (not newsletter readers)"; `guests` "Guests"; `coOwners` "Co-owners, if they aren't the same as investors"; `facilitators` "Retreat leaders or facilitators".
- Asks: `reserve` "Reserve a stay"; `hire` "Hire the venue"; `register` "Register for an event".
- Pages: `offering` "The model"; `stays` "Stays, retreats or venue hire"; `events` "Events".

**All venture** (D-VEN-13): `nameHelp` ends "If the legal name is different, step 5 asks for it."

## Access

By Threshold.

- Each radio set is a `fieldset` whose legend is its label.
- The piece card's new row gets id `f-piece-funded-${index}`, legend "Is it funded?", in DOM order after "When".
- The Applying group is a labelled group (`role="group"`, `aria-labelledby` its heading), and its help is linked with `aria-describedby`.
- Every field has a visible label (A-16), and its help is linked through `Field`.
- No reveal, no live region, no motion.
- Contrast and targets are inherited from the existing inputs, unchanged.

## Instrumentation

No new events (see `kind-picker.md`).

## Criteria

| ID            | When                                            | Then                                                                                                                               | Evidence |
| ------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- |
| C-VEN-place-1 | `ventureType = place`                           | each key in the table renders at its stated position, with the stated options in order, each critical choice ending "Not sure yet" | test     |
| C-VEN-place-2 | plain venture or another sub-type               | none of these keys renders, and every venture label reads as today                                                                 | test     |
| C-VEN-place-3 | the registry and the primer                     | each new key is registered once in group `place` and once in the primer maps above; no component compares `ventureType` inline     | check    |
| C-VEN-place-4 | the ingestion run for plain venture             | none of these keys is proposed or written                                                                                          | test     |
| C-VEN-place-5 | the overlay                                     | option values `offering`, `residents`, `members` are unchanged; only labels differ, and only for venture-place                     | test     |
| C-VEN-place-6 | the intake document for `place-filled`          | it prints every answer under its label, and the piece's funded status beside the piece                                             | test     |
| C-VEN-place-7 | `place-empty`, `place-filled` on About and Work | captured at 390, 834 and 1440, light and dark                                                                                      | capture  |
| C-VEN-place-8 | keyboard only through About and Work            | every new control is reached in visual order, and each legend is announced                                                         | manual   |

## Decisions and open items

D-VEN-6, 9, 10, 12, 13 (`overview.md`). Cut order: Applying first. Nothing blocks.
