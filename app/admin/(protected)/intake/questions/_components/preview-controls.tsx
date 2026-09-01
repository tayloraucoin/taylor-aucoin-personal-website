import Link from "next/link";
import { adminRoutes } from "@/lib/routes";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import type { IntakeTrackKey } from "@/lib/types/intake";

/**
 * Both names, because both are load-bearing in an admin tool.
 *
 * "Platform" and "Coded" are the public slugs a client sees; `durable` and
 * `showcase` are the keys stored on the engagement row and read in every log
 * and query. The showcase pair is the one that catches people out — `lib/
 * routes.ts` records why the coded track is keyed `showcase` internally — so
 * the rail shows the pairing rather than making anyone hold it in their head.
 *
 * The client-facing eyebrow in `eyebrowFor` still reads "Website build" and
 * "Portfolio build". That is approved client copy and is deliberately not
 * touched here; a client has no use for the internal key.
 */
const TRACKS: readonly { key: IntakeTrackKey; label: string }[] = [
  { key: "durable", label: "Platform / durable" },
  { key: "showcase", label: "Coded / showcase" },
];

const FLAVOURS: readonly { key: ShowcaseFlavour; label: string }[] = [
  { key: "generic", label: "Generic" },
  { key: "film", label: "Film" },
];

/**
 * Track and copy-pack switches, as links.
 *
 * Links rather than a client control for one reason that matters: the choice
 * ends up in the URL, so a view is linkable and survives a reload — which is
 * what a review surface is for. It also keeps the whole page a Server
 * Component apart from the questionnaire itself.
 *
 * The copy-pack switch renders only on the portfolio track, which is the only
 * track whose copy flexes. Showing a disabled control on the website track
 * would advertise a choice that does not exist there.
 */
export function PreviewControls({
  track,
  flavour,
}: Readonly<{ track: IntakeTrackKey; flavour: ShowcaseFlavour }>) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Switch
        legend="Track"
        options={TRACKS.map((option) => ({
          label: option.label,
          href: `${adminRoutes.intakeQuestions}?track=${option.key}`,
          current: option.key === track,
        }))}
      />

      {track === "showcase" ? (
        <Switch
          legend="Copy pack"
          options={FLAVOURS.map((option) => ({
            label: option.label,
            href: `${adminRoutes.intakeQuestions}?track=showcase&pack=${option.key}`,
            current: option.key === flavour,
          }))}
        />
      ) : null}
    </div>
  );
}

function Switch({
  legend,
  options,
}: Readonly<{
  legend: string;
  options: readonly { label: string; href: string; current: boolean }[];
}>) {
  return (
    <div>
      <p
        id={`switch-${legend}`}
        className="font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
      >
        {legend}
      </p>
      <div
        aria-labelledby={`switch-${legend}`}
        className="mt-1.5 flex items-center gap-1 rounded-(--radius) border border-(--color-faint) p-1"
      >
        {options.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            aria-current={option.current ? "true" : undefined}
            className={`flex min-h-9 items-center rounded-sm px-3 text-sm transition-colors ${
              option.current
                ? "bg-(--color-card-hover) text-(--color-c2)"
                : "text-(--color-body) hover:text-(--color-ink)"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
