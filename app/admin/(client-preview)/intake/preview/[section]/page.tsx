import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionUnavailable } from "@/app/admin/(protected)/intake/questions/_components/flow-sections";
import { previewEngagement } from "@/app/admin/(protected)/intake/questions/_components/preview-engagement";
import { StepBody } from "@/app/admin/(protected)/intake/questions/_components/question-stack";
import { ShowcaseDone } from "@/app/websites/coded/intake/_components/showcase-done";
import { ShowcasePayGate } from "@/app/websites/coded/intake/_components/showcase-pay-gate";
import { ShowcaseStartForm } from "@/app/websites/coded/intake/_components/showcase-start-form";
import { ShowcaseWelcome } from "@/app/websites/coded/intake/_components/showcase-welcome";
import { DepositGate } from "@/app/websites/intake/_components/deposit-gate";
import { StartForm } from "@/app/websites/intake/_components/start-form";
import { StepShell } from "@/app/websites/intake/_components/step-shell";
import { Welcome } from "@/app/websites/intake/_components/welcome";
import { PreviewModeProvider } from "@/components/intake/preview-mode";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import { flavourForKind, showcaseKinds, stepsFor } from "@/lib/intake/tracks";
import { adminRoutes } from "@/lib/routes";
import type { IntakeTrackKey } from "@/lib/types/intake";
import { getCheckoutCatalogue } from "@/server/services/deposit";
import { loadExampleSet } from "@/server/services/example-sites";
import { findSellableProductByKey } from "@/server/services/products";

/**
 * One section of the intake, alone, as a client meets it.
 *
 * The review page at `/admin/intake/questions` stacks all thirteen screens
 * inside the admin shell so the flow can be read end to end. This is the other
 * question: not "is the wording right" but "is this a good screen to be
 * handed". Those want different surfaces, and the second one cannot be judged
 * next to a rail, a band eyebrow, and a Hide toggle.
 *
 * Everything real about the client's rendering is preserved — the intake
 * column, the components themselves, the pack the rail chose. Everything about
 * the admin is gone.
 *
 * **Still a preview, and still writes nothing.** `PreviewModeProvider` is
 * mounted here for the same reason the review page mounts it, and every write
 * path beneath refuses exactly as it does there. The one line of chrome at the
 * top says so: someone testing a form must never have to work out which mode
 * they are in, and that is worth more than the last few percent of immersion.
 */
export default async function IntakeSectionPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ track?: string; kind?: string; pack?: string }>;
}) {
  const { section } = await params;
  const query = await searchParams;

  // Same fallbacks as the review page (ADM-2): a typo lands on the ordinary
  // view rather than an error page.
  const track: IntakeTrackKey =
    query.track === "showcase" ? "showcase" : "durable";
  const kind: ShowcaseKind =
    (showcaseKinds().find((entry) => entry.key === query.kind)
      ?.key as ShowcaseKind) ?? "portfolio";
  const film = query.pack === "film";
  const flavour = flavourForKind(kind, film ? ["film"] : undefined);

  const engagement = previewEngagement(track, {
    kind,
    disciplines: film ? ["film"] : undefined,
  });

  // The same three values this URL already carries, rebuilt for the links this
  // page renders: a step walked to from here stays on the view it was opened in.
  const previewQuery = searchFor(track, kind, film);

  return (
    <>
      <PreviewChrome
        track={track}
        kind={kind}
        film={film}
        backHref={backToReview(track, kind, film)}
      />

      <PreviewModeProvider render="interface" scope="one">
        {await sectionBody({
          section,
          track,
          kind,
          flavour,
          engagement,
          query: previewQuery,
        })}
      </PreviewModeProvider>
    </>
  );
}

/** The track, kind, and pack, as this route's own query string. */
function searchFor(
  track: IntakeTrackKey,
  kind: ShowcaseKind,
  film: boolean,
): string {
  const search = new URLSearchParams({ track });
  if (track === "showcase") {
    search.set("kind", kind);
    if (film) search.set("pack", "film");
  }
  return search.toString();
}

/** The review page, on the view this preview was opened from. */
function backToReview(
  track: IntakeTrackKey,
  kind: ShowcaseKind,
  film: boolean,
): string {
  return `${adminRoutes.intakeQuestions}?${searchFor(track, kind, film)}`;
}

async function sectionBody({
  section,
  track,
  kind,
  flavour,
  engagement,
  query,
}: {
  section: string;
  track: IntakeTrackKey;
  kind: ShowcaseKind;
  flavour: ReturnType<typeof flavourForKind>;
  engagement: ReturnType<typeof previewEngagement>;
  /** The track/kind/pack this preview is showing, for its own step links. */
  query: string;
}) {
  if (section === "start") {
    return track === "showcase" ? <ShowcaseStartForm /> : <StartForm />;
  }

  if (section === "welcome") {
    return track === "showcase" ? (
      <ShowcaseWelcome engagement={engagement} token="" />
    ) : (
      <Welcome engagement={engagement} token="" />
    );
  }

  if (section === "done") {
    // Nothing skipped, for the same reason the review page passes nothing: a
    // preview has no answers, and listing every question as unanswered would
    // show a screen no client meets.
    if (track !== "showcase") notFound();
    return (
      <ShowcaseDone track={track} token="" unanswered={[]} shortfall={null} />
    );
  }

  if (section === "pay") {
    // Real prices, read live, exactly as the review page does — a preview of a
    // money screen that invented a number would be worse than no preview.
    try {
      const { deposit, addons, extraPage } = await getCheckoutCatalogue(
        false,
        track,
        "half",
      );
      const full =
        track === "showcase"
          ? await findSellableProductByKey("showcase_full")
          : null;

      return track === "showcase" ? (
        <ShowcasePayGate
          engagement={engagement}
          token=""
          canceled={false}
          half={deposit}
          full={full}
          addons={addons}
          extraPage={extraPage}
        />
      ) : (
        <DepositGate
          engagement={engagement}
          token=""
          canceled={false}
          deposit={deposit}
          addons={addons}
        />
      );
    } catch (error) {
      return (
        <SectionUnavailable
          reason={
            error instanceof Error
              ? error.message
              : "Unknown catalogue failure."
          }
        />
      );
    }
  }

  // Anything else is a step key, resolved against the registry for this pack so
  // a step that does not exist here 404s rather than rendering the dispatch's
  // "no preview wired" line, which means something different.
  const step = stepsFor(track, flavour).find((entry) => entry.key === section);
  if (!step) notFound();

  const gallery = await loadExampleSet(flavour);

  /**
   * The client's own shell, not a rebuild of it.
   *
   * The eyebrow, the heading, the intro, the progress hairline, and the sticky
   * Back / Continue bar are most of what a step *is* to the person filling it
   * in — a preview showing only the fields was showing the smaller half and
   * answering a question nobody asked (Taylor, 2026-09-04: "how do customers
   * navigate?").
   *
   * Back and Continue walk this preview rather than a client's flow, so the
   * whole questionnaire can be read end to end the way it is met. Finish lands
   * on the done section, which is where a client lands too.
   *
   * No `saveSlot`: the autosave indicator reports a save, and nothing here
   * saves. An indicator claiming otherwise would be the one piece of this
   * screen that lied.
   */
  return (
    <StepShell
      track={track}
      token=""
      step={step}
      flavour={flavour}
      navigate={{
        step: (stepKey) => adminRoutes.intakeSectionPreview(stepKey, query),
        done: adminRoutes.intakeSectionPreview("done", query),
      }}
    >
      <StepBody
        track={track}
        stepKey={step.key}
        flavour={flavour}
        kind={kind}
        gallery={gallery}
      />
    </StepShell>
  );
}

/**
 * The one line of admin left on the page.
 *
 * Deliberately the quietest thing here — mono, dim, one line, above the fold
 * and out of the way. It costs a little immersion and buys the reviewer never
 * mistaking this for the live client form, which is the same trade the review
 * page's orientation banner makes.
 */
function PreviewChrome({
  track,
  kind,
  film,
  backHref,
}: Readonly<{
  track: IntakeTrackKey;
  kind: ShowcaseKind;
  film: boolean;
  backHref: string;
}>) {
  const view =
    track === "showcase" ? `${kind}${film ? " · film" : ""}` : "durable";

  return (
    <div className="mb-10 flex items-center justify-between gap-4 border-b border-(--color-faint) pb-3 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
      <span>Preview · {view} · nothing saves</span>
      <Link
        href={backHref}
        className="transition-colors hover:text-(--color-c2)"
      >
        All sections
      </Link>
    </div>
  );
}
