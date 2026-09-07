# Coded intake — taste spectrums (the sliders)

**Owner:** Vesper (design) · **Build owner:** Mason
**Status:** built 2026-09-07 (D-PORT-29). Nine forks — the five in §4, the four in §11.
**Scope:** the portfolio **film** pack only. Every other pack renders nothing.

---

## 1. The problem

The taste step reads a client's picks and turns them into a brief. Picks are a
*revealed* preference — strong, cheap, honest — but they are bounded by what we
happened to show, and they cannot separate two different sentences a client
means by the same click:

- "I like how that looks" versus "that is what my site should **do**."
- "That image is beautiful" versus "spend that budget."

Five sliders do not replace picks. They take the client who has just reacted to
real sites and ask them to say which way their own site leans on the forks the
gallery's tags cannot carry.

## 2. Where this sits against D-PORT-20

D-PORT-20 retired ground tone, stillness, and density as questions because a
tagged pick answers them with more nuance than a cold radio. **That finding
holds and nothing here reverses it.** None of the five spectrums below is one of
those three, and the block is deliberately built so it can never be asked cold:

> **The block does not render until the client has made at least one pick.**

Same law as `YourPicks`. That gate is the whole argument. The retired radios were
asked *before* anyone had looked at anything; these are asked with the client's
own shortlist sitting directly above them, phrased as forks between things they
have just seen. A cold ground-tone radio and a warm structural fork are not the
same instrument wearing different clothes.

The one that needs Taylor's eye is **§4.2**, which is adjacent to the retired
`density`. It is reframed away from *amount on screen* toward *who authors the
path*, which is a different question with a different build consequence — but
the adjacency is real and is flagged rather than argued away.

## 3. What was looked at

Roughly **32 of the 85 seed sites were loaded live** on 2026-09-07, chosen to
span every group, every `build` level, and both ends of each stored axis.
Not all 85 — the sample is honest about its size, and the five forks below are
the dimensions that separated the sites I did open. Findings on the seed data
itself are in §8.

## 4. The five spectrums

Five stops each, not seven. Seven implies a precision nobody holds on a bipolar
axis — the same reasoning that retired the drag-rank. **Five gives a true
centre, and the centre is a real answer**, named in words so it never reads as a
shrug.

All copy below is `[COPY — draft]` and needs Taylor's human-hand pass.

### 4.1 `meetFirst` — Who they meet first

**The work ←→ You**

| | |
|---|---|
| 1 | The work, and only the work |
| 2 | The work, with your name on it |
| 3 | Both at once |
| 4 | You, with the work right behind |
| 5 | You — name, role, what you do |

**Seen at the ends.** Ligthelm opens on a full-screen still with a mark and no
name at all; Nabil is a name over a landscape and three nav words; Tim Flower is
ten numbered titles with no bio anywhere. Against that: Steven Olver leads with
"HELLO, I'M STEVEN", Jordyn Dunseath with "THIS IS ME, JORDYN", Dave Moppert
with "Hi. I'm Dave… Book a call", and Samuel Warnants with four paragraphs of
first-person biography before a single frame.

**What it decides.** The top third of the home page, and whether there is a hero
reel at all. Nothing else on the form asks this as a comparable value —
`homeBrainDump` on step 9 asks it as prose, which is not the same artefact.

### 4.2 `wayThrough` — How they get through it

**They roam ←→ You lead** *(needs Taylor's ruling — see §7)*

| | |
|---|---|
| 1 | A wall of work. They pick. |
| 2 | Mostly a wall, with a way in |
| 3 | Some of both |
| 4 | Mostly a route, with room to wander |
| 5 | One piece at a time, in your order |

**Seen at the ends.** Matias Boucard, Julia Rossetti, Maurine Pagani and Maggie
Whitaker all arrive as a full shelf — every tile visible, the visitor chooses.
Myrthe Mosterman, Rob Chiu, Bryan Cooper and Ligthelm arrive as one piece
filling the window, and you move to see the next.

**Why this is not the retired `density`.** `density` asked *how much is on
screen*; this asks *who owns the order*. Pagani is tagged `sparse` (four to six
pieces) and arrives as a packed edge-to-edge wall; Mosterman is tagged `sparse`
and arrives as one image. The stored tag does not predict which of those two a
client is looking at, which is exactly why the tag cannot answer this.

**What it decides.** Grid system versus sequence; whether filters get built at
all; what the mobile fallback is.

**Adjacency to declare:** step 8's `organization` ("How should the work be
organized?") is about *taxonomy* — by role, by type, one curated grid. This is
about *movement*. They are close enough that if Taylor wants four sliders, this
is the one I would cut.

### 4.3 `aroundTheWork` — What sits around each piece

**Just the piece ←→ The whole story**

| | |
|---|---|
| 1 | A title. That's it. |
| 2 | Title, year, maybe a client |
| 3 | The credits that matter |
| 4 | Credits and a few lines |
| 5 | The full story — credits, festivals, what you did |

**Seen at the ends.** Tim Flower gives titles and nothing else — no client, no
credit, no year. Ligthelm gives less. Against that: Jacob McKee prints client,
director and a broadcast-style runtime under every entry; Andrea Geremia stacks
dense credits beside before/after wipes and a page of tools he wrote; Warnants
lists festivals and selections in prose; Kanin Howell offers two downloadable
résumés and a phone number; Catherine Goldschmidt curates press pull-quotes.

**What it decides.** The project-page template, and — this is the expensive part
— how much writing the engagement has to collect or produce.

### 4.4 `whereTheLookLives` — Where the personality lives

**In the work ←→ In the site**

| | |
|---|---|
| 1 | The site disappears. Your frames are the whole look. |
| 2 | Quiet, with one thing of its own |
| 3 | Even |
| 4 | The site has a look you'd notice |
| 5 | The site is a piece of work too |

**Seen at the ends.** Boucard is a white page with invisible chrome where every
scrap of colour comes from the film frames; Nick Sanders keeps the chrome grey
so the thumbnails are the only colour; Christopher Mably gets out of the way
entirely. Against that: Kirill Groshev is orange monospace on black; Filipe
Correia Dos Santos sets his own name at the full width of the window; Duran
Levinson runs neon pink; Tao Tajima's liquid transition *is* the brand; Johnny
Harris is paper collage.

**What it decides.** This is the ambition lever, and it is the one the picks
genuinely cannot supply. It maps onto the `build` value already stored on every
seed row and deliberately never shown to a client (`template` / `designer` /
`custom`). A client can favourite Tao Tajima meaning "nice image"; this is where
they say whether they meant "spend that."

**Recommendation: if only one slider ships, ship this one.**

### 4.5 `whatCarriesIt` — What carries the work

**Frames ←→ Footage**

| | |
|---|---|
| 1 | Stills. Video if they go looking. |
| 2 | Mostly stills |
| 3 | Both |
| 4 | Mostly moving |
| 5 | It's moving the second they land |

**Seen at the ends.** Malte Rosenfeld, Ariel Méthot, Alexandros Maragos and
every costume designer in the set run on frames and lightboxes. Rossetti,
Boucard's hover previews, Ligthelm and Rob Chiu are moving on arrival.

**What it decides.** Whether a hover-preview layer gets built; video hosting and
compression; the LCP strategy (invariant 8). Both research libraries name this
as the single biggest lever on whether a thin body of work looks empty — and it
is a *choice*, not a constraint: Rosenfeld has plenty of footage and leads on
frames anyway.

## 5. What was considered and cut

- **Portfolio ←→ business** (Chris Hau's storefront, Johnny Harris's newsletter
  and "Join the team", RM Wedding's testimonial ladder, Moppert's "Book a call").
  The largest single divergence in the whole set — and already answered by step
  8's `offerings` / `asks` and step 9's pages and CTA questions. Asking it here
  would be a duplicate wearing a new control.
- **Warm ←→ cool**, **serif ←→ sans**, **quiet ←→ loud.** Decoration, already
  carried by `styles` and the retired axes. Asking these cold is precisely the
  thing D-PORT-20 found worthless.
- **Classic ←→ experimental.** Collapses into §4.4 without adding anything.

## 6. Interaction spec

**Placement.** Directly below `YourPicks`, above the three-words field. Rendered
only when `picks.length > 0` **and** the pack defines a slider set. No picks, or
no set, and the block is absent — never an empty instrument (D-PORT-12's law).

**One block, not five fields.** A single `fieldset` with one `legend`, one intro
line, five rows. Five separate `Field`s would read as five new questions on a
step that just removed five; five rows of one control read as one instrument.

**Eyebrow / intro** `[COPY — draft]`:
> WHICH WAY IT LEANS
> Five forks. Drag toward whichever end sounds more like your site. The middle
> is a real answer, and so is leaving one alone.

**No default.** Same law as `PickScale`. A bipolar track has no spare "off"
stop, so: the input's value is **held at the centre while unset**, the thumb is
**not rendered**, the track is drawn at `--color-faint`, and the readout is an
em dash. The first `change` from any input method commits — a click commits the
clicked stop, and a keyboard arrow from unset commits centre ± 1, which is
honest ("they moved it right of centre") rather than silently recording a hard
end.

**Clearing.** A `Clear` text button appears in the row only once a value is set.
One affordance for "no answer"; no "not sure" stop, because a stop that means
nothing and an unanswered slider are two ways to say the same thing.

**Readout is words, not numerals.** `3 / 5` on a bipolar axis invites "what is
the right score". The stop's own phrase is the readout, in `--color-c2` when
set and `--color-dim` when not.

**State matrix.**

| State | Treatment |
|---|---|
| Unset | No thumb; track `--color-faint`; readout `—`; no Clear |
| Hover (track) | Track lifts to `--color-dim`; the field's cursor-glow fade applies (invariant 2) |
| Focus-visible | System focus ring on the input; never removed |
| Set | Thumb visible; fill from the nearer end to the thumb; readout in `--color-c2`; Clear present |
| Disabled | Not used — nothing on this form disables |
| Reduced motion | No transition on fill or thumb; value changes are instant |
| Document mode | `DocTag` "Slider · 5 stops, unset until moved" + `DocHint` naming both ends |

**Accessibility.** `aria-valuetext` is the stop's phrase, never the number —
a screen-reader user hearing "3" on a bipolar axis learns nothing. `aria-valuemin`/
`max` stay numeric for the platform. Each row's `<label>` names the fork; the
`legend` names the block. Thumb 20px reusing `.taste-scale`; the row carries
44px of vertical hit area. Text scales to 200% without the five stop phrases
clipping — they wrap, they do not truncate.

**Nothing here out-dresses Continue.** No ring, no gradient, no lift, no count,
no meter, no colour that escalates. Skipping all five costs nothing and is
never mentioned again.

## 7. For Taylor to rule

1. **The block at all** — it adds five answers to a step that deliberately shed
   five. My argument is §2: the pick-gate makes them a different instrument.
2. **§4.2 `wayThrough`** — closest to the retired `density`. Reframed to
   authorship of the path; ruling needed on whether the reframe is real or
   whether D-PORT-20 should simply hold and this one drops.
3. **Five or four.** If four, cut §4.2. If one, keep §4.4.
4. **All copy in §4 and §6** is `[COPY — draft]`.

**Proposed decision ID on ruling: D-PORT-29.**

## 8. Findings on the seed data (unrelated to the sliders, worth acting on)

Loading the sites turned up drift the gallery should know about. `checkedOn` and
`STALE_CHECK_DAYS` exist for exactly this.

**Dead links (404 today):**
- `lorrainekhamali.format.com/zigzag` — Format 404
- `duranlevinson.com/hello/musicvideo` — Format 404

**Rebuilt since the research; stored axes now wrong:**
- **Aaron Allsop** — seed says `light · still · sparse · serif`. It is now an
  orange pitch-led page with "Creative storytelling / from concept through
  creation" and a VIEW REEL button. Not the text-first minimal reference any more.
- **Jacob McKee** — seed says `light`; the site is now black.
- **Matias Boucard** — seed says `dark`; the site is now white.
- **Christopher Mably** — seed says `dark`; the site is now white.
- **Neels Castillon** — seed says `dark`; the site is now a white stills grid.

Four of the five are ground flips, which matters more than usual: ground is the
axis the scope itself called "the one clients feel most strongly about."

**Dead copy:** `darkOrLightHelp` in `lib/intake/showcase-copy.ts` has no
consumer — the question it belongs to was retired by D-PORT-20. It is carried
per-flavour in the `CopyPack` contract, so every pack pays for it.

---

## 9. Handoff to Mason — the shapes the UX needs

Stated once so the tickets do not rediscover them.

- Five spectrums, five stops each (1–5), unset by default, per-flavour, film only.
- The block is absent unless `picks.length > 0` **and** the pack defines a set.
- The document must print words, not ids and integers.
- Retiring or renaming a spectrum later must not erase an answer already given.

## 10. Implementation plan — Mason

**Verdict: buildable as specified, one architectural correction to §9.**

### 10.1 The correction: one answer key, not five

The obvious shape — `meetFirst`, `wayThrough`, … as five top-level keys on
`stepTasteSchema` — is wrong, and the reason is a seam that already exists.
`collectUnanswered` and `answerTally` in `server/services/output.ts` derive
"questions still to cover" from *schema keys*. Five new keys means five new
"we'll cover these on the call" lines on the done screen for any client who
skips the block — which is precisely the failure `RETIRED_TASTE_KEYS` was
written to prevent, reintroduced by a different door.

**One key holding a record:**

```ts
// lib/validators/showcase-intake.ts — stepTasteSchema
spectrums: z.record(z.string(), z.number().int().min(1).max(5)).optional(),
```

Open key space, deliberately. A spectrum retired from the copy pack later keeps
its stored answer (same law as the D-PORT-20 keys); a `z.enum` of ids would strip
it on the client's next save. Values are bounded because an out-of-range integer
is a bug, not an answer.

One label in `lib/intake/showcase-answer-labels.ts`:

```ts
spectrums: "Which way it leans",
```

One unanswered row, one honest fact. `[COPY — draft]`.

### 10.2 Placement

| Path | Change |
|---|---|
| `lib/intake/showcase-copy.ts` | `TasteSpectrum` type; `tasteSpectrums?: readonly TasteSpectrum[]` on the copy pack; the film pack's five; **delete `darkOrLightHelp`** (§8 — dead since D-PORT-20) |
| `lib/validators/showcase-intake.ts` | `spectrums` on `stepTasteSchema`; `TasteSpectrumAnswers` type export |
| `lib/intake/taste-picks.ts` | `spectrumsOf(taste)` — reads the record, drops non-numeric and out-of-range values defensively |
| `app/websites/coded/intake/_components/taste/spectrum-scale.tsx` | **new** — one row: label, bipolar track, word readout, Clear |
| `app/websites/coded/intake/_components/taste/spectrum-block.tsx` | **new** — the fieldset, legend, intro, five rows |
| `app/websites/coded/intake/_components/steps/step-taste.tsx` | render the block under `YourPicks` |
| `app/globals.css` | `.taste-spectrum` beside the existing `.taste-scale` |
| `lib/intake/showcase-answer-labels.ts` | the `spectrums` label |
| `server/services/output.ts` | `spectrums` → lines inside the existing `stepKey === "taste"` transform in `resolveShowcaseKeys` |
| `scripts/verify-track-cartridge.ts` | shape assertions |

**Nothing new is extracted.** One consumer each; the placement law says
co-locate. `spectrumsOf` goes in `taste-picks.ts` because that module is already
the one home for "what a client's taste answers mean", read by the step, the
document, and the document's flags — the same three consumers this has.

### 10.3 The copy-pack contract

```ts
export type TasteSpectrum = {
  /** Stable, and outlives the copy. Stored answers are keyed by it. */
  id: string;
  /** The fork, as the row's label. */
  label: string;
  /** The named ends, for the sub-line and the document. */
  ends: { low: string; high: string };
  /** Exactly five, low to high. The readout and `aria-valuetext` both use these. */
  stops: readonly [string, string, string, string, string];
};
```

`stops` is a fixed-length tuple, not `readonly string[]`: a set with four stops
should fail `tsc`, not render a slider whose top stop has no words. This is the
same guard `taxonomy.ts` gets from `Record<Union, …>`.

Film defines `tasteSpectrums`; every other pack omits it, and the block is
absent — no flag, no empty state (D-PORT-12's law reused). `[ASSUMPTION —
reversible, logged: other packs get their own sets later; omission is the
correct interim, not a gap.]`

### 10.4 The unset thumb

`PickScale`'s zero-stop trick does not transfer — a bipolar track has no spare
position. Per §6 the input's `value` is held at `3` while unset and the thumb is
not painted. Two things this must get right:

- **Do not use `defaultValue` or an uncontrolled input.** The stored answer is
  the source of truth and autosave writes through `form.setValue`, same as every
  other answer on this step.
- **`onChange` commits unconditionally.** A keyboard arrow from unset fires with
  `2` or `4`, which is the honest reading. There is no "did they mean it" branch
  — that would be logic in a seam that should have none.

The thumb is hidden with `opacity: 0` on `::-webkit-slider-thumb` /
`::-moz-range-thumb` under a `[data-unset]` attribute on the input, not by
removing it from the layout: the browser still needs it to compute drag
geometry, and `stopOffset`'s half-thumb arithmetic (the drift `PickScale`
already fixed once) depends on it existing at full size.

### 10.5 The document seam

Inside the existing `stepKey === "taste"` branch of `resolveShowcaseKeys`, which
already has `engagement` in hand and so can resolve the flavour the same way
`picksOf`'s callers do — `galleryFlavourOf(engagement.answers)`. Do not thread a
second flavour parameter through `renderIntakeMarkdown`; that function is the
oracle `yarn verify:tracks` runs with no database, and its signature is load-bearing.

Output shape, one line per answered spectrum, unanswered ones absent:

```
Which way it leans
  Who they meet first — "The work, with your name on it"  (the work ←→ you)
  Where the personality lives — "The site is a piece of work too"  (in the work ←→ in the site)
```

An id with no matching spectrum in the current pack still prints, by its raw id,
with a marker — same rule as a pick whose site has been archived (D-PORT-11). An
answer never vanishes because the copy moved.

### 10.6 Verification

`scripts/verify-track-cartridge.ts` gains, in the shape of the existing checks:

- every `tasteSpectrums` id is unique within its pack and stable across packs;
- every spectrum has exactly five stops and both ends named;
- the film pack defines a set and at least one other pack does not, so the
  absence path stays exercised by the oracle rather than by a client.

Then `yarn build:agent && npx tsc --noEmit`, run and reported.

### 10.7 Blast radius

Reversible: the component, the copy, the CSS, the readout wording. One-way
enough to get real scrutiny: **the `spectrums` key and the id vocabulary.** Once
a client has answered, ids are permanent — retiring a spectrum means removing it
from the copy pack while the stored answer keeps printing. That is the same
contract `siteKey` holds and it should be honoured from the first commit, not
retrofitted.

Nothing here touches the schema of another step, the boundary graph, an
authorization path, or money. Ordinary slice, one ticket, after Taylor rules §7.

---

## 11. The feel set — Vesper

`[RULED — Taylor, 2026-09-07]` the five structural spectrums in §4 stay. This
section adds a second block, and it replaces an earlier draft of §11 that was
**wrong** — see §13.

### 11.1 The test I should have applied

My first attempt at a style set asked about type scale, whether words overlay
images, gutters, and grain. Taylor read it and could not follow it, which is the
finding: if the person commissioning the site cannot parse the question, no
client will.

The mistake was not granularity. It was **asking execution questions in taste
clothing**. The test that separates the two:

> **If my judgment would overrule the client's answer, it was never their
> question.**

"Should words sit on the image?" — I would overrule that the instant contrast
failed, so it is my decision and asking is theatre. "Should it feel cool or
warm?" — I would never overrule that. They are the only authority on it.

**This also explains D-PORT-20 better than §2 did.** Ground tone, stillness and
density were not retired for being *stylistic*. They were retired for being
**execution decisions dressed as taste** — questions whose real answer comes
from the work, the footage, and my judgment, asked of someone with no basis to
answer them. Feel is not that. Feel is the one thing on this form only the
client can supply, and it is *upstream* of every decision I make.

So the set below is deliberately vaguer than the structural five, and that
vagueness is correct. These are the adjectives a client already uses when they
describe the site they want. We are giving those words a place to land instead
of leaving them to the brain dump.

### 11.2 The four

Two named sites per end, from the gallery they just used — as illustration, not
as the mechanism. The words carry these on their own. Copy is `[COPY — draft]`.

#### `temperature` — Cool ←→ Warm

| | |
|---|---|
| 1 | Keeps its distance. Cool, still, a little severe. |
| 2 | Reserved |
| 3 | Neither, or some of both |
| 4 | Warm |
| 5 | Feels like there's a person in the room with you |

*Cool: Nabil, Salomon Ligthelm. Warm: Johnny Harris, Daniel Bencomo.*

**Not the same question as the retired ground tone.** Johnny Harris is light and
warm; Marcella Caudill is black and cold; Boucard is white and cold; Bencomo is
cream and warm. Temperature is a feeling and ground is a colour, and they come
apart in all four combinations across this set.

#### `presence` — Understated ←→ Bold

| | |
|---|---|
| 1 | Says almost nothing. Lets you find it. |
| 2 | Quiet |
| 3 | Confident without raising its voice |
| 4 | Makes a statement |
| 5 | Walks in and announces itself |

*Understated: Matias Boucard, Christopher Mably. Bold: Nabil, Filipe Correia
Dos Santos.*

**Not the retired `stillness`.** That was about motion. Filipe's site barely
moves and is the boldest thing in the whole gallery — his name is set to the
full width of the window.

#### `levity` — Serious ←→ Playful

| | |
|---|---|
| 1 | Serious throughout. No winking. |
| 2 | Straight-faced |
| 3 | Dry, if anything |
| 4 | Has some fun with it |
| 5 | Properly playful |

*Serious: Samuel Warnants, Salomon Ligthelm. Playful: Duran Levinson, Tao
Tajima.*

Correlated with temperature but not collinear: Tajima is cold **and** playful —
the liquid transition is a joke he is enjoying. Bencomo is warm and entirely
serious.

#### `era` — Timeless ←→ Of its moment

| | |
|---|---|
| 1 | Should look the same in ten years |
| 2 | Built to age well |
| 3 | Current, not chasing |
| 4 | Recognisably now |
| 5 | Unmistakably this year |

*Timeless: Michele Michel, Alexandros Maragos. Of its moment: Tao Tajima,
Edoardo Smerilli.*

**For Taylor, not for the form:** this is the axis that predicts how soon a
client will want a rebuild. That is a useful thing for him to know going into a
call and a **terrible** thing to say on the form — surfacing it to a client
would be manufacturing a reason to re-buy. It stays in the document's notes for
him and never appears in the copy.

### 11.3 Why these four, and how they hold up

They produce distinct real sites rather than one blurred axis:

| Answer | The site it describes |
|---|---|
| cool · understated · serious · timeless | Michele Michel, Malte Rosenfeld |
| cool · bold · playful · of its moment | Tao Tajima |
| warm · bold · playful · of its moment | Duran Levinson |
| warm · understated · serious · timeless | Mike Call, Rafa Arroyo |
| cool · bold · serious · timeless | Nabil, Marcella Caudill |

### 11.4 Cut

- **Polished ←→ raw.** The best of my rejected four, still the wrong layer, and
  mostly falls out of `era` and `temperature` anyway.
- **Expensive ←→ accessible.** Clients genuinely think in this, and I will not
  put it on a form: "accessible" reads as "cheap", and the honest version is a
  budget question the pay screen already asked.
- **Modern ←→ classic.** `era` in worse words. "Modern" means six different
  things to six people; "should look the same in ten years" means one.

### 11.5 Placement, and the nine-slider problem

Nine sliders on this step is still the main risk, but the feel set is much
cheaper to answer than the presentation set was — these are questions someone
answers from the gut in about four seconds each.

- **The structural five** sit under `YourPicks`, gated on the first pick.
- **The feel four** sit directly above *Three words the site should feel like*,
  which is the same question asked as free text. They are its structured half,
  and they should read as one short block that makes the three-words box easier
  to fill in rather than another thing to get through.

Cut order if he wants fewer: `levity`, then `wayThrough` (§4.2), then
`whatCarriesIt` (§4.5).

## 12. Implementation delta — Mason

§10 stands unchanged. The feel set is **the same storage and the same control**,
and it is materially simpler than the presentation draft it replaced.

**Storage: nothing new.** Nine ids in the one `taste.spectrums` record. The open
key space §10.1 argued for is what makes a second set free.

**Copy pack: one field added, not three.**

```ts
export type TasteSpectrum = {
  id: string;
  label: string;
  ends: { low: string; high: string };
  stops: readonly [string, string, string, string, string];
  /** Which block it renders in. Decides placement, nothing else. */
  group: "structure" | "feel";
  /**
   * Two gallery site keys per end, as illustration under the row.
   * Resolved through `siteByKey`; an unresolvable key is dropped and the row
   * renders without it. Losing an example must never lose the question.
   */
  examples?: { low: readonly string[]; high: readonly string[] };
};
```

**Names only — no thumbnails.** The earlier draft called for capture strips at
each end, which dragged in explicit-pixel sizing, a mobile degradation path, and
the `next/image` `w-auto` trap. The feel set does not need pictures: the words
carry it, and two site names in `--color-dim` under the track cost one line.
That deletes §12.4 of the rejected draft entirely.

**`verify:tracks`** asserts ids unique across both groups, both groups non-empty
in the film pack, both absent in at least one other pack, and every `examples`
key resolving against the seeded film set.

**Document output** prints the two groups under one heading with the picks' tag
tally beside them, so Taylor reads stated intent and revealed preference
together. No agreement score — a number would invite trusting it.

## 13. Rejected: the presentation set

An earlier §11 proposed four spectrums on type volume, words-over-image, finish
and edge treatment. **Rejected by Taylor, 2026-09-07**, on the grounds that it
was unreadable to him and therefore to a client, and that it had drifted from
taste into presentation semantics.

Recorded rather than deleted, because the underlying observations were sound and
belong somewhere — they are the right questions for **Taylor's own design pass
after intake**, not for the client's form. Kept as a note so the next session
does not rediscover them and mistake them for a gap: type volume, whether words
overlay media, clean-versus-handled finish, and bleed-versus-framed edges are
decisions the picks plus the feel set should let him make himself.


---

## 14. Build log

Shipped 2026-09-07. `npx tsc --noEmit`, `yarn lint`, `yarn verify:tracks`
(12 new assertions, all passing) and `yarn build:agent` all clean.

**Files.** `lib/intake/showcase-copy.ts` (the `TasteSpectrum` contract, the film
pack's nine) · `lib/validators/showcase-intake.ts` (`spectrums`) ·
`lib/intake/taste-picks.ts` (`spectrumsOf`) ·
`lib/intake/showcase-answer-labels.ts` (one label) ·
`app/websites/coded/intake/_components/taste/spectrum-scale.tsx` **new** ·
`.../taste/spectrum-block.tsx` **new** · `.../steps/step-taste.tsx` (placement) ·
`app/globals.css` (`.taste-spectrum`) · `server/services/output.ts` (the document,
including the picks tally) · `scripts/verify-track-cartridge.ts`.

### 14.1 Three things the spec got wrong, found by looking at it

- **§6 said the thumb is not painted while unset.** Built that way, nine forks
  rendered as nine hairlines with two words under each — recognisable as a
  control by nobody. It was a misreading of `PickScale`, which keeps its thumb
  and lets the empty fill and the dash carry "not answered". The thumb is now
  drawn and dimmed; an answered fork is gold with its stop spelled out.
- **The end labels were specified at stops 1 and 5.** Centring a label on a stop
  hangs half of it off the container, and two long ends collide in the middle.
  They are a two-column row inset by half a thumb, each end over its own
  examples.
- **The examples were written in `--color-faint`.** That token is an 11%-alpha
  hairline, not a text colour — unreadable, and under the non-text contrast
  floor as the unset thumb's outline too. Both are `--color-dim` now.

A fourth, caught by the linter rather than by eye: `pack.tasteSpectrums ?? []`
is a fresh array every render and silently defeated both `useMemo`s. Hoisted to
a module-level constant.

### 14.2 Deliberate deviation from §10.2

**`darkOrLightHelp` was not deleted.** §10.2 listed it, and it is still dead
copy carried by all six packs — but it is a separate concern from this feature,
and CLAUDE.md's working method is one ticket at a time. It stays in §8 as a
finding for its own ticket.

### 14.3 Verified by eye

Rendered in isolation on a temporary route at 1280px and 375px, then removed.
Confirmed: click sets a stop and turns the thumb gold; the readout carries the
stop's words; Clear removes the key entirely (`{"wayThrough":5}` after clearing
a neighbour, not a zero); an arrow key from unset commits centre ± 1; the focus
ring frames the tap target without colliding with the readout above it; both
blocks render with their legends, and every example key resolves to a name.


---

## 15. Revision — 2026-09-07, after seeing it

Two changes from Taylor, both on the built thing rather than the spec.

### 15.1 The track is continuous, 1.0 to 7.0

Was five discrete stops. `[ASSUMPTION — reversible: "1.0-7.0" against "1-5" reads
as decimals deliberately, so the track is continuous at a 0.1 step. If seven
buckets were meant, it is one constant.]`

This removed the per-stop copy entirely. A continuous position has no words of
its own, so the readout is **the number plus the end it leans toward** —
`2.4 · The work`, `6.8 · You lead`, `4.2 · Even` — where the word carries
direction and the number carries strength. Nothing has to be written for
position 4.9 that is not already written for 6.4.

The even band is ±0.4 around 4.0, wide enough that someone who dragged to
roughly the middle is told they landed there rather than being assigned a lean
by a tenth of a point. Values are rounded to one decimal at the write seam, so
the document holds what the readout showed rather than `4.300000000000001`.

Keyboard survives the fineness on the platform's own terms: arrows step 0.1,
PageUp/PageDown step 0.6, which crosses the track in ten presses.

### 15.2 Site names out, descriptors in

Taylor, on the built rows: clients "aren't paying that kind of attention".
Correct — a site name only helps someone who remembers the site, and it asks a
client to hold four names in their head to answer one question.

Each end now carries a `means` line saying what that end **turns into**:

> **Cool** — Keeps its distance. Still, spare, a little severe.
> **Warm** — Feels like there's a person in the room with you.

Three consequences worth recording:

- **The copy burden dropped.** Forty-five stop phrases and eighteen site keys
  became eighteen descriptors. Fewer strings, and each one earns its place.
- **A coupling is gone.** §12.2 flagged that copy referencing site keys made the
  copy pack depend on gallery content, and asked `verify:tracks` to guard it.
  With the keys removed there is nothing to guard: a site archived in
  `/admin/intake/examples` can no longer change what a fork says. That
  assertion, and the seed-file import it needed, are deleted.
- **`SpectrumScale` no longer knows the gallery exists.** The `gallery` prop is
  gone from both components and from the step's call sites.

### 15.3 Verified

`tsc`, `lint`, `verify:tracks` (16 assertions) and `build:agent` clean. Rendered
in isolation at 1280px and 375px, then removed: dragging lands on 2.4 and stores
2.4; a click near an end gives 6.8; a click near the middle reads
`4.2 · Even`; untouched rows stay dim with a dash; descriptors wrap in two
columns on a phone without collision.

### 15.4 Still open

All copy remains `[COPY — draft]` — nine labels, eighteen end names, eighteen
descriptors, two block intros. The descriptors are now the only prose a client
reads on a fork, so they carry the whole question and are the ones worth the
human-hand pass first.
