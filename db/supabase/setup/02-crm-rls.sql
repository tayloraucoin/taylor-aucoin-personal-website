-- CRM setup. Run once, after migration 0006, against the intended database.
-- Idempotent: safe to re-run.
--
-- Same posture as `01-rls-and-bucket.sql`, for the same reason: deny-all with
-- no policies. The browser never holds a Supabase key — the admin session is
-- established server-side and all data access is Drizzle over the direct
-- connection, guarded by `requireAdmin` (M-CRM-1). RLS is the belt against a
-- future PostgREST or anon-key surface reaching this data; the revokes are the
-- braces, so an anon client cannot even probe for existence.
--
-- These tables hold Taylor's private call notes, a prospect's contact details,
-- and the money each engagement produced. Nothing here is public-sourced once
-- it has been annotated, and the enforcement belongs at the database rather
-- than in an application promise.
--
-- The role guard lets this file also run against a plain local Postgres, which
-- is how the schema gets verified without a hosted project.

alter table public.leads enable row level security;
alter table public.call_attempts enable row level security;
alter table public.lead_emails enable row level security;
alter table public.lead_syncs enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.leads from anon, authenticated;
    revoke all on public.call_attempts from anon, authenticated;
    revoke all on public.lead_emails from anon, authenticated;
    revoke all on public.lead_syncs from anon, authenticated;
  else
    raise notice 'anon/authenticated roles absent — skipping revokes (not a Supabase database)';
  end if;
end
$$;
