import Link from "next/link";
import { adminRoutes } from "@/lib/routes";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import { showcaseKinds } from "@/lib/intake/tracks";
import { KindSelect } from "./kind-select";
import type { IntakeTrackKey } from "@/lib/types/intake";
import type { RenderMode } from "@/components/intake/preview-mode";

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

/**
 * Every questionnaire a client can actually meet, as one list.
 *
 * The switch used to offer two copy packs, from when a pack was the only thing
 * that varied. Since PORT-11 the **kind** is what the cartridge branches on:
 * it picks the pack, and it also decides which field groups exist at all — the
 * roster, the stage question, the ask block, the claims cluster, the documents
 * drop, the tools question. A pack switch could not reach any of those, so this
 * screen was reviewing one questionnaire out of seven.
 *
 * Seven and not six: a portfolio is the one kind whose pack still moves with
 * its disciplines, so it appears twice. Every other kind names its own pack.
 *
 * Derived from the kind registry rather than typed out, so a seventh kind
 * cannot be added without appearing here — and the labels are the kind's own
 * client-facing words, unshortened. A reviewer should read the option exactly
 * as the person filling the form reads it.
 */
type PreviewView = { kind: ShowcaseKind; film: boolean; label: string };

const VIEWS: readonly PreviewView[] = showcaseKinds().flatMap(
  (entry): PreviewView[] =>
    entry.key === "portfolio"
      ? [
          { kind: entry.key, film: false, label: entry.label },
          { kind: entry.key, film: true, label: `${entry.label} · film` },
        ]
      : [{ kind: entry.key, film: false, label: entry.label }],
);

/** One stable value per view, since a portfolio appears twice. */
function viewValue(kind: ShowcaseKind, film: boolean): string {
  return film ? `${kind}:film` : kind;
}

/**
 * The two ways to read the same questionnaire.
 *
 * `Interface` is the screen a client meets. `Document` is the same components
 * rendered as prose — a Notion-style read of every question, its component
 * type, and its answer key (ADMIN-UX-SPEC §6.1). Both are the production
 * components; neither transcribes a word.
 */
const MODES: readonly { key: RenderMode; label: string }[] = [
  { key: "interface", label: "Interface" },
  { key: "document", label: "Document" },
];

/**
 * Whether the reviewer is reading the questionnaire as someone who bought the
 * add-ons.
 *
 * A preview owns no basket, so every add-on's questions stayed shut on the
 * interface surface — the one surface where you judge whether a screen is a
 * good thing to be handed. Document mode always showed them, but as prose.
 *
 * "None" first, because a client who bought nothing is the ordinary case and a
 * review surface should open on the ordinary case.
 */
const EXTRAS: readonly { key: boolean; label: string }[] = [
  { key: false, label: "None" },
  { key: true, label: "All bought" },
];

/** The all-kinds overview, last after the seven named views. */
export const EVERY_KIND = "all";


/**
 * Track and copy-pack switches, as links.
 *
 * Links rather than a client control for one reason that matters: the choice
 * ends up in the URL, so a view is linkable and survives a reload — which is
 * what a review surface is for. It also keeps the whole page a Server
 * Component apart from the questionnaire itself.
 *
 * The track switch stays a pair of links — two short options, and links keep
 * the page a Server Component. The kind picker is a select (see `KindSelect`),
 * and renders only on the coded track, which is the only track whose questions
 * flex. Showing a disabled control on the website track would advertise a
 * choice that does not exist there.
 */
export function PreviewControls({
  track,
  kind,
  film,
  mode,
  everyKind,
  allExtras,
}: Readonly<{
  track: IntakeTrackKey;
  kind: ShowcaseKind;
  film: boolean;
  mode: RenderMode;
  everyKind: boolean;
  /** Whether the add-on blocks are being shown. See `EXTRAS`. */
  allExtras: boolean;
}>) {
  /** Keeps the other choices while one of them changes. */
  const href = (next: {
    track?: IntakeTrackKey;
    view?: string;
    mode?: RenderMode;
    extras?: boolean;
  }) => {
    const params = new URLSearchParams();
    const chosenTrack = next.track ?? track;
    params.set("track", chosenTrack);

    if (chosenTrack === "showcase") {
      const view = next.view ?? (everyKind ? EVERY_KIND : viewValue(kind, film));
      const [viewKind, pack] = view.split(":");
      params.set("kind", viewKind!);
      if (pack === "film") params.set("pack", "film");
    }

    const chosenMode = next.mode ?? mode;
    if (chosenMode === "document") params.set("mode", "document");

    // Only the non-default is serialised, so the ordinary view stays the
    // shortest URL — the same rule `mode` follows above.
    if (next.extras ?? allExtras) params.set("extras", "all");

    return `${adminRoutes.intakeQuestions}?${params.toString()}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Switch
        legend="Track"
        options={TRACKS.map((option) => ({
          label: option.label,
          href: href({ track: option.key }),
          current: option.key === track,
        }))}
      />

      {/* Orthogonal to the track and the view: either questionnaire reads
          either way, and all three choices live in the URL together. */}
      <Switch
        legend="Mode"
        options={MODES.map((option) => ({
          label: option.label,
          href: href({ mode: option.key }),
          current: option.key === mode,
        }))}
      />

      {/* Orthogonal to all three above: any questionnaire, in either mode,
          reads either with the add-on blocks open or without them. Shown on
          both tracks because both have questions behind a purchase — the
          durable track's booking and Stripe blocks were as unreachable here as
          the coded track's six. */}
      <Switch
        legend="Add-ons"
        options={EXTRAS.map((option) => ({
          label: option.label,
          href: href({ extras: option.key }),
          current: option.key === allExtras,
        }))}
      />

      {/* A select rather than a switch: seven options with prose labels, and
          the row ran wider than the header. The choice is still a URL. */}
      {track === "showcase" ? (
        <KindSelect
          current={everyKind ? EVERY_KIND : viewValue(kind, film)}
          options={[
            ...VIEWS.map((view) => ({
              value: viewValue(view.kind, view.film),
              label: view.label,
              href: href({ view: viewValue(view.kind, view.film) }),
            })),
            // Last, after the seven: a specific kind is the ordinary read and
            // the overview is what you reach for once you have one.
            {
              value: EVERY_KIND,
              label: "Every kind — the overview",
              href: href({ view: EVERY_KIND }),
            },
          ]}
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
