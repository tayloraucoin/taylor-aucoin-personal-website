-- Intake feedback setup. Run once, after migration 0014, against the intended
-- database. Idempotent: safe to re-run.
--
-- Same posture as `01-rls-and-bucket.sql`, `02-crm-rls.sql`, and
-- `03-example-sites-rls.sql`, for the same reason: deny-all with no policies.
-- The browser never holds a Supabase key. The write comes from a server action
-- that resolves the engagement from the client's own token, and the read is
-- Taylor's, server-side, behind `requireAdmin`. RLS is the belt against a
-- future PostgREST or anon-key surface reaching this table; the revokes are the
-- braces, so an anon client cannot even probe for existence.
--
-- What this table holds is a client's unguarded opinion of working with us,
-- given at the one moment they have nothing left to gain by being polite. It is
-- theirs, it is candid, and it is exactly the kind of row that must never be
-- readable by anything holding a public key.
--
-- The role guard lets this file also run against a plain local Postgres, which
-- is how the schema gets verified without a hosted project.

alter table public.intake_feedback enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.intake_feedback from anon, authenticated;
  else
    raise notice 'anon/authenticated roles absent — skipping revokes (not a Supabase database)';
  end if;
end
$$;
