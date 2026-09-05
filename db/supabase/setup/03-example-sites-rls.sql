-- Taste example sites setup. Run once, after migration 0012, against the
-- intended database. Idempotent: safe to re-run.
--
-- Same posture as `01-rls-and-bucket.sql` and `02-crm-rls.sql`, for the same
-- reason: deny-all with no policies. The browser never holds a Supabase key —
-- the admin session is established server-side, all writes are Drizzle over the
-- direct connection guarded by `requireAdmin`, and the client-facing read is a
-- server component calling `loadExampleSet`. RLS is the belt against a future
-- PostgREST or anon-key surface reaching these tables; the revokes are the
-- braces, so an anon client cannot even probe for existence.
--
-- Nothing in these tables is a client's own data. What they hold instead is
-- Taylor's unpublished curation — drafts, the `build` level a favourite would
-- cost to reach, and the per-pack switch that decides what anyone sees. A draft
-- reaching a client is the failure this guards, and it is the same failure
-- D-PORT-12 exists to prevent, so the enforcement belongs at the database
-- rather than in an application promise.
--
-- The role guard lets this file also run against a plain local Postgres, which
-- is how the schema gets verified without a hosted project.
--
-- The bucket is created here, the way `01` creates `intake` — idempotently,
-- re-asserting its flag on conflict so a dashboard click cannot quietly change
-- it and survive the next setup run.
--
-- This was originally left out on the assumption the bucket already existed and
-- was Taylor's to own. It did exist in production and did **not** exist in
-- staging, which is where a developer machine points — so the first seed run
-- failed with "Bucket not found" against an empty project. A bucket the code
-- depends on belongs in the setup file for the same reason `intake` does:
-- every tier gets it from one command, not from remembering.
--
-- ⚠️ **The id is case-sensitive and must match `CAPTURE_BUCKET` in
-- `lib/intake/example-media.ts`.** If production already holds a bucket named
-- `PUBLIC` rather than `public`, change both together — running this as written
-- against that project would create a second, empty bucket beside it.

alter table public.example_sites enable row level security;
alter table public.example_site_packs enable row level security;
alter table public.example_captures enable row level security;
alter table public.example_packs enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.example_sites from anon, authenticated;
    revoke all on public.example_site_packs from anon, authenticated;
    revoke all on public.example_captures from anon, authenticated;
    revoke all on public.example_packs from anon, authenticated;
  else
    raise notice 'anon/authenticated roles absent — skipping revokes (not a Supabase database)';
  end if;
end
$$;

-- Public because these are screenshots of public websites, shown to every
-- client who reaches the taste step, and there is nothing private in one.
-- Signed URLs would expire under a gallery of twenty-four images. A client's
-- own uploads keep going to the private `intake` bucket that `01` creates, and
-- the two promises stay separate.
--
-- Captures are written under `sites/examples/<slug>/`. Nothing needs to create
-- those prefixes: Supabase storage has no directories — a path is one flat key
-- and the dashboard's folders are the console splitting keys on slashes.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'public', 'public', true, 52428800,
      array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
    )
    on conflict (id) do update set
      public             = true,
      file_size_limit    = 52428800,
      allowed_mime_types = excluded.allowed_mime_types;
  else
    raise notice 'storage.buckets absent — skipping bucket creation (not a Supabase database)';
  end if;
end
$$;
