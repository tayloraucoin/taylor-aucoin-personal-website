import { LeadDrawer } from "@/app/admin/_components/lead-drawer";
import { LeadFilterRail } from "@/app/admin/_components/lead-filters";
import { LeadList } from "@/app/admin/_components/lead-list";
import { LeadRecord } from "@/app/admin/_components/lead-record";
import { adminRoutes } from "@/lib/routes";
import { clearedLeadsHref, parseLeadFilters } from "@/lib/validators/crm";
import { requireAdmin } from "@/server/services/admin-auth";
import {
  loadLeadFacets,
  loadLeadWorkspace,
} from "@/server/services/lead-workspace";

export const dynamic = "force-dynamic";

/**
 * The lookup surface, deliberately not the call list.
 *
 * Closed and do-not-call leads appear here on purpose: when a business Taylor
 * once marked do-not-call rings him back, this is where he finds out why. The
 * queue is where that exclusion belongs.
 *
 * Rendered against a server-computed `now` for the same reason the queue is
 * (D-CRM-17): "overdue", "this week", and "touched 11 days ago" all read
 * Vancouver's clock, and a browser in another timezone must not be able to
 * change which leads look neglected.
 */
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const filters = parseLeadFilters(params);

  const rawLead = params.lead;
  const openLeadId = Array.isArray(rawLead) ? rawLead[0] : rawLead;

  const now = new Date();
  const [workspace, facets] = await Promise.all([
    loadLeadWorkspace(filters, now),
    loadLeadFacets(),
  ]);

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
          defaultValue={filters.q}
          placeholder="Business, contact, phone, city, trade, address, or notes"
          className="min-h-[44px] flex-1 rounded-(--radius) border border-white/15 bg-black/30 px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
        />
        <button
          type="submit"
          className="min-h-[44px] rounded-(--radius) border border-white/20 px-4 text-sm text-(--color-ink)"
        >
          Search
        </button>
      </form>

      <LeadFilterRail
        filters={filters}
        niches={facets.niches}
        cities={facets.cities}
      />

      <LeadList
        workspace={workspace}
        filters={filters}
        now={now}
        clearHref={clearedLeadsHref(adminRoutes.leads, filters)}
      />

      {openLeadId ? (
        <LeadDrawer leadId={openLeadId}>
          <LeadRecord leadId={openLeadId} />
        </LeadDrawer>
      ) : null}
    </div>
  );
}
