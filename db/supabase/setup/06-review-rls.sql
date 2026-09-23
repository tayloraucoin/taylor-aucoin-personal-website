-- Review ingest setup. Run once, after migration 0017, against the intended
-- database. Idempotent: safe to re-run.
--
-- Same posture as the five files before it, for the same reason: deny-all
-- with no policies. Every read and write comes from the server — the ingest
-- route handlers, which admit a sister repo by the shared REVIEW_INGEST_KEY
-- (M-REV-6), and the admin pages. No browser ever holds a Supabase key for
-- these tables, and nothing behind a public key may reach them: they carry a
-- client's candid opinion of a design in progress. RLS is the belt; the
-- revokes are the braces.
--
-- The role guard lets this file also run against a plain local Postgres.

alter table public.review_rounds enable row level security;
alter table public.review_comments enable row level security;
alter table public.review_submissions enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.review_rounds from anon, authenticated;
    revoke all on public.review_comments from anon, authenticated;
    revoke all on public.review_submissions from anon, authenticated;
  else
    raise notice 'anon/authenticated roles absent — skipping revokes (not a Supabase database)';
  end if;
end
$$;
