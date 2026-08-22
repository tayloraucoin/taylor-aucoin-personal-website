import { CALL_WINDOW_PROFILES, formatHour } from "@/lib/crm/call-windows";

/**
 * The shape of the calling day, 7am to 6pm.
 *
 * It answers "when should I run my block" without Taylor holding the model in
 * his head, and it makes the queue's ordering legible rather than magic —
 * seeing that auto shops and field trades want opposite hours explains the
 * sort better than any label on a row could.
 */
const START = 7;
const END = 18;
const SPAN = END - START;

const pct = (value: number) => ((value - START) / SPAN) * 100;

export function DayStrip({ nowHours }: { nowHours: number }) {
  const profiles = Object.entries(CALL_WINDOW_PROFILES);
  const nowVisible = nowHours >= START && nowHours <= END;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        {profiles.map(([key, profile]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-(--color-dim)">
              {profile.label}
            </span>

            <div className="relative h-3 flex-1 rounded-(--radius) bg-white/5">
              {profile.fair.map((range) => (
                <span
                  key={`fair-${range.from}`}
                  className="absolute inset-y-0 rounded-(--radius) bg-white/15"
                  style={{
                    left: `${pct(range.from)}%`,
                    width: `${((range.to - range.from) / SPAN) * 100}%`,
                  }}
                />
              ))}
              {profile.best.map((range) => (
                <span
                  key={`best-${range.from}`}
                  className="absolute inset-y-0 rounded-(--radius) bg-(--color-c2)/70"
                  style={{
                    left: `${pct(range.from)}%`,
                    width: `${((range.to - range.from) / SPAN) * 100}%`,
                  }}
                />
              ))}
              {nowVisible ? (
                <span
                  aria-hidden
                  className="absolute inset-y-[-3px] w-px bg-(--color-ink)"
                  style={{ left: `${pct(nowHours)}%` }}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="flex text-xs text-(--color-dim)">
        <span className="w-24 shrink-0" />
        <span className="flex flex-1 justify-between">
          {[7, 10, 13, 16, 18].map((hour) => (
            <span key={hour}>{formatHour(hour)}</span>
          ))}
        </span>
      </div>
    </div>
  );
}
