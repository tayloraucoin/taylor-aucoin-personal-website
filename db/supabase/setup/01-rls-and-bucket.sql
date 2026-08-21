-- Intake platform setup. Run once, after the first migration, against the
-- intended database. Idempotent: safe to re-run.
--
-- Every table here is deny-all. There are no policies and there will be none
-- while the browser holds no Supabase key: all access is server-side Drizzle
-- over the direct connection, guarded by `requireEngagement` (M-INT-8). RLS is
-- the belt against a future PostgREST or anon-key surface reaching this data,
-- not the working path. The revokes are the braces: with no table privileges,
-- an anon client cannot even probe for existence.
--
-- If a feature ever hands a browser a Supabase key, that is the day policies
-- get authored — not before, and not by an agent in passing.
--
-- The role and storage guards let this file also run against a plain local
-- Postgres, which is how the schema gets verified without a hosted project.
-- On Supabase every guard passes and the file behaves as written.

alter table public.engagements enable row level security;
alter table public.intake_files enable row level security;
alter table public.email_events enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.engagements from anon, authenticated;
    revoke all on public.intake_files from anon, authenticated;
    revoke all on public.email_events from anon, authenticated;
  else
    raise notice 'anon/authenticated roles absent — skipping revokes (not a Supabase database)';
  end if;
end
$$;

-- Private bucket for logos, photos, and voice notes. Objects are only ever
-- handed out as short-lived signed URLs minted server-side (INT-6, INT-7).
-- `public = false` is re-asserted on conflict so a dashboard click cannot
-- quietly flip it and survive the next setup run.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values ('intake', 'intake', false)
    on conflict (id) do update set public = false;
  else
    raise notice 'storage.buckets absent — skipping bucket creation (not a Supabase database)';
  end if;
end
$$;
