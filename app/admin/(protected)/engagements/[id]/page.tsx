import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EngagementState,
  MoneyTable,
} from "@/app/admin/_components/engagement-state";
import { ReminderSwitch } from "@/app/admin/_components/reminder-switch";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import { findEngagementById } from "@/server/services/engagement";
import { loadEngagementAdminDetail } from "@/server/services/engagement-admin";
import { renderIntakeMarkdown } from "@/server/services/output";
import { linkUploads } from "@/server/services/submission";

export const dynamic = "force-dynamic";

/** Signed links in the rendered document. A fortnight, matching the CLI. */
const LINK_TTL_SECONDS = 14 * 24 * 60 * 60;

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const detail = await loadEngagementAdminDetail(id);
  if (!detail) notFound();

  const { summary } = detail;

  // The document is generated on view rather than stored: the answers move
  // while a client works, and a cached copy would be a second, stale home for
  // what they said. Signed file links expire, which is the other reason it
  // cannot be kept.
  let markdown: string | null = null;
  try {
    const engagement = await findEngagementById(id);
    markdown = renderIntakeMarkdown({
      engagement,
      files: await linkUploads(id, LINK_TTL_SECONDS),
      generatedAt: new Date(),
    });
  } catch {
    // A document that will not render must not take the page with it — the
    // money and the reminder switch are the reasons to be here.
    markdown = null;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href={adminRoutes.engagements}
          className="w-fit text-sm text-(--color-dim) underline"
        >
          All engagements
        </Link>

        <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
          {summary.businessName}
        </h1>

        <p className="text-sm text-(--color-body)">
          {summary.contactName} · {summary.contactEmail}
          {detail.contactPhone ? ` · ${detail.contactPhone}` : ""}
        </p>

        {summary.leadId ? (
          <Link
            href={adminRoutes.lead(summary.leadId)}
            className="w-fit text-sm text-(--color-dim) underline"
          >
            Call history for this lead
          </Link>
        ) : (
          <p className="text-xs text-(--color-dim)">
            Not linked to a lead — they may have found the public form
            themselves.
          </p>
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-(--color-ink)">Where they are</h2>
        <EngagementState summary={summary} />
        {detail.projectSummary ? (
          <p className="mt-1 border-l-2 border-(--color-line-soft) pl-3 text-sm text-(--color-body)">
            {detail.projectSummary}
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-(--color-ink)">Money</h2>
        <MoneyTable {...detail.money} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-(--color-ink)">Reminders</h2>
        <ReminderSwitch
          engagementId={summary.id}
          disabled={summary.remindersDisabled}
          sent={detail.remindersSent}
          remaining={detail.remindersRemaining}
          history={detail.reminders}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-(--color-ink)">Their answers</h2>
        {markdown ? (
          <pre className="overflow-x-auto rounded-(--radius) border border-(--color-line-soft) bg-(--color-well) p-4 font-(family-name:--font-mono) text-xs leading-relaxed whitespace-pre-wrap text-(--color-body)">
            {markdown}
          </pre>
        ) : (
          <p className="text-sm text-(--color-dim)">
            The document couldn&rsquo;t be generated right now. Their answers
            are safe — try again, or run{" "}
            <code className="font-(family-name:--font-mono) text-xs">
              yarn intake:render {summary.id}
            </code>
            .
          </p>
        )}
      </section>
    </div>
  );
}
