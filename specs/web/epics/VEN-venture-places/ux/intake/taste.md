---
target: specs/web/ux/intake/taste.md
status: approved
promoted:
---

# Taste step: venture-place spectrums and tags — intake

## Job

After reacting to example sites, the founder says which way their site leans on five structure questions a designer cannot answer for them. Done means each fork is set, or deliberately left alone, and the picks they reacted to carry six new tags that name what a place site does.

## Layout and components

Step 6 (`step-taste.tsx`) is unchanged in shape. The venture-place set is a `tasteSpectrums` list, the same `TasteSpectrum` type as film's (`showcase-copy.ts` ~1245), all `group: "structure"`.

- **Who sees them:** they render in the existing `SpectrumBlock` under the picks, gated on the first pick (D-PORT-20's argument, kept). They belong to the venture pack's `place` overlay, so plain venture and the other sub-types get no forks, as today.
- **No feel forks:** the ground-tone question and the three words already ask about feel (D-VEN-20).
- **The gallery:** it stays in the `venture` pack, with no new pack value and no migration (brief, piece 6). Until Taylor enters the sites, the step shows the existing absent line and no forks.
- **Storage:** answers go to `taste.spectrums[<id>]` (1.0 to 7.0). Ids are storage and never renamed.
- **Tags:** six `StyleTag` values in `content/intake-examples/types.ts`, with their words in `STYLE_TAGS` (`taxonomy.ts`). They render wherever `tagsFor` renders: example rows, the overlay and the intake document. `GROUP_ORDER` and the groups are unchanged.

| Id (storage)       | Label                             | Low end       | High end        |
| ------------------ | --------------------------------- | ------------- | --------------- |
| `placeOrModel`     | What the home page opens on       | The place     | The model       |
| `nowOrLater`       | Which version they see first      | As it is      | As it will be   |
| `programmeOrPlace` | What the site is organised around | The programme | The place       |
| `whoseVoice`       | Whose voice it's in               | The founder's | The community's |
| `whichDoor`        | Who gets in                       | Open door     | Members' door   |

- `whoseVoice` sits alongside `personVoice` on step 7 and changes nothing there.
- `placeOrModel` is never gated at runtime. Its high end names counsel (D-VEN-21).

## States

The base rows are in `overview.md` (save-error, offline and saved behave as the step does today).

| State         | Key                   | What shows                                                                  | What the person can do   | Copy     | Artboard |
| ------------- | --------------------- | --------------------------------------------------------------------------- | ------------------------ | -------- | -------- |
| gallery empty | `taste-gallery-empty` | the absent line (`TASTE_ABSENT_LINE`), no forks; the rest of the step as is | carry on                 | existing | `—`      |
| no picks yet  | `taste-no-picks`      | the gallery; no fork block                                                  | pick a site              | existing | `—`      |
| picked        | `taste-picked`        | the picks list, then "Which way it leans" with five untouched forks         | drag a fork, or leave it | below    | `—`      |
| answered      | `taste-answered`      | three forks set, two untouched                                              | change or clear          | below    | `—`      |
| plain venture | `taste-plain-venture` | picks with no fork block                                                    | carry on                 | —        | `—`      |
| tagged row    | `taste-tags`          | one example row carrying "Labelled renders" and "Legal footer"              | open, pick               | below    | `—`      |

## Words

By Gloss. `[COPY — pending Taylor]` in the venture pack; the tags are `[COPY — draft]` in `taxonomy.ts`.

**Means lines** (one per end; they carry the whole question):

- `placeOrModel`: low "The land, the buildings and life there. How it's owned sits behind a request." High "How it's owned and funded, up top, if your counsel allows it."
- `nowOrLater`: low "Today's photos lead, unfinished rooms included. Renders sit in a labelled plans section." High "Labelled renders lead, and today's photos show where it stands."
- `programmeOrPlace`: low "Dated retreats and events, with a calendar near the top." High "Rooms, spaces and land. Programmes get a page of their own."
- `whoseVoice`: low "Your portrait and a letter from you on the home page." High "\"We\" throughout, with the members and how it's run."
- `whichDoor`: low "Every page is public, and joining is a form." High "People who've joined get an account area of their own."

**Tags:**

- `booking-bar` "Booking bar"
- `date-cards` "Dated programme cards"
- `stat-counter` "Live counters"
- `render-labelled` "Labelled renders"
- `founder-letter` "Founder's letter"
- `legal-footer` "Legal footer"

## Access

By Threshold. The step is unchanged.

- Each fork is the existing `SpectrumBlock` control: a labelled slider whose value text names the end it leans toward, with arrow and Home/End keys, and clearing as today.
- Tags are text on the row, and they are read with it.
- No new motion.

## Instrumentation

None.

## Criteria

| ID            | When                                                     | Then                                                                                                               | Evidence |
| ------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| C-VEN-taste-1 | venture-place with one pick                              | five forks render in the order above under "Which way it leans", each with its label, two ends and two means lines | test     |
| C-VEN-taste-2 | venture-place with no picks, or an empty venture gallery | no fork block renders; with an empty gallery the absent line shows                                                 | test     |
| C-VEN-taste-3 | plain venture or another sub-type                        | no fork block at any point                                                                                         | test     |
| C-VEN-taste-4 | a fork is set, then cleared                              | `taste.spectrums` holds the id with its value, then loses the key; the five ids match the table exactly            | test     |
| C-VEN-taste-5 | the set's shape                                          | every entry is `group: "structure"`; the pack has no feel forks for venture-place; `personVoice` is unchanged      | check    |
| C-VEN-taste-6 | the taxonomy                                             | the six tags are in `StyleTag` and `STYLE_TAGS` with the words above; the build fails if either is missing a value | check    |
| C-VEN-taste-7 | an example site carries a new tag                        | it renders on the row, in the overlay and in the intake document in `tagsFor` order                                | test     |
| C-VEN-taste-8 | the state rows                                           | captured at 390, 834 and 1440, light and dark, reduced motion                                                      | capture  |
| C-VEN-taste-9 | keyboard only on `taste-picked`                          | each fork is reached in order, moves with the arrow keys, and announces its label and the end it leans toward      | manual   |

## Decisions and open items

D-VEN-20, 21, 22 (`overview.md`). Gallery entry (piece 6, Taylor's admin work) must land before the first venture-place intake is sent, or the forks never appear for that client. Nothing blocks the build.
