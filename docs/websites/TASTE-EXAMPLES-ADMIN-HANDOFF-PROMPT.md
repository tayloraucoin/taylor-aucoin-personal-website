# Handoff prompt — taste example sites as database records, with an admin surface

**Paste the block in §0 into a fresh thread.** Everything after it is the briefing that thread reads.

Author: Mason (2026-09-04), at Taylor's request, closing the gap the taste redesign left open: the gallery's content is six TypeScript files nobody can edit without a deploy.

---

## 0. The kickoff block

> Role: `docs/roles/product-design/Vesper—ux-ui-designer-role-prompt.md`, `docs/roles/engineering/Mason—cto-principle-dev-role-prompt.md`, `docs/roles/engineering/Reeve—project-manager-role-prompt.md`
>
> Read `docs/websites/TASTE-EXAMPLES-ADMIN-HANDOFF-PROMPT.md` end to end, then its attach-list in order, before you write anything.
>
> **Task:** move the taste step's example sites out of `content/intake-examples/*.ts` and into database records, give me a CRUD surface for them under the Intake section of the admin rail, scoped so a client only ever meets sites chosen for their kind of build, and rewire the questionnaire to read the records instead of the files.
>
> **Do not start building.** Your first message is questions. §6 of the briefing lists the ones I already know fork the work, each with a recommended default — ask those, add any the briefing missed, and say which default you would take if I do not answer. Batch them into one message; I will answer them all at once. Only then produce the deliverable in §7.
>
> The one law that must survive intact: **an unpublished or empty set renders the taste step *without* a gallery and without the picks list, with the one honest line — absent, never an empty grid** (D-PORT-12). And **a client's stored picks reference a site by a stable key**; that key must keep resolving after this change or people's answers silently lose their meaning (D-PORT-11, M-PORT-35).

---

## 1. Why this exists

The taste step is the surface the whole coded-track deliverable's design signal comes from. A client opens grouped accordions of real websites, picks at least five, scores each one to seven and says what they liked about it, and the pattern in those picks is what the first look gets built from.

Today the sites live in six typed TypeScript modules — `content/intake-examples/{film,generic,practice,entity,venture,service}.ts` — and **every one of them is empty**. Curating a set means editing a file, committing, and deploying. Taylor has ~110 candidate sites from two research libraries and no way to manage them. So every client currently meets the absent state, which is honest and useless.

The ask: make them rows, give Taylor a screen, and keep everything the redesign already proved.

---

## 2. Attach-list, in reading order

1. This file.
2. `docs/websites/specs/README.md` — the kickoff contract, source precedence, and the non-negotiables every ticket on this track inherits.
3. `docs/websites/CODED-INTAKE-TASTE-UX-SCOPE.md` — the governing design for the step. §4 (the taxonomy), §5 (the gallery), §6 (the pick grammar), §7 (the overlay), §14 (the D-PORT-15…20 log).
4. `content/intake-examples/types.ts`, `taxonomy.ts`, `index.ts`, and one set file — the shape being replaced and the curation contract in its header.
5. `docs/websites/specs/PORT-22-taste-contract.md` — why the shape is what it is, and the retired-key trap.
6. `app/websites/coded/intake/_components/taste/*` and `steps/step-taste.tsx` — the consumers.
7. `docs/admin/ADMIN-UX-SPEC.md` and `app/admin/_components/admin-nav.ts` — the admin surface's law and its rail.
8. `db/schema/index.ts` plus one table module (`intake-files.ts` is a good model) — schema conventions.
9. `docs/websites/specs/TECHNICAL-DECISIONS.md` and `DEVIATIONS.md` — on-disk reality overrides any stale string in a spec.

---

## 3. What exists today, precisely

**The content shape** (`content/intake-examples/types.ts`, set at PORT-22):

```ts
type ExampleSite = {
  key: string;        // stable; a client's picks are stored against it
  name: string;
  url: string;
  role: string;       // "Cinematographer · commercials, music video"
  group: ExampleGroup;                    // six style archetypes
  axes: { ground: GroundTag; motion: MotionTag; density: DensityTag };
  styles: readonly StyleTag[];            // closed list, at most three
  build: BuildLevel;                      // template | designer | custom — NEVER shown to a client
  embed: boolean;                         // may the overlay frame it live
  checkedOn: string;                      // ISO date the link was last confirmed
  captures: readonly { src; width; height; alt }[];  // [0] is 1512×982 at 2×
};

type ExampleSet = { curated: boolean; sites: readonly ExampleSite[] };
```

**The vocabulary** lives in `content/intake-examples/taxonomy.ts`: six groups with their client-facing titles and one-liners, the three axes, seventeen style tags, three build levels, and `GROUP_ORDER`. Each map is `Record<Union, …>` so a value without words fails the build.

**The scoping seam today is the *pack*.** `examplesFor(flavour)` takes a `ShowcaseFlavour` — `film | generic | practice | entity | venture | service` — resolved from the engagement's `kind` plus, for a portfolio or a studio, its discipline. `galleryFlavourOf(answers)` in `lib/intake/taste-picks.ts` is the one home for that resolution; the step, the intake document, and the AI search all call it so they cannot disagree about which set a client saw.

**Every reader of `examplesFor` / `exampleByKey`:**

| Where | What it needs |
|---|---|
| `steps/step-taste.tsx` | the whole set, grouped and ordered, to render the accordions |
| `taste/gallery-overlay.tsx` | the flattened set, for paging |
| `server/services/output.ts` | one site by key, to print a pick's name, host, tags, and `build` in the intake document, and to flag stale `checkedOn` |
| `server/services/style-search.ts` | the set's hosts, so an AI search result already in the gallery is dropped |
| `scripts/verify-track-cartridge.ts` | the content rules: ≤3 style tags, first capture at the MacBook aspect, parseable `checkedOn`, every tag resolving to words |
| `scripts/capture-example-site.ts` | nothing — but it **prints** an entry for a human to paste, which is the workflow being replaced |

**Captures today** are committed files under `public/intake-examples/<pack>/`, shot by `yarn capture:example --url … --pack film` (PORT-27, Playwright). That script also reads the site's `X-Frame-Options` / CSP and reports whether it can be framed — it never writes `embed: true`, because headers cannot prove it.

**The admin** is `app/admin/(protected)/`, guarded by `requireAdmin()`. The rail is `app/admin/_components/admin-nav.ts`; its **Intake** section currently holds one entry, "Questions" (`adminRoutes.intakeQuestions`), which renders the real production step components with empty props in interface or document mode. Every href comes from `lib/routes.ts`. `ready: false` renders a dimmed label rather than a link to a 404.

---

## 4. Binding law — do not break these

- **D-PORT-12 — absent, not empty.** A set with nothing published renders the step *without* the gallery and *without* the picks list, with one line saying sites are still being chosen. No empty grid, no placeholder, no card skeleton. This is the single most-cited ruling on this surface and it exists because six invented placeholder sites once shipped to clients for a week.
- **D-PORT-11 / M-PORT-35 — stored picks are never silently invalidated.** `taste.picks[].siteKey` is a client's answer. A pick whose site has left the gallery renders by its stored key with a marker and prints in the intake document; it is never dropped. Whatever identity a row gets, existing keys must keep resolving.
- **The capture dimensions law (PORT-7).** Intrinsic pixel width and height are required on every capture and are part of the contract, because `next/image` with an unconstrained width renders a capture at a fraction of its size, silently, with nothing in the console. This repo has shipped that bug once. Whatever the storage answer is, the dimensions come with the record.
- **`build` never reaches a client.** It is what a favourite costs to reach, for Taylor's eyes in the intake document only (D-PORT-15).
- **`embed` is a human's judgement, never a computed value.** Header checks are a hint; only opening the site in the overlay settles it (D-PORT-17).
- **Nothing on the taste step out-dresses the step's Continue** — no ring, no gradient, no lift (PORT-7, site invariant 2).
- **The durable track ships byte-for-byte unaffected.** `yarn verify:tracks --document` is the oracle.
- **Migrations are append-only, reviewed as SQL, and run by Taylor.** Local resolves to the staging credentials, so a migrate run on a laptop touches staging — say so when you author one.
- **Repo law:** Yarn 4, never npm. `yarn build:agent` / `yarn dev:agent` only — never `yarn dev` or `yarn build`, which clear the `.next` a running dev server re-reads. Tailwind v4 token syntax `text-(--color-c2)`; never `-[--`.

---

## 5. What is already true and makes this easier than it looks

- **There is no data to migrate.** All six sets are empty. This is a greenfield table with a shape that has already been designed, argued over, and type-checked.
- **The taxonomy is a closed vocabulary in code and should probably stay there.** Groups, axes, style tags, and build levels are read by the step, the overlay, the document, and the verifier. Making them editable turns four consumers into runtime lookups for no gain Taylor has asked for.
- **One resolution seam already exists.** `galleryFlavourOf(answers)` is the only place that decides which set a client sees. If the scoping axis changes, that function is where it changes.
- **The admin already has a preview surface** that mounts the production step components. A "see it as a client would" view is a prop away, not a build.

---

## 6. Ask Taylor these before building

Batch them into one message with your recommended default beside each, so he can answer in one pass.

**1. Scoping — the axis, and whether a site can belong to more than one.**
Today it is one *pack* per set. He said "specific to the type of site created", which could mean the six packs or the six *kinds* (`portfolio · practice · studio · venture · business · other`). Also: one great site often suits both `film` and `generic`.
*Recommended default:* keep the pack as the scoping vocabulary, and make the relationship many-to-many — a site row carries a set of packs it may appear in. Duplicating a row per pack is how a catalogue rots.

**2. Where captures live, and how they get there.**
Today: committed files in `public/`, shot by a CLI. With rows and CRUD, uploading in the browser is the natural fit, but a remote host needs `next.config` image configuration and the dimensions must still land on the record.
*Recommended default:* a public Supabase bucket, uploaded through the admin, with width and height captured server-side at upload and stored on the row. `yarn capture:example` changes from "prints an entry to paste" to "uploads and creates a draft row".

**3. What replaces the `curated` boolean.**
*Recommended default:* a per-site `status` of `draft | published`, and a scope counts as curated when it has at least one published site. Draft sites are visible in admin and invisible to every client. This preserves D-PORT-12 exactly.

**4. Identity, so existing and future picks keep resolving.**
*Recommended default:* a `slug` column, unique, human-readable, immutable once the site has ever been published, alongside the row's uuid. `taste.picks[].siteKey` stores the slug. Nothing about a client's stored answer changes.

**5. How much editing does he actually want on day one?**
Full CRUD with per-field editing, tag pickers, capture upload, reordering, and publish/unpublish is a large surface. A narrower first cut — create from a URL via the capture pipeline, edit the taxonomy fields, publish, archive — may be all that is needed to get the film set live.
*Recommended default:* build the narrow cut, and name what was deferred.

**6. Ordering within a group.**
*Recommended default:* an integer position per scope, defaulting to creation order, with reordering deferred until he has enough sites to care.

**7. Who may edit.**
`ADMIN_ROLES` is `admin | super_admin`.
*Recommended default:* both, matching every other admin surface — say so rather than inventing a third tier.

**8. Anything he wants the admin page to show that the client never sees.**
`build` and `checkedOn` are already Taylor-only. A "last verified" sweep, a dead-link check, or a count of how many clients picked each site are all plausible and none is asked for.
*Recommended default:* show `build`, `checkedOn`, and publish state; defer analytics.

---

## 7. Deliverable

Follow this repo's spec system (`docs/websites/specs/README.md`), as Phase 10 of the PORT epic.

1. **A short UX scope** (Vesper) for the admin surface only — the list, the editor, the states, and the empty state. The client-facing taste step's design is settled and this must not redesign it.
2. **An architecture pass** (Mason) recorded as new `M-PORT-*` entries: the table, the scoping relationship, the identity column, the storage decision, the caching decision, and what happens to `content/intake-examples/*`.
3. **Tickets** (Reeve) in `docs/websites/specs/`, numbered from PORT-28, each in the house format with observable acceptance criteria, sequenced so the questionnaire is never broken between them.
4. **The migration SQL, reviewed but not applied** — Taylor runs it.

Expect roughly: a schema slice, a service-and-rewire slice that swaps the six modules for the table behind the existing `examplesFor` seam, an admin CRUD slice, and a capture-pipeline slice. Confirm that shape against your own dependency graph rather than taking it from here.

**Verification the tickets must require:** `npx tsc --noEmit`, `yarn lint`, `yarn build:agent`, `yarn verify:tracks` (its content rules move from the TS files to the rows and must keep failing loudly on a bad one), and a browser pass proving the absent state still renders when nothing is published.

---

## 8. Two things the last thread would tell you

- **`yarn verify:tracks` is the cheapest oracle in this repo.** It runs with no database and no network, and it already asserts the taste contract, the legacy pick derivation, and the durable document's byte-for-byte stability. Extend it rather than writing something new.
- **The step's own verification needs a client token, and `INTAKE_LINK_KEY` may be unset on a developer machine.** When it is, the surface cannot be driven end to end and the honest move is to say which criteria that leaves unexercised rather than quietly narrowing them.
