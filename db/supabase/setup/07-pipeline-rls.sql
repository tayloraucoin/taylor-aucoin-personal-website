-- Engagement pipeline setup. Run once, after migration 0020, against the
-- intended database. Idempotent: safe to re-run.
--
-- Same posture as the six files before it: deny-all with no policies. Every
-- read and write comes from the server, behind requireAdmin. The playbook is
-- Taylor's working method, the completions are his notes on a client, and
-- engagement_emails holds exactly what a client was told, with their address.
-- No browser ever holds a Supabase key for these tables. RLS is the belt; the
-- revokes are the braces.
--
-- engagements.pipeline_values needs nothing here: engagements is already
-- deny-all (01-rls-and-bucket.sql).
--
-- The role guard lets this file also run against a plain local Postgres.

alter table public.pipeline_steps enable row level security;
alter table public.engagement_step_completions enable row level security;
alter table public.engagement_emails enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.pipeline_steps from anon, authenticated;
    revoke all on public.engagement_step_completions from anon, authenticated;
    revoke all on public.engagement_emails from anon, authenticated;
  else
    raise notice 'anon/authenticated roles absent — skipping revokes (not a Supabase database)';
  end if;
end
$$;
