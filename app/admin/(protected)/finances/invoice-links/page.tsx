import { z } from "zod";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import {
  listExtrasEngagements,
  loadExtrasBuilder,
} from "@/server/services/extras";
import { LinkBuilder } from "./_components/link-builder";

export const dynamic = "force-dynamic";

const field =
  "min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-base text-(--color-ink) outline-none focus-visible:border-(--color-c2)";

/**
 * The add-ons link builder (FIN-8). Pick an engagement (a plain GET, so the
 * engagement page can link straight here), tick a pre-selection, copy the
 * URL. It writes nothing: the link is static, works for as long as their
 * build is settled, and can be pasted anywhere — a client site's final
 * review, an email, a text.
 */
export default async function InvoiceLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ engagement?: string }>;
}) {
  await requireAdmin();

  const { engagement: engagementParam } = await searchParams;
  const engagementId = z.uuid().safeParse(engagementParam).success
    ? engagementParam
    : undefined;

  const [engagements, builder] = await Promise.all([
    listExtrasEngagements(),
    engagementId ? loadExtrasBuilder(engagementId) : null,
  ]);

  return (
    <div className="flex max-w-3xl flex-col">
      <AdminPageHeader
        title="Invoice links"
        description="A link to one client's add-ons page, with anything you tick already selected. It never expires while their build is paid or waived, they can come back to it any time, and nothing is charged until they pay on Stripe."
      />

      <form
        method="get"
        action={adminRoutes.invoiceLinks()}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="flex min-w-[260px] grow flex-col gap-1.5">
          <span className="text-sm text-(--color-body)">Engagement</span>
          <select
            name="engagement"
            defaultValue={engagementId ?? ""}
            className={field}
            required
          >
            <option value="" disabled>
              Choose an engagement…
            </option>
            {engagements.map((e) => (
              <option key={e.id} value={e.id}>
                {e.businessName} — {e.contactEmail}
                {e.track === "durable" ? " (platform)" : ""}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="min-h-[44px] rounded-(--radius) border border-(--color-line) px-4 text-sm text-(--color-ink)"
        >
          Show its lines
        </button>
      </form>

      {engagementId && !builder ? (
        <p className="mt-6 text-sm text-(--color-dim)">
          That engagement&apos;s build isn&apos;t paid or waived yet, so its
          page would say the link isn&apos;t working.
        </p>
      ) : null}

      {builder ? (
        <div className="mt-8">
          <LinkBuilder
            engagementId={builder.engagement.id}
            currency={builder.engagement.currency}
            origin={builder.origin}
            rows={builder.rows}
          />
        </div>
      ) : null}
    </div>
  );
}
