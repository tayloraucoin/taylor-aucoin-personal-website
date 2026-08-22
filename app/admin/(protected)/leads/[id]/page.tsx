import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadRecord } from "@/app/admin/_components/lead-record";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import { loadLeadDetail } from "@/server/services/leads";

export const dynamic = "force-dynamic";

/**
 * The record at its own URL.
 *
 * The drawer is how it is usually opened; this page is what a pasted link, a
 * bookmark, or a phone in landscape gets. Same component either way.
 */
export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  if (!(await loadLeadDetail(id))) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link
        href={adminRoutes.leads}
        className="w-fit text-sm text-(--color-dim) underline"
      >
        All leads
      </Link>

      <LeadRecord leadId={id} />
    </div>
  );
}
