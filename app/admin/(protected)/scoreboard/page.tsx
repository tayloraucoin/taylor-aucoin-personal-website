import Link from "next/link";
import { MIN_N_FOR_RATE } from "@/lib/crm/constants";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import {
  loadScoreboard,
  type Funnel,
  type Rate,
  type TimingRow,
} from "@/server/services/scoreboard";

export const dynamic = "force-dynamic";

const pct = (value: number) => `${Math.round(value * 100)}%`;

const STAGES: { key: keyof Funnel; label: string }[] = [
  { key: "dials", label: "Dials" },
  { key: "conversations", label: "Conversations" },
  { key: "infoSent", label: "Info sent" },
  { key: "intakeSent", label: "Intake sent" },
  { key: "deposits", label: "Deposits paid" },
  { key: "complete", label: "Questionnaires done" },
];

export default async function ScoreboardPage() {
  await requireAdmin();
  const board = await loadScoreboard();

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
          Scoreboard
        </h1>
        <p className="text-sm text-(--color-body)">
          Counts always. Rates only once there are {MIN_N_FOR_RATE} of something
          — below that a percentage is a story, not a measurement.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm text-(--color-ink)">The funnel</h2>

        <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 gap-y-1.5">
          <span className="text-xs text-(--color-dim)" />
          <span className="text-right text-xs text-(--color-dim)">
            Last 7 days
          </span>
          <span className="text-right text-xs text-(--color-dim)">
            All time
          </span>

          {STAGES.map((stage) => (
            <FunnelRow
              key={stage.key}
              label={stage.label}
              week={board.lastSevenDays[stage.key]}
              all={board.allTime[stage.key]}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm text-(--color-ink)">Stage to stage, all time</h2>
        <ul className="flex flex-col gap-1.5">
          {board.rates.map((entry) => (
            <RateRow key={entry.label} rate={entry} />
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm text-(--color-ink)">Pipeline health</h2>

        <p className="text-sm text-(--color-body)">
          <strong
            className={
              board.health.workedWithoutNextAction > 0
                ? "text-(--color-c2)"
                : "text-(--color-ink)"
            }
          >
            {board.health.workedWithoutNextAction}
          </strong>{" "}
          worked leads with no next action
          {board.health.workedWithoutNextAction === 0 ? (
            " — as it should be"
          ) : (
            <>
              {" — these are the ones that go quiet and get lost."}{" "}
              <Link
                href={`${adminRoutes.leads}?preset=no_next_action`}
                className="underline"
              >
                See them.
              </Link>
            </>
          )}
        </p>

        <p className="text-sm text-(--color-body)">
          <strong className="text-(--color-ink)">
            {board.health.overdueCallbacks}
          </strong>{" "}
          callbacks past their date.{" "}
          <Link href={adminRoutes.queue} className="underline">
            They lead the queue.
          </Link>
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm text-(--color-ink)">
            Is the call-window model right?
          </h2>
          <p className="text-sm text-(--color-body)">
            The windows are reasoned from how these trades structure a day, not
            measured. This is where your own dials get to disagree. If
            &ldquo;best&rdquo; stops beating &ldquo;avoid&rdquo; once the
            numbers are real, the model is wrong and{" "}
            <code className="font-(family-name:--font-mono) text-xs">
              lib/crm/call-windows.ts
            </code>{" "}
            is the one file to edit.
          </p>
        </div>

        {board.timing.totalAttempts === 0 ? (
          <p className="text-sm text-(--color-dim)">
            No dials logged yet. This fills in as you work the queue.
          </p>
        ) : (
          <>
            <TimingTable title="By window" rows={board.timing.byTier} />
            <TimingTable title="By trade" rows={board.timing.byProfile} />
            <TimingTable title="By day" rows={board.timing.byWeekday} />
          </>
        )}
      </section>
    </div>
  );
}

function FunnelRow({
  label,
  week,
  all,
}: {
  label: string;
  week: number;
  all: number;
}) {
  return (
    <>
      <span className="text-sm text-(--color-body)">{label}</span>
      <span className="text-right text-sm text-(--color-ink)">{week}</span>
      <span className="text-right text-sm text-(--color-dim)">{all}</span>
    </>
  );
}

function RateRow({ rate }: { rate: Rate }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-3 text-sm">
      <span className="text-(--color-body)">{rate.label}</span>
      <span className="ml-auto text-(--color-dim)">
        {rate.numerator} of {rate.denominator}
      </span>
      <span className="w-28 text-right">
        {rate.value === null ? (
          // Never a 0% here: too little evidence is a different fact from a
          // bad result, and rendering it as a number invites planning on it.
          <span className="text-xs text-(--color-dim)">not enough yet</span>
        ) : (
          <span className="text-(--color-ink)">{pct(rate.value)}</span>
        )}
      </span>
    </li>
  );
}

function TimingTable({ title, rows }: { title: string; rows: TimingRow[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-xs text-(--color-dim)">{title}</h3>
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex flex-wrap items-baseline gap-x-3 text-sm"
          >
            <span className="w-24 text-(--color-body)">{row.label}</span>
            <span className="text-xs text-(--color-dim)">
              {row.conversations} reached of {row.dials} dialled
            </span>
            <span className="ml-auto w-28 text-right">
              {row.reachRate === null ? (
                <span className="text-xs text-(--color-dim)">
                  not enough yet
                </span>
              ) : (
                <span className="text-(--color-ink)">{pct(row.reachRate)}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
