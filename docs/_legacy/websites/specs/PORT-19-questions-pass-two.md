# PORT-19 — Questions pass two (Taylor's 2026-09-03 review)

**Status:** Complete (2026-09-03)
**Size:** L
**Depends on:** PORT-14, PORT-15, PORT-18 (slice 1)

## Why

Taylor read the whole coded flow at `/admin/intake/questions` and came back with
thirteen notes. They are not a redesign: eleven are copy or shape corrections to
questions that already ship, and two are new machinery — multiple videos per
project, and a home-page shortlist built from what the client has already given
us.

The notes are the source. Where one of them contradicts
`portfolio-intake-questions-v2.md`, **the note wins and the v2 line is
superseded** — a `(v2)` marker on a superseded string becomes
`[COPY — pending Taylor]`, and the divergence is logged in `DEVIATIONS.md`.

## Not in this ticket

- **Taste.** Taylor is handling step 6 in a separate thread. Nothing here
  touches `step-taste.tsx`, `favourites-rank.tsx`, or the example sets.
- **The voice memo.** Note 8 asks for browser recording plus transcription
  instead of "record on your phone and upload". Taylor asked for it to be
  scoped and handed to a fresh thread rather than built here. The primer is
  `docs/websites/VOICE-NOTE-TRANSCRIPTION-PRIMER.md`; `voiceNotePrompt` and the
  `voice_note` drop are untouched by this ticket.
- **Copy the notes did not name.** Everything else ships verbatim as it stands.

## The thirteen

### 1 · `lookingFor` reads as a vague opener

Step 2's braindump asks "What do you actually want out of this?", which reads
as a question about life rather than about the site. Rewrite the label and help
so it is unmistakably about *this build*: new site or rebuild, what the current
one fails at, what has to be true for the money to have been worth it.

`[COPY — pending Taylor]` already; no new marker needed.

### 2 · `whatShouldTheyDo` is really the CTA question

Step 3's "What should they do next?" is asking what action the client wants a
visitor to take. Say that directly — this is the site's calls to action, per
kind of visitor.

### 3 · Multiple videos per project

One `watchUrl` per project is wrong for a filmmaker. A project gets a
**repeatable video list**: link, a one-line "what it is", the share password if
the link has one, and an optional **primary** tick.

- **At most one primary across a project's videos.** Ticking a second untick
  the first; unticking is allowed, and no primary is a legal state.
- The old `watchUrl` / `linkPassword` fields **stay in `projectEntrySchema`**
  and stop being rendered (D-PORT-11's law at field scale). A project that has
  a legacy `watchUrl` and no `videos` reads as one video, derived — one home
  for that derivation, `lib/intake/project-videos.ts`, used by the card, the
  home shortlist, and the output document alike.

### 4 · Save and close inside a project

A project card gets a **Save and close** control at the bottom of the box:
flush the form, collapse the card. The card already collapses to a summary row
once it has a title; this makes the collapse reachable at the end of the box
rather than only at the top, and makes it work for an untitled entry (the row
renders `Untitled project`).

Collapsing stays presentation and nothing else (D-PORT-6) — the button flushes
the same autosave every other field flushes on blur. There is no separate
"submit" and nothing new reaches the database because of it.

### 5 · The reel question is replaced by a home-page block

Drop the "Which piece is the reel?" question. In its place, on **step 9, The
site itself**, a block asking what should be on the home page:

- a raw braindump textarea;
- their **media collection** — every file they have uploaded, by name, with a
  tick;
- their **video collection** — every video from every project, plus any video
  added on step 8 (note 6), rendered as a YouTube or Vimeo embed, with a tick.

Framed as a shortlist, not a promise: what gets used is a design decision, and
the copy says so.

`reelLabel` / `reelHelp` stay in the copy pack unrendered until Taylor's pass
decides whether to delete them; `reel` stays in `stepWorkSchema` so a stored
answer is not stripped. The output document's "nothing to lead with" flag stops
consulting `reel` and reads placement plus the primary video instead.

### 6 · Videos on the Media step too

The video collection is not only projects': a client may have a showreel, a
teaser, or a talk that belongs to no project. Step 8 (Media) gets its own
repeatable video list — link and a one-line "what it is". No primary here;
primary is a per-project idea.

### 7 · `topFive` becomes a selection, not a paragraph

"If you could only show five" stops being a textarea. Render the project rows
and let the client pick five, in order — the order is the rank, the same law
the taste favourites live under. Selecting is capped at five; the sixth tick is
refused with a line saying why, never silently.

New key `topFivePicks` (an ordered array of project entry keys). `topFive`
stays in the schema, unrendered, so a stored paragraph survives.

Only for kinds that fill `projects`, exactly as the old question was.

### 8 · The voice memo — scoped elsewhere

See **Not in this ticket**.

### 9 · `comeAcross` is a single line

"Three words, or one sentence" is not a paragraph. The textarea becomes a text
input. The Predict-with-AI button, its two suggestion cards, and every state
line are unchanged.

### 10 · The logo option that says "hate"

`{ value: "hate", label: "Have one, but I hate it" }` — the value is storage
and does not move; the label loses the word. It becomes "Have one, but I want a
new one".

### 11 · The pages checklist needs a count and a caveat

The "Pages you're imagining" group shows **`n/allowance`** as it is ticked —
five included plus whatever was bought at checkout. The over-count note already
exists and stays. Add a standing note, shown whether or not they are over, that
we read this as input rather than instruction: if a different set of pages
serves them better we will say so, having read everything.

### 12 · Availability needs a follow-up

"Should the site say whether you're available?" gets a text input under it for
the detail — what it should say, and when it stops being true. Revealed by
"yes" and "unsure", the same way every other follow-up on this form reveals.

### 13 · "Where does your video live?" goes

We already collect video links on the project cards and on Media, and their
domains say where the video lives. Delete the question and its "Somewhere
else?" partner from step 10. `videoHosts` / `videoHostsOther` stay in
`stepAccessSchema` and keep their labels, so stored answers still print.

The kinds that saw the tools group instead keep seeing it, unchanged. Nothing
takes the deleted question's place for a portfolio or a studio — widening the
tools group to them is a scope decision this ticket has no authority to make.

## Files

| Path | What |
|---|---|
| `lib/validators/showcase-intake.ts` | `projectVideoSchema`, `mediaVideoSchema`, `videos` on project and media, `topFivePicks`, `availabilityDetail`, `homeBrainDump` / `homeMedia` / `homeVideos` |
| `lib/intake/project-videos.ts` | **New.** The legacy-`watchUrl` derivation, and the embed-URL parse for YouTube / Vimeo |
| `lib/intake/showcase-answer-labels.ts` | Labels for every new key |
| `lib/intake/showcase-copy.ts` | Pack strings the notes touched |
| `app/websites/coded/intake/_components/project-entry.tsx` | Video list, Save and close |
| `app/websites/coded/intake/_components/video-list.tsx` | **New.** The repeatable video block, with and without `primary` |
| `app/websites/coded/intake/_components/home-shortlist.tsx` | **New.** Note 5's block |
| `app/websites/coded/intake/_components/top-five.tsx` | **New.** Note 7's ordered picker |
| `app/websites/coded/intake/_components/steps/step-*.tsx` | about · audience · work · media · site · access |
| `app/websites/coded/intake/[token]/[step]/page.tsx` | Step 9 now reads work + media answers and the upload list |
| `server/services/output.ts` | Videos per project, the media videos, the home block, the lead-with flag |

## Acceptance criteria

1. A project holds any number of videos; each has a link, a what-it-is line, a
   password slot, and a primary tick, and at most one is primary.
2. A project with a stored `watchUrl` and no `videos` renders one video row
   carrying that link and its password, in the card and in the document.
3. Save and close flushes and collapses, including for an untitled project.
4. The reel question renders nowhere; a stored `reel` still prints in the
   document.
5. Step 9 carries the home block: braindump, tickable media by name, tickable
   videos as embeds. Every video from every project and from Media appears.
6. Media carries its own video list.
7. "If you could only show five" is an ordered five-pick over the project rows,
   refusing a sixth with a visible line; a stored `topFive` paragraph still
   prints.
8. `comeAcross` is an `<input>`.
9. No option label on this track contains the word "hate".
10. The pages group prints `n/allowance` and the input-not-instruction note.
11. Availability's follow-up input reveals on yes and unsure.
12. "Where does your video live?" renders nowhere; a stored `videoHosts` still
    prints.
13. `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` clean; the durable
    track at `/websites/intake` behaviourally unchanged.

## Questions

None outstanding. The two forks Taylor settled on 2026-09-03: the home block
lives on **The site itself**, and the what-it-is line is collected **on the
video itself**, in the project card and on Media both.
