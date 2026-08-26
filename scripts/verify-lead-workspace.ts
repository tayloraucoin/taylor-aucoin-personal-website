/**
 * Runtime verification for the leads workspace (CRM-18).
 *
 * `/admin/leads` is behind `requireAdmin`, and the risky part of the slice is
 * hand-written SQL — correlated subqueries, a jsonb containment test, and a
 * negated `exists` — none of which the type-checker or the build can see. This
 * exercises every one of them against real data and checks the two invariants
 * that span surfaces: that the scoreboard's defect count equals what its link
 * lands on (CRM-18 AC#4), and that `to_call` plus the worked stages equals the
 * whole table (M-CRM-10).
 *
 * Read-only — every statement here is a SELECT.
 *
 *   yarn crm:verify-leads
 */
import { LEAD_PRESETS } from "@/lib/crm/constants";
import { parseLeadFilters } from "@/lib/validators/crm";
import { loadLeadFacets, loadLeadWorkspace } from "@/server/services/lead-workspace";
import { loadScoreboard } from "@/server/services/scoreboard";

const now = new Date();

async function run(label: string, params: Record<string, string>) {
  const filters = parseLeadFilters(params);
  const result = await loadLeadWorkspace(filters, now);
  const stages = [...new Set(result.rows.map((r) => r.stage))].join(", ") || "—";
  console.log(
    `${label.padEnd(34)} total=${String(result.total).padStart(5)}  rows=${String(result.rows.length).padStart(3)}  stages=[${stages}]`,
  );
  return result;
}

async function main() {
  const facets = await loadLeadFacets();
  console.log(`facets: ${facets.niches.length} niches, ${facets.cities.length} cities\n`);

  const all = await run("unfiltered", {});
  await run("q=plumbing", { q: "plumbing" });
  await run("sort=lastTouch", { sort: "lastTouch" });
  await run("sort=nextAction", { sort: "nextAction" });
  await run("sort=name", { sort: "name" });
  await run("nextAction=overdue", { nextAction: "overdue" });
  await run("nextAction=none", { nextAction: "none" });
  await run("nextAction=week", { nextAction: "week" });
  await run("lastTouch=never", { lastTouch: "never" });
  await run("lastTouch=over30", { lastTouch: "over30" });
  await run("lastTouch=7to30", { lastTouch: "7to30" });
  await run("stages=to_call", { stages: "to_call" });
  await run("stages=trying", { stages: "trying" });
  await run("stages=to_call,trying", { stages: "to_call,trying" });
  await run("stages=client", { stages: "client" });
  await run("stages=do_not_call", { stages: "do_not_call" });
  await run("walkIn", { walkIn: "1" });
  await run("hasEmail", { hasEmail: "1" });
  await run("hasEngagement", { hasEngagement: "1" });
  await run("thread=audit", { thread: "audit" });
  await run("websiteBucket=none", { websiteBucket: "none" });
  await run("garbage params ignored", { nextAction: "banana", stages: "nope,trying", sort: "xyz" });

  console.log("");
  for (const preset of LEAD_PRESETS) {
    await run(`preset=${preset.token}`, { preset: preset.token });
  }

  // --- The acceptance criterion that spans two surfaces ---------------------
  const board = await loadScoreboard(now);
  const defect = await loadLeadWorkspace(parseLeadFilters({ preset: "no_next_action" }), now);
  console.log(
    `\nAC#4 scoreboard=${board.health.workedWithoutNextAction} preset=${defect.total} ` +
      (board.health.workedWithoutNextAction === defect.total ? "MATCH" : "MISMATCH"),
  );

  // --- to_call by subtraction (M-CRM-10) ------------------------------------
  const toCall = await loadLeadWorkspace(parseLeadFilters({ stages: "to_call" }), now);
  const worked = await loadLeadWorkspace(
    parseLeadFilters({
      stages: "trying,in_conversation,info_sent,intake_sent,client,not_now,not_interested,do_not_call,bad_lead",
    }),
    now,
  );
  console.log(
    `M-CRM-10 to_call=${toCall.total} + worked=${worked.total} = ${toCall.total + worked.total} vs all=${all.allLeads} ` +
      (toCall.total + worked.total === all.allLeads ? "MATCH" : "MISMATCH"),
  );

  process.exit(0);
}

main();
