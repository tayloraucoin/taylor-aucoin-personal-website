---
target: specs/web/ux/intake/kind-picker.md
status: approved
promoted:
---

# Kind picker and venture sub-type — intake

## Job

The founder says what kind of venture this is in one tap, so the rest of the form asks the right questions. Done means one value is stored, or none, which leaves the questionnaire as plain venture.

## Layout and components

- **Start form** (`showcase-start-form.tsx`): directly below the `siteKind` `ChoiceGroup`, revealed in place when `siteKind = venture`, there is one more `ChoiceGroup` named `ventureType`, which reaches the action as a hidden input like `siteKind` does. The submit button stays the one primary action.
- **About** (`step-about.tsx`): the same question as a `ChoiceAnswer` named `ventureType`, under the open kind picker (`f-siteKind`), above `kindChangeLine`. It shows only while the stored kind is venture.
- Nothing new is built. The six options come from the registry and the pack, never from a literal in a component.

| Key                 | Values (order)                                         | Registry home                                                        | Primer                                                    |
| ------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------- |
| `about.ventureType` | `place`, `company`, `fund`, `cause`, `launch`, `other` | `VENTURE_TYPES` in `showcase-kinds.ts`; `kindFor`'s sibling reads it | `CHOICE_BACKED`; critical by default, never proposed into |

The form neither requires nor validates `ventureType`. A stored value outside the list reads as absent, as `kindFor` already treats an unknown kind.

## States

The base rows are in `overview.md` (the start form is not autosaved: its own pending and email-error states stay as they are).

| State             | Key               | What shows                                                                       | What the person can do                                                       | Copy                   | Artboard |
| ----------------- | ----------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------- | -------- |
| another kind      | `kind-other`      | no sub-type question                                                             | carry on                                                                     | —                      | `—`      |
| venture, unpicked | `venture-chosen`  | the sub-type group under the kind group, nothing selected                        | pick one or skip                                                             | below                  | `—`      |
| place picked      | `place-chosen`    | the group with "A place or community" selected                                   | carry on                                                                     | below                  | `—`      |
| changed on About  | `subtype-changed` | About's picker open, `company` selected after `place`, `kindChangeLine` under it | carry on; place blocks on later steps are absent, and their answers are kept | `kindChangeLine` as is | `—`      |

## Words

By Gloss. All `[COPY — pending Taylor]`, in the venture pack.

- Label: "What kind of venture is it?"
- Help: "Pick the closest one. If nothing fits, the questions stay general."
- Options:
  - `place` "A place or community: a property, a retreat centre, an ecovillage"
  - `company` "A company or startup"
  - `fund` "A fund"
  - `cause` "A cause or nonprofit"
  - `launch` "A product launch"
  - `other` "Something else"

## Access

By Threshold.

- `fieldset` with the legend "What kind of venture is it?". It follows the kind group in DOM order, so Tab moves from the kind group to this group, then on to the next field.
- Arrow keys move within the group, as `ChoiceGroup` does today. Every option is a native radio with a visible label and a 44px row.
- On reveal, focus stays on the chosen kind radio. No live region is needed: the group appears after the focused control, in reading order (the §6.5 reveal law).
- Reduced motion: the reveal appears without animation.

## Instrumentation

No new events. The intake records only the server-side step it reached. No answer leaves the answers document.

## Criteria

| ID           | When                                                                                | Then                                                                                                                       | Evidence |
| ------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| C-VEN-kind-1 | "A venture or project" is chosen on the start form                                  | the sub-type group appears directly below it with the six options in the order above; for any other kind it is absent      | test     |
| C-VEN-kind-2 | the start form is submitted with `place`                                            | the engagement stores `about.ventureType = "place"`; with nothing chosen the key is absent                                 | test     |
| C-VEN-kind-3 | a venture with no sub-type, or with `company`, `fund`, `cause`, `launch` or `other` | every step renders exactly today's venture pack and fields                                                                 | test     |
| C-VEN-kind-4 | About's picker changes `place` to `company`                                         | place-only blocks are absent on later steps; the stored place answers are untouched and still print in the intake document | test     |
| C-VEN-kind-5 | the sub-type options render                                                         | labels and values come from the registry and the pack; neither component holds a literal                                   | check    |
| C-VEN-kind-6 | `venture-chosen`, `place-chosen`, `subtype-changed`                                 | captured at 390, 834 and 1440, light and dark, reduced motion                                                              | capture  |
| C-VEN-kind-7 | keyboard only                                                                       | Tab reaches the sub-type group straight after the kind group; arrows change the choice; focus never jumps on reveal        | manual   |
| C-VEN-kind-8 | the admin preview with `kind=venture&subtype=place`                                 | every venture-place block on every step renders, tagged by the kinds and sub-type that meet it in the "Every kind" scope   | test     |

## Decisions and open items

D-VEN-2, D-VEN-3, D-VEN-4 (`overview.md`). The sub-type mechanism and the `ForKinds` signature are Mason's call. Nothing here blocks.
