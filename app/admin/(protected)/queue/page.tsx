import { readFile } from "node:fs/promises";
import path from "node:path";
import { CallQueue } from "@/app/admin/_components/call-queue";
import { LeadDrawer } from "@/app/admin/_components/lead-drawer";
import { SopDialog } from "@/app/admin/_components/sop-dialog";
import { LeadRecord } from "@/app/admin/_components/lead-record";
import { NICHE_PROFILES } from "@/lib/crm/call-windows";
import { requireAdmin } from "@/server/services/admin-auth";
import { loadQueue } from "@/server/services/leads";

export const dynamic = "force-dynamic";

/**
 * The call sheet is content, not code (D-CRM-28, M-CRM-9).
 *
 * Read from disk rather than copied into a string constant so editing the
 * script is editing one markdown file — the document already has a home, and
 * a second copy in TypeScript would drift the first time Taylor revised the
 * objections and not the code. `next.config.ts` names the file in
 * `outputFileTracingIncludes`, without which Vercel's tracer cannot see a
 * path it never imports and would ship a function that cannot find it.
 *
 * Failure degrades rather than throwing: an unreadable sheet returns empty,
 * the column says so plainly, and the call still logs. A script that could
 * take down logging would invert what this surface is for.
 */
async function loadCallSheet(): Promise<string> {
  try {
    return await readFile(
      path.join(process.cwd(), "docs/crm/CALL-SHEET.md"),
      "utf8",
    );
  } catch {
    return "";
  }
}

/**
 * The queue is rendered against a server-computed "now" (D-CRM-17): the window
 * model reads Vancouver's clock, and a browser in another timezone must not be
 * able to change which leads look callable.
 *
 * Nothing ticks. Crossing a window boundary makes the page stale until the next
 * navigation, which is the right trade — a list that re-sorts itself under the
 * cursor mid-call is worse than one that is a few minutes behind.
 */
export default async function AdminQueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const threadParam = one("thread");
  const thread =
    threadParam === "audit" || threadParam === "no_website"
      ? threadParam
      : "no_website";
  const niche = one("niche") ?? "";
  const readyNow = one("ready") === "1";
  const openLeadId = one("lead");
  const shown = Number(one("shown") ?? "");
  const freshLimit = Number.isFinite(shown) && shown > 0 ? shown : undefined;

  const now = new Date();
  const callSheet = await loadCallSheet();
  const bands = await loadQueue(
    { thread, niche: niche || undefined, readyNow, freshLimit },
    now,
  );

  const nowHours = Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Vancouver",
      hourCycle: "h23",
      hour: "2-digit",
    }).format(now),
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
            Call queue
          </h1>
          <SopDialog />
        </div>
        <p className="text-sm text-(--color-body)">
          Overdue callbacks first, then today&rsquo;s, then fresh leads sorted
          by who is reachable right now.
        </p>
      </header>

      <CallQueue
        bands={bands}
        filters={{ thread, niche, readyNow, shown: bands.fresh.length }}
        nowHours={nowHours}
        niches={Object.keys(NICHE_PROFILES).sort()}
        callSheet={callSheet}
      />

      {openLeadId ? (
        <LeadDrawer leadId={openLeadId}>
          <LeadRecord leadId={openLeadId} />
        </LeadDrawer>
      ) : null}
    </div>
  );
}
