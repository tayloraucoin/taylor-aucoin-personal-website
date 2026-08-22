import Link from "next/link";
import { LeadDrawer } from "@/app/admin/_components/lead-drawer";
import { LeadRecord } from "@/app/admin/_components/lead-record";
import { CLOSED_STATE_LABELS } from "@/lib/crm/constants";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import { countLeads, searchLeads } from "@/server/services/leads";

export const dynamic = "force-dynamic";

/**
 * The lookup surface, deliberately not the call list.
 *
 * Closed and do-not-call leads appear here on purpose: when a business Taylor
 * once marked do-not-call rings him back, this is where he finds out why. The
 * queue is where that exclusion belongs.
 */
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  const rawLead = params.lead;
  const openLeadId = Array.isArray(rawLead) ? rawLead[0] : rawLead;

  const [rows, total] = await Promise.all([searchLeads(query), countLeads()]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
          Leads
        </h1>
        <p className="text-sm text-(--color-body)">
          Everyone, including closed and do-not-call.
        </p>
      </header>

      <form action={adminRoutes.leads} className="flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Business, phone, city, or trade"
          className="min-h-[44px] flex-1 rounded-(--radius) border border-white/15 bg-black/30 px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
        />
        <button
          type="submit"
          className="min-h-[44px] rounded-(--radius) border border-white/20 px-4 text-sm text-(--color-ink)"
        >
          Search
        </button>
      </form>

      <p className="text-xs text-(--color-dim)">
        {query
          ? `${rows.length} matching "${query}"${rows.length === 100 ? " (first 100)" : ""}`
          : `Showing ${rows.length} of ${total} by score`}
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-(--color-dim)">
          Nothing matched. Try a shorter search, or import leads on the Sync
          page.
        </p>
      ) : (
        <ul className="flex flex-col">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`${adminRoutes.leads}?${new URLSearchParams({ ...(query ? { q: query } : {}), lead: row.id })}`}
                scroll={false}
                className="flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-transparent px-3 py-2 hover:border-(--color-c2) hover:bg-white/[0.03]"
              >
                <span className="text-sm text-(--color-ink)">
                  {row.businessName}
                </span>
                <span className="text-xs text-(--color-dim)">
                  {row.niche} · {row.city}
                </span>
                {row.rating !== null ? (
                  <span className="text-xs text-(--color-body)">
                    {row.rating} × {row.reviews ?? 0}
                  </span>
                ) : null}

                <span className="ml-auto flex items-center gap-3">
                  {row.hasEmail ? (
                    <span className="text-xs text-(--color-dim)">email</span>
                  ) : null}
                  {row.closedState ? (
                    <span className="text-xs text-(--color-c2)">
                      {CLOSED_STATE_LABELS[row.closedState]}
                    </span>
                  ) : null}
                  <span className="font-(family-name:--font-mono) text-xs text-(--color-dim)">
                    {row.phone}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {openLeadId ? (
        <LeadDrawer leadId={openLeadId}>
          <LeadRecord leadId={openLeadId} />
        </LeadDrawer>
      ) : null}
    </div>
  );
}
