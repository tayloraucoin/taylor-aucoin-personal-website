import { StageChip } from "@/app/admin/_components/chips";
import {
  EngagementPanel,
  LinkedEngagement,
} from "@/app/admin/_components/engagement-panel";
import {
  EngagementState,
  MoneyTable,
} from "@/app/admin/_components/engagement-state";
import { LeadContact } from "@/app/admin/_components/lead-contact";
import { LeadSchedule } from "@/app/admin/_components/lead-schedule";
import { LeadTimeline } from "@/app/admin/_components/lead-timeline";
import { loadEngagementAdminDetail } from "@/server/services/engagement-admin";
import {
  defaultProjectSummary,
  loadLeadDetail,
  suggestEngagements,
} from "@/server/services/leads";

/**
 * Everything known about one lead.
 *
 * Rendered by the full page and by the drawer alike, so the two can never
 * drift — a record that shows different things depending on how it was opened
 * is a record nobody trusts.
 *
 * Read-and-convert, not dispose: the call queue owns dispositions because
 * those belong to a call in progress. Scheduling a callback lives here too —
 * same chips as call mode, no dial required. What else lives here is what you
 * need when looking someone up: history, contact details, and the two things
 * that turn a yes into a client.
 */
export async function LeadRecord({ leadId }: { leadId: string }) {
  const detail = await loadLeadDetail(leadId);
  if (!detail) return null;

  const { lead, stage, window, timeline } = detail;

  const engagementDetail = lead.engagementId
    ? await loadEngagementAdminDetail(lead.engagementId)
    : null;
  const suggestions = lead.engagementId ? [] : await suggestEngagements(lead.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
            {lead.businessName}
          </h2>
          <StageChip stage={stage} />
        </div>

        <p className="text-sm text-(--color-body)">
          {lead.niche} · {lead.city}
          {lead.rating !== null ? (
            <>
              {" "}
              · {lead.rating} × {lead.reviews ?? 0} reviews
            </>
          ) : null}
        </p>

        {lead.address ? (
          <p className="text-sm text-(--color-dim)">
            {lead.address}
            {lead.mapsUrl ? (
              <>
                {" · "}
                <a
                  href={lead.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Map
                </a>
              </>
            ) : null}
          </p>
        ) : null}

        <p className="text-xs text-(--color-dim)">
          {window.label}
          {window.avoidNote ? ` — ${window.avoidNote}` : ""}
        </p>

        {window.seasonalNote ? (
          <p className="border-l-2 border-(--color-c2)/40 pl-3 text-xs text-(--color-body)">
            {window.seasonalNote}
          </p>
        ) : null}
      </div>

      <LeadContact
        leadId={lead.id}
        businessName={lead.businessName}
        googlePhone={lead.phone}
        phoneOverride={lead.phoneOverride}
        contactEmail={lead.contactEmail}
      />

      <LeadSchedule
        leadId={lead.id}
        nextActionAt={lead.nextActionAt?.toISOString() ?? null}
        nextActionNote={lead.nextActionNote}
      />

      {lead.notes ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm text-(--color-ink)">Notes</h3>
          <p className="text-sm whitespace-pre-wrap text-(--color-body)">
            {lead.notes}
          </p>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <h3 className="text-sm text-(--color-ink)">Intake &amp; money</h3>

        {engagementDetail ? (
          <LinkedEngagement
            leadId={lead.id}
            engagementId={engagementDetail.summary.id}
          >
            <EngagementState summary={engagementDetail.summary} />
            <MoneyTable {...engagementDetail.money} />
          </LinkedEngagement>
        ) : (
          <EngagementPanel
            leadId={lead.id}
            suggestions={suggestions}
            defaults={{
              contactName: "",
              contactEmail: lead.contactEmail ?? "",
              contactPhone: detail.displayPhone,
              projectSummary: defaultProjectSummary(lead),
            }}
          />
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm text-(--color-ink)">History</h3>
        <LeadTimeline entries={timeline} leadId={lead.id} />
      </section>
    </div>
  );
}
