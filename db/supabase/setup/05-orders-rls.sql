-- Orders setup. Run once, after migration 0015, against the intended
-- database. Idempotent: safe to re-run.
--
-- Same posture as the four files before it, for the same reason: deny-all
-- with no policies. The ledger is written only by `recordOrder` on the server
-- (webhook, backfill, admin import) and read only behind `requireAdmin`. It
-- holds every client's payment history and, on unlinked invoices, their
-- email address — nothing a public key may ever reach. RLS is the belt; the
-- revokes are the braces.
--
-- The role guard lets this file also run against a plain local Postgres.

alter table public.orders enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.orders from anon, authenticated;
  else
    raise notice 'anon/authenticated roles absent — skipping revokes (not a Supabase database)';
  end if;
end
$$;
