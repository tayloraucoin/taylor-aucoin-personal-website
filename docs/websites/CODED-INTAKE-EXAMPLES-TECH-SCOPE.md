# Taste example sites as records — architecture pass

Author: Mason. Status: **For Taylor's ratification.** Phase 10 of the PORT epic.
Governing design: [`CODED-INTAKE-EXAMPLES-ADMIN-UX-SCOPE.md`](CODED-INTAKE-EXAMPLES-ADMIN-UX-SCOPE.md) (Vesper, ratified 2026-09-04; D-PORT-21…28 bind).
Decisions recorded as **M-PORT-41…47** in [`specs/TECHNICAL-DECISIONS.md`](specs/TECHNICAL-DECISIONS.md). This document is the reasoning; that log is the citable record.

Placement, boundary, and data law for every ticket on this phase. Where it and the on-disk reality disagree, on-disk reality wins and the divergence is a `DEVIATIONS.md` line.

---

## 1. The finding that shapes everything

Three facts, established by reading the consumers rather than the specs:

1. **Every function that reaches the gallery is synchronous.** `output.ts` exports `collectFlags`, `collectUnconfirmed`, `collectUnanswered`, `tasteShortfall`, and `renderIntakeMarkdown` — all sync. `style-search.ts`'s `keepUsable` and its brief builder are sync helpers. `examplesFor` is a map lookup today, so nothing ever needed to await it.
2. **`renderIntakeMarkdown` is called by `scripts/verify-track-cartridge.ts`** (lines 846, 1040) — the oracle that runs **with no database and no network** and holds the durable document's byte-for-byte guarantee.
3. **`output.ts` reaches the gallery four times in one document render**, plus once per pick through `exampleByKey`.

Make `examplesFor` async and you cascade `await` through a synchronous document renderer, break the no-database oracle, and turn one render into a dozen queries.

**So the gallery is not fetched where it is used. It is loaded once at each entry rail and passed down as data.** The async boundary sits at the rails that already `await`; everything below stays a pure function of what it was handed. That is M-PORT-41, and every other decision here sits inside it.

Two consequences worth naming, because they are gains and not merely survivals:

- **`ExampleSet` does not change.** `{ curated, sites }` is exactly the type the step, the overlay, the document, and the search already consume. The seam moves; the contract does not. That is what keeps this phase off the client-facing surface entirely.
- **`verify:tracks` gets stronger, not weaker.** With the set as a parameter, the script can render the taste document against a synthetic curated set with no database at all — which is precisely what PORT-22's acceptance criterion 5 needed a hand-edited dev-local content file to achieve.

---

## 2. The data model

Four tables, two enums. Column order follows the repo's convention: `id`, `created_at`, then alphabetical, foreign keys last, indexes after, relations below.

### 2.1 Where a closed vocabulary lives — the rule this pass sets

Seven fields carry closed vocabularies: `pack`, `status`, `group`, `ground`, `motion`, `density`, `build`, plus the style-tag list. Making all of them Postgres enums is a defensible instinct and it is the wrong call here, because it would put every taxonomy edit behind a migration for a vocabulary the design owner owns and expects to edit during curation (taste scope §4.3).

**The rule: the database gets an enum for a value it must reason about; a value it only stores and hands back is `text`, owned by the type system.**

- `pack` and `status` appear in `WHERE` clauses, drive the join, and decide visibility. Enums.
- `group`, `ground`, `motion`, `density`, `build`, and the style tags are read, rendered, and never branched on by the database. `text`, validated by Zod against the TS unions in `content/intake-examples/types.ts`, which stay the single source of truth and already fail the build when a value has no words (`taxonomy.ts` is `Record<Union, …>`).

**Cardinality is different from vocabulary, and cardinality goes in the database.** The three-style-tag ceiling never changes when a tag is added, so it is a `CHECK` constraint — the strongest available layer for the one taste rule that is structural.

Cost of being wrong: an invalid taxonomy value could reach a row through a database write that bypasses the service. The read path validates and **drops-and-reports** such a row rather than rendering it, so the worst case is a missing site, never a broken one — the same posture D-PORT-12 already takes. If it ever happens, `CHECK` constraints are one migration.

### 2.2 The DDL, for review

This is the artifact to review. The schema slice generates its migration with `drizzle-kit generate` and **diffs the output against this** — if Drizzle emits something different, that is a finding, not a rubber stamp.

```sql
create type example_pack as enum
  ('film', 'generic', 'practice', 'entity', 'venture', 'service');

create type example_site_status as enum ('draft', 'published', 'archived');

-- One candidate site. Nullable columns are the ones a draft legitimately
-- lacks: the database models the draft, the ExampleSite domain type models the
-- published site, and the publish gate is the transition between them.
create table example_sites (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  build              text,
  checked_on         date,
  density            text,
  embed              boolean not null default false,
  first_published_at timestamptz,
  ground             text,
  motion             text,
  name               text,
  role               text,
  slug               text not null,
  status             example_site_status not null default 'draft',
  style_group        text,
  styles             text[] not null default '{}',
  updated_at         timestamptz not null default now(),
  url                text not null,

  -- PORT-22's three-tag ceiling, at the strongest layer available. A rule
  -- about how many, not about which, so it survives every vocabulary edit.
  constraint example_sites_styles_max_three
    check (coalesce(array_length(styles, 1), 0) <= 3)
);

create unique index example_sites_slug_idx on example_sites (slug);
create index example_sites_status_idx on example_sites (status);

-- Which sets a site may appear in. Many-to-many (D-PORT-22): duplicating a row
-- per pack is how a catalogue rots.
create table example_site_packs (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  pack            example_pack not null,
  example_site_id uuid not null
                    references example_sites(id) on delete cascade
);

create unique index example_site_packs_site_pack_idx
  on example_site_packs (example_site_id, pack);
create index example_site_packs_pack_idx on example_site_packs (pack);

-- Captures. `width` and `height` are NOT NULL, which is PORT-7's dimensions
-- law expressed as a database property rather than a TypeScript promise. This
-- repo has shipped the bug they prevent once.
create table example_captures (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  alt             text not null default '',
  height          integer not null,
  position        integer not null,
  storage_path    text not null,
  width           integer not null,
  example_site_id uuid not null
                    references example_sites(id) on delete cascade
);

create unique index example_captures_site_position_idx
  on example_captures (example_site_id, position);

-- The per-pack switch (D-PORT-21). `pack` is the primary key rather than a
-- uuid: this is a fixed enumeration of at most six rows, not an entity stream.
-- A MISSING ROW MEANS OFF — the table is fail-closed by construction, so a
-- database that was never seeded cannot show a client anything.
create table example_packs (
  pack             example_pack primary key,
  created_at       timestamptz not null default now(),
  shown_to_clients boolean not null default false,
  updated_at       timestamptz not null default now()
);
```

**No `position` on `example_sites` or on the join.** Ordering within a pack is deferred (Vesper §14), and ordering is per-pack, so its shape is not yet obvious — it would belong on `example_site_packs` if it lands. Adding an unused column now is scaffolding an empty seam. Order by `created_at, id` until a ticket says otherwise.

**`style_group`, not `group`.** `group` is a reserved word; Drizzle would quote it and every hand-written query afterwards would have to. The Drizzle field stays `group` (`group: text("style_group")`) so the domain type is unchanged.

**`checked_on` is a `date`, not text.** The `ExampleSite` contract keeps `checkedOn: string`; the service formats `YYYY-MM-DD` on the way out. A real date type makes "unparseable date" impossible at rest rather than merely checked.

**No unique constraint on `url`.** Two rows may legitimately share a host — PORT-22's own note keeps the path for `duranlevinson.com/hello/musicvideo` — so host-uniqueness would be incorrect, and full-URL uniqueness is defeated by a trailing slash. The paste box's duplicate check normalises (lowercase, strip `www.`, strip trailing slash) and **reports**; it does not constrain. The check belongs where it can be helpful rather than where it can only be blunt.

### 2.3 Identity, and the law it protects

`slug` is unique, human-readable, and what `taste.picks[].siteKey` stores. It is **immutable once `first_published_at` is set**, enforced in the service — one function owns status transitions and renames, and the editor renders the field read-only past that point (Vesper §3.3).

A trigger would be the stronger layer and it is ceremony for a single-user admin. The reason it is safe to stop at the service is that **the blast radius is already bounded by shipped behaviour**: a pick whose key no longer resolves prints by its stored key with a marker and is never dropped (D-PORT-11, M-PORT-35). A slug that somehow moved degrades honestly instead of losing an answer. If a second writer ever exists, the trigger is one migration.

---

## 3. RLS and storage

### 3.1 Deny-all, following the existing posture

New file `db/supabase/setup/03-example-sites-rls-and-bucket.sql`, in the shape of `01` and `02`: idempotent, role-guarded so it also runs against plain Postgres, RLS enabled on all four tables, `revoke all` from `anon` and `authenticated`, **no policies**. The browser holds no Supabase key; all access is server-side Drizzle guarded by `requireAdmin`, and the client read path is a server component. RLS is the belt against a future PostgREST surface, the revokes are the braces.

### 3.2 The bucket is created by SQL, not by hand

The same file creates the bucket, following `01`'s pattern of re-asserting the public flag on conflict so a dashboard click cannot quietly flip it and survive the next setup run:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('intake-examples', 'intake-examples', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public             = true,
  file_size_limit    = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];
```

The asymmetry with `01` is deliberate and the file says so: `intake` re-asserts `public = false` because it holds a client's uploads; `intake-examples` re-asserts `public = true` because it holds screenshots of public websites shown to every client, and there is nothing private in one. **Two buckets, two promises, neither able to drift into the other.**

**This changes two things in Vesper's §4.2, both in Taylor's favour:**

- **He does not need to create the folder.** Supabase storage paths are virtual; `sites/<slug>/…` works with no folder object. The dashboard's "create folder" only writes a `.emptyFolderPlaceholder`.
- **He does not need to create the bucket either**, unless he prefers to — running `03` does it, with the size limit and MIME allowlist set declaratively rather than remembered.

`image/avif` leaves the allowlist — see §4.2. Everything else in §4.2 stands, path shape included:

```
sites/<slug>/<n>-<8 hex>.<ext>        sites/matias-boucard/1-3f9a2b71.jpg
```

### 3.3 `next.config.ts`

One `remotePatterns` entry, hostname **derived from `SUPABASE_URL`** rather than hardcoded — the file already runs the tier collapse, so staging and production each get their own host with no branch. Pathname scoped to `/storage/v1/object/public/intake-examples/**`, so the optimizer is not a proxy for the rest of the project's storage.

---

## 4. Captures — the two routes

### 4.1 Both converge on the bucket

Per D-PORT-24. The upload route streams to storage; the image-URL route fetches once and writes the bytes to the same place. Hardening for the fetch, which is the only new outbound path this phase adds:

- **https only**, and `redirect: "error"` — no redirects at all. That kills the redirect-to-internal class outright, and a URL that redirects is one Taylor can paste in its final form.
- A **10 MB cap enforced while streaming**, not after.
- Content-type checked against the allowlist, and the decoded header checked against it too — a `Content-Type` header is a claim.
- A short timeout.

Admin-only behind `requireAdmin`, single user. This is proportionate, not exhaustive; it is written down so the next person knows which threats it does and does not address.

### 4.2 Measuring dimensions without a new dependency

The row cannot exist without real intrinsic pixels (§2.2), so something has to read them.

`sharp` is present in `node_modules` only transitively, through Next — depending on it is a boundary violation that a Next upgrade can break. Making it a direct dependency, like `image-size`, amends `specs/README.md`'s "no new dependency beyond `lucide-react`" and needs Taylor's ratification.

**Decision: parse the header in-house, and drop AVIF from the accepted inputs.** `lib/media/intrinsic-size.ts` — a pure function reading JPEG `SOF`, PNG `IHDR`, and WebP `VP8`/`VP8L`/`VP8X`. Roughly seventy lines against three well-specified formats, and it covers everything the pipeline produces: Playwright shoots JPEG, and PNG and WebP cover anything else.

This is the lower-risk option and not merely the cheaper one — `sharp` ships platform-native binaries into a serverless function, and header parsing has no deployment surface at all. It is also fully exercisable by `verify:tracks`, which has neither network nor database. AVIF's `ispe` box parsing is the one genuinely fiddly case and nothing here produces AVIF; `next/image` still *serves* AVIF, it just stops being an accepted *input*.

Two consumers (the capture service and the verifier) is what puts it in `lib/` rather than beside the service.

**If Taylor would rather have the dependency**, `sharp` pinned exact is the fallback and this reverses in an afternoon.

### 4.3 What happens to `yarn capture:example`

Vesper's answer removed server-side shooting, which raises the question the UX scope did not have to answer: **where does a correctly-shaped 1512 × 982 capture come from?** An upload is only as good as whatever took the screenshot, and the publish gate measures the aspect.

So the CLI stays the shooter and stops being the scribe. It keeps shooting three JPEGs at 1512 × 982 at 2× into a local scratch directory and prints the paths; Taylor uploads them through the admin. `--pack` and the entry-printing go away, along with the framing verdict's comment (the frame check replaces it — D-PORT-26). `playwright` stays a pinned devDependency (M-PORT-40) and no browser ever runs on a server.

---

## 5. Placement

| Path | What | New? |
|---|---|---|
| `db/schema/example-pack.ts` | `examplePackEnum` — its own module because two tables use it, mirroring `intake-track.ts` | new |
| `db/schema/example-sites.ts` | the four tables, `exampleSiteStatusEnum`, indexes, relations | new |
| `db/schema/index.ts` | re-exports + `ExampleSiteRow`, `NewExampleSiteRow`, `ExampleCaptureRow`, `ExampleSitePackRow`, `ExamplePackRow` | edit |
| `db/migrations/0012_*.sql` | generated, diffed against §2.2, **not applied** | new |
| `db/supabase/setup/03-example-sites-rls-and-bucket.sql` | RLS, revokes, bucket | new |
| `server/services/example-sites.ts` | the one home — `loadExampleSet` plus admin CRUD | new |
| `server/services/example-captures.ts` | Supabase Storage I/O, modelled on `submission.ts` | new |
| `lib/media/intrinsic-size.ts` | pure header parse | new |
| `lib/intake/example-site-rules.ts` | the shared content validator (§6) | new |
| `lib/intake/taste-picks.ts` | gains `siteByKey(set, key)`, replacing `exampleByKey` | edit |
| `lib/routes.ts` | `intakeExamples`, `intakeExamplePack`, `intakeExampleSite` | edit |
| `app/admin/_components/admin-nav.ts` | one item | edit |
| `app/admin/(protected)/intake/examples/**` | the three screens + `_actions/` | new |
| `content/intake-examples/types.ts`, `taxonomy.ts` | **unchanged** — the shape and the words stay code | — |
| `content/intake-examples/index.ts` | keeps the type re-exports and gains `EMPTY_EXAMPLE_SET`; `SETS`, `examplesFor`, `exampleByKey` deleted | edit |
| `content/intake-examples/{film,generic,practice,entity,venture,service}.ts` | **deleted** — all six are empty, nothing is lost | delete |
| `server/services/output.ts`, `style-search.ts` | gallery becomes a parameter | edit |
| `scripts/verify-track-cartridge.ts` | content rules move to fixtures over the shared validator | edit |
| `scripts/capture-example-site.ts` | narrows to a shooter | edit |
| `next.config.ts` | one derived `remotePatterns` entry | edit |

**The folder does not move.** `content/intake-examples/` stops holding content and keeps holding the contract and the vocabulary. Renaming it churns roughly fifteen import sites for no behavioural gain; a header note in `index.ts` saying the sites are rows now is the whole fix. An inherited path you would not choose again still beats two paths.

### 5.1 The seam, precisely

```ts
// server/services/example-sites.ts
export async function loadExampleSet(pack: ShowcaseFlavour): Promise<ExampleSet>;

// content/intake-examples/index.ts
export const EMPTY_EXAMPLE_SET: ExampleSet = { curated: false, sites: [] };

// lib/intake/taste-picks.ts
export function siteByKey(set: ExampleSet, key: string): ExampleSite | undefined;
```

`loadExampleSet` returns `curated: true` **only when the pack's switch is on and at least one published site came back**, and returns no sites whenever `curated` is false. So `output.ts`'s existing `gallery.curated && gallery.sites.length > 0` test stays correct without being touched, and the step's absent state is reached by exactly the path it is reached by today.

**The parameter is required, with no default.** A default is how a caller silently gets the absent state and nobody notices the gallery never loaded — which is D-PORT-12's failure mode with a new mechanism. Required means the compiler enumerates every call site once, and durable callers pass `EMPTY_EXAMPLE_SET` explicitly, which reads as a statement ("the durable track has no gallery") rather than as an oversight.

**Do not hand-write the list of functions that change.** Make the parameter required and let `npx tsc --noEmit` produce it.

### 5.2 The four entry rails that load

| Rail | Loads |
|---|---|
| `app/websites/coded/intake/[token]/[step]/page.tsx` | already resolves the set at line ~140 and passes `gallery` down — the pattern the others adopt |
| `app/websites/coded/intake/[token]/done/page.tsx` | for `tasteShortfall` |
| the submission path (`_actions/complete.ts`, `engagements/[id]/page.tsx`, `scripts/render-intake.ts`) | for `renderIntakeMarkdown` |
| `app/admin/(protected)/intake/questions/page.tsx` | loads and passes into `QuestionStack`, which stops importing `examplesFor` |

That last one matters: `QuestionStack` is a server component but renders into a `"use client"` accordion, and `renderStep` is a synchronous switch. Lifting the read to the page keeps it that way and mirrors what the client route already does. D-PORT-27's free preview survives.

---

## 6. `verify:tracks` — the oracle, rebuilt

The script's PORT-16 and PORT-22 sections walk `examplesFor(f)` over six files. With rows and no database, that check has nothing to walk. Rebuilding it rather than deleting it:

- **The content rules become one pure exported validator** — `validateExampleSite(site): string[]`, returning a list of plain reasons: `styles` over three, capture 1 off the 1512:982 aspect (ratio within 1%), `checkedOn` unparseable, a taxonomy value with no words in `taxonomy.ts`, a missing capture dimension.
- **`verify:tracks` exercises the validator against fixtures** — a good site passes; a four-tag site, a wrong-aspect capture, and an unparseable date each fail with a named reason. No database, no network, and it now tests the rule rather than the (empty) content, which is a stronger assertion than the one it replaces.
- **The publish gate calls the same function.** One home for the rules; the gate is the cheap early evaluation and the verifier is the loud backstop, which is a duplication asked for deliberately because they catch different failures — the gate catches Taylor, the verifier catches a row written around him.
- **The PORT-16 "every pack has its own set" assertion is dropped**, having asserted a property of six files that no longer exist. Its replacement is the existing check that the pack union and `taxonomy.ts` cover each other.
- **The durable-document checks gain a case**: render the taste document against a synthetic curated set, with no database, which PORT-22 could only reach by hand-editing a content file.

---

## 7. Caching — there is none, and that is the decision

No `unstable_cache`, no `revalidateTag`, no cache primitive. There is not one in this repo today and this is not the feature that earns the first.

- The admin pages take `export const dynamic = "force-dynamic"` like every other admin page; writes call `revalidatePath`, matching the existing action convention exactly.
- The intake step page is already dynamic by necessity.
- **The N+1 that a cache would have papered over is solved by the seam instead.** `output.ts` reached the gallery four times per render; loading once at the rail makes it one indexed query returning at most twenty-four rows.

Volume is one client at a time. Adding the repo's first cache layer to save one indexed query is novelty spent on plumbing, and every future session pays the tax of understanding it.

---

## 8. One amendment Taylor needs to ratify

`specs/README.md` § Locked scope reads:

> No admin surface, no tRPC, no analytics on any intake path (M-INT-2/-10 inherited).

In context that means the client-facing intake routes carry no admin surface, and `/admin/intake/questions` has existed since ADM-2 without breaching it. But a build thread reading that line against a ticket that creates `/admin/intake/examples` is entitled to stop and ask — which is the correct behaviour and a wasted session.

**Proposed:** *"No admin surface, no tRPC, no analytics on any client-facing intake route (M-INT-2/-10 inherited)."* Locked scope, so the edit is Taylor's.

---

## 9. Slice shape, for Reeve

Sequenced by dependency and blast radius. **The questionnaire works at every point between slices**, which is what decides the order — in particular PORT-29 lands before the files are deleted, so nothing is ever half-swapped.

| # | Slice | Blast radius | Why here |
|---|---|---|---|
| **PORT-28** | Schema, setup SQL, migration generated and reviewed, row types | One-way door (applied migration) — full scrutiny | Nothing reads the tables; lands alone safely. Taylor runs the migration |
| **PORT-29** | The seam: gallery becomes a required parameter; every caller passes `examplesFor(...)` exactly as today | Reversible, wide, zero behaviour change | Makes PORT-30 a one-line swap. Durable byte-for-byte is the acceptance criterion |
| **PORT-30** | `loadExampleSet`; rails call it; the six files and `examplesFor`/`exampleByKey` deleted; `siteByKey` lands; `verify:tracks` rebuilt | Reversible, medium | After this the gallery is DB-backed and empty, which renders the same absent state it renders today |
| **PORT-31** | Admin CRUD — three screens, paste box, editor, publish gate, archive, pack switch | Reversible, contained | No captures yet: a row with no capture cannot publish, which is correct and testable |
| **PORT-32** | Captures — upload, image URL, bucket, `remotePatterns`, `intrinsic-size`, capture strip, frame check; `capture:example` narrows | Reversible; one new outbound path | The slice that unblocks publishing, and the first one that can put a site in front of a client |

Reeve confirms this against his own dependency graph rather than taking it from here. PORT-33 is available if the CLI change wants to leave PORT-32.

**Verification every ticket carries:** `npx tsc --noEmit`, `yarn lint`, `yarn build:agent`, `yarn verify:tracks`, and — from PORT-30 on — a browser pass proving the absent state still renders when nothing is published. `INTAKE_LINK_KEY` may be unset locally, and where it is, the ticket says which criteria that leaves unexercised rather than quietly narrowing them.

**Migrations are append-only, reviewed as SQL, and run by Taylor.** Local resolves to the staging credentials, so a `db:migrate` on a laptop touches staging.

---

## 10. What this pass did not decide

- **Ordering within a pack** — deferred with the column, not designed around (§2.2).
- **A trigger on slug immutability** — service-enforced, with the reason it is safe to stop there (§2.3).
- **Orphaned storage objects** when a capture row is deleted. The service deletes the object in the same operation; a sweep for objects with no row is not built, and at this volume a leaked object costs bytes. Named so it is a known gap rather than an unknown one.
- **`sharp` as a direct dependency** — §4.2's fallback, if Taylor prefers the dependency to the seventy lines.

---

_Mason, 2026-09-04. Ratify §8's amendment and §4.2's dependency call, and this goes to Reeve for PORT-28…32._
