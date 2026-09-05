# Taste example sites as records — the admin surface: UX scope

Author: Vesper (design). Status: **Ratified by Taylor, 2026-09-04.** D-PORT-21…28 bind. Phase 10 of the PORT epic. Written from `docs/websites/TASTE-EXAMPLES-ADMIN-HANDOFF-PROMPT.md` (Mason, 2026-09-04) after Taylor took every recommended default in the questions pass, 2026-09-04, and answered §6.2 himself: **a capture arrives either as an image URL or as an upload, and it lands in Supabase storage.**

**Document authority.** On presentation law for `/admin`, [`../admin/ADMIN-UX-SPEC.md`](../admin/ADMIN-UX-SPEC.md) wins and this document inherits it whole. On the client-facing taste step, [`CODED-INTAKE-TASTE-UX-SCOPE.md`](CODED-INTAKE-TASTE-UX-SCOPE.md) wins and **nothing here may amend it**. On the record's shape, [`specs/PORT-22-taste-contract.md`](specs/PORT-22-taste-contract.md) and `content/intake-examples/types.ts` win. On tokens, [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) wins. On architecture, `specs/TECHNICAL-DECISIONS.md` wins; where this document expresses a preference about storage or placement it is a design consequence handed to Mason, not a ruling.

Copy note: every new string is `[COPY — draft]`, tabled in §11, written in the register of the surrounding admin so Taylor's pass edits rather than starts from nothing. These are Taylor-facing strings — no client reads any of them — so the human-hand standard applies at a lower stake here than it does on the questionnaire.

---

## 0. What this answers

The taste gallery's content is six TypeScript modules, all empty. Taylor has ~110 candidate sites from two research libraries and no way to manage them, so every client currently meets the absent state — honest and useless. This document designs the tool that fixes it, and nothing else.

It does **not** redesign the taste step. The only change a client can perceive when this lands is that the gallery finally has sites in it.

---

## 1. Frame — who is here, in what state

**Taylor, alone, at a desk, working a batch.** Not rushed and not flooded. *Repetitive*, which is its own failure mode: at site forty in one sitting he will misclick a group and not notice. The friction budget here is **throughput and reversibility**, not hospitality — the opposite posture from every client-facing surface on this track.

**The one job:** turn ~110 candidate URLs into a film set fit to put in front of a client, and make it obvious when a set is not yet fit.

That second half is why this is not a CRUD screen. A table tells you what you have. It does not tell you that you have nineteen dark sites and nothing warm — which is the only fact that decides which site you add next, and which `content/intake-examples/film.ts`'s own header already warns about: *a set that fills only two groups has already decided for the client.*

**So the list is a coverage instrument.** That is the design idea this scope is built around, and it is the difference between a catalogue and a curation tool.

### 1.1 The emotional contract

Two beliefs the surface has to make cheap to hold:

1. **Nothing I do here reaches a client by accident.** Every path to a client's screen is a deliberate act with its own control, and the surface says in the client's own words what is currently visible.
2. **A mistake costs seconds, not a deploy.** Which was the entire point of moving off the files.

---

## 2. Placement, routes, vocabulary

### 2.1 The rail

A second item in the **Intake** section, beside Questions. Items sort alphabetically within a section (D-ADM-2), so it lands first:

| Item | Route | Icon | Ready |
|---|---|---|---|
| Example sites | `/admin/intake/examples` | `Images` (lucide) | flips with the CRUD slice |
| Questions | `/admin/intake/questions` | `ListChecks` | yes |

**"Example sites"** and not "Taste gallery" or "Sites": it matches the type name `ExampleSite`, and — the reason that actually decides it — it matches the words a client reads on the step when the set is absent: *"The example sites for this kind of build are still being chosen."* One vocabulary from the tool to the client's screen.

`ready: false` until the surface exists, per D-ADM-7. The rail entry is the only edit `admin-nav.ts` needs.

### 2.2 Routes

Three, all through `lib/routes.ts` — a path written inline is a path that drifts:

| Screen | Route | Builder |
|---|---|---|
| Packs overview (landing) | `/admin/intake/examples` | `adminRoutes.intakeExamples` |
| One set, or the whole library | `/admin/intake/examples/packs/[pack]` | `adminRoutes.intakeExamplePack(pack)` |
| One site | `/admin/intake/examples/sites/[slug]` | `adminRoutes.intakeExampleSite(slug)` |

`packs` and `sites` as literal segments rather than one dynamic segment, so a pack key and a slug can never collide. `[pack]` accepts the six flavours plus `all`, which is the library.

`isPathActive` already marks the rail item active for any descendant, so nothing about the rail changes as you move between the three.

### 2.3 The pack, in words

The six pack keys are engineering vocabulary — `entity` does not mean anything to the person reading it at 11pm. Every screen that names a pack renders its key as a label plus a line naming **which client kinds land on it**, and that line is **derived from the kind registry in `lib/intake/tracks.ts`, never typed here**. Same law as D-ADM-6: no second home for a fact the code already holds. If a kind's mapping changes, this surface changes with it or it is a bug.

### 2.4 Status vocabulary — one table, three screens

Every screen uses these exact words. They exist so the tool and the client's experience cannot describe the same state differently.

| State | When | Where it shows |
|---|---|---|
| `Shown to clients` | the pack switch is on **and** the pack has ≥1 published site | pack row, pack header |
| `Not shown — switch is off` | switch off, ≥1 published | pack row, pack header |
| `Not shown — nothing published yet` | 0 published, either switch | pack row, pack header |
| `Draft` | a site row, not published | the drafts section label |
| `Published` | a site row, live in every pack it belongs to whose switch is on | the published section label |
| `Archived` | a site row, out of the gallery, stored picks still resolve | the archived section label |

---

## 3. The three screens

### 3.1 Packs overview — the landing

Six rows, in the order `content/intake-examples/index.ts` already declares (`film · generic · practice · entity · venture · service`), so the tool and the code agree about order without either being the authority.

```
EXAMPLE SITES
Six sets. A client meets one, chosen from what they told us their site is for.

┌──────────────────────────────────────────────────────────────────────┐
│ FILM                                              Shown to clients   │
│ Portfolio · film discipline          18 published · 6 of 6 groups  › │
├──────────────────────────────────────────────────────────────────────┤
│ GENERIC                             Not shown — nothing published    │
│ Portfolio · no single discipline; Other                            › │
├──────────────────────────────────────────────────────────────────────┤
│ PRACTICE                            Not shown — switch is off        │
│ Practice                              4 published · 3 of 6 groups  › │
└──────────────────────────────────────────────────────────────────────┘

The whole library — 47 sites ›
```

- Pack key in the **eyebrow (mono) 10px `.30em`** register, `--color-dim`. The kinds line in `text-sm text-(--color-body)`.
- Counts right-aligned, `text-xs`, `--color-body`. The published count omits entirely at zero — no `0 published`, for the same reason the client's gallery renders absent rather than empty. The tool obeys its own law.
- The status phrase is the only place gold appears on this screen: `Shown to clients` in `--color-c2`, both not-shown phrasings in `--color-dim`. Gold as punctuation, one meaning — *a client can see this* — and it is the single most important fact on the page.
- The whole row is the link, using the engagements list's existing hover grammar verbatim: `border-l-2 border-transparent hover:border-(--color-c2) hover:bg-(--color-tint)/60`. Reuse, not a new pattern.
- Under the six, one link to `packs/all` — the library, for when the job is tagging rather than curating.

**This screen is where D-PORT-12 stops being a rule in a document and becomes something you can see.** It is the answer to "is anything live right now," and it takes one glance.

### 3.2 A pack's set

Three bands: the header with the switch, the coverage strip, the sites.

#### Header

```
FILM
Portfolio · film discipline

  Shown to clients                             [ ●━ ]  Show this gallery to clients
  18 published · 6 of 6 groups
```

The switch (§6.2) sits here and nowhere else. Beneath it, when off, one line quoting the client's own absent copy verbatim so the consequence is literal rather than described:

> *Clients see: "The example sites for this kind of build are still being chosen…"*

That line is **read from the step's own string, not transcribed** — D-ADM-6's law applied here. Today that copy is inline JSX in `step-taste.tsx` and cannot be imported, so this asks for one small thing: lift it to a single exported constant that both the step and this header read. If the copy changes on Taylor's human-hand pass, both change with it. Transcribing it into the admin instead is the one thing this bullet forbids.

#### The coverage strip

```
GROUPS
Dark and cinematic     6      Warm and textured      0
Light and editorial    4      Stills and credits     3
Type does the work     2      Statement pieces       1

GROUND     dark 11 · light 4 · warm 1
MOTION     still 3 · quiet 9 · alive 4
DENSITY    sparse 2 · balanced 10 · dense 4

Nothing yet in Warm and textured.
```

- Section labels in **mono 10px `.28em` `--color-dim`**, the eyebrow rule the whole site uses. Group titles from `taxonomy.ts` — one home, never retyped. Counts in `--color-ink`; a zero in `--color-dim`.
- Two columns at `>= 768px`, one below. Hairline `1px solid var(--color-faint)` above and below the strip; nothing else boxed.
- **No bars, no chart, no dashboard tile.** Numbers in the mono register, which is the site's own instrument grammar, and which passes the drift test — a bar chart here would be at home in a generic dashboard template and is therefore off-brand regardless of which tokens it used.

**The advisory lines**, derived, plain, in `--color-body`, no colour and no icon:

- One naming any group with zero sites: *"Nothing yet in Warm and textured."* (Groups list joined with commas when several.)
- One when the set is thin: *"7 sites. The set reads best at 12–24."* — the number is `film.ts`'s own curation guidance, stated once.

**Neither ever blocks anything, and neither is styled toward alarm.** They are statements of fact at the moment the fact is useful. I considered colouring the gaps and rejected it: the thing you are hunting for should be *said*, not encoded in a hue you have to learn — and a red zero on a screen about taste is exactly the escalation the alarm test exists to catch.

#### The sites

Sectioned by status, drafts first, because drafts are the work:

```
DRAFTS · 6
┌────────────────────────────────────────────────────────────────────┐
│ ┌────────┐  Matias Boucard                      matiasboucard.com  │
│ │ 120×78 │  Cinematographer · commercials, music video             │
│ └────────┘  DARK · ALIVE · BALANCED · HOVER PREVIEW · GRID         │
│             Custom build · checked 2026-08-22        film generic  │
└────────────────────────────────────────────────────────────────────┘

PUBLISHED · 18
…
```

- **The status is the section label, not a per-row badge.** The reduction pass: once the list is grouped, a status pill on every row is a word repeated eighteen times. It also keeps us clear of a colour-coded status dot, which D-CRM-22 forbids across the admin outright.
- **The thumbnail is 120 × 78, explicit pixel width and height, `object-cover`.** Never `w-auto`, never `sizes`. This is the repo's own trap (`CLAUDE.md`; PORT-7 law) and a grid of arbitrary-dimension screenshots is precisely where it bites. The half-pixel off 1512:982 is absorbed by the crop.
- A capture that 404s renders the quiet placeholder block at the same 120 × 78, name and link intact — the treatment the client's row already specifies, reused.
- Row facts, top to bottom: name (`text-sm text-(--color-ink)`), host (`text-xs text-(--color-dim)`, right), role (`text-xs text-(--color-body)`, truncated at one line), the tag line from `tagsFor(site)` in the **card tag (mono) 9px `.24em`** register, then a meta line carrying `build`, `checkedOn`, and the pack chips right-aligned.
- Pack chips reuse `chips.tsx`'s existing grammar verbatim: `rounded-(--radius) border border-(--color-line) px-1.5 py-0.5 text-xs text-(--color-dim)`.
- The whole row links to the editor. Same hover grammar as §3.1. Min height 44px, exceeded by the thumbnail.
- **Archived** is a header toggle, off by default; on, a third section appears below Published.
- On `packs/all`, one extra control: a pack filter. Nothing else differs.

#### The paste box

At the foot of the list, on every pack view and the library:

```
ADD SITES
One URL per line. They land as drafts — nothing reaches a client until you publish it.
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                                                  [ Add as drafts ]
```

- A `TextArea`, the site's standard field grammar (`--color-well` fill, `--color-line` border, `focus-visible` gold ring per PRIM-04).
- On a pack view, the drafts are created already belonging to that pack. On `packs/all`, they belong to none, and the editor's pack picker is the first thing a publish gate names as missing.
- **A URL already in the library never creates a second row.** It reports by line: *"3 added. 1 already in the library — Matias Boucard."*, with the existing row linked. A catalogue rots on duplicates, and the fastest way to get 110 duplicates is a paste box that does not check.
- Failures are named per line, never a silent partial and never a whole-batch rejection because one line was junk.

### 3.3 The editor

**One screen. No tabs, no wizard, no accordion.** Every judgment is visible at once because they are made together — you decide `dark-cinematic` and `alive` and `dense` in one look at the same screenshot.

Two columns at `>= 1024px`; stacked below, capture first.

```
┌───────────────────────────────┬────────────────────────────────────┐
│                               │  Name        [ Matias Boucard    ] │
│      hero capture             │  Role        [ Cinematographer …  ] │
│      1512 : 982               │  URL         [ https://…         ] │
│      fitted to the column     │              matiasboucard.com      │
│                               │  Slug        matias-boucard         │
│  ┌──┐ ┌──┐ ┌──┐               │                                     │
│  │2 │ │3 │ │+ │               │  PACKS       [film] [generic] …     │
│  └──┘ └──┘ └──┘               │                                     │
│                               │  GROUP       six cells              │
│  Add a capture                │              "The footage is the…"  │
│  ( ) Upload  ( ) Image URL    │                                     │
│                               │  GROUND      dark │ light │ warm    │
│  [ Look at it framed ]        │  MOTION      still │ quiet │ alive  │
│  [ ] The site renders inside  │  DENSITY     sparse │ bal. │ dense  │
│      the frame                │                                     │
│                               │  STYLES      seventeen chips, max 3 │
│                               │                                     │
│                               │  BUILD       template │ des. │ cust.│
│                               │              Never shown to a client│
│                               │  CHECKED ON  [ 2026-08-22 ] Today   │
└───────────────────────────────┴────────────────────────────────────┘
  [ Save ]  [ Save and next draft ]        Publish  ·  Archive
```

#### The stage (left)

- The hero capture at **the largest 1512:982 box that fits the column**, with **explicit pixel width and height computed from the intrinsic dimensions** — the `MediaLightbox` computation, named here because this is the exact shape of the bug `CLAUDE.md` records. CSS `aspect-ratio` does not rescue it and must not be reached for.
- **Every capture sits on a plate**: `--color-well` fill, `1px solid var(--color-line)`, radius 3px. Not decoration — in the admin's light theme a white screenshot on paper has no edge, and a capture is arbitrary content we do not control. This is the one theme-specific rule in the document.
- Under the stage, the other captures as 96 × 62 thumbs; clicking one makes it the stage. Each carries a remove control (an `×` with an accessible name, `Remove capture 2`), visible on hover **and** on focus — never hover-only.
- Capture 1 is marked as the hero with a mono label, because it is the one a client sees in the row and the one the publish gate measures.

#### The judgments (right), in the order you make them

1. **Name** — text.
2. **Role** — text. Placeholder is the contract's own example: `Cinematographer · commercials, music video`.
3. **URL** — text, with the derived host rendered read-only beneath it in mono, so you see what a client sees without typing it twice.
4. **Slug** — mono, `--color-dim`. Editable before the row has ever been published; read-only after, with one line: *"Fixed once published — a client's picks are stored against it."* This is D-PORT-11 made visible at the only control that could break it.
5. **Packs** — six checkbox chips, multi-select, in a `fieldset` with a `legend`.
6. **Group** — six single-select cells. **The selected group's one-liner renders beneath the picker**, from `taxonomy.ts` — you read the definition of the thing you just chose, at the moment you chose it, which is what stops the fortieth site drifting.
7. **Ground / Motion / Density** — three segmented rows of three. One click each, no menu. At 110 sites × 3 axes, the difference between a segmented control and a `<select>` is 330 menu interactions.
8. **Styles** — seventeen chips from the closed list, multi-select. **At three selected, the unselected chips become disabled**, with the ceiling stated above the set from the start: *"Three at most."* The ceiling is visible before you meet it rather than announced as a rejection after a click — and it prevents a four-tag row ever reaching `verify:tracks`.
9. **Build** — three single-select cells, with a mono line beneath: *"Never shown to a client."* D-PORT-15's law, stated where the field is set rather than only in a comment in `types.ts`.
10. **Checked on** — a date input plus a **Today** shortcut, because the common act is "I just confirmed this link is live."

Field labels are **mono 10px `.28em` `--color-dim`**, matching the eyebrow rule the rest of the admin uses. No floating labels, no placeholder-as-label.

#### Saving

**Explicit save, not autosave.** Publishing is a deliberate act evaluated against a settled row, and an eleven-field form autosaving per keystroke makes "is this live?" unanswerable. Three consequences, all designed:

- The Save button carries unsaved state (§8) and `⌘S` / `Ctrl+S` saves.
- Navigating away with unsaved changes warns, naming what is unsaved.
- **`Save and next draft`** — the throughput affordance. After tagging a site the next act is always the next untagged draft; this makes it one button instead of two navigations. It is the single highest-value control on the screen for a 110-site job and it costs nothing.

---

## 4. Captures — two ways in, one place they live

Taylor's answer, 2026-09-04: **an image URL, or an upload, going to Supabase storage.**

### 4.1 The two routes

**Upload.** A file input and a drop target in the editor. Accepts `image/jpeg`, `image/png`, `image/webp`, `image/avif`. The server measures the file's intrinsic dimensions and writes them to the row with the storage path.

**Image URL.** A text field. The server fetches the image once, measures it, and **writes it into the same bucket.** It does not store the remote URL.

That last sentence is a design call and I want the reasoning on the record, because it is a small departure from a literal reading of the instruction:

1. `next.config.ts` has **no `remotePatterns` today**. Referencing arbitrary remote hosts means either an open allowlist — a `next/image` optimizer pointed at any host on the internet is an open image proxy — or a host list maintained per site, forever. Copying into the bucket means **one allowlisted host, once**.
2. The dimensions are required by the content contract, so the image has to be fetched and measured either way. Once it is in hand, writing it is nearly free.
3. A remote screenshot lives on somebody else's host. `checkedOn` exists precisely because these sites go dark — a capture hosted alongside the site it depicts would go dark with it. **The point of a capture is that it outlives the site.**

Cost of being wrong: some storage bytes and one hop at create time. Reversible in an afternoon. If overruled, the fallback is stated: store the URL, add its host to `remotePatterns`, measure dimensions at save.

*Note for Mason, not a design ruling:* a server-side fetch of a user-supplied URL is an SSRF surface even behind `requireAdmin` — https only, no redirects into private ranges, a size cap, and a content-type check.

### 4.2 Storage layout — what Taylor creates in the dashboard

> **Amended by the architecture pass, 2026-09-04 (M-PORT-45).** Two things below turned out to be unnecessary and one narrowed. The bucket is created by `db/supabase/setup/03-example-sites-rls-and-bucket.sql`, idempotently, with the size limit and MIME allowlist set declaratively — so **there is nothing to create by hand**, and the `sites` folder needs no placeholder object because Supabase storage paths are virtual. `image/avif` leaves the accepted inputs; the dimensions are read by an in-house header parse covering JPEG, PNG, and WebP rather than by a new dependency. The path shape, the public flag, and the separate-bucket reasoning below all stand. See `CODED-INTAKE-EXAMPLES-TECH-SCOPE.md` §3.2 and §4.2.

**Create one bucket:**

| | |
|---|---|
| **Name** | `intake-examples` |
| **Public bucket** | **on** |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp`, `image/avif` |
| File size limit | `10 MB` |

**Create one folder inside it:**

```
sites
```

That is the whole manual step. Everything below `sites/` is created by the app at upload time.

*(Supabase writes a `.emptyFolderPlaceholder` object when you create a folder in the dashboard. That is normal, it is what keeps the folder visible while empty, and the app ignores it.)*

**The path the app writes:**

```
sites/<slug>/<n>-<8 hex>.<ext>
```

| Segment | What |
|---|---|
| `<slug>` | the site's immutable slug — `matias-boucard` |
| `<n>` | the capture's ordinal, 1-based. `1` is the hero at 1512:982 |
| `<8 hex>` | random, so **replacing a capture never reuses a path** — a reused path serves the stale image from the CDN, and the failure looks like "the upload didn't work" |
| `<ext>` | `jpg` · `png` · `webp` · `avif` |

Real examples:

```
sites/matias-boucard/1-3f9a2b71.jpg
sites/matias-boucard/2-c40de118.jpg
sites/jacob-mckee/1-91b7ee02.webp
```

Public URL shape:

```
https://<project-ref>.supabase.co/storage/v1/object/public/intake-examples/sites/matias-boucard/1-3f9a2b71.jpg
```

**Why a new public bucket and not a folder in `intake`.** `intake` is private and holds clients' uploaded logos, photos, and voice notes; its privacy is a promise, enforced by signed URLs. These captures are screenshots of public websites, shown to every client who reaches the taste step, and there is nothing private in one. Two access rules inside one bucket is how a privacy promise gets broken by a policy edit six months from now. **Separate buckets, separate promises.**

And signed URLs are wrong for this content on their own terms: they expire, a gallery of twenty-four expiring URLs is a class of bug, and `next/image` would cache an optimised copy keyed on a URL that later stops working.

### 4.3 Alt text

The content contract requires `alt` on every capture. Three captures × 110 sites is 330 alt fields, which is how alt text becomes junk.

**Capture 1 gets an authored field. Captures 2+ get a derived positional alt** — `"Matias Boucard, view 2 of 3"` — written at save time so the contract holds with a real string.

This is a judgment, not a shortcut. The hero capture is the one a client reacts to and it describes a design, so it deserves words. The rest are a scroll strip of the same site, where a positional alt is the correct and standard answer and a hand-written one would be three near-identical sentences nobody reads.

---

## 5. The frame check, and `embed`

D-PORT-17: `embed` is a human's judgement and **cannot** be computed. `X-Frame-Options` and `frame-ancestors` are hints in one direction only, `load` fires on a blocked frame in Chromium, and JavaScript frame-busting exists regardless of headers.

So the design is two controls and no cleverness:

**`Look at it framed`** — a button that opens the production overlay's stage in the admin, at the real 1512:982 box, with the frame forced on regardless of what is stored. That is the thing being tested. It reuses `site-stage.tsx` / the overlay rather than a second frame implementation, so what Taylor judges is exactly what a client would meet.

**The toggle**, phrased as an observation rather than a setting:

- Label: *"The site renders inside the frame"*
- Help: *"Tick this only after you've opened it above and watched it load. A blocked frame looks exactly like an empty one."*
- Default: off.

**No header hint on screen.** I specified one, then removed it in the reduction pass. It is a hint about a thing you are one click away from settling by looking; it can be wrong in both directions; and shown beside the toggle it would function as the answer, which is the precise failure D-PORT-17 exists to prevent. `yarn capture:example` still prints the header verdict in the terminal for whoever runs it. If Taylor later wants it on screen, that is an addition, not a redesign.

---

## 6. Publishing — the two switches

Two different judgments, made at two different moments, neither able to trigger the other.

### 6.1 Per-site publish, and its gate

A row may publish only when all of these hold:

1. It has at least one capture, and capture 1 is within 1% of 1512:982.
2. Capture 1 has alt text.
3. `name`, `role`, and `url` are non-empty and contain no `TODO`.
4. `group`, `ground`, `motion`, `density`, and `build` are all set.
5. `styles` holds 0–3 entries. Zero is legal — the three axes are the required tags.
6. `checkedOn` parses as a date.
7. It belongs to at least one pack.

**The control names what is missing, beside itself, before the click:**

```
Publish
Not yet — no capture, and the group isn't set.
```

One line, `--color-dim`, plain words, no modal, no toast, no red. Never a click that fails.

These are the same rules `yarn verify:tracks` enforces; the gate moves them from build time to the moment of the decision, where they are still cheap to fix. **The verifier stays the backstop and must keep failing loudly**, because a row can be written by a database operation that never passes this screen.

Unpublish has no gate and no confirm. It makes a thing less visible, which is the safe direction.

### 6.2 The pack switch — `Show this gallery to clients`

**A pack is shown to clients only when its own switch is on and it has at least one published site.** Publishing a site never flips a pack live.

The default `at least one published site counts as curated` is a footgun of exactly the class that already shipped once: publishing site number one would put a **one-site gallery** in front of a client, on a step whose own curation guidance says 12–24 spread across the groups, and whose governing ruling exists because six placeholder sites reached clients for a week. That law should not depend on Taylor remembering not to publish site one until site twelve exists.

The switch is off by default for all six packs, lives only in the pack header, and is the single control that can make a gallery appear to a client. Turning it on is confirmed inline — one line naming the consequence, not a dialog:

> *"Clients whose site is a film portfolio will see these 18 sites."*

---

## 7. Archive, never delete

Three statuses: **draft · published · archived**.

Archived rows leave the gallery, stay visible in admin behind the filter, and **keep resolving stored picks** — which is D-PORT-11 and is the whole reason there is no delete control on this screen. Restore returns a row to **draft**, never straight to published: a row you took out and put back gets re-judged.

Archiving asks once, with the consequence named — the part nobody thinks about:

> **Archive Matias Boucard?**
> It leaves the gallery. Anyone who already picked it keeps their pick.
> [ Cancel ] [ Archive ]

Reuse the admin's existing dialog pattern (`sop-dialog.tsx` / `intro-email-dialog.tsx`). Do not add a primitive.

**There is no delete.** Removing a row entirely is a database operation Taylor runs deliberately, and it should be, because it is the one action on this surface that can silently change the meaning of an answer a client already gave.

---

## 8. State matrix

Every interactive element. Focus-visible is a **2px gold ring per PRIM-04** on all of them, never removed, never colour-only. Nothing on this surface introduces a transition duration; the sitewide reduced-motion rule already collapses what exists.

| Element | Default | Hover | Active / selected | Focus-visible | Disabled | Loading | Error | Empty |
|---|---|---|---|---|---|---|---|---|
| Pack row | `--color-body`, transparent left rule | `--color-card-hover` bg, `--color-c2` 2px left rule | n/a | gold ring | n/a | skeleton-free: the page is server-rendered | n/a | n/a |
| Site row | as above, thumb on `--color-well` plate | as above | n/a | gold ring on the row | n/a | n/a | capture 404 → placeholder block, facts intact | n/a |
| Text field | `--color-well` fill, `--color-line` border, `--color-ink` text | border `--color-line-strong` | n/a | gold ring, border `--color-c2` | `--color-dim` text, `--color-line-soft` border, no fill change | n/a | border `--color-line-strong` + message beneath in `--color-body`; never red, never the client's fault | placeholder in `--color-dim` |
| Segmented cell (axes, group, build) | `--color-line` border, `--color-body` | `--color-card-hover` | `--color-ink` text on `--color-tint`, `--color-line-strong` border — **not gold** | gold ring on the cell, not the group | `--color-dim`, `aria-disabled` | n/a | n/a | n/a |
| Style / pack chip | chip grammar, `--color-dim` | `--color-body` | `--color-ink` on `--color-tint` | gold ring | `--color-dim` at rest, `aria-disabled="true"`, cursor default | n/a | n/a | n/a |
| Capture thumb | plate + hairline | `--color-line-strong` border | 2px `--color-c2` border (it is the stage) | gold ring | n/a | shimmer-free: reserved box at exact dimensions | 404 → placeholder at the same box | `+` tile opens the add controls |
| Upload target | dashed `--color-line`, `--color-dim` label | `--color-line-strong` | drag-over: `--color-c2` border | gold ring | disabled while a write is in flight | progress as a plain percentage line, no bar animation | named reason beneath, file retained | prompt copy |
| Save | ghost button grammar | per DS ghost CTA | n/a | gold ring | when nothing changed | label → `Saving…`, control `aria-busy` | message beneath, nothing lost, button re-enabled | n/a |
| Publish | ghost button | per DS ghost CTA | n/a | gold ring | **`aria-disabled="true"`, not `disabled`** — see §10 | `Publishing…` | named reason | n/a |
| Pack switch | `--color-line` track | `--color-line-strong` | on: `--color-c2` track, `--color-ink` knob | gold ring | n/a | `aria-busy` during the write | reverts with a named reason | n/a |
| Archive | text button, `--color-dim` | `--color-body` | n/a | gold ring | n/a | n/a | named reason | n/a |

**Gold discipline.** Gold appears on this surface in exactly three places: the `Shown to clients` phrase, the active rail item (D-ADM-5, inherited), and the row-hover left rule. **A selected segmented cell is not gold** — seven selected cells per editor would make gold a wash, and the one thing gold says here is *a client can see this*.

---

## 9. Empty states — hospitality, not apology

| Where | Copy `[COPY — draft]` |
|---|---|
| Library, nothing at all | *Nothing here yet. Paste some URLs below and they'll land as drafts.* |
| A pack with no sites | *No sites in this set yet.* + the paste box + *or add one already in the library* |
| A pack with drafts but nothing published | The Published section **does not render**. Absent, not `0` — the tool obeys its own law. |
| Archived filter on, nothing archived | *Nothing archived.* |
| Pack filter matches nothing | *Nothing matches that.* |
| A site with no captures | The stage renders the plate at the hero box with *No capture yet* in `--color-dim`, and the add controls beneath. |

No exclamation marks. No illustrations. No "Oops."

---

## 10. Responsive, accessibility, themes, motion

**Responsive.** `>= 1024px`: editor two-column, coverage strip two-column. `768–1023px`: editor stacks, capture first. `< 768px`: single column throughout; the rail is already off-canvas per D-ADM-4. This is a desktop tool with one user and it is not optimised for a phone — it must not *break* there, and it does not pretend to be good there.

**Targets.** 44px minimum on every control including chips, matching the rest of the admin. Seventeen style chips at 44px wrap to five rows in the editor column; that is a fine trade for a scrolling desktop column and a bad trade to lose.

**The disabled-publish problem.** A `disabled` button is not focusable, so a screen reader never reaches it and never hears why it cannot be used. The gate's reason line would be visual-only. So: **`aria-disabled="true"` rather than `disabled`**, focusable, `aria-describedby` pointing at the reason line, and an activation handler that is a no-op except that it moves focus to the first unmet field. Honest and reachable.

**Semantics.** Axes, group, and build are `radiogroup` / `radio`. Styles and packs are checkboxes in a `fieldset` with a `legend`. The style ceiling is announced by a `aria-live="polite"` region when the third is selected: *"Three selected. Deselect one to change it."* Capture remove controls carry accessible names naming the ordinal. The pack switch is a `switch` with `aria-checked` and a visible label.

**Both themes.** Every value above is a token; nothing is a hex. The one theme-specific rule is §3.3's capture plate — a white screenshot on paper has no edge, and captures are content we do not control. Verify in light and dark on the real surface, per D-ADM-13's own instruction that these judgments are made live and not on swatches.

**Text scaling.** 200% without breakage. The coverage strip's two columns collapse to one; the segmented rows wrap rather than truncate; no fixed-height row anywhere except the capture boxes, which are images and are supposed to be fixed.

**Motion.** None is added. The list does not animate, the editor does not reveal, the dialog uses the pattern that already respects `prefers-reduced-motion`.

---

## 11. Copy — every new string, for Taylor's pass

All `[COPY — draft]`. Taylor-facing only.

| Where | String |
|---|---|
| Rail item | `Example sites` |
| Overview title | `Example sites` |
| Overview intro | `Six sets. A client meets one, chosen from what they told us their site is for.` |
| Overview library link | `The whole library — {n} sites` |
| Status | `Shown to clients` |
| Status | `Not shown — switch is off` |
| Status | `Not shown — nothing published yet` |
| Counts | `{n} published · {g} of 6 groups` |
| Pack switch | `Show this gallery to clients` |
| Switch consequence | `Clients whose site is {kinds} will see these {n} sites.` |
| Switch off, consequence | `Clients see: "{the step's own absent line, read from the component}"` |
| Coverage labels | `GROUPS` · `GROUND` · `MOTION` · `DENSITY` |
| Coverage advisory | `Nothing yet in {group titles}.` |
| Coverage advisory | `{n} sites. The set reads best at 12–24.` |
| Section labels | `DRAFTS · {n}` · `PUBLISHED · {n}` · `ARCHIVED · {n}` |
| Archived toggle | `Show archived` |
| Paste box label | `ADD SITES` |
| Paste box help | `One URL per line. They land as drafts — nothing reaches a client until you publish it.` |
| Paste box button | `Add as drafts` |
| Paste result | `{n} added.` |
| Paste result | `{n} already in the library — {name}.` |
| Paste result | `Couldn't read line {n}: {reason}` |
| Editor field labels | `NAME` · `ROLE` · `URL` · `SLUG` · `PACKS` · `GROUP` · `GROUND` · `MOTION` · `DENSITY` · `STYLES` · `BUILD` · `CHECKED ON` |
| Role placeholder | `Cinematographer · commercials, music video` |
| Slug locked | `Fixed once published — a client's picks are stored against it.` |
| Styles ceiling | `Three at most.` |
| Styles ceiling, live | `Three selected. Deselect one to change it.` |
| Build note | `Never shown to a client.` |
| Checked-on shortcut | `Today` |
| Capture, hero | `Hero — this is the one a client sees in the row.` |
| Capture, add | `Add a capture` |
| Capture, routes | `Upload` · `Image URL` |
| Capture, none | `No capture yet` |
| Capture, remove | `Remove capture {n}` |
| Frame check button | `Look at it framed` |
| Embed label | `The site renders inside the frame` |
| Embed help | `Tick this only after you've opened it above and watched it load. A blocked frame looks exactly like an empty one.` |
| Save | `Save` · `Saving…` · `Saved` |
| Save and next | `Save and next draft` |
| Unsaved guard | `You haven't saved {name}.` |
| Publish | `Publish` · `Unpublish` · `Publishing…` |
| Publish gate | `Not yet — {reasons, in plain words, joined with "and"}.` |
| Gate reasons | `no capture` · `the capture isn't the right shape` · `no alt text on the first capture` · `the name is blank` · `the role is blank` · `the link is blank` · `the group isn't set` · `an axis isn't set` · `the build level isn't set` · `there's no checked-on date` · `it isn't in any pack` |
| Archive | `Archive` |
| Archive dialog | `Archive {name}?` / `It leaves the gallery. Anyone who already picked it keeps their pick.` / `Cancel` · `Archive` |
| Restore | `Restore as draft` |
| Empty states | per §9 |

---

## 12. Decision log — D-PORT-21 … D-PORT-28

All **`[RULED — Taylor, 2026-09-04]`**. D-PORT-20 was the prior high-water mark across every scope in this epic.

- **D-PORT-21** — **A pack is shown to clients only when its own switch is on *and* it has at least one published site.** Per-site publish never flips a pack live. Reverses the handoff's §6.3 default that "a scope counts as curated when it has at least one published site." Reason: that default lets publishing site one put a one-site gallery in front of a client, which is the D-PORT-12 failure class with a new mechanism. Cost of being wrong: one extra click per pack, ever.
- **D-PORT-22** — **A site belongs to many packs.** The library is one set of rows; a pack is a view over it. Duplicating a row per pack is how a catalogue rots. Pack keys stay the scoping vocabulary; the six *kinds* do not become a second axis.
- **D-PORT-23** — **Three statuses — draft, published, archived — and no delete control.** Archived rows keep resolving stored picks (D-PORT-11). Removing a row outright is a deliberate database operation, not a button beside a screenshot.
- **D-PORT-24** — **A capture arrives by upload or by image URL; both are copied into one public `intake-examples` bucket at `sites/<slug>/<n>-<hex>.<ext>`; dimensions are measured server-side and stored on the row.** A capture path is never reused. Rationale and the overrule fallback in §4.1.
- **D-PORT-25** — **Publish is gated on the content contract, evaluated before the click, with the unmet conditions named beside the control.** `yarn verify:tracks` stays the backstop and must keep failing loudly.
- **D-PORT-26** — **`embed` is set only behind the frame check, and no header hint appears on screen.** Extends D-PORT-17 to the curation surface.
- **D-PORT-27** — **The client preview is `/admin/intake/questions` and no second preview surface exists.** `question-stack.tsx` already passes `examplesFor(flavour)` into the production `StepTaste`; once that reads rows, the existing preview shows the real gallery and the real absent state at full fidelity. Extends D-ADM-6.
- **D-PORT-28** — **Capture 1 carries authored alt text; captures 2+ carry a derived positional alt written at save time.** The contract's required `alt` holds with a real string on every capture.

---

## 13. Assumptions and open items

`[ASSUMPTION]` — stated, reversible, and flagged rather than fudged:

1. **The taxonomy stays in code.** Groups, axes, style tags, build levels, and `GROUP_ORDER` remain `taxonomy.ts` and are read, never edited, by this surface. Making them runtime data turns four consumers into lookups for a gain nobody has asked for. Handoff §5 agrees; recorded here so it is not re-decided.
2. **The admin renders the `[COPY — draft]` taxonomy strings as they stand.** Seeing them in use is how Taylor will notice which ones need his pass. That pass stays its own item and is not blocked by this work.
3. **Who may edit is `admin | super_admin`**, matching every other admin surface. No third tier.
4. **Ordering within a pack is creation order**, shown so it is not a mystery. Drag-reordering is deferred (§14).
5. **`GROUP_ORDER` still decides the client's accordion order**; nothing in this surface can change it.
6. **A pack's kinds line is derived from the kind registry**, never typed on this surface.

**Open, for Taylor:**

- Ratification of D-PORT-21 … D-PORT-28.
- The bucket exists (§4.2) before the capture slice can be exercised.
- Whether any deferred item in §14 should be pulled into the first cut.
- **A locked-scope line needs a word changed.** `specs/README.md` § Locked scope reads *"No admin surface, no tRPC, no analytics on any intake path (M-INT-2/-10 inherited)."* Read in context that means the client-facing intake routes carry no admin surface — `/admin/intake/questions` has existed since ADM-2 and does not breach it. But a fresh build thread reading that line against a ticket that builds `/admin/intake/examples` is entitled to stop and ask, which is the correct behaviour and a waste of a session. The line wants to say *on any client-facing intake route*. It is locked scope, so amending it is Taylor's act, not mine — flagged rather than edited.

---

## 14. Deferred, and named as deferred

Not oversights. Each is a real capability, out of the first cut, listed so nobody has to reconstruct why it is missing:

- **Drag-reordering within a group.** Creation order until there are enough sites to care.
- **Bulk edit** — tagging several rows at once. The paste box handles the bulk *creation* problem, which is the one that actually blocks 110 sites.
- **A dead-link sweep** over `checkedOn`. The intake document already flags a stale pick at the moment it matters; a sweep is a nicety.
- **Pick analytics** — how many clients picked each site. Plausible, not asked for, and it would put a popularity number beside a taste judgment, which is a thing to decide deliberately rather than by default.
- **Managing captures beyond upload and remove** — cropping, reordering the strip, re-shooting in place.
- **A header-framing hint on screen.** §5.
- **Search across the library.** The pack filter plus a browser find is enough at 110 rows; it stops being enough somewhere north of 300.

---

## 15. Handoff notes for Mason

Design consequences that touch architecture. These are inputs to your pass, not rulings.

- **The scoping relationship is many-to-many** (D-PORT-22), so the pack lives on a join, not a column, and `examplesFor(flavour)` becomes a query behind the same seam it already is. `galleryFlavourOf(answers)` stays the one home for resolution and does not change.
- **The pack switch is a sixth row of its own state**, not a derived count (D-PORT-21). Whatever holds it, `examplesFor` must return a set that renders absent when the switch is off, so D-PORT-12's behaviour is unchanged from the step's point of view — the step should not learn that a switch exists.
- **The slug is the identity `taste.picks[].siteKey` stores** and is immutable after first publish. The editor enforces it; the data layer should too.
- **Captures need `remotePatterns` for one host** — the Supabase storage origin — and nothing else (§4.1). The `next/image` explicit-dimensions law applies to the admin thumbnails and the editor stage exactly as it does to the client row.
- **`verify:tracks` content rules move from the TS files to the rows.** They must keep failing loudly, and the publish gate is a second, earlier evaluation of the same rules — not a replacement. Two evaluations of one rule set is a duplication I am asking for deliberately, because the cheap one at the moment of the decision and the loud one in CI catch different failures.
- **The preview costs nothing** (D-PORT-27) — `question-stack.tsx:243` already wires it.
- **M-PORT numbering** is at 40; yours start at M-PORT-41.

---

## 16. Convergence tests run

- **Worst-moment test** — the least-resilient user here is Taylor at site forty in one sitting. Segmented pickers over menus, the group's one-liner beside the choice, `Save and next draft`, the styles ceiling visible before it is met, and a publish gate that names what is missing rather than rejecting a click. Passes.
- **Register test** — Taylor-facing strings in the admin's own plain voice; the one client-facing string on the surface is read from the component rather than transcribed. Passes.
- **Trust test** — captures go in a separate public bucket so `intake`'s privacy promise stays a single rule (§4.2); no delete control, so no answer changes meaning silently; the pack switch is the only path to a client's screen and it says so. Passes.
- **Alarm test** — no red, no dots (D-CRM-22), no badge counts, no countdown. Coverage gaps are stated as sentences, not encoded in colour. The thin-set advisory never blocks. Passes.
- **Contrast test** — every value is a documented token at its measured floor, both themes; the one new risk (a white capture on paper) is answered by the plate rule. Passes on the tokens; **must be verified live** per D-ADM-13.
- **State test** — §8 covers eleven elements across nine states, focus-visible included, with the `aria-disabled` publish decision made rather than left to a developer. Passes.
- **Drift test** — would this be at home in a generic dashboard template? The one place it nearly was is the coverage strip, which is why it is mono numbers and hairlines rather than bars. Passes.
- **Buildability test** — routes, tokens, components to reuse, the storage path, the state matrix, and the copy are all named. The one thing a builder must ask about is anything in §13's open list. Passes.

---

_Vesper, 2026-09-04. Ready for Taylor's ratification, then Mason's architecture pass and Reeve's tickets from PORT-28._
