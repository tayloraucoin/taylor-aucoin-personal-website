import { SyncForm } from "@/app/admin/_components/sync-form";
import { requireAdmin } from "@/server/services/admin-auth";
import { loadRecentSyncs } from "@/server/services/leads";

export const dynamic = "force-dynamic";

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminSyncPage() {
  await requireAdmin();
  const history = await loadRecentSyncs();

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
          Sync leads
        </h1>
        <p className="text-sm text-(--color-body)">
          Imports match on Google&rsquo;s place id, so running this twice
          updates rather than duplicates.
        </p>
      </header>

      <SyncForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm text-(--color-ink)">Recent imports</h2>

        {history.length === 0 ? (
          <p className="text-sm text-(--color-dim)">
            Nothing imported yet. Run{" "}
            <code className="font-(family-name:--font-mono) text-xs">
              yarn leadgen export --crm
            </code>{" "}
            and upload the file it writes.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((run) => (
              <li key={run.id} className="text-sm text-(--color-body)">
                <span className="text-(--color-dim)">
                  {WHEN.format(run.createdAt)}
                </span>{" "}
                — {run.newCount} new, {run.updatedCount} refreshed,{" "}
                {run.unchangedCount} unchanged{" "}
                <span className="font-(family-name:--font-mono) text-xs text-(--color-dim)">
                  {run.fileName}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
