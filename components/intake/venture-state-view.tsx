import type { ReactNode } from "react";
import { ShowcaseStart } from "@/app/websites/coded/intake/_components/showcase-start";
import { StepAbout } from "@/app/websites/coded/intake/_components/steps/step-about";
import { StepAudience } from "@/app/websites/coded/intake/_components/steps/step-audience";
import { StepSite } from "@/app/websites/coded/intake/_components/steps/step-site";
import { StepWork } from "@/app/websites/coded/intake/_components/steps/step-work";
import type { SaveState } from "@/app/websites/intake/_components/save-indicator";
import { StepShell } from "@/app/websites/intake/_components/step-shell";
import { flavourForKind, stepsFor } from "@/lib/intake/tracks";
import type { AnyIntakeStepKey, ShowcaseStepKey } from "@/lib/types/intake";
import { SaveLineDriver } from "./save-line-driver";
import { venFixture, type VenStateKey } from "./venture-fixtures";

/**
 * One VEN state, drawn as the client meets it: the start form, or its one
 * step inside `StepShell`, seeded from `venture-fixtures.ts`.
 *
 * Rendered inside the harness's `PreviewModeProvider`, so every write path
 * beneath refuses. Each VEN piece adds the steps its states draw.
 */
export function VentureStateView({
  stateKey,
  token,
  save,
  navigate,
}: {
  stateKey: VenStateKey;
  token: string;
  save: SaveState;
  navigate?: { step: (stepKey: AnyIntakeStepKey) => string; done: string };
}): ReactNode {
  const fixture = venFixture(stateKey);

  if (fixture.surface === "start") {
    return <ShowcaseStart inProgress={null} seed={fixture.startSeed} />;
  }

  const about = fixture.answers.about ?? {};
  const disciplines = Array.isArray(about.disciplines)
    ? (about.disciplines as string[])
    : undefined;
  const flavour = flavourForKind(fixture.kind, disciplines);
  const steps = stepsFor("showcase", flavour);
  // One shell per step, top to bottom: a state whose questions span steps
  // (VEN-2) is still drawn as the screens the client meets.
  const drawn = [fixture.surface, ...(fixture.alsoSteps ?? [])];

  return (
    <>
      {drawn.map((stepKey) => (
        <StepShell
          key={stepKey}
          track="showcase"
          token={token}
          step={steps.find((entry) => entry.key === stepKey)!}
          flavour={flavour}
          navigate={navigate}
          saveSlot={<SaveLineDriver initial={save} />}
        >
          {body(stepKey, fixture.answers[stepKey] ?? {})}
        </StepShell>
      ))}
    </>
  );

  function body(
    stepKey: ShowcaseStepKey,
    answers: Record<string, unknown>,
  ): ReactNode {
    switch (stepKey) {
      case "about":
        return (
          <StepAbout
            token={token}
            initial={answers}
            initialKind={fixture.kind}
            initialPicking={fixture.picking}
            prefill={{
              contactName: "Sam Fixture",
              contactEmail: "sam@fixture.invalid",
              contactPhone: null,
            }}
            headshots={[]}
          />
        );
      case "audience":
        return (
          <StepAudience
            token={token}
            initial={answers}
            flavour={flavour}
            ventureType={fixture.ventureType}
          />
        );
      case "work":
        return (
          <StepWork
            token={token}
            initial={answers}
            flavour={flavour}
            kind={fixture.kind}
            ventureType={fixture.ventureType}
            projectFiles={[]}
            pieceFiles={[]}
          />
        );
      case "site":
        return (
          <StepSite
            token={token}
            initial={answers}
            flavour={flavour}
            kind={fixture.kind}
            ventureType={fixture.ventureType}
          />
        );
      default:
        return (
          <p className="text-meta text-(--color-dim)">
            No VEN fixture drawn for step &ldquo;{stepKey}&rdquo; yet.
          </p>
        );
    }
  }
}
