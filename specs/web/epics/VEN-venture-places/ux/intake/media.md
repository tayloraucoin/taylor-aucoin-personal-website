---
target: specs/web/ux/intake/media.md
status: approved
promoted:
---

# Media step: image facts, deck slot, image brief — intake

## Job

The founder sends the images and decks, and says what each image really is: a photo of the place, a render, AI or stock, who took it, and who is in it. Anyone on any kind can say what images they would like made. Done means every image on the site can carry an honest label and credit, and the decks are on file without any promise that they will be shown.

## Layout and components

Step 8 (`step-media.tsx`). Venture-place order, top to bottom:

1. The place drop (as is).
2. **Image facts** group, directly under it.
3. Behind the scenes.
4. Videos, with a place help suffix (D-VEN-6).
5. Logos.
6. Logo question, logo file and the logo add-on.
7. Brand assets.
8. **Decks.**
9. Documents.
10. **Image brief** and **reference drop**.
11. Dislikes.

Other kinds get only item 10, in the same position (after documents, or after brand assets where there are no documents). No new primitive: `Field`, `LongAnswer`, `FileDrop`, and a deck composition shaped like `DocumentDrop`.

| Key               | Who (registry)        | Shape                                                                                                            | Primer                                                                  |
| ----------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `photosOfPlace`   | place                 | long                                                                                                             | critical                                                                |
| `rendersAndAi`    | all venture (`raise`) | long                                                                                                             | critical                                                                |
| `renderLabel`     | all venture           | long                                                                                                             | critical                                                                |
| `stockImages`     | all venture           | long                                                                                                             | critical                                                                |
| `imageCredits`    | all venture           | long                                                                                                             | critical                                                                |
| `decks`           | all venture           | `FileDrop`, `stepKey="media"`, `fieldKey="decks"`, `multiple`; Supabase storage through the existing upload path | a file, not in the inventory                                            |
| `imageBrief`      | every kind (base)     | long                                                                                                             | **non-critical**: joins `NON_CRITICAL` (ratified by Taylor, 2026-10-20) |
| `imageReferences` | every kind            | `FileDrop`, `fieldKey="image_references"`, `multiple`                                                            | a file                                                                  |

- Image facts render as a labelled `Field` group with no box (A-10). Each answer may name files by their file names.
- The deck slot and documents both end with the promise line, and `yarn verify:tracks` asserts it on both.
- Venture's documents help drops "a deck" (venture pack override).
- Format never refuses a file; size is the only refusal, as on every drop.

## States

The base rows are in `overview.md`. Upload tiles reuse `FileDrop`'s own statuses.

| State          | Key               | What shows                                                                       | What the person can do | Copy         | Artboard |
| -------------- | ----------------- | -------------------------------------------------------------------------------- | ---------------------- | ------------ | -------- |
| portfolio      | `media-portfolio` | today's step plus the image brief and reference drop                             | answer, add images     | below        | `—`      |
| plain venture  | `media-venture`   | the four all-venture image questions, decks, the image brief; no `photosOfPlace` | answer, upload         | below        | `—`      |
| place, full    | `media-place`     | every block in the order above                                                   | answer, upload         | below        | `—`      |
| deck uploading | `deck-uploading`  | one deck tile mid-progress                                                       | wait, or remove        | `FileDrop`'s | `—`      |
| deck failed    | `deck-failed`     | one tile failed, with its retry                                                  | retry, remove          | `FileDrop`'s | `—`      |
| deck too large | `deck-too-large`  | one tile refused by size, as a sentence                                          | remove                 | `FileDrop`'s | `—`      |
| decks on file  | `deck-done`       | two finished tiles                                                               | add, remove            | —            | `—`      |

## Words

By Gloss. `[COPY — pending Taylor]`. Venture strings go in the venture pack; image-brief strings go in the floor pack (D-VEN-24).

- Image facts group: "About these images".
- `photosOfPlace`: "Which of these are photos of the property, and when were they taken?". Help: "File names are fine. A year is enough."
- `rendersAndAi`: "Which images are renders or AI?". Help: "For each one, say whether it shows this building, a concept or a mood."
- `renderLabel`: "How should renders be labelled?". Help: 'The exact words under each one, and who approved them. For example: "Artist\'s impression, not the current building."'
- `stockImages`: "Which images are stock?". Help: "And may they sit next to the investment ask? If you aren't sure, we keep them apart."
- `imageCredits`: "Credits and consent". Help: "Who took each photo, and whether the people you can recognise in it have agreed."
- Videos help suffix, place: "A walk through the place, or the founder talking to camera, can lead the home page."
- Decks: "Pitch decks". Help: "Every version you have. We read them to understand the thing; nothing from them goes on the site unless you say so." Button: "Add decks".
- Documents help, venture: "A one-pager, floor plans, renders, a menu, a price sheet, a brochure. We read them to understand the thing; nothing from them goes on the site unless you say so."
- `imageBrief`: "Want us to generate images? Brainblurt what you want." (settled). Help: "What they should show, the mood, anything they must never show. Rough is fine, and we'll go through it with you before anything is made." Venture suffix: "Any image we make is labelled as one on your site."
- `imageReferences`: "Images to point at". Help: "Anything that shows the look you mean. These are for us and stay off the site." Button: "Add images".

## Access

By Threshold.

- The image facts group is `role="group"`, labelled by its heading. Every answer has a visible label and linked help.
- The drops keep `FileDrop`'s labelled button, keyboard upload, and its existing per-tile status announcements.
- Ids: `f-decks`, `f-imageBrief`, `f-imageReferences`, `f-<key>` for the rest.
- No reveal and no motion beyond `FileDrop`'s existing progress, which follows its reduced-motion rule.

## Instrumentation

None. File names and answers never leave the answers document and storage.

## Criteria

| ID            | When                                         | Then                                                                                                                                   | Evidence |
| ------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| C-VEN-media-1 | venture-place                                | the blocks render in the order above                                                                                                   | test     |
| C-VEN-media-2 | plain venture                                | the four all-venture image questions and decks render; `photosOfPlace` does not                                                        | test     |
| C-VEN-media-3 | portfolio, practice, studio, business, other | only the image brief and reference drop are new; the rest is today's step                                                              | test     |
| C-VEN-media-4 | a deck is dropped                            | it uploads to Supabase storage under `media/decks` through the existing path, and the intake document lists decks apart from documents | test     |
| C-VEN-media-5 | the copy packs                               | the deck help and documents help both end with the promise line; `verify:tracks` asserts both                                          | check    |
| C-VEN-media-6 | the primer inventory                         | `imageBrief` is non-critical; the five image-fact keys are critical; `photosOfPlace` is gated on `place` and the other four on `raise` | test     |
| C-VEN-media-7 | `asksPortrait` and `asksVideo` for venture   | both still false; the place drop and the tools question still render                                                                   | test     |
| C-VEN-media-8 | the state rows                               | captured at 390, 834 and 1440, light and dark                                                                                          | capture  |
| C-VEN-media-9 | keyboard only                                | each drop opens its file picker from the keyboard, and the image-facts group is announced by name on entry                             | manual   |

## Decisions and open items

D-VEN-6, 11, 18, 19, 24 (`overview.md`). Nothing blocks.
